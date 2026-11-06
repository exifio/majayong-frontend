/* 세션 — 실제 로그인(access/refresh token)을 우선하고, 개발 빌드에서만 데모 세션을 허용한다. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Role } from '@majayong/types';
import { registerRefreshHandler } from '@/lib/auth-refresh-bridge';
import {
  AuthError,
  completeGoogleOnboarding as completeGoogleOnboardingRequest,
  exchangeGoogleCode as exchangeGoogleCodeRequest,
  loginWithPassword,
  logoutAuthSession,
  registerWithPassword,
  refreshAuthSession,
  storedAuthSession,
  storedRefreshToken,
  storeAuthSession,
  storeRefreshToken,
  type AuthSession,
  type AuthUser,
} from './auth';

export type Session =
  | { status: 'guest' }
  | { status: 'signup' }                        // 가입 진행 중(개발용 데모)
  | { status: 'user'; role: Role; name: string; suspended: boolean };

const KEY = 'mj.dev.session';
const SIGNUP_SESSION_KEY = 'mj.signup.session';
const GOOGLE_ONBOARDING_KEY = 'mj.auth.google-onboarding';
const DEV = import.meta.env.DEV;

export const DEV_SESSIONS: Record<string, Session> = {
  guest: { status: 'guest' },
  signup: { status: 'signup' },
  client: { status: 'user', role: 'CLIENT', name: '정민재', suspended: false },
  supplier: { status: 'user', role: 'SUPPLIER', name: '최준호', suspended: false },
  admin: { status: 'user', role: 'ADMIN', name: '운영자', suspended: false },
  suspended: { status: 'user', role: 'CLIENT', name: '정지된 사용자', suspended: true },
};

function loadInitialDevSession(): Session {
  try {
    const signup = window.sessionStorage.getItem(SIGNUP_SESSION_KEY);
    if (signup === 'signup' || window.sessionStorage.getItem('mj.signup.email')) {
      return DEV_SESSIONS.signup!;
    }
    if (DEV) {
      const raw = window.localStorage.getItem(KEY);
      if (raw && raw in DEV_SESSIONS) return DEV_SESSIONS[raw]!;
    }
  } catch { /* storage unavailable */ }
  return DEV_SESSIONS.guest!;
}

function storedGoogleOnboardingToken(): string | null {
  try {
    return window.sessionStorage.getItem(GOOGLE_ONBOARDING_KEY);
  } catch {
    return null;
  }
}

type AuthState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'signup'; onboardingToken: string }
  | { status: 'authenticated'; user: AuthUser; accessToken: string; expiresAt: number };

type Ctx = {
  session: Session;
  setDevSession: (key: keyof typeof DEV_SESSIONS) => void;
  apiAccessToken: string;
  setApiAccessToken: (token: string) => void;
  authReady: boolean;
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, role: Role, termsVersion: string) => Promise<AuthUser>;
  exchangeGoogleAuthorizationCode: (code: string) => Promise<
    { onboardingRequired: true } | { onboardingRequired: false; role: Role }
  >;
  googleOnboardingToken: string | null;
  completeGoogleSignup: (role: 'CLIENT' | 'SUPPLIER', termsVersion: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ initial, children }: { initial?: Session; children: ReactNode }) {
  const [devSession, setDevSessionState] = useState<Session>(() =>
    initial ?? loadInitialDevSession());
  const [devToken, setDevToken] = useState('');
  const [restored] = useState(() => (initial ? null : storedAuthSession()));
  const [auth, setAuth] = useState<AuthState>(() =>
    initial
      ? { status: 'guest' }
      : restored
        ? { status: 'authenticated', user: restored.user, accessToken: restored.accessToken, expiresAt: restored.expiresAt }
        : { status: 'loading' });
  const [authReady, setAuthReady] = useState(Boolean(initial) || Boolean(restored));
  const refreshing = useRef<Promise<string | null> | null>(null);

  const storeGoogleOnboardingToken = useCallback((token: string | null) => {
    try {
      if (token) window.sessionStorage.setItem(GOOGLE_ONBOARDING_KEY, token);
      else window.sessionStorage.removeItem(GOOGLE_ONBOARDING_KEY);
    } catch { /* storage unavailable */ }
  }, []);

  const applySession = useCallback((session: AuthSession) => {
    storeAuthSession(session);
    setAuth({
      status: 'authenticated',
      user: session.user,
      accessToken: session.accessToken,
      expiresAt: Date.parse(session.accessExpiresAt),
    });
  }, []);

  const refresh = useCallback(async (): Promise<string | null> => {
    if (refreshing.current) return refreshing.current;
    const token = storedRefreshToken();
    if (!token) {
      storeAuthSession(null);
      const onboardingToken = storedGoogleOnboardingToken();
      setAuth(onboardingToken ? { status: 'signup', onboardingToken } : { status: 'guest' });
      return null;
    }
    const request = refreshAuthSession(token)
      .then((session) => {
        applySession(session);
        return session.accessToken;
      })
      .catch(() => {
        // Reused/expired refresh token: clear the session instead of retrying forever.
        storeRefreshToken(null);
        storeAuthSession(null);
        setAuth({ status: 'guest' });
        return null;
      })
      .finally(() => {
        refreshing.current = null;
      });
    refreshing.current = request;
    return request;
  }, [applySession]);

  // Let apiRequest refresh an expired access token and retry once.
  useEffect(() => {
    registerRefreshHandler(refresh);
    return () => registerRefreshHandler(null);
  }, [refresh]);

  useEffect(() => {
    if (initial || restored) return;
    void refresh().finally(() => setAuthReady(true));
  }, [initial, restored, refresh]);

  // Refresh shortly before the access token expires; the backend rotates the refresh token.
  useEffect(() => {
    if (auth.status !== 'authenticated') return;
    const delay = Math.max(5_000, auth.expiresAt - Date.now() - 60_000);
    const timer = window.setTimeout(() => { void refresh(); }, delay);
    return () => window.clearTimeout(timer);
  }, [auth, refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginWithPassword(email, password);
    storeGoogleOnboardingToken(null);
    try { window.sessionStorage.removeItem(SIGNUP_SESSION_KEY); } catch { /* storage unavailable */ }
    applySession(session);
    // A real login always takes precedence over the development demo session.
    setDevSessionState(DEV_SESSIONS.guest!);
    setDevToken('');
    return session.user;
  }, [applySession, storeGoogleOnboardingToken]);
  const register = useCallback(async (
    email: string,
    password: string,
    role: Role,
    termsVersion: string,
  ) => {
    const session = await registerWithPassword(email, password, role, termsVersion);
    storeGoogleOnboardingToken(null);
    try {
      window.sessionStorage.removeItem(SIGNUP_SESSION_KEY);
      window.sessionStorage.removeItem('mj.signup.email');
      window.sessionStorage.removeItem('mj.signup.password');
      window.sessionStorage.removeItem('mj.signup.terms');
      window.sessionStorage.removeItem('mj.signup.role');
    } catch { /* storage unavailable */ }
    applySession(session);
    setDevSessionState(DEV_SESSIONS.guest!);
    setDevToken('');
    return session.user;
  }, [applySession, storeGoogleOnboardingToken]);
  const exchangeGoogleAuthorizationCode = useCallback(async (code: string) => {
    const result = await exchangeGoogleCodeRequest(code);
    try { window.sessionStorage.removeItem(SIGNUP_SESSION_KEY); } catch { /* storage unavailable */ }
    setDevSessionState(DEV_SESSIONS.guest!);
    setDevToken('');
    if ('onboardingToken' in result) {
      storeGoogleOnboardingToken(result.onboardingToken);
      setAuth({ status: 'signup', onboardingToken: result.onboardingToken });
      return { onboardingRequired: true as const };
    }
    storeGoogleOnboardingToken(null);
    applySession(result.session);
    return { onboardingRequired: false as const, role: result.session.user.role };
  }, [applySession, storeGoogleOnboardingToken]);

  const completeGoogleSignup = useCallback(async (role: 'CLIENT' | 'SUPPLIER', termsVersion: string) => {
    if (auth.status !== 'signup') {
      throw new AuthError(401, 'GOOGLE_ONBOARDING_REQUIRED', '구글 가입을 다시 시작해 주세요.');
    }
    const session = await completeGoogleOnboardingRequest(auth.onboardingToken, role, termsVersion);
    storeGoogleOnboardingToken(null);
    try { window.sessionStorage.removeItem(SIGNUP_SESSION_KEY); } catch { /* storage unavailable */ }
    setDevSessionState(DEV_SESSIONS.guest!);
    setDevToken('');
    applySession(session);
    return session.user;
  }, [auth, applySession, storeGoogleOnboardingToken]);

  const logout = useCallback(async () => {
    await logoutAuthSession(storedRefreshToken());
    storeAuthSession(null);
    storeGoogleOnboardingToken(null);
    try { window.sessionStorage.removeItem(SIGNUP_SESSION_KEY); } catch { /* storage unavailable */ }
    setAuth({ status: 'guest' });
    setDevToken('');
    setDevSessionState(DEV_SESSIONS.guest!);
    if (DEV) {
      try { window.localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
    }
  }, [storeGoogleOnboardingToken]);
  const setDevSession = useCallback((key: keyof typeof DEV_SESSIONS) => {
    try {
      if (key === 'signup') {
        window.sessionStorage.setItem(SIGNUP_SESSION_KEY, 'signup');
      } else {
        window.sessionStorage.removeItem(SIGNUP_SESSION_KEY);
      }
      if (DEV) {
        window.localStorage.setItem(KEY, key);
      }
    } catch { /* storage unavailable */ }
    setDevSessionState(DEV_SESSIONS[key]!);
  }, []);

  const session: Session = auth.status === 'authenticated'
    ? { status: 'user', role: auth.user.role, name: auth.user.name?.trim() || auth.user.email, suspended: false }
    : auth.status === 'signup'
      ? { status: 'signup' }
      : devSession.status === 'signup'
        ? { status: 'signup' }
        : DEV
        ? devSession
        : DEV_SESSIONS.guest!;

  const apiAccessToken = auth.status === 'authenticated' ? auth.accessToken : devToken;

  const value = useMemo<Ctx>(() => ({
    session,
    setDevSession,
    apiAccessToken,
    setApiAccessToken: setDevToken,
    authReady,
    authUser: auth.status === 'authenticated' ? auth.user : null,
    googleOnboardingToken: auth.status === 'signup' ? auth.onboardingToken : null,
    login,
    register,
    exchangeGoogleAuthorizationCode,
    completeGoogleSignup,
    logout,
  }), [session, setDevSession, apiAccessToken, authReady, auth, login, register, exchangeGoogleAuthorizationCode, completeGoogleSignup, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('SessionProvider 밖에서 useSession을 썼습니다');
  return ctx;
}

export const ROLE_HOME: Record<Role, string> = { CLIENT: '/c', SUPPLIER: '/s', ADMIN: '/admin' };

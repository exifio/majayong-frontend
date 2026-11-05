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
import {
  loginWithPassword,
  logoutAuthSession,
  refreshAuthSession,
  storedRefreshToken,
  storeRefreshToken,
  type AuthSession,
  type AuthUser,
} from './auth';

export type Session =
  | { status: 'guest' }
  | { status: 'signup' }                        // 가입 진행 중(개발용 데모)
  | { status: 'user'; role: Role; name: string; suspended: boolean };

const KEY = 'mj.dev.session';
const DEV = import.meta.env.DEV;

export const DEV_SESSIONS: Record<string, Session> = {
  guest: { status: 'guest' },
  signup: { status: 'signup' },
  client: { status: 'user', role: 'CLIENT', name: '정민재', suspended: false },
  supplier: { status: 'user', role: 'SUPPLIER', name: '최준호', suspended: false },
  admin: { status: 'user', role: 'ADMIN', name: '운영자', suspended: false },
  suspended: { status: 'user', role: 'CLIENT', name: '정지된 사용자', suspended: true },
};

function loadDevSession(): Session {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw && raw in DEV_SESSIONS) return DEV_SESSIONS[raw]!;
  } catch { /* storage unavailable */ }
  return DEV_SESSIONS.guest!;
}

type AuthState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'authenticated'; user: AuthUser; accessToken: string; expiresAt: number };

type Ctx = {
  session: Session;
  setDevSession: (key: keyof typeof DEV_SESSIONS) => void;
  apiAccessToken: string;
  setApiAccessToken: (token: string) => void;
  authReady: boolean;
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ initial, children }: { initial?: Session; children: ReactNode }) {
  const [devSession, setDevSessionState] = useState<Session>(() =>
    initial ?? (DEV ? loadDevSession() : DEV_SESSIONS.guest!));
  const [devToken, setDevToken] = useState('');
  const [auth, setAuth] = useState<AuthState>(() => (initial ? { status: 'guest' } : { status: 'loading' }));
  const [authReady, setAuthReady] = useState(Boolean(initial));
  const refreshing = useRef<Promise<void> | null>(null);

  const applySession = useCallback((session: AuthSession) => {
    setAuth({
      status: 'authenticated',
      user: session.user,
      accessToken: session.accessToken,
      expiresAt: Date.parse(session.accessExpiresAt),
    });
  }, []);

  const refresh = useCallback(async () => {
    if (refreshing.current) return refreshing.current;
    const token = storedRefreshToken();
    if (!token) {
      setAuth({ status: 'guest' });
      return;
    }
    const request = refreshAuthSession(token)
      .then(applySession)
      .catch(() => {
        storeRefreshToken(null);
        setAuth({ status: 'guest' });
      })
      .finally(() => {
        refreshing.current = null;
      });
    refreshing.current = request;
    return request;
  }, [applySession]);

  useEffect(() => {
    if (initial) return;
    void refresh().finally(() => setAuthReady(true));
  }, [initial, refresh]);

  // Refresh shortly before the access token expires; the backend rotates the refresh token.
  useEffect(() => {
    if (auth.status !== 'authenticated') return;
    const delay = Math.max(5_000, auth.expiresAt - Date.now() - 60_000);
    const timer = window.setTimeout(() => { void refresh(); }, delay);
    return () => window.clearTimeout(timer);
  }, [auth, refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginWithPassword(email, password);
    applySession(session);
    // A real login always takes precedence over the development demo session.
    setDevSessionState(DEV_SESSIONS.guest!);
    setDevToken('');
    return session.user;
  }, [applySession]);

  const logout = useCallback(async () => {
    await logoutAuthSession(storedRefreshToken());
    setAuth({ status: 'guest' });
    setDevToken('');
    if (DEV) {
      setDevSessionState(DEV_SESSIONS.guest!);
      try { window.localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
    }
  }, []);

  const setDevSession = useCallback((key: keyof typeof DEV_SESSIONS) => {
    try { window.localStorage.setItem(KEY, key); } catch { /* storage unavailable */ }
    setDevSessionState(DEV_SESSIONS[key]!);
  }, []);

  const session: Session = auth.status === 'authenticated'
    ? { status: 'user', role: auth.user.role, name: auth.user.name?.trim() || auth.user.email, suspended: false }
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
    login,
    logout,
  }), [session, setDevSession, apiAccessToken, authReady, auth, login, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('SessionProvider 밖에서 useSession을 썼습니다');
  return ctx;
}

export const ROLE_HOME: Record<Role, string> = { CLIENT: '/c', SUPPLIER: '/s', ADMIN: '/admin' };

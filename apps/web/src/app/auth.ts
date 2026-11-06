/* 실제 인증 — 백엔드 계약(access/refresh token body)만 사용한다.
 * access/refresh token 모두 sessionStorage에 둔다(새로고침·페이지 이동 복원).
 * 페이지 이동마다 refresh를 호출하지 않아 rotating refresh token 경합을 피한다.
 * 백엔드가 httpOnly 쿠키를 지원하지 않으므로 XSS 시 token 노출 위험이 남는다. */
import type { Role } from '@majayong/types';
import { API_BASE_PATH } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
}

export class AuthError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

const REFRESH_KEY = 'mj.auth.refresh';
const ACCESS_KEY = 'mj.auth.access';

export interface StoredAuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
}

/** 저장된 access token이 아직 유효하면 페이지 이동 직후 refresh를 생략한다. */
export function storedAuthSession(): StoredAuthSession | null {
  try {
    const raw = window.sessionStorage.getItem(ACCESS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const candidate = parsed as Partial<StoredAuthSession>;
    const user = candidate.user as Partial<AuthUser> | undefined;
    const role = user?.role;
    if (
      typeof candidate.accessToken !== 'string' || !candidate.accessToken ||
      typeof candidate.expiresAt !== 'number' ||
      typeof user?.id !== 'string' || typeof user.email !== 'string' ||
      (role !== 'CLIENT' && role !== 'SUPPLIER' && role !== 'ADMIN')
    ) {
      window.sessionStorage.removeItem(ACCESS_KEY);
      return null;
    }
    // 만료 60초 전부터는 저장값을 쓰지 않고 refresh 경로로 보낸다.
    if (candidate.expiresAt - Date.now() < 60_000) return null;
    const name = typeof user.name === 'string' || user.name === null ? user.name : undefined;
    return {
      user: { id: user.id, email: user.email, role, ...(name === undefined ? {} : { name }) },
      accessToken: candidate.accessToken,
      expiresAt: candidate.expiresAt,
    };
  } catch {
    return null;
  }
}

export function storeAuthSession(session: AuthSession | null): void {
  try {
    if (!session) {
      window.sessionStorage.removeItem(ACCESS_KEY);
      return;
    }
    const value: StoredAuthSession = {
      user: session.user,
      accessToken: session.accessToken,
      expiresAt: Date.parse(session.accessExpiresAt),
    };
    window.sessionStorage.setItem(ACCESS_KEY, JSON.stringify(value));
  } catch { /* storage unavailable */ }
}

export function storedRefreshToken(): string | null {
  try {
    return window.sessionStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function storeRefreshToken(token: string | null): void {
  try {
    if (token) window.sessionStorage.setItem(REFRESH_KEY, token);
    else window.sessionStorage.removeItem(REFRESH_KEY);
  } catch { /* storage unavailable */ }
}

async function authRequestData(path: string, body: unknown): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_PATH}${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError(0, 'NETWORK_ERROR', '서버에 연결할 수 없습니다.');
  }
  const payload: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const error = typeof payload === 'object' && payload !== null && 'error' in payload
      ? (payload as { error?: { code?: unknown; message?: unknown } }).error
      : undefined;
    throw new AuthError(
      response.status,
      typeof error?.code === 'string' ? error.code : 'AUTH_FAILED',
      typeof error?.message === 'string' ? error.message : '로그인에 실패했습니다.',
    );
  }
  const data = typeof payload === 'object' && payload !== null && 'data' in payload
    ? (payload as { data?: unknown }).data
    : undefined;
  if (typeof data !== 'object' || data === null) {
    throw new AuthError(response.status, 'INVALID_RESPONSE', '서버 응답 형식이 올바르지 않습니다.');
  }
  return data;
}

function authSession(data: unknown): AuthSession {
  if (typeof data !== 'object' || data === null || !('accessToken' in data) || !('refreshToken' in data)) {
    throw new AuthError(0, 'INVALID_RESPONSE', '서버 응답 형식이 올바르지 않습니다.');
  }
  return data as AuthSession;
}

async function authRequest(path: string, body: unknown): Promise<AuthSession> {
  return authSession(await authRequestData(path, body));
}

export async function loginWithPassword(email: string, password: string): Promise<AuthSession> {
  const session = await authRequest('/auth/login', { email, password });
  storeRefreshToken(session.refreshToken);
  return session;
}

/** 재설정 메일 요청 — 서버는 계정 존재 여부와 무관하게 같은 응답을 준다. */
export async function requestPasswordReset(email: string): Promise<void> {
  await authRequestData('/auth/password-reset/request', { email });
}

/** 메일 링크의 토큰으로 새 비밀번호를 확정한다. */
export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  await authRequestData('/auth/password-reset/confirm', { token, newPassword });
}

export async function registerWithPassword(
  email: string,
  password: string,
  role: Role,
  termsVersion: string,
): Promise<AuthSession> {
  const session = await authRequest('/auth/register', { email, password, role, termsVersion });
  storeRefreshToken(session.refreshToken);
  return session;
}

export type GoogleCodeExchange =
  | { onboardingToken: string }
  | { session: AuthSession };

export async function exchangeGoogleCode(code: string): Promise<GoogleCodeExchange> {
  const data = await authRequestData('/auth/google/exchange', { code });
  if (
    typeof data === 'object' && data !== null &&
    'onboardingRequired' in data && data.onboardingRequired === true &&
    'onboardingToken' in data && typeof data.onboardingToken === 'string' && data.onboardingToken
  ) {
    storeRefreshToken(null);
    return { onboardingToken: data.onboardingToken };
  }
  const session = authSession(data);
  storeRefreshToken(session.refreshToken);
  return { session };
}

export async function completeGoogleOnboarding(
  onboardingToken: string,
  role: 'CLIENT' | 'SUPPLIER',
  termsVersion: string,
): Promise<AuthSession> {
  const session = await authRequest('/auth/google/complete-onboarding', {
    onboardingToken,
    role,
    termsVersion,
  });
  storeRefreshToken(session.refreshToken);
  return session;
}

export async function refreshAuthSession(refreshToken: string): Promise<AuthSession> {
  const session = await authRequest('/auth/refresh', { refreshToken });
  storeRefreshToken(session.refreshToken);
  return session;
}

export async function logoutAuthSession(refreshToken: string | null): Promise<void> {
  try {
    if (refreshToken) {
      await fetch(`${API_BASE_PATH}/auth/logout`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch { /* local cleanup still runs */ } finally {
    storeRefreshToken(null);
  }
}

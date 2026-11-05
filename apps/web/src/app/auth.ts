/* 실제 인증 — 백엔드 계약(access/refresh token body)만 사용한다.
 * access token은 메모리에, refresh token은 sessionStorage에 둔다(새로고침 복원).
 * 백엔드가 httpOnly 쿠키를 지원하지 않으므로 XSS 시 refresh token 노출 위험이 남는다. */
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

async function authRequest(path: string, body: unknown): Promise<AuthSession> {
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
  if (typeof data !== 'object' || data === null || !('accessToken' in data) || !('refreshToken' in data)) {
    throw new AuthError(response.status, 'INVALID_RESPONSE', '서버 응답 형식이 올바르지 않습니다.');
  }
  return data as AuthSession;
}

export async function loginWithPassword(email: string, password: string): Promise<AuthSession> {
  const session = await authRequest('/auth/login', { email, password });
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

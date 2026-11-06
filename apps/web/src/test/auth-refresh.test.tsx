import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from '@/app/session';
import { refreshAccessToken, registerRefreshHandler } from '@/lib/auth-refresh-bridge';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const sessionBody = (token: string) => ({
  data: {
    user: { id: 'user-1', email: 'user@example.invalid', role: 'CLIENT' },
    accessToken: token,
    refreshToken: `refresh-${token}`,
    accessExpiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  },
});

function State() {
  const { authReady, session } = useSession();
  return <output aria-label="auth state">{authReady ? session.status : 'loading'}</output>;
}

describe('refresh token handling', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    window.sessionStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    registerRefreshHandler(null);
    window.sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('shares one refresh request between concurrent callers', async () => {
    window.sessionStorage.setItem('mj.auth.refresh', 'refresh-old');
    let calls = 0;
    fetchMock.mockImplementation(async () => {
      calls += 1;
      return jsonResponse(sessionBody(`access-${calls}`));
    });

    render(<SessionProvider><State /></SessionProvider>);
    await waitFor(() => expect(screen.getByLabelText('auth state').textContent).toBe('user'));
    expect(calls).toBe(1);

    const [first, second] = await Promise.all([refreshAccessToken(), refreshAccessToken()]);
    expect(first).toBe(second);
    expect(calls).toBe(2);
  });

  it('저장된 access token이 유효하면 마운트에서 refresh하지 않는다', async () => {
    window.sessionStorage.setItem('mj.auth.refresh', 'refresh-old');
    window.sessionStorage.setItem('mj.auth.access', JSON.stringify({
      user: { id: 'user-1', email: 'user@example.invalid', role: 'CLIENT' },
      accessToken: 'access-cached',
      expiresAt: Date.now() + 3_600_000,
    }));

    render(<SessionProvider><State /></SessionProvider>);
    await waitFor(() => expect(screen.getByLabelText('auth state').textContent).toBe('user'));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('저장된 access token이 만료 직전이면 refresh하고 새 값을 저장한다', async () => {
    window.sessionStorage.setItem('mj.auth.refresh', 'refresh-old');
    window.sessionStorage.setItem('mj.auth.access', JSON.stringify({
      user: { id: 'user-1', email: 'user@example.invalid', role: 'CLIENT' },
      accessToken: 'access-old',
      expiresAt: Date.now() + 10_000,
    }));
    fetchMock.mockResolvedValue(jsonResponse(sessionBody('access-new')));

    render(<SessionProvider><State /></SessionProvider>);
    await waitFor(() => expect(screen.getByLabelText('auth state').textContent).toBe('user'));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const stored = JSON.parse(window.sessionStorage.getItem('mj.auth.access') ?? '{}') as { accessToken?: string };
    expect(stored.accessToken).toBe('access-new');
  });

  it('clears the session when the refresh token is no longer valid', async () => {
    window.sessionStorage.setItem('mj.auth.refresh', 'refresh-old');
    fetchMock.mockResolvedValue(jsonResponse({
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'expired', requestId: 'r1' },
    }, 401));

    render(<SessionProvider><State /></SessionProvider>);
    await waitFor(() => expect(screen.getByLabelText('auth state').textContent).toBe('guest'));

    expect(window.sessionStorage.getItem('mj.auth.refresh')).toBeNull();
    await expect(refreshAccessToken()).resolves.toBeNull();
  });
});

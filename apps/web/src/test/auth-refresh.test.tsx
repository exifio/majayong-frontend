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

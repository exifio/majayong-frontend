import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { location, renderAt } from './render';
import { GOOGLE_OAUTH_STATE_KEY } from '@/app/google-oauth';

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

const jsonResponse = (data: unknown) => new Response(JSON.stringify({ data }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});

describe('Google OAuth callback', () => {
  it('logs in an existing Google account and opens its role home', async () => {
    window.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, 'state-1');
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      user: { id: 'client-1', email: 'client@example.com', role: 'CLIENT' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      accessExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    })));

    renderAt('/auth/google/callback?code=google-code&state=state-1', 'guest');

    await waitFor(() => expect(location.current).toBe('/c'));
    expect(window.sessionStorage.getItem('mj.auth.refresh')).toBe('refresh-token');
  });

  it('routes a new Google account to role selection with consent unchecked', async () => {
    window.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, 'state-2');
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      onboardingRequired: true,
      onboardingToken: 'onboarding-token',
    })));

    renderAt('/auth/google/callback?code=google-code&state=state-2', 'guest');

    await waitFor(() => expect(location.current).toBe('/signup/role'));
    expect(screen.getByText('약관 동의')).toBeTruthy();
    expect(screen.getAllByRole('checkbox').every((checkbox) => !(checkbox as HTMLInputElement).checked)).toBe(true);
    expect(screen.getByRole('button', { name: '다음' }).hasAttribute('disabled')).toBe(true);
  });

  it('rejects a callback whose OAuth state does not match', async () => {
    window.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, 'expected-state');
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    renderAt('/auth/google/callback?code=google-code&state=wrong-state', 'guest');

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

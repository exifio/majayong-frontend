import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  completeGoogleOnboarding,
  exchangeGoogleCode,
} from './auth';

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

const authSession = {
  user: { id: 'user-1', email: 'user@example.com', role: 'CLIENT' },
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  accessExpiresAt: new Date(Date.now() + 60_000).toISOString(),
};

const jsonResponse = (data: unknown) => new Response(JSON.stringify({ data }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});

describe('Google authentication API', () => {
  it('retains the onboarding token for a new Google account', async () => {
    window.sessionStorage.setItem('mj.auth.refresh', 'stale-refresh-token');
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      onboardingRequired: true,
      onboardingToken: 'onboarding-token',
    }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await exchangeGoogleCode('google-code');

    expect(result).toEqual({ onboardingToken: 'onboarding-token' });
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({ code: 'google-code' });
    expect(window.sessionStorage.getItem('mj.auth.refresh')).toBeNull();
  });

  it('stores a refresh token when Google authenticates an existing account', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(authSession)));

    const result = await exchangeGoogleCode('google-code');

    expect(result).toEqual({ session: authSession });
    expect(window.sessionStorage.getItem('mj.auth.refresh')).toBe('refresh-token');
  });

  it('completes first-time onboarding with the selected role and terms version', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(authSession));
    vi.stubGlobal('fetch', fetchMock);

    await completeGoogleOnboarding('onboarding-token', 'SUPPLIER', 'v0.7');

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/auth/google/complete-onboarding', expect.objectContaining({
      body: JSON.stringify({
        onboardingToken: 'onboarding-token',
        role: 'SUPPLIER',
        termsVersion: 'v0.7',
      }),
    }));
    expect(window.sessionStorage.getItem('mj.auth.refresh')).toBe('refresh-token');
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import {
  canonicalVercelUrl,
  consumeGoogleOAuthState,
  googleAuthorizationUrl,
  googleOAuthRedirectUri,
  GOOGLE_OAUTH_STATE_KEY,
} from './google-oauth';

afterEach(() => window.sessionStorage.clear());

describe('Google OAuth', () => {
  it('requests an authorization code for the configured callback and scopes', () => {
    const url = new URL(googleAuthorizationUrl(
      'client-id',
      'https://majayong.example/auth/google/callback',
      'state-1',
    ));

    expect(url.origin).toBe('https://accounts.google.com');
    expect(url.pathname).toBe('/o/oauth2/v2/auth');
    expect(url.searchParams.get('client_id')).toBe('client-id');
    expect(url.searchParams.get('redirect_uri')).toBe('https://majayong.example/auth/google/callback');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('scope')).toBe('openid email profile');
    expect(url.searchParams.get('state')).toBe('state-1');
  });

  it('uses the canonical production callback and the local origin during development', () => {
    expect(googleOAuthRedirectUri('https://majayong-frontend.vercel.app', true))
      .toBe('https://majayong.vercel.app/auth/google/callback');
    expect(googleOAuthRedirectUri('http://localhost:5173', false))
      .toBe('http://localhost:5173/auth/google/callback');
  });

  it('moves secondary Vercel URLs to the canonical host and preserves the route', () => {
    expect(canonicalVercelUrl('https://majayong-frontend.vercel.app/signup?source=google#form'))
      .toBe('https://majayong.vercel.app/signup?source=google#form');
    expect(canonicalVercelUrl('https://majayong.vercel.app/signup')).toBeNull();
    expect(canonicalVercelUrl('https://majayong-frontend-production.vercel.app/signup')).toBeNull();
    expect(canonicalVercelUrl('http://localhost:5173/signup')).toBeNull();
  });

  it('accepts the saved state once and removes it', () => {
    window.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, 'state-1');

    expect(consumeGoogleOAuthState('state-1')).toBe(true);
    expect(consumeGoogleOAuthState('state-1')).toBe(false);
    expect(window.sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY)).toBeNull();
  });
});

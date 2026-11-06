export const GOOGLE_OAUTH_STATE_KEY = 'mj.auth.google-state';
const MAJAYONG_PRODUCTION_ORIGIN = 'https://majayong.vercel.app';
const ALLOWED_VERCEL_ORIGINS = new Set([
  'https://majayong.vercel.app',
  'https://majayong-frontend-production.vercel.app',
]);
const GOOGLE_CALLBACK_PATH = '/auth/google/callback';

export function googleOAuthRedirectUri(origin: string, production: boolean): string {
  return `${production ? MAJAYONG_PRODUCTION_ORIGIN : origin}${GOOGLE_CALLBACK_PATH}`;
}

export function canonicalVercelUrl(currentUrl: string): string | null {
  const current = new URL(currentUrl);
  if (!current.hostname.endsWith('.vercel.app')) return null;
  if (ALLOWED_VERCEL_ORIGINS.has(`https://${current.hostname}`)) return null;

  current.protocol = 'https:';
  current.host = 'majayong.vercel.app';
  return current.href;
}

export function googleAuthorizationUrl(clientId: string, redirectUri: string, state: string): string {
  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
}

export function startGoogleOAuth(): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) throw new Error('GOOGLE_NOT_CONFIGURED');

  const state = window.crypto.randomUUID();
  try {
    window.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);
  } catch {
    throw new Error('GOOGLE_STATE_UNAVAILABLE');
  }
  window.location.assign(googleAuthorizationUrl(
    clientId,
    googleOAuthRedirectUri(window.location.origin, import.meta.env.PROD),
    state,
  ));
}

export function consumeGoogleOAuthState(state: string | null): boolean {
  try {
    const expected = window.sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
    window.sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
    return Boolean(state && expected && state === expected);
  } catch {
    return false;
  }
}

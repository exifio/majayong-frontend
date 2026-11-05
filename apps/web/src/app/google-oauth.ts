export const GOOGLE_OAUTH_STATE_KEY = 'mj.auth.google-state';

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
    `${window.location.origin}/auth/google/callback`,
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

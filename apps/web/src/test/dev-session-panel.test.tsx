import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DevSessionPanel } from '@/app/DevSessionPanel';
import { DEV_SESSIONS, SessionProvider, useSession } from '@/app/session';

function ApiTokenState() {
  const { apiAccessToken } = useSession();
  return <output aria-label="API token state">{apiAccessToken ? 'set' : 'empty'}</output>;
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('DevSessionPanel', () => {
  it('does not render outside a development build', () => {
    vi.stubEnv('DEV', false);

    render(
      <MemoryRouter>
        <SessionProvider initial={DEV_SESSIONS.client}>
          <DevSessionPanel />
        </SessionProvider>
      </MemoryRouter>,
    );

    expect(screen.queryByText('시연 세션')).toBeNull();
  });

  it('renders in a development build even when the mock API is disabled', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_USE_MOCK', 'false');

    render(
      <MemoryRouter>
        <SessionProvider initial={DEV_SESSIONS.client}>
          <DevSessionPanel />
        </SessionProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('시연 세션')).toBeTruthy();
  });

  it('logs in through the backend and keeps only the access token in memory', async () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_USE_MOCK', 'true');
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      data: {
        user: { id: 'user-1', role: 'CLIENT' },
        accessToken: 'temporary-access-token',
        refreshToken: 'temporary-refresh-token',
      },
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <SessionProvider initial={DEV_SESSIONS.client}>
          <DevSessionPanel />
          <ApiTokenState />
        </SessionProvider>
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('개발 계정 이메일'), { target: { value: 'dev@example.invalid' } });
    fireEvent.change(screen.getByLabelText('개발 계정 비밀번호'), { target: { value: 'Localtest9' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(screen.getByLabelText('API token state').textContent).toBe('set'));
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/v1/auth/login');
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
    expect(init?.body).toBe(JSON.stringify({ email: 'dev@example.invalid', password: 'Localtest9' }));
    let storedToken: string | null = null;
    try { storedToken = window.localStorage.getItem('apiAccessToken'); } catch { /* localStorage unavailable */ }
    expect(storedToken).toBeNull();
  });
});

import { useEffect } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppRoutes, Providers } from '@/app/App';
import { DEV_SESSIONS, useSession, type Session } from '@/app/session';

export const location = { current: '' };

function LocationSpy() {
  const loc = useLocation();
  location.current = loc.pathname + loc.search;
  return null;
}

/** 개발 세션에서 API 토큰이 필요한 화면을 검증할 때 사용한다. */
function TokenSeeder({ token }: { token: string }) {
  const { setApiAccessToken } = useSession();
  useEffect(() => setApiAccessToken(token), [setApiAccessToken, token]);
  return null;
}

export function renderAt(
  path: string,
  who: keyof typeof DEV_SESSIONS | null = 'guest',
  session?: Session,
  apiToken?: string,
) {
  const initialSession = session !== undefined ? session : who ? DEV_SESSIONS[who] : undefined;
  return render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Providers session={initialSession}>
        {apiToken ? <TokenSeeder token={apiToken} /> : null}
        <AppRoutes />
        <LocationSpy />
      </Providers>
    </MemoryRouter>,
  );
}

/** 경로 패턴의 :param을 시연 값으로 채운다 */
export function samplePath(pattern: string): string {
  return pattern
    .replace(':pid', 'p-ondo').replace(':sid', 's-junho').replace(':cid', 'c-ondo')
    .replace(':did', 'd-1').replace(':uid', 'u-minjae').replace(':doc', 'privacy');
}

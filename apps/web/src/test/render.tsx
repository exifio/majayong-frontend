import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppRoutes, Providers } from '@/app/App';
import { DEV_SESSIONS, type Session } from '@/app/session';

export const location = { current: '' };

function LocationSpy() {
  const loc = useLocation();
  location.current = loc.pathname + loc.search;
  return null;
}

export function renderAt(
  path: string,
  who: keyof typeof DEV_SESSIONS | null = 'guest',
  session?: Session,
) {
  const initialSession = session !== undefined ? session : who ? DEV_SESSIONS[who] : undefined;
  return render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Providers session={initialSession}>
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

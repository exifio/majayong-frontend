/* 라우터 — routes.ts의 55개 화면을 그대로 경로로 만든다.
 * - 화면 파일은 pages/<공간>/<보드>.tsx (보드 이름 = 파일 이름)
 * - 모달 화면은 부모 경로 + ?modal=<이름> (결정메모 #2). 닫기 = 그 쿼리를 지움, 뒤로 가기도 닫힘
 * - 가드는 guards.ts, 셸은 components/layout/Shell.tsx */
import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SCREENS, type Guard, type ScreenRoute, type Shell } from './routes';
import { resolveGuard } from './guards';
import { ROLE_HOME, SessionProvider, useSession, type Session } from './session';
import { useDevDesignChecks } from './devChecks';
import { DevSessionPanel } from './DevSessionPanel';
import { AppShell } from '@/components/layout/Shell';
import { LoadingState, Modal, EmptyState } from '@/components/ui';
import { apiRequest } from '@/lib/api';
import type { ChatRoomSummaryDto } from '@majayong/types/api';
import NotFound from '@/pages/system/NotFound';
import Suspended from '@/pages/system/Suspended';
import UiCatalog from '@/pages/dev/UiCatalog';
import GoogleCallback from '@/pages/public/GoogleCallback';

const pageModules = import.meta.glob<{ default: ComponentType }>(
  ['../pages/*/*.tsx', '!../pages/*/*.test.tsx'],
  { eager: true },
);
export const PAGES: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(pageModules)
    // 인접 테스트 파일은 화면 모듈이 아니므로 번들·테스트 탐색에서 제외한다.
    .filter(([path]) => !path.endsWith('.test.tsx'))
    .map(([path, mod]) => [path.split('/').pop()!.replace(/\.tsx$/, ''), mod.default]),
);

const MODAL_SCREENS = SCREENS.filter((x) => x.kind === 'modal');
/** 로그인 모달만 두 랜딩 위에 뜬다 */
const modalParents = (m: ScreenRoute) => (m.modal === 'login' ? ['/', '/supplier'] : [m.path!]);
/** 모달을 닫을 때 함께 지우는 쿼리 */
const MODAL_PARAMS = ['modal', 'sid', 'next'];

function Guarded({ guard, children }: { guard: Guard; children: ReactNode }) {
  const { session } = useSession();
  const loc = useLocation();
  const to = resolveGuard(guard, session, loc.pathname + loc.search);
  return to ? <Navigate to={to} replace /> : <>{children}</>;
}

function ModalLayer({ parentPath }: { parentPath: string }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const loc = useLocation();
  const name = params.get('modal');
  const close = useCallback(() => {
    const p = new URLSearchParams(params);
    MODAL_PARAMS.forEach((k) => p.delete(k));
    const q = p.toString();
    navigate(`${loc.pathname}${q ? `?${q}` : ''}`, { replace: true });
  }, [params, navigate, loc.pathname]);

  if (!name) return null;
  const screen = MODAL_SCREENS.find((m) => m.modal === name && modalParents(m).includes(parentPath));
  if (!screen || resolveGuard(screen.guard, session, loc.pathname) !== null) return null;
  const Page = PAGES[screen.board];
  return (
    <Modal title={screen.name} onClose={close} size={screen.modal === 'login' ? 'content' : 'large'}>
      {Page ? <Page /> : null}
    </Modal>
  );
}

function ScreenPage({ screen }: { screen: ScreenRoute }) {
  const Page = PAGES[screen.board];
  return (
    <Guarded guard={screen.guard}>
      <AppShell shell={screen.shell}>
        {Page ? <Page /> : null}
        <ModalLayer parentPath={screen.path!} />
      </AppShell>
    </Guarded>
  );
}

/** /c/chat · /s/chat — 내 최근 대화로. 대화가 없으면 빈 상태. */
function ChatIndexRedirect({ space }: { space: 'client' | 'supplier' }) {
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [latest, setLatest] = useState<ChatRoomSummaryDto | null>(null);
  const shell = space === 'client' ? 'client' : 'supplier';

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    apiRequest('listChatRooms', '/me/chats', { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        setLatest(response.data[0] ?? null);
        setState('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken]);

  if (state === 'loading') {
    return <AppShell shell={shell}><LoadingState title="채팅" label="대화를 불러오는 중입니다." /></AppShell>;
  }
  if (state === 'error') {
    return <AppShell shell={shell}><p role="alert" style={{ padding: 24 }}>대화 목록을 불러오지 못했습니다. 다시 시도해 주세요.</p></AppShell>;
  }
  if (latest === null) {
    return (
      <AppShell shell={shell}>
        <EmptyState title="아직 대화가 없습니다">
          프로젝트에서 대화가 시작되면 이곳에 표시됩니다.
        </EmptyState>
      </AppShell>
    );
  }
  return (
    <Navigate
      to={space === 'client' ? `/c/chat/${latest.projectId}/${latest.supplierId}` : `/s/chat/${latest.projectId}`}
      replace
    />
  );
}

function ChatIndex({ space }: { space: 'client' | 'supplier' }) {
  return (
    <Guarded guard={space}>
      <ChatIndexRedirect space={space} />
    </Guarded>
  );
}

function SuspendedRoute() {
  const { session } = useSession();
  if (session.status !== 'user') return <Navigate to="/" replace />;
  if (!session.suspended) return <Navigate to={ROLE_HOME[session.role]} replace />;
  return <AppShell shell="minimal"><Suspended /></AppShell>;
}

function ShellOnly({ shell, guard, children }: { shell: Shell; guard: Guard; children: ReactNode }) {
  return <Guarded guard={guard}><AppShell shell={shell}>{children}</AppShell></Guarded>;
}

export function AppRoutes() {
  useDevDesignChecks();
  const { authReady } = useSession();
  if (!authReady) {
    return <LoadingState label="세션을 확인하는 중입니다." />;
  }
  return (
    <>
      <Routes>
        {SCREENS.filter((x) => x.kind === 'page').map((x) => (
          <Route key={x.board} path={x.path!} element={<ScreenPage screen={x} />} />
        ))}
        <Route path="/c/chat" element={<ChatIndex space="client" />} />
        <Route path="/s/chat" element={<ChatIndex space="supplier" />} />
        <Route
          path="/auth/google/callback"
          element={<ShellOnly shell="public" guard="none"><GoogleCallback /></ShellOnly>}
        />
        <Route path="/admin" element={<Guarded guard="admin"><Navigate to="/admin/blocks" replace /></Guarded>} />
        <Route path="/suspended" element={<SuspendedRoute />} />
        {import.meta.env.DEV && <Route path="/dev/ui" element={<AppShell shell="public"><UiCatalog /></AppShell>} />}
        <Route path="*" element={<ShellOnly shell="viewer" guard="none"><NotFound /></ShellOnly>} />
      </Routes>
      <DevSessionPanel />
    </>
  );
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000, refetchOnWindowFocus: true, retry: 1 } },
});

export function Providers({ session, children }: { session?: Session; children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider initial={session}>{children}</SessionProvider>
    </QueryClientProvider>
  );
}

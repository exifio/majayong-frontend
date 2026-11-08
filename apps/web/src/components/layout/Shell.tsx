/* 화면 셸 — 공간 극성(디자인 시스템 3절)
 * public · landing-*: 흰 헤더(공급자 랜딩은 navy) + 푸터
 * client: 흰 GNB + 푸터 / supplier: navy GNB + 푸터
 * admin: 상단 바 64 + navy 사이드 232, 푸터 없음, 1024 미만은 데스크톱 안내
 * viewer: 보는 사람의 공간(고객센터) */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Shell as ShellKind } from '@/app/routes';
import { ADMIN_MENU, ADMIN_MENU_BOTTOM } from '@/app/menus';
import { useSession } from '@/app/session';
import { apiRequest } from '@/lib/api';
import { Chip, EmptyState } from '@/components/ui';
import { Gnb, Logo, PublicHeader } from './Chrome';
import { LogoMark } from './LogoMark';
import { Footer } from './Footer';
import s from './layout.module.css';

const AdminInquiryCountContext = createContext<((count: number | null) => void) | null>(null);

export const useSetAdminInquiryCount = () => useContext(AdminInquiryCountContext);

export function AppShell({ shell, children }: { shell: ShellKind | 'minimal'; children: ReactNode }) {
  const { session } = useSession();
  let kind = shell;
  if (kind === 'viewer') {
    kind = session.status === 'user' ? (session.role === 'SUPPLIER' ? 'supplier' : session.role === 'CLIENT' ? 'client' : 'public') : 'public';
  }
  if (kind === 'admin') return <AdminShell>{children}</AdminShell>;

  const header =
    kind === 'client' ? <Gnb space="client" />
    : kind === 'supplier' ? <Gnb space="supplier" />
    : kind === 'landing-client' ? <PublicHeader variant="landing-client" />
    : kind === 'landing-supplier' ? <PublicHeader variant="landing-supplier" />
    : kind === 'minimal' ? <MinimalHeader />
    : <PublicHeader variant="plain" />;

  return (
    <div className="mj-page" data-shell={kind}>
      {header}
      <main className="mj-container mj-main">{children}</main>
      <Footer />
    </div>
  );
}

function MinimalHeader() {
  return (
    <header className={s.bar}>
      <div className={`mj-container ${s.barInner}`}><Logo /></div>
    </header>
  );
}

type AdminQueueKey = Exclude<(typeof ADMIN_MENU)[number]['queue'], 'inquiries'>;
type AdminQueueCounts = Record<AdminQueueKey, number | null>;

const NO_QUEUE_COUNTS: AdminQueueCounts = {
  blocks: null,
  payments: null,
  refunds: null,
  disputes: null,
  reports: null,
};

/* 개수 전용 API(`GET /admin/menu-counts`)로 한 번에 센다.
 * 실패하거나 모르면 null — 배지를 그리지 않는다(가짜 숫자 금지). */
function loadAdminQueueCounts(
  accessToken: string,
  signal: AbortSignal,
  onCount: (key: AdminQueueKey, count: number | null) => void,
) {
  apiRequest('getAdminMenuCounts', '/admin/menu-counts', { accessToken, signal })
    .then(({ data }) => {
      onCount('blocks', data.blocksPending);
      onCount('payments', data.heldDeposits);
      onCount('refunds', data.cancellationQueue);
      onCount('disputes', data.escalatedInspections);
      onCount('reports', data.reportsPending);
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      for (const key of ['blocks', 'payments', 'refunds', 'disputes', 'reports'] as const) {
        onCount(key, null);
      }
    });
}

function AdminShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { session, apiAccessToken } = useSession();
  const [inquiryCount, setInquiryCount] = useState<number | null>(null);
  useEffect(() => {
    if (pathname === '/admin/inquiries') return;
    setInquiryCount(null);
    if (!apiAccessToken) return;
    const controller = new AbortController();
    apiRequest('listAdminInquiries', '/admin/support/inquiries', {
      accessToken: apiAccessToken,
      signal: controller.signal,
    })
      .then(({ data }) => {
        setInquiryCount(data.filter((row) => row.status === 'WAITING').length);
      })
      .catch((error: unknown) => {
        if (!(error instanceof Error && error.name === 'AbortError')) setInquiryCount(null);
      });
    return () => controller.abort();
  }, [apiAccessToken, pathname]);

  const [queueCounts, setQueueCounts] = useState<AdminQueueCounts>(NO_QUEUE_COUNTS);
  useEffect(() => {
    if (!apiAccessToken) {
      setQueueCounts(NO_QUEUE_COUNTS);
      return;
    }
    const controller = new AbortController();
    loadAdminQueueCounts(apiAccessToken, controller.signal, (key, count) => {
      setQueueCounts((current) => (current[key] === count ? current : { ...current, [key]: count }));
    });
    return () => controller.abort();
  }, [apiAccessToken, pathname]);

  return (
    <AdminInquiryCountContext.Provider value={setInquiryCount}>
      <div data-shell="admin">
        <div className={s.adminTop}>
          <div className={s.adminBrand}>
            <span className={s.adminLogo}><LogoMark />마자용 운영</span> <Chip tone="neutral">운영자 콘솔</Chip>
          </div>
          <span className={s.accountName}>{session.status === 'user' ? session.name : ''}</span>
        </div>
        <div className={s.adminBody}>
          <nav className={s.adminSide} aria-label="운영자 메뉴">
            <ul>
              {ADMIN_MENU.map((m) => {
                const count = m.queue === 'inquiries' ? inquiryCount : queueCounts[m.queue];
                return (
                  <li key={m.to}>
                    <Link className={s.adminLink} to={m.to} aria-current={pathname === m.to ? 'page' : undefined}>
                      {m.label}
                      {count !== null && count > 0 && <span className={s.badge}>{count}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <hr />
            <ul>
              <li>
                <Link className={s.adminLink} to={ADMIN_MENU_BOTTOM.to} aria-current={pathname === ADMIN_MENU_BOTTOM.to ? 'page' : undefined}>
                  {ADMIN_MENU_BOTTOM.label}
                </Link>
              </li>
            </ul>
            <p className={s.adminSideFoot}>운영자 행위는 모두 이벤트 기록에 남습니다</p>
          </nav>
          <main className={s.adminMain}>{children}</main>
        </div>
        <div className={s.adminDesktopOnly}>
          <EmptyState title="데스크톱에서 이용해 주세요">운영자 콘솔은 화면 폭 1024px 이상에서 쓸 수 있습니다.</EmptyState>
        </div>
      </div>
    </AdminInquiryCountContext.Provider>
  );
}

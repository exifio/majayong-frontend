/* 화면 셸 — 공간 극성(디자인 시스템 3절)
 * public · landing-*: 흰 헤더(공급자 랜딩은 navy) + 푸터
 * client: 흰 GNB + 푸터 / supplier: navy GNB + 푸터
 * admin: 상단 바 64 + navy 사이드 232, 푸터 없음, 1024 미만은 데스크톱 안내
 * viewer: 보는 사람의 공간(고객센터) */
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Shell as ShellKind } from '@/app/routes';
import { ADMIN_MENU, ADMIN_MENU_BOTTOM } from '@/app/menus';
import { useSession } from '@/app/session';
import { DEMO_ADMIN_QUEUES } from '@/mocks/demo';
import { Chip, EmptyState } from '@/components/ui';
import { Gnb, Logo, PublicHeader } from './Chrome';
import { Footer } from './Footer';
import s from './layout.module.css';

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

function AdminShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { session } = useSession();
  return (
    <div data-shell="admin">
      <div className={s.adminTop}>
        <div className={s.adminBrand}>
          <span className={s.logoMark} aria-hidden="true" style={{ color: 'var(--navy-900)' }}><span /><span /><span /></span>
          마자용 운영 <Chip tone="neutral">운영자 콘솔</Chip>
        </div>
        <span className={s.accountName}>{session.status === 'user' ? session.name : ''}</span>
      </div>
      <div className={s.adminBody}>
        <nav className={s.adminSide} aria-label="운영자 메뉴">
          <ul>
            {ADMIN_MENU.map((m) => (
              <li key={m.to}>
                <Link className={s.adminLink} to={m.to} aria-current={pathname === m.to ? 'page' : undefined}>
                  {m.label}
                  {DEMO_ADMIN_QUEUES[m.queue] > 0 && <span className={s.badge}>{DEMO_ADMIN_QUEUES[m.queue]}</span>}
                </Link>
              </li>
            ))}
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
  );
}

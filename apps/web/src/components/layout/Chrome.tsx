/* 셸 부품 — 로고 · 비로그인 헤더 · 의뢰인/공급자 GNB · 아바타 메뉴 · 알림 드롭다운 · 페이지 머리 (디자인 시스템 3 · 7 · 9절) */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, CalendarClock, CheckCircle2, MessageSquare, Info as InfoIcon } from 'lucide-react';
import type { NotificationItem, NotificationType } from '@majayong/types';
import { CLIENT_MENU, LANDING_MENU, SUPPLIER_MENU } from '@/app/menus';
import { ROLE_HOME, useSession } from '@/app/session';
import { DEMO_NOTIFICATIONS } from '@/mocks/demo';
import { Button, Tabs } from '@/components/ui';
import s from './layout.module.css';

/* ── 로고 ── 로그인 후 → 역할 홈, 비로그인 → 의뢰인 랜딩 */
export function Logo() {
  const { session } = useSession();
  const to = session.status === 'user' ? ROLE_HOME[session.role] : '/';
  return (
    <Link to={to} className={s.logo} aria-label="마자용 홈">
      <span className={s.logoMark} aria-hidden="true"><span /><span /><span /></span>
      <span className={s.logoText}>마자용</span>
    </Link>
  );
}

/* ── 비로그인 헤더 ── 공간 토글은 랜딩에만 */
export function PublicHeader({ variant }: { variant: 'landing-client' | 'landing-supplier' | 'plain' }) {
  const navy = variant === 'landing-supplier';
  const landing = variant !== 'plain';
  const menu = variant === 'landing-supplier' ? LANDING_MENU.supplier : LANDING_MENU.client;
  const here = variant === 'landing-supplier' ? '/supplier' : '/';
  return (
    <header className={`${s.bar} ${navy ? s.onNavy : ''}`}>
      <div className={`mj-container ${s.barInner}`}>
        <Logo />
        {landing ? (
          <ul className={`${s.menu} ${s.landingMenu}`}>
            {menu.map((m) => <li key={m.to}><a className={s.menuLink} href={m.to}>{m.label}</a></li>)}
          </ul>
        ) : (
          <ul className={s.menu}>
            <li><Link className={s.menuLink} to="/">의뢰인 안내</Link></li>
            <li><Link className={s.menuLink} to="/supplier">공급자 안내</Link></li>
            <li><Link className={s.menuLink} to="/help">고객센터</Link></li>
          </ul>
        )}
        <div className={s.right}>
          {landing && (
            <>
              <nav className={s.toggle} aria-label="공간 전환">
                <Link to="/" aria-current={!navy}>의뢰인</Link>
                <Link to="/supplier" aria-current={navy}>공급자</Link>
              </nav>
              <span className={s.vline} aria-hidden="true" />
            </>
          )}
          <Link className={s.textLink} to={`${landing ? here : '/'}?modal=login`}>로그인</Link>
          {landing
            ? <Button size="sm" variant={navy ? 'onnavy' : 'primary'} to="/signup">{navy ? '공급자로 가입하기' : '화면 초안 받아보기'}</Button>
            : <Link className={s.textLink} to="/signup">회원가입</Link>}
        </div>
      </div>
    </header>
  );
}

/* ── 바깥 클릭 · Esc로 닫히는 팝오버 ── */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return { open, setOpen, ref, btnRef };
}

/* ── 의뢰인 · 공급자 GNB ── */
export function Gnb({ space }: { space: 'client' | 'supplier' }) {
  const { session } = useSession();
  const { pathname, search } = useLocation();
  const q = new URLSearchParams(search);
  const navy = space === 'supplier';
  const menu = navy ? SUPPLIER_MENU : CLIENT_MENU;
  const name = session.status === 'user' ? session.name : '';
  const notifications = DEMO_NOTIFICATIONS[navy ? 'SUPPLIER' : 'CLIENT'];
  const unread = notifications.some((n) => !n.isRead);

  return (
    <header className={`${s.bar} ${navy ? s.onNavy : ''}`} data-gnb={space}>
      <div className={`mj-container ${s.barInner}`}>
        <Logo />
        <nav aria-label="주 메뉴" className={s.nav}>
          <ul className={s.menu}>
            {menu.map((m) => (
              <li key={m.label}>
                <Link className={s.menuLink} to={m.to} aria-current={m.match(pathname, q) ? 'page' : undefined}>{m.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={s.right}>
          <Link className={s.iconBtn} to={navy ? '/s/chat' : '/c/chat'} aria-label="채팅">
            <MessageSquare size={22} strokeWidth={1.8} />
            <span className={s.dot} aria-hidden="true" />
          </Link>
          <NotificationDropdown items={notifications} hasUnread={unread} />
          <AvatarMenu space={space} name={name} />
        </div>
      </div>
    </header>
  );
}

function AvatarMenu({ space, name }: { space: 'client' | 'supplier'; name: string }) {
  const { open, setOpen, ref, btnRef } = usePopover();
  const { setDevSession } = useSession();
  const base = space === 'client' ? '/c' : '/s';
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button ref={btnRef} type="button" className={s.account} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className={s.avatar} aria-hidden="true">{name.slice(0, 1)}</span>
        <span className={s.accountName}>{name}</span>
      </button>
      {open && (
        <ul className={s.menuPanel} role="menu">
          <li role="none"><Link role="menuitem" to={`${base}/profile`} onClick={() => setOpen(false)}>내 프로필</Link></li>
          <li role="none"><Link role="menuitem" to={`${base}/account`} onClick={() => setOpen(false)}>계정 설정</Link></li>
          <li role="none"><hr /></li>
          <li role="none"><button role="menuitem" className={s.logout} onClick={() => setDevSession('guest')}>로그아웃</button></li>
        </ul>
      )}
    </div>
  );
}

const ICON_KIND: Record<NotificationType, 'neutral' | 'message' | 'done' | 'deadline'> = {
  APPLICATION_RECEIVED: 'neutral', APPLICATION_ACCEPTED: 'neutral', APPLICATION_AUTO_REJECTED: 'neutral',
  APPLICATION_REJECTED: 'neutral', PROJECT_CLOSED: 'neutral', REQUOTE_REQUESTED: 'neutral', CONTRACT_BROKEN: 'neutral',
  NEW_MESSAGE: 'message', AUTO_APPROVED: 'done', REPORT_REVIEWED: 'done', INQUIRY_ANSWERED: 'done',
  DEPOSIT_DUE: 'deadline', INSPECTION_DUE: 'deadline', WORK_DUE: 'deadline', WORK_OVERDUE: 'deadline',
};
const ICON = { neutral: InfoIcon, message: MessageSquare, done: CheckCircle2, deadline: CalendarClock };

/* ── 알림 드롭다운 ── 페이지 없음, 폭 440, 최근 30일. 데이터 연결은 M3 */
export function NotificationDropdown({ items, hasUnread }: { items: NotificationItem[]; hasUnread: boolean }) {
  const { open, setOpen, ref, btnRef } = usePopover();
  const [tab, setTab] = useState('all');
  const [read, setRead] = useState<Set<string>>(new Set());
  const isRead = (n: NotificationItem) => n.isRead || read.has(n.id);
  const unreadCount = items.filter((n) => !isRead(n)).length;
  const shown = tab === 'unread' ? items.filter((n) => !isRead(n)) : items;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button ref={btnRef} type="button" className={s.iconBtn} aria-label="알림" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Bell size={22} strokeWidth={1.8} />
        {hasUnread && unreadCount > 0 && <span className={s.dot} aria-hidden="true" />}
      </button>
      {open && (
        <div className={s.dropdown} role="dialog" aria-label="알림" data-dropdown="notifications">
          <div className={s.ddHead}>
            <p className={s.ddTitle}>알림{unreadCount > 0 && <span className={s.ddCount}>{unreadCount}</span>}</p>
            <Button variant="text" onClick={() => setRead(new Set(items.map((n) => n.id)))}>모두 읽음</Button>
          </div>
          <div className={s.ddTabs}>
            <Tabs label="알림 거르기" value={tab} onChange={setTab}
              items={[{ key: 'all', label: '전체', count: items.length }, { key: 'unread', label: '안 읽음', count: unreadCount }]} />
          </div>
          <p className={s.ddGroup}>최근</p>
          <ul className={s.ddList}>
            {shown.map((n) => {
              const kind = ICON_KIND[n.type];
              const Icon = ICON[kind];
              return (
                <li key={n.id}>
                  <Link className={s.ddRow} to={n.targetUrl} data-unread={!isRead(n)}
                    onClick={() => { setRead(new Set([...read, n.id])); setOpen(false); }}>
                    <span className={`${s.ddIcon} ${s[`ic-${kind}`]}`} aria-hidden="true"><Icon size={16} /></span>
                    <span className={s.ddText}>
                      <p className={s.ddMsg}>{n.message}</p>
                      <p className={s.ddTarget}>{n.target}</p>
                    </span>
                    {!isRead(n) && <span className={s.ddUnreadDot} aria-label="안 읽음" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className={s.ddFoot}>최근 30일 알림입니다. 예치 · 납품 · 검수 · 지급 소식은 내 계약에서 상태로 보여 드리고, 알림으로는 기한 안내만 보냅니다.</p>
        </div>
      )}
    </div>
  );
}

/* ── 페이지 머리 ── 이동 경로 → 제목 28(+ 상태 칩) → 한 줄 설명. 스테퍼는 가입 흐름에만 */
export function PageHeader({ crumb, title, chip, description, right }: {
  crumb?: { label: string; to?: string }[]; title: string; chip?: ReactNode; description?: ReactNode; right?: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      {crumb && crumb.length > 0 && (
        <p className={s.crumb}>
          {crumb.map((c, i) => (
            <span key={i}>{c.to ? <Link to={c.to}>{c.label}</Link> : c.label}{i < crumb.length - 1 && ' › '}</span>
          ))}
        </p>
      )}
      <div className={s.headRow}>
        <div>
          <h1 className={s.pageTitle}>{title}{chip}</h1>
          {description && <p className={s.pageDesc}>{description}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

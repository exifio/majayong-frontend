/* 셸 부품 — 로고 · 비로그인 헤더 · 의뢰인/공급자 GNB · 아바타 메뉴 · 알림 드롭다운 · 페이지 머리 (디자인 시스템 3 · 7 · 9절) */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, CalendarClock, CheckCircle2, MessageSquare, Info as InfoIcon } from 'lucide-react';
import type { NotificationItem, NotificationType } from '@majayong/types';
import { CLIENT_MENU, LANDING_MENU, SUPPLIER_MENU } from '@/app/menus';
import { ROLE_HOME, useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { notificationToItem } from '@/lib/notification-adapter';
import { LoadingState, Button, Tabs } from '@/components/ui';
import { LogoMark } from './LogoMark';
import s from './layout.module.css';

/* ── 로고 ── 로그인 후 → 역할 홈, 비로그인 → 의뢰인 랜딩 */
export function Logo() {
  const { session } = useSession();
  const to = session.status === 'user' ? ROLE_HOME[session.role] : '/';
  return (
    <Link to={to} className={s.logo} aria-label="마자용 홈">
      <LogoMark />
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
            ? <Button size="sm" variant="primary" to="/signup">{navy ? '공급자로 등록' : '화면 초안 받아보기'}</Button>
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
  const { session, apiAccessToken } = useSession();
  const { pathname, search } = useLocation();
  const q = new URLSearchParams(search);
  const navy = space === 'supplier';
  const menu = navy ? SUPPLIER_MENU : CLIENT_MENU;
  const name = session.status === 'user' ? session.name : '';
  const role = navy ? 'SUPPLIER' : 'CLIENT';
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadState, setLoadState] = useState<NotificationLoadState>('idle');
  const [actionError, setActionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!apiAccessToken.trim()) {
      setNotifications([]);
      setUnreadCount(0);
      setLoadState('idle');
      setActionError(null);
      return;
    }

    const controller = new AbortController();
    setNotifications([]);
    setUnreadCount(0);
    setLoadState('loading');
    setActionError(null);
    apiRequest('listNotifications', '/me/notifications', {
      accessToken: apiAccessToken,
      signal: controller.signal,
    }).then((response) => {
      setNotifications(response.data.map((item) => notificationToItem(item, role)));
      setUnreadCount(response.meta.unreadCount);
      setLoadState('success');
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setLoadState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
    });

    return () => controller.abort();
  }, [apiAccessToken, retryCount, role]);

  async function markRead(notification: NotificationItem) {
    if (notification.isRead || !apiAccessToken.trim()) return;
    try {
      await apiRequest('readNotification', `/me/notifications/${encodeURIComponent(notification.id)}/read`, {
        method: 'PATCH',
        accessToken: apiAccessToken,
      });
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item,
      ));
      setUnreadCount((count) => Math.max(0, count - 1));
      setActionError(null);
    } catch (error) {
      setActionError(error instanceof ApiRequestError && error.status === 401
        ? 'API 토큰 인증에 실패했습니다.'
        : '알림을 읽음 처리하지 못했습니다. 다시 시도해 주세요.');
    }
  }

  async function markAllRead() {
    if (unreadCount === 0 || !apiAccessToken.trim()) return;
    try {
      await apiRequest('readAllNotifications', '/me/notifications/read-all', {
        method: 'POST',
        accessToken: apiAccessToken,
      });
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      setActionError(null);
    } catch (error) {
      setActionError(error instanceof ApiRequestError && error.status === 401
        ? 'API 토큰 인증에 실패했습니다.'
        : '알림을 모두 읽음 처리하지 못했습니다. 다시 시도해 주세요.');
    }
  }

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
          <NotificationDropdown
            items={notifications}
            unreadCount={unreadCount}
            loadState={loadState}
            actionError={actionError}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
          <AvatarMenu space={space} name={name} />
        </div>
      </div>
    </header>
  );
}
function AvatarMenu({ space, name }: { space: 'client' | 'supplier'; name: string }) {
  const { open, setOpen, ref, btnRef } = usePopover();
  const { logout } = useSession();
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
          <li role="none"><button role="menuitem" className={s.logout} onClick={() => { void logout(); }}>로그아웃</button></li>
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
type IconKind = keyof typeof ICON;

/** 서버가 새 알림 종류를 먼저 내보내도 드롭다운이 깨지지 않도록 모르는 종류는 중립 아이콘으로 보인다. */
export function notificationIconKind(type: string): IconKind {
  return Object.prototype.hasOwnProperty.call(ICON_KIND, type) ? ICON_KIND[type as NotificationType] : 'neutral';
}

const FALLBACK_NOTIFICATION_MESSAGE = '새 알림이 있습니다.';

/* ── 알림 드롭다운 ── 페이지 없음, 폭 440, 최근 30일. 데이터 연결은 M3 */
type NotificationLoadState = 'idle' | 'loading' | 'success' | 'auth-error' | 'error';

export function NotificationDropdown({
  items,
  unreadCount,
  loadState,
  actionError,
  onMarkRead,
  onMarkAllRead,
  onRetry,
}: {
  items: NotificationItem[];
  unreadCount: number;
  loadState: NotificationLoadState;
  actionError: string | null;
  onMarkRead: (notification: NotificationItem) => void;
  onMarkAllRead: () => void;
  onRetry: () => void;
}) {
  const { open, setOpen, ref, btnRef } = usePopover();
  const { pathname } = useLocation();
  const [tab, setTab] = useState('all');
  const shown = tab === 'unread' ? items.filter((item) => !item.isRead) : items;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" ref={btnRef} className={s.iconBtn} aria-label="알림" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Bell size={22} strokeWidth={1.8} />
        {unreadCount > 0 && <span className={s.dot} aria-hidden="true" />}
      </button>
      {open && (
        <div className={s.dropdown} role="dialog" aria-label="알림" data-dropdown="notifications">
          <div className={s.ddHead}>
            <p className={s.ddTitle}>알림{unreadCount > 0 && <span className={s.ddCount}>{unreadCount}</span>}</p>
            <Button variant="text" onClick={onMarkAllRead} disabled={unreadCount === 0 || loadState !== 'success'} disabledReason="읽지 않은 알림이 없습니다.">모두 읽음</Button>
          </div>
          <div className={s.ddTabs}>
            <Tabs label="알림 거르기" value={tab} onChange={setTab}
              items={[{ key: 'all', label: '전체', count: items.length }, { key: 'unread', label: '안 읽음', count: unreadCount }]} />
          </div>
          <p className={s.ddGroup}>최근</p>
          {actionError && <p role="alert" style={{ padding: '8px 16px' }}>{actionError}</p>}
          <ul className={s.ddList}>
            {loadState === 'idle' && (
              <li><p role="status" style={{ padding: '12px 16px' }}>
                {import.meta.env.DEV ? '개발 세션 패널에 API 토큰을 입력해 주세요.' : '로그인 후 알림을 확인할 수 있습니다.'}
              </p></li>
            )}
            {loadState === 'loading' && <li><LoadingState label="알림을 불러오는 중입니다." compact /></li>}
            {loadState === 'auth-error' && (
              <li>
                <p role="alert" style={{ padding: '12px 16px' }}>API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.</p>
                <Button variant="text" onClick={onRetry}>다시 시도</Button>
              </li>
            )}
            {loadState === 'error' && (
              <li>
                <p role="alert" style={{ padding: '12px 16px' }}>알림을 불러오지 못했습니다.</p>
                <Button variant="text" onClick={onRetry}>다시 시도</Button>
              </li>
            )}
            {loadState === 'success' && shown.length === 0 && (
              <li><p role="status" style={{ padding: '12px 16px' }}>{tab === 'unread' ? '안 읽은 알림이 없습니다.' : '새 알림이 없습니다.'}</p></li>
            )}
            {loadState === 'success' && shown.map((notification) => {
              const kind = notificationIconKind(notification.type);
              const Icon = ICON[kind];
              return (
                <li key={notification.id}>
                  <Link className={s.ddRow} to={notification.targetUrl || pathname} data-unread={!notification.isRead}
                    onClick={() => { onMarkRead(notification); setOpen(false); }}>
                    <span className={`${s.ddIcon} ${s[`ic-${kind}`]}`} aria-hidden="true"><Icon size={16} /></span>
                    <span className={s.ddText}>
                      <p className={s.ddMsg}>{notification.message || FALLBACK_NOTIFICATION_MESSAGE}</p>
                    </span>
                    {!notification.isRead && <span className={s.ddUnreadDot} aria-label="안 읽음" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className={s.ddFoot}>최근 30일 알림입니다. 예치 납품 검수 · 지급 소식은 내 계약에서 상태로 보여 드리고, 알림으로는 안내만 보냅니다.</p>
        </div>
      )}
    </div>
  );
}
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

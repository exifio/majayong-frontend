/* 알림 드롭다운 — 모르는 알림 종류가 와도 깨지지 않는다 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { NotificationItem, NotificationType } from '@majayong/types';
import { SessionProvider, DEV_SESSIONS } from '@/app/session';
import { NotificationDropdown, notificationIconKind } from './Chrome';

function item(type: string, overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: `n-${type}`,
    type: type as NotificationType,
    message: '새 메시지가 도착했습니다.',
    target: 't-1',
    targetUrl: '/c/chat/p-1/s-1',
    isRead: false,
    createdAt: '2026-11-08T00:00:00.000Z',
    ...overrides,
  };
}

function openDropdown(items: NotificationItem[]) {
  render(
    <MemoryRouter initialEntries={['/c']}>
      <SessionProvider initial={DEV_SESSIONS.client}>
        <NotificationDropdown
          items={items}
          unreadCount={items.filter((n) => !n.isRead).length}
          loadState="success"
          actionError={null}
          onMarkRead={vi.fn()}
          onMarkAllRead={vi.fn()}
          onRetry={vi.fn()}
        />
      </SessionProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: '알림' }));
  return screen.getByRole('dialog', { name: '알림' });
}

describe('알림 드롭다운 — 안전 처리', () => {
  it('아는 종류는 정해진 아이콘, 모르는 종류는 중립 아이콘을 고른다', () => {
    expect(notificationIconKind('NEW_MESSAGE')).toBe('message');
    expect(notificationIconKind('WORK_DUE')).toBe('deadline');
    expect(notificationIconKind('SOMETHING_NEW')).toBe('neutral');
    expect(notificationIconKind('toString')).toBe('neutral');
  });

  it('모르는 종류 · 빈 문구 · 빈 링크가 와도 목록을 그린다', () => {
    const dialog = openDropdown([
      item('NEW_MESSAGE'),
      item('SOMETHING_NEW', { message: '', targetUrl: '' }),
    ]);
    const links = within(dialog).getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(within(dialog).getByText('새 메시지가 도착했습니다.')).toBeTruthy();
    expect(within(dialog).getByText('새 알림이 있습니다.')).toBeTruthy();
    expect(links[1]!.getAttribute('href')).toBe('/c');
  });
});

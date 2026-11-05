import { describe, expect, it } from 'vitest';
import type { NotificationDto } from '@majayong/types/api';
import { notificationToItem } from './notification-adapter';

const notification = (type: NotificationDto['type'], targetId: string): NotificationDto => ({
  id: 'notification-1',
  userId: 'user-1',
  type,
  targetId,
  targetUrl: '/backend/path-is-not-a-screen-route',
  payload: null,
  isRead: false,
  createdAt: '2026-11-05T00:00:00.000Z',
});

describe('notificationToItem', () => {
  it('maps the API chat target to the existing client screen and does not expose a backend route', () => {
    expect(notificationToItem(notification('NEW_MESSAGE', 'project-1:supplier-1'), 'CLIENT'))
      .toMatchObject({
        message: '새 메시지가 도착했습니다.',
        target: 'project-1:supplier-1',
        targetUrl: '/c/chat/project-1/supplier-1',
      });
  });

  it('maps supplier delivery notices to the existing delivery screen', () => {
    expect(notificationToItem(notification('WORK_OVERDUE', 'contract-1'), 'SUPPLIER'))
      .toMatchObject({ targetUrl: '/s/contracts/contract-1/deliver' });
  });
});

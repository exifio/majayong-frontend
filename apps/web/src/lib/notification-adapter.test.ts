import { describe, expect, it } from 'vitest';
import type { NotificationDto } from '@majayong/types/api';
import { notificationToItem } from './notification-adapter';

const notification = (over: Partial<NotificationDto> = {}): NotificationDto => ({
  id: 'n1',
  userId: 'user-1',
  type: 'INQUIRY_ANSWERED',
  targetUrl: '/help/inquiry?tab=my&id=inquiry-1',
  targetId: 'inquiry-1',
  payload: null,
  isRead: false,
  createdAt: '2026-11-06T00:00:00.000Z',
  ...over,
});

describe('notificationToItem — 문의 답변 알림', () => {
  it('서버가 준 내 문의 상세 링크를 그대로 쓴다', () => {
    const item = notificationToItem(notification(), 'CLIENT');
    expect(item.targetUrl).toBe('/help/inquiry?tab=my&id=inquiry-1');
  });

  it('문의 내용 대신 고정 안내 문구만 노출한다', () => {
    const item = notificationToItem(notification({ payload: { title: '예치 확인 문의' } }), 'SUPPLIER');
    expect(item.message).toBe('문의에 답변이 등록되었습니다.');
    expect(item.message).not.toContain('예치');
  });
});

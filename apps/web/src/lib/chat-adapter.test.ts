import { describe, expect, it } from 'vitest';
import type { ChatMessageDto, ChatRoomSummaryDto } from '@majayong/types/api';
import { chatMessagesToItems, chatRoomHref, chatRoomToItem } from './chat-adapter';

const room: ChatRoomSummaryDto = {
  id: 'application-1',
  projectId: 'project-1',
  clientUserId: 'client-user-1',
  supplierId: 'supplier-user-1',
  status: 'SUBMITTED',
  contractStatus: null,
  lastMessage: {
    id: 'message-2',
    applicationId: 'application-1',
    senderId: 'supplier-user-1',
    kind: 'TEXT',
    body: '일정 조율 가능합니다.',
    isMasked: false,
    readAt: null,
    createdAt: '2026-11-05T04:39:40.656Z',
  },
  unreadCount: 1,
};

const message = (overrides: Partial<ChatMessageDto>): ChatMessageDto => ({
  id: 'message-1',
  applicationId: 'application-1',
  senderId: 'client-user-1',
  kind: 'TEXT',
  body: '안녕하세요',
  isMasked: false,
  readAt: null,
  createdAt: '2026-11-05T04:39:40.649Z',
  ...overrides,
});

describe('chatRoomToItem', () => {
  it('maps only fields the chat API provides', () => {
    const item = chatRoomToItem(room, 'CLIENT');
    expect(item.applicationId).toBe('application-1');
    expect(item.counterpart).toBe('공급자 supplier');
    expect(item.preview).toBe('일정 조율 가능합니다.');
    expect(item.statusLabel).toBe('검토 중');
    expect(item.unreadCount).toBe(1);
    expect(item.timeLabel).toMatch(/^\d{2}:\d{2}$/);
  });

  it('prefers the contract status and falls back to an empty preview', () => {
    const item = chatRoomToItem({ ...room, contractStatus: 'ACTIVE', lastMessage: null, unreadCount: 0 }, 'CLIENT');
    expect(item.statusLabel).toBe('진행 중');
    expect(item.preview).toBe('아직 메시지가 없습니다.');
    expect(item.timeLabel).toBe('');
  });

  it('links each role to its own chat route', () => {
    expect(chatRoomHref('CLIENT', room)).toBe('/c/chat/project-1/supplier-user-1');
    expect(chatRoomHref('SUPPLIER', room)).toBe('/s/chat/project-1');
  });
});

describe('chatMessagesToItems', () => {
  it('splits me, them, system and adds one day separator per date', () => {
    const items = chatMessagesToItems([
      message({}),
      message({ id: 'message-2', senderId: 'supplier-user-1', body: '네, 확인했습니다.', createdAt: '2026-11-05T04:39:40.656Z' }),
      message({ id: 'message-3', senderId: null, kind: 'SYSTEM', body: '임시 계약이 되었습니다.' }),
      message({ id: 'message-4', body: '다음 날 메시지', createdAt: '2026-11-06T01:00:00.000Z' }),
    ], 'client-user-1');

    expect(items.map((item) => item.kind)).toEqual(['day', 'me', 'them', 'sys', 'day', 'me']);
    expect(items[0]).toMatchObject({ kind: 'day', text: '11월 5일' });
    expect(items[4]).toMatchObject({ kind: 'day', text: '11월 6일' });
  });
});

/* 채팅 진입 — /c/chat · /s/chat은 고정 데모 대화 대신 최근 대화 또는 빈 상태를 쓴다. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { location, renderAt } from '@/test/render';
import type { ChatRoomSummaryDto } from '@majayong/types/api';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const room = (over: Partial<ChatRoomSummaryDto> = {}): ChatRoomSummaryDto => ({
  id: 'application-1',
  projectId: 'project-1',
  clientUserId: 'client-1',
  supplierId: 'supplier-1',
  status: 'ACCEPTED',
  contractStatus: null,
  projectTitle: '예약 기능 개발',
  counterpartDisplayName: '상대방',
  lastMessage: null,
  unreadCount: 0,
  ...over,
});

function stubChats(rooms: ChatRoomSummaryDto[], status = 200) {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const url = String(input);
    if (url.endsWith('/api/v1/me/chats')) return jsonResponse({ data: rooms }, status);
    return jsonResponse({ data: { messages: [], unreadCount: 0 } });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('채팅 진입 인덱스', () => {
  it('의뢰인: 대화가 없으면 빈 상태를 보여 주고 고정 데모 경로로 보내지 않는다', async () => {
    stubChats([]);
    renderAt('/c/chat', 'client', undefined, 'test-token');

    expect(await screen.findByText('아직 대화가 없습니다')).toBeTruthy();
    expect(location.current).toBe('/c/chat');
  });

  it('의뢰인: 최근 대화의 프로젝트·공급자 경로로 이동한다', async () => {
    stubChats([room(), room({ id: 'application-2', projectId: 'project-2', supplierId: 'supplier-2' })]);
    renderAt('/c/chat', 'client', undefined, 'test-token');

    await waitFor(() => expect(location.current).toBe('/c/chat/project-1/supplier-1'));
  });

  it('공급자: 최근 대화의 프로젝트 경로로 이동한다', async () => {
    stubChats([room({ projectId: 'project-9', supplierId: 'supplier-9' })]);
    renderAt('/s/chat', 'supplier', undefined, 'test-token');

    await waitFor(() => expect(location.current).toBe('/s/chat/project-9'));
  });

  it('목록 요청이 실패하면 오류를 알리고 데모 경로로 보내지 않는다', async () => {
    stubChats([], 500);
    renderAt('/c/chat', 'client', undefined, 'test-token');

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(location.current).toBe('/c/chat');
  });
});

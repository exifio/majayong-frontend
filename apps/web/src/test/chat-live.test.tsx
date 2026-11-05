import { useEffect, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, DEV_SESSIONS, useSession } from '@/app/session';
import { LiveChat } from '@/pages/client/Chat-Client.live';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const room = {
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

const conversation = {
  messages: [
    {
      id: 'message-1',
      applicationId: 'application-1',
      senderId: 'client-user-1',
      kind: 'TEXT',
      body: '안녕하세요. 문의드립니다.',
      isMasked: false,
      readAt: '2026-11-05T04:39:40.675Z',
      createdAt: '2026-11-05T04:39:40.649Z',
    },
    room.lastMessage,
  ],
  unreadCount: 1,
};

function WithToken({ children }: { children: React.ReactNode }) {
  const { setApiAccessToken } = useSession();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setApiAccessToken('test-token');
    setReady(true);
  }, [setApiAccessToken]);
  return ready ? children : null;
}

function renderLiveChat() {
  return render(
    <MemoryRouter initialEntries={['/c/chat']}>
      <SessionProvider initial={DEV_SESSIONS.client}>
        <WithToken>
          <LiveChat />
        </WithToken>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('LiveChat', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('shows the API room and messages and marks the room read', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/v1/me/chats') return jsonResponse({ data: [room] });
      if (url === '/api/v1/applications/application-1/messages') return jsonResponse({ data: conversation });
      if (url === '/api/v1/applications/application-1/messages/read' && init?.method === 'POST') {
        return jsonResponse({ data: { updated: 1 } });
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });

    renderLiveChat();

    expect(await screen.findByText('안녕하세요. 문의드립니다.')).toBeTruthy();
    expect(screen.getAllByText('일정 조율 가능합니다.')).toHaveLength(2);
    expect(screen.getAllByText('공급자 supplier').length).toBeGreaterThan(0);
    await waitFor(() => expect(fetchMock.mock.calls.some(([url, init]) =>
      String(url).endsWith('/messages/read') && init?.method === 'POST')).toBe(true));
  });

  it('shows the empty state when the server returns no rooms', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));
    renderLiveChat();
    expect(await screen.findByText('대화가 없습니다.')).toBeTruthy();
  });

  it('shows the authentication error state for a 401 response', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      error: { code: 'INVALID_ACCESS_TOKEN', message: '인증 정보를 확인해 주세요.', requestId: 'request-1' },
    }, 401));
    renderLiveChat();
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText(/API 토큰 인증에 실패했습니다/)).toBeTruthy();
  });
});

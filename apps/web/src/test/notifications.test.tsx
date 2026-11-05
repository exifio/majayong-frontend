import { useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, DEV_SESSIONS, useSession } from '@/app/session';
import { Gnb } from '@/components/layout/Chrome';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const unreadNotification = {
  id: 'notification-1',
  userId: 'user-1',
  type: 'NEW_MESSAGE',
  targetUrl: '/chat/project-1:supplier-1',
  targetId: 'project-1:supplier-1',
  payload: null,
  isRead: false,
  createdAt: '2026-11-05T00:00:00.000Z',
};

function SetToken({ token }: { token: string }) {
  const { setApiAccessToken } = useSession();
  useEffect(() => setApiAccessToken(token), [setApiAccessToken, token]);
  return null;
}

function renderClientGnb(token = 'test-token') {
  return render(
    <MemoryRouter initialEntries={['/c']}>
      <SessionProvider initial={DEV_SESSIONS.client}>
        <SetToken token={token} />
        <Gnb space="client" />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('B 알림 연동 상태', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('shows loading and then the empty state from the API response', async () => {
    let complete!: (response: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise((resolve) => { complete = resolve; }));
    renderClientGnb();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: '알림' }));
    expect(screen.getByRole('status').textContent).toContain('불러오는 중');

    complete(jsonResponse({ data: [], meta: { unreadCount: 0 } }));
    expect(await screen.findByText('새 알림이 없습니다.')).toBeTruthy();
  });

  it('shows notification data mapped from the actual DTO shape', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      data: [{
        id: 'notification-1',
        userId: 'user-1',
        type: 'NEW_MESSAGE',
        targetUrl: '/chat/project-1:supplier-1',
        targetId: 'project-1:supplier-1',
        payload: null,
        isRead: false,
        createdAt: '2026-11-05T00:00:00.000Z',
      }],
      meta: { unreadCount: 1 },
    }));
    renderClientGnb();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: '알림' }));
    expect(await screen.findByText('새 메시지가 도착했습니다.')).toBeTruthy();
    expect(screen.getByRole('link', { name: /새 메시지가 도착했습니다/ }).getAttribute('href'))
      .toBe('/c/chat/project-1/supplier-1');
  });

  it('shows a distinct authentication error for 401', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      error: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.', requestId: 'req-1' },
    }, 401));
    renderClientGnb();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: '알림' }));
    expect(await screen.findByText(/API 토큰 인증에 실패했습니다/)).toBeTruthy();
  });

  it('shows a general error for a non-authentication failure', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      error: { code: 'INTERNAL_ERROR', message: '문제가 발생했습니다.', requestId: 'req-2' },
    }, 500));
    renderClientGnb();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: '알림' }));
    expect(await screen.findByText('알림을 불러오지 못했습니다.')).toBeTruthy();
  });

  it('marks one notification read with the required empty JSON body', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: [unreadNotification], meta: { unreadCount: 1 } }))
      .mockResolvedValueOnce(jsonResponse({ data: { isRead: true } }));
    renderClientGnb();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: '알림' }));
    fireEvent.click(await screen.findByRole('link', { name: /새 메시지가 도착했습니다/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const [url, init] = fetchMock.mock.calls[1]!;
    expect(url).toBe('/api/v1/me/notifications/notification-1/read');
    expect(init?.method).toBe('PATCH');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
    expect(init?.body).toBe('{}');
  });

  it('marks all notifications read through the backend operation', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: [unreadNotification], meta: { unreadCount: 1 } }))
      .mockResolvedValueOnce(jsonResponse({ data: { updated: 1 } }));
    renderClientGnb();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: '알림' }));
    fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const [url, init] = fetchMock.mock.calls[1]!;
    expect(url).toBe('/api/v1/me/notifications/read-all');
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
    expect(init?.body).toBe('{}');
  });
});

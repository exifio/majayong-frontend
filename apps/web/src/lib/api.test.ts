import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError, apiRequest } from './api';
import { registerRefreshHandler } from './auth-refresh-bridge';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const request = apiRequest as unknown as (
  operationId: string,
  path: string,
  options: RequestInit & { accessToken: string; jsonBody?: object; query?: Record<string, unknown> },
) => Promise<unknown>;

const emptyBodyOperations = [
  ['withdrawApplication', '/applications/app-1/withdraw', 'POST'],
  ['rejectApplication', '/applications/app-1/reject', 'POST'],
  ['openChat', '/applications/app-1/chat/open', 'POST'],
  ['readMessages', '/applications/app-1/messages/read', 'POST'],
  ['confirmAgreement', '/applications/app-1/agreement/confirm', 'POST'],
  ['declineContract', '/contracts/contract-1/decline', 'POST'],
  ['cancelProvisionalContract', '/contracts/contract-1/cancel-provisional', 'POST'],
  ['readNotification', '/me/notifications/notification-1/read', 'PATCH'],
  ['readAllNotifications', '/me/notifications/read-all', 'POST'],
] as const;

describe('apiRequest', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(jsonResponse({ data: {} }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    registerRefreshHandler(null);
  });

  it.each(emptyBodyOperations)('%s sends an empty JSON body', async (operationId, path, method) => {
    await request(operationId, path, { accessToken: 'test-token', method });

    const [url, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(url).toBe(`/api/v1${path}`);
    expect(init?.method).toBe(method);
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Authorization')).toBe('Bearer test-token');
    expect(init?.body).toBe('{}');
  });

  it('accepts either successful bookmark status, including 201', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { projectId: 'project-1' } }, 201));

    await expect(request('saveBookmark', '/projects/project-1/bookmark', {
      accessToken: 'test-token',
      method: 'PUT',
    })).resolves.toEqual({ data: { projectId: 'project-1' } });
  });

  it('keeps the backend authentication error details', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      error: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.', requestId: 'req-1' },
    }, 401));

    await expect(request('listNotifications', '/me/notifications', { accessToken: 'invalid-token' }))
      .rejects.toMatchObject({
        name: 'ApiRequestError',
        status: 401,
        code: 'UNAUTHENTICATED',
        requestId: 'req-1',
      });
  });

  it('uses a stable error for non-envelope server failures', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'internal' }, 500));

    const error = await request('listNotifications', '/me/notifications', { accessToken: 'test-token' })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ status: 500, code: 'HTTP_ERROR' });
  });

  it('refreshes once and retries the original request with the new token', async () => {
    let refreshCalls = 0;
    registerRefreshHandler(async () => {
      refreshCalls += 1;
      return 'fresh-token';
    });
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        error: { code: 'INVALID_ACCESS_TOKEN', message: 'expired', requestId: 'r1' },
      }, 401))
      .mockResolvedValueOnce(jsonResponse({ data: { ok: true } }));

    const result = await request('listNotifications', '/me/notifications', { accessToken: 'old-token' });

    expect(result).toEqual({ data: { ok: true } });
    expect(refreshCalls).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryHeaders = new Headers(fetchMock.mock.calls[1]![1]?.headers);
    expect(retryHeaders.get('Authorization')).toBe('Bearer fresh-token');
  });

  it('does not refresh for other 401 codes', async () => {
    let refreshCalls = 0;
    registerRefreshHandler(async () => {
      refreshCalls += 1;
      return 'fresh-token';
    });
    fetchMock.mockResolvedValueOnce(jsonResponse({
      error: { code: 'UNAUTHENTICATED', message: 'login required', requestId: 'r1' },
    }, 401));

    await expect(request('listNotifications', '/me/notifications', { accessToken: 'token' }))
      .rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
    expect(refreshCalls).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not loop when the retried request is still unauthorized', async () => {
    let refreshCalls = 0;
    registerRefreshHandler(async () => {
      refreshCalls += 1;
      return 'fresh-token';
    });
    fetchMock.mockImplementation(async () => jsonResponse({
      error: { code: 'INVALID_ACCESS_TOKEN', message: 'expired', requestId: 'r1' },
    }, 401));

    await expect(request('listNotifications', '/me/notifications', { accessToken: 'old-token' }))
      .rejects.toMatchObject({ status: 401, code: 'INVALID_ACCESS_TOKEN' });
    expect(refreshCalls).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws the original 401 when refresh fails', async () => {
    registerRefreshHandler(async () => null);
    fetchMock.mockResolvedValueOnce(jsonResponse({
      error: { code: 'INVALID_ACCESS_TOKEN', message: 'expired', requestId: 'r1' },
    }, 401));

    await expect(request('listNotifications', '/me/notifications', { accessToken: 'old-token' }))
      .rejects.toMatchObject({ status: 401, code: 'INVALID_ACCESS_TOKEN' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('serializes the notification unread filter as a query parameter', async () => {
    await request('listNotifications', '/me/notifications', {
      accessToken: 'test-token',
      query: { unreadOnly: true },
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/v1/me/notifications?unreadOnly=true');
  });
});

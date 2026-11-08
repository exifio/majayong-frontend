/* 계정 설정 실제 API — 비밀번호 · 이메일 · 구글 연결 해제 · 탈퇴 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { location, renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const errorResponse = (status: number, code: string) =>
  jsonResponse({ error: { code, message: '요청을 확인해 주세요.', requestId: 'req-1' } }, status);

const me = {
  id: 'user-1',
  email: 'owner@example.com',
  role: 'CLIENT',
  name: '정민재',
  profileImageUrl: null,
  bio: null,
  termsVersion: 'v0.7',
  termsAgreedAt: '2026-08-01T00:00:00.000Z',
  createdAt: '2026-08-01T00:00:00.000Z',
};

type Route = (url: string, init?: RequestInit) => Response | undefined;

function stubFetch(route: Route) {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
    const url = String(input);
    const hit = route(url, init);
    if (hit) return hit;
    if (url.endsWith('/api/v1/me') && (!init?.method || init.method === 'GET')) return jsonResponse({ data: me });
    return jsonResponse({ data: null });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function callTo(fetchMock: ReturnType<typeof stubFetch>, suffix: string, method: string) {
  return fetchMock.mock.calls.find(([path, init]) => String(path).endsWith(suffix) && init?.method === method);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LiveAccountSettings — 계정 설정 실제 API', () => {
  it('GET /me의 이메일·이름과 알림 설정 저장 버튼을 보여 준다', async () => {
    stubFetch((url) => url.endsWith('/me/notification-settings')
      ? jsonResponse({
          data: {
            contract: true, chat: true, recruiting: true,
            review: true, support: true, marketing: false,
          },
        })
      : undefined);
    const { container } = renderAt('/c/account', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Client"]') as HTMLElement;

    expect(await within(root).findByText('owner@example.com')).toBeTruthy();
    expect(within(root).getByText('정민재')).toBeTruthy();
    expect(await within(root).findByRole('button', { name: '알림 설정 저장' })).toBeTruthy();
    expect(within(root).getByText('계약·예치·검수·정산')).toBeTruthy();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('비밀번호 바꾸기: 규칙을 먼저 확인하고 POST /me/password/change 성공을 띠로 알린다', async () => {
    const fetchMock = stubFetch((url, init) =>
      url.endsWith('/me/password/change') && init?.method === 'POST'
        ? jsonResponse({ data: { passwordChanged: true } })
        : undefined);
    const { container } = renderAt('/c/account', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Client"]') as HTMLElement;
    fireEvent.click(await within(root).findByRole('button', { name: '비밀번호 바꾸기' }));

    const dialog = screen.getByRole('dialog', { name: '비밀번호 바꾸기' });
    fireEvent.change(within(dialog).getByLabelText('현재 비밀번호'), { target: { value: 'oldpass123' } });
    fireEvent.change(within(dialog).getByLabelText('새 비밀번호'), { target: { value: 'short' } });
    fireEvent.change(within(dialog).getByLabelText('새 비밀번호 한 번 더'), { target: { value: 'short' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '비밀번호 저장' }));
    expect(within(dialog).getByText('8자 이상이어야 합니다')).toBeTruthy();
    expect(callTo(fetchMock, '/me/password/change', 'POST')).toBeUndefined();

    fireEvent.change(within(dialog).getByLabelText('새 비밀번호'), { target: { value: 'newpass123' } });
    fireEvent.change(within(dialog).getByLabelText('새 비밀번호 한 번 더'), { target: { value: 'newpass123' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '비밀번호 저장' }));

    expect(await within(root).findByText('비밀번호를 바꿨습니다')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
    const call = callTo(fetchMock, '/me/password/change', 'POST');
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ currentPassword: 'oldpass123', newPassword: 'newpass123' });
  });

  it('비밀번호 바꾸기: 현재 비밀번호가 틀리면 모달 안에 오류를 보여 준다', async () => {
    stubFetch((url) => (url.endsWith('/me/password/change') ? errorResponse(401, 'INVALID_CREDENTIALS') : undefined));
    const { container } = renderAt('/c/account', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Client"]') as HTMLElement;
    fireEvent.click(await within(root).findByRole('button', { name: '비밀번호 바꾸기' }));
    const dialog = screen.getByRole('dialog', { name: '비밀번호 바꾸기' });
    fireEvent.change(within(dialog).getByLabelText('현재 비밀번호'), { target: { value: 'wrongpass1' } });
    fireEvent.change(within(dialog).getByLabelText('새 비밀번호'), { target: { value: 'newpass123' } });
    fireEvent.change(within(dialog).getByLabelText('새 비밀번호 한 번 더'), { target: { value: 'newpass123' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '비밀번호 저장' }));

    expect((await within(dialog).findByRole('alert')).textContent).toBe('현재 비밀번호가 맞지 않습니다.');
  });

  it('이메일 바꾸기: POST /me/email/change-request 후 인증 메일을 보냈다고 알린다', async () => {
    const fetchMock = stubFetch((url) =>
      url.endsWith('/me/email/change-request') ? jsonResponse({ data: { requested: true } }) : undefined);
    const { container } = renderAt('/c/account', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Client"]') as HTMLElement;
    fireEvent.click(await within(root).findByRole('button', { name: '바꾸기' }));

    const dialog = screen.getByRole('dialog', { name: '계정 이메일 바꾸기' });
    expect(within(dialog).queryByLabelText('현재 비밀번호')).toBeNull();
    fireEvent.change(within(dialog).getByLabelText('새 이메일'), { target: { value: 'next@example.com' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '인증 메일 보내기' }));

    expect(await within(root).findByText('인증 메일을 보냈습니다')).toBeTruthy();
    expect(within(root).getByText(/next@example\.com로 보낸 메일의 링크/)).toBeTruthy();
    const call = callTo(fetchMock, '/me/email/change-request', 'POST');
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ email: 'next@example.com' });
  });

  it('이메일 바꾸기: 메일 발송을 쓸 수 없으면(503) 보냈다고 표시하지 않는다', async () => {
    stubFetch((url) => (url.endsWith('/me/email/change-request') ? errorResponse(503, 'DELIVERY_UNAVAILABLE') : undefined));
    const { container } = renderAt('/c/account', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Client"]') as HTMLElement;
    fireEvent.click(await within(root).findByRole('button', { name: '바꾸기' }));
    const dialog = screen.getByRole('dialog', { name: '계정 이메일 바꾸기' });
    fireEvent.change(within(dialog).getByLabelText('새 이메일'), { target: { value: 'next@example.com' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '인증 메일 보내기' }));

    expect((await within(dialog).findByRole('alert')).textContent).toMatch(/지금은 인증 메일을 보낼 수 없습니다/);
    expect(within(root).queryByText('인증 메일을 보냈습니다')).toBeNull();
  });

  it('구글 연결 해제: 비밀번호를 보내고, 연결돼 있지 않으면(409) 그 이유를 보여 준다', async () => {
    const fetchMock = stubFetch((url) =>
      url.endsWith('/me/google/disconnect') ? errorResponse(409, 'GOOGLE_NOT_CONNECTED') : undefined);
    const { container } = renderAt('/s/account', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Supplier"]') as HTMLElement;
    fireEvent.click(await within(root).findByRole('button', { name: '연결 해제' }));

    const dialog = screen.getByRole('dialog', { name: '구글 연결을 해제할까요?' });
    expect(dialog.querySelector('[data-btn="primary"]')).toBeNull();
    fireEvent.change(within(dialog).getByLabelText('비밀번호'), { target: { value: 'password1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '연결 해제' }));

    expect((await within(dialog).findByRole('alert')).textContent).toBe('이 계정에는 구글이 연결되어 있지 않습니다.');
    const call = callTo(fetchMock, '/me/google/disconnect', 'POST');
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ password: 'password1' });
  });

  it('탈퇴: 진행 중 계약(409 ACTIVE_CONTRACTS_EXIST)이면 탈퇴할 수 없다고 안내하고 내 계약으로 연결한다', async () => {
    const fetchMock = stubFetch((url, init) =>
      url.endsWith('/api/v1/me') && init?.method === 'DELETE' ? errorResponse(409, 'ACTIVE_CONTRACTS_EXIST') : undefined);
    const { container } = renderAt('/s/account', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Supplier"]') as HTMLElement;
    fireEvent.click(await within(root).findByRole('button', { name: '탈퇴하기' }));

    const confirm = screen.getByRole('dialog', { name: '정말 탈퇴할까요?' });
    fireEvent.click(within(confirm).getByRole('button', { name: '탈퇴하기' }));

    const blocked = await screen.findByRole('dialog', { name: '지금은 탈퇴할 수 없습니다' });
    expect(within(blocked).getByText(/진행 중인 계약이 있습니다/)).toBeTruthy();
    expect(within(blocked).getByRole('link', { name: '내 계약 보기' }).getAttribute('href')).toBe('/s/contracts');
    expect(callTo(fetchMock, '/api/v1/me', 'DELETE')).toBeTruthy();
    expect(location.current).toBe('/s/account');
  });

  it('탈퇴: 성공하면 세션을 정리하고 홈으로 이동한다', async () => {
    const fetchMock = stubFetch((url, init) =>
      url.endsWith('/api/v1/me') && init?.method === 'DELETE'
        ? jsonResponse({ data: { withdrawnAt: '2026-11-08T00:00:00.000Z' } })
        : undefined);
    const { container } = renderAt('/c/account', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Client"]') as HTMLElement;
    fireEvent.click(await within(root).findByRole('button', { name: '탈퇴하기' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: '정말 탈퇴할까요?' })).getByRole('button', { name: '탈퇴하기' }));

    await waitFor(() => expect(location.current).toBe('/'));
    expect(callTo(fetchMock, '/api/v1/me', 'DELETE')).toBeTruthy();
  });

  it('?mock=이 있으면 토큰이 있어도 보드 시연을 그린다', () => {
    const fetchMock = stubFetch(() => undefined);
    renderAt(`/c/account?mock=${encodeURIComponent('탈퇴 확인')}`, 'client', undefined, 'test-token');
    expect(screen.getByRole('dialog', { name: '지금은 탈퇴할 수 없습니다' })).toBeTruthy();
    expect(fetchMock.mock.calls.some(([path]) => String(path).endsWith('/api/v1/me'))).toBe(false);
  });
});

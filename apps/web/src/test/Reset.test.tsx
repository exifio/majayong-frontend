/* 비밀번호 재설정 Reset — F-06 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/public/Reset.data';
import { location, renderAt } from './render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Reset — 비밀번호 재설정', () => {
  it('처음에는 이메일이 비어 있다', () => {
    const { container } = renderAt('/reset', 'guest');
    const root = container.querySelector('[data-screen="Reset"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.askTitle })).toBeTruthy();
    expect((within(root).getByLabelText(DEMO.email) as HTMLInputElement).value).toBe('');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('이메일을 보내면 재설정 요청 API를 호출하고 메일 보냄 화면으로 이동한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: { requested: true } }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/reset', 'guest');
    const root = container.querySelector('[data-screen="Reset"]') as HTMLElement;

    fireEvent.change(within(root).getByLabelText(DEMO.email), { target: { value: 'minjae@example.com' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.send }));

    expect(await screen.findByRole('heading', { level: 1, name: DEMO.sentTitle })).toBeTruthy();
    const [path, init] = fetchMock.mock.calls[0]!;
    expect(path).toBe('/api/v1/auth/password-reset/request');
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'minjae@example.com' });
  });

  it('메일 발송을 사용할 수 없으면 서버 안내를 보여 주고 입력 화면에 머문다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: { code: 'DELIVERY_UNAVAILABLE', message: '인증 메일 발송을 사용할 수 없습니다.', requestId: 'r1' },
    }, 503)));
    const { container } = renderAt('/reset', 'guest');
    const root = container.querySelector('[data-screen="Reset"]') as HTMLElement;

    fireEvent.change(within(root).getByLabelText(DEMO.email), { target: { value: 'minjae@example.com' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.send }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('인증 메일 발송을 사용할 수 없습니다');
    expect(location.current).toBe('/reset');
  });

  it('토큰 링크로 들어오면 새 비밀번호를 확정하고 완료 화면으로 이동한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: { passwordReset: true } }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/reset?token=token-1', 'guest');
    const root = container.querySelector('[data-screen="Reset"]') as HTMLElement;

    fireEvent.change(within(root).getByLabelText(DEMO.pw), { target: { value: 'newpass1234' } });
    fireEvent.change(within(root).getByLabelText(DEMO.pwConfirm), { target: { value: 'newpass1234' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.change }));

    expect(await screen.findByRole('heading', { level: 1, name: DEMO.doneTitle })).toBeTruthy();
    const [path, init] = fetchMock.mock.calls[0]!;
    expect(path).toBe('/api/v1/auth/password-reset/confirm');
    expect(JSON.parse(String(init?.body))).toEqual({ token: 'token-1', newPassword: 'newpass1234' });
  });

  it('만료되었거나 잘못된 토큰이면 링크 만료 화면을 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: { code: 'RESET_TOKEN_INVALID', message: '인증 정보를 확인해 주세요.', requestId: 'r1' },
    }, 401)));
    const { container } = renderAt('/reset?token=expired', 'guest');
    const root = container.querySelector('[data-screen="Reset"]') as HTMLElement;

    fireEvent.change(within(root).getByLabelText(DEMO.pw), { target: { value: 'newpass1234' } });
    fireEvent.change(within(root).getByLabelText(DEMO.pwConfirm), { target: { value: 'newpass1234' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.change }));

    expect(await screen.findByRole('heading', { level: 1, name: DEMO.expiredTitle })).toBeTruthy();
    await waitFor(() => expect(location.current).toBe('/reset'));
  });

  it('새 비밀번호 형식 오류', () => {
    const { container } = renderAt('/reset?token=token-1', 'guest');
    const root = container.querySelector('[data-screen="Reset"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(DEMO.pw), { target: { value: 'short' } });
    fireEvent.change(within(root).getByLabelText(DEMO.pwConfirm), { target: { value: 'short' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.change }));
    expect(within(root).getByText(DEMO.pwShort)).toBeTruthy();
  });
});

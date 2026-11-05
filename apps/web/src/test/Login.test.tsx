/* 로그인 모달 Login — 실제 인증 API 연결 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { location, renderAt } from './render';
import { DEMO } from '@/pages/public/Login.data';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Login — 로그인 모달', () => {
  it('의뢰인 랜딩: 실제 입력 폼과 링크', () => {
    renderAt('/?modal=login', 'guest');
    const dialog = screen.getByRole('dialog', { name: '로그인' });
    expect(within(dialog).getByText(DEMO.headingClient)).toBeTruthy();
    expect(within(dialog).getByLabelText(/이메일/)).toBeTruthy();
    expect(within(dialog).getByLabelText(/비밀번호/)).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: DEMO.submit }).getAttribute('data-btn')).toBe('primary');
    expect(within(dialog).getByRole('link', { name: DEMO.reset }).getAttribute('href')).toBe('/reset');
    expect(within(dialog).getByRole('link', { name: DEMO.signup }).getAttribute('href')).toBe('/signup');
  });

  it('공급자 랜딩 문구', () => {
    renderAt('/supplier?modal=login', 'guest');
    const dialog = screen.getByRole('dialog', { name: '로그인' });
    expect(within(dialog).getByText(DEMO.headingSupplier)).toBeTruthy();
  });

  it('로그인 실패는 서버 오류를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: { code: 'INVALID_CREDENTIALS', message: '인증 정보를 확인해 주세요.', requestId: 'r1' },
    }, 401)));
    renderAt('/?modal=login', 'guest');
    const dialog = screen.getByRole('dialog', { name: '로그인' });
    fireEvent.change(within(dialog).getByLabelText(/이메일/), { target: { value: 'user@example.invalid' } });
    fireEvent.change(within(dialog).getByLabelText(/비밀번호/), { target: { value: 'wrong-password' } });
    fireEvent.click(within(dialog).getByRole('button', { name: DEMO.submit }));

    expect(await within(dialog).findByText('이메일 또는 비밀번호를 확인해 주세요.')).toBeTruthy();
  });

  it('로그인 성공 시 역할 홈으로 이동한다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      data: {
        user: { id: 'supplier-1', email: 'supplier@example.invalid', role: 'SUPPLIER' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        accessExpiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      },
    })));
    renderAt('/supplier?modal=login', 'guest');
    const dialog = screen.getByRole('dialog', { name: '로그인' });
    fireEvent.change(within(dialog).getByLabelText(/이메일/), { target: { value: 'supplier@example.invalid' } });
    fireEvent.change(within(dialog).getByLabelText(/비밀번호/), { target: { value: 'password1234' } });
    fireEvent.click(within(dialog).getByRole('button', { name: DEMO.submit }));

    await waitFor(() => expect(location.current.startsWith('/s')).toBe(true));
  });
});

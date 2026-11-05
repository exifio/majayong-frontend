/* 회원가입 ③ 공급자 프로필 Signup-Supplier — F-07 · F-21 · 7.2 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/public/Signup-Supplier.data';
import { location, renderAt } from './render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const signupSession = (role: 'CLIENT' | 'SUPPLIER') => jsonResponse({
  data: {
    user: { id: 'user-1', email: 'junho@example.invalid', role },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    accessExpiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  },
}, 201);

function seedSignupInput(email = 'junho@example.invalid', password = 'password1234') {
  window.sessionStorage.setItem('mj.signup.email', email);
  window.sessionStorage.setItem('mj.signup.password', password);
  window.sessionStorage.setItem('mj.signup.terms', 'v0.7');
  window.sessionStorage.setItem('mj.signup.role', 'SUPPLIER');
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

describe('Signup-Supplier — 회원가입 ③ 공급자 프로필', () => {
  it('3단계 · SelectCards · ConfirmCheck · 가입 완료 → POST /api/v1/auth/register 호출 후 /s 이동', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(signupSession('SUPPLIER'));
    vi.stubGlobal('fetch', fetchMock);
    seedSignupInput();

    const { container } = renderAt('/signup/supplier', 'signup');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getByLabelText('가입 단계')).toBeTruthy();
    expect(within(root).getByLabelText(DEMO.typeLabel)).toBeTruthy();
    expect(within(root).getByText(DEMO.agreeTitle)).toBeTruthy();
    const submit = within(root).getByRole('button', { name: DEMO.submit });
    expect(submit.getAttribute('data-btn')).toBe('primary');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);

    fireEvent.click(submit);

    await waitFor(() => expect(location.current.startsWith('/s')).toBe(true));
    const [path, init] = fetchMock.mock.calls[0]!;
    expect(path).toBe('/api/v1/auth/register');
    expect(JSON.parse(String(init?.body))).toEqual({
      email: 'junho@example.invalid',
      password: 'password1234',
      role: 'SUPPLIER',
      termsVersion: 'v0.7',
    });
    expect(window.sessionStorage.getItem('mj.signup.password')).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('나중에 입력하기: 약관 동의 상태면 POST /api/v1/auth/register 호출 후 /s 이동', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(signupSession('SUPPLIER'));
    vi.stubGlobal('fetch', fetchMock);
    seedSignupInput();

    const { container } = renderAt('/signup/supplier', 'signup');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(new RegExp(DEMO.name)), { target: { value: '' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.skip }));

    await waitFor(() => expect(location.current.startsWith('/s')).toBe(true));
    const [path] = fetchMock.mock.calls[0]!;
    expect(path).toBe('/api/v1/auth/register');
  });

  it('동의 빠지면 disabledReason', () => {
    const { container } = renderAt('/signup/supplier', 'signup');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;
    const checks = within(root).getAllByRole('checkbox');
    fireEvent.click(checks[0]!);
    const submit = within(root).getByRole('button', { name: DEMO.submit });
    expect(submit.hasAttribute('disabled')).toBe(true);
    expect(within(root).getByText(DEMO.agreeNeed)).toBeTruthy();
  });

  it('활동 이름 비우면 폼 오류', () => {
    seedSignupInput();
    const { container } = renderAt('/signup/supplier', 'signup');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(new RegExp(DEMO.name)), { target: { value: '' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));
    expect(within(root).getByText(DEMO.nameError)).toBeTruthy();
    expect(location.current.startsWith('/signup/supplier')).toBe(true);
  });

  it('이미 가입된 이메일: 서버 409를 안내로 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: { code: 'EMAIL_ALREADY_REGISTERED', message: '현재 상태에서는 요청을 완료할 수 없습니다.', requestId: 'r1' },
    }, 409)));
    seedSignupInput();
    renderAt('/signup/supplier', 'signup');

    fireEvent.click(screen.getByRole('button', { name: DEMO.submit }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('이미 가입된 이메일입니다');
  });
});

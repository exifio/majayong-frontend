/* 회원가입 ② 역할 Signup-Role — F-06 · F-07 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { location, renderAt } from './render';
import { DEMO, roleDemoOf } from '@/pages/public/Signup-Role.data';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const signupSession = (role: 'CLIENT' | 'SUPPLIER') => jsonResponse({
  data: {
    user: { id: 'user-1', email: 'minjae.ondo@example.invalid', role },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    accessExpiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  },
}, 201);

function seedSignupInput(email = 'minjae.ondo@example.invalid', password = 'password1234') {
  window.sessionStorage.setItem('mj.signup.email', email);
  window.sessionStorage.setItem('mj.signup.password', password);
  window.sessionStorage.setItem('mj.signup.terms', 'v0.7');
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

describe('Signup-Role — 회원가입 ② 역할', () => {
  it('의뢰인 선택: 스텝 · SelectCards · Note · primary 다음', () => {
    const { container } = renderAt('/signup/role', 'signup');
    const root = container.querySelector('[data-screen="Signup-Role"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getByLabelText('가입 단계')).toBeTruthy();
    expect(within(root).getByText(DEMO.clientDesc)).toBeTruthy();
    expect(within(root).getByText(DEMO.noteTitle)).toBeTruthy();
    const next = within(root).getByRole('button', { name: DEMO.next });
    expect(next.getAttribute('data-btn')).toBe('primary');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('의뢰인 선택 후 다음: 의뢰인 프로필(/signup/client)로 이동한다', async () => {
    seedSignupInput();
    renderAt('/signup/role', 'signup');

    fireEvent.click(screen.getByRole('button', { name: DEMO.next }));

    expect(location.current.startsWith('/signup/client')).toBe(true);
    expect(window.sessionStorage.getItem('mj.signup.role')).toBe('CLIENT');
  });

  it('공급자 선택 후 다음: 공급자 프로필(/signup/supplier)로 이동한다', async () => {
    seedSignupInput();
    renderAt(`/signup/role?mock=${encodeURIComponent('공급자 선택')}`, 'signup');

    fireEvent.click(screen.getByRole('button', { name: DEMO.next }));

    expect(location.current.startsWith('/signup/supplier')).toBe(true);
    expect(window.sessionStorage.getItem('mj.signup.role')).toBe('SUPPLIER');
  });

  it('이메일·비밀번호 없이 진입: 가입을 호출하지 않고 다시 입력하라고 안내한다', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    renderAt('/signup/role', 'signup');

    fireEvent.click(screen.getByRole('button', { name: DEMO.next }));

    expect((await screen.findByRole('alert')).textContent).toContain('다시 입력해 주세요');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(location.current.startsWith('/signup/role')).toBe(true);
  });

  it('구글 가입: 구글 계정 안내 줄', () => {
    const { container } = renderAt(
      `/signup/role?mock=${encodeURIComponent('구글 가입')}`,
      'signup',
    );
    const root = container.querySelector('[data-screen="Signup-Role"]') as HTMLElement;
    expect(within(root).getByText(DEMO.googleAcct)).toBeTruthy();
  });

  it('시연 데이터', () => {
    expect(roleDemoOf('의뢰인 선택').role).toBe('client');
    expect(roleDemoOf('구글 가입').google).toBe(true);
  });
});

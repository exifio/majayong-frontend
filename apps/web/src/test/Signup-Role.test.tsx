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

  it('의뢰인 가입: 저장한 이메일·비밀번호로 /auth/register를 호출하고 프로필 단계로 이동한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(signupSession('CLIENT'));
    vi.stubGlobal('fetch', fetchMock);
    seedSignupInput();
    renderAt('/signup/role', 'signup');

    fireEvent.click(screen.getByRole('button', { name: DEMO.next }));

    await waitFor(() => expect(location.current.startsWith('/signup/client')).toBe(true));
    const [path, init] = fetchMock.mock.calls[0]!;
    expect(path).toBe('/api/v1/auth/register');
    expect(JSON.parse(String(init?.body))).toEqual({
      email: 'minjae.ondo@example.invalid',
      password: 'password1234',
      role: 'CLIENT',
      termsVersion: 'v0.7',
    });
    expect(window.sessionStorage.getItem('mj.signup.password')).toBeNull();
  });

  it('공급자 가입: SUPPLIER 역할로 가입하고 프로필 단계로 이동한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(signupSession('SUPPLIER'));
    vi.stubGlobal('fetch', fetchMock);
    seedSignupInput();
    renderAt(`/signup/role?mock=${encodeURIComponent('공급자 선택')}`, 'signup');

    fireEvent.click(screen.getByRole('button', { name: DEMO.next }));

    await waitFor(() => expect(location.current.startsWith('/signup/supplier')).toBe(true));
    const [, init] = fetchMock.mock.calls[0]!;
    expect(JSON.parse(String(init?.body)).role).toBe('SUPPLIER');
  });

  it('이미 가입된 이메일: 서버 409를 안내로 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: { code: 'EMAIL_ALREADY_REGISTERED', message: '현재 상태에서는 요청을 완료할 수 없습니다.', requestId: 'r1' },
    }, 409)));
    seedSignupInput();
    renderAt('/signup/role', 'signup');

    fireEvent.click(screen.getByRole('button', { name: DEMO.next }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('이미 가입된 이메일입니다');
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

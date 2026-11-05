/* 회원가입 ③ 의뢰인 프로필 Signup-Client — F-07 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/public/Signup-Client.data';
import { location, renderAt } from './render';

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
  window.sessionStorage.setItem('mj.signup.role', 'CLIENT');
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

describe('Signup-Client — 회원가입 ③ 의뢰인 프로필', () => {
  it('3단계 진행 · 상호 · 가입 완료 → POST /api/v1/auth/register 호출 후 /c 이동', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(signupSession('CLIENT'));
    vi.stubGlobal('fetch', fetchMock);
    seedSignupInput();

    const { container } = renderAt('/signup/client', 'signup');
    const root = container.querySelector('[data-screen="Signup-Client"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getByLabelText('가입 단계')).toBeTruthy();
    expect(within(root).getByLabelText(/상호/)).toBeTruthy();
    expect(within(root).queryByLabelText(/연락처|전화/)).toBeNull();
    const submit = within(root).getByRole('button', { name: DEMO.submit });
    expect(submit.getAttribute('data-btn')).toBe('primary');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);

    fireEvent.click(submit);

    await waitFor(() => expect(location.current.startsWith('/c')).toBe(true));
    const [path, init] = fetchMock.mock.calls[0]!;
    expect(path).toBe('/api/v1/auth/register');
    expect(JSON.parse(String(init?.body))).toEqual({
      email: 'minjae.ondo@example.invalid',
      password: 'password1234',
      role: 'CLIENT',
      termsVersion: 'v0.7',
    });
    expect(window.sessionStorage.getItem('mj.signup.password')).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('나중에 입력하기: 상호 없이도 POST /api/v1/auth/register 호출 후 /c 이동', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(signupSession('CLIENT'));
    vi.stubGlobal('fetch', fetchMock);
    seedSignupInput();

    const { container } = renderAt('/signup/client', 'signup');
    const root = container.querySelector('[data-screen="Signup-Client"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(/상호/), { target: { value: '' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.skip }));

    await waitFor(() => expect(location.current.startsWith('/c')).toBe(true));
    const [path] = fetchMock.mock.calls[0]!;
    expect(path).toBe('/api/v1/auth/register');
  });

  it('상호 비우면 폼 오류', () => {
    seedSignupInput();
    const { container } = renderAt('/signup/client', 'signup');
    const root = container.querySelector('[data-screen="Signup-Client"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(/상호/), { target: { value: '' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));
    expect(within(root).getByText(DEMO.bizError)).toBeTruthy();
    expect(location.current.startsWith('/signup/client')).toBe(true);
  });

  it('이미 가입된 이메일: 서버 409를 안내로 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: { code: 'EMAIL_ALREADY_REGISTERED', message: '현재 상태에서는 요청을 완료할 수 없습니다.', requestId: 'r1' },
    }, 409)));
    seedSignupInput();
    renderAt('/signup/client', 'signup');

    fireEvent.click(screen.getByRole('button', { name: DEMO.submit }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('이미 가입된 이메일입니다');
  });

  it('이메일·비밀번호 없이 진입 시 안내 문구', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    renderAt('/signup/client', 'signup');

    fireEvent.click(screen.getByRole('button', { name: DEMO.submit }));

    expect((await screen.findByRole('alert')).textContent).toContain('다시 입력해 주세요');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

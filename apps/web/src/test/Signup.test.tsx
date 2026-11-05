/* 회원가입 ① 계정 Signup — F-06 · 7.2 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { location, renderAt } from './render';
import { DEMO, signupDemoOf } from '@/pages/public/Signup.data';

describe('Signup — 회원가입 ① 계정', () => {
  it('기본: 스텝 · 구글 · 필드 · 약관 4 · primary 다음', () => {
    const { container } = renderAt('/signup', 'guest');
    const root = container.querySelector('[data-screen="Signup"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getByLabelText('가입 단계')).toBeTruthy();
    expect(within(root).getByRole('button', { name: DEMO.google })).toBeTruthy();
    expect(within(root).getByLabelText(/이메일/)).toBeTruthy();
    expect(within(root).getAllByLabelText(/비밀번호/).length).toBeGreaterThanOrEqual(2);
    const views = within(root).getAllByRole('link', { name: '보기' });
    expect(views).toHaveLength(4);
    for (const t of DEMO.terms) {
      expect(views.some((a) => a.getAttribute('href') === t.href)).toBe(true);
    }
    const next = within(root).getByRole('button', { name: DEMO.next });
    expect(next.getAttribute('data-btn')).toBe('primary');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('다음: signup 세션 후 /signup/role', () => {
    const { container } = renderAt('/signup', 'guest');
    const root = container.querySelector('[data-screen="Signup"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(/이메일/), { target: { value: 'test@example.com' } });
    const pwInputs = within(root).getAllByLabelText(/비밀번호/);
    fireEvent.change(pwInputs[0]!, { target: { value: 'password1234' } });
    fireEvent.change(pwInputs[1]!, { target: { value: 'password1234' } });
    const checks = within(root).getAllByRole('checkbox');
    for (const c of checks) {
      fireEvent.click(c);
    }
    fireEvent.click(within(root).getByRole('button', { name: DEMO.next }));
    expect(location.current.startsWith('/signup/role')).toBe(true);
  });

  it('이미 가입된 이메일: 오류 · 로그인하기', () => {
    const { container } = renderAt(
      `/signup?mock=${encodeURIComponent('이미 가입된 이메일')}`,
      'guest',
    );
    const root = container.querySelector('[data-screen="Signup"]') as HTMLElement;
    expect(within(root).getByText(DEMO.dupError)).toBeTruthy();
    const login = within(root).getByRole('link', { name: DEMO.loginLink });
    expect(login.getAttribute('href')).toBe('/?modal=login');
    expect(within(root).getByRole('button', { name: DEMO.next }).hasAttribute('disabled')).toBe(true);
  });

  it('시연 데이터', () => {
    expect(signupDemoOf('기본').dup).toBe(false);
    expect(signupDemoOf('이미 가입된 이메일').dup).toBe(true);
  });
});

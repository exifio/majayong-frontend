/* 회원가입 ② 역할 Signup-Role — F-06 · F-07 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { location, renderAt } from './render';
import { DEMO, roleDemoOf } from '@/pages/public/Signup-Role.data';

describe('Signup-Role — 회원가입 ② 역할', () => {
  it('의뢰인 선택: 스텝 · SelectCards · Note · primary 다음 → /signup/client', () => {
    const { container } = renderAt('/signup/role', 'signup');
    const root = container.querySelector('[data-screen="Signup-Role"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getByLabelText('가입 단계')).toBeTruthy();
    expect(within(root).getByText(DEMO.clientDesc)).toBeTruthy();
    expect(within(root).getByText(DEMO.noteTitle)).toBeTruthy();
    const next = within(root).getByRole('button', { name: DEMO.next });
    expect(next.getAttribute('data-btn')).toBe('primary');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    fireEvent.click(next);
    expect(location.current.startsWith('/signup/client')).toBe(true);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('공급자 선택: 다음 → /signup/supplier', () => {
    renderAt(`/signup/role?mock=${encodeURIComponent('공급자 선택')}`, 'signup');
    fireEvent.click(screen.getByRole('button', { name: DEMO.next }));
    expect(location.current.startsWith('/signup/supplier')).toBe(true);
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

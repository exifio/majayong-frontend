/* 회원가입 ③ 공급자 프로필 Signup-Supplier — F-07 · F-21 · 7.2 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/public/Signup-Supplier.data';
import { location, renderAt } from './render';

describe('Signup-Supplier — 회원가입 ③ 공급자 프로필', () => {
  it('3단계 · SelectCards · ConfirmCheck · 가입 완료 → /s', () => {
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
    expect(location.current.startsWith('/s')).toBe(true);
    expect(findDesignViolations(container)).toEqual([]);
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
});

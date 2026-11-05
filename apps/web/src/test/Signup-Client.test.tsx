/* 회원가입 ③ 의뢰인 프로필 Signup-Client — F-07 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/public/Signup-Client.data';
import { location, renderAt } from './render';

describe('Signup-Client — 회원가입 ③ 의뢰인 프로필', () => {
  it('3단계 진행 · 상호 · 가입 완료 → /c', () => {
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
    expect(location.current.startsWith('/c')).toBe(true);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('상호 비우면 폼 오류', () => {
    const { container } = renderAt('/signup/client', 'signup');
    const root = container.querySelector('[data-screen="Signup-Client"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(/상호/), { target: { value: '' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));
    expect(within(root).getByText(DEMO.bizError)).toBeTruthy();
    expect(location.current.startsWith('/signup/client')).toBe(true);
  });
});

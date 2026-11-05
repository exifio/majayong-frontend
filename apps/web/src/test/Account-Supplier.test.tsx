/* 공급자 계정 설정 Account-Supplier — F-28 · F-29 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/supplier/Account-Supplier.data';
import { location, renderAt } from './render';

describe('Account-Supplier — 공급자 계정 설정', () => {
  it('기본 줄 · 정산 계좌 마스킹', () => {
    const { container } = renderAt('/s/account', 'supplier');
    const root = container.querySelector('[data-screen="Account-Supplier"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(within(root).getByText(DEMO.bankValue)).toBeTruthy();
    expect(within(root).getByRole('button', { name: DEMO.leaveBtn }).getAttribute('data-btn')).toBe(
      'warn',
    );
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('계좌 바꾸기 Modal', () => {
    renderAt(`/s/account?mock=${encodeURIComponent('계좌 바꾸기')}`, 'supplier');
    expect(screen.getByRole('dialog', { name: DEMO.bankModalTitle })).toBeTruthy();
    expect(screen.getByText(/다음 정산부터/)).toBeTruthy();
    expect(screen.getByRole('button', { name: DEMO.bankSave }).getAttribute('data-btn')).toBe(
      'primary',
    );
  });

  it('탈퇴 ConfirmDialog · 비밀번호 완료 띠', () => {
    const { container } = renderAt('/s/account', 'supplier');
    fireEvent.click(within(container.querySelector('[data-screen="Account-Supplier"]') as HTMLElement).getByRole('button', { name: DEMO.leaveBtn }));
    expect(location.current).toContain(encodeURIComponent('탈퇴 확인'));
    expect(screen.getByRole('dialog', { name: DEMO.leaveTitle })).toBeTruthy();

    const { container: c2 } = renderAt(
      `/s/account?mock=${encodeURIComponent('비밀번호 변경 완료')}`,
      'supplier',
    );
    expect(c2.querySelector('[data-band="done"]')).toBeTruthy();
  });
});

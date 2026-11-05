/* 공급자 계정 설정 Account-Supplier — F-28 · F-29 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/supplier/Account-Supplier.data';
import { location, renderAt } from './render';

describe('Account-Supplier — 공급자 계정 설정', () => {
  it('기본 줄 · 증빙·정산 정보 폼', () => {
    const { container } = renderAt('/s/account', 'supplier');
    const root = container.querySelector('[data-screen="Account-Supplier"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(within(root).getByRole('heading', { name: '증빙 · 정산 정보' })).toBeTruthy();
    expect(within(root).getByLabelText('사업자등록번호')).toBeTruthy();
    expect(within(root).getByLabelText('계좌번호')).toBeTruthy();
    expect(within(root).getByRole('button', { name: '계좌 저장' })).toBeTruthy();
    expect(within(root).getByRole('button', { name: DEMO.leaveBtn }).getAttribute('data-btn')).toBe(
      'warn',
    );
    expect(findDesignViolations(container)).toEqual([]);
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

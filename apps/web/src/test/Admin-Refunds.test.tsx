/* 환불 처리 Admin-Refunds — F-27 · F-26 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/admin/Admin-Refunds.data';
import { renderAt } from './render';

describe('Admin-Refunds — 환불 처리', () => {
  it('처리 대기 · 정산안 Money · 환불 확정 primary 하나', () => {
    const { container } = renderAt(`/admin/refunds?mock=${encodeURIComponent('처리 대기')}&id=rf-1`, 'admin');
    const root = container.querySelector('[data-screen="Admin-Refunds"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(within(root).getAllByText(/2,441,250원/).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(/736,250원/).length).toBeGreaterThan(0);
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(within(root).getByRole('button', { name: DEMO.confirm })).toBeTruthy();
    expect(within(root).queryByText(/데이터 값/)).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('사유 다툼 판정 · SelectCards · 사유 필수', () => {
    renderAt(`/admin/refunds?mock=${encodeURIComponent('사유 다툼 판정')}&id=rf-2`, 'admin');
    const dialogRoot = screen.getByRole('heading', { name: /주문 접수/ }).closest('aside')!;
    expect(within(dialogRoot).getByRole('radio', { name: /의뢰인 사정/ })).toBeTruthy();
    expect(within(dialogRoot).getByRole('radio', { name: /공급자 사정/ })).toBeTruthy();
    fireEvent.change(within(dialogRoot).getByLabelText(/판정 사유/), { target: { value: '' } });
    expect(within(dialogRoot).getByRole('button', { name: DEMO.judgeConfirm }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(within(dialogRoot).getByText(DEMO.eventNote)).toBeTruthy();
  });

  it('처리 완료 · teal 띠', () => {
    renderAt(`/admin/refunds?mock=${encodeURIComponent('처리 완료')}&id=rf-done`, 'admin');
    expect(screen.getByText(/정산 처리를 마쳤습니다/)).toBeTruthy();
  });
});

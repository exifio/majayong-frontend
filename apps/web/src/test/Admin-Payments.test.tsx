/* 보류된 결제 Admin-Payments — F-27 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/admin/Admin-Payments.data';
import { renderAt } from './render';

describe('Admin-Payments — 보류된 결제', () => {
  it('목록 · ?id= · 확정 primary 하나', () => {
    const { container } = renderAt('/admin/payments?id=pay-1', 'admin');
    const root = container.querySelector('[data-screen="Admin-Payments"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(within(root).getByRole('heading', { name: /골목 파스타/ })).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('금액 불일치 · Money · 차이 amber · 확정 비활성', () => {
    const { container } = renderAt(
      `/admin/payments?mock=${encodeURIComponent('금액 불일치')}&id=pay-2`,
      'admin',
    );
    const root = container.querySelector('[data-screen="Admin-Payments"]') as HTMLElement;
    expect(within(root).getByText(DEMO.escrowLabel)).toBeTruthy();
    expect(within(root).getByText(DEMO.pgLabel)).toBeTruthy();
    expect(within(root).getByText(DEMO.diffLabel)).toBeTruthy();
    expect(within(root).getAllByText(/2,100,000원/).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(/2,010,000원/).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(/90,000원/).length).toBeGreaterThan(0);
    expect(within(root).getByRole('button', { name: DEMO.confirm }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(within(root).getByRole('button', { name: DEMO.cancel }).getAttribute('data-btn')).toBe(
      'warn',
    );
  });

  it('확정 · teal 띠 · 사유 없으면 disabledReason', () => {
    const { container } = renderAt('/admin/payments?id=pay-1', 'admin');
    const root = container.querySelector('[data-screen="Admin-Payments"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(/사유/), { target: { value: '' } });
    expect(within(root).getByRole('button', { name: DEMO.confirm }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(within(root).getAllByText(DEMO.reasonNeed).length).toBeGreaterThan(0);
    expect(within(root).getByText(DEMO.eventNote)).toBeTruthy();

    renderAt(`/admin/payments?mock=${encodeURIComponent('확정')}&id=pay-done`, 'admin');
    expect(screen.getByText(/예치 완료로 확정했습니다/)).toBeTruthy();
    void container;
  });
});

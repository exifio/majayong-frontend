/* 블록 검토 Admin-Blocks — F-22 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/admin/Admin-Blocks.data';
import { location, renderAt } from './render';

describe('Admin-Blocks — 블록 검토', () => {
  it('새 블록 목록 · ?id= · 승인 primary 하나', () => {
    const { container } = renderAt('/admin/blocks?id=b-12', 'admin');
    const root = container.querySelector('[data-screen="Admin-Blocks"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(within(root).getByRole('heading', { name: '노쇼 관리' })).toBeTruthy();
    expect(within(root).getAllByText(/출처 프로젝트 2건/).length).toBeGreaterThan(0);
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('병합 · 사유 없으면 disabledReason', () => {
    renderAt(`/admin/blocks?mock=${encodeURIComponent('병합')}&id=b-12`, 'admin');
    const dialog = screen.getByRole('dialog', { name: /병합/ });
    fireEvent.change(within(dialog).getByLabelText(/사유/), { target: { value: '' } });
    expect(within(dialog).getByRole('button', { name: DEMO.mergeConfirm }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(within(dialog).getByText(DEMO.reasonNeed)).toBeTruthy();
    expect(within(dialog).getByText(DEMO.eventNote)).toBeTruthy();
    expect(within(dialog).queryAllByRole('button', { name: DEMO.mergeConfirm }).length).toBe(1);
  });

  it('단가 수정 · Money', () => {
    renderAt(`/admin/blocks?mock=${encodeURIComponent('단가 수정')}&id=b-16`, 'admin');
    const dialog = screen.getByRole('dialog', { name: /단가 수정/ });
    expect(within(dialog).getByText(/800,000원/)).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: DEMO.priceConfirm })).toBeTruthy();
  });

  it('비활성화 warn Modal · 목록에서 열기', () => {
    const { container } = renderAt('/admin/blocks?id=b-18', 'admin');
    const root = container.querySelector('[data-screen="Admin-Blocks"]') as HTMLElement;
    fireEvent.click(within(root).getByRole('button', { name: DEMO.deactivate }));
    expect(location.current).toContain(encodeURIComponent('비활성화'));
    const dialog = screen.getByRole('dialog', { name: /비활성화/ });
    expect(dialog.getAttribute('data-danger')).toBe('true');
    fireEvent.change(within(dialog).getByLabelText(/사유/), { target: { value: '' } });
    expect(within(dialog).getByRole('button', { name: DEMO.deactConfirm }).hasAttribute('disabled')).toBe(
      true,
    );
  });
});

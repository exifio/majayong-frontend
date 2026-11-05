/* 이견 개입 Admin-Disputes — F-27 · 11.3 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/admin/Admin-Disputes.data';
import { renderAt } from './render';

describe('Admin-Disputes — 이견 개입', () => {
  it('검토 중 · 시간 순서 · 판정 확정 disabled', () => {
    const { container } = renderAt('/admin/disputes?id=dp-1', 'admin');
    const root = container.querySelector('[data-screen="Admin-Disputes"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(within(root).getByText(/시간 순서/)).toBeTruthy();
    expect(within(root).getByText(/보완 요청 기록/)).toBeTruthy();
    expect(within(root).getByRole('button', { name: DEMO.confirm }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('판정 작성 · SelectCards · 사유 필수', () => {
    renderAt(`/admin/disputes?mock=${encodeURIComponent('판정 작성')}&id=dp-1`, 'admin');
    const root = screen.getByRole('heading', { name: /회차 예약/ }).closest('aside')!;
    expect(within(root).getByRole('radio', { name: /^승인/ })).toBeTruthy();
    expect(within(root).getByRole('radio', { name: /^보완/ })).toBeTruthy();
    expect(within(root).getByRole('radio', { name: /^부분 정산/ })).toBeTruthy();
    fireEvent.change(within(root).getByLabelText(/판정 사유/), { target: { value: '' } });
    expect(within(root).getByRole('button', { name: DEMO.confirm }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(within(root).getByText(DEMO.eventNote)).toBeTruthy();
  });

  it('판정 완료 · teal 띠 · 요약', () => {
    renderAt(`/admin/disputes?mock=${encodeURIComponent('판정 완료')}&id=dp-done`, 'admin');
    expect(screen.getByText(/판정을 보냈습니다/)).toBeTruthy();
    expect(screen.getByText(/부분 정산 · 정하지 않은 조건/)).toBeTruthy();
  });
});

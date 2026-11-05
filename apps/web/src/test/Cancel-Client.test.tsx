/* 계약 취소 요청 Cancel-Client — F-26 · 13.2 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import { location, renderAt } from './render';
import { DEMO, cancelDemoOf } from '@/pages/client/Cancel-Client.data';

const PATH = '/c/contracts/c-ondo/cancel';

describe('Cancel-Client — 계약 취소 요청', () => {
  it('요청 작성: SelectCards · 정산 금액 · warn → ConfirmDialog danger', () => {
    const { container } = renderAt(PATH, 'client');
    const root = container.querySelector('[data-screen="Cancel-Client"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.titleWrite })).toBeTruthy();
    expect(within(root).getByText(DEMO.reasonClient)).toBeTruthy();
    expect(within(root).getAllByText(formatWon(DEMO.clientRefund)).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(formatWon(DEMO.clientComp)).length).toBeGreaterThan(0);
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    const send = within(root).getByRole('button', { name: DEMO.send });
    expect(send.getAttribute('data-btn')).toBe('warn');
    fireEvent.click(send);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('button', { name: DEMO.dialogConfirm }).getAttribute('data-btn')).toBe(
      'warn',
    );
    expect(dialog.querySelector('[data-btn="primary"]')).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('공급자 사정: 전액 환불 금액', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('공급자 사정 선택')}`,
      'client',
    );
    const root = container.querySelector('[data-screen="Cancel-Client"]') as HTMLElement;
    expect(within(root).getAllByText(formatWon(DEMO.supplierRefund)).length).toBeGreaterThan(0);
  });

  it('동의 대기: wait 띠 · Deadline', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('동의 대기')}`, 'client');
    expect(screen.getByText(DEMO.waitTitle)).toBeTruthy();
    expect(screen.getByText(/응답 기한/)).toBeTruthy();
  });

  it('이견: amber 띠 · 양쪽 주장', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('이견 — 운영자 판정 중')}`, 'client');
    expect(screen.getByText(DEMO.disputeTitle)).toBeTruthy();
    expect(screen.getByText(DEMO.myClaimBody)).toBeTruthy();
    expect(screen.getByText(DEMO.theirClaimBody)).toBeTruthy();
  });

  it('정산 확정: teal · 정산 내역', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('정산 확정')}`,
      'client',
    );
    const root = container.querySelector('[data-screen="Cancel-Client"]') as HTMLElement;
    expect(within(root).getByText(DEMO.doneTitle)).toBeTruthy();
    const cta = within(root).getByRole('link', { name: DEMO.settleCta });
    expect(cta.getAttribute('href')).toBe('/c/settlements?contract=c-ondo');
    expect(cta.getAttribute('data-btn')).toBe('primary');
  });

  it('시연 데이터', () => {
    expect(cancelDemoOf('요청 작성').write).toBe(true);
    expect(cancelDemoOf('공급자 사정 선택').reason).toBe('supplier');
  });
});

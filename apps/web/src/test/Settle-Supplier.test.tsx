/* 공급자 정산 내역 Settle-Supplier — F-16 · F-29 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import { DEMO, settleSDemoOf } from '@/pages/supplier/Settle-Supplier.data';
import { renderAt } from './render';

describe('Settle-Supplier — 정산 내역', () => {
  it('전체: 받을 금액 · 수수료 줄 · primary 없음', () => {
    const { container } = renderAt('/s/settlements', 'supplier');
    const root = container.querySelector('[data-screen="Settle-Supplier"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getAllByText(formatWon(1_472_500)).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(/구간 1,550,000원 − 수수료 5%/).length).toBeGreaterThan(0);
    expect(within(root).getByText(DEMO.taxIssue)).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(screen.queryByText(/3,255,000/)).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('계약 하나: ?contract=c-ondo · 전체 보기', () => {
    const { container } = renderAt('/s/settlements?contract=c-ondo', 'supplier');
    const root = container.querySelector('[data-screen="Settle-Supplier"]') as HTMLElement;
    expect(within(root).getByText(DEMO.oneBanner, { exact: false })).toBeTruthy();
    expect(within(root).getByRole('link', { name: DEMO.allView }).getAttribute('href')).toBe(
      '/s/settlements',
    );
  });

  it('취소된 계약 예시: 보상 받을 금액', () => {
    const { container } = renderAt(
      `/s/settlements?mock=${encodeURIComponent('취소된 계약 예시')}`,
      'supplier',
    );
    const root = container.querySelector('[data-screen="Settle-Supplier"]') as HTMLElement;
    expect(within(root).getAllByText(formatWon(475_000)).length).toBeGreaterThan(0);
    expect(within(root).getByText(/취소 · 지급 처리 중/)).toBeTruthy();
  });

  it('개인 공급자 예시: 원천징수 뒤 실수령', () => {
    const { container } = renderAt(
      `/s/settlements?mock=${encodeURIComponent('개인 공급자 예시')}`,
      'supplier',
    );
    const root = container.querySelector('[data-screen="Settle-Supplier"]') as HTMLElement;
    expect(within(root).getAllByText(formatWon(1_421_350)).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(/원천징수 3\.3%/).length).toBeGreaterThan(0);
    expect(within(root).getByText(DEMO.indivNote, { exact: false })).toBeTruthy();
  });

  it('시연 데이터', () => {
    expect(settleSDemoOf('전체').cards.length).toBeGreaterThan(1);
    expect(settleSDemoOf('계약 하나만(?contract=:cid)').one).toBe(true);
    expect(settleSDemoOf('개인 공급자 예시').indiv).toBe(true);
  });
});

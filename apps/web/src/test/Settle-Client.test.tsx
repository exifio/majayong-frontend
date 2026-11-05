/* 결제 · 정산 내역 Settle-Client — F-16 · F-29 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import { renderAt } from './render';
import { DEMO, settleDemoOf } from '@/pages/client/Settle-Client.data';

describe('Settle-Client — 결제 · 정산 내역', () => {
  it('전체: 예치·구간 지급·수수료 · primary 없음', () => {
    const { container } = renderAt('/c/settlements', 'client');
    const root = container.querySelector('[data-screen="Settle-Client"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getAllByText(formatWon(3_255_000)).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(formatWon(1_550_000)).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(formatWon(155_000)).length).toBeGreaterThan(0);
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('계약 하나: ?contract=c-ondo · 전체 보기', () => {
    const { container } = renderAt('/c/settlements?contract=c-ondo', 'client');
    const root = container.querySelector('[data-screen="Settle-Client"]') as HTMLElement;
    expect(within(root).getByText(DEMO.oneBanner, { exact: false })).toBeTruthy();
    expect(within(root).getByRole('link', { name: DEMO.allView }).getAttribute('href')).toBe(
      '/c/settlements',
    );
  });

  it('취소된 계약 예시: 환불·보상·취소 칩', () => {
    const { container } = renderAt(
      `/c/settlements?mock=${encodeURIComponent('취소된 계약 예시')}`,
      'client',
    );
    const root = container.querySelector('[data-screen="Settle-Client"]') as HTMLElement;
    expect(within(root).getAllByText(formatWon(2_441_250)).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(formatWon(736_250)).length).toBeGreaterThan(0);
    expect(within(root).getByText('취소')).toBeTruthy();
  });

  it('시연 데이터', () => {
    expect(settleDemoOf('전체').cards.length).toBe(2);
    expect(settleDemoOf('계약 하나만(?contract=:cid)').one).toBe(true);
  });
});

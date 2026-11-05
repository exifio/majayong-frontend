/* 의뢰인 공개 프로필 PublicClient — F-07 · F-23 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/supplier/PublicClient.data';
import { renderAt } from './render';

describe('PublicClient — 의뢰인 공개 프로필', () => {
  it('기본 · 파란 버튼 없음 · 연락처 없음', () => {
    const { container } = renderAt('/s/clients/u-ondo', 'supplier');
    const root = container.querySelector('[data-screen="PublicClient"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: `${DEMO.name} · ${DEMO.biz}` })).toBeTruthy();
    expect(within(root).getAllByText(new RegExp(DEMO.industry)).length).toBeGreaterThan(0);
    expect(within(root).getAllByText(new RegExp(DEMO.seats)).length).toBeGreaterThan(0);
    expect(within(root).getByText(/4\.5/)).toBeTruthy();
    expect(within(root).queryByText(/[\w.-]+@[\w.-]+\.\w+/)).toBeNull();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(within(root).getByRole('link', { name: DEMO.back }).getAttribute('href')).toBe(
      DEMO.backHref,
    );
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('첫 거래 EmptyState', () => {
    const { container } = renderAt(
      `/s/clients/u-ondo?mock=${encodeURIComponent('첫 거래')}`,
      'supplier',
    );
    expect(within(container.querySelector('[data-screen="PublicClient"]') as HTMLElement).getByText(DEMO.emptyTitle)).toBeTruthy();
  });
});

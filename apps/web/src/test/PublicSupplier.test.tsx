/* 공급자 공개 프로필 PublicSupplier — F-21 · F-23 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO, PROFILES } from '@/pages/client/PublicSupplier.data';
import { renderAt } from './render';

describe('PublicSupplier — 공급자 공개 프로필', () => {
  it('기본 최준호 · 파란 버튼 없음 · 판정 문구 없음', () => {
    const { container } = renderAt('/c/suppliers/s-junho', 'client');
    const root = container.querySelector('[data-screen="PublicSupplier"]') as HTMLElement;
    const p = PROFILES['s-junho']!;
    expect(screen.getByRole('heading', { name: p.name })).toBeTruthy();
    expect(within(root).getByText(new RegExp(p.career))).toBeTruthy();
    expect(within(root).getByText(/4\.8/)).toBeTruthy();
    expect(within(root).getByText(new RegExp(p.business))).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(within(root).queryByText(/추천|우수|최저/)).toBeNull();
    expect(within(root).getByRole('link', { name: DEMO.back }).getAttribute('href')).toBe(
      DEMO.backHref,
    );
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('리뷰 없음 김세라 EmptyState', () => {
    const { container } = renderAt(
      `/c/suppliers/s-sera?mock=${encodeURIComponent('리뷰 없음')}`,
      'client',
    );
    const root = container.querySelector('[data-screen="PublicSupplier"]') as HTMLElement;
    expect(within(root).getByRole('heading', { name: '김세라' })).toBeTruthy();
    expect(within(root).getByText(DEMO.emptyTitle)).toBeTruthy();
  });
});

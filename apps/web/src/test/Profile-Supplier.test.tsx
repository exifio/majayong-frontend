/* 공급자 내 프로필 Profile-Supplier — F-07 · F-21 · F-23 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/supplier/Profile-Supplier.data';
import { location, renderAt } from './render';

describe('Profile-Supplier — 공급자 내 프로필', () => {
  it('기본 정보 · 저장 primary 하나', () => {
    const { container } = renderAt('/s/profile', 'supplier');
    const root = container.querySelector('[data-screen="Profile-Supplier"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.name })).toBeTruthy();
    expect(within(root).getByDisplayValue(DEMO.name)).toBeTruthy();
    expect(within(root).getByText('사업자')).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('요약 공개 상태 StatusChip', () => {
    const { container } = renderAt(
      `/s/profile?mock=${encodeURIComponent('확인 대기')}`,
      'supplier',
    );
    const root = container.querySelector('[data-screen="Profile-Supplier"]') as HTMLElement;
    expect(within(root).getByText('확인 대기')).toBeTruthy();
  });

  it('받은 리뷰 탭', () => {
    const { container } = renderAt('/s/profile?tab=reviews', 'supplier');
    const root = container.querySelector('[data-screen="Profile-Supplier"]') as HTMLElement;
    expect(within(root).getByText(DEMO.reviewSummary)).toBeTruthy();
    fireEvent.click(within(root).getByRole('tab', { name: '기본 정보' }));
    expect(location.current).toContain(encodeURIComponent('기본 정보'));
  });
});

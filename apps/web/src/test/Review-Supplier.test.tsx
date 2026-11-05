/* 공급자 리뷰 작성 Review-Supplier — F-14 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/supplier/Review-Supplier.data';
import { location, renderAt } from './render';

describe('Review-Supplier — 공급자 리뷰 작성', () => {
  it('작성 중 · 별점 없으면 disabledReason', () => {
    const { container } = renderAt('/s/contracts/c-ondo/review', 'supplier');
    const root = container.querySelector('[data-screen="Review-Supplier"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.titleWrite })).toBeTruthy();
    expect(within(root).getByText(DEMO.who)).toBeTruthy();
    expect(within(root).getByRole('button', { name: DEMO.submit }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(within(root).getByText(DEMO.needStar)).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('제출 → 제출함 · 내 계약으로', () => {
    const { container } = renderAt('/s/contracts/c-ondo/review', 'supplier');
    const root = container.querySelector('[data-screen="Review-Supplier"]') as HTMLElement;
    fireEvent.click(within(root).getByRole('radio', { name: '5점' }));
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));
    expect(location.current).toContain(encodeURIComponent('제출함'));

    const { container: c2 } = renderAt(
      `/s/contracts/c-ondo/review?mock=${encodeURIComponent('제출함')}`,
      'supplier',
    );
    expect(c2.querySelector('[data-band="done"]')).toBeTruthy();
    expect(
      within(c2.querySelector('[data-screen="Review-Supplier"]') as HTMLElement).getByRole('link', {
        name: DEMO.doneCta,
      }).getAttribute('href'),
    ).toBe(DEMO.doneHref);
  });
});

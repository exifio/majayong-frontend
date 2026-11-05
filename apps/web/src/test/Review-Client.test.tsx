/* 의뢰인 리뷰 작성 Review-Client — F-14 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/client/Review-Client.data';
import { location, renderAt } from './render';

describe('Review-Client — 의뢰인 리뷰 작성', () => {
  it('작성 중 · 별점 없으면 disabledReason', () => {
    const { container } = renderAt('/c/contracts/c-ondo/review', 'client');
    const root = container.querySelector('[data-screen="Review-Client"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.titleWrite })).toBeTruthy();
    expect(within(root).getByText(DEMO.who)).toBeTruthy();
    const submit = within(root).getByRole('button', { name: DEMO.submit });
    expect(submit.hasAttribute('disabled')).toBe(true);
    expect(within(root).getByText(DEMO.needStar)).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('별점 고르고 제출 → 제출함', () => {
    const { container } = renderAt('/c/contracts/c-ondo/review', 'client');
    const root = container.querySelector('[data-screen="Review-Client"]') as HTMLElement;
    fireEvent.click(within(root).getByRole('radio', { name: '5점' }));
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));
    expect(location.current).toContain(encodeURIComponent('제출함'));
  });

  it('제출함 teal 띠 · 내 계약으로', () => {
    const { container } = renderAt(
      `/c/contracts/c-ondo/review?mock=${encodeURIComponent('제출함')}`,
      'client',
    );
    const root = container.querySelector('[data-screen="Review-Client"]') as HTMLElement;
    expect(container.querySelector('[data-band="done"]')).toBeTruthy();
    expect(within(root).getByRole('link', { name: DEMO.doneCta }).getAttribute('href')).toBe(
      DEMO.doneHref,
    );
  });
});

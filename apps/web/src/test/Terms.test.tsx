/* 약관 · 정책 Terms — PRD 7.2 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO, DOCS } from '@/pages/public/Terms.data';
import { location, renderAt } from './render';

describe('Terms — 약관 · 정책', () => {
  it('이용약관 · 초안 · Tabs · primary 없음', () => {
    const { container } = renderAt('/terms/terms', 'guest');
    const root = container.querySelector('[data-screen="Terms"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.pageTitle })).toBeTruthy();
    expect(within(root).getByText(DEMO.draft)).toBeTruthy();
    expect(within(root).getByRole('heading', { level: 2, name: DOCS.terms.title })).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('Tabs로 privacy 이동', () => {
    const { container } = renderAt('/terms/terms', 'guest');
    const root = container.querySelector('[data-screen="Terms"]') as HTMLElement;
    fireEvent.click(within(root).getByRole('tab', { name: '개인정보 처리방침' }));
    expect(location.current).toBe('/terms/privacy');
  });

  it('모르는 doc → EmptyState', () => {
    renderAt('/terms/unknown', 'guest');
    expect(screen.getByText(DEMO.emptyTitle)).toBeTruthy();
  });
});

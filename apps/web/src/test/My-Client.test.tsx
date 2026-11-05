/* 내 프로젝트 My-Client — F-03 · 결정메모 #9 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import { renderAt } from './render';
import { DEMO, myDemoOf } from '@/pages/client/My-Client.data';

describe('My-Client — 내 프로젝트', () => {
  it('홈과 같은 데이터: 카드 · StatusChip · primary 새 프로젝트', () => {
    const { container } = renderAt('/c/projects', 'client');
    const root = container.querySelector('[data-screen="My-Client"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getByText('모집 중')).toBeTruthy();
    expect(within(root).getByText('작성 중')).toBeTruthy();
    const draft = within(root).getByText('단골 등급 관리 외 2개 기능').closest('a');
    expect(draft?.getAttribute('href')).toBe(DEMO.draftHref);
    const proj = within(root).getByText('예약 달력, 예약금 결제 외 2개 기능').closest('a');
    expect(proj?.getAttribute('href')).toBe(DEMO.projectHref);
    const neu = within(root).getByRole('link', { name: DEMO.newCta });
    expect(neu.getAttribute('href')).toBe(DEMO.newHref);
    expect(neu.getAttribute('data-btn')).toBe('primary');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('명세 확정 카드에 AI 금액 없음 · 초안에만 예상 총액', () => {
    const { container } = renderAt('/c/projects', 'client');
    const root = container.querySelector('[data-screen="My-Client"]') as HTMLElement;
    const recruiting = within(root)
      .getByText('예약 달력, 예약금 결제 외 2개 기능')
      .closest('a') as HTMLElement;
    expect(within(recruiting).queryByText(/예상 총액/)).toBeNull();
    expect(within(root).getByText(formatWon(1_092_000))).toBeTruthy();
  });

  it('프로젝트 없음: EmptyState', () => {
    const { container } = renderAt(
      `/c/projects?mock=${encodeURIComponent('프로젝트 없음')}`,
      'client',
    );
    expect(screen.getByText(DEMO.emptyTitle)).toBeTruthy();
    expect(screen.getByRole('link', { name: DEMO.emptyCta }).getAttribute('href')).toBe(
      DEMO.newHref,
    );
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });

  it('시연 데이터', () => {
    expect(myDemoOf('프로젝트 없음').empty).toBe(true);
    expect(myDemoOf('모든 상태 예시').cards.length).toBeGreaterThan(3);
  });
});

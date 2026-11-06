/* 고객센터 Help — F-25 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/public/Help.data';
import { renderAt } from './render';

describe('Help — 고객센터', () => {
  it('자주 묻는 질문 목록과 1:1 문의 링크를 보여 준다', () => {
    const { container } = renderAt('/help', 'client');
    const root = container.querySelector('[data-screen="Help"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getByText(DEMO.faqTitle)).toBeTruthy();
    expect(within(root).getAllByRole('link', { name: DEMO.askCta })[0]!.getAttribute('href')).toBe('/help/inquiry');
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('?q= 검색 결과를 보여 준다', () => {
    renderAt('/help?q=%ED%99%98%EB%B6%88', 'client');
    expect(screen.getByText(/검색 결과/)).toBeTruthy();
  });

  it('검색 결과가 없으면 문의 안내를 보여 준다', () => {
    const { container } = renderAt(`/help?q=${encodeURIComponent('없는키워드xyz')}`, 'client');
    const root = container.querySelector('[data-screen="Help"]') as HTMLElement;
    expect(within(root).getByText(DEMO.emptySearchTitle)).toBeTruthy();
  });

  it('?tab=notice는 공지를 먼저 보여 준다', () => {
    renderAt('/help?tab=notice', 'client');
    expect(screen.getByRole('heading', { level: 2, name: DEMO.noticeTitle })).toBeTruthy();
  });
});

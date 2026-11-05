/* 고객센터 Help — F-25 · 결정메모 #6 · #11 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/public/Help.data';
import { location, renderAt } from './render';

describe('Help — 고객센터', () => {
  it('자주 묻는 질문 · 접기/펼치기', () => {
    const { container } = renderAt('/help', 'client');
    const root = container.querySelector('[data-screen="Help"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getByText(DEMO.faqTitle)).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('?q= 검색 결과', () => {
    renderAt('/help?q=%ED%99%98%EB%B6%88', 'client');
    expect(screen.getByText(/검색 결과/)).toBeTruthy();
  });

  it('검색 결과 없음 → EmptyState', () => {
    const { container } = renderAt(`/help?q=${encodeURIComponent('없는키워드xyz')}`, 'client');
    const root = container.querySelector('[data-screen="Help"]') as HTMLElement;
    expect(within(root).getByText(DEMO.emptySearchTitle)).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });

  it('1:1 문의 → 문의 보냄', () => {
    const { container } = renderAt('/help/inquiry', 'client');
    const root = container.querySelector('[data-screen="Help"]') as HTMLElement;
    expect(within(root).getByRole('heading', { level: 2, name: DEMO.formTitle })).toBeTruthy();
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));
    expect(location.current).toContain(encodeURIComponent('문의 보냄'));
  });

  it('문의 보냄 teal 띠', () => {
    const { container } = renderAt(
      `/help/inquiry?mock=${encodeURIComponent('문의 보냄')}`,
      'client',
    );
    expect(container.querySelector('[data-band="done"]')).toBeTruthy();
  });
});

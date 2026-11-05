/* 공급자 프로젝트 찾기 Find-Supplier — F-08 · 7.1 전체 공개 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  BOOKMARKS_HREF,
  DEMO,
  MY_STACK,
  PROJECT_DETAIL_HREF,
} from '@/pages/supplier/Find-Supplier.data';
import { renderAt } from './render';

const PATH = '/s/projects';

describe('Find-Supplier — 프로젝트 찾기', () => {
  it('전체: 검색 · 필터 · 정렬 · Attr 예산 · 내 스택 강조 · primary 하나', () => {
    const { container } = renderAt(PATH, 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.findTitle })).toBeTruthy();
    expect(screen.getByLabelText(DEMO.searchLabel)).toBeTruthy();
    expect(screen.getByLabelText('필터')).toBeTruthy();
    expect(screen.getByLabelText('정렬')).toBeTruthy();
    expect(screen.getByText('최신순')).toBeTruthy();
    expect(screen.getByText('마감임박순')).toBeTruthy();
    expect(screen.getByText('예산 높은순')).toBeTruthy();

    const first = screen.getByLabelText('예약 달력, 예약금 결제 외 2개 기능');
    expect(within(first).getByText('희망 예산')).toBeTruthy();
    expect(within(first).getByText('400~500만원')).toBeTruthy();
    expect(within(first).getByText('React').className).toMatch(/stagMine|Mine/);
    for (const stack of MY_STACK) {
      // 내 스택 태그가 화면에 있다(첫 카드 또는 필터)
      expect(screen.getAllByText(stack).length).toBeGreaterThan(0);
    }

    expect(within(first).getByRole('link', { name: DEMO.openBtn }).getAttribute('href')).toBe(
      PROJECT_DETAIL_HREF,
    );
    expect(screen.getByRole('button', { name: DEMO.searchBtn }).getAttribute('data-btn')).toBe('primary');
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(screen.queryByText(/AI 예상|점수|순위/)).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('북마크: ?view=bookmarks · 필터 없음 · 마감 카드', () => {
    renderAt(BOOKMARKS_HREF, 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.bmTitle })).toBeTruthy();
    expect(screen.queryByLabelText('필터')).toBeNull();
    expect(screen.queryByLabelText(DEMO.searchLabel)).toBeNull();
    const list = screen.getByLabelText('프로젝트 목록');
    expect(list.textContent).toMatch(/북마크\s*3\s*건/);
    expect(within(list).getByText('모집 마감')).toBeTruthy();
    expect(screen.getByLabelText('객실 예약, 후기 모음 외 2개 기능')).toBeTruthy();
  });

  it('mock=북마크도 같은 화면', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('북마크')}`, 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.bmTitle })).toBeTruthy();
  });

  it('검색 결과 없음: EmptyState · 필터 모두 지우기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('검색 결과 없음')}`, 'supplier');
    expect(screen.getByText(DEMO.emptyTitle(DEMO.emptyQ))).toBeTruthy();
    expect(screen.getAllByRole('button', { name: DEMO.clearFilters }).length).toBeGreaterThan(0);
    expect((screen.getByLabelText(DEMO.searchLabel) as HTMLInputElement).value).toBe(DEMO.emptyQ);
  });

  it('북마크 토글은 화면 안 상태', () => {
    renderAt(PATH, 'supplier');
    const first = screen.getByLabelText('예약 달력, 예약금 결제 외 2개 기능');
    const bm = within(first).getByRole('button', { name: '북마크' });
    expect(bm.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(bm);
    expect(bm.getAttribute('aria-pressed')).toBe('false');
  });
});

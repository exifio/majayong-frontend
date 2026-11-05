/* 공급자 프로젝트 상세 Project-Supplier — 7.1 · F-05 · ㉜ */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  CHAT_HREF,
  CLIENT_HREF,
  DEMO,
  MY_QUOTE_HREF,
  QUOTE_HREF,
  REQUOTE_HREF,
} from '@/pages/supplier/Project-Supplier.data';
import { renderAt } from './render';

const PATH = '/s/projects/p-ondo';

describe('Project-Supplier — 프로젝트 상세', () => {
  it('지원 전: viewlog · 희망 예산 · Attr 메모 · 견적 CTA · primary 하나', () => {
    const { container } = renderAt(PATH, 'supplier');
    expect(container.querySelector('[data-band="viewlog"]')).toBeTruthy();
    expect(screen.getByText(/열람 기록이 남습니다/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(screen.getByText('5,000,000원')).toBeTruthy();
    expect(screen.getByText('의뢰인 메모')).toBeTruthy();
    expect(screen.getByText(/예약금은 1인 3만원/)).toBeTruthy();
    expect(screen.getByText(DEMO.client.name)).toBeTruthy();
    expect(screen.getByText(DEMO.client.business)).toBeTruthy();
    expect(screen.getByRole('link', { name: '프로필 보기' }).getAttribute('href')).toBe(CLIENT_HREF);
    const client = screen.getByRole('heading', { name: '의뢰인' }).closest('section')!;
    expect(client.textContent).not.toMatch(/010-|계정 이메일/);
    expect(client.textContent).toMatch(/연락처는 받지 않습니다/);
    expect(client.textContent).not.toContain('@');

    const quote = screen.getByRole('link', { name: DEMO.quoteCta });
    expect(quote.getAttribute('href')).toBe(QUOTE_HREF);
    expect(quote.getAttribute('data-btn')).toBe('primary');
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(screen.getByText(DEMO.askBefore)).toBeTruthy();
    expect(screen.queryByText(/AI 예상|추천 프로젝트|비슷한 프로젝트/)).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('지원함: 내 견적 보기 · 채팅', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('지원함')}`, 'supplier');
    expect(screen.getByRole('link', { name: DEMO.myQuoteCta }).getAttribute('href')).toBe(MY_QUOTE_HREF);
    expect(screen.getByRole('link', { name: /채팅 보기/ }).getAttribute('href')).toBe(CHAT_HREF);
    expect(screen.getByText('3,100,000원')).toBeTruthy();
    expect(screen.getByText('문의 중')).toBeTruthy();
  });

  it('재견적 요청: Note · 다시 견적하기 · 변경 칩', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('재견적 요청')}`, 'supplier');
    expect(screen.getByText(DEMO.reNoteTitle)).toBeTruthy();
    expect(screen.getByRole('link', { name: DEMO.requoteCta }).getAttribute('href')).toBe(REQUOTE_HREF);
    expect(screen.getByText('설명 바뀜')).toBeTruthy();
    expect(screen.getByText('새 항목')).toBeTruthy();
    expect(screen.getByLabelText('단골 표시')).toBeTruthy();
    expect(screen.getByText('이전 명세 기준')).toBeTruthy();
  });

  it('모집 마감: 견적 비활성 · 이유', () => {
    const { container } = renderAt(`${PATH}?mock=${encodeURIComponent('모집 마감')}`, 'supplier');
    const btn = screen.getByRole('button', { name: DEMO.closedCta }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('data-btn')).toBe('primary');
    expect(screen.getByText(DEMO.closedReason)).toBeTruthy();
    expect(screen.getByText(DEMO.closedBandTitle)).toBeTruthy();
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });

  it('북마크 토글', () => {
    renderAt(PATH, 'supplier');
    const bm = screen.getByRole('button', { name: '북마크' });
    expect(bm.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(bm);
    expect(screen.getByRole('button', { name: '북마크함' }).getAttribute('aria-pressed')).toBe('true');
  });
});

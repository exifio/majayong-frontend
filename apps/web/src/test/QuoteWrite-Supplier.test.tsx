/* 공급자 견적 작성 QuoteWrite-Supplier — F-05 · 11.2 · ㉜ */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  DEMO,
  SUBMIT_HREF,
  feeOf,
  netOf,
  quoteWriteSeedOf,
} from '@/pages/supplier/QuoteWrite-Supplier.data';
import { formatWon } from '@/lib/format';
import { renderAt } from './render';

const PATH = '/s/projects/p-ondo/quote';

describe('QuoteWrite-Supplier — 견적 작성', () => {
  it('작성 중: 4항목 · 총액 아래 수령액 · 질문 · primary 하나', () => {
    const { container } = renderAt(PATH, 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(screen.getByText('예약 달력')).toBeTruthy();
    expect(screen.getByText('예약금 결제')).toBeTruthy();
    expect(screen.getByText('노쇼 기록')).toBeTruthy();
    expect(screen.getByText('리마인드 알림')).toBeTruthy();

    expect(screen.getByLabelText(DEMO.amtLabel)).toBeTruthy();
    expect(screen.getAllByText(formatWon(netOf(DEMO.defaultAmt))).length).toBe(2);

    expect(screen.getByRole('button', { name: DEMO.askAdd })).toBeTruthy();
    expect(screen.getByLabelText('질문 1')).toBeTruthy();
    expect(screen.getByLabelText('질문 2')).toBeTruthy();

    const submit = screen.getByRole('link', { name: DEMO.submit });
    expect(submit.getAttribute('href')).toBe(SUBMIT_HREF);
    expect(submit.getAttribute('data-btn')).toBe('primary');
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(screen.queryByText(/AI 예상|블록 단가/)).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('모두 불가: Note · 견적 보내기 비활성', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('모두 불가')}`, 'supplier');
    expect(screen.getByText(DEMO.allNoNote)).toBeTruthy();
    const btn = screen.getByRole('button', { name: DEMO.submit }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('data-btn')).toBe('primary');
    expect(screen.getAllByText(DEMO.submitDisabledReason).length).toBeGreaterThan(0);
  });

  it('연락처 가림: MaskedText · Note', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('연락처 가림')}`, 'supplier');
    expect(screen.getByLabelText('가려진 지원 메시지 미리보기')).toBeTruthy();
    expect(screen.getByText('연락처 가림')).toBeTruthy();
    expect(screen.getByText(DEMO.maskNoteTitle)).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: '지원 메시지' })).toBeNull();
  });

  it('재견적: 바뀐 항목 · 이전 금액 · 질문 고정', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('재견적')}`, 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.titleRe })).toBeTruthy();
    expect(screen.getByText(DEMO.reNoteTitle)).toBeTruthy();
    expect(screen.getByText('설명 바뀜')).toBeTruthy();
    expect(screen.getByText('새 항목')).toBeTruthy();
    expect(screen.getAllByText('단골 표시').length).toBeGreaterThan(0);
    expect(screen.getByText(DEMO.rePrev)).toBeTruthy();
    expect(screen.getAllByText(formatWon(DEMO.requoteAmt)).length).toBeGreaterThan(0);
    expect(screen.getByText(DEMO.askSubRe)).toBeTruthy();
    expect(screen.queryByRole('button', { name: DEMO.askAdd })).toBeNull();
  });

  it('불가→가능으로 바꾸면 제출이 열린다', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('모두 불가')}`, 'supplier');
    const group = screen.getByLabelText('예약 달력 가능 여부');
    fireEvent.click(within(group).getByRole('button', { name: '가능' }));
    expect(screen.getByRole('link', { name: DEMO.submit }).getAttribute('href')).toBe(SUBMIT_HREF);
  });

  it('시연 수수료: 3,000,000 → 수령 2,850,000', () => {
    expect(netOf(3_000_000)).toBe(2_850_000);
    expect(feeOf(3_000_000)).toBe(150_000);
    expect(quoteWriteSeedOf('작성 중').amount).toBe(3_000_000);
  });
});

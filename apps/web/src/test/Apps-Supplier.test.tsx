/* 공급자 내 지원 Apps-Supplier — F-10 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  CONTRACT_HREF,
  DEMO,
  QUOTE_HREF,
  appsDemoOf,
} from '@/pages/supplier/Apps-Supplier.data';
import { renderAt } from './render';

const PATH = '/s/applications';

describe('Apps-Supplier — 내 지원 현황', () => {
  it('전체: 카드 · 금액 · StatusChip · 카드 링크', () => {
    const { container } = renderAt(PATH, 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    const card = screen.getByLabelText('예약 달력, 예약금 결제 외 2개 기능');
    expect(within(card).getByText('3,100,000원')).toBeTruthy();
    expect(within(card).getByText(/2,945,000원/)).toBeTruthy();
    expect(within(card).getByRole('link', { name: /예약 달력/ }).getAttribute('href')).toBe(
      QUOTE_HREF,
    );
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('선택됨(서명 대기): 파란 서명하러 가기', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('선택됨(서명 대기)')}`,
      'supplier',
    );
    expect(screen.getByText(DEMO.pickTitle)).toBeTruthy();
    const cta = screen.getByRole('link', { name: DEMO.pickCta });
    expect(cta.getAttribute('data-btn')).toBe('primary');
    expect(cta.getAttribute('href')).toBe(CONTRACT_HREF);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });

  it('보류 중: outline 칩 · 보류 이유', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('보류 중')}`, 'supplier');
    expect(screen.getAllByText('보류').length).toBeGreaterThan(0);
    expect(screen.getByText(DEMO.holdReason)).toBeTruthy();
    expect(screen.getByText(DEMO.holdExpandTitle)).toBeTruthy();
  });

  it('지원 철회 확인: ConfirmDialog danger', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('지원 철회 확인')}`, 'supplier');
    const dialog = screen.getByRole('dialog', { name: DEMO.withdrawTitle });
    expect(within(dialog).getByRole('button', { name: DEMO.withdrawConfirm }).getAttribute('data-btn')).toBe(
      'warn',
    );
    expect(dialog.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    fireEvent.click(within(dialog).getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('dialog', { name: DEMO.withdrawTitle })).toBeNull();
  });

  it('제출 완료: teal 띠', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('제출 완료')}`, 'supplier');
    expect(screen.getByText(DEMO.sentTitle)).toBeTruthy();
    expect(screen.getByRole('link', { name: DEMO.sentCta }).getAttribute('href')).toBe(QUOTE_HREF);
  });

  it('시연 데이터', () => {
    expect(appsDemoOf('전체').cards[0]!.quote).toBe(3_100_000);
    expect(appsDemoOf('전체').cards[0]!.payout).toBe(2_945_000);
    expect(appsDemoOf('선택됨(서명 대기)').picked).toBe(true);
  });
});

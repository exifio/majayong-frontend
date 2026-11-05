/* 공급자 내 계약 Contracts-Supplier — F-15 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  PAGE,
  SETTLEMENTS_HREF,
  cancelHref,
  contractHref,
  deliverHref,
  reviewHref,
} from '@/pages/supplier/Contracts-Supplier.data';
import { renderAt } from './render';

const PATH = '/s/contracts';

describe('Contracts-Supplier — 내 계약', () => {
  it('진행 중(기본): 개수 · Stepper · 납품하기 · 정산 링크', () => {
    const { container } = renderAt(PATH, 'supplier');
    expect(screen.getByRole('heading', { name: PAGE.title })).toBeTruthy();
    expect(screen.getByLabelText(PAGE.countsLabel)).toBeTruthy();

    const card = screen.getByLabelText('예약 달력, 예약금 결제 외 2개 기능');
    expect(within(card).getByLabelText(PAGE.stepsLabel)).toBeTruthy();
    expect(within(card).getByText('서명')).toBeTruthy();
    expect(within(card).getByText('중간 구간')).toBeTruthy();

    const deliver = within(card).getByRole('link', { name: '납품하기' });
    expect(deliver.getAttribute('data-btn')).toBe('tint');
    expect(deliver.getAttribute('href')).toBe(deliverHref());

    expect(screen.getByRole('link', { name: PAGE.settle }).getAttribute('href')).toBe(
      SETTLEMENTS_HREF,
    );
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('서명 대기: tint → 계약', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('서명 대기')}`, 'supplier');
    expect(screen.getByRole('link', { name: '계약서 확인하고 서명' }).getAttribute('href')).toBe(
      contractHref(),
    );
  });

  it('예치 대기: 납품하기 비활성', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('예치 대기')}`, 'supplier');
    const btn = screen.getByRole('button', { name: '납품하기' });
    expect(btn).toHaveProperty('disabled', true);
  });

  it('검수 대기: 납품 보기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('검수 대기')}`, 'supplier');
    expect(screen.getByRole('link', { name: '납품 보기' }).getAttribute('href')).toBe(
      deliverHref(),
    );
  });

  it('완료: 리뷰 쓰기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('완료')}`, 'supplier');
    expect(screen.getByRole('link', { name: '리뷰 쓰기' }).getAttribute('href')).toBe(reviewHref());
  });

  it('취소 요청 받음: 요청 보기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('취소 요청 받음')}`, 'supplier');
    expect(screen.getByRole('link', { name: '요청 보기' }).getAttribute('href')).toBe(cancelHref());
  });

  it('마감 지남: amber · 납품하기', () => {
    const { container } = renderAt(`${PATH}?mock=${encodeURIComponent('마감 지남')}`, 'supplier');
    const chip = screen.getByText('진행 중 · 마감 지남');
    expect(chip.closest('[data-chip]')?.getAttribute('data-chip')).toBe('amber');
    expect(screen.getByRole('link', { name: '납품하기' }).getAttribute('href')).toBe(deliverHref());
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('구간 금액은 받을 금액', () => {
    renderAt(PATH, 'supplier');
    expect(screen.getAllByText('1,472,500원').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('3,255,000원')).toBeNull();
  });
});

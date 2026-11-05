/* 의뢰인 내 계약 Contracts-Client — F-15 · ERD 7절 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  PAGE,
  SETTLEMENTS_HREF,
  cardOf,
  cancelHref,
  contractHref,
  escrowHref,
  inspectHref,
  reviewHref,
} from '@/pages/client/Contracts-Client.data';
import { renderAt } from './render';

const PATH = '/c/contracts';

describe('Contracts-Client — 내 계약', () => {
  it('진행 중(기본): 개수 · Stepper · 검수 비활성 · 정산 링크', () => {
    const { container } = renderAt(PATH, 'client');
    expect(screen.getByRole('heading', { name: PAGE.title })).toBeTruthy();
    expect(screen.getByLabelText(PAGE.countsLabel)).toBeTruthy();
    expect(screen.getByText('전체')).toBeTruthy();
    expect(screen.getAllByText('서명 대기').length).toBeGreaterThan(0);
    expect(screen.getAllByText('진행 중').length).toBeGreaterThan(0);

    const card = screen.getByLabelText('예약 달력, 예약금 결제 외 2개 기능');
    expect(within(card).getByLabelText(PAGE.stepsLabel)).toBeTruthy();
    expect(within(card).getByText('서명')).toBeTruthy();
    expect(within(card).getByText('예치')).toBeTruthy();
    expect(within(card).getByText('중간 구간')).toBeTruthy();
    expect(within(card).getByText('최종 구간')).toBeTruthy();

    const inspect = within(card).getByRole('button', { name: '검수하기' });
    expect(inspect.getAttribute('data-btn')).toBe('tint');
    expect(inspect).toHaveProperty('disabled', true);

    expect(screen.getByRole('link', { name: PAGE.settle }).getAttribute('href')).toBe(
      SETTLEMENTS_HREF,
    );
    expect(within(card).getByRole('link', { name: PAGE.cancelReq }).getAttribute('href')).toBe(
      cancelHref(),
    );
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('서명 대기: tint 서명하기 → 계약', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('서명 대기')}`, 'client');
    const link = screen.getByRole('link', { name: '서명하기' });
    expect(link.getAttribute('data-btn')).toBe('tint');
    expect(link.getAttribute('href')).toBe(contractHref());
  });

  it('예치 대기: tint 예치하기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('예치 대기')}`, 'client');
    expect(screen.getByRole('link', { name: '예치하기' }).getAttribute('href')).toBe(escrowHref());
  });

  it('검수 대기: tint 검수하기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('검수 대기')}`, 'client');
    expect(screen.getByRole('link', { name: '검수하기' }).getAttribute('href')).toBe(inspectHref());
  });

  it('완료: tint 리뷰 쓰기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('완료')}`, 'client');
    expect(screen.getByRole('link', { name: '리뷰 쓰기' }).getAttribute('href')).toBe(reviewHref());
  });

  it('취소 요청 중: tint 요청 보기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('취소 요청 중')}`, 'client');
    expect(screen.getByRole('link', { name: '요청 보기' }).getAttribute('href')).toBe(cancelHref());
  });

  it('결렬 — 예치 기한 초과', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('결렬 — 예치 기한 초과')}`, 'client');
    expect(screen.getByText(/예치 기한.*지나 결렬/)).toBeTruthy();
    expect(screen.getByRole('link', { name: '제안 비교로' })).toBeTruthy();
  });

  it('마감 지남: amber · 빨강 없음 · 일정·취소', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('마감 지남')}`,
      'client',
    );
    expect(screen.getByText(/마감 지남/)).toBeTruthy();
    expect(screen.getByRole('link', { name: PAGE.chatSchedule })).toBeTruthy();
    expect(screen.getByRole('link', { name: PAGE.cancelReq }).getAttribute('data-btn')).toBe('warn');
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('시연 데이터: 금액 · 상태별 액션', () => {
    expect(PAGE.agreed).toBe(3_100_000);
    expect(cardOf('서명 대기').act).toMatchObject({ kind: 'link', to: contractHref() });
    expect(cardOf('예치 대기').act).toMatchObject({ kind: 'link', to: escrowHref() });
  });
});

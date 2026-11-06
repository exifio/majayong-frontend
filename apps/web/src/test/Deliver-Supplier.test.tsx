/* 공급자 납품 Deliver-Supplier — F-13 · 11.3 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { ACCOUNT_HREF, DEMO } from '@/pages/supplier/Deliver-Supplier.data';
import { location, renderAt } from './render';

const PATH = '/s/contracts/c-ondo/deliver';

describe('Deliver-Supplier — 납품', () => {
  it('중간 납품: 작업 마감 · 체크 · 링크 · primary 납품 제출', () => {
    const { container } = renderAt(`${PATH}?mock=${encodeURIComponent('중간 납품')}`, 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.pageTitle })).toBeTruthy();
    expect(screen.getByText(/작업 마감.*12월 16일/)).toBeTruthy();
    expect(screen.getByText(/중간 납품/)).toBeTruthy();

    expect(screen.getByLabelText('예약 달력')).toBeTruthy();
    expect(screen.getByLabelText('예약금 결제')).toBeTruthy();
    expect(screen.getAllByLabelText(/결과물 링크/).length).toBe(2);
    expect(screen.getAllByLabelText(/납품 설명/).length).toBe(2);

    const primary = screen.getByRole('button', { name: '납품 제출' });
    expect(primary.getAttribute('data-btn')).toBe('primary');
    expect(primary).toHaveProperty('disabled', true);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);

    expect(screen.getByText('1,472,500원')).toBeTruthy();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('중간 납품: 체크 후 제출 → 검수 대기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('중간 납품')}`, 'supplier');
    const checks = screen.getAllByRole('checkbox');
    checks.forEach((c) => fireEvent.click(c));
    fireEvent.click(screen.getByRole('button', { name: '납품 제출' }));
    expect(decodeURIComponent(location.current)).toContain('제출함 · 검수 대기');
  });

  it('제출함 · 검수 대기: wait 띠', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('제출함 · 검수 대기')}`,
      'supplier',
    );
    expect(container.querySelector('[data-band="wait"]')).toBeTruthy();
    expect(screen.getByText(/납품을 제출했습니다/)).toBeTruthy();
    expect(screen.getByRole('button', { name: '검수 기다리는 중' })).toHaveProperty('disabled', true);
  });

  it('제출 후에는 시연 상태임을 알린다', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('제출함 · 검수 대기')}`, 'supplier');
    expect(screen.getByRole('note').textContent).toContain('서버에 저장되지 않았습니다');
  });

  it('보완 요청: amber 띠 · 다시 제출', () => {
    const { container } = renderAt(`${PATH}?mock=${encodeURIComponent('보완 요청')}`, 'supplier');
    expect(container.querySelector('[data-band="warn"]')).toBeTruthy();
    expect(screen.getByText(/보완 요청이 있습니다/)).toBeTruthy();
    expect(screen.getByText(/환불 버튼이 보여요/)).toBeTruthy();
    expect(screen.getByRole('button', { name: '다시 제출' })).toBeTruthy();
  });

  it('최종 납품: 최종 구간 · 지급 완료 띠', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('최종 납품')}`, 'supplier');
    expect(screen.getByText(/최종 납품/)).toBeTruthy();
    expect(screen.getByText(/중간 구간 승인/)).toBeTruthy();
    expect(screen.getByLabelText('노쇼 기록')).toBeTruthy();
  });

  it('마감 지남: amber 띠', () => {
    const { container } = renderAt(`${PATH}?mock=${encodeURIComponent('마감 지남')}`, 'supplier');
    expect(container.querySelector('[data-band="warn"]')).toBeTruthy();
    expect(screen.getByText(/작업 마감\(12월 16일\)이 지났습니다/)).toBeTruthy();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('정산 계좌 없음: 계좌 등록 · 제출 막힘', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('정산 계좌 없음')}`, 'supplier');
    expect(screen.getByRole('link', { name: DEMO.accountCta }).getAttribute('href')).toBe(
      ACCOUNT_HREF,
    );
    const btn = screen.getByRole('button', { name: '납품 제출' });
    expect(btn).toHaveProperty('disabled', true);
  });
});

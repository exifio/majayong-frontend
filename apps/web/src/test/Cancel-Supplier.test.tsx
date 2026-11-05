/* 공급자 취소 요청 받음 Cancel-Supplier — F-26 · 13.2 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import { DEMO, SETTLE_HREF } from '@/pages/supplier/Cancel-Supplier.data';
import { location, renderAt } from './render';

const PATH = '/s/contracts/c-ondo/cancel';

describe('Cancel-Supplier — 취소 요청 받음', () => {
  it('요청 받음: 보상액 · Deadline · primary 동의하기 · tint 이의', () => {
    const { container } = renderAt(PATH, 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.titleOpen })).toBeTruthy();
    expect(screen.getByText(/응답 기한/)).toBeTruthy();
    expect(screen.getByText(DEMO.respondHint, { exact: false })).toBeTruthy();
    expect(screen.getByText(formatWon(DEMO.net))).toBeTruthy();
    expect(screen.getByText(formatWon(DEMO.compensation))).toBeTruthy();
    expect(screen.queryByText(/3,255,000/)).toBeNull();

    const agree = screen.getByRole('button', { name: DEMO.agree });
    expect(agree.getAttribute('data-btn')).toBe('primary');
    expect(screen.getByRole('button', { name: DEMO.dispute }).getAttribute('data-btn')).toBe(
      'tint',
    );
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('이의 작성: 비율 50% 미만이면 보내기 막힘', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('이의 작성')}`, 'supplier');
    const rate = screen.getByLabelText('보상 비율');
    fireEvent.change(rate, { target: { value: '40' } });
    expect(screen.getAllByText(DEMO.rateMinNote).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: DEMO.sendObj })).toHaveProperty('disabled', true);
  });

  it('이의 작성 → 보내기 → 운영자 판정 중', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('이의 작성')}`, 'supplier');
    fireEvent.click(screen.getByRole('button', { name: DEMO.sendObj }));
    expect(decodeURIComponent(location.current)).toContain('운영자 판정 중');
  });

  it('운영자 판정 중: wait 띠', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('운영자 판정 중')}`,
      'supplier',
    );
    expect(container.querySelector('[data-band="wait"]')).toBeTruthy();
    expect(screen.getByText(DEMO.waitTitle)).toBeTruthy();
  });

  it('정산 확정: teal 띠 · 정산 내역', () => {
    const { container } = renderAt(`${PATH}?mock=${encodeURIComponent('정산 확정')}`, 'supplier');
    expect(container.querySelector('[data-band="done"]')).toBeTruthy();
    expect(screen.getByRole('link', { name: DEMO.settleCta }).getAttribute('href')).toBe(
      SETTLE_HREF,
    );
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });

  it('요청 받음에서 동의 → 정산 확정', () => {
    renderAt(PATH, 'supplier');
    fireEvent.click(screen.getByRole('button', { name: DEMO.agree }));
    expect(decodeURIComponent(location.current)).toContain('정산 확정');
  });
});

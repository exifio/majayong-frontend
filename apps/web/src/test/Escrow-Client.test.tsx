/* 의뢰인 결제(예치) Escrow-Client — F-13 · 11절 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO, LIST_HREF, escrowDemoOf } from '@/pages/client/Escrow-Client.data';
import { renderAt } from './render';

const PATH = '/c/contracts/c-ondo/escrow';

describe('Escrow-Client — 결제(예치)', () => {
  it('결제 전: 예치 기한 · SelectCards · ConfirmCheck로 primary 활성', () => {
    const { container } = renderAt(PATH, 'client');
    expect(screen.getByRole('heading', { name: DEMO.titleBefore })).toBeTruthy();
    expect(screen.getByText(/예치 기한.*11월 7일/)).toBeTruthy();
    expect(screen.getAllByText('3,100,000원').length).toBeGreaterThan(0);
    expect(screen.getByText('155,000원')).toBeTruthy();
    expect(screen.getAllByText('3,255,000원').length).toBeGreaterThan(0);

    expect(screen.getByRole('radio', { name: /카드/ })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /계좌이체/ })).toBeTruthy();

    const cta = screen.getByRole('button', { name: DEMO.cta });
    expect(cta.getAttribute('data-btn')).toBe('primary');
    expect(cta).toHaveProperty('disabled', true);
    expect(screen.getByText(DEMO.disabledReason)).toBeTruthy();

    fireEvent.click(screen.getByLabelText(DEMO.agreeLabel));
    expect(screen.getByRole('button', { name: DEMO.cta })).toHaveProperty('disabled', false);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('결제 실패: warn 띠 · 다시 결제하기(동의 체크된 채)', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('결제 실패')}`, 'client');
    expect(screen.getByText(DEMO.failTitle)).toBeTruthy();
    expect(screen.getByText(/돈은 빠져나가지 않았습니다/)).toBeTruthy();
    const retry = screen.getByRole('button', { name: DEMO.retryCta });
    expect(retry.getAttribute('data-btn')).toBe('primary');
    expect(retry).toHaveProperty('disabled', false);
  });

  it('확인 중: wait 띠 · 확인 중 비활성', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('확인 중')}`,
      'client',
    );
    expect(screen.getByText(DEMO.waitTitle)).toBeTruthy();
    const btn = screen.getByRole('button', { name: DEMO.waitingCta });
    expect(btn).toHaveProperty('disabled', true);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });

  it('예치 완료: done 띠 · 내 계약으로 · 작업 마감', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('예치 완료')}`,
      'client',
    );
    expect(screen.getByText(DEMO.doneTitle)).toBeTruthy();
    expect(screen.getByText(/작업 마감.*12월 16일/)).toBeTruthy();
    const link = screen.getByRole('link', { name: DEMO.doneCta });
    expect(link.getAttribute('data-btn')).toBe('primary');
    expect(link.getAttribute('href')).toBe(LIST_HREF);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });

  it('시연 데이터: 금액은 데이터 값', () => {
    expect(DEMO.agreed).toBe(3_100_000);
    expect(DEMO.fee).toBe(155_000);
    expect(DEMO.escrow).toBe(3_255_000);
    expect(escrowDemoOf('결제 전').showAgree).toBe(true);
    expect(escrowDemoOf('예치 완료').isDone).toBe(true);
  });
});

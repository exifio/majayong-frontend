/* 의뢰인 계약 · 전자서명 Contract-Client — F-12 · F-10 · 7.2 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  COMPARE_HREF,
  DEMO,
  contractDemoOf,
  escrowHref,
} from '@/pages/client/Contract-Client.data';
import { renderAt } from './render';

const PATH = '/c/contracts/c-ondo';

describe('Contract-Client — 계약 · 전자서명', () => {
  it('상대가 먼저 서명: 서명 기한 · 정하지 않음 · 금액 · primary 서명하기', () => {
    const { container } = renderAt(PATH, 'client');
    expect(screen.getByRole('heading', { name: DEMO.pageTitle })).toBeTruthy();
    expect(screen.getByText(/서명 기한.*11월 10일/)).toBeTruthy();
    expect(screen.getAllByText(/정하지 않음/).length).toBeGreaterThan(0);

    const unset = screen.getByText('표시 방식').closest('li');
    expect(unset?.className).toMatch(/condUnset|unset/i);

    expect(screen.getByText('3,100,000원')).toBeTruthy();
    expect(screen.getByText('155,000원')).toBeTruthy();
    expect(screen.getByText('3,255,000원')).toBeTruthy();
    expect(screen.getAllByText('1,550,000원').length).toBe(2);

    expect(screen.getByText('제4조 (검수)')).toBeTruthy();
    expect(screen.getByText(/정하지 않음'으로 적힌 조건/)).toBeTruthy();

    const primary = screen.getByRole('button', { name: '서명하기' });
    expect(primary.getAttribute('data-btn')).toBe('primary');
    expect(primary).toHaveProperty('disabled', true);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);

    expect(screen.getByRole('button', { name: DEMO.cancelLabel }).getAttribute('data-btn')).toBe(
      'warn',
    );
    expect(screen.getByText(DEMO.broker)).toBeTruthy();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('아무도 서명 전: 둘 다 대기 중', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('아무도 서명 전')}`, 'client');
    expect(screen.getAllByText('대기 중').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: '서명하기' })).toBeTruthy();
  });

  it('내가 먼저 서명: 대기 안내 · primary 없음', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('내가 먼저 서명')}`,
      'client',
    );
    expect(screen.getByText(/서명했습니다/)).toBeTruthy();
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(0);
  });

  it('양쪽 서명 완료: teal 띠 · 예치하기 · 내려받기 ghost', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('양쪽 서명 완료')}`,
      'client',
    );
    expect(screen.getByText(DEMO.escrowBandTitle)).toBeTruthy();
    expect(screen.getAllByText(/11월 7일 23:59까지 예치/).length).toBeGreaterThan(0);
    const escrow = screen.getByRole('link', { name: DEMO.escrowCta });
    expect(escrow.getAttribute('data-btn')).toBe('primary');
    expect(escrow.getAttribute('href')).toBe(escrowHref());
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(screen.getByRole('button', { name: DEMO.download }).getAttribute('data-btn')).toBe(
      'ghost',
    );
  });

  it('결렬 — 공급자 서명 거절: amber 띠 · 제안 비교', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('결렬 — 공급자 서명 거절')}`, 'client');
    expect(screen.getByText(/공급자가 서명을 거절했습니다/)).toBeTruthy();
    expect(screen.getByRole('link', { name: DEMO.compareCta }).getAttribute('href')).toBe(
      COMPARE_HREF,
    );
  });

  it('결렬 — 기한 초과: amber 띠', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('결렬 — 기한 초과')}`, 'client');
    expect(screen.getByText(/서명 기한이 지났습니다/)).toBeTruthy();
    expect(screen.getByRole('link', { name: DEMO.compareCta })).toBeTruthy();
  });

  it('임시 계약 취소 확인: ConfirmDialog danger · 파란 버튼 없음', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('임시 계약 취소 확인')}`,
      'client',
    );
    const dialog = screen.getByRole('dialog', { name: DEMO.cancelDialogTitle });
    expect(within(dialog).getByRole('button', { name: DEMO.cancelConfirm }).getAttribute('data-btn')).toBe(
      'warn',
    );
    expect(dialog.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    fireEvent.click(within(dialog).getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('dialog', { name: DEMO.cancelDialogTitle })).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('시연 데이터: 금액 · 서명 상태', () => {
    const d = contractDemoOf('상대가 먼저 서명');
    expect(d.canSign).toBe(true);
    expect(d.supplier.chip).toBe('서명 완료');
    expect(d.client.chip).toBe('대기 중');
    expect(DEMO.agreed).toBe(3_100_000);
    expect(DEMO.escrow).toBe(3_255_000);
  });
});

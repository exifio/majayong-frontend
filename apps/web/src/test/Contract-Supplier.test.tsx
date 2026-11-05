/* 공급자 계약 · 전자서명 Contract-Supplier — F-12 · 7.2 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  APPS_HREF,
  DEMO,
  LIST_HREF,
  contractSDemoOf,
} from '@/pages/supplier/Contract-Supplier.data';
import { renderAt } from './render';

const PATH = '/s/contracts/c-ondo';

describe('Contract-Supplier — 계약 · 전자서명', () => {
  it('상대가 먼저 서명: 서명 기한 · 받을 금액 · primary 서명하기', () => {
    const { container } = renderAt(PATH, 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.pageTitle })).toBeTruthy();
    expect(screen.getByText(/서명 기한.*11월 10일/)).toBeTruthy();
    expect(screen.getAllByText(/정하지 않음/).length).toBeGreaterThan(0);

    expect(screen.getByText('3,100,000원')).toBeTruthy();
    expect(screen.getByText('155,000원')).toBeTruthy();
    expect(screen.getByText('2,945,000원')).toBeTruthy();
    expect(screen.getAllByText('1,472,500원').length).toBe(2);

    const primary = screen.getByRole('button', { name: '서명하기' });
    expect(primary.getAttribute('data-btn')).toBe('primary');
    expect(primary).toHaveProperty('disabled', true);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);

    expect(screen.getByRole('button', { name: DEMO.rejectLabel }).getAttribute('data-btn')).toBe(
      'warn',
    );
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('아무도 서명 전: 둘 다 대기 중', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('아무도 서명 전')}`, 'supplier');
    expect(screen.getAllByText('대기 중').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: '서명하기' })).toBeTruthy();
  });

  it('내가 먼저 서명: 대기 안내 · primary 없음', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('내가 먼저 서명')}`,
      'supplier',
    );
    expect(screen.getByText(/서명했습니다/)).toBeTruthy();
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(0);
  });

  it('양쪽 서명 완료: teal 띠 · 내 계약으로', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('양쪽 서명 완료')}`,
      'supplier',
    );
    expect(screen.getByText(DEMO.doneBandTitle)).toBeTruthy();
    expect(screen.getByText(/의뢰인 예치를 기다리는 중/)).toBeTruthy();
    const list = screen.getByRole('link', { name: DEMO.listCta });
    expect(list.getAttribute('data-btn')).toBe('primary');
    expect(list.getAttribute('href')).toBe(LIST_HREF);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });

  it('결렬 — 기한 초과: amber 띠', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('결렬 — 기한 초과')}`, 'supplier');
    expect(screen.getByText(/서명 기한이 지났습니다/)).toBeTruthy();
    expect(screen.getByRole('link', { name: DEMO.appsCta }).getAttribute('href')).toBe(APPS_HREF);
  });

  it('서명 거절 확인: ConfirmDialog danger · 파란 버튼 없음', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('서명 거절 확인')}`,
      'supplier',
    );
    const dialog = screen.getByRole('dialog', { name: DEMO.rejectDialogTitle });
    expect(
      within(dialog).getByRole('button', { name: DEMO.rejectConfirm }).getAttribute('data-btn'),
    ).toBe('warn');
    expect(dialog.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    fireEvent.click(within(dialog).getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('dialog', { name: DEMO.rejectDialogTitle })).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('시연 데이터: 금액 · 서명 상태', () => {
    const d = contractSDemoOf('상대가 먼저 서명');
    expect(d.canSign).toBe(true);
    expect(d.client.chip).toBe('서명 완료');
    expect(d.supplier.chip).toBe('대기 중');
    expect(DEMO.agreed).toBe(3_100_000);
    expect(DEMO.net).toBe(2_945_000);
    expect(DEMO.stageNet).toBe(1_472_500);
  });
});

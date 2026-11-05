/* 검수 Inspect-Client — F-13 · 11.3 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import { location, renderAt } from './render';
import { DEMO, inspectDemoOf } from '@/pages/client/Inspect-Client.data';

const PATH = '/c/contracts/c-ondo/inspect';

describe('Inspect-Client — 검수', () => {
  it('검수 대기: 구간 금액 · Deadline · 납품물 · primary 승인하기', () => {
    const { container } = renderAt(PATH, 'client');
    const root = container.querySelector('[data-screen="Inspect-Client"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.pageTitle })).toBeTruthy();
    expect(within(root).getAllByText(formatWon(DEMO.stageAmount)).length).toBeGreaterThan(0);
    expect(within(root).getByText(/검수 기한/)).toBeTruthy();
    expect(within(root).getAllByText(DEMO.deliveryHeading).length).toBeGreaterThan(0);
    const approve = within(root).getByRole('button', { name: DEMO.approve });
    expect(approve.getAttribute('data-btn')).toBe('primary');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('승인 확인: ConfirmDialog 문구', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('승인 확인')}`, 'client');
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText(DEMO.approveDialogBody)).toBeTruthy();
  });

  it('보완 요청 작성: 사유 비면 보내기 비활성', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('보완 요청 작성')}`,
      'client',
    );
    const root = container.querySelector('[data-screen="Inspect-Client"]') as HTMLElement;
    expect(within(root).getByText(DEMO.fixTitle)).toBeTruthy();
    const send = within(root).getByRole('button', { name: DEMO.fixSend });
    expect(send.hasAttribute('disabled')).toBe(false);
    fireEvent.change(within(root).getByLabelText('사유'), { target: { value: '' } });
    expect(within(root).getByRole('button', { name: DEMO.fixSend }).hasAttribute('disabled')).toBe(
      true,
    );
  });

  it('검수 기한 하루 전: amber 띠', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('검수 기한 하루 전')}`, 'client');
    expect(screen.getByText(DEMO.dueTitle)).toBeTruthy();
  });

  it('중간 승인 완료: teal 띠 · 내 계약으로', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('중간 승인 완료')}`,
      'client',
    );
    const root = container.querySelector('[data-screen="Inspect-Client"]') as HTMLElement;
    expect(within(root).getByText(DEMO.midDoneTitle)).toBeTruthy();
    const cta = within(root).getByRole('link', { name: DEMO.toContracts });
    expect(cta.getAttribute('href')).toBe('/c/contracts');
    expect(cta.getAttribute('data-btn')).toBe('primary');
  });

  it('최종 검수 승인 → 리뷰', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('최종 검수')}`, 'client');
    fireEvent.click(screen.getByRole('button', { name: DEMO.approve }));
    fireEvent.click(screen.getByRole('button', { name: DEMO.approveConfirm }));
    expect(location.current.startsWith('/c/contracts/c-ondo/review')).toBe(true);
  });

  it('도움 요청 상태', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('도움 요청')}`, 'client');
    expect(screen.getByText(DEMO.helpSent)).toBeTruthy();
  });

  it('시연 데이터', () => {
    expect(inspectDemoOf('최종 검수').stage).toBe('final');
    expect(inspectDemoOf('중간 승인 완료').midDone).toBe(true);
  });
});

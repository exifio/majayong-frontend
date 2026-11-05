/* 의뢰인 최종 합의 내용 확인 Agreement-Client — F-20 · D4 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  DEMO,
  agreementDemoOf,
  chatHref,
  contractHref,
} from '@/pages/client/Agreement-Client.data';
import { renderAt } from './render';

const PATH = '/c/chat/p-ondo/s-junho/agreement';

describe('Agreement-Client — 최종 합의 내용 확인', () => {
  it('미정 있음: amber 띠 1건 · 표시 방식만 미정 · 금액 · primary 하나', () => {
    const { container } = renderAt(PATH, 'client');
    expect(screen.getByRole('heading', { name: DEMO.pageTitle })).toBeTruthy();
    expect(screen.getByText(DEMO.openBandTitle)).toBeTruthy();
    expect(screen.getAllByText(/정하지 않음/).length).toBeGreaterThan(0);

    const noshow = screen.getByLabelText('노쇼 기록');
    expect(within(noshow).getByText('표시 방식')).toBeTruthy();
    expect(within(noshow).getAllByText('아직 안 정함').length).toBeGreaterThan(0);
    expect(within(noshow).getByRole('link', { name: '채팅에서 정하기' }).getAttribute('href')).toBe(
      chatHref('p-ondo', 's-junho'),
    );

    expect(screen.getByText('3,100,000원')).toBeTruthy();
    expect(screen.getByText('155,000원')).toBeTruthy();
    expect(screen.getByText('3,255,000원')).toBeTruthy();
    expect(screen.getByText(DEMO.payRatio)).toBeTruthy();

    const primary = screen.getByRole('link', { name: DEMO.submit });
    expect(primary.getAttribute('data-btn')).toBe('primary');
    expect(primary.getAttribute('href')).toBe(contractHref());
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);

    expect(screen.getByRole('link', { name: DEMO.backChat }).getAttribute('href')).toBe(
      chatHref('p-ondo', 's-junho'),
    );
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('모두 정해짐: teal 띠 · 미정 칩 없음', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('모두 정해짐')}`, 'client');
    expect(screen.getByText(DEMO.doneBandTitle)).toBeTruthy();
    expect(screen.queryByText(DEMO.openBandTitle)).toBeNull();
    expect(screen.getAllByText('정해짐').length).toBeGreaterThan(0);
    expect(screen.queryByText('아직 안 정함')).toBeNull();
  });

  it('첫 문장 기능 빠짐: amber Note · 견적 2,800,000', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('첫 문장 기능 빠짐')}`, 'client');
    expect(screen.getByText(DEMO.droppedTitle)).toBeTruthy();
    expect(screen.getAllByText(/노쇼 기록/).length).toBeGreaterThan(0);
    expect(screen.getByText('2,800,000원')).toBeTruthy();
    expect(screen.getByText('140,000원')).toBeTruthy();
    expect(screen.getByText('2,940,000원')).toBeTruthy();
    const gone = screen.getByLabelText('노쇼 기록');
    expect(within(gone).getByText(/채팅에서 빼기로 함/)).toBeTruthy();
  });

  it('근거 보기: 환불 기준 팝오버 · 채팅에서 보기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('근거 보기')}`, 'client');
    const dialog = screen.getByRole('dialog', { name: '환불 기준의 근거' });
    expect(within(dialog).getAllByText(/AI 정리/).length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText(/전액 환불/).length).toBeGreaterThan(0);
    expect(within(dialog).getByRole('link', { name: DEMO.evidenceCta }).getAttribute('href')).toBe(
      chatHref('p-ondo', 's-junho'),
    );
    fireEvent.click(within(dialog).getByLabelText('닫기'));
    expect(screen.queryByRole('dialog', { name: '환불 기준의 근거' })).toBeNull();
  });

  it('시연 데이터: 미정은 표시 방식 1건', () => {
    const d = agreementDemoOf('미정 있음');
    expect(d.nOpen).toBe(1);
    expect(d.nAll).toBe(10);
    const unset = d.features.flatMap((f) => f.conds).filter((c) => c.status !== 'ok');
    expect(unset).toHaveLength(1);
    expect(unset[0]?.name).toBe('표시 방식');
  });
});

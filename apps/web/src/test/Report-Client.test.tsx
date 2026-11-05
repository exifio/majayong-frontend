/* 의뢰인 단가 분석 리포트 Report-Client — 상태 · 금액 · 반영 · 모달 닫기 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  HOPE_BUDGET,
  REPORT_MOCKS,
  quoteOf,
  reportDemoOf,
} from '@/pages/client/Report-Client.data';
import { location, renderAt } from './render';

const PATH = '/c/drafts/d-1';

function open(mock?: string) {
  const q = new URLSearchParams({ modal: 'report' });
  if (mock) q.set('mock', mock);
  return renderAt(`${PATH}?${q.toString()}`, 'client');
}

describe('Report-Client — 단가 분석 리포트', () => {
  it('정의된 mock이 routes 상태와 같다', () => {
    expect([...REPORT_MOCKS]).toEqual(['예산 안', '예산 초과', '만드는 중 포함']);
  });

  it('예산 안: 4건 합계 4,410,000 · 제외 회색 · 파란 버튼 하나', () => {
    const { container } = open('예산 안');
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('AI 예상 · 참고용')).toBeTruthy();
    expect(within(dialog).getByText('포함 4건 · 수수료 전')).toBeTruthy();
    expect(dialog.textContent).toMatch(/약\s*1,400,000원/);
    expect(within(dialog).getAllByText('들어간 작업')).toHaveLength(4);
    expect(within(dialog).getAllByText('작업량 기준')).toHaveLength(4);
    expect(within(dialog).getAllByText('달라질 수 있는 것')).toHaveLength(4);
    expect(within(dialog).getByText('합계의 33%')).toBeTruthy();

    expect(within(dialog).getByText('이번 범위에서 제외 — 합계에 넣지 않습니다')).toBeTruthy();
    expect(within(dialog).getByText('단골 등급 관리')).toBeTruthy();
    expect(dialog.textContent).toMatch(/약\s*660,000원/);

    expect(dialog.textContent).toMatch(/약\s*4,200,000원/);
    expect(dialog.textContent).toMatch(/약\s*210,000원/);
    expect(dialog.textContent).toMatch(/약\s*4,410,000원/);
    expect(within(dialog).getByText(/예산보다 590,000원쯤 적습니다/)).toBeTruthy();
    expect(within(dialog).queryByText(/많습니다/)).toBeNull();
    expect(within(dialog).queryByText(/비싸|적정|추천/)).toBeNull();
    expect(within(dialog).getByText(/참고용 추정치이며 실제 견적과 다를 수 있습니다/)).toBeTruthy();

    const primary = dialog.querySelectorAll('[data-btn="primary"]');
    expect(primary).toHaveLength(1);
    expect(primary[0]!.textContent).toBe('예상 총액을 희망 예산으로 반영');
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('예산 초과: 단골 포함 · amber 문구 · 제외 없음', () => {
    open('예산 초과');
    const dialog = screen.getByRole('dialog');
    const demo = reportDemoOf('예산 초과');
    expect(quoteOf(demo.included).total).toBe(5_103_000);
    expect(within(dialog).getByText('포함 5건 · 수수료 전')).toBeTruthy();
    expect(within(dialog).queryByText('이번 범위에서 제외 — 합계에 넣지 않습니다')).toBeNull();
    expect(within(dialog).getByText(/예산보다 103,000원쯤 많습니다/)).toBeTruthy();
    expect(within(dialog).getByText(/많습니다/).className).toMatch(/resOver|Over/);
    expect(HOPE_BUDGET).toBe(5_000_000);
  });

  it('만드는 중 포함: 중립 칩 · 금액 미정 · 합계는 정본', () => {
    open('만드는 중 포함');
    const dialog = screen.getByRole('dialog');
    const chip = within(dialog).getByText('만드는 중');
    expect(chip.getAttribute('data-chip')).toBe('neutral');
    expect(within(dialog).getByText('단체 예약 접수')).toBeTruthy();
    expect(within(dialog).getByText('+ 금액 미정 1건(만드는 중)')).toBeTruthy();
    expect(dialog.textContent).toMatch(/약\s*4,410,000원/);
    expect(within(dialog).getByText('이번 범위에서 제외 — 합계에 넣지 않습니다')).toBeTruthy();
  });

  it('반영하면 ?modal을 지우고 2분할로 돌아간다', () => {
    open('예산 안');
    fireEvent.click(screen.getByRole('button', { name: '예상 총액을 희망 예산으로 반영' }));
    const q = new URLSearchParams(location.current.split('?')[1] ?? '');
    expect(location.current.startsWith(PATH)).toBe(true);
    expect(q.get('modal')).toBeNull();
    expect(q.get('mock')).toBe('예산 안');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('닫기도 모달만 지운다', () => {
    open('예산 초과');
    const dialog = screen.getByRole('dialog');
    // Modal ×(aria-label=닫기)와 본문 ghost '닫기'가 둘 있다 — 본문 버튼을 누른다
    fireEvent.click(dialog.querySelector('[data-btn="ghost"]')!);
    const q = new URLSearchParams(location.current.split('?')[1] ?? '');
    expect(q.get('modal')).toBeNull();
    expect(q.get('mock')).toBe('예산 초과');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

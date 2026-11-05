/* 의뢰인 초안 · 명세 2분할 Draft-Client — 상태 · 합계 · 추가 · 삭제 · 되돌리기 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  CHAT,
  DRAFT_MOCKS,
  confirmHref,
  creatingHref,
  draftHref,
  quoteOf,
} from '@/pages/client/Draft-Client.data';
import { renderAt } from './render';

const BASE = '/c/drafts/d-1';

function open(mock?: string) {
  const path = mock ? `${BASE}?mock=${encodeURIComponent(mock)}` : BASE;
  return renderAt(path, 'client');
}

describe('Draft-Client — 초안 · 명세 2분할', () => {
  it('정의된 mock이 routes 상태와 같다', () => {
    expect([...DRAFT_MOCKS]).toEqual(['기본', '초안 만드는 중', '만들기 실패', '채팅 반영 중']);
  });

  it('정본 4건의 합계는 4,200,000 + 수수료 5% = 4,410,000', () => {
    expect(quoteOf([
      { amount: 1_400_000 },
      { amount: 1_200_000 },
      { amount: 1_000_000 },
      { amount: 600_000 },
    ])).toEqual({ count: 4, sub: 4_200_000, fee: 210_000, total: 4_410_000, tbd: 0 });
  });

  it('기본: 명세에 금액·출처 없음, 합계와 확정·리포트·채팅', () => {
    const { container } = open();
    expect(screen.getByRole('heading', { name: '틀린 곳을 고쳐주세요' })).toBeTruthy();
    const spec = screen.getByRole('region', { name: '요구사항 명세' });
    expect(within(spec).getByText('명세 항목 4개')).toBeTruthy();
    const items = within(spec).getByRole('list', { name: '명세 항목' });
    expect(items.textContent).toContain('예약 달력');
    expect(items.textContent).toContain('공급자와 정할 것 · 2건');
    expect(items.textContent).toContain('전날 취소면 돌려주고 싶음');
    expect(items.textContent).not.toMatch(/\d원|출처/);

    const draft = screen.getByRole('region', { name: '화면 초안' });
    expect(draft.textContent).not.toMatch(/\d원/);
    expect(draft.textContent).toContain('노쇼가 나도 재료값은 돌려받고 싶다면');
    expect(container.querySelector('[data-canvas] [data-chip]')).toBeNull();
    expect(container.querySelector('[data-canvas] [data-btn]')).toBeNull();

    expect(screen.getByText('4,200,000원')).toBeTruthy();
    expect(screen.getByText('210,000원')).toBeTruthy();
    expect(screen.getByText('4,410,000원')).toBeTruthy();
    expect(screen.getByText(/5,000,000원보다 590,000원 적습니다/)).toBeTruthy();
    expect(screen.getByText(/참고용 추정치이며, 실제 견적과 다를 수 있습니다/)).toBeTruthy();
    expect(screen.getByText('이번 범위에서 제외').parentElement?.textContent).toContain('단골 등급 관리');

    expect(screen.getByRole('link', { name: '명세 확정하기' }).getAttribute('href')).toBe(confirmHref('d-1'));
    expect(screen.getByRole('link', { name: '단가 분석 리포트 보기' }).getAttribute('href')).toBe(`${BASE}?modal=report`);
    expect(screen.getByRole('link', { name: '처음부터' }).getAttribute('href')).toBe('/c/drafts/new');
    expect(screen.getByText(/남은 채팅 수정/).textContent).toContain('27');
    expect(screen.getByText(/30회/)).toBeTruthy();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('추천 블록을 누르면 명세와 합계가 바로 바뀐다', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /노쇼가 나도 재료값은 돌려받고 싶다면/ }));
    expect(screen.queryByRole('button', { name: /노쇼가 나도 재료값은 돌려받고 싶다면/ })).toBeNull();
    const items = screen.getByRole('list', { name: '명세 항목' });
    expect(items.textContent).toContain('노쇼 위약금 자동 청구');
    expect(items.textContent).not.toMatch(/\d원/);
    expect(screen.getByText('명세 항목 5개')).toBeTruthy();
    expect(screen.getByText('5,061,000원')).toBeTruthy();
    expect(screen.getByText(/61,000원 많습니다/)).toBeTruthy();
  });

  it('금액 미정 블록은 합계에서 빼고 건수로 보여 준다', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /알레르기·선호 메모/ }));
    expect(screen.getByText('+ 금액 미정 1건')).toBeTruthy();
    expect(screen.getByText('4,410,000원')).toBeTruthy();
    expect(screen.getByText('기능 4건 합계')).toBeTruthy();
  });

  it('지우면 제외로 내려가고 되돌리면 합계가 돌아온다', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: '예약 달력 지우기' }));
    expect(screen.queryByRole('button', { name: '예약 달력 지우기' })).toBeNull();
    expect(screen.getByRole('list', { name: '명세 항목' }).textContent).not.toContain('회차별로 예약받고');
    expect(screen.getByText('2,940,000원')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '예약 달력 되돌리기' }));
    expect(screen.getByRole('button', { name: '예약 달력 지우기' })).toBeTruthy();
    expect(screen.getByText('4,410,000원')).toBeTruthy();
  });

  it('제외된 단골 등급을 되돌리면 합계에 66만이 더해진다', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: '단골 등급 관리 되돌리기' }));
    expect(screen.queryByText('이번 범위에서 제외')).toBeNull();
    expect(screen.getByRole('list', { name: '명세 항목' }).textContent).toContain('단골 등급 관리');
    expect(screen.getByText('5,103,000원')).toBeTruthy();
  });

  it('메모를 남기면 항목에 바로 보인다', () => {
    open();
    const item = within(screen.getByRole('list', { name: '명세 항목' })).getByText('노쇼 기록').closest('li')!;
    fireEvent.click(within(item).getByRole('button', { name: '메모 남기기' }));
    fireEvent.change(within(item).getByLabelText('노쇼 기록 메모'), { target: { value: '전화로 온 노쇼만' } });
    fireEvent.click(within(item).getByRole('button', { name: '저장' }));
    expect(within(item).getByText('전화로 온 노쇼만')).toBeTruthy();
  });

  it('초안 만드는 중: 3단계 · 스켈레톤 · 취소', () => {
    const { container } = open('초안 만드는 중');
    expect(screen.getByRole('heading', { name: '화면 초안을 그리고 있습니다' })).toBeTruthy();
    expect(screen.getByText('문장 읽기')).toBeTruthy();
    expect(screen.getByText('기능 고르기')).toBeTruthy();
    expect(screen.getByText('화면 그리기')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: '초안 만들기 진행' })).toBeTruthy();
    expect(screen.getByText(/보통 8초쯤 걸립니다/)).toBeTruthy();
    const cancel = screen.getByRole('link', { name: '취소' });
    expect(cancel.getAttribute('data-btn')).toBe('text');
    expect(cancel.getAttribute('href')).toBe('/c/drafts/new');
    expect(container.querySelector('[data-btn="primary"]')).toBeNull();
    expect(screen.queryByLabelText(CHAT.label)).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('만들기 실패: amber 띠 · 다시 만들기 하나 · 업종 기본 구성', () => {
    const { container } = open('만들기 실패');
    expect(screen.getByRole('status').textContent).toContain('초안을 만들지 못했습니다');
    const again = screen.getByRole('link', { name: '다시 만들기' });
    expect(again.getAttribute('data-btn')).toBe('primary');
    expect(again.getAttribute('href')).toBe(creatingHref('d-1'));
    const alt = screen.getByRole('link', { name: '업종 기본 구성으로 시작' });
    expect(alt.getAttribute('data-btn')).toBe('ghost');
    expect(alt.getAttribute('href')).toBe(draftHref('d-1'));
    expect(screen.getByRole('link', { name: '문장 고치기' }).getAttribute('href')).toBe('/c/drafts/new');
    expect(container.querySelectorAll('[data-btn="primary"]')).toHaveLength(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('채팅 반영 중: 보낸 문장과 반영 중 칩. 캔버스에는 칩이 없다', () => {
    const { container } = open('채팅 반영 중');
    const input = screen.getByLabelText(CHAT.label) as HTMLInputElement;
    expect(input.value).toBe(CHAT.reflecting);
    expect(input.disabled).toBe(true);
    expect(screen.getByText('반영 중').getAttribute('data-chip')).toBe('blue');
    const busy = screen.getByRole('button', { name: '반영 중…' });
    expect(busy.hasAttribute('disabled')).toBe(true);
    expect(busy.getAttribute('data-btn')).toBe('tint');
    expect(container.querySelector('[data-canvas] [data-chip]')).toBeNull();
    expect(screen.getByRole('link', { name: '단가 분석 리포트 보기' }).getAttribute('href')).toContain('modal=report');
    expect(findDesignViolations(container)).toEqual([]);
  });
});

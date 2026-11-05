/* 의뢰인 명세 보기 Spec-Client — F-03 · 11.2 · 13.2 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  DEMO,
  DRAFT_HREF,
  compareHref,
  isWithinExtend,
  specDemoOf,
} from '@/pages/client/Spec-Client.data';
import { location, renderAt } from './render';

const PATH = '/c/projects/p-ondo';
const COMPARE = compareHref('p-ondo');

describe('Spec-Client — 명세 보기', () => {
  it('기본: 공개 범위 · 기능 · 희망 예산 · 제안 비교 · AI 금액 없음', () => {
    const { container } = renderAt(PATH, 'client');
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(screen.getByText('모집 중')).toBeTruthy();
    expect(screen.getByText(DEMO.deadlineLabel)).toBeTruthy();

    const pub = screen.getByLabelText('공개 범위');
    expect(within(pub).getByText('전체 공개')).toBeTruthy();
    expect(within(pub).getByText('상세 공개')).toBeTruthy();

    expect(screen.getByRole('region', { name: '예약 달력' })).toBeTruthy();
    expect(screen.getByText('전날 취소면 돌려주고 싶음')).toBeTruthy();
    expect(screen.getByText('5,000,000원')).toBeTruthy();
    expect(screen.getByText(DEMO.period)).toBeTruthy();

    const compare = screen.getByRole('link', { name: '제안 비교 보기' });
    expect(compare.getAttribute('href')).toBe(COMPARE);
    expect(compare.getAttribute('data-btn')).toBe('tint');

    expect(container.textContent).not.toMatch(/AI 예상|블록 단가|플랫폼 수수료/);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('명세 고치기 확인: ConfirmDialog → 2분할', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('명세 고치기 확인')}`, 'client');
    const dialog = screen.getByRole('dialog', { name: DEMO.editTitle });
    expect(within(dialog).getByText(/이전 명세 기준/)).toBeTruthy();
    expect(within(dialog).getByText(/재견적 요청/)).toBeTruthy();

    fireEvent.click(within(dialog).getByRole('button', { name: '명세 고치기' }));
    expect(location.current.startsWith(DRAFT_HREF)).toBe(true);
  });

  it('마감 연장: 지금 마감부터 최대 14일', () => {
    expect(isWithinExtend('2026-11-10')).toBe(true);
    expect(isWithinExtend('2026-11-17')).toBe(true);
    expect(isWithinExtend('2026-11-18')).toBe(false);
    expect(isWithinExtend('2026-11-03')).toBe(false);

    renderAt(`${PATH}?mock=${encodeURIComponent('마감 연장')}`, 'client');
    const dialog = screen.getByRole('dialog', { name: DEMO.extendTitle });
    expect(within(dialog).getByText(DEMO.extendHint)).toBeTruthy();
    expect(within(dialog).getByLabelText('새 마감일')).toBeTruthy();

    const input = within(dialog).getByLabelText('새 마감일') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2026-12-01' } });
    expect(within(dialog).getByRole('alert').textContent).toBe(DEMO.extendHint);
    expect((within(dialog).getByRole('button', { name: '마감 연장' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('임시 계약 중: 명세 고치기 비활성 + 이유', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('임시 계약 중')}`, 'client');
    expect(screen.getByText('임시 계약 중 · 서명 대기')).toBeTruthy();
    const edit = screen.getByRole('button', { name: '명세 고치기' }) as HTMLButtonElement;
    expect(edit.disabled).toBe(true);
    expect(screen.getByText(DEMO.heldWhy)).toBeTruthy();
    expect(screen.queryByRole('button', { name: '마감 연장' })).toBeNull();
  });

  it('모집 시작됨: teal 띠 · 열람 0 · 지원 0', () => {
    const d = specDemoOf('모집 시작됨');
    expect(d.views).toBe('0명');
    expect(d.apps).toBe('0건');

    const { container } = renderAt(`${PATH}?mock=${encodeURIComponent('모집 시작됨')}`, 'client');
    expect(screen.getByText(new RegExp(DEMO.startedTitle))).toBeTruthy();
    expect(container.querySelector('[data-band="done"]')).toBeTruthy();
    expect(screen.getAllByText('0명').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0건').length).toBeGreaterThan(0);
  });
});

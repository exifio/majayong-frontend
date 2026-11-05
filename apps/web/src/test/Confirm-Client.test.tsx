/* 의뢰인 명세 확정 Confirm-Client — 범위 · 날짜 · 동의 · CTA */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  DEMO,
  DRAFT_HREF,
  SPEC_STARTED_HREF,
  isStartBeforeEnd,
} from '@/pages/client/Confirm-Client.data';
import { renderAt } from './render';

const PATH = '/c/drafts/d-1/confirm';

describe('Confirm-Client — 명세 확정', () => {
  it('날짜 비교: 시작이 마감보다 앞이어야 한다', () => {
    expect(isStartBeforeEnd('2026. 10. 27', '2026. 11. 3')).toBe(true);
    expect(isStartBeforeEnd('2026. 11. 5', '2026. 11. 3')).toBe(false);
    expect(isStartBeforeEnd('2026. 11. 3', '2026. 11. 3')).toBe(false);
  });

  it('확정 범위 · 자동 제목 · AI 금액 없음 · 공개 범위 두 카드', () => {
    const { container } = renderAt(PATH, 'client');
    expect(screen.getByRole('heading', { name: DEMO.pageTitle })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '1. 확정될 범위' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '2. 등록 정보와 모집 기간' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '3. 공개 범위 동의' })).toBeTruthy();

    expect(screen.getByText(DEMO.title)).toBeTruthy();
    expect(screen.getByText('예약 달력')).toBeTruthy();
    expect(screen.getByText('예약금 결제')).toBeTruthy();
    expect(screen.getByText('전날 취소면 돌려주고 싶음')).toBeTruthy();
    expect(screen.getByText('단골 등급 관리')).toBeTruthy();

    const scope = screen.getByRole('heading', { name: '1. 확정될 범위' }).closest('section')!;
    expect(scope.textContent).not.toMatch(/\d원|AI 예상|수수료/);

    const pub = screen.getByLabelText('공개 범위');
    expect(within(pub).getByText('전체 공개')).toBeTruthy();
    expect(within(pub).getByText('상세 공개')).toBeTruthy();
    expect(within(pub).getByText(/프로필 포함/)).toBeTruthy();

    expect(screen.getByRole('link', { name: '초안으로 돌아가기' }).getAttribute('href')).toBe(DRAFT_HREF);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('동의 전에는 파란 버튼이 비활성이다', () => {
    const { container } = renderAt(PATH, 'client');
    const primary = container.querySelector('button[data-btn="primary"][disabled]');
    expect(primary).not.toBeNull();
    expect(primary!.textContent).toBe('확정하고 공급자 모집 시작');
    expect(screen.getByText(DEMO.needConsent)).toBeTruthy();
    expect(screen.queryByRole('link', { name: '확정하고 공급자 모집 시작' })).toBeNull();
  });

  it('동의하면 명세 보기(모집 시작됨)로 간다', () => {
    renderAt(PATH, 'client');
    fireEvent.click(screen.getByRole('checkbox'));
    const cta = screen.getByRole('link', { name: '확정하고 공급자 모집 시작' });
    expect(cta.getAttribute('href')).toBe(SPEC_STARTED_HREF);
    expect(cta.getAttribute('data-btn')).toBe('primary');
  });

  it('시작일이 마감보다 늦으면 폼 오류 · 확정 불가', () => {
    renderAt(PATH, 'client');
    fireEvent.click(screen.getByRole('checkbox'));
    const start = screen.getByLabelText('모집 시작');
    fireEvent.change(start, { target: { value: '2026. 11. 5' } });
    expect(start.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe(DEMO.dateError);
    expect(screen.queryByRole('link', { name: '확정하고 공급자 모집 시작' })).toBeNull();
    expect(screen.getAllByText(DEMO.needDate).length).toBeGreaterThan(0);
  });

  it('희망 예산만 금액으로 보이고 AI 합계는 없다', () => {
    renderAt(PATH, 'client');
    expect(screen.getByText('5,000,000원')).toBeTruthy();
    expect(screen.queryByText(/AI 예상|플랫폼 수수료|4,410,000/)).toBeNull();
  });
});

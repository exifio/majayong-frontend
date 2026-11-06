/* 의뢰인 제안 비교 Compare-Client — F-09 · 디자인 시스템 10.5 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  DEMO,
  chatHref,
  compareDemoOf,
  withFee,
} from '@/pages/client/Compare-Client.data';
import { formatWon } from '@/lib/format';
import { location, renderAt } from './render';
import compareStyles from '@/pages/client/Compare-Client.module.css';

const PATH = '/c/projects/p-ondo/proposals';

afterEach(() => vi.unstubAllGlobals());

describe('Compare-Client — 제안 비교', () => {
  it('지원 3건: 카드 · 수수료 줄 · 채팅 링크 · 판정·파란 버튼 없음', () => {
    const { container } = renderAt(PATH, 'client');
    expect(screen.getByRole('heading', { level: 1, name: '제안 비교' })).toBeTruthy();
    expect(screen.getByText(new RegExp(DEMO.viewsLabel))).toBeTruthy();
    expect(screen.getByText(/지원 3건/)).toBeTruthy();

    expect(screen.getByLabelText('최준호')).toBeTruthy();
    expect(screen.getByLabelText('김세라')).toBeTruthy();
    expect(screen.getByLabelText('스튜디오 넛')).toBeTruthy();

    expect(screen.getByText('3,100,000원')).toBeTruthy();
    expect(screen.getByText(`수수료 포함 ${formatWon(withFee(3_100_000))}`)).toBeTruthy();
    expect(screen.getByText(/채팅에서 수정 · 처음 3,000,000원/)).toBeTruthy();
    expect(screen.getByText(/리뷰 없음/)).toBeTruthy();
    expect(screen.getByText(/질문 2/)).toBeTruthy();

    const chats = screen.getAllByRole('link', { name: /문의하기 \(채팅\)/ });
    expect(chats[0]!.getAttribute('href')).toBe(chatHref('p-ondo', 's-junho'));
    expect(chats[0]!.getAttribute('data-btn')).toBe('tint');

    expect(container.textContent).not.toMatch(/최저가|추천|예산 초과|예산 대비/);
    expect(container.querySelector('[data-btn="primary"]')).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('카드를 누르면 견적서 모달로 간다', () => {
    renderAt(PATH, 'client');
    fireEvent.click(screen.getByLabelText('최준호'));
    expect(location.current).toContain('modal=quote');
    expect(location.current).toContain('sid=s-junho');
  });

  it('거절 확인: ConfirmDialog danger', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('거절 확인')}`, 'client');
    const dialog = screen.getByRole('dialog', { name: /김세라님의 지원을 거절할까요/ });
    expect(within(dialog).getByText(/되돌릴 수 없습니다/)).toBeTruthy();
    expect(within(dialog).getByText(/읽기 전용/)).toBeTruthy();
    const warn = within(dialog).getByRole('button', { name: '거절하기' });
    expect(warn.getAttribute('data-btn')).toBe('warn');
    expect(dialog.querySelector('[data-btn="primary"]')).toBeNull();
  });

  it('임시 계약 중: 보류 칩 · DS 이유 문구', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('임시 계약 중')}`, 'client');
    expect(screen.getByText('임시 계약 · 서명 대기')).toBeTruthy();
    expect(screen.getAllByText('보류').length).toBeGreaterThan(0);
    expect(screen.getAllByText(DEMO.heldWhy).length).toBeGreaterThan(0);
  });

  it('지원 0건 · 마감: 빈 상태 · 마감 연장 · 명세 고치기 · primary 없음', () => {
    const { container } = renderAt(`${PATH}?mock=${encodeURIComponent('지원 0건 · 마감')}`, 'client');
    expect(screen.getByLabelText('지원 없음')).toBeTruthy();
    expect(screen.getByText(DEMO.zeroTitle)).toBeTruthy();
    expect(screen.getByRole('link', { name: '마감 연장' }).getAttribute('data-btn')).toBe('tint');
    expect(screen.getByRole('link', { name: '명세 고치기' }).getAttribute('data-btn')).toBe('ghost');
    expect(container.querySelector('[data-btn="primary"]')).toBeNull();
  });

  it('지원 1건 · 이전 명세 · 결렬 상태 데이터', () => {
    expect(compareDemoOf('지원 1건').cards.map((c) => c.name)).toEqual(['김세라']);
    expect(compareDemoOf('이전 명세 기준').stale).toBe(true);
    expect(compareDemoOf('결렬 후 선택 중').broke).toBe(true);
    expect(compareDemoOf('결렬 후 선택 중').cards.map((c) => c.sid)).toEqual(['s-sera', 's-nut']);
  });

  it('지원서 상세는 지원자 카드의 좁은 grid 규칙을 사용하지 않는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);
      if (url === '/api/v1/projects/p-ondo/applications') {
        return new Response(JSON.stringify({ data: [{
          applicationId: 'application-1',
          supplierId: 'supplier-1',
          status: 'SUBMITTED',
          totalAmount: 3_000_000,
          durationDays: 22,
          questionCount: 0,
          revisionCount: 1,
          submittedAt: '2026-11-07T05:30:00.000Z',
          careerYears: null,
          ratingAvg: null,
          reviewCount: 0,
          completedContractCount: 0,
          portfolioSummary: null,
        }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url === '/api/v1/profiles/suppliers/supplier-1') {
        return new Response(JSON.stringify({ data: { supplierId: 'supplier-1', displayName: '공급자', profileImageUrl: null } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    renderAt(PATH, 'client', undefined, 'test-token');

    fireEvent.click(await screen.findByRole('button', { name: '지원서 보기' }));
    const detail = await screen.findByLabelText('지원서 상세');
    const applicationDetailClass = compareStyles.applicationDetail ?? 'applicationDetail';
    expect(detail.classList.contains(applicationDetailClass)).toBe(true);
  });
});

/* 의뢰인 문의 채팅 Chat-Client — F-19 · F-24 · 대화 규격 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  DEMO,
  PROJECT_TITLE,
  agreementHref,
  chatDemoOf,
  quoteModalHref,
} from '@/pages/client/Chat-Client.data';
import { renderAt } from './render';

const PATH = '/c/chat/p-ondo/s-junho';

describe('Chat-Client — 문의 채팅', () => {
  it('문의 중: 목록 · Attr 견적 · 태그 · tint 보내기 · primary 없음', () => {
    const { container } = renderAt(PATH, 'client');
    expect(screen.getByLabelText('대화 목록')).toBeTruthy();
    expect(screen.getAllByText(PROJECT_TITLE).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('최준호님과의 대화')).toBeTruthy();
    expect(screen.getByText('지금 견적')).toBeTruthy();
    expect(screen.getByText('3,100,000원')).toBeTruthy();
    expect(screen.getByText('기간')).toBeTruthy();
    expect(screen.getAllByText(/42일/).length).toBeGreaterThan(0);
    expect(screen.getByText(/조건 10건 중/)).toBeTruthy();
    expect(screen.getAllByText('예약 달력').length).toBeGreaterThan(0);
    expect(screen.getByText('지급 구간 · 비율')).toBeTruthy();

    const quote = screen
      .getAllByRole('link', { name: '견적서 보기' })
      .find((a) => a.getAttribute('data-btn') === 'ghost');
    expect(quote?.getAttribute('href')).toBe(quoteModalHref('p-ondo', 's-junho'));

    const pick = screen.getByRole('link', { name: '이 사람과 계약하기' });
    expect(pick.getAttribute('href')).toBe(agreementHref('p-ondo', 's-junho'));
    expect(pick.getAttribute('data-btn')).toBe('tint');

    expect(screen.getByRole('button', { name: '보내기' }).getAttribute('data-btn')).toBe('tint');
    expect(container.querySelector('[data-btn="primary"]')).toBeNull();
    expect(screen.getByText(/계약 체결 전에는 연락처가 자동으로 가려집니다/)).toBeTruthy();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('보내기로 내 메시지가 추가된다', () => {
    renderAt(PATH, 'client');
    fireEvent.change(screen.getByLabelText('메시지 입력'), { target: { value: '테스트 메시지입니다' } });
    fireEvent.click(screen.getByRole('button', { name: '보내기' }));
    expect(screen.getByText('테스트 메시지입니다')).toBeTruthy();
  });

  it('처음 문의: 제안 문장 · 문의 전', () => {
    renderAt(`/c/chat/p-ondo/s-nut?mock=${encodeURIComponent('처음 문의')}`, 'client');
    expect(screen.getByText(DEMO.starterLead)).toBeTruthy();
    expect(screen.getAllByText('문의 전').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: DEMO.suggestions[0] })).toBeTruthy();
  });

  it('임시 계약 중: 계약서 보기 · 합의 시스템 메시지', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('임시 계약 중')}`, 'client');
    const contracts = screen.getAllByRole('link', { name: '계약서 보기' });
    expect(contracts.some((a) => a.getAttribute('href') === '/c/contracts/c-ondo')).toBe(true);
    expect(screen.getAllByText(/임시 계약이 되었습니다/).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: '이 사람과 계약하기' })).toBeNull();
  });

  it('읽기 전용: 입력 대신 이유', () => {
    renderAt(`/c/chat/p-ondo/s-sera?mock=${encodeURIComponent('읽기 전용')}`, 'client');
    expect(screen.getByText(DEMO.readOnlyReason)).toBeTruthy();
    expect(screen.queryByLabelText('메시지 입력')).toBeNull();
  });

  it('신고: Modal danger · warn 신고하기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('신고')}`, 'client');
    const dialog = screen.getByRole('dialog', { name: DEMO.reportTitle });
    expect(within(dialog).getByText(/연락처 · 외부 거래 유도/)).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: '신고하기' }).getAttribute('data-btn')).toBe('warn');
    expect(dialog.querySelector('[data-btn="primary"]')).toBeNull();
  });

  it('이전 명세 · 계약 체결 후 데이터', () => {
    expect(chatDemoOf('이전 명세 기준', 's-junho').stale).toBe(true);
    expect(chatDemoOf('이전 명세 기준', 's-junho').canPick).toBe(false);
    expect(chatDemoOf('계약 체결 후', 's-junho').signed).toBe(true);
    expect(chatDemoOf('계약 체결 후', 's-junho').hint).toBe(DEMO.hintSigned);
  });
});

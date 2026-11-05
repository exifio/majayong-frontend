/* 의뢰인 견적서 상세 Quote-Client — F-09 · 모달 본문 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  DEMO,
  QUOTE_MOCKS,
  chatHref,
  profileHref,
  quoteDemoOf,
  withFee,
} from '@/pages/client/Quote-Client.data';
import { formatWon } from '@/lib/format';
import { renderAt } from './render';

const BASE = '/c/projects/p-ondo/proposals';

function open(opts: { mock?: string; sid?: string } = {}) {
  const q = new URLSearchParams({ modal: 'quote' });
  if (opts.mock) q.set('mock', opts.mock);
  if (opts.sid) q.set('sid', opts.sid);
  return renderAt(`${BASE}?${q.toString()}`, 'client');
}

describe('Quote-Client — 견적서 상세', () => {
  it('routes 상태와 mock 목록이 같다', () => {
    expect([...QUOTE_MOCKS]).toEqual([
      '최준호(채팅에서 수정)',
      '김세라',
      '스튜디오 넛(불가 1건)',
      '이전 명세 기준',
      '거절 확인',
    ]);
  });

  it('최준호: 요약 · 채팅 수정 · 질문 2 · 연락처 가림 · primary 하나', () => {
    const { container } = open({ mock: '최준호(채팅에서 수정)', sid: 's-junho' });
    const dialog = screen.getByRole('dialog', { name: '견적서 상세' });

    expect(within(dialog).getByRole('heading', { level: 2, name: '최준호' })).toBeTruthy();
    expect(within(dialog).getAllByText('3,100,000원').length).toBeGreaterThan(0);
    expect(within(dialog).getByText(`수수료 5% 포함 ${formatWon(withFee(3_100_000))}`)).toBeTruthy();
    expect(within(dialog).getByText(/채팅에서 수정 · 처음 3,000,000원/)).toBeTruthy();
    expect(within(dialog).getByText('예치 다음 날부터')).toBeTruthy();
    expect(within(dialog).getByText('4 / 4')).toBeTruthy();
    expect(within(dialog).getByText(/공급자 질문 2개/)).toBeTruthy();
    expect(within(dialog).getByText('연락처 가림')).toBeTruthy();

    const profile = within(dialog).getByRole('link', { name: '프로필 보기' });
    expect(profile.getAttribute('href')).toBe(profileHref('s-junho'));

    const chat = dialog.querySelector('a[data-btn="primary"]');
    expect(chat).not.toBeNull();
    expect(chat!.getAttribute('href')).toBe(chatHref('p-ondo', 's-junho'));
    expect(chat!.textContent).toBe(DEMO.chatLabel);
    expect(dialog.querySelectorAll('[data-btn="primary"]')).toHaveLength(1);
    expect(within(dialog).queryByText('선택하기')).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('sid로 공급자를 고른다', () => {
    open({ sid: 's-sera' });
    const dialog = screen.getByRole('dialog', { name: '견적서 상세' });
    expect(within(dialog).getByRole('heading', { level: 2, name: '김세라' })).toBeTruthy();
    expect(within(dialog).getAllByText('4,400,000원').length).toBeGreaterThan(0);
  });

  it('스튜디오 넛: 불가 1건 · amber 글자', () => {
    open({ mock: '스튜디오 넛(불가 1건)' });
    const dialog = screen.getByRole('dialog', { name: '견적서 상세' });
    expect(within(dialog).getByText('스튜디오 넛')).toBeTruthy();
    expect(within(dialog).getByText('3 / 4')).toBeTruthy();
    expect(within(dialog).getByText('불가')).toBeTruthy();
    expect(within(dialog).getByText(DEMO.unavailableNote)).toBeTruthy();
    expect(within(dialog).getByText('리마인드 알림')).toBeTruthy();
  });

  it('이전 명세 기준: Note', () => {
    open({ mock: '이전 명세 기준' });
    const dialog = screen.getByRole('dialog', { name: '견적서 상세' });
    expect(within(dialog).getByText(DEMO.staleTitle)).toBeTruthy();
    expect(within(dialog).getAllByText(/재견적/).length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText('이전 명세 기준').length).toBeGreaterThan(0);
    expect(quoteDemoOf('이전 명세 기준', null).sid).toBe('s-sera');
  });

  it('거절 확인: ConfirmDialog danger', () => {
    open({ mock: '거절 확인' });
    const reject = screen.getByRole('dialog', { name: /최준호님의 지원을 거절할까요/ });
    expect(within(reject).getByText(/되돌릴 수 없습니다/)).toBeTruthy();
    expect(within(reject).getByRole('button', { name: '거절하기' }).getAttribute('data-btn')).toBe('warn');
    fireEvent.click(within(reject).getByRole('button', { name: '취소' }));
  });
});

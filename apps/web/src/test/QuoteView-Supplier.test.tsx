/* 공급자 내 견적 보기 QuoteView-Supplier — F-05 · F-10 */
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import {
  CHAT_HREF,
  CONTRACT_HREF,
  DEMO,
  QUOTE_WRITE_HREF,
} from '@/pages/supplier/QuoteView-Supplier.data';
import { renderAt } from './render';

const PATH = '/s/applications/p-ondo';

describe('QuoteView-Supplier — 내 견적 보기', () => {
  it('문의 중: 총액 · 수령액 · 수정 줄 · 채팅으로 tint', () => {
    const { container } = renderAt(PATH, 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.pageTitle })).toBeTruthy();
    expect(screen.getByText(formatWon(DEMO.total))).toBeTruthy();
    expect(screen.getByText(formatWon(DEMO.net))).toBeTruthy();
    expect(screen.getByText(DEMO.changeLine)).toBeTruthy();
    expect(screen.getAllByText('가능').length).toBe(4);

    const chat = screen.getByRole('link', { name: DEMO.chatCta });
    expect(chat.getAttribute('data-btn')).toBe('tint');
    expect(chat.getAttribute('href')).toBe(CHAT_HREF);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(screen.queryByText(/5,000,000/)).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('이전 명세 기준: amber 띠 · 다시 견적 내기 primary', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('이전 명세 기준')}`,
      'supplier',
    );
    expect(container.querySelector('[data-band="warn"]')).toBeTruthy();
    const re = screen.getByRole('link', { name: DEMO.reQuote });
    expect(re.getAttribute('data-btn')).toBe('primary');
    expect(re.getAttribute('href')).toBe(QUOTE_WRITE_HREF);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });

  it('임시 계약 중: amber 띠 · 계약서 보기', () => {
    const { container } = renderAt(
      `${PATH}?mock=${encodeURIComponent('임시 계약 중')}`,
      'supplier',
    );
    expect(container.querySelector('[data-band="warn"]')).toBeTruthy();
    expect(screen.getByRole('link', { name: DEMO.contractCta }).getAttribute('href')).toBe(
      CONTRACT_HREF,
    );
    expect(screen.getByRole('button', { name: DEMO.chatEdit })).toHaveProperty('disabled', true);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });
});

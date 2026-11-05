/* 공급자 문의 채팅 Chat-Supplier — F-19 · 결정메모 #1 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  CONTRACT_HREF,
  DEMO,
  QUOTE_HREF,
  chatDemoOf,
} from '@/pages/supplier/Chat-Supplier.data';
import { renderAt } from './render';

const PATH = '/s/chat/p-ondo';

describe('Chat-Supplier — 문의 채팅', () => {
  it('문의 중: 견적서 보기 · 견적 수정 tint · 계약하기 없음 · primary 없음', () => {
    const { container } = renderAt(PATH, 'supplier');
    expect(screen.getByRole('link', { name: DEMO.bandQuote }).getAttribute('href')).toBe(QUOTE_HREF);
    expect(screen.getByRole('button', { name: DEMO.editQuote }).getAttribute('data-btn')).toBe(
      'tint',
    );
    expect(screen.queryByRole('button', { name: /계약하기/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /계약하기/ })).toBeNull();
    expect(screen.getAllByText(/연락처 가림/).length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('견적 수정: 모달 저장 → amber 기록', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('견적 수정')}`, 'supplier');
    expect(screen.getByRole('dialog', { name: DEMO.revTitle })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: DEMO.revSave }));
    expect(screen.getAllByText(/견적 수정.*3,000,000원 → 3,100,000원/).length).toBeGreaterThan(0);
  });

  it('임시 계약: amber 띠 · 계약서 보기', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('임시 계약')}`, 'supplier');
    expect(screen.getAllByText(DEMO.heldTitle).length).toBeGreaterThan(0);
    const links = screen.getAllByRole('link', { name: DEMO.heldCta });
    expect(links.some((a) => a.getAttribute('href') === CONTRACT_HREF)).toBe(true);
  });

  it('읽기 전용: 입력 비활성 안내', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('읽기 전용')}`, 'supplier');
    expect(screen.getByText(DEMO.readOnlyReason)).toBeTruthy();
    expect(screen.queryByLabelText('메시지 입력')).toBeNull();
  });

  it('계약 체결 후: 힌트 · 견적 수정 꺼짐', () => {
    renderAt(`${PATH}?mock=${encodeURIComponent('계약 체결 후')}`, 'supplier');
    expect(screen.getByText(/계약이 체결되어/)).toBeTruthy();
    const edit = screen.getByRole('button', { name: DEMO.editQuote });
    expect(edit).toHaveProperty('disabled', true);
  });

  it('신고: danger 모달 · 파란 버튼 없음', () => {
    const { container } = renderAt(`${PATH}?mock=${encodeURIComponent('신고')}`, 'supplier');
    const dialog = screen.getByRole('dialog', { name: DEMO.reportTitle });
    expect(within(dialog).getByRole('button', { name: '신고하기' }).getAttribute('data-btn')).toBe(
      'warn',
    );
    expect(dialog.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(0);
  });

  it('목록 항목마다 다른 프로젝트 pid로 링크된다', () => {
    const { container } = renderAt(PATH, 'supplier');
    const list = container.querySelector('[aria-label="대화 목록"]');
    expect(list).not.toBeNull();
    const hrefs = Array.from(list!.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/s/chat/p-ondo');
    expect(hrefs).toContain('/s/chat/p-other');
  });

  it('시연 데이터', () => {
    expect(chatDemoOf('문의 중').canRev).toBe(true);
    expect(chatDemoOf('임시 계약').held).toBe(true);
    expect(DEMO.amount).toBe(3_100_000);
  });
});

/* 의뢰인 랜딩 Main — 앵커 · CTA · 시연 금액 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import { MAIN_MOCKS, mainDemoOf } from '@/pages/public/Main.data';
import { renderAt } from './render';

describe('Main — 의뢰인 랜딩', () => {
  it('히어로 · 섹션 앵커(how · safe · start)가 있다', () => {
    const { container } = renderAt('/', 'guest');
    expect(screen.getByRole('heading', { level: 1, name: /요구사항을 쓰지 마세요/ })).toBeTruthy();
    expect(container.querySelector('#how')).not.toBeNull();
    expect(container.querySelector('#safe')).not.toBeNull();
    expect(container.querySelector('#start')).not.toBeNull();
  });

  it('본문 히어로 CTA는 tint로 /signup, 파란 primary는 헤더 하나뿐', () => {
    const { container } = renderAt('/', 'guest');
    const heroCta = screen.getAllByRole('link', { name: '화면 초안 받아보기' })
      .find((a) => a.getAttribute('data-btn') === 'tint');
    expect(heroCta?.getAttribute('href')).toBe('/signup');

    const primaries = Array.from(container.querySelectorAll('[data-btn="primary"]'))
      .filter((el) => !el.closest('[role="dialog"]'));
    expect(primaries).toHaveLength(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('공간 토글의 공급자 링크는 /supplier', () => {
    const { container } = renderAt('/', 'guest');
    const toggle = container.querySelector('nav[aria-label="공간 전환"]');
    expect(toggle).not.toBeNull();
    expect(within(toggle as HTMLElement).getByRole('link', { name: '공급자' }).getAttribute('href')).toBe('/supplier');
  });

  it('?mock=기본에서 시연 금액이 보인다', () => {
    const data = mainDemoOf('기본');
    renderAt('/?mock=기본', 'guest');
    expect(screen.getByText(formatWon(data.aiTotal))).toBeTruthy();
    expect(screen.getByText(formatWon(data.proposals[0]!.quote))).toBeTruthy();
  });

  it('가치 카드는 3장이고 결제 완료를 단정하지 않는다', () => {
    const data = mainDemoOf('기본');
    expect(data.safetyCards).toHaveLength(3);
    expect(data.safetyCards.some((card) => /예치|에스크로/.test(card.title + card.body))).toBe(false);
  });

  it('정의된 mock 목록이 비어 있지 않다', () => {
    expect(MAIN_MOCKS.length).toBeGreaterThan(0);
  });
});

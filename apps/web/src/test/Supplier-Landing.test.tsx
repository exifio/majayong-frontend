/* 공급자 랜딩 Supplier-Landing — 디자인 캔버스 랜딩 v3 · F-01 · 13.2 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import { slDemoOf } from '@/pages/public/Supplier-Landing.data';
import { renderAt } from './render';

describe('Supplier-Landing — 공급자 랜딩', () => {
  it('히어로 · 앵커(how · flow · price · signup) · primary는 헤더 하나', () => {
    const data = slDemoOf('기본');
    const { container } = renderAt('/supplier', 'guest');
    expect(screen.getByRole('heading', { level: 1, name: /글을 읽고 기능을 뽑는/ })).toBeTruthy();
    for (const id of ['how', 'flow', 'price', 'signup']) expect(container.querySelector(`#${id}`)).not.toBeNull();
    expect(screen.getByRole('link', { name: '견적 방식 보기' }).getAttribute('href')).toBe('#how');

    const heroCtas = screen.getAllByRole('link', { name: data.cta });
    expect(heroCtas.every((a) => a.getAttribute('data-btn') === 'onnavy' && a.getAttribute('href') === '/signup')).toBe(true);
    expect(screen.getByRole('link', { name: '공급자로 등록' }).getAttribute('data-btn')).toBe('primary');

    const primaries = Array.from(container.querySelectorAll('[data-btn="primary"]')).filter(
      (el) => !el.closest('[role="dialog"]'),
    );
    expect(primaries).toHaveLength(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('섹션 제목이 캔버스 순서와 같다', () => {
    renderAt('/supplier', 'guest');
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      '견적이 쉬워집니다',
      '등록부터 정산까지',
      '대금은 나눠서 받습니다',
      '할 수 있는 일을 등록해 두세요',
    ]);
  });

  it('히어로 예시: 명세 → 가능 · 불가 → 총액 · 기간, 예상 수령액을 보여 준다', () => {
    const data = slDemoOf('기본');
    renderAt('/supplier', 'guest');
    expect(screen.getByRole('img', { name: data.hero.label })).toBeTruthy();
    expect(screen.getByText(formatWon(data.hero.payout))).toBeTruthy();
    expect(screen.getByText('견적을 보냈습니다')).toBeTruthy();
  });

  it('정산: 예치 → 중간 승인 1차 지급 → 최종 승인 2차 지급과 자동 승인 안내', () => {
    const data = slDemoOf('기본');
    const { container } = renderAt('/supplier', 'guest');
    const price = container.querySelector('#price') as HTMLElement;
    for (const step of data.paySteps) expect(within(price).getByText(step.title)).toBeTruthy();
    expect(within(price).getByText(data.payNote)).toBeTruthy();
    expect(within(price).getByRole('link', { name: '정산 자세히 보기' }).getAttribute('href')).toBe('/help');
  });

  it('상단 메뉴는 견적 방식 · 진행 과정 · 정산 방식이고 각 섹션 제목으로 이어진다', () => {
    const { container } = renderAt('/supplier', 'guest');
    const menu = container.querySelector('header ul') as HTMLElement;
    const links = within(menu).getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual(['견적 방식', '진행 과정', '정산 방식']);
    const targets = links.map((a) => container.querySelector(a.getAttribute('href')!)?.querySelector('h2')?.textContent);
    expect(targets).toEqual(['견적이 쉬워집니다', '등록부터 정산까지', '대금은 나눠서 받습니다']);
  });

  it('의뢰인 희망 예산 · AI 총액 숫자는 없다', () => {
    renderAt('/supplier', 'guest');
    expect(screen.queryByText(/희망 예산/)).toBeNull();
    expect(screen.queryByText(/수수료 포함 예상 총액/)).toBeNull();
  });
});

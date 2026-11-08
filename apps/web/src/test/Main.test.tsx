/* 의뢰인 랜딩 Main — 디자인 캔버스 랜딩 v3 · 앵커 · CTA · 시연 금액 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import { MAIN_MOCKS, mainDemoOf } from '@/pages/public/Main.data';
import { renderAt } from './render';

describe('Main — 의뢰인 랜딩', () => {
  it('히어로 · 섹션 앵커(value · how · safe · start)가 있다', () => {
    const { container } = renderAt('/', 'guest');
    expect(screen.getByRole('heading', { level: 1, name: /요구사항을 쓰지 마세요/ })).toBeTruthy();
    for (const id of ['value', 'how', 'safe', 'start']) expect(container.querySelector(`#${id}`)).not.toBeNull();
  });

  it('섹션 제목이 캔버스 순서와 같다', () => {
    renderAt('/', 'guest');
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      '외주 맡기기가 쉬워집니다',
      '명세를 확정한 다음은',
      '안심하고 맡길 수 있도록',
      '지금 겪고 있는 불편을 한 문장으로 적어보세요',
    ]);
  });

  it('본문 히어로 CTA는 흰 버튼으로 /signup, 파란 primary는 헤더 하나뿐', () => {
    const { container } = renderAt('/', 'guest');
    const ctas = screen.getAllByRole('link', { name: '화면 초안 받아보기' });
    expect(ctas.filter((a) => a.getAttribute('data-btn') === 'primary')).toHaveLength(1);
    expect(ctas.every((a) => a.getAttribute('href') === '/signup')).toBe(true);

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

  it('히어로 예시는 3장면 그림으로 읽히고 단계 3개를 보여 준다', () => {
    const data = mainDemoOf('기본');
    const { container } = renderAt('/', 'guest');
    expect(screen.getByRole('img', { name: data.hero.label })).toBeTruthy();
    const steps = container.querySelector('[data-hero-stage] > [aria-hidden="true"]');
    expect(steps?.textContent).toBe(data.hero.steps.map((st, i) => `${i + 1}${st}`).join(''));
  });

  it('?mock=기본에서 시연 금액이 보인다', () => {
    const data = mainDemoOf('기본');
    renderAt('/?mock=기본', 'guest');
    expect(screen.getAllByText(data.hero.totalAfter).length).toBeGreaterThan(0);
    expect(screen.getByText(formatWon(data.proposals[0]!.quote))).toBeTruthy();
  });

  it('흐름도 5단계와 안전장치 3장, 자세히 보기는 고객센터로 간다', () => {
    const data = mainDemoOf('기본');
    const { container } = renderAt('/', 'guest');
    const how = container.querySelector('#how') as HTMLElement;
    expect(within(how).getAllByRole('listitem')).toHaveLength(data.flowSteps.length);
    const safe = container.querySelector('#safe') as HTMLElement;
    expect(within(safe).getAllByRole('listitem')).toHaveLength(3);
    expect(within(safe).getByRole('link', { name: '안전장치 자세히 보기' }).getAttribute('href')).toBe('/help');
  });

  it('상단 메뉴는 서비스 소개 · 진행 과정 · 안전장치이고 각 섹션 제목으로 이어진다', () => {
    const { container } = renderAt('/', 'guest');
    const menu = container.querySelector('header ul') as HTMLElement;
    const links = within(menu).getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual(['서비스 소개', '진행 과정', '안전장치']);
    const targets = links.map((a) => container.querySelector(a.getAttribute('href')!)?.querySelector('h2')?.textContent);
    expect(targets).toEqual(['외주 맡기기가 쉬워집니다', '명세를 확정한 다음은', '안심하고 맡길 수 있도록']);
  });

  it('정의된 mock 목록이 비어 있지 않다', () => {
    expect(MAIN_MOCKS.length).toBeGreaterThan(0);
  });
});

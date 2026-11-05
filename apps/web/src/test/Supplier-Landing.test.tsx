/* 공급자 랜딩 Supplier-Landing — F-01 · 13.2 */
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { formatWon } from '@/lib/format';
import { slDemoOf } from '@/pages/public/Supplier-Landing.data';
import { renderAt } from './render';

describe('Supplier-Landing — 공급자 랜딩', () => {
  it('히어로 · 앵커(how · flow · price) · primary 하나', () => {
    const data = slDemoOf('기본');
    const { container } = renderAt('/supplier', 'guest');
    expect(screen.getByRole('heading', { level: 1, name: /글을 읽고 기능을 뽑는/ })).toBeTruthy();
    expect(container.querySelector('#how')).not.toBeNull();
    expect(container.querySelector('#flow')).not.toBeNull();
    expect(container.querySelector('#price')).not.toBeNull();

    const heroCta = screen
      .getAllByRole('link', { name: data.cta })
      .find((a) => a.getAttribute('data-btn') === 'primary');
    expect(heroCta?.getAttribute('href')).toBe('/signup');

    const primaries = Array.from(container.querySelectorAll('[data-btn="primary"]')).filter(
      (el) => !el.closest('[role="dialog"]'),
    );
    expect(primaries).toHaveLength(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('비용: 수수료 5% · 원천징수 3.3% · 예시 금액(데이터)', () => {
    const data = slDemoOf('기본');
    const { container } = renderAt('/supplier', 'guest');
    const cost = container.querySelector('#price') as HTMLElement;
    expect(within(cost).getByText('5%')).toBeTruthy();
    expect(within(cost).getByText('3.3%')).toBeTruthy();
    expect(within(cost).getByText(formatWon(data.costExampleNet))).toBeTruthy();
  });

  it('대금 예치를 이미 되는 기능처럼 쓰지 않는다', () => {
    const data = slDemoOf('기본');
    const howBody = data.flowSteps.map((step) => step.body).join(' ');
    expect(howBody).not.toContain('전액 예치');
    expect(howBody).toContain('결제 연동');
  });

  it('의뢰인 희망 예산 · AI 총액 숫자는 없다', () => {
    renderAt('/supplier', 'guest');
    expect(screen.queryByText(/희망 예산/)).toBeNull();
    expect(screen.queryByText(/수수료 포함 예상 총액/)).toBeNull();
  });
});

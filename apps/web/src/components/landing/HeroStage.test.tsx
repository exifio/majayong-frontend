/* 랜딩 공용 부품 — 히어로 3장면 · 흐름도 · 정산 3칸 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroStage } from './HeroStage';
import { FlowSteps, PaySteps } from './LandingSections';

describe('HeroStage — 히어로 3장면', () => {
  it('세 장면을 하나의 그림으로 설명하고 단계 표시는 보조기기에서 숨긴다', () => {
    const { container } = render(
      <HeroStage label="견적 과정" steps={['하나', '둘', '셋']} frames={[<p key="1">장면1</p>, <p key="2">장면2</p>, <p key="3">장면3</p>]} />,
    );
    const stage = screen.getByRole('img', { name: '견적 과정' });
    expect(within(stage).getByText('장면3')).toBeTruthy();
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('1하나2둘3셋');
  });
});

describe('FlowSteps · PaySteps — 흐름도와 정산', () => {
  it('흐름도는 순서 있는 목록으로 단계를 읽는다', () => {
    render(<FlowSteps label="흐름" steps={[{ title: 'A', body: 'a', icon: 'user' }, { title: 'B', body: 'b', icon: 'won', money: true }]} />);
    const list = screen.getByRole('list', { name: '흐름' });
    expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Aa', 'Bb']);
  });

  it('정산 칸 사이에 화살표를 두고 안내 문장을 붙인다', () => {
    const { container } = render(
      <MemoryRouter>
        <PaySteps note="7일 뒤 자동 승인" steps={[{ title: '예치', body: 'x', icon: 'lock' }, { title: '1차', body: 'y', icon: 'check', paid: true }]} />
      </MemoryRouter>,
    );
    expect(screen.getByText('7일 뒤 자동 승인')).toBeTruthy();
    expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(3);
  });
});

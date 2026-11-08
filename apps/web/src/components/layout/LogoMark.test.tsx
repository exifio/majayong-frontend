/* 로고 마크 — 디자인 캔버스 '마자용 로고 (8-2 확정)' */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { LogoMark } from './LogoMark';

describe('LogoMark — 로고 마크', () => {
  it('보조기기에서 숨긴 블록 마크와 포인트 블록을 그린다', () => {
    const { container } = render(<LogoMark />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('viewBox')).toBe('13 6 76 78');
    expect(svg?.querySelectorAll('g > rect')).toHaveLength(7);
    expect(svg?.querySelector(':scope > rect')?.getAttribute('transform')).toBe('rotate(10 77 16)');
  });
});

/* 의뢰인 내 프로필 Profile-Client — F-07 · F-23 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/client/Profile-Client.data';
import { location, renderAt } from './render';

describe('Profile-Client — 의뢰인 내 프로필', () => {
  it('기본 정보 · 저장 primary 하나', () => {
    const { container } = renderAt('/c/profile', 'client');
    const root = container.querySelector('[data-screen="Profile-Client"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.name })).toBeTruthy();
    expect(within(root).getByDisplayValue(DEMO.bizValue)).toBeTruthy();
    expect(within(root).getByDisplayValue(DEMO.scaleValue)).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('받은 리뷰 탭 · ?tab=reviews', () => {
    const { container } = renderAt('/c/profile?tab=reviews', 'client');
    const root = container.querySelector('[data-screen="Profile-Client"]') as HTMLElement;
    expect(within(root).getByText(DEMO.reviewSummary)).toBeTruthy();
    expect(within(root).getByText('이도윤')).toBeTruthy();
    fireEvent.click(within(root).getByRole('tab', { name: '기본 정보' }));
    expect(location.current).toContain(encodeURIComponent('기본 정보'));
  });
});

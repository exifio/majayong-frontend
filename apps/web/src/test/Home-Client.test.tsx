/* 의뢰인 홈 Home-Client — F-18 */
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO, homeDemoOf } from '@/pages/client/Home-Client.data';
import { renderAt } from './render';

describe('Home-Client — 의뢰인 홈', () => {
  it('기본: 지금 할 일 · 지표 4 · 프로젝트 · primary 하나', () => {
    const { container } = renderAt('/c', 'client');
    expect(screen.getByRole('heading', { name: DEMO.hello })).toBeTruthy();
    expect(screen.getByText(DEMO.focusTitle)).toBeTruthy();
    const cta = screen.getByRole('link', { name: DEMO.focusCta });
    expect(cta.getAttribute('data-btn')).toBe('primary');
    expect(cta.getAttribute('href')).toBe(DEMO.focusHref);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);

    expect(screen.getByText('진행 중 프로젝트')).toBeTruthy();
    expect(screen.getByText('받은 견적')).toBeTruthy();
    expect(screen.getByText('진행 중 계약')).toBeTruthy();
    expect(screen.getByText('안 읽은 메시지')).toBeTruthy();
    expect(screen.queryByText(/원$/)).toBeNull();

    const pj = screen.getByRole('link', { name: '예약 달력, 예약금 결제 외 2개 기능' });
    expect(pj.getAttribute('href')).toBe(DEMO.projectHref);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('첫 방문: 빈 상태 · 첫 프로젝트 만들기 · 3단계', () => {
    const { container } = renderAt(`/c?mock=${encodeURIComponent('첫 방문')}`, 'client');
    expect(screen.getByText(DEMO.firstTitle)).toBeTruthy();
    const cta = screen.getByRole('link', { name: DEMO.firstCta });
    expect(cta.getAttribute('href')).toBe(DEMO.firstHref);
    expect(cta.getAttribute('data-btn')).toBe('primary');
    expect(screen.getByText('입력')).toBeTruthy();
    expect(screen.getByText('초안 확인')).toBeTruthy();
    expect(screen.getByText('견적 받기')).toBeTruthy();
    expect(screen.queryByText('진행 중 프로젝트')).toBeNull();
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(1);
  });

  it('시연 데이터', () => {
    expect(homeDemoOf('기본').projects.length).toBe(2);
    expect(homeDemoOf('첫 방문').first).toBe(true);
  });
});

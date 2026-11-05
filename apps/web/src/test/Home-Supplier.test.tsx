/* 공급자 홈 Home-Supplier — F-18 · F-17 */
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import {
  ACCOUNT_HREF,
  DEMO,
  PROFILE_HREF,
  PROJECT_HREF,
  homeDemoOf,
} from '@/pages/supplier/Home-Supplier.data';
import { renderAt } from './render';

describe('Home-Supplier — 공급자 홈', () => {
  it('기본: navy 지금 할 일 · onnavy · 추천에 예산 없음', () => {
    const { container } = renderAt('/s', 'supplier');
    expect(screen.getByRole('heading', { name: DEMO.hello })).toBeTruthy();
    expect(screen.getByText(DEMO.focusTitle)).toBeTruthy();
    const cta = screen.getByRole('link', { name: DEMO.focusCta });
    expect(cta.getAttribute('data-btn')).toBe('onnavy');
    expect(cta.getAttribute('href')).toBe(DEMO.focusHref);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(0);

    expect(screen.getAllByText(/기술 스택 \d개 일치/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/\d+~\d+만원/)).toBeNull();

    const card = screen.getByRole('link', { name: /픽업 주문/ });
    expect(card.getAttribute('href')).toBe(PROJECT_HREF);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('첫 방문: 체크리스트 1/4 · tint → profile/account', () => {
    const { container } = renderAt(`/s?mock=${encodeURIComponent('첫 방문')}`, 'supplier');
    expect(screen.getByText(DEMO.firstTitle)).toBeTruthy();
    expect(screen.getByText('1/4')).toBeTruthy();
    expect(screen.getByText('프로필')).toBeTruthy();
    expect(screen.getByText('기술 스택')).toBeTruthy();
    expect(screen.getByText('포트폴리오')).toBeTruthy();
    expect(screen.getByText('정산 계좌')).toBeTruthy();

    expect(screen.getByRole('link', { name: '기술 스택 채우기' }).getAttribute('href')).toBe(
      PROFILE_HREF,
    );
    expect(screen.getByRole('link', { name: '정산 정보 넣기' }).getAttribute('href')).toBe(
      ACCOUNT_HREF,
    );
    const findCta = container.querySelector('[data-btn="onnavy"]');
    expect(findCta?.getAttribute('href')).toBe(DEMO.firstHref);
    expect(findCta?.textContent).toBe(DEMO.firstCta);
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(0);
  });

  it('시연 데이터', () => {
    expect(homeDemoOf('기본').first).toBe(false);
    expect(homeDemoOf('첫 방문').recommends.length).toBe(3);
  });
});

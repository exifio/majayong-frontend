/* 공통 푸터 — 디자인 시스템 9절 · 디자인 보완 1104 Part 1-C */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from './Footer';

function renderFooter() {
  render(<MemoryRouter><Footer /></MemoryRouter>);
  return screen.getByRole('contentinfo');
}

describe('Footer — 공통 푸터', () => {
  it('1:1 문의는 /help/inquiry로 연결된다', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: '1:1 문의' }).getAttribute('href')).toBe('/help/inquiry');
  });

  it('로고 마크와 함께 처음 화면으로 가는 링크를 둔다', () => {
    renderFooter();
    const logo = screen.getByRole('link', { name: '마자용 처음으로' });
    expect(logo.getAttribute('href')).toBe('/');
    expect(logo.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
  });

  it('링크를 서비스 · 고객센터 · 정책 세 그룹으로 한 줄에 나눈다', () => {
    renderFooter();
    const nav = screen.getByRole('navigation', { name: '사이트 링크' });
    expect(within(nav).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['서비스', '고객센터', '정책']);
    expect(within(nav).getByRole('link', { name: '의뢰인 안내' }).getAttribute('href')).toBe('/');
    expect(within(nav).getByRole('link', { name: '공급자 안내' }).getAttribute('href')).toBe('/supplier');
    expect(within(nav).getByRole('link', { name: '개인정보 처리방침' }).getAttribute('href')).toBe('/terms/privacy');
  });

  it('사업자 정보는 승인 전까지 준비 중으로 두고 예시 연락처를 노출하지 않는다', () => {
    renderFooter();
    expect(screen.getByText('대표자 정보 준비 중')).toBeTruthy();
    expect(screen.getByText('사업자등록번호 준비 중')).toBeTruthy();
    expect(screen.getByText('개인정보 보호책임자 준비 중')).toBeTruthy();
    expect(screen.getByText(/통신판매중개자로서 거래 당사자가 아니며/)).toBeTruthy();
    expect(screen.getByText('© 2026 로켓단. All rights reserved.')).toBeTruthy();
    expect(screen.queryByText(/1600-0000|help@majayong\.example|김로켓/)).toBeNull();
  });

  it('고객센터 운영 시간과 문의 접수 링크를 보여 준다', () => {
    renderFooter();
    expect(screen.getByText('평일 10:00–18:00')).toBeTruthy();
    expect(screen.getByRole('link', { name: '문의 접수' }).getAttribute('href')).toBe('/help/inquiry');
  });
});

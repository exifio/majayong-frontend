/* 공통 푸터 — 디자인 시스템 9절 · PRD F-25 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from './Footer';

describe('Footer — 공통 푸터', () => {
  it('1:1 문의는 /help/inquiry로 연결된다', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByRole('link', { name: '1:1 문의' }).getAttribute('href')).toBe('/help/inquiry');
  });

  it('사업자 정보 준비 중·중개자 고지·저작권을 보여 준다', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByText(/대표자 정보 준비 중/)).toBeTruthy();
    expect(screen.getByText(/사업자등록번호 준비 중/)).toBeTruthy();
    expect(screen.getByText(/통신판매중개자로서 거래 당사자가 아니며/)).toBeTruthy();
    expect(screen.getByText(/© 2026 로켓단/)).toBeTruthy();
    expect(screen.queryByText(/1600-0000|help@majayong\.example/)).toBeNull();
  });

  it('랜딩 구역 링크를 제공한다', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByRole('link', { name: '작동 방식' }).getAttribute('href')).toBe('/#how');
    expect(screen.getByRole('link', { name: '안전장치' }).getAttribute('href')).toBe('/#safe');
    expect(screen.getByRole('link', { name: '비용' }).getAttribute('href')).toBe('/#start');
  });
});

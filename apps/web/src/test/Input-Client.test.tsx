/* 의뢰인 입력 Input-Client — 상태 · CTA · 한도 · 삭제 확인 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DRAFT_CREATING_HREF, DRAFT_HREF, INPUT_MOCKS } from '@/pages/client/Input-Client.data';
import { renderAt } from './render';

describe('Input-Client — 의뢰인 입력', () => {
  it('정의된 mock 세 가지가 routes와 같다', () => {
    expect([...INPUT_MOCKS]).toEqual(['첫 방문', '작성 중 초안 있음', '한도 도달']);
  });

  it('첫 방문: 작성 중 초안 목록 없음 · 파란 CTA → 초안 만드는 중', () => {
    const { container } = renderAt(`/c/drafts/new?mock=${encodeURIComponent('첫 방문')}`, 'client');
    expect(screen.queryByRole('heading', { name: '작성 중인 초안' })).toBeNull();
    const cta = screen.getByRole('link', { name: '화면 초안 받아보기' });
    expect(cta.getAttribute('href')).toBe(DRAFT_CREATING_HREF);
    expect(cta.getAttribute('data-btn')).toBe('primary');
    expect(screen.getByRole('link', { name: '예약 식당 기본 구성으로 시작하기' }).getAttribute('href')).toBe(DRAFT_HREF);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('작성 중 초안 있음: 이어서 고치기 · 보관 띠', () => {
    renderAt(`/c/drafts/new?mock=${encodeURIComponent('작성 중 초안 있음')}`, 'client');
    expect(screen.getByRole('heading', { name: '작성 중인 초안' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '이어서 고치기' }).getAttribute('href')).toBe(DRAFT_HREF);
    const arch = screen.getByRole('button', { name: /보관된 초안/ });
    expect(arch.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(arch);
    expect(arch.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('좌석 배치도 외 1개 기능')).toBeTruthy();
  });

  it('한도 도달: 파란 버튼 비활성 + 이유 · 초안 3개', () => {
    const { container } = renderAt(`/c/drafts/new?mock=${encodeURIComponent('한도 도달')}`, 'client');
    expect(screen.getByRole('heading', { name: '작성 중인 초안' }).parentElement?.textContent).toMatch(/3\s*\/\s*3/);
    const disabled = container.querySelector('button[data-btn="primary"][disabled]');
    expect(disabled).not.toBeNull();
    expect(screen.getAllByText(/하나를 확정·보관·삭제해 주세요/).length).toBeGreaterThan(0);
    expect(screen.getByText('작성 중인 초안이 3개입니다')).toBeTruthy();
  });

  it('삭제 → ConfirmDialog danger(파란 버튼 없음)', () => {
    renderAt(`/c/drafts/new?mock=${encodeURIComponent('작성 중 초안 있음')}`, 'client');
    fireEvent.click(screen.getAllByRole('button', { name: '삭제' })[0]!);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('이 초안을 삭제할까요?')).toBeTruthy();
    expect(dialog.getAttribute('data-danger')).toBe('true');
    expect(dialog.querySelector('[data-btn="primary"]')).toBeNull();
    expect(within(dialog).getByText('삭제하기').getAttribute('data-btn')).toBe('warn');
  });

  it('이렇게 작동합니다 섹션이 있다', () => {
    renderAt('/c/drafts/new', 'client');
    expect(screen.getByRole('heading', { name: '이렇게 작동합니다' })).toBeTruthy();
  });
});

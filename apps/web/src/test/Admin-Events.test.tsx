/* 이벤트 기록 Admin-Events — F-27 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/admin/Admin-Events.data';
import { location, renderAt } from './render';

describe('Admin-Events — 이벤트 기록', () => {
  it('목록 · formatDateTime · 필터 · primary 없음', () => {
    const { container } = renderAt('/admin/events', 'admin');
    const root = container.querySelector('[data-screen="Admin-Events"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(within(root).getByText(/11월 2일 10:05/)).toBeTruthy();
    expect(within(root).getByLabelText(DEMO.kindLabel)).toBeTruthy();
    expect(within(root).getByLabelText(DEMO.periodLabel)).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('상세 · ?id= · 전후 · 사유 · 링크 · 수정 삭제 없음', () => {
    const { container } = renderAt(
      `/admin/events?mock=${encodeURIComponent('상세')}&id=evt-10`,
      'admin',
    );
    const root = container.querySelector('[data-screen="Admin-Events"]') as HTMLElement;
    expect(within(root).getByRole('heading', { name: /주차 안내/ })).toBeTruthy();
    expect(within(root).getByText(/unit_price: 800,000/)).toBeTruthy();
    expect(within(root).getByText(/unit_price: 950,000/)).toBeTruthy();
    expect(within(root).getAllByText(/주차권 안내 문자/).length).toBeGreaterThan(0);
    expect(within(root).getByRole('link', { name: /블록 검토/ })).toBeTruthy();
    expect(within(root).queryAllByRole('button', { name: '수정' }).length).toBe(0);
    expect(within(root).queryAllByRole('button', { name: '삭제' }).length).toBe(0);
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(location.current).toContain('evt-10');
  });

  it('종류 필터', () => {
    const { container } = renderAt('/admin/events', 'admin');
    const root = container.querySelector('[data-screen="Admin-Events"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(DEMO.kindLabel), {
      target: { value: '단가 수정' },
    });
    expect(within(root).getByText(/블록 · 주차 안내/)).toBeTruthy();
    expect(within(root).queryByText(/골목 파스타/)).toBeNull();
  });
});

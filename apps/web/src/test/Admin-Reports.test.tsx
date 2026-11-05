/* 신고 처리 Admin-Reports — F-24 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/admin/Admin-Reports.data';
import { location, renderAt } from './render';

describe('Admin-Reports — 신고 처리', () => {
  it('처리 대기 · ?id= · MaskedText · primary 하나', () => {
    const { container } = renderAt('/admin/reports?id=rp-1', 'admin');
    const root = container.querySelector('[data-screen="Admin-Reports"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(within(root).getAllByText('연락처 가림').length).toBeGreaterThan(0);
    expect(within(root).getAllByText(/공급자 강태오/).length).toBeGreaterThan(0);
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('조치 작성 · 사유 필수', () => {
    const { container } = renderAt(
      `/admin/reports?mock=${encodeURIComponent('조치 작성')}&id=rp-1`,
      'admin',
    );
    const root = container.querySelector('[data-screen="Admin-Reports"]') as HTMLElement;
    expect(within(root).getByRole('radio', { name: /경고/ })).toBeTruthy();
    fireEvent.change(within(root).getByLabelText(/조치 사유/), { target: { value: '' } });
    expect(within(root).getByRole('button', { name: DEMO.confirm }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(within(root).getByText(DEMO.eventNote)).toBeTruthy();
  });

  it('계정 정지 선택 · ConfirmDialog danger', () => {
    renderAt(`/admin/reports?mock=${encodeURIComponent('계정 정지 선택')}&id=rp-1`, 'admin');
    const dialog = screen.getByRole('dialog', { name: DEMO.banTitle });
    expect(dialog.getAttribute('data-danger')).toBe('true');
    expect(within(dialog).queryAllByRole('button', { name: /./ }).every((b) => b.getAttribute('data-btn') !== 'primary')).toBe(
      true,
    );
    expect(within(dialog).getByText(DEMO.eventNote)).toBeTruthy();
    expect(location.current).toContain(encodeURIComponent('계정 정지 선택'));
  });

  it('처리 완료 · teal 띠', () => {
    renderAt(`/admin/reports?mock=${encodeURIComponent('처리 완료')}&id=rp-done`, 'admin');
    expect(screen.getByText(/경고를 보냈습니다/)).toBeTruthy();
  });
});

/* 비밀번호 재설정 Reset — F-06 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/public/Reset.data';
import { location, renderAt } from './render';

describe('Reset — 비밀번호 재설정', () => {
  it('이메일 입력 → 메일 보냄', () => {
    const { container } = renderAt('/reset', 'guest');
    const root = container.querySelector('[data-screen="Reset"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.askTitle })).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    fireEvent.click(within(root).getByRole('button', { name: DEMO.send }));
    expect(location.current).toContain(encodeURIComponent('메일 보냄'));
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('메일 보냄 문구', () => {
    renderAt(`/reset?mock=${encodeURIComponent('메일 보냄')}`, 'guest');
    expect(screen.getByText(/30분 동안 유효한 링크를 보냈습니다/)).toBeTruthy();
  });

  it('새 비밀번호 형식 오류', () => {
    const { container } = renderAt(`/reset?mock=${encodeURIComponent('새 비밀번호')}`, 'guest');
    const root = container.querySelector('[data-screen="Reset"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(DEMO.pw), { target: { value: 'short' } });
    fireEvent.change(within(root).getByLabelText(DEMO.pwConfirm), { target: { value: 'short' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.change }));
    expect(within(root).getByText(DEMO.pwShort)).toBeTruthy();
  });

  it('링크 만료 amber · 완료 teal → 로그인', () => {
    const { container: c1 } = renderAt(`/reset?mock=${encodeURIComponent('링크 만료')}`, 'guest');
    expect(c1.querySelector('[data-band="warn"]')).toBeTruthy();
    expect(within(c1.querySelector('[data-screen="Reset"]') as HTMLElement).getByRole('button', { name: DEMO.expiredCta })).toBeTruthy();

    const { container: c2 } = renderAt(`/reset?mock=${encodeURIComponent('완료')}`, 'guest');
    expect(c2.querySelector('[data-band="done"]')).toBeTruthy();
    const root = c2.querySelector('[data-screen="Reset"]') as HTMLElement;
    fireEvent.click(within(root).getByRole('link', { name: DEMO.doneCta }));
    expect(location.current).toContain('modal=login');
  });
});

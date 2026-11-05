/* 의뢰인 계정 설정 Account-Client — F-28 · 결정메모 #2 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/client/Account-Client.data';
import { location, renderAt } from './render';

describe('Account-Client — 의뢰인 계정 설정', () => {
  it('기본 줄 · tint/text', () => {
    const { container } = renderAt('/c/account', 'client');
    const root = container.querySelector('[data-screen="Account-Client"]') as HTMLElement;
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeTruthy();
    expect(within(root).getByText(DEMO.emailValue)).toBeTruthy();
    expect(within(root).getByRole('button', { name: DEMO.leaveBtn }).getAttribute('data-btn')).toBe('warn');
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('비밀번호 변경 완료 teal 띠', () => {
    const { container } = renderAt(
      `/c/account?mock=${encodeURIComponent('비밀번호 변경 완료')}`,
      'client',
    );
    expect(container.querySelector('[data-band="done"]')).toBeTruthy();
  });

  it('이메일 바꾸기 Modal', () => {
    renderAt(`/c/account?mock=${encodeURIComponent('이메일 바꾸기')}`, 'client');
    expect(screen.getByRole('dialog', { name: DEMO.emailModalTitle })).toBeTruthy();
    expect(screen.getByRole('button', { name: DEMO.emailSend }).getAttribute('data-btn')).toBe('primary');
  });

  it('탈퇴 ConfirmDialog danger', () => {
    const { container } = renderAt('/c/account', 'client');
    const root = container.querySelector('[data-screen="Account-Client"]') as HTMLElement;
    fireEvent.click(within(root).getByRole('button', { name: DEMO.leaveBtn }));
    expect(location.current).toContain(encodeURIComponent('탈퇴 확인'));
    expect(screen.getByRole('dialog', { name: DEMO.leaveTitle })).toBeTruthy();
    expect(screen.getByText(/진행 중인 계약/)).toBeTruthy();
  });
});

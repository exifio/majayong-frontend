/* 로그인 모달 Login — F-06 · 결정메모 #2 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { location, renderAt } from './render';
import { DEMO, loginDemoOf } from '@/pages/public/Login.data';

describe('Login — 로그인 모달', () => {
  it('의뢰인 랜딩: 폼 · primary 로그인 · 링크', () => {
    const { container } = renderAt('/?modal=login', 'guest');
    const dialog = screen.getByRole('dialog', { name: '로그인' });
    expect(within(dialog).getByText(DEMO.headingClient)).toBeTruthy();
    expect(within(dialog).getByLabelText(DEMO.email)).toBeTruthy();
    expect(within(dialog).getByLabelText(DEMO.password)).toBeTruthy();
    const login = within(dialog).getByRole('button', { name: DEMO.submit });
    expect(login.getAttribute('data-btn')).toBe('primary');
    expect(within(dialog).getByRole('link', { name: DEMO.reset }).getAttribute('href')).toBe(
      '/reset',
    );
    expect(within(dialog).getByRole('link', { name: DEMO.signup }).getAttribute('href')).toBe(
      '/signup',
    );
    expect(dialog.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('공급자 랜딩: 공급자 세션 후 /s', () => {
    renderAt('/supplier?modal=login', 'guest');
    const dialog = screen.getByRole('dialog', { name: '로그인' });
    expect(within(dialog).getByText(DEMO.headingSupplier)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: DEMO.submit }));
    expect(location.current.startsWith('/s')).toBe(true);
  });

  it('로그인 실패: amber 띠', () => {
    renderAt(`/?modal=login&mock=${encodeURIComponent('로그인 실패')}`, 'guest');
    expect(screen.getByText(DEMO.failTitle)).toBeTruthy();
  });

  it('역할 안내: 의뢰인 공간으로', () => {
    renderAt(`/supplier?modal=login&mock=${encodeURIComponent('역할 안내')}`, 'guest');
    const dialog = screen.getByRole('dialog', { name: '로그인' });
    expect(within(dialog).getByText(DEMO.roleTitle)).toBeTruthy();
    expect(within(dialog).queryByLabelText(DEMO.email)).toBeNull();
    const cta = within(dialog).getByRole('button', { name: DEMO.roleCta });
    expect(cta.getAttribute('data-btn')).toBe('primary');
    fireEvent.click(cta);
    expect(location.current.startsWith('/c')).toBe(true);
  });

  it('시연 데이터', () => {
    expect(loginDemoOf('의뢰인 랜딩에서').supplier).toBe(false);
    expect(loginDemoOf('역할 안내').showForm).toBe(false);
  });
});

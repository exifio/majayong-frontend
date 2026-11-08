import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';

const { startGoogleOAuth } = vi.hoisted(() => ({ startGoogleOAuth: vi.fn() }));

vi.mock('@/app/google-oauth', () => ({ startGoogleOAuth }));

import { renderAt } from '@/test/render';
import { DEMO } from './Login.data';

afterEach(() => {
  vi.clearAllMocks();
});

describe('Login Google 로그인', () => {
  it.each(['/?modal=login', '/supplier?modal=login'])(
    '%s 로그인 모달에서 Google 로그인 버튼으로 기존 OAuth를 시작한다',
    (path) => {
      renderAt(path, 'guest');
      const dialog = screen.getByRole('dialog', { name: '로그인' });
      fireEvent.click(within(dialog).getByRole('button', { name: DEMO.google }));

      expect(startGoogleOAuth).toHaveBeenCalledOnce();
      expect(within(dialog).getByLabelText(/이메일/)).toBeTruthy();
    },
  );

  it('Google 로그인을 시작하지 못하면 이메일 로그인을 유지하고 오류를 알린다', () => {
    startGoogleOAuth.mockImplementationOnce(() => {
      throw new Error('GOOGLE_NOT_CONFIGURED');
    });

    renderAt('/?modal=login', 'guest');
    const dialog = screen.getByRole('dialog', { name: '로그인' });
    fireEvent.click(within(dialog).getByRole('button', { name: DEMO.google }));

    expect(within(dialog).getByRole('alert').textContent).toContain('다시 시도해 주세요');
    expect(within(dialog).getByRole('button', { name: DEMO.submit })).toBeTruthy();
  });
});

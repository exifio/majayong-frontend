/* 회원가입 ③ 공급자 프로필 Signup-Supplier — F-07 · F-21 · 7.2 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/public/Signup-Supplier.data';
import { location, renderAt } from './render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Signup-Supplier — 회원가입 ③ 공급자 프로필', () => {
  it('가입 프로필 입력은 가상 샘플값으로 미리 채우지 않는다', () => {
    const { container } = renderAt('/signup/supplier', 'signup');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;

    expect((within(root).getByLabelText(/활동 이름/) as HTMLInputElement).value).toBe('');
    expect((within(root).getByLabelText(/경력/) as HTMLInputElement).value).toBe('');
    expect((within(root).getByLabelText(/포트폴리오 링크/) as HTMLInputElement).value).toBe('');
    for (const skill of DEMO.skillOptions) {
      expect(within(root).getByRole('button', { name: skill }).getAttribute('aria-pressed')).toBe('false');
    }
  });

  it('가입 완료: 활동 이름·NDA 동의를 PATCH하고 /s로 이동한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: {} }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/signup/supplier', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getByLabelText('가입 단계')).toBeTruthy();
    expect(within(root).getByLabelText(DEMO.typeLabel)).toBeTruthy();
    expect(within(root).getByText(DEMO.agreeTitle)).toBeTruthy();
    const submit = within(root).getByRole('button', { name: DEMO.submit });
    expect(submit.getAttribute('data-btn')).toBe('primary');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);

    fireEvent.change(within(root).getByLabelText(/활동 이름/), { target: { value: '실제 공급자' } });

    fireEvent.click(submit);

    await waitFor(() => expect(location.current).toBe('/s'));
    const [path, init] = fetchMock.mock.calls[0]!;
    expect(path).toBe('/api/v1/me/supplier-profile');
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual({
      displayName: '실제 공급자',
      ndaConsent: true,
    });

    expect(findDesignViolations(container)).toEqual([]);
  });

  it('나중에 입력하기: NDA 동의를 PATCH한 뒤 /s로 이동한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: {} }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/signup/supplier', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;

    fireEvent.change(within(root).getByLabelText(/활동 이름/), { target: { value: '내 활동명' } });

    fireEvent.click(within(root).getByRole('button', { name: DEMO.skip }));

    await waitFor(() => expect(location.current).toBe('/s'));
    const [path, init] = fetchMock.mock.calls[0]!;
    expect(path).toBe('/api/v1/me/supplier-profile');
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual({ displayName: '내 활동명', ndaConsent: true });
  });

  it('저장 실패: 서버 오류를 안내하고 프로필 단계에 머문다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: { code: 'INTERNAL_ERROR', message: '저장 실패', requestId: 'r1' },
    }, 500)));
    const { container } = renderAt('/signup/supplier', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(/활동 이름/), { target: { value: '테스트 공급자' } });

    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));

    expect(await within(root).findByRole('alert')).toBeTruthy();
    expect(location.current.startsWith('/signup/supplier')).toBe(true);
  });

  it('동의 빠지면 disabledReason', () => {
    const { container } = renderAt('/signup/supplier', 'signup');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;
    const checks = within(root).getAllByRole('checkbox');
    fireEvent.click(checks[0]!);
    const submit = within(root).getByRole('button', { name: DEMO.submit });
    expect(submit.hasAttribute('disabled')).toBe(true);
    expect(within(root).getByText(DEMO.agreeNeed)).toBeTruthy();
  });
});

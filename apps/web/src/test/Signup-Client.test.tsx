/* 회원가입 ③ 의뢰인 프로필 Signup-Client — F-07 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { DEMO } from '@/pages/public/Signup-Client.data';
import { location, renderAt } from './render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Signup-Client — 회원가입 ③ 의뢰인 프로필', () => {
  it('가입 완료: 상호·업종·소개를 PATCH하고 /c로 이동한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: {} }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/signup/client', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Signup-Client"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: DEMO.title })).toBeTruthy();
    expect(within(root).getByLabelText('가입 단계')).toBeTruthy();
    expect(within(root).getByLabelText(/상호/)).toBeTruthy();
    expect(within(root).queryByLabelText(/연락처|전화/)).toBeNull();
    const biz = within(root).getByLabelText(/상호/) as HTMLInputElement;
    const industry = within(root).getByLabelText(/업종/) as HTMLSelectElement;
    const scale = within(root).getByLabelText(/규모/) as HTMLInputElement;
    const intro = within(root).getByLabelText(/한 줄 소개/) as HTMLTextAreaElement;
    expect(biz.value).toBe('');
    expect(industry.value).toBe('');
    expect(scale.value).toBe('');
    expect(intro.value).toBe('');

    const submit = within(root).getByRole('button', { name: DEMO.submit });
    expect(submit.getAttribute('data-btn')).toBe('primary');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);

    fireEvent.change(biz, { target: { value: '실제 의뢰인 상호' } });
    fireEvent.change(industry, { target: { value: DEMO.industries[1] } });
    fireEvent.change(scale, { target: { value: '20석' } });
    fireEvent.change(intro, { target: { value: '실제 가게 소개' } });

    fireEvent.click(submit);

    await waitFor(() => expect(location.current.startsWith('/c')).toBe(true));
    const [path, init] = fetchMock.mock.calls[0]!;
    expect(path).toBe('/api/v1/me/client-profile');
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual({
      businessName: '실제 의뢰인 상호',
      industryField: DEMO.industries[1],
      bio: '실제 가게 소개',
    });
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('나중에 입력하기: 프로필을 저장하지 않고 /c로 이동한다', () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: {} }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/signup/client', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Signup-Client"]') as HTMLElement;

    fireEvent.click(within(root).getByRole('button', { name: DEMO.skip }));

    expect(location.current.startsWith('/c')).toBe(true);
    expect(fetchMock.mock.calls.some(([path]) => String(path).endsWith('/me/client-profile'))).toBe(false);
  });

  it('상호 비우면 폼 오류', () => {
    const { container } = renderAt('/signup/client', 'signup');
    const root = container.querySelector('[data-screen="Signup-Client"]') as HTMLElement;
    fireEvent.change(within(root).getByLabelText(/상호/), { target: { value: '' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));
    expect(within(root).getByText(DEMO.bizError)).toBeTruthy();
    expect(location.current.startsWith('/signup/client')).toBe(true);
  });
});

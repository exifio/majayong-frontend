/* 회원가입 ③ 의뢰인 프로필 — 가게 주소 · 웹사이트 전송 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor, within } from '@testing-library/react';
import { DEMO } from './Signup-Client.data';
import { location, renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Signup-Client — 백엔드가 받는 프로필 필드', () => {
  it('가게 주소와 웹사이트를 함께 PATCH한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: {} }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/signup/client', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Signup-Client"]') as HTMLElement;

    fireEvent.change(within(root).getByLabelText(/상호/), { target: { value: '온도 다이닝' } });
    fireEvent.change(within(root).getByLabelText(/가게 주소/), { target: { value: '서울 마포구 와우산로' } });
    fireEvent.change(within(root).getByLabelText(/웹사이트/), { target: { value: 'https://ondo.example.com' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));

    await waitFor(() => expect(location.current).toBe('/c'));
    const call = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/me/client-profile'));
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({
      businessName: '온도 다이닝',
      storeAddress: '서울 마포구 와우산로',
      websiteUrl: 'https://ondo.example.com',
    });
  });

  it('웹사이트가 https 주소가 아니면 저장하지 않고 오류를 보여 준다', () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: {} }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/signup/client', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Signup-Client"]') as HTMLElement;

    fireEvent.change(within(root).getByLabelText(/상호/), { target: { value: '온도 다이닝' } });
    fireEvent.change(within(root).getByLabelText(/웹사이트/), { target: { value: 'ondo.example.com' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));

    expect(within(root).getByText(DEMO.websiteError)).toBeTruthy();
    expect(fetchMock.mock.calls.some(([path]) => String(path).endsWith('/me/client-profile'))).toBe(false);
  });
});

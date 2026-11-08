/* 의뢰인 내 프로필 기본 정보 — GET/PATCH /me/client-profile */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { location, renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const profile = {
  name: '정민재',
  profileImageUrl: null,
  bio: '마포에서 코스 레스토랑을 운영합니다.',
  businessName: '온도 다이닝',
  industryField: '예약 기반 음식점',
  storeAddress: '서울 마포구',
  websiteUrl: 'https://ondo.example.com',
  profileCompleted: true,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LiveClientProfileForm — 의뢰인 기본 정보', () => {
  it('서버 값을 채우고, 규모 같은 저장 필드가 없는 칸은 두지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: profile })));
    const { container } = renderAt('/c/profile', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Profile-Client"]') as HTMLElement;

    expect(await within(root).findByDisplayValue('온도 다이닝')).toBeTruthy();
    expect(within(root).getByDisplayValue('서울 마포구')).toBeTruthy();
    expect(within(root).getByDisplayValue('https://ondo.example.com')).toBeTruthy();
    expect(within(root).queryByLabelText(/규모/)).toBeNull();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(1);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('저장하면 백엔드가 받는 필드만 PATCH하고 빈 칸은 null로 보낸다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (_input, init) =>
      jsonResponse({ data: init?.method === 'PATCH' ? { ...profile, storeAddress: null, businessName: '온도 다이닝 2호점' } : profile }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/c/profile', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Profile-Client"]') as HTMLElement;

    fireEvent.change(await within(root).findByLabelText(/상호/), { target: { value: '온도 다이닝 2호점' } });
    fireEvent.change(within(root).getByLabelText(/가게 주소/), { target: { value: '' } });
    fireEvent.click(within(root).getByRole('button', { name: '저장' }));

    expect(await within(root).findByText('저장했습니다')).toBeTruthy();
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH');
    expect(String(call?.[0])).toBe('/api/v1/me/client-profile');
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({
      name: '정민재',
      businessName: '온도 다이닝 2호점',
      industryField: '예약 기반 음식점',
      storeAddress: null,
      websiteUrl: 'https://ondo.example.com',
      bio: '마포에서 코스 레스토랑을 운영합니다.',
    });
  });

  it('웹사이트가 https가 아니면 저장 요청을 보내지 않는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: profile }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/c/profile', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Profile-Client"]') as HTMLElement;

    fireEvent.change(await within(root).findByLabelText(/웹사이트/), { target: { value: 'http://ondo.example.com' } });
    fireEvent.click(within(root).getByRole('button', { name: '저장' }));

    expect(within(root).getByText('https://로 시작하는 주소를 입력해 주세요')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false);
  });

  it('실제 화면의 탭 이동은 mock을 붙이지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: profile })));
    const { container } = renderAt('/c/profile', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Profile-Client"]') as HTMLElement;
    await within(root).findByDisplayValue('온도 다이닝');

    fireEvent.click(within(root).getByRole('tab', { name: '받은 리뷰' }));
    await waitFor(() => expect(location.current).toBe('/c/profile?tab=reviews'));
  });
});

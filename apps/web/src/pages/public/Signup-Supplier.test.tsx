/* 회원가입 ③ 공급자 프로필 — 경력 · 기술 스택 · 포트폴리오 링크 · 구분 전송 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor, within } from '@testing-library/react';
import { DEMO } from './Signup-Supplier.data';
import { location, renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

function fill(root: HTMLElement) {
  fireEvent.change(within(root).getByLabelText(/활동 이름/), { target: { value: '준호 스튜디오' } });
  for (const consent of within(root).getAllByRole('checkbox')) fireEvent.click(consent);
}

describe('Signup-Supplier — 백엔드가 받는 프로필 필드', () => {
  it('경력·기술 스택·포트폴리오 링크를 프로필로, 사업자 구분을 증빙 정보로 저장한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: {} }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/signup/supplier', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;

    fill(root);
    fireEvent.change(within(root).getByLabelText(/경력/), { target: { value: '5' } });
    fireEvent.click(within(root).getByRole('button', { name: 'React' }));
    fireEvent.click(within(root).getByRole('button', { name: 'Supabase' }));
    fireEvent.change(within(root).getByLabelText(/포트폴리오 링크/), { target: { value: 'https://junho.example.com' } });
    fireEvent.click(within(root).getByText(DEMO.businessTitle));
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));

    await waitFor(() => expect(location.current).toBe('/s'));
    const profileCall = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/me/supplier-profile'));
    expect(JSON.parse(String(profileCall?.[1]?.body))).toEqual({
      displayName: '준호 스튜디오',
      careerYears: 5,
      skills: ['React', 'Supabase'],
      portfolioItems: [{ type: 'LINK', url: 'https://junho.example.com' }],
      ndaConsent: true,
      portfolioConsent: true,
    });
    const taxCall = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/me/supplier-tax-info'));
    expect(JSON.parse(String(taxCall?.[1]?.body))).toEqual({ businessType: 'BUSINESS' });
  });

  it('https가 아닌 포트폴리오 링크나 범위를 벗어난 경력은 저장하지 않는다', () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: {} }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/signup/supplier', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Signup-Supplier"]') as HTMLElement;

    fill(root);
    fireEvent.change(within(root).getByLabelText(/경력/), { target: { value: '81' } });
    fireEvent.change(within(root).getByLabelText(/포트폴리오 링크/), { target: { value: 'http://junho.example.com' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.submit }));

    expect(within(root).getByText(DEMO.careerError)).toBeTruthy();
    expect(within(root).getByText(DEMO.portfolioError)).toBeTruthy();
    expect(fetchMock.mock.calls.some(([path]) => String(path).endsWith('/me/supplier-profile'))).toBe(false);
  });
});

/* 공급자 공개 프로필 실제 API — GET /profiles/suppliers/:sid · /reviews */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const profile = {
  supplierId: 'supplier-1',
  name: '최준호',
  profileImageUrl: null,
  bio: '예약·결제 연동 위주로 작업합니다.',
  displayName: '준호 스튜디오',
  createdAt: '2025-03-02T00:00:00.000Z',
  industryCodes: [],
  skills: ['React', 'Supabase'],
  careerYears: 5,
  ratingAvg: 4.75,
  reviewCount: 2,
  completedContractCount: 3,
  portfolioSummary: '식당 예약 사이트 12곳을 만들었습니다.',
  portfolioItems: [{ type: 'LINK', url: 'https://junho.example.com/work', title: '작업 사례' }],
};

const reviews = [
  {
    id: 'review-1',
    rating: 5,
    comment: '일정을 잘 지켜 주셨어요.',
    tags: ['일정을 지켰어요'],
    reviewerRole: 'CLIENT',
    reviewerDisplayName: '온도 다이닝',
    createdAt: '2026-10-20T03:00:00.000Z',
  },
];

function stubFetch(profileResponse: () => Response, reviewResponse: () => Response) {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const url = String(input);
    if (url.endsWith('/profiles/suppliers/supplier-1')) return profileResponse();
    if (url.endsWith('/profiles/suppliers/supplier-1/reviews')) return reviewResponse();
    return jsonResponse({ data: [] });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PublicSupplier — 실제 공개 프로필', () => {
  it('평점·리뷰 수·완료 계약·경력·기술 스택·포트폴리오·리뷰 목록을 보여 준다', async () => {
    stubFetch(() => jsonResponse({ data: profile }), () => jsonResponse({ data: reviews }));
    const { container } = renderAt('/c/suppliers/supplier-1', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="PublicSupplier"]') as HTMLElement;

    expect(await within(root).findByRole('heading', { level: 1, name: '준호 스튜디오' })).toBeTruthy();
    expect(within(root).getByText(/경력 5년 · ★ 4\.8 · 리뷰 2건 · 완료한 계약 3건 · 2025년 3월 가입/)).toBeTruthy();
    expect(within(root).getByText('React')).toBeTruthy();
    expect(within(root).getByText('식당 예약 사이트 12곳을 만들었습니다.')).toBeTruthy();
    expect(within(root).getByRole('link', { name: '작업 사례' }).getAttribute('href')).toBe('https://junho.example.com/work');
    expect(await within(root).findByText('일정을 잘 지켜 주셨어요.')).toBeTruthy();
    expect(within(root).getByText('온도 다이닝')).toBeTruthy();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('리뷰가 없으면 빈 상태를 보여 준다', async () => {
    stubFetch(() => jsonResponse({ data: { ...profile, ratingAvg: null, reviewCount: 0 } }), () => jsonResponse({ data: [] }));
    const { container } = renderAt('/c/suppliers/supplier-1', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="PublicSupplier"]') as HTMLElement;

    expect(await within(root).findByText('아직 받은 리뷰가 없습니다')).toBeTruthy();
    expect(within(root).getByText(/리뷰 없음/)).toBeTruthy();
  });

  it('탈퇴했거나 없는 공급자(404)는 찾을 수 없다고 안내한다', async () => {
    stubFetch(
      () => jsonResponse({ error: { code: 'SUPPLIER_PROFILE_NOT_FOUND', message: '요청을 확인해 주세요.', requestId: 'r1' } }, 404),
      () => jsonResponse({ data: [] }),
    );
    renderAt('/c/suppliers/supplier-1', 'client', undefined, 'test-token');

    expect(await screen.findByText('공급자 프로필을 찾을 수 없습니다')).toBeTruthy();
  });

  it('?mock=이 있으면 토큰이 있어도 시연 데이터를 그린다', () => {
    const fetchMock = stubFetch(() => jsonResponse({ data: profile }), () => jsonResponse({ data: reviews }));
    renderAt(`/c/suppliers/s-sera?mock=${encodeURIComponent('리뷰 없음')}`, 'client', undefined, 'test-token');

    expect(screen.getByRole('heading', { name: '김세라' })).toBeTruthy();
    expect(fetchMock.mock.calls.some(([path]) => String(path).includes('/profiles/suppliers/'))).toBe(false);
  });
});

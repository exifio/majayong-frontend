/* 의뢰인 공개 프로필 실제 API — GET /projects/:projectId/client-profile · /client-reviews */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const errorResponse = (status: number, code: string) =>
  jsonResponse({ error: { code, message: '요청을 확인해 주세요.', requestId: 'r1' } }, status);

const client = {
  name: '정민재',
  profileImageUrl: null,
  bio: '전화 예약을 줄이고 싶어요.',
  businessName: '온도 다이닝',
  industryField: '예약 기반 음식점',
  storeAddress: '서울 마포구',
  websiteUrl: 'https://ondo.example.com',
  createdAt: '2026-08-01T00:00:00.000Z',
  ratingAvg: 4.5,
  reviewCount: 1,
  recruitingProjectCount: 2,
};

const reviews = [
  {
    id: 'review-1',
    rating: 4,
    comment: '검수가 빨랐습니다.',
    tags: ['검수가 빨랐어요'],
    reviewerRole: 'SUPPLIER',
    reviewerDisplayName: '이도윤',
    createdAt: '2026-10-02T03:00:00.000Z',
  },
];

function stubFetch(profileResponse: () => Response, reviewResponse: () => Response) {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const url = String(input);
    if (url.endsWith('/projects/project-1/client-profile')) return profileResponse();
    if (url.endsWith('/projects/project-1/client-reviews')) return reviewResponse();
    return jsonResponse({ data: [] });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PublicClient — 실제 의뢰인 프로필(프로젝트 기준)', () => {
  it('?project=로 들어오면 의뢰인 프로필과 받은 리뷰를 보여 주고 연락처는 없다', async () => {
    stubFetch(() => jsonResponse({ data: client }), () => jsonResponse({ data: reviews }));
    const { container } = renderAt('/s/clients/project?project=project-1', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="PublicClient"]') as HTMLElement;

    expect(await within(root).findByRole('heading', { level: 1, name: '정민재 · 온도 다이닝' })).toBeTruthy();
    expect(within(root).getByText(/★ 4\.5 · 리뷰 1건 · 모집 중 프로젝트 2건/)).toBeTruthy();
    expect(within(root).getByText('서울 마포구')).toBeTruthy();
    expect(within(root).getByRole('link', { name: 'https://ondo.example.com' })).toBeTruthy();
    expect(await within(root).findByText('검수가 빨랐습니다.')).toBeTruthy();
    expect(within(root).queryByText(/[\w.-]+@[\w.-]+\.\w+/)).toBeNull();
    expect(within(root).getByRole('link', { name: '프로젝트로 돌아가기' }).getAttribute('href')).toBe('/s/projects/project-1');
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('NDA 동의 전(403 SUPPLIER_NDA_REQUIRED)이면 동의가 필요하다고 안내한다', async () => {
    stubFetch(() => errorResponse(403, 'SUPPLIER_NDA_REQUIRED'), () => jsonResponse({ data: [] }));
    renderAt('/s/clients/project?project=project-1', 'supplier', undefined, 'test-token');

    expect(await screen.findByText('비밀유지 의무 동의가 필요합니다')).toBeTruthy();
  });

  it('프로젝트 정보 없이 들어오면 API를 부르지 않고 프로젝트에서 열도록 안내한다', async () => {
    const fetchMock = stubFetch(() => jsonResponse({ data: client }), () => jsonResponse({ data: reviews }));
    renderAt('/s/clients/u-ondo', 'supplier', undefined, 'test-token');

    expect(await screen.findByText('프로젝트에서 의뢰인 프로필을 열어 주세요')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([path]) => String(path).includes('/client-profile'))).toBe(false);
  });

  it('리뷰가 없으면 첫 거래 빈 상태를 보여 준다', async () => {
    stubFetch(() => jsonResponse({ data: { ...client, ratingAvg: null, reviewCount: 0 } }), () => jsonResponse({ data: [] }));
    renderAt('/s/clients/project?project=project-1', 'supplier', undefined, 'test-token');

    expect(await screen.findByText('아직 완료한 거래가 없습니다')).toBeTruthy();
  });
});

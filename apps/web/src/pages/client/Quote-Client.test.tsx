/* 견적서 상세 — 실제 경로는 지원 목록에서 sid를 찾아 GET /applications/:applicationId로 보인다 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import type { ApplicationRevisionDto, SupplierApplicationCardDto } from '@majayong/types/api';
import { renderAt } from '@/test/render';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const CARD: SupplierApplicationCardDto = {
  applicationId: 'app-1',
  supplierId: 'sup-1',
  revisionNo: 1,
  totalAmount: 3_300_000,
  durationDays: 21,
  questionCount: 0,
  revisionCount: 0,
  submittedAt: '2026-11-01T01:00:00.000Z',
  careerYears: 5,
  ratingAvg: null,
  reviewCount: 0,
  completedContractCount: 0,
  portfolioSummary: null,
};

const APPLICATION: ApplicationRevisionDto = {
  id: 'app-1',
  projectId: 'p-9',
  clientUserId: 'c-1',
  supplierId: 'sup-1',
  revisionNo: 1,
  specVersionNo: 1,
  status: 'SUBMITTED',
  totalAmount: 3_300_000,
  durationDays: 21,
  firstViewedAt: '2026-10-30T01:00:00.000Z',
  submittedAt: '2026-11-01T01:00:00.000Z',
  message: '근무표부터 만들겠습니다.',
  questions: [],
  isMessageMasked: false,
  revisionReason: null,
  items: [],
};

function stubApi() {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const url = String(input);
    if (url === '/api/v1/projects/p-9/applications') return jsonResponse({ data: [CARD] });
    if (url === '/api/v1/applications/app-1') return jsonResponse({ data: APPLICATION });
    return jsonResponse({ error: { code: 'NOT_FOUND', message: '요청을 확인해 주세요.', requestId: 'r' } }, 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('견적서 상세 — 실제 API', { timeout: 20_000 }, () => {
  it('공급자 ID로 지원서를 찾아 실제 상세를 보이고 시연 공급자는 보이지 않는다', async () => {
    const fetchMock = stubApi();
    renderAt('/c/projects/p-9/proposals?modal=quote&sid=sup-1', 'client', undefined, 'test-token');

    const dialog = await screen.findByRole('dialog', { name: '견적서 상세' });
    expect(await within(dialog).findByText('근무표부터 만들겠습니다.')).toBeTruthy();
    expect(dialog.textContent).toMatch(/3,300,000원/);
    expect(dialog.textContent).not.toMatch(/최준호|김세라|스튜디오 넛/);
    expect(fetchMock.mock.calls.some(([url]) => String(url) === '/api/v1/applications/app-1')).toBe(true);
  });

  it('목록에 없는 sid는 찾을 수 없다고 안내한다', async () => {
    stubApi();
    renderAt('/c/projects/p-9/proposals?modal=quote&sid=unknown', 'client', undefined, 'test-token');
    const dialog = await screen.findByRole('dialog', { name: '견적서 상세' });
    expect(await within(dialog).findByText('견적서를 찾을 수 없습니다')).toBeTruthy();
  });

  it('sid가 없으면 시연 데이터 대신 제안 비교로 돌아가게 한다', async () => {
    stubApi();
    renderAt('/c/projects/p-9/proposals?modal=quote', 'client', undefined, 'test-token');
    const dialog = await screen.findByRole('dialog', { name: '견적서 상세' });
    expect(await within(dialog).findByText('열 견적서를 고르지 않았습니다')).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: '제안 비교로 돌아가기' })).toBeTruthy();
  });
});

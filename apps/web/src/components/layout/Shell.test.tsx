import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const block = (over: Record<string, unknown>) => ({
  id: 'b',
  title: '블록',
  unitPrice: 100,
  isActive: true,
  mergedIntoId: null,
  description: '',
  functionSummary: '',
  industryCode: 'RESTAURANT',
  techTags: [],
  conditions: [],
  priceBasis: '',
  source: 'AI',
  reviewedAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  sourceProjectCount: 0,
  ...over,
});

function respond(url: string): Response {
  if (url.includes('/admin/blocks')) {
    return jsonResponse({
      data: [
        block({ id: 'b1' }),
        block({ id: 'b2' }),
        block({ id: 'b3', reviewedAt: '2026-11-02T00:00:00.000Z' }),
        block({ id: 'b4', source: 'TEAM' }),
        block({ id: 'b5', isActive: false }),
      ],
    });
  }
  if (url.includes('/admin/deposits/held')) {
    return jsonResponse({ data: [{ id: 'd1', contractId: 'c1', amount: 1, status: 'HELD', heldReason: '' }] });
  }
  if (url.includes('/admin/contracts/cancellation-queue')) return jsonResponse({}, 500);
  if (url.includes('/admin/inspection-requests/escalated')) return jsonResponse({ data: [{}, {}, {}] });
  if (url.includes('/admin/reports')) {
    return jsonResponse({ data: [{ status: 'OPEN' }, { status: 'OPEN' }, { status: 'OPEN' }, { status: 'OPEN' }] });
  }
  return jsonResponse({ data: [] });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('운영자 셸', () => {
  it('문의가 아닌 운영자 화면에서도 WAITING 문의만 메뉴 배지로 표시한다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async (input) => {
      if (String(input).includes('/admin/support/inquiries')) {
        return jsonResponse({ data: [{ status: 'WAITING' }, { status: 'ANSWERED' }, { status: 'WAITING' }] });
      }
      return jsonResponse({ data: [] });
    }));
    renderAt('/admin/blocks', 'admin', undefined, 'test-token');
    const inquiryLink = within(screen.getByRole('navigation', { name: '운영자 메뉴' }))
      .getByRole('link', { name: /1:1 문의/ });

    await waitFor(() => expect(inquiryLink.textContent).toBe('1:1 문의2'));
  });
});

describe('운영자 셸 — 메뉴 배지', () => {
  it('목록 API 길이로 배지를 세고, 실패한 메뉴에는 배지를 그리지 않는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => respond(String(input)));
    vi.stubGlobal('fetch', fetchMock);
    renderAt('/admin/events', 'admin', undefined, 'test-token');
    const nav = screen.getByRole('navigation', { name: '운영자 메뉴' });
    const link = (name: RegExp) => within(nav).getByRole('link', { name });

    await waitFor(() => expect(link(/블록 검토/).textContent).toBe('블록 검토2'));
    await waitFor(() => expect(link(/보류된 결제/).textContent).toBe('보류된 결제1'));
    await waitFor(() => expect(link(/이견 개입/).textContent).toBe('이견 개입3'));
    await waitFor(() => expect(link(/신고 처리/).textContent).toBe('신고 처리4'));
    expect(link(/환불 처리/).textContent).toBe('환불 처리');
    expect(fetchMock.mock.calls.some(([path]) => String(path).includes('/admin/reports?status=OPEN'))).toBe(true);
  });

  it('토큰이 없으면 시연 숫자를 그리지 않는다', () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [] })));
    renderAt('/admin/events?mock=목록', 'admin');
    const nav = screen.getByRole('navigation', { name: '운영자 메뉴' });
    expect(within(nav).getByRole('link', { name: /블록 검토/ }).textContent).toBe('블록 검토');
    expect(within(nav).getByRole('link', { name: /신고 처리/ }).textContent).toBe('신고 처리');
  });
});

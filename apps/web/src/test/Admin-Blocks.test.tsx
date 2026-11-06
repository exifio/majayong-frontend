/* 블록 검토 Admin-Blocks — 실제 /admin/blocks */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { AdminBlockDto } from '@majayong/types/api';
import { findDesignViolations } from '@/app/devChecks';
import { renderAt } from './render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const block = (over: Partial<AdminBlockDto> = {}): AdminBlockDto => ({
  id: 'block-1',
  title: '노쇼 관리',
  unitPrice: 950_000,
  isActive: true,
  mergedIntoId: null,
  description: '노쇼 손님을 표시하고 횟수를 기록합니다.',
  functionSummary: '노쇼 손님을 표시하고 노쇼 횟수를 기록',
  industryCode: 'FOOD',
  techTags: ['예약', '알림'],
  conditions: [
    { key: 'count', text: '노쇼 횟수 기준' },
    { key: 'place', text: '표시 위치' },
  ],
  priceBasis: '노쇼 표시와 집계\n예약 화면 1개\n검증 전 추정',
  source: 'AI',
  reviewedAt: null,
  createdAt: '2026-11-02T00:14:00.000Z',
  sourceProjectCount: 2,
  ...over,
});

const blocks = [block(), block({ id: 'block-2', title: '예약 메모', unitPrice: 400_000 })];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Admin-Blocks — 블록 검토', () => {
  it('실제 목록과 선택한 블록의 근거를 보여 준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: blocks })),
    );
    const { container } = renderAt('/admin/blocks?id=block-1', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Blocks"]') as HTMLElement;

    expect(await within(root).findByRole('heading', { name: '노쇼 관리' })).toBeTruthy();
    expect(within(root).getAllByText(/출처 프로젝트 2건/).length).toBeGreaterThan(0);
    expect(within(root).getByText('노쇼 횟수 기준')).toBeTruthy();
    expect(within(root).getByText(/노쇼 표시와 집계/)).toBeTruthy();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('병합은 대상과 사유를 보내고 목록을 다시 읽는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (init?.method === 'POST') {
        return jsonResponse({ data: { success: true, blockId: 'block-1', action: 'MERGE' } });
      }
      return jsonResponse({ data: blocks });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/blocks?id=block-1', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Blocks"]') as HTMLElement;

    fireEvent.click(await within(root).findByRole('button', { name: '기존 블록에 병합' }));
    const dialog = screen.getByRole('dialog', { name: /병합/ });
    fireEvent.change(within(dialog).getByLabelText(/사유/), {
      target: { value: '기능 요약이 같고 이름만 다릅니다.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: '병합하기' }));

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true),
    );
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      action: 'MERGE',
      reason: '기능 요약이 같고 이름만 다릅니다.',
      mergedIntoId: 'block-2',
    });
  });

  it('단가 수정은 양의 정수 금액과 사유를 보낸다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (init?.method === 'POST') {
        return jsonResponse({ data: { success: true, blockId: 'block-1', action: 'UPDATE_PRICE' } });
      }
      return jsonResponse({ data: blocks });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/blocks?id=block-1', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Blocks"]') as HTMLElement;

    fireEvent.click(await within(root).findByRole('button', { name: '단가 수정' }));
    const dialog = screen.getByRole('dialog', { name: /단가 수정/ });
    fireEvent.change(within(dialog).getByLabelText('새 단가'), { target: { value: '900000' } });
    fireEvent.change(within(dialog).getByLabelText(/사유/), {
      target: { value: '작업량이 적게 잡혔습니다.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: '단가 확정' }));

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true),
    );
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      action: 'UPDATE_PRICE',
      reason: '작업량이 적게 잡혔습니다.',
      unitPrice: 900_000,
    });
  });

  it('비활성화는 확인 모달에서 사유를 받는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (init?.method === 'POST') {
        return jsonResponse({ data: { success: true, blockId: 'block-1', action: 'DISABLE' } });
      }
      return jsonResponse({ data: blocks });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/blocks?id=block-1', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Blocks"]') as HTMLElement;

    fireEvent.click(await within(root).findByRole('button', { name: '비활성화' }));
    const dialog = screen.getByRole('dialog', { name: /비활성화/ });
    expect(dialog.getAttribute('data-danger')).toBe('true');
    fireEvent.change(within(dialog).getByLabelText(/사유/), {
      target: { value: '다른 블록으로 대체합니다.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: '비활성화' }));

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true),
    );
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      action: 'DISABLE',
      reason: '다른 블록으로 대체합니다.',
    });
  });

  it('블록이 없으면 빈 상태를 보여 준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [] })),
    );
    renderAt('/admin/blocks', 'admin', undefined, 'test-token');

    expect(await screen.findByText('블록이 없습니다')).toBeTruthy();
  });
});

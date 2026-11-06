/* 이견 개입 Admin-Disputes — 실제 /admin/inspection-requests/escalated */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { AdminEscalatedInspectionDto } from '@majayong/types/api';
import { findDesignViolations } from '@/app/devChecks';
import { location, renderAt } from './render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const inspection = (over: Partial<AdminEscalatedInspectionDto> = {}): AdminEscalatedInspectionDto => ({
  id: 'inspection-1',
  contractItemId: 'item-1',
  deliveryId: 'delivery-1',
  status: 'ESCALATED',
  reason: 'CONDITION_MISMATCH',
  contractId: 'contract-1',
  projectTitle: '회차 예약, 대기 등록 외 1개 기능',
  itemTitle: '회차 예약',
  itemDescription: '회차마다 정원을 정해 예약받기',
  clientName: '누리 국수',
  supplierName: '이도윤',
  agreedAmount: 2_200_000,
  clientFee: 110_000,
  interimRatio: 50,
  conditions: [
    { key: '회차 구성', text: '점심 1회 · 저녁 2회, 회차마다 정원 12석', state: 'DECIDED' },
    { key: '정원 변경', text: '정원 변경 방식', state: 'UNDECIDED' },
  ],
  escalation: {
    requestedBy: 'client',
    what: '정원 초과',
    client: '두 손님이 동시에 예약하면 정원 12석을 넘습니다.',
    supplier: '정원 12석은 지켜집니다. 동시 예약은 고쳤습니다.',
    evidence: [],
  },
  history: [
    {
      id: 'history-1',
      reason: 'CONDITION_MISMATCH',
      conditionKey: null,
      note: '정원 초과',
      status: 'RESOLVED',
      deliveryAttemptNo: 1,
      createdAt: '2026-11-20T00:00:00.000Z',
      resolvedAt: '2026-11-21T00:00:00.000Z',
      decision: null,
    },
    {
      id: 'history-2',
      reason: 'CONDITION_MISMATCH',
      conditionKey: null,
      note: '동시 예약',
      status: 'ESCALATED',
      deliveryAttemptNo: 3,
      createdAt: '2026-11-27T00:00:00.000Z',
      resolvedAt: null,
      decision: null,
    },
  ],
  delivery: {
    id: 'delivery-1',
    attemptNo: 3,
    summary: '동시 예약을 고쳤습니다.',
    items: null,
    submittedAt: '2026-11-26T00:00:00.000Z',
  },
  createdAt: '2026-11-28T00:00:00.000Z',
  resolvedAt: null,
  ...over,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Admin-Disputes — 이견 개입', () => {
  it('실제 이견의 주장·조건·보완 기록을 보여 준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [inspection()] })),
    );
    const { container } = renderAt('/admin/disputes', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Disputes"]') as HTMLElement;

    expect(await within(root).findByRole('heading', { name: '회차 예약' })).toBeTruthy();
    expect(within(root).getByText('두 손님이 동시에 예약하면 정원 12석을 넘습니다.')).toBeTruthy();
    expect(within(root).getByText('점심 1회 · 저녁 2회, 회차마다 정원 12석')).toBeTruthy();
    expect(within(root).getByText('동시 예약을 고쳤습니다.')).toBeTruthy();
    expect(within(root).getByRole('button', { name: '판정 확정' }).hasAttribute('disabled')).toBe(true);
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('판정 결과와 사유를 실제 API로 보낸다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (init?.method === 'POST') {
        return jsonResponse({ data: inspection({ status: 'RESOLVED' }) });
      }
      return jsonResponse({ data: [inspection()] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/disputes', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Disputes"]') as HTMLElement;

    fireEvent.click(await within(root).findByRole('radio', { name: /^승인/ }));
    fireEvent.change(within(root).getByLabelText(/판정 사유/), {
      target: { value: '회차 구성 조건을 충족했습니다.' },
    });
    fireEvent.click(within(root).getByRole('button', { name: '판정 확정' }));

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true),
    );
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(String(call![0])).toContain('/admin/inspection-requests/inspection-1/decision');
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      decision: 'APPROVE',
      reason: '회차 구성 조건을 충족했습니다.',
      decisionNotes: {
        client: '회차 구성 조건을 충족했습니다.',
        supplier: '회차 구성 조건을 충족했습니다.',
      },
    });
  });

  it('판정 완료는 결과 띠를 보여 준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () =>
        jsonResponse({
          data: [
            inspection({
              status: 'RESOLVED',
              decision: 'UNDECIDED_CONDITION',
              decisionNotes: { client: '정하지 않은 조건입니다.', supplier: '정하지 않은 조건입니다.' },
              resolvedAt: '2026-11-28T07:40:00.000Z',
            }),
          ],
        }),
      ),
    );
    renderAt('/admin/disputes', 'admin', undefined, 'test-token');

    expect(await screen.findByText(/판정 완료/)).toBeTruthy();
    expect(screen.getAllByText(/부분 정산/).length).toBeGreaterThan(0);
  });

  it('이견이 없으면 빈 상태를 보여 준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [] })),
    );
    renderAt('/admin/disputes', 'admin', undefined, 'test-token');

    expect(await screen.findByText('이견이 없습니다')).toBeTruthy();
  });

  it('운영자가 아니면 역할 홈으로 보낸다', () => {
    renderAt('/admin/disputes', 'client', undefined, 'test-token');
    expect(location.current).toBe('/c');
  });
});

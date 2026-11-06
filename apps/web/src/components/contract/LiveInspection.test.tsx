/* 의뢰인 검수 — 실제 항목 id·deliveryId로 승인/보완 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ContractRecordDto } from '@majayong/types/api';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const contract: ContractRecordDto = {
  id: 'contract-1',
  applicationId: 'application-1',
  projectId: 'project-1',
  clientUserId: 'client-1',
  supplierId: 'supplier-1',
  status: 'ACTIVE',
  specVersionNo: 1,
  agreedAmount: 3_100_000,
  durationDays: 30,
  clientFee: 155_000,
  supplierFee: 155_000,
  interimRatio: 50,
  consentDeadline: '2026-11-10T00:00:00.000Z',
  contentHash: 'hash',
  clientSignedAt: '2026-11-06T00:00:00.000Z',
  supplierSignedAt: '2026-11-06T00:00:00.000Z',
  depositDeadline: '2026-11-09T00:00:00.000Z',
  paymentStatus: 'DEPOSITED',
  totalDeposited: 3_100_000,
  items: [
    {
      id: 'item-interim',
      blockId: 'block-1',
      title: '예약 달력',
      description: '중간 항목',
      origin: 'AGREEMENT',
      stage: 'INTERIM',
      sortOrder: 0,
      conditions: [],
    },
  ],
};

const workspace = (mock: ReturnType<typeof vi.fn<typeof fetch>>) => mock.mockImplementation(async (input) => {
  const url = String(input);
  if (url.endsWith('/contracts/contract-1')) return jsonResponse({ data: contract });
  if (url.endsWith('/contracts/contract-1/installments')) {
    return jsonResponse({ data: { simulated: true, transferNote: '', installments: [
      { id: 'installment-1', stage: 'INTERIM', ratio: 50, amount: 1_550_000, status: 'DELIVERED', approvedAt: null, releasedAt: null, holdReason: null },
    ] } });
  }
  if (url.endsWith('/installments/installment-1/deliveries')) {
    return jsonResponse({ data: [{
      id: 'delivery-1', installmentId: 'installment-1', attemptNo: 1,
      items: [{ contractItemId: 'item-interim', links: ['https://example.com/demo'], files: [], howToCheck: '화면에서 확인' }],
      summary: null, status: 'SUBMITTED', submittedAt: '2026-11-06T00:00:00.000Z',
      inspectionDueAt: '2026-11-13T00:00:00.000Z', reviewedAt: null,
    }] });
  }
  return jsonResponse({ data: {} });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LiveInspection — 의뢰인 검수', () => {
  it('항목을 승인하면 상태가 승인 완료로 바뀐다', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    workspace(fetchMock);
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/c/contracts/contract-1/inspect', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Inspect-Client"]') as HTMLElement;

    fireEvent.click(await within(root).findByRole('button', { name: '승인' }));

    expect(await within(root).findByText('승인 완료')).toBeTruthy();
    const call = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/contract-items/item-interim/approve'));
    expect(call).toBeTruthy();
    expect(JSON.parse(String(call![1]?.body))).toEqual({ deliveryId: 'delivery-1' });
  });

  it('보완 사유를 보내면 상태가 보완 요청함으로 바뀐다', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    workspace(fetchMock);
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/c/contracts/contract-1/inspect', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Inspect-Client"]') as HTMLElement;

    fireEvent.click(await within(root).findByRole('button', { name: '보완 요청' }));
    fireEvent.change(within(root).getByLabelText('보완 사유'), { target: { value: '링크가 열리지 않습니다' } });
    fireEvent.click(within(root).getByRole('button', { name: '보완 요청 보내기' }));

    expect(await within(root).findByText('보완 요청함')).toBeTruthy();
    const call = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/contract-items/item-interim/rework-requests'));
    expect(call).toBeTruthy();
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      deliveryId: 'delivery-1',
      reason: 'OTHER',
      note: '링크가 열리지 않습니다',
    });
  });
});

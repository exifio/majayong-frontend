/* 계약서 — 서명 전 결렬(공급자 서명 거절 · 의뢰인 임시 계약 취소) */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ContractRecordDto } from '@majayong/types/api';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const pending: ContractRecordDto = {
  id: 'contract-1',
  applicationId: 'application-1',
  projectId: 'project-1',
  clientUserId: 'client-1',
  supplierId: 'supplier-1',
  status: 'PENDING_CONSENT',
  specVersionNo: 1,
  agreedAmount: 2_800_000,
  durationDays: 20,
  clientFee: 140_000,
  supplierFee: 140_000,
  interimRatio: 50,
  consentDeadline: '2099-11-12T00:00:00.000Z',
  contentHash: 'hash-1234567890abcdef',
  clientSignedAt: null,
  supplierSignedAt: null,
  depositDeadline: null,
  paymentStatus: 'PENDING',
  totalDeposited: 0,
  items: [],
};

const document = {
  contractId: 'contract-1',
  contentHash: pending.contentHash,
  status: 'PENDING_CONSENT',
  agreedAmount: 2_800_000,
  clientFee: 140_000,
  supplierFee: 140_000,
  interimRatio: 50,
  depositAmount: 2_940_000,
  supplierPayout: 2_660_000,
  items: [],
};

function workspace(contract: ContractRecordDto, afterBreak?: ContractRecordDto) {
  let broken = false;
  return vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
    const url = String(input);
    if (init?.method === 'POST' && (url.endsWith('/decline') || url.endsWith('/cancel-provisional'))) {
      broken = true;
      return jsonResponse({ data: { broken: true, contract: null, projectStatus: 'SELECTING' } });
    }
    if (url.endsWith('/contracts/contract-1')) return jsonResponse({ data: broken && afterBreak ? afterBreak : contract });
    if (url.endsWith('/contracts/contract-1/document')) return jsonResponse({ data: document });
    return jsonResponse({ error: { code: 'NOT_FOUND', message: '없음', requestId: 'r' } }, 404);
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LiveContract — 서명 전 결렬', () => {
  it('공급자는 확인 후 서명을 거절하고 결렬된 계약을 다시 불러온다', async () => {
    const fetchMock = workspace(pending, { ...pending, status: 'CANCELLED' });
    vi.stubGlobal('fetch', fetchMock);
    renderAt('/s/contracts/contract-1', 'supplier', undefined, 'test-token');

    fireEvent.click(await screen.findByRole('button', { name: '서명 거절' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/되돌릴 수 없습니다/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: '서명 거절' }));

    expect(await screen.findByText('서명을 거절했습니다. 계약이 결렬되었습니다.')).toBeTruthy();
    const call = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/contracts/contract-1/decline'));
    expect(call?.[1]?.method).toBe('POST');
    expect(JSON.parse(String(call![1]!.body))).toEqual({});
    await waitFor(() => expect(screen.queryByRole('button', { name: '서명 거절' })).toBeNull());
  }, 15000);

  it('의뢰인은 임시 계약 취소를 보내고 공급자 거절 버튼은 보이지 않는다', async () => {
    const fetchMock = workspace(pending);
    vi.stubGlobal('fetch', fetchMock);
    renderAt('/c/contracts/contract-1', 'client', undefined, 'test-token');

    expect(screen.queryByRole('button', { name: '서명 거절' })).toBeNull();
    fireEvent.click(await screen.findByRole('button', { name: '임시 계약 취소' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '임시 계약 취소' }));

    expect(await screen.findByText('임시 계약을 취소했습니다.')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([url, init]) =>
      String(url).endsWith('/contracts/contract-1/cancel-provisional') && init?.method === 'POST')).toBe(true);
  }, 15000);

  it('체결된 계약에는 결렬 버튼 대신 취소 요청 링크를 보여 준다', async () => {
    vi.stubGlobal('fetch', workspace({
      ...pending,
      status: 'ACTIVE',
      paymentStatus: 'DEPOSITED',
      clientSignedAt: '2026-11-06T00:00:00.000Z',
      supplierSignedAt: '2026-11-06T00:00:00.000Z',
      totalDeposited: 2_940_000,
    }));
    renderAt('/c/contracts/contract-1', 'client', undefined, 'test-token');

    const link = await screen.findByRole('link', { name: '계약 취소 요청' });
    expect(link.getAttribute('href')).toBe('/c/contracts/contract-1/cancel');
    expect(screen.queryByRole('button', { name: '임시 계약 취소' })).toBeNull();
  }, 15000);
});

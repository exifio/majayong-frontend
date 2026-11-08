/* 공급자 납품 — 실제 계약 항목 id로 제출 */
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LiveDelivery — 공급자 납품', () => {
  it('계약 항목 id로 납품을 제출하고 완료 상태를 보여 준다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith('/contracts/contract-1') && init?.method !== 'POST') {
        return jsonResponse({ data: contract });
      }
      if (url.endsWith('/contracts/contract-1/installments')) {
        return jsonResponse({ data: { simulated: true, transferNote: '', installments: [
          { id: 'installment-1', stage: 'INTERIM', ratio: 50, amount: 1_550_000, status: 'PENDING', approvedAt: null, releasedAt: null, holdReason: null },
        ] } });
      }
      if (url.endsWith('/installments/installment-1/deliveries') && init?.method === 'POST') {
        return jsonResponse({ data: { id: 'delivery-1' } }, 201);
      }
      return jsonResponse({ data: [] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/s/contracts/contract-1/deliver', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Deliver-Supplier"]') as HTMLElement;

    fireEvent.change(await within(root).findByLabelText('예약 달력 결과물 링크'), { target: { value: 'https://example.com/demo' } });
    fireEvent.change(within(root).getByLabelText('예약 달력 확인 방법'), { target: { value: '화면에서 확인' } });
    fireEvent.click(within(root).getByRole('button', { name: '납품 제출' }));

    await waitFor(() => expect(within(root).getByText(/납품을 제출했습니다/)).toBeTruthy());
    const call = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/installments/installment-1/deliveries'));
    expect(call).toBeTruthy();
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      items: [{
        contractItemId: 'item-interim',
        links: ['https://example.com/demo'],
        files: [],
        howToCheck: '화면에서 확인',
      }],
    });
    expect(within(root).queryByRole('button', { name: '납품 제출' })).toBeNull();
  }, 15000);

  it('항목별 파일을 DELIVERY 용도로 올리고 링크 여러 개·확인 방법과 함께 제출한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith('/contracts/contract-1')) return jsonResponse({ data: contract });
      if (url.endsWith('/contracts/contract-1/installments')) {
        return jsonResponse({ data: { simulated: true, transferNote: '', installments: [
          { id: 'installment-1', stage: 'INTERIM', ratio: 50, amount: 1_550_000, status: 'PENDING', approvedAt: null, releasedAt: null, holdReason: null },
        ] } });
      }
      if (url.endsWith('/uploads/presign')) {
        return jsonResponse({ data: { fileId: 'file-1', uploadUrl: 'https://storage.example.com/put', objectKey: 'k', expiresInSec: 600 } }, 201);
      }
      if (url === 'https://storage.example.com/put') return new Response(null, { status: 200 });
      if (url.endsWith('/installments/installment-1/deliveries') && init?.method === 'POST') {
        return jsonResponse({ data: { id: 'delivery-1' } }, 201);
      }
      return jsonResponse({ data: [] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/s/contracts/contract-1/deliver', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Deliver-Supplier"]') as HTMLElement;

    const file = new File(['pdf'], '화면설계.pdf', { type: 'application/pdf' });
    fireEvent.change(await within(root).findByLabelText('예약 달력 첨부 파일'), { target: { files: [file] } });
    expect(await within(root).findByRole('button', { name: '화면설계.pdf 빼기' })).toBeTruthy();
    const presign = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/uploads/presign'));
    expect(JSON.parse(String(presign![1]?.body))).toEqual({
      purpose: 'DELIVERY', contractId: 'contract-1', fileName: '화면설계.pdf', fileSize: 3, mimeType: 'application/pdf',
    });

    fireEvent.change(within(root).getByLabelText('예약 달력 결과물 링크'), {
      target: { value: 'https://example.com/a\n\nhttps://example.com/b' },
    });
    fireEvent.change(within(root).getByLabelText('예약 달력 확인 방법'), { target: { value: '로그인 후 달력 탭' } });
    fireEvent.click(within(root).getByRole('button', { name: '납품 제출' }));

    await waitFor(() => expect(within(root).getByText(/납품을 제출했습니다/)).toBeTruthy());
    const call = fetchMock.mock.calls.find(([url, init]) =>
      String(url).endsWith('/installments/installment-1/deliveries') && init?.method === 'POST');
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      items: [{
        contractItemId: 'item-interim',
        links: ['https://example.com/a', 'https://example.com/b'],
        files: [{ fileId: 'file-1', name: '화면설계.pdf', size: 3, mimeType: 'application/pdf' }],
        howToCheck: '로그인 후 달력 탭',
      }],
    });
  }, 15000);

  it('허용되지 않은 파일 형식은 올리지 않고 오류를 알린다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/contracts/contract-1')) return jsonResponse({ data: contract });
      if (url.endsWith('/contracts/contract-1/installments')) {
        return jsonResponse({ data: { simulated: true, transferNote: '', installments: [
          { id: 'installment-1', stage: 'INTERIM', ratio: 50, amount: 1_550_000, status: 'PENDING', approvedAt: null, releasedAt: null, holdReason: null },
        ] } });
      }
      return jsonResponse({ data: [] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/s/contracts/contract-1/deliver', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Deliver-Supplier"]') as HTMLElement;

    const file = new File(['x'], 'setup.exe', { type: 'application/octet-stream' });
    fireEvent.change(await within(root).findByLabelText('예약 달력 첨부 파일'), { target: { files: [file] } });

    expect(await within(root).findByText(/setup.exe: png·jpg·webp·pdf·zip·mp4·txt 파일만/)).toBeTruthy();
    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/uploads/presign'))).toBe(false);
  }, 15000);
});

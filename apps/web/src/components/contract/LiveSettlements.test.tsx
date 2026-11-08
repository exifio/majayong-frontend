/* 정산 내역 — 실제 GET /me/payment-statements 응답만 그린다. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderAt } from '@/test/render';
import type { ClientPaymentStatementDto, SupplierPaymentStatementDto } from '@majayong/types/api';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const clientStatement: ClientPaymentStatementDto = {
  simulated: true,
  transferNote: '실제 이체가 아닌 시뮬레이션/수동 처리 기록입니다.',
  contractId: 'contract-1',
  totalDeposited: 3_100_000,
  paidToSupplier: 1_550_000,
  remainingDeposit: 1_550_000,
  clientFeePaid: 155_000,
  installments: [
    { stage: 'INTERIM', status: 'RELEASED', amount: 1_550_000, releasedAt: '2026-11-08T00:00:00.000Z' },
  ],
};

const supplierStatement: SupplierPaymentStatementDto = {
  simulated: true,
  transferNote: '실제 이체가 아닌 시뮬레이션/수동 처리 기록입니다.',
  contractId: 'contract-1',
  totalAgreed: 3_100_000,
  totalReceived: 1_421_350,
  expectedToReceive: 1_421_350,
  supplierFeePaid: 77_500,
  withholdingTaxTotal: 51_150,
  installments: [
    {
      stage: 'INTERIM',
      status: 'RELEASED',
      amount: 1_550_000,
      releaseAmount: 1_421_350,
      supplierFee: 77_500,
      withholdingTax: 51_150,
      releasedAt: '2026-11-08T00:00:00.000Z',
    },
  ],
};

const statements = (items: unknown[]) => jsonResponse({
  data: {
    simulated: true,
    transferNote: '실제 이체가 아닌 시뮬레이션/수동 처리 기록입니다.',
    statements: items,
  },
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LiveSettlements — 정산 내역', () => {
  it('내역이 없으면 빈 상태를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => statements([])));
    renderAt('/c/settlements', 'client', undefined, 'test-token');

    expect(await screen.findByText('아직 정산 내역이 없습니다')).toBeTruthy();
  }, 15000);

  it('의뢰인: 예치·지급·남은 예치금과 시뮬레이션 고지를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => statements([clientStatement])));
    renderAt('/c/settlements', 'client', undefined, 'test-token');

    expect((await screen.findAllByText('3,100,000원')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('1,550,000원').length).toBeGreaterThan(0);
    expect(screen.getByText(/시뮬레이션\/수동 처리 기록/)).toBeTruthy();
  }, 15000);

  it('공급자: 받은 금액·세후 받을 금액·원천징수를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => statements([supplierStatement])));
    renderAt('/s/settlements', 'supplier', undefined, 'test-token');

    expect((await screen.findAllByText('1,421,350원')).length).toBeGreaterThan(0);
    expect(screen.getByText('51,150원')).toBeTruthy();
  }, 15000);

  it('목록 요청이 실패하면 오류를 알린다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({
      error: { code: 'INTERNAL_ERROR', message: '오류', requestId: 'r1' },
    }, 500)));
    renderAt('/c/settlements', 'client', undefined, 'test-token');

    expect(await screen.findByRole('alert')).toBeTruthy();
  }, 15000);

  it('한 계약(?contract=)은 GET /contracts/:id/statement로 그리고 목록 API는 부르지 않는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      if (String(input).endsWith('/contracts/contract-1/statement')) return jsonResponse({ data: clientStatement });
      return statements([]);
    });
    vi.stubGlobal('fetch', fetchMock);
    renderAt('/c/settlements?contract=contract-1', 'client', undefined, 'test-token');

    expect((await screen.findAllByText('3,100,000원')).length).toBeGreaterThan(0);
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/me/payment-statements'))).toBe(false);
    expect(screen.queryByRole('button', { name: /세금계산서/ })).toBeNull();
    expect(screen.getByRole('link', { name: '전체 정산 내역 보기' })).toBeTruthy();
  }, 15000);

  function supplierContract(businessType: 'BUSINESS' | 'INDIVIDUAL') {
    const supplierSingle = {
      ...supplierStatement,
      installments: [
        { ...supplierStatement.installments[0]!, taxInvoiceIssuedAt: null },
        { stage: 'FINAL', status: 'PENDING', amount: 1_550_000, releaseAmount: 1_421_350, supplierFee: 77_500, withholdingTax: 51_150, taxInvoiceIssuedAt: null, releasedAt: null },
      ],
    };
    return vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith('/contracts/contract-1/statement')) return jsonResponse({ data: supplierSingle });
      if (url.endsWith('/me/supplier-profile')) {
        return jsonResponse({ data: { displayName: '공급자', businessType, bizRegNoMasked: null, payoutBank: null, payoutAccountMasked: null, payoutHolder: null, payoutVerifiedAt: null } });
      }
      if (url.endsWith('/contracts/contract-1/installments')) {
        return jsonResponse({ data: { simulated: true, transferNote: '', installments: [
          { id: 'inst-interim', stage: 'INTERIM', ratio: 50, amount: 1_550_000, status: 'RELEASED', approvedAt: null, releasedAt: null, holdReason: null },
          { id: 'inst-final', stage: 'FINAL', ratio: 50, amount: 1_550_000, status: 'PENDING', approvedAt: null, releasedAt: null, holdReason: null },
        ] } });
      }
      if (url.endsWith('/installments/inst-interim/tax-invoice-issued') && init?.method === 'POST') {
        return jsonResponse({ data: { id: 'inst-interim', stage: 'INTERIM', status: 'RELEASED', taxInvoiceIssuedAt: '2026-11-09T00:00:00.000Z' } });
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: '없음', requestId: 'r' } }, 404);
    });
  }

  it('사업자 공급자는 지급된 구간에만 세금계산서 발행 표시를 보내고 발행일을 보여 준다', async () => {
    const fetchMock = supplierContract('BUSINESS');
    vi.stubGlobal('fetch', fetchMock);
    renderAt('/s/settlements?contract=contract-1', 'supplier', undefined, 'test-token');

    const mark = await screen.findByRole('button', { name: '중간 세금계산서 발행 표시' });
    expect(screen.queryByRole('button', { name: '최종 세금계산서 발행 표시' })).toBeNull();
    fireEvent.click(mark);

    expect(await screen.findByText('세금계산서 발행 11월 9일')).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('button', { name: '중간 세금계산서 발행 표시' })).toBeNull());
    expect(fetchMock.mock.calls.some(([url, init]) =>
      String(url).endsWith('/installments/inst-interim/tax-invoice-issued') && init?.method === 'POST')).toBe(true);
  }, 15000);

  it('개인 공급자에게는 세금계산서 발행 표시를 보여 주지 않는다', async () => {
    const fetchMock = supplierContract('INDIVIDUAL');
    vi.stubGlobal('fetch', fetchMock);
    renderAt('/s/settlements?contract=contract-1', 'supplier', undefined, 'test-token');

    expect((await screen.findAllByText('1,421,350원')).length).toBeGreaterThan(0);
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/me/supplier-profile'))).toBe(true));
    expect(screen.queryByRole('button', { name: /세금계산서 발행 표시/ })).toBeNull();
  }, 15000);
});

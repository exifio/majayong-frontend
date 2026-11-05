/* 정산 내역 — 실제 GET /me/payment-statements 응답만 그린다. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
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
  });

  it('의뢰인: 예치·지급·남은 예치금과 시뮬레이션 고지를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => statements([clientStatement])));
    renderAt('/c/settlements', 'client', undefined, 'test-token');

    expect((await screen.findAllByText('3,100,000원')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('1,550,000원').length).toBeGreaterThan(0);
    expect(screen.getByText(/시뮬레이션\/수동 처리 기록/)).toBeTruthy();
  });

  it('공급자: 받은 금액·받을 예정·원천징수를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => statements([supplierStatement])));
    renderAt('/s/settlements', 'supplier', undefined, 'test-token');

    expect((await screen.findAllByText('1,421,350원')).length).toBeGreaterThan(0);
    expect(screen.getByText('51,150원')).toBeTruthy();
  });

  it('목록 요청이 실패하면 오류를 알린다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({
      error: { code: 'INTERNAL_ERROR', message: '오류', requestId: 'r1' },
    }, 500)));
    renderAt('/c/settlements', 'client', undefined, 'test-token');

    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});

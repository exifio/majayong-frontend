/* 내 계약 목록 — 실제 GET /me/contracts 응답만 그린다. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { ContractViewDto } from '@majayong/types/api';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const contract = (over: Partial<ContractViewDto> = {}): ContractViewDto => ({
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
  contentHash: 'hash-1',
  clientSignedAt: '2026-11-06T00:00:00.000Z',
  supplierSignedAt: '2026-11-06T01:00:00.000Z',
  depositDeadline: '2026-11-12T00:00:00.000Z',
  paymentStatus: 'PENDING',
  totalDeposited: 0,
  items: [],
  projectTitle: '예약 달력, 예약금 결제 외 2개 기능',
  counterpartName: '최준호',
  displayStatus: 'AWAITING_DEPOSIT',
  reviewWrittenByMe: false,
  ...over,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LiveContractsList — 내 계약', () => {
  it('계약이 없으면 빈 상태를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [] })));
    renderAt('/c/contracts', 'client', undefined, 'test-token');

    expect(await screen.findByText('아직 계약이 없습니다')).toBeTruthy();
  });

  it('계약이 있으면 합의 금액·상태·예치 상태를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [contract()] })));
    renderAt('/c/contracts', 'client', undefined, 'test-token');

    expect(await screen.findByText('3,100,000원')).toBeTruthy();
    expect(screen.getAllByText('예치 대기').length).toBeGreaterThan(0);
    expect(screen.getByText(/30일/)).toBeTruthy();
  });

  it('프로젝트 제목·상대방 이름·서버 표시 상태·리뷰 작성 여부를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({
      data: [contract({ status: 'COMPLETED', displayStatus: 'CONTRACT_COMPLETED', reviewWrittenByMe: true })],
    })));
    renderAt('/c/contracts', 'client', undefined, 'test-token');

    expect(await screen.findByText('예약 달력, 예약금 결제 외 2개 기능')).toBeTruthy();
    expect(screen.getByText('공급자 최준호')).toBeTruthy();
    expect(screen.getByText('완료')).toBeTruthy();
    expect(screen.getByText('리뷰 작성 완료')).toBeTruthy();
  });

  it('구간 진행 상태를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({
      data: [contract({
        installments: [
          { stage: 'INTERIM', status: 'DELIVERED' },
          { stage: 'FINAL', status: 'PENDING' },
        ],
      })],
    })));
    renderAt('/c/contracts', 'client', undefined, 'test-token');

    expect(await screen.findByText('중간 검수 중 · 최종 대기')).toBeTruthy();
  });

  it('목록 요청이 실패하면 오류를 알린다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({
      error: { code: 'INTERNAL_ERROR', message: '오류', requestId: 'r1' },
    }, 500)));
    renderAt('/c/contracts', 'client', undefined, 'test-token');

    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('공급자 계약도 같은 API 결과로 그린다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [contract()] })));
    renderAt('/s/contracts', 'supplier', undefined, 'test-token');

    await waitFor(() => expect(screen.getByText('3,100,000원')).toBeTruthy());
  });
});

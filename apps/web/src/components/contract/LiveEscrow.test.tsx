/* 결제(예치) — 승인 응답의 축약 계약으로 화면이 깨지지 않는지 */
import { useEffect, useState, type ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEV_SESSIONS, SessionProvider, useSession } from '@/app/session';
import { LiveEscrow } from './LiveEscrow';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fullContract = {
  id: 'contract-1', applicationId: 'application-1', projectId: 'project-1',
  clientUserId: 'client-user-1', supplierId: 'escrow-test-supplier', status: 'ACTIVE', specVersionNo: 1,
  agreedAmount: 2_800_000, durationDays: 20, clientFee: 140_000, supplierFee: 140_000, interimRatio: 50,
  consentDeadline: '2026-11-12T05:51:09.223Z', contentHash: 'hash-1234567890abcdef',
  clientSignedAt: '2026-11-05T05:58:04.790Z', supplierSignedAt: '2026-11-05T05:58:21.417Z',
  depositDeadline: '2026-11-08T14:59:00.000Z', paymentStatus: 'PENDING', totalDeposited: 0, items: [],
};

const document = {
  contractId: 'contract-1', contentHash: 'hash-1234567890abcdef', status: 'ACTIVE', agreedAmount: 2_800_000,
  clientFee: 140_000, supplierFee: 140_000, interimRatio: 50, depositAmount: 2_940_000, supplierPayout: 2_660_000, items: [],
};

const deposit = {
  id: 'deposit-1', contractId: 'contract-1', amount: 2_940_000, method: 'CARD', status: 'COMPLETED',
  idempotencyKey: 'key-1', pgKey: 'pk-1', depositedAt: '2026-11-07T00:00:00.000Z', createdAt: '2026-11-07T00:00:00.000Z', heldReason: null,
};

/* BE DepositContractInfo 그대로 — supplierId·items가 없고 공급자는 supplierUserId */
const abbreviatedContract = {
  id: 'contract-1', projectId: 'project-1', applicationId: 'application-1', clientUserId: 'client-user-1',
  supplierUserId: 'escrow-test-supplier', status: 'ACTIVE', paymentStatus: 'DEPOSITED', agreedAmount: 2_800_000,
  clientFee: 140_000, interimRatio: 50, durationDays: 20, depositDeadline: '2026-11-08T14:59:00.000Z',
  totalDeposited: 2_940_000, workDueAt: null,
};

function WithToken({ children }: { children: ReactNode }) {
  const { setApiAccessToken } = useSession();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setApiAccessToken('test-token');
    setReady(true);
  }, [setApiAccessToken]);
  return ready ? children : null;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LiveEscrow — 예치 승인 뒤 화면', () => {
  it('공급자 프로필을 못 불러와도 승인 응답의 축약 계약 때문에 화면이 깨지지 않고 다시 조회한 계약을 보여 준다', async () => {
    let deposited = false;
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/v1/contracts/contract-1') {
        return jsonResponse({ data: deposited ? { ...fullContract, paymentStatus: 'DEPOSITED', totalDeposited: 2_940_000 } : fullContract });
      }
      if (url === '/api/v1/contracts/contract-1/document') return jsonResponse({ data: document });
      // 공급자 이름을 못 받으면 화면은 계약의 supplierId로 대신 표시한다 — 축약 계약이면 여기서 깨졌다
      if (url.startsWith('/api/v1/profiles/suppliers/')) {
        return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
      }
      if (url === '/api/v1/contracts/contract-1/deposits/deposit-1/confirm' && init?.method === 'POST') {
        deposited = true;
        return jsonResponse({ data: { deposit, contract: abbreviatedContract, installments: [] } });
      }
      if (url === '/api/v1/contracts/contract-1/deposits') return jsonResponse({ data: deposited ? [deposit] : [] });
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/c/contracts/contract-1/escrow?payment=success&paymentKey=pk-1&orderId=deposit-1&amount=2940000']}>
        <SessionProvider initial={DEV_SESSIONS.client}>
          <WithToken>
            <LiveEscrow cid="contract-1" styles={{}} depositEnabled tossClientKey="test_ck_example" />
          </WithToken>
        </SessionProvider>
      </MemoryRouter>,
    );

    expect((await screen.findAllByText('예치 완료')).length).toBeGreaterThan(0);
    // 프로필 조회 결과는 모듈 캐시에 남으므로 다른 테스트와 겹치지 않는 공급자 id를 쓴다
    expect(screen.getByText(/공급자 escrow-t/)).toBeTruthy();
    await waitFor(() => {
      const contractReads = fetchMock.mock.calls.filter(([url]) => String(url) === '/api/v1/contracts/contract-1');
      expect(contractReads.length).toBeGreaterThanOrEqual(2);
    });
  }, 15_000);
});

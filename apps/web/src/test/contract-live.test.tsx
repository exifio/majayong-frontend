import { useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, DEV_SESSIONS, useSession } from '@/app/session';
import { LiveContract } from '@/components/contract/LiveContract';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const contract = {
  id: 'contract-1',
  applicationId: 'application-1',
  projectId: 'project-1',
  clientUserId: 'client-user-1',
  supplierId: 'supplier-user-1',
  status: 'PENDING_CONSENT',
  specVersionNo: 1,
  agreedAmount: 3_255_000,
  durationDays: 21,
  clientFee: 162_750,
  supplierFee: 162_750,
  interimRatio: 50,
  consentDeadline: '2026-11-10T04:00:00.000Z',
  contentHash: 'hash-1234567890abcdef',
  clientSignedAt: null,
  supplierSignedAt: null,
  depositDeadline: null,
  paymentStatus: 'PENDING',
  totalDeposited: 0,
  items: [{
    blockId: 'block-1',
    title: '예약 달력',
    description: '달력 설명',
    origin: 'CHAT',
    stage: 'INTERIM',
    sortOrder: 0,
    conditions: [{ key: 'c1', text: '조회 기간을 정한다', state: 'DECIDED', evidenceMessageIds: [] }],
  }],
};

const document = {
  contractId: 'contract-1',
  contentHash: 'hash-1234567890abcdef',
  status: 'PENDING_CONSENT',
  agreedAmount: 3_255_000,
  clientFee: 162_750,
  supplierFee: 162_750,
  interimRatio: 50,
  depositAmount: 3_417_750,
  supplierPayout: 3_092_250,
  items: contract.items,
};

function WithToken({ children }: { children: React.ReactNode }) {
  const { setApiAccessToken } = useSession();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setApiAccessToken('test-token');
    setReady(true);
  }, [setApiAccessToken]);
  return ready ? children : null;
}

function renderContract() {
  return render(
    <MemoryRouter>
      <SessionProvider initial={DEV_SESSIONS.client}>
        <WithToken>
          <LiveContract cid="contract-1" styles={{}} />
        </WithToken>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('LiveContract', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('shows the contract status, money and document hash without enabling signing', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === '/api/v1/contracts/contract-1') return jsonResponse({ data: contract });
      if (url === '/api/v1/contracts/contract-1/document') return jsonResponse({ data: document });
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderContract();

    expect(await screen.findByText('양측 서명 대기')).toBeTruthy();
    expect(screen.getByText('예약 달력')).toBeTruthy();
    expect(screen.getByText(/3,417,750원/)).toBeTruthy();
    expect(screen.getByText(/hash-1234567/)).toBeTruthy();
    const sign = screen.getByRole('button', { name: '서명' });
    expect(sign).toHaveProperty('disabled', true);
  });

  it('shows the authentication error state for a 401 response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      error: { code: 'INVALID_ACCESS_TOKEN', message: '인증 정보를 확인해 주세요.', requestId: 'r1' },
    }, 401));
    renderContract();
    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});

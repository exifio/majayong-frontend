import { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
  agreedAmount: 2_800_000,
  durationDays: 20,
  clientFee: 140_000,
  supplierFee: 140_000,
  interimRatio: 50,
  consentDeadline: '2026-11-12T05:51:09.223Z',
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
  agreedAmount: 2_800_000,
  clientFee: 140_000,
  supplierFee: 140_000,
  interimRatio: 50,
  depositAmount: 2_940_000,
  supplierPayout: 2_660_000,
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

function renderContract(initial = DEV_SESSIONS.client) {
  return render(
    <MemoryRouter initialEntries={['/c/contracts/contract-1']}>
      <SessionProvider initial={initial}>
        <WithToken>
          <Routes>
            <Route path="/c/contracts/:cid" element={<LiveContract cid="contract-1" styles={{}} />} />
            <Route path="/c/contracts/:cid/escrow" element={<p>ESCROW_PAGE</p>} />
          </Routes>
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

  function mockContract(overrides: { sign?: () => Response; contract?: unknown } = {}) {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/v1/contracts/contract-1') return jsonResponse({ data: overrides.contract ?? contract });
      if (url === '/api/v1/contracts/contract-1/document') return jsonResponse({ data: document });
      if (url === '/api/v1/contracts/contract-1/sign' && init?.method === 'POST') {
        return overrides.sign ? overrides.sign() : jsonResponse({ data: { contract, activated: false } });
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
  }

  it('signs with the document hash and waits for the other party', async () => {
    mockContract({
      sign: () => jsonResponse({ data: {
        contract: { ...contract, clientSignedAt: '2026-11-05T06:00:00.000Z' },
        activated: false,
      } }),
    });
    renderContract();

    fireEvent.click(await screen.findByRole('button', { name: '서명' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '서명' }));

    expect(await screen.findByText('서명이 완료되었습니다. 상대방 서명을 기다립니다.')).toBeTruthy();
    const post = fetchMock.mock.calls.find(([url, init]) =>
      String(url) === '/api/v1/contracts/contract-1/sign' && init?.method === 'POST');
    expect(JSON.parse(String(post![1]!.body))).toEqual({ expectedContentHash: 'hash-1234567890abcdef' });
    expect(fetchMock.mock.calls.filter(([url]) =>
      String(url) === '/api/v1/contracts/contract-1/sign')).toHaveLength(1);
  });

  it('shows the deposit step for the client after both signatures', async () => {
    mockContract({
      sign: () => jsonResponse({ data: {
        contract: {
          ...contract,
          status: 'ACTIVE',
          clientSignedAt: '2026-11-05T06:00:00.000Z',
          supplierSignedAt: '2026-11-05T06:01:00.000Z',
        },
        activated: true,
      } }),
    });
    renderContract();

    fireEvent.click(await screen.findByRole('button', { name: '서명' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '서명' }));

    expect(await screen.findByText('계약이 체결되었습니다. 예치 단계로 진행합니다.')).toBeTruthy();
    expect(screen.getByRole('link', { name: '예치 화면 보기' })).toBeTruthy();
  });

  it('shows the supplier payout and no escrow link', async () => {
    mockContract();
    renderContract(DEV_SESSIONS.supplier);

    expect(await screen.findByText('받을 금액')).toBeTruthy();
    expect(screen.getByText(/2,660,000원/)).toBeTruthy();
    expect(screen.queryByRole('link', { name: '예치 화면 보기' })).toBeNull();
  });

  it('shows the conflict message and refetches without signing again', async () => {
    mockContract({
      sign: () => jsonResponse({
        error: { code: 'CONTRACT_HASH_MISMATCH', message: '계약 문서가 변경되었습니다. 다시 확인해 주세요.', requestId: 'r2' },
      }, 409),
    });
    renderContract();

    fireEvent.click(await screen.findByRole('button', { name: '서명' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '서명' }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('계약 문서가 변경되었습니다.'));
    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) =>
      String(url) === '/api/v1/contracts/contract-1').length).toBeGreaterThan(1));
    expect(fetchMock.mock.calls.filter(([url, init]) =>
      String(url) === '/api/v1/contracts/contract-1/sign' && init?.method === 'POST')).toHaveLength(1);
  });

  it('does not enable signing for an already signed contract', async () => {
    mockContract({ contract: { ...contract, clientSignedAt: '2026-11-05T06:00:00.000Z' } });
    renderContract();

    const button = await screen.findByRole('button', { name: '서명' });
    expect(button).toHaveProperty('disabled', true);
  });

  it('does not enable signing after the consent deadline', async () => {
    mockContract({ contract: { ...contract, consentDeadline: '2020-01-01T00:00:00.000Z' } });
    renderContract();

    const button = await screen.findByRole('button', { name: '서명' });
    expect(button).toHaveProperty('disabled', true);
  });

  it('shows the authentication error state for a 401 response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      error: { code: 'INVALID_ACCESS_TOKEN', message: '인증 정보를 확인해 주세요.', requestId: 'r1' },
    }, 401));
    renderContract();
    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('완료 계약은 진행 중 문구 대신 완료 문구를 보여 준다', async () => {
    mockContract({
      contract: {
        ...contract,
        status: 'COMPLETED',
        paymentStatus: 'RELEASED',
        clientSignedAt: '2026-11-06T00:00:00.000Z',
        supplierSignedAt: '2026-11-06T00:00:00.000Z',
      },
    });
    renderContract();

    expect(await screen.findByText('거래와 정산이 모두 완료되었습니다.')).toBeTruthy();
    expect(screen.queryByText('예치가 완료되어 거래가 진행 중입니다.')).toBeNull();
  });
});

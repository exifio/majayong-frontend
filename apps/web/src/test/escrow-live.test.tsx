import { useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, DEV_SESSIONS, useSession } from '@/app/session';
import { LiveEscrow } from '@/components/contract/LiveEscrow';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const contract = {
  id: 'contract-1',
  applicationId: 'application-1',
  projectId: 'project-1',
  clientUserId: 'client-user-1',
  supplierId: 'supplier-user-1',
  status: 'ACTIVE',
  specVersionNo: 1,
  agreedAmount: 2_800_000,
  durationDays: 20,
  clientFee: 140_000,
  supplierFee: 140_000,
  interimRatio: 50,
  consentDeadline: '2026-11-12T05:51:09.223Z',
  contentHash: 'hash-1234567890abcdef',
  clientSignedAt: '2026-11-05T05:58:04.790Z',
  supplierSignedAt: '2026-11-05T05:58:21.417Z',
  depositDeadline: '2026-11-08T14:59:00.000Z',
  paymentStatus: 'PENDING',
  totalDeposited: 0,
  items: [],
};

const document = {
  contractId: 'contract-1',
  contentHash: 'hash-1234567890abcdef',
  status: 'ACTIVE',
  agreedAmount: 2_800_000,
  clientFee: 140_000,
  supplierFee: 140_000,
  interimRatio: 50,
  depositAmount: 2_940_000,
  supplierPayout: 2_660_000,
  items: [],
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

function renderEscrow() {
  return render(
    <MemoryRouter>
      <SessionProvider initial={DEV_SESSIONS.client}>
        <WithToken>
          <LiveEscrow cid="contract-1" styles={{}} />
        </WithToken>
      </SessionProvider>
    </MemoryRouter>,
  );
}

function mockEscrow(overrides: { contract?: unknown; paymentStatus?: string } = {}) {
  return vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const url = String(input);
    if (url === '/api/v1/contracts/contract-1') {
      return jsonResponse({ data: overrides.contract ?? contract });
    }
    if (url === '/api/v1/contracts/contract-1/document') {
      return jsonResponse({ data: { ...document, status: overrides.paymentStatus ?? 'ACTIVE' } });
    }
    if (url.startsWith('/api/v1/profiles/suppliers/')) {
      return jsonResponse({ data: { supplierId: 'supplier-user-1', displayName: '최준우', profileImageUrl: null } });
    }
    return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
  });
}

describe('LiveEscrow', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('shows the contract amounts, deadline and remaining amount without calling deposits', async () => {
    fetchMock.mockImplementation(mockEscrow().getMockImplementation()!);
    renderEscrow();

    expect(await screen.findByText('총 예치 금액')).toBeTruthy();
    expect(screen.getAllByText(/2,940,000원/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/남은 금액/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('예치 대기').length).toBeGreaterThan(0);
    expect(screen.getByText(/결제 요청은 아직 전송되지 않습니다/)).toBeTruthy();
    const button = screen.getByRole('button', { name: '예치하기' });
    expect(button).toHaveProperty('disabled', true);
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/deposits'))).toBe(false);
  });

  it('shows the deposited state from the contract payment status', async () => {
    fetchMock.mockImplementation(mockEscrow({
      contract: { ...contract, paymentStatus: 'DEPOSITED', totalDeposited: 2_940_000 },
    }).getMockImplementation()!);
    renderEscrow();

    expect((await screen.findAllByText('예치 완료')).length).toBeGreaterThan(0);
    expect(screen.getByText(/추가 결제는 필요하지 않습니다/)).toBeTruthy();
    const button = screen.getByRole('button', { name: '예치하기' });
    expect(button).toHaveProperty('disabled', true);
  });

  it('does not show a deposit deadline before both signatures', async () => {
    fetchMock.mockImplementation(mockEscrow({
      contract: { ...contract, status: 'PENDING_CONSENT', depositDeadline: null, clientSignedAt: null, supplierSignedAt: null },
    }).getMockImplementation()!);
    renderEscrow();

    expect((await screen.findAllByText('서명 대기')).length).toBeGreaterThan(0);
    expect(screen.queryByText('예치 기한', { exact: true })).toBeNull();
  });

  it('shows the authentication error state for a 401 response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      error: { code: 'INVALID_ACCESS_TOKEN', message: '인증 정보를 확인해 주세요.', requestId: 'r1' },
    }, 401));
    renderEscrow();
    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});

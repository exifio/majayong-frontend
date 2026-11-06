/* 리뷰 작성 실제 API 연결 — FE-17 */
import { useEffect, useState } from 'react';
import { fireEvent, screen, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, DEV_SESSIONS, useSession } from '@/app/session';
import { LiveReview } from '@/components/review/LiveReview';
import { DEMO } from '@/pages/client/Review-Client.data';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const contract = {
  id: 'contract-1',
  applicationId: 'application-1',
  projectId: 'project-1',
  clientUserId: 'client-user-1',
  supplierId: 'supplier-user-1',
  status: 'COMPLETED',
  specVersionNo: 1,
  agreedAmount: 100_000,
  durationDays: 3,
  clientFee: 5_000,
  supplierFee: 5_000,
  interimRatio: 50,
  consentDeadline: '2026-11-13T00:00:00.000Z',
  contentHash: 'hash-1',
  clientSignedAt: '2026-11-06T00:00:00.000Z',
  supplierSignedAt: '2026-11-06T00:00:00.000Z',
  depositDeadline: '2026-11-09T14:59:59.999Z',
  paymentStatus: 'RELEASED',
  totalDeposited: 105_000,
  items: [],
};

const room = {
  id: 'application-1',
  applicationId: 'application-1',
  projectId: 'project-1',
  projectTitle: '예약 달력 외 1개 기능',
  counterpartDisplayName: '최공급',
  clientUserId: 'client-user-1',
  supplierId: 'supplier-user-1',
  status: 'ACCEPTED',
  contractStatus: 'COMPLETED',
  lastMessage: null,
  unreadCount: 0,
};

const review = {
  id: 'review-1',
  contractId: 'contract-1',
  reviewerId: 'client-user-1',
  revieweeId: 'supplier-user-1',
  reviewerRole: 'CLIENT',
  rating: 5,
  comment: '일정을 잘 지켰어요',
  tags: ['일정을 지켰어요'],
  createdAt: '2026-11-06T12:00:00.000Z',
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

function renderReview() {
  return render(
    <MemoryRouter initialEntries={['/c/contracts/contract-1/review']}>
      <SessionProvider initial={DEV_SESSIONS.client}>
        <WithToken>
          <Routes>
            <Route
              path="/c/contracts/:cid/review"
              element={<LiveReview cid="contract-1" side="CLIENT" copy={DEMO} styles={{}} />}
            />
          </Routes>
        </WithToken>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('LiveReview — 실제 리뷰 API', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  function mockLive(options: { created?: unknown; contractStatus?: string; existing?: unknown[] } = {}) {
    let submitted = false;
    const created = options.created ?? review;
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/v1/contracts/contract-1') {
        return jsonResponse({ data: { ...contract, status: options.contractStatus ?? 'COMPLETED' } });
      }
      if (url === '/api/v1/me/chats') return jsonResponse({ data: [room] });
      if (url === '/api/v1/contracts/contract-1/reviews' && init?.method === 'POST') {
        submitted = true;
        return jsonResponse({ data: created }, 201);
      }
      if (url === '/api/v1/contracts/contract-1/reviews') {
        const rows = submitted ? [created] : (options.existing ?? []);
        return jsonResponse({ data: rows });
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    return () => submitted;
  }

  it('실제 계약·상대를 보여 주고 리뷰를 제출하면 내가 쓴 리뷰로 바뀐다', async () => {
    const submitted = mockLive();
    renderReview();

    expect(await screen.findByRole('heading', { name: DEMO.titleWrite })).toBeTruthy();
    expect(await screen.findByText('최공급')).toBeTruthy();
    expect(screen.getByText('예약 달력 외 1개 기능')).toBeTruthy();
    expect(screen.getByText(/합의 금액 100,000원/)).toBeTruthy();

    fireEvent.click(screen.getByRole('radio', { name: '5점' }));
    const submitButton = screen.getByRole('button', { name: DEMO.submit }) as HTMLButtonElement;
    await waitFor(() => expect(submitButton.disabled).toBe(false));
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByRole('heading', { name: DEMO.titleDone })).toBeTruthy(), { timeout: 3000 });
    expect(screen.getByText('일정을 잘 지켰어요')).toBeTruthy();
    expect(submitted()).toBe(true);
  });

  it('이미 쓴 리뷰가 있으면 작성 대신 제출 상태를 보여 준다', async () => {
    mockLive({ existing: [review] });
    renderReview();

    expect(await screen.findByRole('heading', { name: DEMO.titleDone })).toBeTruthy();
    expect(screen.getByText(DEMO.myReviewTitle)).toBeTruthy();
    expect(screen.queryByRole('button', { name: DEMO.submit })).toBeNull();
  });

  it('완료 전 계약은 작성할 수 없다고 안내한다', async () => {
    mockLive({ contractStatus: 'ACTIVE' });
    renderReview();

    expect(await screen.findByText('완료된 계약만 리뷰를 작성할 수 있습니다.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: DEMO.submit })).toBeNull();
  });
});

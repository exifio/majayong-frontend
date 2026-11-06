/* 받은 리뷰 실제 API 연결 — FE-17 */
import { useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, DEV_SESSIONS, useSession } from '@/app/session';
import { LiveReceivedReviews } from '@/components/review/LiveReceivedReviews';

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
  rating: 4,
  comment: '요구사항이 분명했어요',
  tags: ['조건을 분명히 정해 줬어요'],
  reviewerRole: 'SUPPLIER',
  reviewerDisplayName: '최공급',
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

describe('LiveReceivedReviews — 받은 리뷰 API', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === '/api/v1/me/contracts') return jsonResponse({ data: [contract] });
      if (url === '/api/v1/me/chats') return jsonResponse({ data: [room] });
      if (url === '/api/v1/contracts/contract-1/reviews') return jsonResponse({ data: [review] });
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
  });

  it('완료 계약의 상대 리뷰를 이름·태그·프로젝트와 함께 보여 준다', async () => {
    render(
      <SessionProvider initial={DEV_SESSIONS.client}>
        <WithToken>
          <LiveReceivedReviews side="CLIENT" styles={{}} />
        </WithToken>
      </SessionProvider>,
    );

    expect(await screen.findByText('받은 리뷰 1건')).toBeTruthy();
    expect(screen.getByText('최공급')).toBeTruthy();
    expect(screen.getByText('요구사항이 분명했어요')).toBeTruthy();
    expect(screen.getByText(/예약 달력 외 1개 기능 · 합의 100,000원/)).toBeTruthy();
    expect(screen.getAllByText('조건을 분명히 정해 줬어요').length).toBeGreaterThan(0);
  });
});

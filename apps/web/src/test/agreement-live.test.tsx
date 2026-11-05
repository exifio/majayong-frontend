import { useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, DEV_SESSIONS, useSession } from '@/app/session';
import { LiveAgreement } from '@/components/agreement/LiveAgreement';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const application = {
  id: 'application-1',
  projectId: 'project-1',
  clientUserId: 'client-user-1',
  supplierId: 'supplier-user-1',
  revisionNo: 1,
  specVersionNo: 1,
  status: 'SUBMITTED',
  totalAmount: 3_255_000,
  durationDays: 21,
  firstViewedAt: '2026-11-05T04:07:29.689Z',
  submittedAt: '2026-11-05T04:39:40.618Z',
  message: null,
  questions: [],
  isMessageMasked: false,
  revisionReason: null,
  items: [{ specItemId: 'spec-item-1', isAvailable: true }],
};

const preview = {
  draft: {
    items: [
      {
        blockId: 'block-1',
        specItemId: 'spec-item-1',
        title: '예약 달력',
        stage: 'INTERIM',
        conditions: [
          { key: 'c1', text: '조회 기간을 정한다', state: 'DECIDED', evidenceMessageIds: [] },
          { key: 'c2', text: '휴무일 표시 방식을 정한다', state: 'UNDECIDED', evidenceMessageIds: [] },
          { key: 'c3', text: '마감 시간대 표시를 정한다', state: 'UNDECIDED', evidenceMessageIds: [] },
        ],
      },
    ],
    interimRatio: 50,
    ratioState: 'PROPOSED',
    cachedAt: '2026-11-05T04:00:00.000Z',
    lastMessageAt: null,
  },
  stale: false,
  readOnly: true,
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

function renderAgreement() {
  return render(
    <MemoryRouter initialEntries={['/c/chat/project-1/supplier-user-1/agreement?applicationId=application-1']}>
      <SessionProvider initial={DEV_SESSIONS.client}>
        <WithToken>
          <Routes>
            <Route path="/c/chat/:pid/:sid/agreement" element={<LiveAgreement styles={{}} />} />
          </Routes>
        </WithToken>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('LiveAgreement', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('shows the real amount, conditions and undecided count', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === '/api/v1/applications/application-1') return jsonResponse({ data: application });
      if (url === '/api/v1/applications/application-1/agreement-preview') return jsonResponse({ data: preview });
      if (url === '/api/v1/me/projects') return jsonResponse({ data: [{
        projectId: 'project-1', title: '예약 기능 개발', status: 'RECRUITING', displayState: '모집 중',
        deadline: null, selectionEndsAt: null, currentVersion: 1, applicationCount: 1, detailViewCount: 1,
      }] });
      if (url === '/api/v1/profiles/suppliers/supplier-user-1') {
        return jsonResponse({ data: { supplierId: 'supplier-user-1', displayName: '최준우', profileImageUrl: null } });
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderAgreement();

    expect(await screen.findByText(/예약 기능 개발/)).toBeTruthy();
    expect(screen.getByText('최준우')).toBeTruthy();
    expect(screen.getAllByText(/3,255,000원/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/21일/).length).toBeGreaterThan(0);
    expect(screen.getByText(/아직 정하지 않은 조건이 2개 있습니다/)).toBeTruthy();
    expect(screen.getByText(/휴무일 표시 방식을 정한다/)).toBeTruthy();
  });

  it('keeps confirm disabled until D-23 is applied', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === '/api/v1/applications/application-1') return jsonResponse({ data: application });
      if (url === '/api/v1/applications/application-1/agreement-preview') return jsonResponse({ data: preview });
      if (url === '/api/v1/me/projects') return jsonResponse({ data: [] });
      if (url.startsWith('/api/v1/profiles/suppliers/')) return jsonResponse({ data: null }, 404);
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderAgreement();

    const button = await screen.findByRole('button', { name: '합의 확정' });
    expect(button).toHaveProperty('disabled', true);
    expect(screen.getAllByText(/D-23/).length).toBeGreaterThan(0);
  });

  it('shows the authentication error state for a 401 response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      error: { code: 'INVALID_ACCESS_TOKEN', message: '인증 정보를 확인해 주세요.', requestId: 'r1' },
    }, 401));
    renderAgreement();
    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});

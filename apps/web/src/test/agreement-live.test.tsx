import { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
            <Route path="/c/contracts/:cid" element={<p>CONTRACT_PAGE</p>} />
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

  it('confirms once after explicit confirmation and moves to the contract', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/v1/applications/application-1') return jsonResponse({ data: application });
      if (url === '/api/v1/applications/application-1/agreement-preview') return jsonResponse({ data: preview });
      if (url === '/api/v1/me/projects') return jsonResponse({ data: [] });
      if (url.startsWith('/api/v1/profiles/suppliers/')) return jsonResponse({ data: null }, 404);
      if (url === '/api/v1/applications/application-1/agreement/confirm' && init?.method === 'POST') {
        return jsonResponse({ data: {
          contract: { id: 'contract-1', status: 'PENDING_CONSENT' },
          plan: {},
        } }, 201);
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderAgreement();

    fireEvent.click(await screen.findByRole('button', { name: '합의 확정' }));
    expect(await screen.findByText(/안 정한 조건이 있어도 합의를 확정할 수 있습니다/)).toBeTruthy();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '합의 확정' }));

    expect(await screen.findByText('CONTRACT_PAGE')).toBeTruthy();
    const posts = fetchMock.mock.calls.filter(([url, init]) =>
      String(url) === '/api/v1/applications/application-1/agreement/confirm' && init?.method === 'POST');
    expect(posts).toHaveLength(1);
    expect(JSON.parse(String(posts[0]![1]!.body))).toEqual({});
  });

  it('shows the conflict message and does not retry on 409', async () => {
    let previewCalls = 0;
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/v1/applications/application-1') return jsonResponse({ data: application });
      if (url === '/api/v1/applications/application-1/agreement-preview') {
        previewCalls += 1;
        return jsonResponse({ data: preview });
      }
      if (url === '/api/v1/me/projects') return jsonResponse({ data: [] });
      if (url.startsWith('/api/v1/profiles/suppliers/')) return jsonResponse({ data: null }, 404);
      if (url === '/api/v1/applications/application-1/agreement/confirm' && init?.method === 'POST') {
        return jsonResponse({ error: { code: 'APPLICATION_REVISION_SUPERSEDED', message: '이미 대체된 회차입니다.', requestId: 'r2' } }, 409);
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderAgreement();

    fireEvent.click(await screen.findByRole('button', { name: '합의 확정' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '합의 확정' }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('이미 대체된 회차입니다.'));
    expect(previewCalls).toBe(1);
    expect(screen.getByRole('button', { name: '합의 확정' }).getAttribute('disabled')).not.toBeNull();
  });

  it('shows the authentication error state for a 401 response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      error: { code: 'INVALID_ACCESS_TOKEN', message: '인증 정보를 확인해 주세요.', requestId: 'r1' },
    }, 401));
    renderAgreement();
    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});

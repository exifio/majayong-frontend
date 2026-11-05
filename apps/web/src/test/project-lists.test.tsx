import { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, DEV_SESSIONS, useSession } from '@/app/session';
import { LiveProjectList } from '@/components/project/LiveProjectList';
import { LiveApplications } from '@/components/project/LiveApplications';
import FindSupplier from '@/pages/supplier/Find-Supplier';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const project = {
  projectId: 'project-1',
  title: '예약 기능 개발',
  industryCode: 'RESTAURANT_RESERVATION',
  requiredSkills: ['React'],
  status: 'RECRUITING',
  deadline: '2026-11-12T04:07:29.669Z',
  itemCount: 6,
  hopeBudgetBand: '300~400만원',
};

const application = {
  applicationId: 'application-1',
  supplierId: 'supplier-user-1',
  revisionNo: 1,
  totalAmount: 3_255_000,
  durationDays: 21,
  questionCount: 1,
  revisionCount: 1,
  submittedAt: '2026-11-05T04:39:40.618Z',
  careerYears: 5,
  ratingAvg: 4.8,
  reviewCount: 12,
  completedContractCount: 3,
  portfolioSummary: '예약 시스템 포트폴리오',
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

function renderWithToken(ui: React.ReactNode, initial = DEV_SESSIONS.supplier) {
  return render(
    <MemoryRouter>
      <SessionProvider initial={initial}>
        <WithToken>{ui}</WithToken>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('LiveProjectList', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('shows only the fields the list API returns', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [project], meta: { page: 1, pageSize: 10, total: 1 } }));
    renderWithToken(<LiveProjectList styles={{}} />);

    expect(await screen.findByText('예약 기능 개발')).toBeTruthy();
    expect(screen.getByText('예약기반음식점')).toBeTruthy();
    expect(screen.getByText('300~400만원')).toBeTruthy();
    expect(screen.getByRole('link', { name: '상세 보기' }).getAttribute('href'))
      .toBe('/s/projects/project-1');
  });

  it('switches from the mock page to the live list without a hook-order error', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [project], meta: { page: 1, pageSize: 10, total: 1 } }));
    renderWithToken(<FindSupplier />);

    expect(await screen.findByRole('heading', { name: '프로젝트 찾기' })).toBeTruthy();
    expect(await screen.findByText('예약 기능 개발')).toBeTruthy();
  });

  it('shows the empty state when no project matches', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [], meta: { page: 1, pageSize: 10, total: 0 } }));
    renderWithToken(<LiveProjectList styles={{}} />);
    expect(await screen.findByText('조건에 맞는 프로젝트가 없습니다.')).toBeTruthy();
  });
});

describe('LiveApplications', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('shows the application fields and the public supplier name', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === '/api/v1/projects/project-1/applications') return jsonResponse({ data: [application] });
      if (url === '/api/v1/profiles/suppliers/supplier-user-1') {
        return jsonResponse({ data: { supplierId: 'supplier-user-1', displayName: '최준우', profileImageUrl: null } });
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    const { container } = renderWithToken(<LiveApplications pid="project-1" styles={{}} />, DEV_SESSIONS.client);

    expect(await screen.findByText('최준우')).toBeTruthy();
    expect(screen.getByText(/3,255,000원/)).toBeTruthy();
    expect(screen.getByText(/21일/)).toBeTruthy();
    expect(screen.getByText(/경력 5년/)).toBeTruthy();
    expect(container.querySelector('[data-application-id="application-1"]')).toBeTruthy();
  });

  it('opens the application detail and starts chat through openChat', async () => {
    const revision = {
      ...application,
      status: 'SUBMITTED',
      specVersionNo: 1,
      firstViewedAt: '2026-11-05T04:07:29.689Z',
      message: '채팅 통합 테스트 지원입니다.',
      questions: [{ text: '일정 조율은 언제 가능한가요?' }],
      isMessageMasked: false,
      revisionReason: null,
      items: [
        { specItemId: 'spec-item-1', isAvailable: true },
        { specItemId: 'spec-item-2', isAvailable: false },
      ],
    };
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/v1/projects/project-1/applications') return jsonResponse({ data: [application] });
      if (url === '/api/v1/profiles/suppliers/supplier-user-1') {
        return jsonResponse({ data: { supplierId: 'supplier-user-1', displayName: '최준우', profileImageUrl: null } });
      }
      if (url === '/api/v1/applications/application-1' && init?.method !== 'POST') {
        return jsonResponse({ data: revision });
      }
      if (url === '/api/v1/applications/application-1/agreement-preview') {
        return jsonResponse({ data: { draft: {
          items: [{ specItemId: 'spec-item-1', title: '예약 달력', conditions: [] }],
          interimRatio: 50,
          ratioState: 'PROPOSED',
          cachedAt: '2026-11-05T04:00:00.000Z',
          lastMessageAt: null,
        }, stale: false, readOnly: true } });
      }
      if (url === '/api/v1/applications/application-1/chat/open' && init?.method === 'POST') {
        return jsonResponse({ data: { opened: true } });
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderWithToken(<LiveApplications pid="project-1" styles={{}} />, DEV_SESSIONS.client);

    fireEvent.click(await screen.findByRole('button', { name: '지원서 보기' }));
    expect(await screen.findByText('채팅 통합 테스트 지원입니다.')).toBeTruthy();
    expect(screen.getByText('검토 중')).toBeTruthy();
    expect(screen.getByText('예약 달력')).toBeTruthy();
    expect(screen.getByText('일정 조율은 언제 가능한가요?')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '문의 채팅' }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([url, init]) =>
      String(url) === '/api/v1/applications/application-1/chat/open' && init?.method === 'POST')).toBe(true));
  });

  it('keeps the list when the profile request fails', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === '/api/v1/projects/project-1/applications') {
        return jsonResponse({ data: [{ ...application, supplierId: 'supplier-fail-1' }] });
      }
      return jsonResponse({ error: { code: 'SUPPLIER_PROFILE_NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderWithToken(<LiveApplications pid="project-1" styles={{}} />, DEV_SESSIONS.client);

    expect(await screen.findByText('공급자 supplier')).toBeTruthy();
    expect(screen.getByText(/3,255,000원/)).toBeTruthy();
  });

  it('requests the same supplier profile once for duplicate applicants', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === '/api/v1/projects/project-1/applications') {
        return jsonResponse({ data: [
          { ...application, supplierId: 'supplier-dup-1' },
          { ...application, applicationId: 'application-2', supplierId: 'supplier-dup-1' },
        ] });
      }
      if (url === '/api/v1/profiles/suppliers/supplier-dup-1') {
        return jsonResponse({ data: { supplierId: 'supplier-dup-1', displayName: '중복 공급자', profileImageUrl: null } });
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderWithToken(<LiveApplications pid="project-1" styles={{}} />, DEV_SESSIONS.client);

    await screen.findByText('지원자 2건');
    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) =>
      String(url) === '/api/v1/profiles/suppliers/supplier-dup-1')).toHaveLength(1));
  });

  it('shows the empty state when there is no applicant', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));
    renderWithToken(<LiveApplications pid="project-1" styles={{}} />, DEV_SESSIONS.client);
    expect(await screen.findByText('아직 지원자가 없습니다.')).toBeTruthy();
  });
});

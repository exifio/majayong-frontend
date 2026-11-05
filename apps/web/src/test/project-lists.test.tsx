import { useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText('RESTAURANT_RESERVATION')).toBeTruthy();
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

  it('shows the application fields from listProjectApplications', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [application] }));
    const { container } = renderWithToken(<LiveApplications pid="project-1" styles={{}} />, DEV_SESSIONS.client);

    expect(await screen.findByText('공급자 supplier')).toBeTruthy();
    expect(screen.getByText(/3,255,000원/)).toBeTruthy();
    expect(screen.getByText(/21일/)).toBeTruthy();
    expect(screen.getByText(/경력 5년/)).toBeTruthy();
    expect(container.querySelector('[data-application-id="application-1"]')).toBeTruthy();
  });

  it('shows the empty state when there is no applicant', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));
    renderWithToken(<LiveApplications pid="project-1" styles={{}} />, DEV_SESSIONS.client);
    expect(await screen.findByText('아직 지원자가 없습니다.')).toBeTruthy();
  });
});

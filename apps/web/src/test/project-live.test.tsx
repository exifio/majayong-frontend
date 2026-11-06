import { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, DEV_SESSIONS, useSession } from '@/app/session';
import { LiveProjectDetail } from '@/components/project/LiveProjectDetail';
import { LiveQuoteWrite } from '@/components/project/LiveQuoteWrite';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const detail = {
  projectId: 'project-1',
  title: '예약 기능 개발',
  industryCode: 'RESTAURANT_RESERVATION',
  requiredSkills: ['React'],
  status: 'RECRUITING',
  deadline: '2026-11-12T04:07:29.669Z',
  itemCount: 2,
  hopeBudgetBand: '300~400만원',
  summary: '요약',
  hopeBudget: 3_000_000,
  items: [
    { specItemId: 'spec-item-1', title: '예약 달력', description: '달력 설명', conditions: [{ key: 'c1', text: '기간을 정한다' }], wireframe: null },
    { specItemId: 'spec-item-2', title: '예약금 결제', description: '결제 설명', conditions: null, wireframe: null },
  ],
  client: {
    name: '의뢰인',
    businessName: '가게',
    industryField: '음식점',
    storeAddress: '서울',
    bio: null,
    websiteUrl: null,
    ratingAvg: 4.5,
    reviewCount: 2,
  },
};

const application = {
  id: 'application-1',
  projectId: 'project-1',
  clientUserId: 'client-user-1',
  supplierId: 'supplier-user-1',
  revisionNo: 0,
  specVersionNo: 1,
  status: 'SUBMITTED',
  totalAmount: 3_000_000,
  durationDays: 14,
  firstViewedAt: '2026-11-05T04:00:00.000Z',
  submittedAt: '2026-11-05T04:10:00.000Z',
  message: null,
  questions: [],
  isMessageMasked: false,
  revisionReason: null,
  items: [{ specItemId: 'spec-item-1', isAvailable: true }],
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

function renderLive(ui: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/s/projects/project-1']}>
      <SessionProvider initial={DEV_SESSIONS.supplier}>
        <WithToken>{ui}</WithToken>
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('LiveProjectDetail', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('renders the real detail with specItemIds and the quote link', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: detail }));
    const { container } = renderLive(<LiveProjectDetail pid="project-1" styles={{}} />);

    expect(await screen.findByText('예약 기능 개발')).toBeTruthy();
    expect(screen.getByText('예약 달력')).toBeTruthy();
    expect(container.querySelector('[data-spec-item-id="spec-item-1"]')).toBeTruthy();
    expect(screen.getByRole('link', { name: '견적 작성하기' }).getAttribute('href'))
      .toBe('/s/projects/project-1/quote');
  });

  it('상호 미등록 프로젝트도 공급자가 열람할 수 있다', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: {
      ...detail,
      client: {
        name: null,
        businessName: null,
        industryField: null,
        storeAddress: null,
        bio: null,
        websiteUrl: null,
        ratingAvg: null,
        reviewCount: 0,
      },
    } }));

    renderLive(<LiveProjectDetail pid="project-1" styles={{}} />);

    expect(await screen.findByText('예약 기능 개발')).toBeTruthy();
    expect(within(screen.getByLabelText('의뢰인 정보')).getByText('상호 미등록')).toBeTruthy();
    expect(screen.getByRole('link', { name: '견적 작성하기' })).toBeTruthy();
  });

  it('shows the submitted application instead of the quote CTA', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === '/api/v1/projects/project-1') return jsonResponse({ data: detail });
      if (url === '/api/v1/me/applications') return jsonResponse({ data: [application] });
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderLive(<LiveProjectDetail pid="project-1" styles={{}} />);

    expect(await screen.findByText('지원함')).toBeTruthy();
    expect(screen.queryByRole('link', { name: '견적 작성하기' })).toBeNull();
  });

  it('asks for NDA consent on 403 and reloads after consent', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: { code: 'SUPPLIER_NDA_REQUIRED', message: 'NDA 필요', requestId: 'r1' } }, 403))
      .mockResolvedValueOnce(jsonResponse({ data: { displayName: '공급자 테스트' } }))
      .mockResolvedValueOnce(jsonResponse({ data: detail }));
    renderLive(<LiveProjectDetail pid="project-1" styles={{}} />);

    fireEvent.click(await screen.findByRole('button', { name: 'NDA 동의하고 상세 열람' }));
    expect(await screen.findByText('예약 기능 개발')).toBeTruthy();

    const patch = fetchMock.mock.calls.find(([url, init]) =>
      String(url) === '/api/v1/me/supplier-profile' && init?.method === 'PATCH');
    expect(patch).toBeTruthy();
    expect(JSON.parse(String(patch![1]!.body))).toEqual({ ndaConsent: true });
  });
});

describe('LiveQuoteWrite', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('submits the specItemIds returned by the project detail', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/v1/projects/project-1' && init?.method !== 'POST') return jsonResponse({ data: detail });
      if (url === '/api/v1/projects/project-1/applications' && init?.method === 'POST') {
        return jsonResponse({ data: application }, 201);
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderLive(<LiveQuoteWrite pid="project-1" styles={{}} />);

    expect(await screen.findByText('예약 달력')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('총액'), { target: { value: '3000000' } });
    fireEvent.change(screen.getByLabelText('기간'), { target: { value: '14' } });
    fireEvent.click(screen.getByRole('button', { name: '지원 제출' }));

    expect(await screen.findByText('지원이 접수되었습니다')).toBeTruthy();
    const post = fetchMock.mock.calls.find(([url, init]) =>
      String(url) === '/api/v1/projects/project-1/applications' && init?.method === 'POST');
    expect(JSON.parse(String(post![1]!.body))).toEqual({
      totalAmount: 3_000_000,
      durationDays: 14,
      items: [
        { specItemId: 'spec-item-1', isAvailable: true },
        { specItemId: 'spec-item-2', isAvailable: true },
      ],
    });
  });

  it('shows the server message when the application already exists', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/v1/projects/project-1' && init?.method !== 'POST') return jsonResponse({ data: detail });
      if (url === '/api/v1/projects/project-1/applications' && init?.method === 'POST') {
        return jsonResponse({ error: { code: 'APPLICATION_ALREADY_SUBMITTED', message: '이미 진행 중인 지원이 있습니다.', requestId: 'r2' } }, 409);
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
    });
    renderLive(<LiveQuoteWrite pid="project-1" styles={{}} />);

    await screen.findByText('예약 달력');
    fireEvent.change(screen.getByLabelText('총액'), { target: { value: '1000000' } });
    fireEvent.change(screen.getByLabelText('기간'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: '지원 제출' }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('이미 진행 중인 지원이 있습니다.'));
  });
});

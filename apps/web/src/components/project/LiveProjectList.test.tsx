/* 프로젝트 찾기 — 업종 · 예산 필터와 북마크 */
import { useEffect, useState, type ReactNode } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEV_SESSIONS, SessionProvider, useSession } from '@/app/session';
import { LiveProjectList } from './LiveProjectList';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const listItem = {
  projectId: 'project-1',
  title: '예약 기능 개발',
  industryCode: 'FOOD',
  requiredSkills: ['React'],
  status: 'RECRUITING',
  deadline: '2026-12-01T14:59:59.000Z',
  itemCount: 4,
  hopeBudgetBand: '300~400만원',
};

const bookmarkRow = {
  project: {
    id: 'project-2',
    title: '카페 주문 페이지',
    summary: '주문',
    industryCode: 'CAFE',
    requiredSkills: ['Vue'],
    hopeBudgetRange: { minKrw: 2_000_000, maxKrw: 3_000_000 },
    deadline: null,
    status: 'EXPIRED',
    publishedAt: null,
    currentSpecVersion: 1,
    specItemCount: 2,
    specItemTitles: [],
  },
  createdAt: '2026-11-07T00:00:00.000Z',
  applicationOpen: false,
};

function WithToken({ children }: { children: ReactNode }) {
  const { setApiAccessToken } = useSession();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setApiAccessToken('test-token');
    setReady(true);
  }, [setApiAccessToken]);
  return ready ? children : null;
}

function renderList(path = '/s/projects') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider initial={DEV_SESSIONS.supplier}>
        <WithToken><LiveProjectList styles={{}} /></WithToken>
      </SessionProvider>
    </MemoryRouter>,
  );
}

function mockApi(options: { bookmarks?: unknown[]; saveStatus?: number } = {}) {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
    const url = String(input);
    if (url.startsWith('/api/v1/projects?')) return jsonResponse({ data: [listItem], meta: { page: 1, pageSize: 10, total: 1 } });
    if (url === '/api/v1/me/bookmarks') return jsonResponse({ data: options.bookmarks ?? [] });
    if (url.endsWith('/bookmark') && init?.method === 'PUT') {
      return options.saveStatus && options.saveStatus >= 400
        ? jsonResponse({ error: { code: 'CONFLICT', message: '북마크할 수 없는 프로젝트입니다.', requestId: 'r' } }, options.saveStatus)
        : jsonResponse({ data: { supplierId: 's', projectId: 'project-1', createdAt: '2026-11-08T00:00:00.000Z' } }, 201);
    }
    if (url.endsWith('/bookmark') && init?.method === 'DELETE') return jsonResponse({ data: { removed: true } });
    return jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found', requestId: 'r' } }, 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LiveProjectList — 업종 · 예산 필터', () => {
  it('업종 라벨을 계약 파일로 보여 주고, 업종과 예산 구간을 query로 보낸다', async () => {
    const fetchMock = mockApi();
    renderList();
    const card = await screen.findByRole('article', { name: '예약 기능 개발' });
    expect(within(card).getByText('음식점')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('업종'), { target: { value: 'CAFE' } });
    fireEvent.change(screen.getByLabelText('예산 범위'), { target: { value: 'B200_400' } });

    await waitFor(() => {
      const urls = fetchMock.mock.calls.map(([url]) => String(url));
      expect(urls.some((url) => url.includes('industryCode=CAFE')
        && url.includes('minBudget=2000000') && url.includes('maxBudget=4000000'))).toBe(true);
    });
  });

  it('200만원 미만은 상한만, 400만원 이상은 하한만 보낸다', async () => {
    const fetchMock = mockApi();
    renderList();
    await screen.findByRole('article', { name: '예약 기능 개발' });

    fireEvent.change(screen.getByLabelText('예산 범위'), { target: { value: 'LT200' } });
    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('maxBudget=2000000') && !String(url).includes('minBudget'))).toBe(true);
    });
    fireEvent.change(screen.getByLabelText('예산 범위'), { target: { value: 'GTE400' } });
    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('minBudget=4000000') && !String(url).includes('maxBudget'))).toBe(true);
    });
  });
});

describe('LiveProjectList — 북마크', () => {
  it('북마크 버튼으로 PUT/DELETE를 보내고 눌림 상태가 바뀐다', async () => {
    const fetchMock = mockApi();
    renderList();
    const button = await screen.findByRole('button', { name: '예약 기능 개발 북마크' });
    await waitFor(() => expect(button).toHaveProperty('disabled', false));
    expect(button.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(button);
    await waitFor(() => expect(button.getAttribute('aria-pressed')).toBe('true'));
    expect(fetchMock.mock.calls.some(([url, init]) => String(url) === '/api/v1/projects/project-1/bookmark' && init?.method === 'PUT')).toBe(true);

    await waitFor(() => expect(button).toHaveProperty('disabled', false));
    fireEvent.click(button);
    await waitFor(() => expect(button.getAttribute('aria-pressed')).toBe('false'));
    expect(fetchMock.mock.calls.some(([url, init]) => String(url) === '/api/v1/projects/project-1/bookmark' && init?.method === 'DELETE')).toBe(true);
  });

  it('북마크 저장에 실패하면 원래 상태로 되돌리고 이유를 보여 준다', async () => {
    mockApi({ saveStatus: 409 });
    renderList();
    const button = await screen.findByRole('button', { name: '예약 기능 개발 북마크' });
    await waitFor(() => expect(button).toHaveProperty('disabled', false));

    fireEvent.click(button);
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', '북마크할 수 없는 프로젝트입니다.');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('?view=bookmarks면 내 북마크만 보여 주고, 해제하면 목록에서 뺀다', async () => {
    const fetchMock = mockApi({ bookmarks: [bookmarkRow] });
    renderList('/s/projects?view=bookmarks');

    expect(await screen.findByRole('heading', { level: 1, name: '북마크' })).toBeTruthy();
    const card = screen.getByRole('article', { name: '카페 주문 페이지' });
    expect(within(card).getByText('카페')).toBeTruthy();
    expect(within(card).getByText('200~300만원')).toBeTruthy();
    expect(screen.queryByLabelText('업종')).toBeNull();
    expect(fetchMock.mock.calls.some(([url]) => String(url).startsWith('/api/v1/projects?'))).toBe(false);

    fireEvent.click(within(card).getByRole('button', { name: '카페 주문 페이지 북마크' }));
    expect(await screen.findByText(/북마크한 프로젝트가 없습니다/)).toBeTruthy();
  });
});

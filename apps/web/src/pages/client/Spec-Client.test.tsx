/* 명세 보기 — 실제 마감 연장(POST /projects/:projectId/extend-deadline) */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { MyProjectDto } from '@majayong/types/api';
import { renderAt } from '@/test/render';
import { extendedDeadlineOf } from './Spec-Client.data';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const DEADLINE = '2026-11-20T14:59:59.999Z';

function project(status: MyProjectDto['status']): MyProjectDto {
  return {
    projectId: 'p-9',
    title: '근무표 관리',
    status,
    displayState: status,
    deadline: DEADLINE,
    selectionEndsAt: null,
    currentVersion: 1,
    applicationCount: 2,
    detailViewCount: 4,
  };
}

function stubApi(status: MyProjectDto['status'], extend?: (body: unknown) => Response) {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
    const url = String(input);
    if (url === '/api/v1/me/projects') return jsonResponse({ data: [project(status)] });
    if (url === '/api/v1/projects/p-9/extend-deadline' && init?.method === 'POST' && extend) {
      return extend(JSON.parse(String(init.body)));
    }
    return jsonResponse({ error: { code: 'NOT_FOUND', message: '요청을 확인해 주세요.', requestId: 'r' } }, 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('마감 연장 날짜 계산', () => {
  it('지금 마감과 같은 시각으로 1~14일 뒤만 허용한다', () => {
    const base = new Date(DEADLINE);
    const day = (n: number) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    expect(extendedDeadlineOf(DEADLINE, day(7))?.getTime()).toBe(base.getTime() + 7 * 86_400_000);
    expect(extendedDeadlineOf(DEADLINE, day(14))?.getTime()).toBe(base.getTime() + 14 * 86_400_000);
    expect(extendedDeadlineOf(DEADLINE, day(15))).toBeNull();
    expect(extendedDeadlineOf(DEADLINE, day(0))).toBeNull();
    expect(extendedDeadlineOf(DEADLINE, '잘못된 날짜')).toBeNull();
  });
});

describe('명세 보기 — 실제 마감 연장', { timeout: 20_000 }, () => {
  it('모집 중이면 마감 연장을 보내고 새 마감을 알린다', async () => {
    let sent: unknown = null;
    const fetchMock = stubApi('RECRUITING', (body) => {
      sent = body;
      const deadline = (body as { deadline: string }).deadline;
      return jsonResponse({ data: { projectId: 'p-9', deadline, status: 'RECRUITING' } });
    });
    renderAt('/c/projects/p-9', 'client', undefined, 'test-token');

    fireEvent.click(await screen.findByRole('button', { name: '마감 연장' }));
    const dialog = screen.getByRole('dialog', { name: '마감 연장' });
    fireEvent.click(within(dialog).getByRole('button', { name: '마감 연장' }));

    expect(await screen.findByText('모집 마감을 연장했습니다')).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: '마감 연장' })).toBeNull();
    expect(new Date((sent as unknown as { deadline: string }).deadline).getTime()).toBe(new Date(DEADLINE).getTime() + 7 * 86_400_000);
    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/extend-deadline'))).toBe(true);
  });

  it('범위를 벗어난 날짜는 보내지 않는다', async () => {
    const fetchMock = stubApi('SELECTING', () => jsonResponse({ data: {} }));
    renderAt('/c/projects/p-9', 'client', undefined, 'test-token');

    fireEvent.click(await screen.findByRole('button', { name: '마감 연장' }));
    const dialog = screen.getByRole('dialog', { name: '마감 연장' });
    fireEvent.change(within(dialog).getByLabelText('새 마감일'), { target: { value: '2027-01-30' } });
    expect(within(dialog).getByRole('alert').textContent).toMatch(/최대 14일/);
    expect((within(dialog).getByRole('button', { name: '마감 연장' }) as HTMLButtonElement).disabled).toBe(true);
    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/extend-deadline'))).toBe(false);
  });

  it('서버가 거절하면 이유를 보이고 모달을 유지한다', async () => {
    stubApi('RECRUITING', () => jsonResponse({ error: { code: 'INVALID_DEADLINE_EXTENSION', message: '요청을 확인해 주세요.', requestId: 'r' } }, 422));
    renderAt('/c/projects/p-9', 'client', undefined, 'test-token');

    fireEvent.click(await screen.findByRole('button', { name: '마감 연장' }));
    const dialog = screen.getByRole('dialog', { name: '마감 연장' });
    fireEvent.click(within(dialog).getByRole('button', { name: '마감 연장' }));
    await waitFor(() => expect(within(dialog).getByText(/날짜를 다시 골라 주세요/)).toBeTruthy());
    expect(screen.getByRole('dialog', { name: '마감 연장' })).toBeTruthy();
  });

  it('계약 단계에서는 마감 연장을 보이지 않는다', async () => {
    stubApi('CONTRACTED');
    renderAt('/c/projects/p-9', 'client', undefined, 'test-token');
    expect(await screen.findByRole('heading', { level: 1, name: '근무표 관리' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '마감 연장' })).toBeNull();
  });
});

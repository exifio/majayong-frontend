/* 이벤트 기록 Admin-Events — 실제 /admin/event-logs */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { AdminEventLogDto } from '@majayong/types/api';
import { findDesignViolations } from '@/app/devChecks';
import { location, renderAt } from '@/test/render';
import { DEMO } from './Admin-Events.data';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const log = (over: Partial<AdminEventLogDto> = {}): AdminEventLogDto => ({
  id: 'log-1',
  actorUserId: 'admin-1',
  actionType: 'BLOCK_UPDATE_PRICE',
  targetType: 'BLOCK',
  targetId: 'block-1',
  reason: '시장 단가 반영',
  occurredAt: '2026-11-02T01:05:00.000Z',
  ...over,
});

const eventCalls = (fetchMock: ReturnType<typeof vi.fn<typeof fetch>>) =>
  fetchMock.mock.calls.map(([path]) => String(path)).filter((path) => path.includes('/admin/event-logs'));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Admin-Events — 실제 이벤트 기록', () => {
  it('서버 기록을 한국어 종류 이름과 사유로 보여 준다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () =>
      jsonResponse({ data: [log(), log({ id: 'log-2', actorUserId: '', actionType: 'DRAFT_RENDERED', targetType: '', targetId: '', reason: '' })] }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/events', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Events"]') as HTMLElement;

    expect(await within(root).findByText('시장 단가 반영')).toBeTruthy();
    expect(within(root).getAllByText('단가 수정').length).toBeGreaterThan(0);
    expect(within(root).getByText('블록 block-1')).toBeTruthy();
    expect(within(root).getByText('시스템')).toBeTruthy();
    expect(within(root).getByText('DRAFT_RENDERED')).toBeTruthy();
    expect(within(root).queryByText(/주차 안내/)).toBeNull();
    expect(root.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(findDesignViolations(container)).toEqual([]);
    expect(eventCalls(fetchMock)[0]).toMatch(/from=/);
  });

  it('필터를 바꾸면 지원되는 쿼리로 다시 조회한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [log()] }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/events', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Events"]') as HTMLElement;
    await within(root).findByText('시장 단가 반영');

    fireEvent.change(within(root).getByLabelText(DEMO.kindLabel), { target: { value: 'OPERATOR_CONFIRMED' } });
    await waitFor(() => expect(eventCalls(fetchMock).some((path) => path.includes('actionType=OPERATOR_CONFIRMED'))).toBe(true));

    fireEvent.change(within(root).getByLabelText('대상 종류'), { target: { value: 'DEPOSIT' } });
    await waitFor(() => expect(eventCalls(fetchMock).some((path) => path.includes('targetType=DEPOSIT'))).toBe(true));

    fireEvent.change(within(root).getByLabelText(DEMO.periodLabel), { target: { value: '전체' } });
    await waitFor(() => {
      const last = eventCalls(fetchMock).at(-1)!;
      expect(last).not.toMatch(/from=/);
      expect(last).toContain('actionType=OPERATOR_CONFIRMED');
    });
  });

  it('행을 누르면 상세를 ?id=로 열고 수정·삭제 버튼은 없다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [log()] })));
    const { container } = renderAt('/admin/events', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Events"]') as HTMLElement;

    const row = (await within(root).findByText('시장 단가 반영')).closest('tr')!;
    fireEvent.click(row);

    const detail = await within(root).findByRole('complementary', { name: DEMO.detailLabel });
    expect(within(detail).getByText('log-1')).toBeTruthy();
    expect(within(detail).getByRole('link', { name: '블록 검토에서 보기' })).toBeTruthy();
    expect(within(detail).queryByRole('button', { name: '수정' })).toBeNull();
    expect(within(detail).queryByRole('button', { name: '삭제' })).toBeNull();
    expect(location.current).toContain('id=log-1');
  });

  it('조회에 실패하면 오류를 알린다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({}, 500)));
    renderAt('/admin/events', 'admin', undefined, 'test-token');
    expect(await screen.findByText('이벤트 기록을 불러오지 못했습니다. 다시 시도해 주세요.')).toBeTruthy();
  });

  it('기록이 없으면 빈 상태를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [] })));
    renderAt('/admin/events', 'admin', undefined, 'test-token');
    expect(await screen.findByText('조건에 맞는 기록이 없습니다')).toBeTruthy();
  });
});

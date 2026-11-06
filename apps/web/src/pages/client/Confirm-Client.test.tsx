import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { DraftDto } from '@majayong/types/api';
import { location, renderAt } from '@/test/render';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function draft(pendingFeatures: DraftDto['pendingFeatures']): DraftDto {
  return {
    id: 'd-1',
    entryType: 'DEFAULT_DRAFT',
    status: 'IN_PROGRESS',
    hopeBudget: null,
    chatEditCount: 0,
    pendingFeatures,
    firstInputAt: '2026-11-07T00:00:00.000Z',
    renderedAt: null,
    lastActiveAt: '2026-11-07T00:00:00.000Z',
    createdAt: '2026-11-07T00:00:00.000Z',
    utterances: [],
    blocks: [{
      id: 'draft-block-1',
      blockId: 'block-1',
      origin: 'DEFAULT_DRAFT',
      status: 'ADDED',
      unitPrice: 0,
      pricedAt: '2026-11-07T00:00:00.000Z',
      conditionNotes: null,
      sortOrder: 0,
      block: {
        id: 'block-1',
        code: 'RR-001',
        name: '예약 관리',
        functionSummary: '예약을 관리한다.',
        description: '예약 정보를 확인한다.',
        conditions: [],
        wireframe: null,
        unitPrice: 0,
      },
    }],
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('Confirm-Client 명세 확정', () => {
  it('반영 대기 기능이 있으면 확정 요청을 보내지 않는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      if (String(input) === '/api/v1/drafts/d-1') {
        return jsonResponse({
          data: draft([{ key: 'pending-1', summary: '예약 알림', attempts: 1, lastTriedAt: null }]),
        });
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: '요청을 확인해 주세요.', requestId: 'req-1' } }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderAt('/c/drafts/d-1/confirm', 'client', undefined, 'test-token');

    expect(await screen.findByText(/아직 반영하지 못한 기능 1건/)).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox'));
    const submit = screen.getByRole('button', { name: '확정하고 공급자 모집 시작' });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    expect(fetchMock.mock.calls.some(([url, init]) => String(url).endsWith('/publish') && init?.method === 'POST')).toBe(false);
  });

  it('상호가 없어도 게시 성공 응답 뒤 프로젝트 화면으로 이동한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (String(input) === '/api/v1/drafts/d-1' && init?.method !== 'POST') {
        return jsonResponse({ data: draft([]) });
      }
      if (String(input) === '/api/v1/drafts/d-1/publish') {
        return jsonResponse({ data: { projectId: 'project-1' } }, 201);
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: '요청을 확인해 주세요.', requestId: 'req-publish' } }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderAt('/c/drafts/d-1/confirm', 'client', undefined, 'test-token');

    fireEvent.change(await screen.findByLabelText('모집 시작'), { target: { value: '2099-01-01' } });
    fireEvent.change(screen.getByLabelText('모집 마감'), { target: { value: '2099-01-14' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: '확정하고 공급자 모집 시작' }));

    await waitFor(() => expect(location.current).toBe('/c/projects/project-1'));
    expect(fetchMock.mock.calls.some(([url, init]) => String(url) === '/api/v1/drafts/d-1/publish' && init?.method === 'POST')).toBe(true);
  });

  it('구버전 서버의 상호 오류는 고객센터 안내 대신 코드를 보여준다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (String(input) === '/api/v1/drafts/d-1' && init?.method !== 'POST') {
        return jsonResponse({ data: draft([]) });
      }
      if (String(input) === '/api/v1/drafts/d-1/publish') {
        return jsonResponse({
          error: { code: 'CLIENT_PROFILE_INCOMPLETE', message: '요청을 확인해 주세요.', requestId: 'req-2' },
        }, 422);
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: '요청을 확인해 주세요.', requestId: 'req-3' } }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderAt('/c/drafts/d-1/confirm', 'client', undefined, 'test-token');

    fireEvent.change(await screen.findByLabelText('모집 시작'), { target: { value: '2099-01-01' } });
    fireEvent.change(screen.getByLabelText('모집 마감'), { target: { value: '2099-01-14' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: '확정하고 공급자 모집 시작' }));

    expect((await screen.findByRole('alert')).textContent).toMatch(/CLIENT_PROFILE_INCOMPLETE/);
  });

  it('처리되지 않은 게시 오류는 오류 코드를 안내한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (String(input) === '/api/v1/drafts/d-1' && init?.method !== 'POST') {
        return jsonResponse({ data: draft([]) });
      }
      if (String(input) === '/api/v1/drafts/d-1/publish') {
        return jsonResponse({
          error: { code: 'UNMAPPED_PUBLISH_ERROR', message: '요청을 확인해 주세요.', requestId: 'req-4' },
        }, 409);
      }
      return jsonResponse({ error: { code: 'NOT_FOUND', message: '요청을 확인해 주세요.', requestId: 'req-5' } }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderAt('/c/drafts/d-1/confirm', 'client', undefined, 'test-token');

    fireEvent.change(await screen.findByLabelText('모집 시작'), { target: { value: '2099-01-01' } });
    fireEvent.change(screen.getByLabelText('모집 마감'), { target: { value: '2099-01-14' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: '확정하고 공급자 모집 시작' }));

    expect((await screen.findByRole('alert')).textContent).toMatch(/UNMAPPED_PUBLISH_ERROR/);
  });
});

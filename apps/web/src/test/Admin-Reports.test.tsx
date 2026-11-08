/* 신고 처리 Admin-Reports — 실제 /admin/reports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { AdminReportDto } from '@majayong/types/api';
import { findDesignViolations } from '@/app/devChecks';
import { location, renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const report = (over: Partial<AdminReportDto> = {}): AdminReportDto => ({
  id: 'report-1',
  messageId: 'msg-1',
  reporterId: 'client-1',
  targetUserId: 'supplier-1',
  reason: 'CONTACT_OR_OFFSITE',
  detail: '계약 전에는 여기서만 이야기한다고 알고 있습니다.',
  status: 'OPEN',
  action: null,
  actionNote: null,
  resolvedById: null,
  resolvedAt: null,
  createdAt: '2026-11-02T06:40:00.000Z',
  reporter: { id: 'client-1', role: 'CLIENT', displayName: '오후 세시' },
  target: { id: 'supplier-1', role: 'SUPPLIER', displayName: '강태오' },
  message: {
    body: '카톡으로 따로 얘기해요',
    createdAt: '2026-11-02T06:31:00.000Z',
    projectId: 'project-1',
    projectTitle: '음료 사전 주문',
  },
  ...over,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Admin-Reports — 신고 처리', () => {
  it('실제 목록과 선택한 신고의 문맥을 보여 준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [report()] })),
    );
    const { container } = renderAt('/admin/reports', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Reports"]') as HTMLElement;

    expect(await within(root).findByRole('heading', { level: 2, name: /오후 세시/ })).toBeTruthy();
    expect(within(root).getAllByText('연락처 · 외부 거래 유도').length).toBeGreaterThan(0);
    expect(within(root).getByText('카톡으로 따로 얘기해요')).toBeTruthy();
    expect(within(root).getByText('음료 사전 주문')).toBeTruthy();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('조치와 사유를 저장하면 처리 완료로 바뀐다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (String(input).endsWith('/resolve') && init?.method === 'POST') {
        return jsonResponse({
          data: {
            report: report({
              status: 'RESOLVED',
              action: 'WARNING',
              actionNote: '첫 위반이라 경고합니다.',
              resolvedAt: '2026-11-03T01:12:00.000Z',
            }),
            warningReviewRecommended: false,
          },
        });
      }
      return jsonResponse({ data: [report()] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/reports', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Reports"]') as HTMLElement;

    fireEvent.click(await within(root).findByRole('radio', { name: /경고/ }));
    fireEvent.change(within(root).getByLabelText(/조치 사유/), {
      target: { value: '첫 위반이라 경고합니다.' },
    });
    fireEvent.click(within(root).getByRole('button', { name: '조치 확정' }));

    expect((await within(root).findAllByText(/처리 완료/)).length).toBeGreaterThan(0);
    expect(within(root).getByText(/첫 위반이라 경고합니다/)).toBeTruthy();
    const call = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/resolve'));
    expect(call).toBeTruthy();
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      action: 'WARNING',
      actionNote: '첫 위반이라 경고합니다.',
    });
  });

  it('사유가 비어 있으면 전송하지 않고 안내한다', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => jsonResponse({ data: [report()] }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/reports', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Reports"]') as HTMLElement;

    fireEvent.click(await within(root).findByRole('radio', { name: /경고/ }));
    fireEvent.click(within(root).getByRole('button', { name: '조치 확정' }));

    expect(await within(root).findByText('사유를 적어 주세요')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([path]) => String(path).endsWith('/resolve'))).toBe(false);
  });

  it('계정 정지는 확인 대화상자를 거친다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [report()] })),
    );
    renderAt('/admin/reports', 'admin', undefined, 'test-token');

    fireEvent.click(await screen.findByRole('radio', { name: /계정 정지/ }));
    fireEvent.change(screen.getByLabelText(/조치 사유/), { target: { value: '외부 거래 유도' } });
    fireEvent.click(screen.getByRole('button', { name: '계정 정지 확정' }));

    const dialog = screen.getByRole('dialog', { name: '계정을 정지할까요?' });
    expect(dialog.getAttribute('data-danger')).toBe('true');
    expect(within(dialog).getByText(/로그인할 수 없고 공개 프로필이 숨겨집니다/)).toBeTruthy();
  });

  it('조치 선택지는 문제 없음·경고·채팅 7일 제한·계정 정지 네 가지다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [report()] })),
    );
    const { container } = renderAt('/admin/reports', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Reports"]') as HTMLElement;

    await within(root).findByRole('heading', { level: 2, name: /오후 세시/ });
    const names = within(root).getAllByRole('radio').map((radio) => radio.textContent ?? '');
    expect(names).toHaveLength(4);
    expect(names[0]).toMatch(/^문제 없음/);
    expect(names[1]).toMatch(/^경고/);
    expect(names[2]).toMatch(/^채팅 7일 제한/);
    expect(names[3]).toMatch(/^계정 정지/);
    expect(within(root).queryByText('조치 없음')).toBeNull();
  });

  it('채팅 7일 제한을 고르면 CHAT_RESTRICT_7D로 보낸다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (String(input).endsWith('/resolve') && init?.method === 'POST') {
        return jsonResponse({
          data: {
            report: report({
              status: 'RESOLVED',
              action: 'CHAT_RESTRICT_7D',
              actionNote: '외부 거래 유도 반복',
              resolvedAt: '2026-11-03T01:12:00.000Z',
            }),
            warningReviewRecommended: false,
          },
        });
      }
      return jsonResponse({ data: [report()] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/reports', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Reports"]') as HTMLElement;

    fireEvent.click(await within(root).findByRole('radio', { name: /채팅 7일 제한/ }));
    expect(within(root).getByText(/7일 동안 채팅에 새 메시지를 보낼 수 없습니다/)).toBeTruthy();
    fireEvent.change(within(root).getByLabelText(/조치 사유/), {
      target: { value: '외부 거래 유도 반복' },
    });
    fireEvent.click(within(root).getByRole('button', { name: '조치 확정' }));

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([path]) => String(path).endsWith('/resolve'))).toBe(true),
    );
    const call = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/resolve'));
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      action: 'CHAT_RESTRICT_7D',
      actionNote: '외부 거래 유도 반복',
    });
    expect((await within(root).findAllByText(/채팅 7일 제한/)).length).toBeGreaterThan(0);
  });

  it('신고 상태는 OPEN·RESOLVED 대신 처리 대기·처리 완료로 보인다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () =>
        jsonResponse({
          data: [
            report(),
            report({
              id: 'report-2',
              status: 'RESOLVED',
              action: 'NONE',
              createdAt: '2026-11-01T06:40:00.000Z',
              resolvedAt: '2026-11-01T07:00:00.000Z',
            }),
          ],
        }),
      ),
    );
    const { container } = renderAt('/admin/reports', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Reports"]') as HTMLElement;
    const list = await within(root).findByRole('region', { name: '신고 목록' });

    expect(within(list).getByText('처리 대기')).toBeTruthy();
    expect(within(list).getByText('처리 완료')).toBeTruthy();
    expect(within(root).queryByText('OPEN')).toBeNull();
    expect(within(root).queryByText('RESOLVED')).toBeNull();
  });

  it('신고가 없으면 빈 상태를 보여 준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [] })),
    );
    renderAt('/admin/reports', 'admin', undefined, 'test-token');

    expect(await screen.findByText('신고가 없습니다')).toBeTruthy();
  });

  it('운영자가 아니면 역할 홈으로 보낸다', () => {
    renderAt('/admin/reports', 'client', undefined, 'test-token');
    expect(location.current).toBe('/c');
  });
});

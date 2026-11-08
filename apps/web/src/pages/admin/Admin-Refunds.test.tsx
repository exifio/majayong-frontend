/* 환불 처리 Admin-Refunds — 실제 /admin/contracts/cancellation-queue */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { AdminCancellationContractDto } from '@majayong/types/api';
import { findDesignViolations } from '@/app/devChecks';
import { renderAt } from '@/test/render';
import { DEMO } from './Admin-Refunds.data';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const contract = (over: Partial<AdminCancellationContractDto> = {}): AdminCancellationContractDto => ({
  id: 'contract-abcdef123456',
  status: 'CANCEL_REQUESTED',
  cancelCause: 'CLIENT',
  totalDeposited: 3_255_000,
  agreedAmount: 3_100_000,
  clientFee: 155_000,
  compensationRate: 50,
  cancelResolution: null,
  cancelResolvedAt: null,
  refundAmount: null,
  settledAmount: null,
  clientFeeRefund: null,
  refundedAt: null,
  cancelPayoutAt: null,
  depositedAt: '2026-11-04T01:00:00.000Z',
  cancelRequestedAt: '2026-11-08T01:00:00.000Z',
  cancelEscalatedAt: '2026-11-11T01:00:00.000Z',
  objectionRate: 80,
  installmentStatuses: ['PENDING', 'PENDING'],
  ...over,
});

const decided = contract({
  status: 'CANCELLED',
  compensationRate: 60,
  cancelResolution: 'ADMIN_DECIDED',
  cancelResolvedAt: '2026-11-12T01:00:00.000Z',
  refundAmount: 2_244_100,
  settledAmount: 883_500,
  clientFeeRefund: 108_500,
});

const screenRoot = (container: HTMLElement) =>
  container.querySelector('[data-screen="Admin-Refunds"]') as HTMLElement;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Admin-Refunds — 실제 환불 처리', () => {
  it('취소 대기 계약을 서버 값으로 보여 주고 자리표시 문구를 쓰지 않는다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [contract()] })),
    );
    const { container } = renderAt('/admin/refunds', 'admin', undefined, 'test-token');
    const root = screenRoot(container);

    expect(await within(root).findByRole('heading', { level: 2, name: /contract-abcdef123456/ })).toBeTruthy();
    expect(within(root).getAllByText('의뢰인 사정').length).toBeGreaterThan(0);
    expect(within(root).getAllByText('판정 필요').length).toBeGreaterThan(0);
    expect(within(root).getByText('80%')).toBeTruthy();
    expect(within(root).getAllByText(/3,255,000원/).length).toBeGreaterThan(0);
    expect(within(root).getByText(/판정을 저장하면 서버가 계산/)).toBeTruthy();
    expect(within(root).queryByText(/데이터 값/)).toBeNull();
    expect(within(root).queryByText(/온도 다이닝/)).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('상대 응답 전이면 판정을 잠근다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () =>
        jsonResponse({ data: [contract({ cancelEscalatedAt: null, objectionRate: null })] }),
      ),
    );
    const { container } = renderAt('/admin/refunds', 'admin', undefined, 'test-token');
    const root = screenRoot(container);

    await within(root).findByRole('heading', { level: 2 });
    expect(within(root).getAllByText('취소 요청 중').length).toBeGreaterThan(0);
    expect(within(root).getAllByText(/상대 응답을 기다리는 중입니다/).length).toBeGreaterThan(0);
    expect(within(root).getByRole('button', { name: DEMO.judgeConfirm }).hasAttribute('disabled')).toBe(true);
  });

  it('보상 비율과 사유로 판정하고, 이어서 환불·지급 처리를 표시한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith('/cancellation/decide') && init?.method === 'POST') {
        return jsonResponse({ data: decided });
      }
      if (url.endsWith('/settlement/mark-processed') && init?.method === 'POST') {
        return jsonResponse({
          data: { ...decided, refundedAt: '2026-11-12T02:00:00.000Z', cancelPayoutAt: '2026-11-12T02:00:00.000Z' },
        });
      }
      return jsonResponse({ data: [contract()] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/refunds', 'admin', undefined, 'test-token');
    const root = screenRoot(container);

    await within(root).findByRole('heading', { level: 2 });
    fireEvent.change(within(root).getByLabelText(/공급자 보상 비율/), { target: { value: '60' } });
    fireEvent.change(within(root).getByLabelText(/판정 사유/), { target: { value: '의뢰인 응답 지연' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.judgeConfirm }));

    expect((await within(root).findAllByText(/2,244,100원/)).length).toBeGreaterThan(0);
    const decideCall = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/cancellation/decide'));
    expect(String(decideCall![0])).toContain('/api/v1/admin/contracts/contract-abcdef123456/cancellation/decide');
    expect(JSON.parse(String(decideCall![1]?.body))).toEqual({ compensationRate: 60, reason: '의뢰인 응답 지연' });

    const processButton = within(root).getByRole('button', { name: '처리 완료로 표시' });
    expect(processButton.hasAttribute('disabled')).toBe(true);
    fireEvent.click(within(root).getByLabelText('의뢰인 환불을 처리했습니다'));
    fireEvent.click(within(root).getByLabelText('공급자 보상 지급을 처리했습니다'));
    fireEvent.change(within(root).getByLabelText(/처리 메모/), { target: { value: '승인 번호 끝자리 5521' } });
    fireEvent.click(within(root).getByRole('button', { name: '처리 완료로 표시' }));

    expect(await within(root).findByText('정산 처리를 마쳤습니다')).toBeTruthy();
    const markCall = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/settlement/mark-processed'));
    expect(JSON.parse(String(markCall![1]?.body))).toEqual({
      refunded: true,
      cancelPayout: true,
      reason: '승인 번호 끝자리 5521',
    });
  });

  it('보상 비율이 0~100 정수가 아니면 판정을 잠근다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [contract()] })),
    );
    const { container } = renderAt('/admin/refunds', 'admin', undefined, 'test-token');
    const root = screenRoot(container);

    await within(root).findByRole('heading', { level: 2 });
    fireEvent.change(within(root).getByLabelText(/공급자 보상 비율/), { target: { value: '120' } });
    fireEvent.change(within(root).getByLabelText(/판정 사유/), { target: { value: '사유' } });
    expect(within(root).getAllByText('0~100 사이의 정수를 적어 주세요').length).toBeGreaterThan(0);
    expect(within(root).getByRole('button', { name: DEMO.judgeConfirm }).hasAttribute('disabled')).toBe(true);
  });

  it('목록을 못 읽으면 오류를 알린다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({}, 500)));
    renderAt('/admin/refunds', 'admin', undefined, 'test-token');
    expect(await screen.findByText('환불 목록을 불러오지 못했습니다. 다시 시도해 주세요.')).toBeTruthy();
  });

  it('처리할 취소 요청이 없으면 빈 상태를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [] })));
    renderAt('/admin/refunds', 'admin', undefined, 'test-token');
    await waitFor(() => expect(screen.getByText('처리할 취소 요청이 없습니다')).toBeTruthy());
  });
});

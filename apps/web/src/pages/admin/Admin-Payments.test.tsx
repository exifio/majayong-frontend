/* 보류된 결제 Admin-Payments — 실제 /admin/deposits/held */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { AdminHeldDepositDto } from '@majayong/types/api';
import { findDesignViolations } from '@/app/devChecks';
import { renderAt } from '@/test/render';
import { DEMO } from './Admin-Payments.data';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const deposit = (over: Partial<AdminHeldDepositDto> = {}): AdminHeldDepositDto => ({
  id: 'deposit-1',
  contractId: 'contract-abcdef123456',
  amount: 2_100_000,
  status: 'HELD',
  heldReason: '',
  ...over,
});

const screenRoot = (container: HTMLElement) =>
  container.querySelector('[data-screen="Admin-Payments"]') as HTMLElement;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Admin-Payments — 실제 보류된 결제', () => {
  it('보류된 예치 목록을 서버 값으로 보여 주고 시연 값을 섞지 않는다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [deposit()] })),
    );
    const { container } = renderAt('/admin/payments', 'admin', undefined, 'test-token');
    const root = screenRoot(container);

    expect(await within(root).findByRole('heading', { level: 2, name: /계약 …123456/ })).toBeTruthy();
    expect(within(root).getAllByText(/2,100,000원/).length).toBeGreaterThan(0);
    expect(within(root).getAllByText('보류 사유 기록 없음').length).toBeGreaterThan(0);
    expect(within(root).queryByText(/골목 파스타/)).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('결제 건 키가 없으면 확정 버튼을 잠그고, 적으면 OPERATOR_CONFIRMED로 보낸다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (String(input).includes('/admin/deposits/deposit-1/resolve') && init?.method === 'POST') {
        return jsonResponse({ data: deposit({ status: 'COMPLETED' }) });
      }
      if (String(input).includes('/admin/deposits/held')) {
        const resolved = fetchMock.mock.calls.some(([, call]) => call?.method === 'POST');
        return jsonResponse({ data: resolved ? [] : [deposit()] });
      }
      return jsonResponse({ data: [] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/payments', 'admin', undefined, 'test-token');
    const root = screenRoot(container);

    await within(root).findByRole('heading', { level: 2 });
    fireEvent.change(within(root).getByLabelText(/^사유/), { target: { value: '재조회로 승인 확인' } });
    const confirm = within(root).getByRole('button', { name: DEMO.confirm });
    expect(confirm.hasAttribute('disabled')).toBe(true);

    fireEvent.change(within(root).getByLabelText(/결제 건 키/), { target: { value: 'pay_key_1' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.confirm }));

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true),
    );
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(String(call![0])).toContain('/api/v1/admin/deposits/deposit-1/resolve');
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      decision: 'OPERATOR_CONFIRMED',
      reason: '재조회로 승인 확인',
      paymentKey: 'pay_key_1',
    });
    expect(await within(root).findByText('예치 완료로 확정했습니다')).toBeTruthy();
    expect(await within(root).findByText('보류된 결제가 없습니다')).toBeTruthy();
  });

  it('결제 취소는 결제 건 키 없이 OPERATOR_VOIDED로 보낸다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
      if (init?.method === 'POST') return jsonResponse({ data: deposit({ status: 'FAILED' }) });
      return jsonResponse({ data: [deposit()] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/payments', 'admin', undefined, 'test-token');
    const root = screenRoot(container);

    await within(root).findByRole('heading', { level: 2 });
    fireEvent.change(within(root).getByLabelText(/^사유/), { target: { value: '금액 불일치' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.cancel }));

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true),
    );
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(String(call![1]?.body))).toEqual({
      decision: 'OPERATOR_VOIDED',
      reason: '금액 불일치',
    });
    expect(await within(root).findByText('결제를 취소했습니다')).toBeTruthy();
  });

  it('서버 오류 메시지를 그대로 알린다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
        if (init?.method === 'POST') {
          return jsonResponse(
            { error: { code: 'UNPROCESSABLE', message: 'PG 거래 근거를 확인할 수 없어 예치를 확정할 수 없습니다.', requestId: 'r1' } },
            422,
          );
        }
        return jsonResponse({ data: [deposit()] });
      }),
    );
    const { container } = renderAt('/admin/payments', 'admin', undefined, 'test-token');
    const root = screenRoot(container);

    await within(root).findByRole('heading', { level: 2 });
    fireEvent.change(within(root).getByLabelText(/결제 건 키/), { target: { value: 'pay_key_1' } });
    fireEvent.change(within(root).getByLabelText(/^사유/), { target: { value: '확인' } });
    fireEvent.click(within(root).getByRole('button', { name: DEMO.confirm }));

    expect((await within(root).findByRole('alert')).textContent).toContain('PG 거래 근거');
  });

  it('목록을 못 읽으면 오류를 알린다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({}, 500)));
    renderAt('/admin/payments', 'admin', undefined, 'test-token');
    expect(await screen.findByText('보류된 결제를 불러오지 못했습니다. 다시 시도해 주세요.')).toBeTruthy();
  });

  it('보류된 결제가 없으면 빈 상태를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [] })));
    renderAt('/admin/payments', 'admin', undefined, 'test-token');
    expect(await screen.findByText('보류된 결제가 없습니다')).toBeTruthy();
  });
});

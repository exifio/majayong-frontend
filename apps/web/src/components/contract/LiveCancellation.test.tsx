/* 계약 취소 — 요청 작성(서로 합의·근거 메시지) · 상대방 동의/이의 · 확정 정산 표시 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { CancellationDto, ContractRecordDto } from '@majayong/types/api';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const contract: ContractRecordDto = {
  id: 'contract-1',
  applicationId: 'application-1',
  projectId: 'project-1',
  clientUserId: 'client-1',
  supplierId: 'supplier-1',
  status: 'ACTIVE',
  specVersionNo: 1,
  agreedAmount: 3_100_000,
  durationDays: 30,
  clientFee: 155_000,
  supplierFee: 155_000,
  interimRatio: 50,
  consentDeadline: '2026-11-10T00:00:00.000Z',
  contentHash: 'hash',
  clientSignedAt: '2026-11-06T00:00:00.000Z',
  supplierSignedAt: '2026-11-06T00:00:00.000Z',
  depositDeadline: '2026-11-09T00:00:00.000Z',
  paymentStatus: 'DEPOSITED',
  totalDeposited: 3_255_000,
  items: [],
};

const empty: CancellationDto = {
  contractId: 'contract-1',
  status: 'ACTIVE',
  cancelCause: null,
  cancelRequestedBy: null,
  cancelRequestedAt: null,
  cancelNote: null,
  cancelEvidence: null,
  objectionRate: null,
  objectionNote: null,
  cancelEscalatedAt: null,
  compensationRate: null,
  cancelResolution: null,
  cancelResolvedAt: null,
  refundAmount: null,
  settledAmount: null,
  clientFeeRefund: null,
  refundReason: null,
  refundedAt: null,
  cancelPayoutAt: null,
  paused: false,
};

const messages = [
  { id: 'm-1', applicationId: 'application-1', senderId: 'supplier-1', kind: 'TEXT', body: '일정을 맞추기 어렵습니다', isMasked: false, readAt: null, createdAt: '2026-11-07T01:00:00.000Z' },
  { id: 'm-sys', applicationId: 'application-1', senderId: null, kind: 'SYSTEM', body: '계약이 체결되었습니다', isMasked: false, readAt: null, createdAt: '2026-11-07T00:00:00.000Z' },
];

function workspace(current: { contract: ContractRecordDto; cancellation: CancellationDto }) {
  return vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
    const url = String(input);
    if (init?.method === 'POST') return jsonResponse({ data: { id: 'contract-1', status: 'CANCEL_REQUESTED' } });
    if (url.endsWith('/contracts/contract-1')) return jsonResponse({ data: current.contract });
    if (url.endsWith('/contracts/contract-1/cancellation')) return jsonResponse({ data: current.cancellation });
    if (url.endsWith('/applications/application-1/messages')) return jsonResponse({ data: { messages, unreadCount: 0 } });
    return jsonResponse({ error: { code: 'NOT_FOUND', message: '없음', requestId: 'r' } }, 404);
  });
}

const bodyOf = (mock: ReturnType<typeof vi.fn<typeof fetch>>, suffix: string) => {
  const call = mock.mock.calls.find(([url, init]) => String(url).endsWith(suffix) && init?.method === 'POST');
  return call ? JSON.parse(String(call[1]?.body)) : undefined;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

/** 전체 앱 셸 대신 화면 루트 안에서만 찾아 역할 질의를 가볍게 한다. */
async function screenRoot(container: HTMLElement, name: string) {
  await waitFor(() => expect(container.querySelector(`[data-screen="${name}"][data-role]`)).toBeTruthy(), { timeout: 4000 });
  return within(container.querySelector(`[data-screen="${name}"][data-role]`) as HTMLElement);
}

describe('LiveCancellation — 계약 취소', () => {
  it('의뢰인은 서로 합의 사유·보상 비율·근거 메시지를 담아 취소를 요청한다', async () => {
    const fetchMock = workspace({ contract, cancellation: empty });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/c/contracts/contract-1/cancel', 'client', undefined, 'test-token');
    const view = await screenRoot(container, 'Cancel-Client');

    const causes = await view.findByRole('radiogroup', { name: '취소 사유' });
    expect(within(causes).queryByRole('radio', { name: /공급자 사정/ })).toBeNull();
    fireEvent.click(within(causes).getByRole('radio', { name: /서로 합의/ }));

    fireEvent.click(view.getByRole('button', { name: '취소 요청 보내기' }));
    expect(view.getByText('0~100 사이 정수를 입력해 주세요.')).toBeTruthy();
    expect(view.getByText('사유 설명을 입력해 주세요.')).toBeTruthy();
    expect(view.queryByRole('dialog')).toBeNull();

    fireEvent.change(view.getByLabelText(/공급자 보상 비율/), { target: { value: '30' } });
    fireEvent.change(view.getByLabelText(/^사유 설명/), { target: { value: '일정이 맞지 않아 합의했습니다' } });
    fireEvent.click(await view.findByRole('checkbox', { name: /일정을 맞추기 어렵습니다/ }));
    expect(view.queryByRole('checkbox', { name: /계약이 체결되었습니다/ })).toBeNull();

    fireEvent.click(view.getByRole('button', { name: '취소 요청 보내기' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '요청 보내기' }));

    await waitFor(() => expect(bodyOf(fetchMock, '/contracts/contract-1/cancellation')).toEqual({
      cause: 'MUTUAL',
      note: '일정이 맞지 않아 합의했습니다',
      evidence: { messageIds: ['m-1'] },
      proposedCompensationRate: 30,
    }));
  }, 15000);

  it('근거를 고르지 않으면 evidence 없이 의뢰인 사정으로 요청한다', async () => {
    const fetchMock = workspace({ contract, cancellation: empty });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/c/contracts/contract-1/cancel', 'client', undefined, 'test-token');
    const view = await screenRoot(container, 'Cancel-Client');

    fireEvent.click(await view.findByRole('radio', { name: /의뢰인 사정/ }));
    fireEvent.change(view.getByLabelText(/^사유 설명/), { target: { value: '사업 계획이 바뀌었습니다' } });
    fireEvent.click(view.getByRole('button', { name: '취소 요청 보내기' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '요청 보내기' }));

    await waitFor(() => expect(bodyOf(fetchMock, '/contracts/contract-1/cancellation')).toEqual({
      cause: 'CLIENT',
      note: '사업 계획이 바뀌었습니다',
    }));
  }, 15000);

  const requested: CancellationDto = {
    ...empty,
    status: 'CANCEL_REQUESTED',
    cancelCause: 'CLIENT',
    cancelRequestedBy: 'client-1',
    cancelRequestedAt: '2026-11-07T02:00:00.000Z',
    cancelNote: '사업 계획이 바뀌었습니다',
    cancelEvidence: { messageIds: ['m-1'] },
    paused: true,
  };

  it('공급자는 받은 요청에 보상 비율과 사유로 이의를 보낸다', async () => {
    const fetchMock = workspace({ contract: { ...contract, status: 'CANCEL_REQUESTED' }, cancellation: requested });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/s/contracts/contract-1/cancel', 'supplier', undefined, 'test-token');
    const view = await screenRoot(container, 'Cancel-Supplier');

    expect(await view.findByRole('heading', { level: 1, name: '취소 요청 받음' })).toBeTruthy();
    expect(await view.findByText('일정을 맞추기 어렵습니다')).toBeTruthy();
    expect(view.getByRole('button', { name: '동의하기' })).toBeTruthy();

    fireEvent.click(view.getByRole('button', { name: '이의 제기' }));
    fireEvent.change(view.getByLabelText(/요청하는 보상 비율/), { target: { value: '70' } });
    fireEvent.change(view.getByLabelText(/^이의 사유/), { target: { value: '중간 작업을 이미 마쳤습니다' } });
    fireEvent.click(view.getByRole('button', { name: '이의 보내기' }));

    await waitFor(() => expect(bodyOf(fetchMock, '/contracts/contract-1/cancellation/object')).toEqual({
      objectionRate: 70,
      note: '중간 작업을 이미 마쳤습니다',
    }));
  }, 15000);

  it('공급자가 동의하면 확인 후 agree를 보낸다', async () => {
    const fetchMock = workspace({ contract: { ...contract, status: 'CANCEL_REQUESTED' }, cancellation: requested });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/s/contracts/contract-1/cancel', 'supplier', undefined, 'test-token');
    const view = await screenRoot(container, 'Cancel-Supplier');

    fireEvent.click(await view.findByRole('button', { name: '동의하기' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '동의하기' }));

    await waitFor(() => expect(bodyOf(fetchMock, '/contracts/contract-1/cancellation/agree')).toEqual({}));
  }, 15000);

  it('요청한 본인에게는 응답 버튼 없이 대기 띠를 보여 준다', async () => {
    vi.stubGlobal('fetch', workspace({ contract: { ...contract, status: 'CANCEL_REQUESTED' }, cancellation: requested }));
    const { container } = renderAt('/c/contracts/contract-1/cancel', 'client', undefined, 'test-token');
    const view = await screenRoot(container, 'Cancel-Client');

    expect(await view.findByText('상대방 응답 대기')).toBeTruthy();
    expect(view.queryByRole('button', { name: '동의하기' })).toBeNull();
  }, 15000);

  it('취소 확정 후 환불·지급 처리 시각과 환불 사유를 보여 준다', async () => {
    vi.stubGlobal('fetch', workspace({
      contract: { ...contract, status: 'CANCELLED', paymentStatus: 'REFUNDED' },
      cancellation: {
        ...requested,
        status: 'CANCELLED',
        cancelResolution: 'AGREED',
        cancelResolvedAt: '2026-11-08T00:00:00.000Z',
        compensationRate: 50,
        refundAmount: 1_550_000,
        settledAmount: 1_550_000,
        clientFeeRefund: 0,
        refundReason: '의뢰인 사정 취소',
        refundedAt: '2026-11-08T03:00:00.000Z',
        cancelPayoutAt: null,
        paused: false,
      },
    }));
    const { container } = renderAt('/c/contracts/contract-1/cancel', 'client', undefined, 'test-token');
    const view = await screenRoot(container, 'Cancel-Client');

    expect(await view.findByText('계약 취소 확정')).toBeTruthy();
    expect(view.getByText('의뢰인 사정 취소')).toBeTruthy();
    expect(view.getByText('처리 전')).toBeTruthy();
    expect(view.getByRole('link', { name: '정산 내역 보기' }).getAttribute('href'))
      .toBe('/c/settlements?contract=contract-1');
  }, 15000);
});

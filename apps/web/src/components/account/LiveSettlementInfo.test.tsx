/* 증빙·정산 정보 — 실제 세금/계좌 API */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LiveSettlementInfo — 증빙·정산 정보', () => {
  it('의뢰인 증빙 정보를 PATCH하고 서버가 돌려준 마스킹 값을 보여 준다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () =>
      jsonResponse({ data: { bizRegNoMasked: '123-45-*****', taxInvoiceEmail: 'tax@example.com' } }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/c/account', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Client"]') as HTMLElement;

    fireEvent.change(within(root).getByLabelText('사업자등록번호'), { target: { value: '1234567890' } });
    fireEvent.change(within(root).getByLabelText('세금계산서 이메일'), { target: { value: 'tax@example.com' } });
    fireEvent.click(within(root).getByRole('button', { name: '증빙 정보 저장' }));

    expect(await within(root).findByText('증빙 정보를 저장했습니다.')).toBeTruthy();
    expect(within(root).getByText(/123-45-\*\*\*\*\*/)).toBeTruthy();
    const call = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/me/client-tax-info'));
    expect(call?.[1]?.method).toBe('PATCH');
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({
      bizRegNo: '1234567890',
      taxInvoiceEmail: 'tax@example.com',
    });
  });

  it('공급자 계좌를 저장하면 마스킹 값과 인증 전 상태를 보여 준다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (String(input).endsWith('/me/supplier-profile')) {
        return jsonResponse({ data: { displayName: '최준호', businessType: 'INDIVIDUAL', bizRegNoMasked: null, payoutBank: null, payoutAccountMasked: null, payoutHolder: null, payoutVerifiedAt: null } });
      }
      if (String(input).endsWith('/me/payout-account') && init?.method === 'PATCH') {
        return jsonResponse({ data: { bank: '신한은행', accountMasked: '●●●● 2048', holder: '최준호', verifiedAt: null } });
      }
      return jsonResponse({ data: {} });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/s/account', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Supplier"]') as HTMLElement;

    fireEvent.change(within(root).getByLabelText('계좌번호'), { target: { value: '1101234562048' } });
    fireEvent.click(within(root).getByRole('button', { name: '계좌 저장' }));

    expect(await within(root).findByText('계좌를 저장했습니다. 인증 전에는 지급이 보류됩니다.')).toBeTruthy();
    expect(within(root).getByText(/●●●● 2048/)).toBeTruthy();
    expect(within(root).getAllByText(/인증 전/).length).toBeGreaterThan(0);
  });

  it('서버가 계좌 인증을 지원하지 않으면 성공으로 표시하지 않는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (String(input).endsWith('/me/supplier-profile')) {
        return jsonResponse({ data: { displayName: '최준호', businessType: 'INDIVIDUAL', bizRegNoMasked: null, payoutBank: '신한은행', payoutAccountMasked: '●●●● 2048', payoutHolder: '최준호', payoutVerifiedAt: null } });
      }
      if (String(input).endsWith('/me/payout-account/verify')) {
        return jsonResponse({ error: { code: 'PAYOUT_VERIFICATION_UNAVAILABLE', message: '미지원', requestId: 'r1' } }, 503);
      }
      return jsonResponse({ data: {} });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/s/account', 'supplier', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Account-Supplier"]') as HTMLElement;

    await waitFor(() => expect(within(root).getByText(/●●●● 2048/)).toBeTruthy());
    fireEvent.change(within(root).getByLabelText('인증 코드'), { target: { value: '1234' } });
    fireEvent.click(within(root).getByRole('button', { name: '계좌 인증' }));

    expect(await within(root).findByText(/서버에서 계좌 인증을 사용할 수 없습니다/)).toBeTruthy();
    expect(within(root).queryByText(/인증 완료/)).toBeNull();
  });
});

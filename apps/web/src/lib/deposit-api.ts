/* C 예치 API adapter — 실제 응답 봉투를 사용한다. 결제창 호출은 feature flag 뒤에서만 일어난다. */
import type { ConfirmDepositResultDto, CreateDepositResultDto, EscrowDepositDto } from '@majayong/types/api';
import { apiRequest } from '@/lib/api';

export interface CreateDepositRequestDto {
  idempotencyKey: string;
  method: string;
  amount: number;
}

/** One key per payment intent so retries reuse the same deposit. */
export function newDepositIdempotencyKey(): string {
  return crypto.randomUUID();
}

export async function listDeposits(accessToken: string, contractId: string): Promise<EscrowDepositDto[]> {
  const response = await apiRequest('listDeposits', `/contracts/${encodeURIComponent(contractId)}/deposits`, {
    accessToken,
  });
  return response.data;
}

export async function createDeposit(
  accessToken: string,
  contractId: string,
  amount: number,
): Promise<CreateDepositResultDto> {
  const response = await apiRequest('createDeposit', `/contracts/${encodeURIComponent(contractId)}/deposits`, {
    method: 'POST',
    accessToken,
    jsonBody: {
      amount,
      method: 'CARD',
      idempotencyKey: newDepositIdempotencyKey(),
    },
  });
  return response.data;
}

export async function confirmDeposit(
  accessToken: string,
  contractId: string,
  depositId: string,
  paymentKey: string,
  amount: number,
): Promise<ConfirmDepositResultDto> {
  const response = await apiRequest(
    'confirmDeposit',
    `/contracts/${encodeURIComponent(contractId)}/deposits/${encodeURIComponent(depositId)}/confirm`,
    {
      method: 'POST',
      accessToken,
      jsonBody: { paymentKey, amount },
    },
  );
  return response.data;
}

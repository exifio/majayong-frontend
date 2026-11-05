import type { ApiContractStatus, ApiPaymentStatus } from '@majayong/types/api';
import type { ContractDisplayStatus } from '@majayong/types/common';

const CONTRACT_LABEL: Record<ApiContractStatus, ContractDisplayStatus> = {
  PENDING_CONSENT: '서명 대기',
  ACTIVE: '진행 중',
  CANCEL_REQUESTED: '취소 요청 중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export function contractStatusLabel(status: ApiContractStatus): ContractDisplayStatus {
  return CONTRACT_LABEL[status];
}

/** Contract status plus payment status, so ACTIVE is not shown as a finished deal. */
export function contractDisplayLabel(status: ApiContractStatus, paymentStatus: ApiPaymentStatus): ContractDisplayStatus {
  if (status === 'ACTIVE') {
    return paymentStatus === 'PENDING' ? '예치 대기' : '진행 중';
  }
  return contractStatusLabel(status);
}

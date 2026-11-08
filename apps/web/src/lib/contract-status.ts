import type { ApiContractDisplayStatus, ApiContractStatus, ApiPaymentStatus } from '@majayong/types/api';
import type { ContractDisplayStatus } from '@majayong/types/common';

const DISPLAY_STATUS_LABEL: Record<ApiContractDisplayStatus, ContractDisplayStatus> = {
  SIGNING: '서명 대기',
  COUNTERPART_SIGNATURE_PENDING: '서명 대기',
  AWAITING_DEPOSIT: '예치 대기',
  IN_PROGRESS: '진행 중',
  INSPECTION_DUE: '검수 대기',
  WORK_OVERDUE: '마감 지남',
  CONTRACT_COMPLETED: '완료',
  CANCEL_IN_PROGRESS: '취소 요청 중',
  CONTRACT_CANCELLED: '취소',
};

/** 서버가 계산한 displayStatus를 화면 문구로 옮긴다. */
export function contractDisplayStatusLabel(status: ApiContractDisplayStatus): ContractDisplayStatus {
  return DISPLAY_STATUS_LABEL[status];
}

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

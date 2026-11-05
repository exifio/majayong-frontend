import type { ApiPaymentStatus } from '@majayong/types/api';

const PAYMENT_LABEL: Record<ApiPaymentStatus, string> = {
  PENDING: '예치 대기',
  DEPOSITED: '예치 완료',
  PARTIALLY_RELEASED: '일부 지급',
  RELEASED: '지급 완료',
  REFUNDED: '환불',
};

export function paymentStatusLabel(status: ApiPaymentStatus): string {
  return PAYMENT_LABEL[status];
}

/* C 예치 API 준비 — 요청 형식은 확인됐지만 응답 봉투는 D-21 확정 전이라 파싱하지 않는다.
 * POST /contracts/{contractId}/deposits  { idempotencyKey, method, amount }
 * GET  /contracts/{contractId}/deposits  (응답 형식 D-21 대기)
 * 결제 요청은 Toss sandbox·webhook 검증 전까지 호출하지 않는다. */
export const DEPOSIT_API_READY = false;

export interface CreateDepositRequestDto {
  idempotencyKey: string;
  method: string;
  amount: number;
}

/** One key per payment intent so retries reuse the same deposit. */
export function newDepositIdempotencyKey(): string {
  return crypto.randomUUID();
}

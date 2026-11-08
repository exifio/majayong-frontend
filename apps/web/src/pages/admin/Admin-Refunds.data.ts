/* 환불 처리 시연 — PRD F-27 · F-26 · 13.2. */

export const REFUND_MOCKS = ['처리 대기', '사유 다툼 판정', '처리 완료'] as const;
export type RefundMock = (typeof REFUND_MOCKS)[number];

export type RefundRow = {
  id: string;
  title: string;
  reasonChip: string;
  status: '처리 대기' | '판정 필요' | '사유 다툼' | '처리 완료';
  client: string;
  supplier: string;
  listMeta: string;
  meta: string;
  escrowAmount: number;
  refundAmount: number;
  supplierPay: number;
  cancelReason: string;
  clientClaim: string;
  supplierClaim: string;
  timeline: { b: string; s: string; now?: boolean }[];
  settleLines: { k: string; s: string; v: string; tone?: 'tot' | 'mut' }[];
  tasks: { id: string; title: string; detail: string; amount: number; memo: string; doneAt?: string }[];
  judge?: boolean;
  evidence?: { k: string; v: string; dash?: boolean }[];
  quotes?: { who: string; text: string }[];
  doneBand?: { title: string; body: string };
};

export const DEMO = {
  title: '환불 처리',
  sub: '예치 후 취소된 계약의 정산을 처리합니다. 사유를 두고 양쪽이 다투면 근거를 보고 판정합니다.',
  listLabel: '환불 목록',
  detailLabel: '환불 상세',
  confirm: '환불 확정',
  judgeConfirm: '판정 확정',
  reasonLabel: '판정 사유',
  reasonNeed: '사유를 적어 주세요',
  eventNote: '이 처리는 이벤트 기록에 남습니다',
  judgeLabel: '취소 사유 판정',
  settleTitle: '정산안',
  claimsTitle: '양쪽 주장',
  cancelTitle: '취소 사유',
} as const;

export const REFUNDS: RefundRow[] = [
  {
    id: 'rf-1',
    title: '예약 달력, 예약금 결제 외 2개 기능',
    reasonChip: '의뢰인 사유',
    status: '처리 대기',
    client: '온도 다이닝',
    supplier: '최준호',
    listMeta: '의뢰인 온도 다이닝 · 공급자 최준호\n11월 9일 정산 확정 · 환불 2,441,250원',
    meta: '의뢰인 온도 다이닝 · 공급자 최준호 · 합의 3,100,000원 · 중간 50 : 최종 50 · 11월 4일 예치 3,255,000원',
    escrowAmount: 3_255_000,
    refundAmount: 2_441_250,
    supplierPay: 736_250,
    cancelReason: "의뢰인 사정 · 예치 24시간 뒤 · 중간 구간 검수 전",
    clientClaim: '일정이 바뀌어 프로젝트를 이어가기 어렵습니다. 계약서 제6조에 따라 취소를 요청합니다.',
    supplierClaim: '사유에 이견 없습니다. 정산안에 동의합니다.',
    timeline: [
      { b: '11월 4일 · 예치', s: '3,255,000원 · 카드' },
      { b: '11월 8일 · 의뢰인 취소 요청', s: "사유 '의뢰인 사정' · 예치 24시간 뒤" },
      { b: '11월 9일 · 공급자 동의', s: '사유에 이견 없음' },
      { b: '11월 9일 · 정산 확정', s: '계약서 제6조 — 진행 중 구간의 50%를 공급자에게 보상' },
      { b: '지금 · 운영자 처리 대기', s: '환불 · 지급을 처리하고 완료로 표시합니다', now: true },
    ],
    settleLines: [
      { k: '예치한 금액', s: '합의 3,100,000원 + 의뢰인 수수료 155,000원', v: '3,255,000원' },
      { k: '공급자 보상', s: '진행 중 구간 50%', v: '736,250원' },
      { k: '의뢰인 환불', s: '결제한 수단으로', v: '2,441,250원', tone: 'tot' },
      { k: '공급자 지급', s: '정산 계좌로', v: '736,250원', tone: 'tot' },
    ],
    tasks: [
      {
        id: 't1',
        title: '의뢰인에게 환불',
        detail: '결제한 수단으로 — 카드 · 끝자리 4821',
        amount: 2_441_250,
        memo: '',
      },
      {
        id: 't2',
        title: '공급자에게 지급',
        detail: '등록한 정산 계좌 — 끝자리 2048',
        amount: 736_250,
        memo: '',
      },
    ],
  },
  {
    id: 'rf-2',
    title: '주문 접수, 픽업 알림 외 1개 기능',
    reasonChip: '사유 다툼',
    status: '판정 필요',
    client: '소담 분식',
    supplier: '오세린',
    listMeta: '의뢰인 소담 분식 · 공급자 오세린\n11월 22일 이견 · 예치 1,680,000원',
    meta: '의뢰인 소담 분식 · 공급자 오세린 · 합의 1,600,000원 · 중간 50 : 최종 50 · 11월 6일 예치 1,680,000원 · 작업 기간 30일(12월 6일 마감)',
    escrowAmount: 1_680_000,
    refundAmount: 1_260_000,
    supplierPay: 400_000,
    cancelReason: '사유 다툼 — 의뢰인은 공급자 사정, 공급자는 의뢰인 사정으로 주장',
    clientClaim:
      '11월 14일 이후로 진행 소식이 없고 중간 납품도 없습니다. 작업 기간의 절반이 지났습니다.',
    supplierClaim:
      '픽업 알림을 어떤 수단으로 보낼지 정해 달라고 했는데 6일 동안 답이 없어 이어서 만들 수 없었습니다.',
    timeline: [],
    settleLines: [
      { k: '의뢰인 환불(미리보기)', s: '의뢰인 사유 선택 시', v: '1,260,000원', tone: 'tot' },
      { k: '공급자 보상(미리보기)', s: '의뢰인 사유 선택 시', v: '400,000원', tone: 'tot' },
    ],
    tasks: [],
    judge: true,
    evidence: [
      {
        k: '계약서 · 픽업 알림 · 발송 수단',
        v: '정하지 않음 — 이 조건은 검수 기준이 아니고, 픽업 알림은 기능 설명대로 동작하면 됩니다(제4조)',
        dash: true,
      },
      {
        k: '납품 기록',
        v: '중간 구간(주문 접수 · 픽업 알림) 납품 없음 · 11월 21일 기준 작업 기간 30일 중 15일 지남',
      },
    ],
    quotes: [
      {
        who: '공급자 오세린 · 11월 12일 10:24',
        text: '"픽업 알림을 문자로 보낼지 알림톡으로 보낼지 정해 주셔야 이어서 만들 수 있습니다."',
      },
      {
        who: '의뢰인 소담 분식 · 11월 18일 21:40',
        text: '"늦어서 죄송해요. 문자로 해 주세요."',
      },
    ],
  },
  {
    id: 'rf-done',
    title: '예약 달력, 예약금 결제 외 2개 기능',
    reasonChip: '의뢰인 사유',
    status: '처리 완료',
    client: '온도 다이닝',
    supplier: '최준호',
    listMeta: '의뢰인 온도 다이닝 · 공급자 최준호\n11월 10일 처리 · 환불 2,441,250원',
    meta: '의뢰인 온도 다이닝 · 공급자 최준호 · 합의 3,100,000원 · 11월 4일 예치 3,255,000원',
    escrowAmount: 3_255_000,
    refundAmount: 2_441_250,
    supplierPay: 736_250,
    cancelReason: '의뢰인 사정',
    clientClaim: '일정이 바뀌어 프로젝트를 이어가기 어렵습니다.',
    supplierClaim: '사유에 이견 없습니다.',
    timeline: [
      { b: '11월 4일 · 예치', s: '3,255,000원 · 카드' },
      { b: '11월 9일 · 정산 확정', s: '공급자 동의' },
      { b: '11월 10일 · 운영자 처리 완료', s: '환불 · 지급 모두 완료로 표시 · 정산 내역에 반영' },
    ],
    settleLines: [
      { k: '의뢰인 환불', s: '결제한 수단으로', v: '2,441,250원', tone: 'tot' },
      { k: '공급자 지급', s: '정산 계좌로', v: '736,250원', tone: 'tot' },
    ],
    tasks: [
      {
        id: 't1',
        title: '의뢰인에게 환불',
        detail: '결제한 수단으로 — 카드 · 끝자리 4821',
        amount: 2_441_250,
        memo: 'PG 부분취소 승인 완료 · 승인 번호 끝자리 5521',
        doneAt: '11월 10일 14:52',
      },
      {
        id: 't2',
        title: '공급자에게 지급',
        detail: '등록한 정산 계좌 — 끝자리 2048',
        amount: 736_250,
        memo: '정산 계좌 이체 완료 · 확인 번호 끝자리 0913',
        doneAt: '11월 10일 15:10',
      },
    ],
    doneBand: {
      title: '정산 처리를 마쳤습니다 · 11월 10일 15:10 · 운영자 김하늘',
      body: "의뢰인 · 공급자 정산 내역의 이 건이 '완료'로 바뀌었습니다. 운영자 처리 메모는 이벤트 기록에 남았습니다.",
    },
  },
];

export const JUDGE_REASON_DEMO =
  '공급자가 11월 12일에 발송 수단을 물었고 의뢰인 답은 11월 18일에 왔다. 발송 수단은 정하지 않은 조건이라 기본 방식으로 진행할 수도 있었으나, 중단의 주된 원인은 의뢰인 응답 지연으로 본다.';

export function resolveRefundMock(raw: string | null): RefundMock {
  if (raw && (REFUND_MOCKS as readonly string[]).includes(raw)) return raw as RefundMock;
  return '처리 대기';
}

export function defaultIdOf(mock: RefundMock): string {
  if (mock === '사유 다툼 판정') return 'rf-2';
  if (mock === '처리 완료') return 'rf-done';
  return 'rf-1';
}

export function refundOf(id: string | null): RefundRow {
  return REFUNDS.find((r) => r.id === id) ?? REFUNDS[0]!;
}

export function listFor(mock: RefundMock): RefundRow[] {
  if (mock === '사유 다툼 판정') return REFUNDS.filter((r) => r.id === 'rf-2' || r.id === 'rf-1');
  if (mock === '처리 완료') return REFUNDS.filter((r) => r.id === 'rf-done');
  return REFUNDS.filter((r) => r.id === 'rf-1');
}

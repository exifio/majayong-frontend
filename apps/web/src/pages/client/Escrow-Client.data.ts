/* 결제(예치) 시연 데이터 — PRD 9.6 · F-13 · 11절. 화면에서 계산하지 않는다. */

export const ESCROW_MOCKS = ['결제 전', '결제 실패', '확인 중', '예치 완료'] as const;
export type EscrowMock = (typeof ESCROW_MOCKS)[number];

export const DEFAULT_CID = 'c-ondo';
export const LIST_HREF = '/c/contracts';
export const SETTLE_HREF = '/c/settlements?contract=c-ondo';

export function resolveEscrowMock(raw: string | null): EscrowMock {
  if (raw && (ESCROW_MOCKS as readonly string[]).includes(raw)) return raw as EscrowMock;
  return '결제 전';
}

export function contractHref(cid = DEFAULT_CID) {
  return `/c/contracts/${cid}`;
}

export const DEMO = {
  title: '예약 달력, 예약금 결제 외 2개 기능',
  titleBefore: '예치하기',
  titleDone: '예치 완료',
  subBefore:
    '계약이 체결되었습니다. 예치하면 내 계약에 예치 완료로 표시되고, 예치 다음 날부터 작업 기간(42일)이 시작됩니다.',
  subDone:
    '예치가 끝나 작업이 시작되었습니다. 진행 상황은 내 계약에서, 지급 내역은 정산 내역에서 보실 수 있습니다.',
  escrowAt: '2026-11-07T23:59:00+09:00',
  workDueAt: '2026-12-16',
  agreed: 3_100_000,
  fee: 155_000,
  escrow: 3_255_000,
  stage: 1_550_000,
  supplierName: '최준호',
  supplierMeta: '웹 외주 프리랜서 5년 차 · ★ 4.8 · 리뷰 12건',
  supplierInitial: '최',
  midItems: '예약 달력 · 예약금 결제',
  finItems: '노쇼 기록 · 리마인드 알림',
  payRatio: '중간 50 : 최종 50',
  agreeLabel: '계약서와 정산 규칙을 확인했습니다.',
  cta: '3,255,000원 예치하기',
  retryCta: '다시 결제하기',
  waitingCta: '확인 중',
  doneCta: '내 계약으로',
  settleCta: '정산 내역 보기',
  disabledReason: '계약서와 정산 규칙을 확인해 주세요',
  failTitle: '결제가 완료되지 않았습니다',
  failBody:
    "11월 4일 14:12 · 카드사에서 승인을 거절했습니다. 돈은 빠져나가지 않았습니다. '다시 결제하기'를 누르면 새로 결제를 시도하고, 같은 결제가 두 번 되지 않도록 막습니다.",
  waitTitle: '다시 결제하지 마세요',
  waitBody:
    '11월 4일 14:18 · 결제는 접수되었고 결제사 확인을 기다리고 있습니다. 확인되기 전에는 예치 완료로 바꾸지 않습니다. 금액이 맞지 않으면 운영자가 확인합니다.',
  doneTitle: '예치가 끝났습니다 · 11월 4일 14:20',
  doneBody:
    '작업이 시작됩니다 — 예치 다음 날부터 42일, 마감 12월 16일. 예치금은 마자용이 보관하고, 구간이 승인될 때만 최준호님에게 지급됩니다.',
  receiptMethod: '카드',
  receiptId: '끝자리 4821',
  receiptAt: '11월 4일 14:20',
  tinyBefore: '누르면 결제 창이 열립니다.',
  tinyFail: '새 결제로 시도합니다 · 실패한 결제는 청구되지 않습니다',
  tinyWait: '확인되면 이 화면과 내 계약의 상태가 예치 완료로 바뀝니다',
  feeNote: '수수료는 지급이 확정된 금액에만 남고, 계약이 취소되면 나머지는 돌려드립니다.',
  deadlineNote: '지나면 자동 결렬',
  steps: [
    { no: '1', title: '마자용이 보관', body: '예치한 금액은 공급자에게 바로 가지 않고 마자용이 보관합니다.' },
    { no: '2', title: '승인된 구간만 지급', body: '구간에 담긴 항목이 모두 승인되면 그 구간 금액만 공급자에게 넘어갑니다.' },
    { no: '3', title: '취소하면 사유대로 정산', body: '계약이 취소되면 사유에 따라 정산하고, 남은 금액은 돌려드립니다.' },
  ],
  cancelRules: [
    '예치 후 24시간 안, 납품 전에 의뢰인 사유로 취소하면 전액 환불합니다.',
    '그 뒤에 의뢰인 사유로 취소하면 진행 중인 구간 금액의 50% 이상을 공급자에게 보상합니다. 납품한 구간은 전액 지급합니다.',
    '공급자 사유로 취소되면 지급되지 않은 구간을 전액 환불합니다.',
    '수수료는 공급자에게 지급이 확정된 금액에만 붙고, 나머지 수수료는 돌려드립니다. 취소 정산은 계약당 한 번입니다.',
  ],
} as const;

export type EscrowDemo = {
  mock: EscrowMock;
  isBefore: boolean;
  isFail: boolean;
  isWait: boolean;
  isDone: boolean;
  showPay: boolean;
  showAgree: boolean;
  showDeadline: boolean;
  status: string;
  periodSub: string;
  payHeading: string;
  totLabel: string;
};

export function escrowDemoOf(mock: EscrowMock): EscrowDemo {
  const isBefore = mock === '결제 전';
  const isFail = mock === '결제 실패';
  const isWait = mock === '확인 중';
  const isDone = mock === '예치 완료';
  return {
    mock,
    isBefore,
    isFail,
    isWait,
    isDone,
    showPay: !isDone,
    showAgree: isBefore || isFail,
    showDeadline: isBefore || isFail,
    status: isDone ? '진행 중' : '예치 대기',
    periodSub: isDone ? '11월 5일 ~ 12월 16일' : '예치 다음 날부터',
    payHeading: isDone ? '예치한 금액' : '예치할 금액',
    totLabel: isDone ? '예치한 금액' : '예치할 금액',
  };
}

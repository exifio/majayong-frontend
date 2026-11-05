/* 보류된 결제 시연 — PRD F-27 · 11절. */

export const PAY_MOCKS = ['목록', '금액 불일치', '확정'] as const;
export type PayMock = (typeof PAY_MOCKS)[number];

export type PayRow = {
  id: string;
  contract: string;
  amount: number;
  holdReason: string;
  status: '결과 통지 없음' | '금액 불일치' | '예치 완료';
  elapsed: string;
  meta: string;
  bandTone: 'wait' | 'warn' | 'done';
  bandTitle: string;
  bandBody: string;
  escrowAmount: number;
  pgAmount: number;
  diffAmount: number; /* 서버가 준 차이 — 화면에서 계산하지 않음 */
  mismatch: boolean;
  canConfirm: boolean;
  confirmBlockWhy: string;
  client: string;
  supplier: string;
  method: string;
  key: string;
  cmp: { k: string; a: string; b: string; diff?: boolean }[];
  flow: { b: string; s: string; now?: boolean }[];
  why: string;
  note: string;
  eventLog?: string;
  done: boolean;
};

export const DEMO = {
  title: '보류된 결제',
  sub: '결제사 확인이 늦거나 금액이 맞지 않아 예치 완료로 바꾸지 않고 멈춘 결제입니다. 결제사 기록과 요청을 비교해 확정하거나 취소합니다.',
  listLabel: '보류된 결제 목록',
  detailLabel: '결제 상세',
  confirm: '예치 완료로 확정',
  cancel: '결제 취소 · 다시 결제 요청',
  requery: '결제사에 다시 조회',
  reasonLabel: '사유',
  reasonNeed: '사유를 적어 주세요',
  eventNote: '이 처리는 이벤트 기록에 남습니다',
  escrowLabel: '계약 예치액',
  pgLabel: 'PG 결제액',
  diffLabel: '차이',
} as const;

export const PAYMENTS: PayRow[] = [
  {
    id: 'pay-1',
    contract: '골목 파스타',
    amount: 2_100_000,
    holdReason: '결과 통지 없음',
    status: '결과 통지 없음',
    elapsed: '11월 4일 14:12 · 40분째',
    meta: '결제 요청 11월 4일 14:12 · 결제 건 •••3307',
    bandTone: 'wait',
    bandTitle: '결제사는 승인했지만 결과 통지가 40분째 오지 않았습니다',
    bandBody:
      '14:52에 결제사에 다시 조회해 승인 기록을 받았습니다. 금액이 요청과 같습니다. 통지가 누락된 것으로 보입니다.',
    escrowAmount: 2_100_000,
    pgAmount: 2_100_000,
    diffAmount: 0,
    mismatch: false,
    canConfirm: true,
    confirmBlockWhy: '',
    client: '배수아 · 골목 파스타',
    supplier: '한서진',
    method: '카드 · 끝자리 1093',
    key: '•••3307 + 2,100,000 + 11/04 14:12 → k_7f3a…e91c',
    cmp: [
      { k: '금액', a: '2,100,000원', b: '2,100,000원' },
      { k: '승인', a: '—', b: '14:12 승인' },
      { k: '결과 통지', a: '기다림', b: '보낸 기록 없음' },
      { k: '결제 건', a: '•••3307', b: '•••3307' },
    ],
    flow: [
      { b: '14:12 · 결제 요청', s: '의뢰인이 2,100,000원 결제' },
      { b: '14:12 · 결제사 승인', s: '다시 조회로 확인한 기록' },
      { b: '14:22 · 자동 보류', s: '10분 안에 결과 통지가 없어 예치 완료로 바꾸지 않음' },
      { b: '지금 · 운영자 확인', s: '14:52 다시 조회 · 금액 일치', now: true },
    ],
    why: '결제사 조회로 승인 2,100,000원을 확인했습니다. 결과 통지만 오지 않았습니다.',
    note: "확정 전까지 의뢰인 화면은 '확인 중'으로 보이고 다시 결제를 받지 않습니다.",
    done: false,
  },
  {
    id: 'pay-2',
    contract: '면옥',
    amount: 2_100_000,
    holdReason: '금액 불일치',
    status: '금액 불일치',
    elapsed: '11월 3일 20:41',
    meta: '결제 요청 11월 3일 20:41 · 결제 건 •••7730',
    bandTone: 'warn',
    bandTitle: '결제사 기록 금액이 요청과 90,000원 다릅니다',
    bandBody:
      '요청은 2,100,000원인데 결제사는 2,010,000원 승인으로 통지했습니다. 금액이 맞지 않으면 예치 완료로 확정할 수 없습니다.',
    escrowAmount: 2_100_000,
    pgAmount: 2_010_000,
    diffAmount: 90_000,
    mismatch: true,
    canConfirm: false,
    confirmBlockWhy: '금액이 맞지 않아 확정할 수 없습니다 — 결제사 기록이 요청과 같아야 합니다',
    client: '이정훈 · 면옥',
    supplier: '김세라',
    method: '계좌이체 · 끝자리 5512',
    key: '•••7730 + 2,100,000 + 11/03 20:41 → k_2c91…04ad',
    cmp: [
      { k: '금액', a: '2,100,000원', b: '2,010,000원', diff: true },
      { k: '승인', a: '—', b: '20:41 승인' },
      { k: '결과 통지', a: '기다림', b: '20:41 받음' },
      { k: '결제 건', a: '•••7730', b: '•••7730' },
    ],
    flow: [
      { b: '20:41 · 결제 요청', s: '의뢰인이 2,100,000원 결제' },
      { b: '20:41 · 결과 통지', s: '결제사가 2,010,000원 승인으로 통지' },
      { b: '20:41 · 자동 보류', s: '금액 불일치로 예치 완료로 바꾸지 않음' },
      { b: '지금 · 운영자 확인', s: '결제사에 차액 확인 요청 중', now: true },
    ],
    why: '결제사 승인 금액이 2,010,000원으로 요청과 다릅니다. 이 결제를 취소하고 의뢰인에게 다시 결제를 요청합니다.',
    note: '취소하면 승인된 2,010,000원은 결제사를 통해 의뢰인에게 돌아가고, 의뢰인 화면에는 "결제가 완료되지 않았습니다 · 다시 결제하기"가 보입니다.',
    done: false,
  },
  {
    id: 'pay-done',
    contract: '골목 파스타',
    amount: 2_100_000,
    holdReason: '예치 완료로 확정',
    status: '예치 완료',
    elapsed: '14:53',
    meta: '결제 요청 11월 4일 14:12 · 결제 건 •••3307',
    bandTone: 'done',
    bandTitle: '예치 완료로 확정했습니다 · 14:53',
    bandBody:
      '의뢰인 · 공급자 화면이 예치 완료로 바뀌고, 작업 기간 30일이 내일부터 시작됩니다(마감 12월 4일).',
    escrowAmount: 2_100_000,
    pgAmount: 2_100_000,
    diffAmount: 0,
    mismatch: false,
    canConfirm: false,
    confirmBlockWhy: '',
    client: '배수아 · 골목 파스타',
    supplier: '한서진',
    method: '카드 · 끝자리 1093',
    key: '•••3307 + 2,100,000 + 11/04 14:12 → k_7f3a…e91c',
    cmp: [
      { k: '금액', a: '2,100,000원', b: '2,100,000원' },
      { k: '승인', a: '—', b: '14:12 승인' },
      { k: '결과 통지', a: '기다림', b: '보낸 기록 없음' },
      { k: '결제 건', a: '•••3307', b: '•••3307' },
    ],
    flow: [
      { b: '14:12 · 결제 요청', s: '의뢰인이 2,100,000원 결제' },
      { b: '14:12 · 결제사 승인', s: '결제사 기록' },
      { b: '14:52 · 다시 조회', s: '승인 · 금액 일치 확인' },
      { b: '14:53 · 예치 완료로 확정', s: '운영자 김하늘' },
    ],
    why: '',
    note: '같은 결제 건으로 결과 통지가 뒤늦게 오면 중복 방지 키로 걸러 예치가 두 번 잡히지 않습니다.',
    eventLog:
      '11월 4일 14:53 · 운영자 김하늘 · 결제 보류 → 예치 완료로 확정\n사유: 결제사 조회로 승인 2,100,000원을 확인했습니다. 결과 통지만 오지 않았습니다. · 결제 건 •••3307',
    done: true,
  },
];

export function resolvePayMock(raw: string | null): PayMock {
  if (raw && (PAY_MOCKS as readonly string[]).includes(raw)) return raw as PayMock;
  return '목록';
}

export function defaultIdOf(mock: PayMock): string {
  if (mock === '금액 불일치') return 'pay-2';
  if (mock === '확정') return 'pay-done';
  return 'pay-1';
}

export function payOf(id: string | null): PayRow {
  return PAYMENTS.find((p) => p.id === id) ?? PAYMENTS[0]!;
}

export function listFor(mock: PayMock): PayRow[] {
  if (mock === '확정') return PAYMENTS.filter((p) => p.id === 'pay-2' || p.id === 'pay-done');
  return PAYMENTS.filter((p) => !p.done);
}

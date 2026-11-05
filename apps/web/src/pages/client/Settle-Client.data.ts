/* 결제 · 정산 내역 시연 — PRD F-16 · F-29 · 13.2. 금액은 데이터 값. */

export const SETTLE_MOCKS = ['전체', '계약 하나만(?contract=:cid)', '취소된 계약 예시'] as const;
export type SettleMock = (typeof SETTLE_MOCKS)[number];

export const DEMO = {
  title: '결제 · 정산 내역',
  sub: '계약마다 예치한 금액이 언제, 얼마나 공급자에게 지급되었는지 봅니다. 예치금은 구간이 승인될 때만 공급자에게 넘어갑니다.',
  contractsHref: '/c/contracts',
  contractsLabel: '내 계약 보기',
  allView: '전체 보기',
  oneBanner: '계약 하나만 보는 중',
  feeReceipt: '수수료 증빙 받기',
  payReceipt: '대금 증빙',
  contractView: '계약 보기',
  rulesTitle: '정산 규칙',
  rules: [
    '수수료는 의뢰인 5%(예치할 때 함께 냄)와 공급자 5%(지급할 때 뺌)입니다.',
    '수수료는 공급자에게 지급이 확정된 금액에만 붙습니다. 계약이 취소되면 지급되지 않은 금액의 의뢰인 수수료는 돌려드립니다.',
    '구간을 나눌 때 생기는 원 단위 끝수는 최종 구간에 더합니다.',
    '예치 후 취소는 사유에 따라 정산하고, 정산은 계약당 한 번입니다.',
    '증빙: 수수료는 마자용이 발행하고, 대금은 사업자 공급자가 세금계산서를 직접 발행합니다. 화면의 금액은 모두 부가세 포함입니다.',
  ],
} as const;

export type TxRow = {
  date: string;
  kind: string;
  note: string;
  amount: number;
  sub?: string;
  status: string;
};

export type SettleCard = {
  id: string;
  status: string;
  when: string;
  title: string;
  who: string;
  agreedLabel: string;
  escrow: number;
  paid: number;
  remain: number;
  fee: number;
  rows: TxRow[];
  cancelBox?: { refund: number; compensation: number; lines: { k: string; v: string }[] };
  ended?: boolean;
  group?: string;
};

const ONDO: SettleCard = {
  id: 'c-ondo',
  status: '진행 중',
  when: '작업 마감 12월 16일',
  title: '예약 달력, 예약금 결제 외 2개 기능',
  who: '공급자 최준호',
  agreedLabel: '합의 3,100,000원 · 중간 50 : 최종 50',
  escrow: 3_255_000,
  paid: 1_550_000,
  remain: 1_550_000,
  fee: 155_000,
  rows: [
    {
      date: '11월 4일',
      kind: '예치',
      note: '합의 3,100,000원 + 수수료 155,000원 · 카드',
      amount: 3_255_000,
      status: '완료',
    },
    {
      date: '11월 27일',
      kind: '중간 구간 지급',
      note: '예약 달력 · 예약금 결제 승인(보완 1회)',
      amount: 1_550_000,
      sub: '최준호님에게',
      status: '지급 완료',
    },
    {
      date: '최종 승인 때',
      kind: '최종 구간 지급',
      note: '노쇼 기록 · 리마인드 알림이 모두 승인되면',
      amount: 1_550_000,
      status: '예정',
    },
  ],
};

const DONE_A: SettleCard = {
  id: 'c-menu',
  status: '완료',
  when: '9월 30일 완료',
  title: '메뉴판 페이지, 오시는 길 외 1개 기능',
  who: '공급자 이도윤',
  agreedLabel: '합의 900,000원 · 중간 50 : 최종 50',
  escrow: 945_000,
  paid: 900_000,
  remain: 0,
  fee: 45_000,
  ended: true,
  group: '끝난 계약',
  rows: [
    {
      date: '9월 2일',
      kind: '예치',
      note: '합의 900,000원 + 수수료 45,000원 · 카드',
      amount: 945_000,
      status: '완료',
    },
    {
      date: '9월 16일',
      kind: '중간 구간 지급',
      note: '메뉴판 페이지 승인',
      amount: 450_000,
      sub: '이도윤님에게',
      status: '지급 완료',
    },
    {
      date: '9월 30일',
      kind: '최종 구간 지급',
      note: '오시는 길 · 영업시간 안내 승인',
      amount: 450_000,
      sub: '이도윤님에게',
      status: '지급 완료',
    },
  ],
};

const CANCELLED: SettleCard = {
  id: 'c-cancel',
  status: '취소',
  when: '11월 9일 정산 확정',
  title: '예약 달력, 예약금 결제 외 2개 기능',
  who: '공급자 최준호',
  agreedLabel: '합의 3,100,000원 · 의뢰인 사유 취소(납품 전)',
  escrow: 3_255_000,
  paid: 736_250,
  remain: 0,
  fee: 155_000,
  rows: [
    {
      date: '11월 4일',
      kind: '예치',
      note: '합의 3,100,000원 + 수수료 155,000원',
      amount: 3_255_000,
      status: '완료',
    },
    {
      date: '11월 9일',
      kind: '취소 보상',
      note: '진행 중 구간 1,550,000원의 50% · 최준호님에게',
      amount: 736_250,
      status: '지급 완료',
    },
    {
      date: '11월 9일',
      kind: '환불',
      note: '결제한 카드로 돌려드립니다',
      amount: 2_441_250,
      status: '환불 처리 중',
    },
  ],
  cancelBox: {
    refund: 2_441_250,
    compensation: 736_250,
    lines: [
      { k: '예치한 금액', v: '3,255,000원' },
      { k: '− 공급자 보상(진행 중 구간 50%)', v: '− 775,000원' },
      { k: '− 보상분 수수료 5%', v: '− 38,750원' },
      { k: '돌려받을 금액', v: '2,441,250원' },
      { k: '공급자 보상(수수료 제외)', v: '736,250원' },
    ],
  },
};

export type SumCell = { k: string; v: number; s: string };

export type SettleDemo = {
  mock: SettleMock;
  one: boolean;
  oneName: string;
  sum: SumCell[];
  cards: SettleCard[];
};

export function resolveSettleMock(raw: string | null, contract: string | null): SettleMock {
  if (raw && (SETTLE_MOCKS as readonly string[]).includes(raw)) return raw as SettleMock;
  if (contract) return '계약 하나만(?contract=:cid)';
  return '전체';
}

export function settleDemoOf(mock: SettleMock): SettleDemo {
  if (mock === '계약 하나만(?contract=:cid)') {
    return {
      mock,
      one: true,
      oneName: ONDO.title,
      sum: [
        { k: '예치한 금액', v: 3_255_000, s: '합의 3,100,000원 + 수수료 5%' },
        { k: '공급자에게 지급', v: 1_550_000, s: '중간 구간' },
        { k: '남은 예치금', v: 1_550_000, s: '최종 승인 때 지급' },
        { k: '낸 수수료', v: 155_000, s: '지급이 확정된 금액의 5%' },
      ],
      cards: [ONDO],
    };
  }
  if (mock === '취소된 계약 예시') {
    return {
      mock,
      one: false,
      oneName: '',
      sum: [
        { k: '예치한 금액', v: 3_255_000, s: '취소 계약 1건 · 수수료 포함' },
        { k: '공급자 보상', v: 736_250, s: '수수료 제외 수령액' },
        { k: '환불', v: 2_441_250, s: '결제한 카드로' },
        { k: '낸 수수료', v: 155_000, s: '예치 때 함께 냄' },
      ],
      cards: [CANCELLED],
    };
  }
  return {
    mock,
    one: false,
    oneName: '',
    sum: [
      { k: '예치한 금액', v: 4_200_000, s: '계약 2건 · 수수료 포함' },
      { k: '공급자에게 지급', v: 2_450_000, s: '구간 승인 때마다' },
      { k: '남은 예치금', v: 1_550_000, s: '진행 중 1건 · 최종 승인 때 지급' },
      { k: '낸 수수료', v: 200_000, s: '지급 확정 금액의 5%' },
    ],
    cards: [ONDO, DONE_A],
  };
}

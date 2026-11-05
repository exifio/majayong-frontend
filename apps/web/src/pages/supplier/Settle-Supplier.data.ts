/* 공급자 정산 내역 시연 — PRD F-16 · F-29. 받을 금액만. 화면에서 계산하지 않음. */

export const SETTLE_S_MOCKS = [
  '전체',
  '계약 하나만(?contract=:cid)',
  '취소된 계약 예시',
  '개인 공급자 예시',
] as const;
export type SettleSMock = (typeof SETTLE_S_MOCKS)[number];

export const DEMO = {
  title: '정산 내역',
  sub: '계약마다 받은 금액과 받을 금액을 봅니다. 구간이 승인되면 수수료 5%를 뺀 금액이 지급됩니다.',
  subIndiv:
    '계약마다 받은 금액과 받을 금액을 봅니다. 구간이 승인되면 수수료 5%와 원천징수 3.3%를 뺀 금액이 지급됩니다.',
  contractsHref: '/s/contracts',
  contractsLabel: '내 계약 보기',
  accountHref: '/s/account',
  allView: '전체 보기',
  oneBanner: '계약 하나만 보는 중',
  feeReceipt: '수수료 증빙 받기',
  taxIssue: '발행했어요',
  taxIssued: '✓ 발행했어요 · 2건',
  taxPending: '중간 구간 발행 전',
  withholdReceipt: '원천징수영수증',
  contractView: '계약 보기',
  indivNote:
    '개인(비사업자) 공급자라면 이렇게 보입니다 · 지급할 때 사업소득 3.3% 원천징수 후 지급 · 최준호님은 사업자라 해당 없음',
  bizLabel: '정산 구분',
  bizValue: '사업자',
  bizSub: '원천징수 없음 · 세금계산서 직접 발행',
  bizLink: '정산 정보 바꾸기',
  rulesTitle: '정산 규칙',
  rules: [
    '수수료는 의뢰인 5%(예치할 때 함께 냄)와 공급자 5%(지급할 때 뺌)입니다.',
    '수수료는 공급자에게 지급이 확정된 금액에만 붙습니다. 계약이 취소되면 지급되지 않은 금액의 의뢰인 수수료는 돌려드립니다.',
    '구간을 나눌 때 생기는 원 단위 끝수는 최종 구간에 더합니다. 금액은 모두 부가세 포함이고, 사업자는 받은 대금으로 의뢰인에게 세금계산서를 발행합니다.',
    '예치 후 취소는 사유(의뢰인 · 공급자 · 합의)에 따라 정산하고, 정산은 계약당 한 번입니다.',
  ],
} as const;

export type TxRow = {
  date: string;
  kind: string;
  note: string;
  amount: number;
  /** 부제 — 예: 구간 1,550,000원 − 수수료 5% */
  sub?: string;
  status: string;
};

export type StatCell = {
  k: string;
  amount?: number;
  text?: string;
  link?: 'fee' | 'tax' | 'withhold';
  dim?: boolean;
};

export type SettleSCard = {
  id: string;
  status: string;
  when: string;
  title: string;
  who: string;
  agreedLabel: string;
  received: number;
  receivedLabel: string;
  stats: StatCell[];
  rows: TxRow[];
  cancelBox?: { lines: { k: string; v: string; tot?: boolean }[] };
  group?: string;
  empty?: boolean;
  biz?: boolean;
};

const STAGE_SUB = '구간 1,550,000원 − 수수료 5%';
const STAGE_SUB_WH = '구간 1,550,000원 − 수수료 5% − 원천징수 3.3%';

function bizCard(indiv: boolean): SettleSCard {
  const net = indiv ? 1_421_350 : 1_472_500;
  const sub = indiv ? STAGE_SUB_WH : STAGE_SUB;
  const stats: StatCell[] = indiv
    ? [
        { k: '받은 금액', amount: net },
        { k: '받을 예정', amount: net },
        { k: '낸 수수료 5%', amount: 77_500, link: 'fee' },
        { k: '원천징수 3.3%', amount: 51_150, link: 'withhold' },
      ]
    : [
        { k: '받은 금액', amount: net },
        { k: '받을 예정', amount: net },
        { k: '낸 수수료 5%', amount: 77_500, link: 'fee' },
        { k: '대금 세금계산서 · 의뢰인에게 직접', text: DEMO.taxPending, link: 'tax', dim: true },
      ];
  return {
    id: 'c-ondo',
    status: '진행 중',
    when: '작업 마감 12월 16일',
    title: '예약 달력, 예약금 결제 외 2개 기능',
    who: '의뢰인 온도 다이닝',
    agreedLabel: '합의 3,100,000원 · 중간 50 : 최종 50',
    received: net,
    receivedLabel: '받은 금액',
    biz: !indiv,
    stats,
    rows: [
      {
        date: '11월 27일',
        kind: '중간 구간',
        note: '예약 달력 · 예약금 결제 승인(보완 1회)',
        amount: net,
        sub,
        status: '지급 완료',
      },
      {
        date: '최종 승인 때',
        kind: '최종 구간',
        note: '노쇼 기록 · 리마인드 알림',
        amount: net,
        sub,
        status: '예정',
      },
    ],
  };
}

function doneDamso(indiv: boolean): SettleSCard {
  const net = indiv ? 1_834_000 : 1_900_000;
  const mid = indiv ? 917_000 : 950_000;
  const sub = indiv ? '구간 1,000,000원 − 수수료 5% − 원천징수 3.3%' : '구간 1,000,000원 − 수수료 5%';
  return {
    id: 'c-damso',
    status: '완료',
    when: '10월 18일 완료',
    title: '테이블 예약, 대기 등록 외 2개 기능',
    who: '의뢰인 담소 키친',
    agreedLabel: '합의 2,000,000원 · 중간 50 : 최종 50',
    received: net,
    receivedLabel: '받은 금액',
    group: '끝난 계약',
    biz: !indiv,
    stats: indiv
      ? [
          { k: '받은 금액', amount: net },
          { k: '받을 예정', amount: 0 },
          { k: '낸 수수료 5%', amount: 100_000, link: 'fee' },
          { k: '원천징수 3.3%', amount: 66_000, link: 'withhold' },
        ]
      : [
          { k: '받은 금액', amount: net },
          { k: '받을 예정', amount: 0 },
          { k: '낸 수수료 5%', amount: 100_000, link: 'fee' },
          { k: '대금 세금계산서 · 의뢰인에게 직접', text: DEMO.taxIssued },
        ],
    rows: [
      {
        date: '9월 30일',
        kind: '중간 구간',
        note: '테이블 예약 · 대기 등록 승인',
        amount: mid,
        sub,
        status: '지급 완료',
      },
      {
        date: '10월 18일',
        kind: '최종 구간',
        note: '입장 알림 승인',
        amount: mid,
        sub,
        status: '지급 완료',
      },
    ],
  };
}

function doneCake(indiv: boolean): SettleSCard {
  const net = indiv ? 1_467_200 : 1_520_000;
  const mid = indiv ? 733_600 : 760_000;
  const sub = indiv ? '구간 800,000원 − 수수료 5% − 원천징수 3.3%' : '구간 800,000원 − 수수료 5%';
  return {
    id: 'c-cake',
    status: '완료',
    when: '8월 22일 완료',
    title: '케이크 예약, 픽업 시간 선택 외 1개 기능',
    who: '의뢰인 하루 베이커리',
    agreedLabel: '합의 1,600,000원 · 중간 50 : 최종 50',
    received: net,
    receivedLabel: '받은 금액',
    biz: !indiv,
    stats: indiv
      ? [
          { k: '받은 금액', amount: net },
          { k: '받을 예정', amount: 0 },
          { k: '낸 수수료 5%', amount: 80_000, link: 'fee' },
          { k: '원천징수 3.3%', amount: 52_800, link: 'withhold' },
        ]
      : [
          { k: '받은 금액', amount: net },
          { k: '받을 예정', amount: 0 },
          { k: '낸 수수료 5%', amount: 80_000, link: 'fee' },
          { k: '대금 세금계산서 · 의뢰인에게 직접', text: DEMO.taxIssued },
        ],
    rows: [
      {
        date: '8월 5일',
        kind: '중간 구간',
        note: '케이크 예약 승인',
        amount: mid,
        sub,
        status: '지급 완료',
      },
      {
        date: '8월 22일',
        kind: '최종 구간',
        note: '픽업 시간 선택 · 주문 알림 승인',
        amount: mid,
        sub,
        status: '지급 완료',
      },
    ],
  };
}

const LAPSED: SettleSCard = {
  id: 'c-lapse',
  status: '결렬',
  when: '10월 12일 결렬',
  title: '클래스 예약, 수강권 결제 외 1개 기능',
  who: '의뢰인 공방 결',
  agreedLabel: '합의 1,900,000원 · 7일 안에 서명 없음',
  received: 0,
  receivedLabel: '오간 금액',
  empty: true,
  stats: [],
  rows: [],
};

const CANCELLED: SettleSCard = {
  id: 'c-brunch',
  status: '지급 처리 중',
  when: '11월 20일 정산 확정',
  title: '브런치 예약, 대기 알림 외 1개 기능',
  who: '의뢰인 브런치 하루',
  agreedLabel: '합의 2,000,000원 · 의뢰인 사유 취소(납품 전)',
  received: 475_000,
  receivedLabel: '받을 금액',
  biz: true,
  stats: [
    { k: '진행 중이던 구간', amount: 1_000_000 },
    { k: '보상 금액', amount: 500_000 },
    { k: '낸 수수료 5%', amount: 25_000, link: 'fee' },
    { k: '대금 세금계산서 · 의뢰인에게 직접', text: '보상분 발행 전', link: 'tax', dim: true },
  ],
  rows: [
    {
      date: '11월 20일',
      kind: '취소 보상',
      note: '진행 중 구간 1,000,000원의 50%',
      amount: 475_000,
      sub: '구간 500,000원 − 수수료 5%',
      status: '지급 처리 중',
    },
  ],
  cancelBox: {
    lines: [
      { k: '진행 중이던 구간 금액(중간 구간)', v: '1,000,000원' },
      { k: '보상 금액(의뢰인 사유 · 납품 전 → 50%)', v: '500,000원' },
      { k: '− 수수료 5%(지급이 확정된 보상 금액에만)', v: '− 25,000원' },
      { k: '받을 금액', v: '475,000원', tot: true },
    ],
  },
};

export type SumCell = { k: string; v: number | string; s: string; link?: boolean };

export type SettleSDemo = {
  mock: SettleSMock;
  one: boolean;
  indiv: boolean;
  oneName: string;
  sub: string;
  sum: SumCell[];
  cards: SettleSCard[];
};

export function resolveSettleSMock(raw: string | null, contract: string | null): SettleSMock {
  if (raw && (SETTLE_S_MOCKS as readonly string[]).includes(raw)) return raw as SettleSMock;
  if (contract) return '계약 하나만(?contract=:cid)';
  return '전체';
}

export function settleSDemoOf(mock: SettleSMock): SettleSDemo {
  if (mock === '계약 하나만(?contract=:cid)') {
    const card = doneDamso(false);
    return {
      mock,
      one: true,
      indiv: false,
      oneName: `${card.title} · 담소 키친`,
      sub: DEMO.sub,
      sum: [
        { k: '받은 금액', v: 1_900_000, s: '중간 · 최종 구간 · 수수료 뺀 금액' },
        { k: '받을 예정', v: 0, s: '계약 완료' },
        { k: '낸 수수료', v: 100_000, s: '지급이 확정된 금액의 5%' },
        { k: DEMO.bizLabel, v: DEMO.bizValue, s: DEMO.bizSub, link: true },
      ],
      cards: [{ ...card, group: undefined }],
    };
  }
  if (mock === '취소된 계약 예시') {
    return {
      mock,
      one: false,
      indiv: false,
      oneName: '',
      sub: DEMO.sub,
      sum: [
        { k: '받은 금액', v: 4_892_500, s: '최근 계약 3건 · 이전 계약 10건 제외' },
        { k: '받을 예정', v: 1_947_500, s: '온도 다이닝 최종 구간 + 취소 보상 475,000원' },
        { k: '낸 수수료', v: 282_500, s: '지급이 확정된 금액의 5%' },
        { k: DEMO.bizLabel, v: DEMO.bizValue, s: DEMO.bizSub, link: true },
      ],
      cards: [CANCELLED, bizCard(false), { ...doneDamso(false), group: '끝난 계약' }, LAPSED, doneCake(false)],
    };
  }
  if (mock === '개인 공급자 예시') {
    return {
      mock,
      one: false,
      indiv: true,
      oneName: '',
      sub: DEMO.subIndiv,
      sum: [
        { k: '받은 금액', v: 4_722_550, s: '최근 계약 3건 · 수수료 · 원천징수 뺀 금액' },
        { k: '받을 예정', v: 1_421_350, s: '온도 다이닝 최종 구간' },
        { k: '낸 수수료', v: 257_500, s: '지급이 확정된 금액의 5%' },
        { k: '원천징수 3.3%', v: 169_950, s: '구간 금액의 3.3% · 마자용이 지급 때 신고' },
      ],
      cards: [bizCard(true), { ...doneDamso(true), group: '끝난 계약' }, doneCake(true)],
    };
  }
  return {
    mock,
    one: false,
    indiv: false,
    oneName: '',
    sub: DEMO.sub,
    sum: [
      { k: '받은 금액', v: 4_892_500, s: '최근 계약 3건 · 이전 계약 10건 제외' },
      { k: '받을 예정', v: 1_472_500, s: '온도 다이닝 최종 구간 · 최종 승인 때' },
      { k: '낸 수수료', v: 257_500, s: '지급이 확정된 금액의 5%' },
      { k: DEMO.bizLabel, v: DEMO.bizValue, s: DEMO.bizSub, link: true },
    ],
    cards: [bizCard(false), { ...doneDamso(false), group: '끝난 계약' }, LAPSED, doneCake(false)],
  };
}

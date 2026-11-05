/* 공급자 납품 시연 — PRD F-13 · 11.3. 파일 첨부 없음. 받을 금액만. */

export const DELIVER_MOCKS = [
  '중간 납품',
  '제출함 · 검수 대기',
  '보완 요청',
  '최종 납품',
  '마감 지남',
  '정산 계좌 없음',
] as const;

export type DeliverMock = (typeof DELIVER_MOCKS)[number];

export const DEFAULT_CID = 'c-ondo';
export const LIST_HREF = '/s/contracts';
export const ACCOUNT_HREF = '/s/account';
export const CHAT_HREF = '/s/chat/p-ondo';
export const contractHref = (cid = DEFAULT_CID) => `/s/contracts/${cid}`;

export function resolveDeliverMock(raw: string | null): DeliverMock {
  if (raw && (DELIVER_MOCKS as readonly string[]).includes(raw)) return raw as DeliverMock;
  return '중간 납품';
}

export type CondRow = { q: string; a: string; unset?: boolean };

export type FeatureItem = {
  id: string;
  name: string;
  desc: string;
  conds: CondRow[];
  status: 'pre' | 'rev' | 'ok' | 'fix';
  statusLabel: string;
  link: string;
  memo: string;
  fix?: { tags: string[]; when: string; quote: string; note: string };
  okNote?: string;
  revNote?: string;
};

export type DeliverDemo = {
  mock: DeliverMock;
  stage: '중간' | '최종';
  status: string;
  statusLabel: string;
  deadlineAt: string;
  deadlineNow: string;
  deadlineActionable: boolean;
  band: null | { tone: 'warn' | 'wait'; title: string; body: string; account?: boolean; chat?: boolean };
  showPaid: boolean;
  items: FeatureItem[];
  submitLabel: string;
  submitNote: string;
  submitted: boolean;
  noAccount: boolean;
  disabledReason?: string;
  payTitle: string;
  stageGross: number;
  fee: number;
  net: number;
  payNote: string;
};

export const DEMO = {
  pageTitle: '납품',
  crumbContracts: '내 계약',
  crumbContract: '온도 다이닝',
  sub: '계약서에 붙은 기능과 조건이 검수 기준입니다. 결과물 링크와 설명을 적고 구간 단위로 제출하세요.',
  whoName: '정민재 · 온도 다이닝',
  whoRole: '의뢰인',
  agreed: 3_100_000,
  ratio: '중간 50 : 최종 50',
  stageGross: 1_550_000,
  fee: 77_500,
  net: 1_472_500,
  workDays: 42,
  deadlineAt: '2026-12-16',
  inspectDeadline: '12월 2일',
  accountCta: '계좌 등록하기',
  chatCta: '채팅으로 일정 정하기',
  settleLabel: '정산 내역',
  settleHref: '/s/settlements?contract=c-ondo',
  submitPrimary: '납품 제출',
} as const;

const C = (q: string, a: string, unset?: boolean): CondRow => ({ q, a, unset });

const CAL: Omit<FeatureItem, 'status' | 'statusLabel'> = {
  id: 'cal',
  name: '예약 달력',
  desc: '회차별로 예약받고 정원이 차면 마감',
  conds: [
    C('회차 구성', '점심 1회 · 저녁 2회, 회차마다 정원 10석'),
    C('예약 가능 기간', '방문 30일 전부터 전날 18시까지'),
  ],
  link: 'https://test.ondo-dining.kr/admin/slots',
  memo: '관리 화면 › 예약 설정에서 회차와 정원을 바꾼 뒤, 손님 화면에서 정원이 차면 마감되는지 확인해 주세요.',
};

const DEP: Omit<FeatureItem, 'status' | 'statusLabel'> = {
  id: 'dep',
  name: '예약금 결제',
  desc: '예약할 때 예약금을 받고 환불 규정 안내',
  conds: [
    C('예약금 금액', '1인당 30,000원 정액, 관리 화면에서 바꿀 수 있게'),
    C('환불 기준', '회차마다 정한 마감 시각 전에 취소하면 전액 환불, 그 뒤에는 환불 없음'),
  ],
  link: 'https://test.ondo-dining.kr/reserve',
  memo: '',
};

const NOS: Omit<FeatureItem, 'status' | 'statusLabel'> = {
  id: 'nos',
  name: '노쇼 기록',
  desc: '노쇼 손님을 기록해 다음 예약 때 표시',
  conds: [
    C('노쇼 판정 기준', '예약 시각 30분이 지나도 연락이 없으면 노쇼'),
    C('표시 방식', '기능 설명대로 동작하는지만 봅니다', true),
  ],
  link: 'https://test.ondo-dining.kr/admin/noshow',
  memo: '',
};

const REM: Omit<FeatureItem, 'status' | 'statusLabel'> = {
  id: 'rem',
  name: '리마인드 알림',
  desc: '예약 전날 손님에게 안내 자동 발송',
  conds: [C('발송 시점', '방문 전날 18:00'), C('발송 수단', '카카오 알림톡, 실패하면 문자')],
  link: '',
  memo: '',
};

function mk(
  base: Omit<FeatureItem, 'status' | 'statusLabel'>,
  status: FeatureItem['status'],
  extra: Partial<FeatureItem> = {},
): FeatureItem {
  const labels = { pre: '제출 전', rev: '검수 중', ok: '승인', fix: '보완 요청' } as const;
  return { ...base, status, statusLabel: labels[status], ...extra };
}

export function deliverDemoOf(mock: DeliverMock): DeliverDemo {
  const late = mock === '마감 지남';
  const noAccount = mock === '정산 계좌 없음';
  const fix = mock === '보완 요청';
  const fin = mock === '최종 납품' || late;
  const sub = mock === '제출함 · 검수 대기';
  const stage: '중간' | '최종' = fin ? '최종' : '중간';

  let items: FeatureItem[];
  if (fin) {
    items = [mk(NOS, 'pre'), mk(REM, 'pre')];
  } else if (sub) {
    items = [
      mk(CAL, 'rev', {
        revNote: '11월 25일 제출 · 의뢰인 검수 기한 12월 2일 · 지나면 자동 승인되고 지급됩니다',
      }),
      mk(DEP, 'rev', {
        revNote: '11월 25일 제출 · 의뢰인 검수 기한 12월 2일 · 지나면 자동 승인되고 지급됩니다',
      }),
    ];
  } else if (fix) {
    items = [
      mk(CAL, 'ok', { okNote: '11월 25일 승인 · 다시 검수하지 않습니다' }),
      mk(DEP, 'fix', {
        memo:
          '저녁 2부(마감 17:00) 예약을 만든 뒤 17:01 이후 취소해 보세요. 환불 버튼 대신 “환불 기간이 지났습니다”가 보입니다.',
        fix: {
          tags: ['조건과 다름', '환불 기준'],
          when: '11월 25일 · 1회째',
          quote:
            '“저녁 2부 회차는 마감 시각이 지나도 환불 버튼이 보여요. 회차마다 정한 마감 시각 이후에는 환불이 안 되게 해 주세요.” — 정민재',
          note: '이 항목만 고쳐 다시 제출하면 됩니다. 같은 구간의 예약 달력은 이미 승인되어 다시 검수하지 않습니다.',
        },
      }),
    ];
  } else {
    /* 중간 납품 · 정산 계좌 없음 — 작성 폼 */
    items = [mk(CAL, 'pre'), mk(DEP, 'pre')];
  }

  let status = '진행 중';
  let statusLabel = '중간 구간 작성 중';
  if (sub) {
    status = '검수 대기';
    statusLabel = '검수 대기';
  } else if (late) {
    status = '마감 지남';
    statusLabel = '마감 지남 · 최종 미제출';
  } else if (fin) {
    status = '작업 중';
    statusLabel = '최종 구간 작성 중';
  } else if (fix) {
    status = '검수 대기';
    statusLabel = '보완 요청 1건';
  } else if (noAccount) {
    status = '진행 중';
    statusLabel = '중간 구간 작성 중';
  }

  let band: DeliverDemo['band'] = null;
  if (late) {
    band = {
      tone: 'warn',
      title: '작업 마감(12월 16일)이 지났습니다',
      body: '납품하거나 의뢰인과 채팅으로 일정을 정하세요 · 의뢰인이 공급자 사정으로 취소를 요청할 수 있습니다.',
      chat: true,
    };
  } else if (noAccount) {
    band = {
      tone: 'warn',
      title: '지급받을 계좌가 없습니다',
      body: '승인되어도 계좌를 등록해야 지급됩니다 · 계정 설정 › 정산 정보에서 등록하세요.',
      account: true,
    };
  } else if (sub) {
    band = {
      tone: 'wait',
      title: '납품을 제출했습니다 · 의뢰인 검수 대기',
      body: `11월 25일 제출 · 검수 기한 ${DEMO.inspectDeadline} · 지나면 자동 승인되고 지급됩니다. 검수가 끝나기 전에는 고칠 수 없습니다.`,
    };
  } else if (fix) {
    band = {
      tone: 'warn',
      title: '보완 요청이 있습니다',
      body: '의뢰인이 적은 항목과 사유를 확인하고 그 항목만 다시 제출해 주세요.',
    };
  }

  let submitLabel = '납품 제출';
  if (sub) submitLabel = '검수 기다리는 중';
  else if (fix) submitLabel = '다시 제출';
  else if (fin) submitLabel = '납품 제출';

  let submitNote =
    '예약 달력과 예약금 결제를 함께 제출합니다. 제출하면 의뢰인 ‘내 계약’에 검수 대기로 표시됩니다.';
  if (sub) {
    submitNote =
      '11월 25일 제출했습니다. 의뢰인 검수 기한 12월 2일 · 지나면 자동 승인되고 지급됩니다.';
  } else if (late) {
    submitNote =
      '마감이 지났어도 지금 제출할 수 있습니다. 제출하면 검수 기한은 제출일부터 7일입니다.';
  } else if (fin) {
    submitNote =
      '노쇼 기록과 리마인드 알림을 함께 제출합니다. 제출하면 의뢰인 ‘내 계약’에 검수 대기로 표시됩니다.';
  } else if (fix) {
    submitNote = '예약금 결제만 다시 제출합니다. 승인되면 중간 구간 금액이 지급됩니다.';
  } else if (noAccount) {
    submitNote = '정산 계좌를 등록한 뒤 납품을 제출할 수 있습니다.';
  }

  return {
    mock,
    stage,
    status,
    statusLabel,
    deadlineAt: DEMO.deadlineAt,
    deadlineNow: late ? '2026-12-18' : fin ? '2026-11-28' : fix || sub ? '2026-11-25' : '2026-11-16',
    deadlineActionable: false,
    band,
    showPaid: fin && !late,
    items,
    submitLabel,
    submitNote,
    submitted: sub,
    noAccount,
    disabledReason: noAccount
      ? '정산 계좌를 등록해야 납품을 제출할 수 있습니다'
      : sub
        ? '검수가 끝나기 전에는 고칠 수 없습니다'
        : undefined,
    payTitle: fin ? '최종 구간 지급 예정' : '이번 구간 지급 예정',
    stageGross: DEMO.stageGross,
    fee: DEMO.fee,
    net: DEMO.net,
    payNote: noAccount
      ? '두 항목이 모두 승인되면 지급되지만, 정산 계좌가 등록되어 있어야 보낼 수 있습니다.'
      : fin
        ? '노쇼 기록과 리마인드 알림이 모두 승인되면 지급되고, 계약이 완료됩니다.'
        : '예약 달력과 예약금 결제가 모두 승인되면 지급됩니다. 한 항목만 승인되어서는 지급되지 않습니다.',
  };
}

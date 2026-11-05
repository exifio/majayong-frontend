/* 공급자 계약 · 전자서명 시연 — PRD F-12 · 7.2.
 * 금액은 공급자 관점(받을 금액). 의뢰인 예치액 · 결제 정보 없음. */

export const CONTRACT_S_MOCKS = [
  '상대가 먼저 서명',
  '아무도 서명 전',
  '내가 먼저 서명',
  '양쪽 서명 완료',
  '서명 거절 확인',
  '결렬 — 기한 초과',
] as const;

export type ContractSMock = (typeof CONTRACT_S_MOCKS)[number];

export const DEFAULT_CID = 'c-ondo';
export const LIST_HREF = '/s/contracts';
export const APPS_HREF = '/s/applications';

export function resolveContractSMock(raw: string | null): ContractSMock {
  if (raw && (CONTRACT_S_MOCKS as readonly string[]).includes(raw)) return raw as ContractSMock;
  return '상대가 먼저 서명';
}

export const DEMO = {
  title: '예약 달력, 예약금 결제 외 2개 기능',
  pageTitle: '계약서',
  lead: '의뢰인 정민재(온도 다이닝) · 공급자 최준호 · 2026년 11월 3일 최종 합의 내용으로 작성',
  signAt: '2026-11-10',
  agreed: 3_100_000,
  fee: 155_000,
  net: 2_945_000,
  stageNet: 1_472_500,
  midLabel: '중간 · 예약 달력, 예약금 결제',
  finLabel: '최종 · 노쇼 기록, 리마인드 알림',
  payRatio: '지급 비율 50 : 50',
  payNote: '구간이 승인되면 수수료 5%를 뺀 금액이 지급됩니다.',
  moneyTitle: '받을 금액',
  feeLabel: '공급자 수수료 5%',
  netLabel: '실제 받는 금액',
  payNoteBoard: '최종 합의 내용에서 정한 비율과 구간입니다.',
  specHead: '최종 합의 내용 · 기능 4건 · 조건 8건(정하지 않음 1건) · 지급 구간 · 비율 50 : 50',
  agreeLabel: '계약 본문과 첨부된 최종 합의 내용을 모두 확인했습니다.',
  rejectTail:
    '조건에 동의하지 않으면 서명을 거절하실 수 있습니다. 거절하면 바로 결렬되고 이 지원은 거절로 남습니다.',
  rejectLabel: '서명 거절',
  download: '계약서 내려받기',
  broker:
    '마자용은 통신판매중개자로서 거래 당사자가 아니며, 의뢰인과 공급자 사이 계약의 이행 책임은 각 당사자에게 있습니다. 대금 예치와 정산은 마자용이 관리합니다.',
  doneBandTitle: '계약이 체결되었습니다 · 의뢰인 예치를 기다리는 중',
  doneBandBody:
    '의뢰인은 3일 안(11월 7일까지)에 예치해야 하고, 없으면 자동 결렬됩니다. 예치 다음 날부터 작업 기간 42일이 시작됩니다. 이제 채팅에서 연락처를 주고받을 수 있습니다.',
  listCta: '내 계약으로',
  waitText:
    '서명했습니다. 정민재님이 11월 10일까지 서명하면 계약이 체결됩니다. 대금이 예치되면 작업을 시작합니다.',
  signDeadlineHint: '기한까지 두 분이 모두 서명하지 않으면 임시 계약은 결렬됩니다.',
  brokeTitle: '임시 계약이 결렬되었습니다 · 서명 기한이 지났습니다',
  brokeBody:
    '11월 10일까지 두 분 모두 서명하지 않아 결렬되었습니다. 이 지원은 거절로 처리되었고, 정민재님과의 채팅은 읽기 전용입니다. 아래 계약서는 기록으로만 남습니다.',
  appsCta: '내 지원 보기',
  rejectDialogTitle: '서명을 거절할까요?',
  rejectConfirm: '서명 거절',
  rejectReasonLabel: '거절 사유 (선택 · 의뢰인에게 전달됩니다)',
  rejectReasonPh: '예: 작업 기간이 맞지 않습니다',
  rejectBullets: [
    '거절하면 임시 계약은 바로 결렬됩니다.',
    '이 지원은 거절로 남고, 의뢰인에게 결렬 알림이 갑니다.',
    '같은 프로젝트에 다시 지원할 수 없습니다.',
  ],
} as const;

export type CondRow = { q: string; a: string; unset?: boolean };
export type FeatureRow = { name: string; desc: string; conds: CondRow[] };
export type SpecGroup = { title: string; features: FeatureRow[] };

export const SPEC_GROUPS: SpecGroup[] = [
  {
    title: '중간 검수 · 2건',
    features: [
      {
        name: '예약 달력',
        desc: '회차별로 예약받고 정원이 차면 마감',
        conds: [
          { q: '회차 구성', a: '점심 1회 · 저녁 2회, 회차마다 정원 10석' },
          { q: '예약 가능 기간', a: '방문 30일 전부터 전날 18시까지' },
        ],
      },
      {
        name: '예약금 결제',
        desc: '예약할 때 예약금을 받고 환불 규정 안내',
        conds: [
          { q: '예약금 금액', a: '1인당 30,000원 정액, 관리 화면에서 바꿀 수 있게' },
          { q: '환불 기준', a: '회차마다 정한 마감 시각 전에 취소하면 전액 환불, 그 뒤에는 환불 없음' },
        ],
      },
    ],
  },
  {
    title: '최종 검수 · 2건',
    features: [
      {
        name: '노쇼 기록',
        desc: '노쇼 손님을 기록해 다음 예약 때 표시',
        conds: [
          { q: '노쇼 판정 기준', a: '예약 시각 30분이 지나도 연락이 없으면 노쇼' },
          { q: '표시 방식', a: '정하지 않음 — 기능 설명대로 동작하는지만 봅니다', unset: true },
        ],
      },
      {
        name: '리마인드 알림',
        desc: '예약 전날 손님에게 안내 자동 발송',
        conds: [
          { q: '발송 시점', a: '방문 전날 18:00' },
          { q: '발송 수단', a: '카카오 알림톡, 실패하면 문자' },
        ],
      },
    ],
  },
];

export const ARTICLES: { title: string; body: string }[] = [
  {
    title: '제1조 (목적과 범위)',
    body: '공급자는 첨부된 최종 합의 내용의 기능 4건을 만들어 납품하고, 의뢰인은 그 대가를 지급한다. 최종 합의 내용은 납품 항목과 각 항목의 합의 조건을 정하고, 금액 · 지급 · 기간 · 취소는 이 본문이 정한다.',
  },
  {
    title: '제2조 (대금과 지급)',
    body: '합의 금액은 3,100,000원이다. 중간 구간에 담긴 항목이 모두 승인되면 50%, 최종 구간의 항목이 모두 승인되면 나머지를 지급하며, 공급자 수수료 5%는 지급할 때 뺀다.',
  },
  {
    title: '제3조 (기간)',
    body: '작업 기간은 예치 다음 날부터 42일이다.',
  },
  {
    title: '제4조 (검수)',
    body: "의뢰인은 납품물을 최종 합의 내용의 항목 단위로 승인하거나 보완을 요청한다. 최종 합의 내용에 '정하지 않음'으로 적힌 조건은 검수 기준이 되지 않고, 그 항목은 기능 설명에 맞게 동작하는지만 본다.",
  },
  {
    title: '제5조 (범위)',
    body: '서명한 뒤에는 범위를 바꾸지 않는다. 더 필요한 기능은 새 프로젝트로 맡긴다.',
  },
  {
    title: '제6조 (취소와 정산)',
    body: '예치 뒤 취소는 사유에 따라 정산한다. 수수료는 공급자에게 지급이 확정된 금액에만 부과한다.',
  },
  {
    title: '제7조 (결과물과 유지보수)',
    body: '결과물의 소유권은 최종 지급과 함께 의뢰인에게 넘어간다. 납품 뒤 유지보수와 서버 비용은 이 계약에 포함하지 않는다.',
  },
  {
    title: '제8조 (플랫폼의 지위)',
    body: '마자용은 이 계약의 당사자가 아닌 중개자이며, 대금의 보관과 지급 처리만 맡는다.',
  },
];

export type PartySign = {
  name: string;
  role: string;
  initial: string;
  chip: string;
  tone: 'amber' | 'teal' | 'outline';
  at: string;
};

export type ContractSDemo = {
  mock: ContractSMock;
  status: string;
  statusLabel: string;
  client: PartySign;
  supplier: PartySign;
  canSign: boolean;
  waiting: boolean;
  bothSigned: boolean;
  broke: boolean;
  rejectOpen: boolean;
  showSignDeadline: boolean;
  signActionable: boolean;
  brokeWhy: string;
  brokeText: string;
};

function party(
  name: string,
  role: string,
  initial: string,
  signed: boolean,
  at: string,
  override?: Partial<PartySign>,
): PartySign {
  if (override) {
    return { name, role, initial, chip: '대기 중', tone: 'amber', at: '', ...override };
  }
  return signed
    ? { name, role, initial, chip: '서명 완료', tone: 'teal', at }
    : { name, role, initial, chip: '대기 중', tone: 'amber', at: '' };
}

export function contractSDemoOf(mock: ContractSMock): ContractSDemo {
  const rejectOpen = mock === '서명 거절 확인';
  const expired = mock === '결렬 — 기한 초과';
  const broke = expired;
  /* 공급자 기준: 상대 = 의뢰인 */
  let cli = false;
  let sup = false;
  if (mock === '상대가 먼저 서명' || rejectOpen) cli = true;
  if (mock === '내가 먼저 서명') sup = true;
  if (mock === '양쪽 서명 완료') {
    cli = true;
    sup = true;
  }

  const both = cli && sup;
  const canSign = !sup && !broke;
  const waiting = sup && !both && !broke;

  let status = '서명 대기';
  let statusLabel = '임시 계약 · 서명 대기';
  if (broke) {
    status = '결렬';
    statusLabel = '결렬';
  } else if (waiting) {
    status = '서명 대기';
    statusLabel = '임시 계약 · 상대 서명 대기';
  } else if (both) {
    status = '예치 대기';
    statusLabel = '계약 체결 · 의뢰인 예치 대기';
  }

  let supplier = party('최준호', '공급자', '최', sup, ' · 11월 4일 15:20');
  let client = party('정민재', '의뢰인', '민', cli, ' · 11월 4일 16:05');
  if (expired) {
    supplier = party('최준호', '공급자', '최', false, '', {
      chip: '서명 안 함',
      tone: 'outline',
      at: '',
    });
    client = party('정민재', '의뢰인', '민', false, '', {
      chip: '서명 안 함',
      tone: 'outline',
      at: '',
    });
  }

  return {
    mock,
    status,
    statusLabel,
    client,
    supplier,
    canSign,
    waiting,
    bothSigned: both,
    broke,
    rejectOpen,
    showSignDeadline: !both && !broke,
    signActionable: canSign,
    brokeWhy: '서명 기한이 지났습니다',
    brokeText: '11월 10일까지 두 분의 서명이 모두 끝나지 않아 임시 계약이 결렬되었습니다.',
  };
}

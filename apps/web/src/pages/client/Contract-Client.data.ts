/* 계약 · 전자서명 시연 데이터 — PRD 9.6 · F-12 · F-10 · 7.2. 화면에서 계산하지 않는다. */

export const CONTRACT_MOCKS = [
  '상대가 먼저 서명',
  '아무도 서명 전',
  '내가 먼저 서명',
  '양쪽 서명 완료',
  '결렬 — 공급자 서명 거절',
  '결렬 — 기한 초과',
  '임시 계약 취소 확인',
] as const;

export type ContractMock = (typeof CONTRACT_MOCKS)[number];

export const DEFAULT_CID = 'c-ondo';
export const LIST_HREF = '/c/contracts';
export const COMPARE_HREF = '/c/projects/p-ondo/proposals';
export const ESCROW_HREF = `/c/contracts/${DEFAULT_CID}/escrow`;

export function resolveContractMock(raw: string | null): ContractMock {
  if (raw && (CONTRACT_MOCKS as readonly string[]).includes(raw)) return raw as ContractMock;
  return '상대가 먼저 서명';
}

export function escrowHref(cid = DEFAULT_CID) {
  return `/c/contracts/${cid}/escrow`;
}

export function compareHref() {
  return COMPARE_HREF;
}

/** 서명 기한 · 예치 기한 — ISO. Deadline/표시용 */
export const DEMO = {
  title: '예약 달력, 예약금 결제 외 2개 기능',
  pageTitle: '계약서',
  lead: '의뢰인 정민재(온도 다이닝) · 공급자 최준호 · 2026년 11월 3일 최종 합의 내용으로 작성',
  signAt: '2026-11-10',
  escrowAt: '2026-11-07T23:59:00+09:00',
  agreed: 3_100_000,
  fee: 155_000,
  escrow: 3_255_000,
  stage: 1_550_000,
  midLabel: '중간 · 예약 달력, 예약금 결제',
  finLabel: '최종 · 노쇼 기록, 리마인드 알림',
  payRatio: '지급 비율 50 : 50',
  payNote: '최종 합의 내용에서 정한 비율과 구간입니다.',
  specHead: '최종 합의 내용 · 기능 4건 · 조건 8건(정하지 않음 1건) · 지급 구간 · 비율 50 : 50',
  agreeLabel: '계약 본문과 첨부된 최종 합의 내용을 모두 확인했습니다.',
  cancelTail:
    '서명 기한 전에 임시 계약을 취소할 수 있습니다. 취소하면 결렬로 처리되고, 제안 비교에서 보류한 지원 중 다시 고르실 수 있습니다.',
  cancelLabel: '임시 계약 취소',
  download: '계약서 내려받기',
  broker:
    '마자용은 통신판매중개자로서 거래 당사자가 아니며, 의뢰인과 공급자 사이 계약의 이행 책임은 각 당사자에게 있습니다. 대금 예치와 정산은 마자용이 관리합니다.',
  escrowBandTitle: '계약이 체결되었습니다 · 예치해 주세요',
  escrowBandBody: '11월 7일 23:59까지 예치 · 지나면 자동 결렬됩니다. 예치 다음 날부터 작업 기간 42일이 시작됩니다.',
  escrowCta: '예치하기',
  compareCta: '제안 비교로 돌아가기',
  waitText: '서명했습니다. 최준호님이 11월 10일까지 서명하면 계약이 체결되고 대금을 예치할 수 있습니다.',
  signDeadlineHint: '기한까지 두 분이 모두 서명하지 않으면 임시 계약은 결렬됩니다.',
  cancelDialogTitle: '임시 계약을 취소할까요?',
  cancelConfirm: '임시 계약 취소',
  cancelReasonLabel: '취소 사유 (선택 · 공급자에게 보이지 않습니다)',
  cancelReasonPh: '예: 예산을 다시 검토하려고 합니다',
  cancelBullets: [
    '결렬과 같이 처리되고, 최준호님의 지원은 거절로 바뀝니다. 최준호님에게 결렬 알림이 갑니다.',
    '제안 비교로 돌아가 보류했던 지원자 중에서 다시 고르실 수 있습니다.',
    "같은 공급자와 다시 하려면 최준호님이 재견적을 낸 뒤 다시 '이 사람과 계약하기'를 진행해야 합니다.",
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
    body: '공급자는 첨부된 최종 합의 내용의 기능 4건을 만들어 납품하고, 의뢰인은 그 대가를 지급한다. 최종 합의 내용은 납품 항목과 각 항목의 합의 조건을 정하고, 금액 · 지급 · 기간 · 취소는 이 본문이 정한다. 본문과 최종 합의 내용이 다르면 본문을 따른다.',
  },
  {
    title: '제2조 (대금과 지급)',
    body: '합의 금액은 3,100,000원이다. 의뢰인은 수수료 5%를 더한 3,255,000원을 서명 뒤 마자용에 예치한다. 중간 구간에 담긴 항목이 모두 승인되면 50%, 최종 구간의 항목이 모두 승인되면 나머지를 지급하며, 원 단위 끝수는 최종 지급에 더한다. 공급자 수수료 5%는 지급할 때 뺀다.',
  },
  {
    title: '제3조 (기간)',
    body: '작업 기간은 예치 다음 날부터 42일이다.',
  },
  {
    title: '제4조 (검수)',
    body: "의뢰인은 납품물을 최종 합의 내용의 항목 단위로 승인하거나 보완을 요청한다. 각 항목에 적힌 합의 조건이 그 항목의 검수 기준이 되며, 최종 합의 내용에 없는 기능은 검수하지 않는다. 최종 합의 내용에 '정하지 않음'으로 적힌 조건은 검수 기준이 되지 않고, 그 항목은 기능 설명에 맞게 동작하는지만 본다.",
  },
  {
    title: '제5조 (범위)',
    body: '서명한 뒤에는 범위를 바꾸지 않는다. 더 필요한 기능은 새 프로젝트로 맡긴다.',
  },
  {
    title: '제6조 (취소와 정산)',
    body: '예치 뒤 취소는 사유에 따라 정산한다. 의뢰인 사유이면 예치 후 24시간 안에 납품이 없을 때 전액 환불하고, 그 뒤에는 진행 중인 구간 금액의 50% 이상을 공급자에게 지급한다. 공급자 사유이면 지급되지 않은 구간을 전액 환불한다. 수수료는 공급자에게 지급이 확정된 금액에만 부과한다.',
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

export type ContractDemo = {
  mock: ContractMock;
  /** 헤더 StatusChip용 — chipToneOf에 있는 짧은 이름 */
  status: string;
  /** 복합 표시 문구(보드 칩) */
  statusLabel: string;
  client: PartySign;
  supplier: PartySign;
  canSign: boolean;
  waiting: boolean;
  bothSigned: boolean;
  broke: boolean;
  cancelOpen: boolean;
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

export function contractDemoOf(mock: ContractMock): ContractDemo {
  const refused = mock === '결렬 — 공급자 서명 거절';
  const expired = mock === '결렬 — 기한 초과';
  const broke = refused || expired;
  const cancelOpen = mock === '임시 계약 취소 확인';

  let cli = false;
  let sup = false;
  if (mock === '상대가 먼저 서명' || cancelOpen) sup = true;
  if (mock === '내가 먼저 서명') cli = true;
  if (mock === '양쪽 서명 완료') {
    cli = true;
    sup = true;
  }

  const both = cli && sup;
  const canSign = !cli && !broke;
  const waiting = cli && !both && !broke;

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
    statusLabel = '계약 체결 · 예치 대기';
  }

  let supplier = party('최준호', '공급자', '최', sup, ' · 11월 4일 11:20');
  let client = party('정민재', '의뢰인', '민', cli, ' · 11월 4일 13:05');
  if (refused) {
    supplier = party('최준호', '공급자', '최', false, '', {
      chip: '서명 거절',
      tone: 'outline',
      at: ' · 11월 5일 10:40',
    });
    client = party('정민재', '의뢰인', '민', false, '', { chip: '대기 중', tone: 'outline', at: '' });
  } else if (expired) {
    supplier = party('최준호', '공급자', '최', false, '', { chip: '서명 안 함', tone: 'outline', at: '' });
    client = party('정민재', '의뢰인', '민', false, '', { chip: '서명 안 함', tone: 'outline', at: '' });
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
    cancelOpen,
    showSignDeadline: !both && !broke,
    signActionable: canSign,
    brokeWhy: refused ? '공급자가 서명을 거절했습니다' : '서명 기한이 지났습니다',
    brokeText: refused
      ? '11월 5일 최준호님이 계약서 서명을 거절해 임시 계약이 바로 결렬되었습니다.'
      : '11월 10일까지 두 분의 서명이 모두 끝나지 않아 임시 계약이 결렬되었습니다.',
  };
}

/* 제안 비교 시연 데이터 — 보드 Compare-Client.dc.html renderVals · PRD F-09 · 디자인 시스템 10.5
 * 판정(최저가·추천·예산 초과) 없음. 파란 버튼 없음. */
export const COMPARE_MOCKS = [
  '지원 3건',
  '지원 1건',
  '이전 명세 기준',
  '임시 계약 중',
  '결렬 후 선택 중',
  '지원 0건 · 마감',
  '거절 확인',
] as const;
export type CompareMock = (typeof COMPARE_MOCKS)[number];

export const MY_HREF = '/c/projects';
export const DEFAULT_PID = 'p-ondo';
export const CONTRACT_HREF = '/c/contracts/c-ondo';
export const FEE_RATE = 0.05;

export function resolveCompareMock(raw: string | null): CompareMock {
  if (raw && (COMPARE_MOCKS as readonly string[]).includes(raw)) return raw as CompareMock;
  return '지원 3건';
}

export function specHref(pid: string) {
  return `/c/projects/${pid}`;
}

export function extendHref(pid: string) {
  return `/c/projects/${pid}?mock=${encodeURIComponent('마감 연장')}`;
}

export function editSpecHref(pid: string) {
  return `/c/projects/${pid}?mock=${encodeURIComponent('명세 고치기 확인')}`;
}

export function chatHref(pid: string, sid: string) {
  return `/c/chat/${pid}/${sid}`;
}

export function profileHref(sid: string) {
  return `/c/suppliers/${sid}`;
}

export function withFee(amount: number) {
  return amount + Math.floor(amount * FEE_RATE);
}

export type SupplierBase = {
  sid: string;
  ini: string;
  name: string;
  career: string;
  rating: number | null;
  reviews: number;
  applied: string;
  amount: number;
  chg: string;
  unread: number;
  questions: number;
  summary: string;
  linkCount: number;
};

export type CardMode = 'act' | 'chosen' | 'locked';

export type CompareCard = SupplierBase & {
  hold: boolean;
  chip: string | null;
  chipTone: 'amber' | 'outline' | 'blue' | null;
  why: string;
  mode: CardMode;
  showQuestions: boolean;
};

export type CompareDemo = {
  title: string;
  nApp: number;
  viewsLabel: string;
  deadChip: string;
  stale: boolean;
  held: boolean;
  broke: boolean;
  zero: boolean;
  openReject: boolean;
  rejectName: string;
  rejectSid: string;
  cards: CompareCard[];
};

export const DEMO = {
  projectTitle: '예약 달력, 예약금 결제 외 2개 기능',
  viewsLabel: '5명이 열람했습니다',
  viewsCount: 5,
  staleTitle: '명세를 고쳐서, 지금 받은 견적으로는 계약할 수 없습니다',
  staleBody:
    '아래 견적은 고치기 전 명세를 보고 적은 것입니다. 공급자들에게 재견적을 요청했고, 새 견적이 들어오면 채팅에서 \'이 사람과 계약하기\'를 누를 수 있습니다. 채팅은 그대로 이어집니다.',
  heldTitle: '최준호님과 임시 계약 중입니다',
  heldBody: '11월 10일까지 두 분이 모두 서명하면 계약이 체결됩니다. 그동안 다른 지원은 거절되지 않고 보류됩니다.',
  heldWhy: '다른 공급자와 계약 진행 중(예치 전) · 결렬되면 다시 선택될 수 있습니다',
  staleWhy: '새 견적이 들어오면 계약할 수 있습니다',
  brokeTitle: '최준호님과의 임시 계약이 결렬되었습니다',
  brokeBodyPrefix:
    '서명 기한(11월 10일)까지 서명이 끝나지 않았습니다. 모집 마감일이 지나 보류했던 지원 ',
  zeroTitle: '모집이 11월 3일 마감되었는데 지원이 없습니다',
  zeroLead:
    '명세를 상세 열람한 공급자는 5명입니다. 마감을 늘려 더 기다리거나, 명세를 고쳐 다시 모집할 수 있습니다. 명세를 고치면 처음부터 다시 모집합니다.',
  zeroWhy: [
    { title: '희망 예산 구간', body: '400~500만원 — 비슷한 기능 수의 다른 프로젝트보다 낮지 않습니다.' },
    { title: '모집 기간', body: '7일이었습니다. 지원은 보통 등록 3~5일째에 몰립니다.' },
    { title: '기능 수', body: '4개입니다. 꼭 필요한 기능만 남기면 견적을 내기 쉬워집니다.' },
  ],
  after: [
    { lead: '카드는 ', bold: '지원한 순서', rest: '대로 놓입니다. 견적서에서 항목별 가능 여부와 작업 기간, 지원 메시지를 보실 수 있습니다.' },
    { lead: '카드의 ', bold: '질문', rest: '은 공급자가 견적과 함께 남긴 것입니다. 지원 전에는 채팅할 수 없어서입니다 — 견적서에서 보고 채팅으로 답해 주세요.' },
    { lead: '', bold: '문의하기 (채팅)', rest: '으로 공급자마다 따로 채팅할 수 있습니다. 계약 체결 전에는 연락처가 가려집니다.' },
    { lead: '조건은 ', bold: '채팅에서 모두 정합니다.', rest: ' 채팅에서 \'이 사람과 계약하기\'를 누르면 AI가 정리한 최종 합의 내용을 확인하고, 합의를 마치면 임시 계약이 되며 다른 지원은 보류됩니다.' },
    { lead: '두 분이 7일 안에 서명하면 계약이 체결되고, 대금이 예치되면 보류된 지원은 자동으로 거절됩니다.', bold: '', rest: '' },
  ],
  rejectPoints: [
    '거절하면 되돌릴 수 없습니다. 공급자에게 \'직접 거절\' 알림이 갑니다.',
    '해당 공급자와의 채팅은 읽기 전용이 됩니다.',
    '다른 지원은 그대로 남습니다.',
  ],
  rejectReasonHint: '거절 사유 (선택 · 공급자에게 보이지 않습니다)',
  rejectPlaceholder: '예: 예산과 차이가 큽니다',
};

const ALL: SupplierBase[] = [
  {
    sid: 's-junho',
    ini: '최',
    name: '최준호',
    career: '경력 5년',
    rating: 4.8,
    reviews: 12,
    applied: '10월 29일 지원',
    amount: 3_100_000,
    chg: '채팅에서 수정 · 처음 3,000,000원',
    unread: 1,
    questions: 2,
    summary:
      '소규모 식당 예약 사이트 12곳을 만들었습니다. 예약 달력과 PG 결제 연동 작업이 대부분이고, 가장 최근 작업은 회차제 코스 레스토랑의 예약 사이트입니다.',
    linkCount: 0,
  },
  {
    sid: 's-sera',
    ini: '김',
    name: '김세라',
    career: '경력 7년',
    rating: 4.6,
    reviews: 21,
    applied: '10월 30일 지원',
    amount: 4_400_000,
    chg: '',
    unread: 0,
    questions: 1,
    summary:
      '카페 · 베이커리 웹사이트와 예약 시스템 9건. 디자인부터 개발까지 혼자 맡고, 문자 알림 연동 사례가 여러 건 있습니다.',
    linkCount: 0,
  },
  {
    sid: 's-nut',
    ini: '넛',
    name: '스튜디오 넛',
    career: '제작사 · 경력 9년',
    rating: null,
    reviews: 0,
    applied: '11월 1일 지원',
    amount: 4_500_000,
    chg: '',
    unread: 0,
    questions: 0,
    summary: '',
    linkCount: 2,
  },
];

export function reviewsLabel(n: number) {
  return n === 0 ? '리뷰 없음' : `리뷰 ${n}건`;
}

export function compareDemoOf(mock: CompareMock): CompareDemo {
  const openReject = mock === '거절 확인';
  const view: CompareMock = openReject ? '지원 3건' : mock;
  const stale = view === '이전 명세 기준';
  const held = view === '임시 계약 중';
  const broke = view === '결렬 후 선택 중';
  const zero = view === '지원 0건 · 마감';

  let list: SupplierBase[] = ALL;
  if (view === '지원 1건') list = ALL.filter((p) => p.sid === 's-sera');
  if (broke) list = ALL.filter((p) => p.sid !== 's-junho');
  if (zero) list = [];

  const cards: CompareCard[] = list.map((p) => {
    const chosen = held && p.sid === 's-junho';
    const locked = (held && !chosen) || stale;
    let chip: string | null = null;
    let chipTone: CompareCard['chipTone'] = null;
    if (chosen) {
      chip = '임시 계약 · 서명 대기';
      chipTone = 'amber';
    } else if (held) {
      chip = '보류';
      chipTone = 'outline';
    } else if (stale) {
      chip = '이전 명세 기준';
      chipTone = 'outline';
    }
    const why = held && !chosen ? DEMO.heldWhy : stale ? DEMO.staleWhy : '';
    const mode: CardMode = chosen ? 'chosen' : locked ? 'locked' : 'act';
    return {
      ...p,
      hold: held && !chosen,
      chip,
      chipTone,
      why,
      mode,
      showQuestions: p.questions > 0 && !held,
    };
  });

  const n = cards.length;
  let deadChip = '마감 11월 3일 · 2일 남음';
  if (zero) deadChip = '모집 마감 · 11월 3일';
  else if (broke) deadChip = '선택 기간 · 11월 17일까지';
  else if (held) deadChip = '마감 11월 3일 · 임시 계약 중';

  return {
    title: n === 1 ? '받은 견적' : '제안 비교',
    nApp: n,
    viewsLabel: DEMO.viewsLabel,
    deadChip,
    stale,
    held,
    broke,
    zero,
    openReject,
    rejectName: '김세라',
    rejectSid: 's-sera',
    cards,
  };
}

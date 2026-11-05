/* 프로젝트 상세(상세 공개) 시연 — 보드 Project-Supplier · PRD 7.1 · F-05 · ㉜
 * AI 금액 · 블록 단가 · 추천 프로젝트 없음. */

export const PROJECT_MOCKS = ['지원 전', '지원함', '재견적 요청', '모집 마감'] as const;
export type ProjectMock = (typeof PROJECT_MOCKS)[number];

export const DEFAULT_PID = 'p-ondo';
export const FIND_HREF = '/s/projects';
export const CLIENT_HREF = '/s/clients/u-minjae';
export const QUOTE_HREF = '/s/projects/p-ondo/quote';
export const REQUOTE_HREF = `/s/projects/p-ondo/quote?mock=${encodeURIComponent('재견적')}`;
export const MY_QUOTE_HREF = '/s/applications/p-ondo';
export const CHAT_HREF = '/s/chat/p-ondo';

export type FeatureDemo = {
  no: number;
  name: string;
  desc: string;
  conditions: string[];
  memo?: string;
  change?: '설명 바뀜' | '새 항목';
};

export type WireKind = 'calendar' | 'pay' | 'admin';

const BASE_FEATURES: FeatureDemo[] = [
  {
    no: 1,
    name: '예약 달력',
    desc: '회차별로 예약받고 정원이 차면 마감',
    conditions: ['회차 구성', '예약 가능 기간'],
  },
  {
    no: 2,
    name: '예약금 결제',
    desc: '예약할 때 예약금을 받고 환불 규정 안내',
    conditions: ['예약금 금액', '환불 기준'],
    memo: '예약금은 1인 3만원 정도 생각 중',
  },
  {
    no: 3,
    name: '노쇼 기록',
    desc: '노쇼 손님을 기록해 다음 예약 때 표시',
    conditions: ['노쇼 판정 기준', '표시 방식'],
  },
  {
    no: 4,
    name: '리마인드 알림',
    desc: '예약 전날 손님에게 안내 자동 발송',
    conditions: ['발송 시점', '발송 수단'],
  },
];

const RE_FEATURES: FeatureDemo[] = [
  ...BASE_FEATURES.slice(0, 3),
  {
    no: 4,
    name: '리마인드 알림',
    desc: '예약 전날과 당일 3시간 전 손님에게 안내 자동 발송',
    conditions: ['발송 시점', '발송 수단'],
    change: '설명 바뀜',
  },
  {
    no: 5,
    name: '단골 표시',
    desc: '세 번 이상 방문한 손님을 예약 목록에 표시',
    conditions: ['단골 기준'],
    change: '새 항목',
  },
];

export const DEMO = {
  title: '예약 달력, 예약금 결제 외 2개 기능',
  industry: '음식점 · 코스 레스토랑',
  registered: '10월 27일 등록',
  reSubMore: ' · 11월 2일 명세 수정',
  deadlineOpen: '마감 11월 3일 · 2일 남음',
  deadlineClosed: '11월 3일 마감',
  hopeBudget: 5_000_000,
  hopeHint: '의뢰인이 적은 희망 예산입니다. 견적은 할 수 있는 항목과 총액 · 기간으로 냅니다.',
  deadlineMeta: '11월 3일',
  payTitle: '지급 구간 · 비율',
  payGuide:
    '중간 · 최종 두 구간으로 나눠 지급합니다. 어느 기능을 어느 구간에 넣을지와 비율도 채팅에서 정하고, 정하지 않으면 50 : 50 · 명세 순서대로 나뉩니다.',
  fnsLead: '공급자와 정할 것은 의뢰인이 문의 채팅을 열면 함께 정합니다',
  thumbsLead: '의뢰인이 초안을 고치며 만든 화면입니다 · 참고용',
  thumbsFoot: '디자인 지시가 아니라 기능을 이해하기 위한 그림입니다. 화면 구성은 채팅에서 의뢰인과 정하시면 됩니다.',
  thumbs: [
    { name: '예약 달력', cap: '날짜와 회차 고르기', kind: 'calendar' as WireKind },
    { name: '예약금 결제', cap: '금액 확인과 환불 안내', kind: 'pay' as WireKind },
    { name: '관리 화면', cap: '노쇼 기록과 알림 발송', kind: 'admin' as WireKind },
  ],
  askBefore:
    '지원 전에는 채팅할 수 없습니다 — 궁금한 점은 견적에 남기세요',
  askBeforeDetail:
    "상세 공개 범위에서는 지원 전 채팅이 없습니다. 견적의 '의뢰인에게 묻고 싶은 것'으로 남기면, 의뢰인이 문의 채팅을 열어 답합니다.",
  quoteCta: '견적 작성하기',
  quoteHint: '항목마다 할 수 있는지 고르고, 총액과 기간만 적습니다. 항목별 금액은 받지 않습니다.',
  myQuoteLabel: '내 견적 · 2회차',
  myQuoteAmt: 3_100_000,
  myQuoteMeta: '42일 · 할 수 있는 항목 4/4 · 11월 1일 채팅에서 수정',
  chatCta: '채팅 보기',
  myQuoteCta: '내 견적 보기',
  appliedHint: '견적은 채팅의 ‘견적 수정’으로 고칩니다. 새 회차가 되고 의뢰인에게 바로 보입니다.',
  reNoteTitle: '의뢰인이 명세를 고쳐 다시 견적을 요청했습니다',
  reNoteBody:
    '11월 2일 ‘리마인드 알림’ 설명이 바뀌고 ‘단골 표시’가 새로 더해졌습니다. 이전에 내신 견적은 ‘이전 명세 기준’이 되어 의뢰인이 고를 수 없습니다. 바뀐 명세로 다시 견적을 내 주세요.',
  requoteCta: '다시 견적하기',
  requoteHint: '새 견적을 내면 3회차가 되고 이전 견적은 ‘대체됨’으로 남습니다.',
  closedBandTitle: '모집이 마감되었습니다',
  closedBandBody:
    '11월 3일에 모집이 끝나 새 견적을 낼 수 없습니다. 북마크해 두셨다면 북마크 목록에 마감 표시로 남습니다.',
  closedCta: '견적 작성하기',
  closedReason: '모집이 마감되어 새 견적을 낼 수 없습니다.',
  client: {
    name: '정민재',
    initial: '민',
    business: '온도 다이닝',
    industry: '음식점 · 코스 레스토랑',
    address: '서울 마포구 와우산로 00길 00',
    website: 'ondo-dining.kr',
    websiteHref: 'https://ondo-dining.kr',
    intro: '마포에서 10석 코스 레스토랑을 운영합니다. 전화 예약을 줄이고 싶어요.',
  },
  noContact:
    '연락처는 받지 않습니다. 연락은 의뢰인이 문의 채팅을 열면 할 수 있고, 연락처는 계약 체결 뒤에 주고받습니다.',
  afterTitle: '알아두실 것',
  after: [
    '공급자가 먼저 채팅을 걸 수는 없습니다. 견적을 내면 의뢰인이 문의해 옵니다.',
    '의뢰인이 고르면 7일 안에 서명해야 계약이 됩니다.',
    '계약 범위는 서명할 때 고정되고, 그 뒤에 늘어나지 않습니다.',
  ],
} as const;

export function resolveProjectMock(raw: string | null): ProjectMock {
  if (raw && (PROJECT_MOCKS as readonly string[]).includes(raw)) return raw as ProjectMock;
  return '지원 전';
}

export type ProjectDemo = {
  mock: ProjectMock;
  before: boolean;
  applied: boolean;
  re: boolean;
  closed: boolean;
  features: FeatureDemo[];
  statusChip: string;
  deadlineLabel: string;
  deadlineSoon: boolean;
  subMore: string;
  /** 시연 초기 북마크 */
  bookmarkDefault: boolean;
  /** 의뢰인이 문의를 열어 채팅 가능 */
  chatOpen: boolean;
};

export function projectDemoOf(mock: ProjectMock): ProjectDemo {
  const before = mock === '지원 전';
  const applied = mock === '지원함';
  const re = mock === '재견적 요청';
  const closed = mock === '모집 마감';
  return {
    mock,
    before,
    applied,
    re,
    closed,
    features: re ? RE_FEATURES : BASE_FEATURES,
    statusChip: closed ? '모집 마감' : '모집 중',
    deadlineLabel: closed ? DEMO.deadlineClosed : DEMO.deadlineOpen,
    deadlineSoon: !closed,
    subMore: re ? DEMO.reSubMore : '',
    bookmarkDefault: !before,
    chatOpen: applied,
  };
}

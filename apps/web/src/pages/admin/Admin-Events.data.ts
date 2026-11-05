/* 이벤트 기록 시연 — PRD F-27 · EventLog. */

export const EVENT_MOCKS = ['목록', '상세'] as const;
export type EventMock = (typeof EVENT_MOCKS)[number];

export type ActorKind = '운영자' | '시스템' | '의뢰인' | '공급자';

export type EventRow = {
  id: string;
  at: string; /* ISO */
  actor: string;
  actorKind: ActorKind;
  actorSub: string;
  kind: string;
  target: string;
  before: string;
  after: string;
  reasonLine: string;
  reasonFull: string;
  eventNo: string;
  actorAccount: string;
  kindFull: string;
  targetFull: string;
  beforeDetail: string;
  afterDetail: string;
  impacts: string[];
  relatedHref?: string;
  relatedLabel?: string;
  contractHref?: string;
  projectHref?: string;
};

export const DEMO = {
  title: '이벤트 기록',
  sub: '운영자 행위와 거래의 주요 사건을 시간순으로 봅니다. 병합 · 단가 수정 · 결제 확정 · 정산 처리 · 판정은 전후 값과 사유가 함께 남습니다.',
  note: '기록은 지우거나 고칠 수 없습니다. 계정 이메일 · 카드 번호 전체 같은 개인정보는 남기지 않고 끝자리만 남깁니다.',
  listLabel: '이벤트 목록',
  detailLabel: '이벤트 상세',
  periodLabel: '기간',
  kindLabel: '종류',
  actorLabel: '행위자',
  readonly: '기록은 지우거나 고칠 수 없습니다',
} as const;

export const PERIODS = ['최근 30일', '최근 7일', '전체'] as const;
export const KINDS = [
  '모든 종류',
  '판정',
  '구간 지급',
  '정산 처리',
  '결제 확정',
  '예치 완료',
  '결제 취소',
  '합의 완료',
  '블록 병합',
  '단가 수정',
  '비활성화',
  '견적 수정',
  '항목 승인',
] as const;

export const EVENTS: EventRow[] = [
  {
    id: 'evt-01',
    at: '2026-11-28T16:40:00+09:00',
    actor: '운영자 김하늘',
    actorKind: '운영자',
    actorSub: '운영',
    kind: '판정',
    target: '이견 · 누리 국수 × 이도윤 · 회차 예약',
    before: '검토 중',
    after: '승인이 맞다',
    reasonLine: '조건 줄 회차 구성(점심 1 · 저녁 2, 정원 12석)을 충족함',
    reasonFull: '조건 줄 회차 구성(점심 1 · 저녁 2, 정원 12석)을 충족함',
    eventNo: 'evt_20261128_1640_0001',
    actorAccount: '운영자 김하늘 · 운영 계정 ops-02',
    kindFull: '이견 판정(F-27)',
    targetFull: '이견 · 누리 국수 × 이도윤 · 회차 예약',
    beforeDetail: 'status: "검토 중"',
    afterDetail: 'status: "승인이 맞다"',
    impacts: ['양쪽 채팅과 내 계약에 판정이 기록됨'],
    relatedHref: '/admin/disputes',
    relatedLabel: '이견 개입에서 보기',
  },
  {
    id: 'evt-02',
    at: '2026-11-27T10:05:00+09:00',
    actor: '시스템',
    actorKind: '시스템',
    actorSub: '자동',
    kind: '구간 지급',
    target: '예약 달력, 예약금 결제 외 2개 기능 · 중간 구간',
    before: '예치 보관',
    after: '지급 1,550,000원',
    reasonLine: '의뢰인이 예약금 결제를 승인해 중간 항목이 모두 승인됨',
    reasonFull: '의뢰인이 예약금 결제를 승인해 중간 항목이 모두 승인됨',
    eventNo: 'evt_20261127_1005_0002',
    actorAccount: '시스템',
    kindFull: '구간 지급',
    targetFull: '예약 달력, 예약금 결제 외 2개 기능 · 중간 구간',
    beforeDetail: 'escrow: held',
    afterDetail: 'payout: 1,550,000',
    impacts: ['공급자 정산 내역에 지급 예정으로 표시'],
    contractHref: '/c/contracts/c-ondo',
    projectHref: '/c/projects/p-ondo',
  },
  {
    id: 'evt-03',
    at: '2026-11-27T10:04:00+09:00',
    actor: '의뢰인 정민재',
    actorKind: '의뢰인',
    actorSub: '온도 다이닝',
    kind: '항목 승인',
    target: '예약금 결제 · 2회째 납품',
    before: '보완 요청',
    after: '승인',
    reasonLine: '—',
    reasonFull: '—',
    eventNo: 'evt_20261127_1004_0003',
    actorAccount: '의뢰인 정민재',
    kindFull: '항목 승인',
    targetFull: '예약금 결제 · 2회째 납품',
    beforeDetail: 'status: "보완 요청"',
    afterDetail: 'status: "승인"',
    impacts: [],
    contractHref: '/c/contracts/c-ondo',
  },
  {
    id: 'evt-04',
    at: '2026-11-21T15:10:00+09:00',
    actor: '운영자 김하늘',
    actorKind: '운영자',
    actorSub: '운영',
    kind: '정산 처리',
    target: '취소 정산 · 소이 비스트로 × 윤재하',
    before: '처리 대기',
    after: '처리 완료',
    reasonLine: '환불 1,575,000원 · 지급 475,000원 — PG 관리자에서 처리',
    reasonFull: '환불 1,575,000원 · 지급 475,000원 — PG 관리자에서 처리',
    eventNo: 'evt_20261121_1510_0004',
    actorAccount: '운영자 김하늘 · 운영 계정 ops-02',
    kindFull: '취소 정산 처리',
    targetFull: '취소 정산 · 소이 비스트로 × 윤재하',
    beforeDetail: 'status: "처리 대기"',
    afterDetail: 'status: "처리 완료"',
    impacts: ['의뢰인 · 공급자 정산 내역이 완료로 바뀜'],
    relatedHref: '/admin/refunds',
    relatedLabel: '환불 처리에서 보기',
  },
  {
    id: 'evt-05',
    at: '2026-11-04T14:53:00+09:00',
    actor: '운영자 김하늘',
    actorKind: '운영자',
    actorSub: '운영',
    kind: '결제 확정',
    target: '예치 · 골목 파스타 × 한서진 · 2,100,000원',
    before: '보류',
    after: '예치 완료',
    reasonLine: '결제사 다시 조회 — 승인 · 금액 일치',
    reasonFull: '결제사 다시 조회 — 승인 · 금액 일치',
    eventNo: 'evt_20261104_1453_0005',
    actorAccount: '운영자 김하늘 · 운영 계정 ops-02',
    kindFull: '결제 보류 → 예치 완료 확정',
    targetFull: '예치 · 골목 파스타 × 한서진 · 2,100,000원',
    beforeDetail: 'status: "보류"',
    afterDetail: 'status: "예치 완료"',
    impacts: ['작업 기간이 시작됨'],
    relatedHref: '/admin/payments',
    relatedLabel: '보류된 결제에서 보기',
  },
  {
    id: 'evt-06',
    at: '2026-11-04T14:20:00+09:00',
    actor: '시스템',
    actorKind: '시스템',
    actorSub: '결제사 통지',
    kind: '예치 완료',
    target: '예약 달력, 예약금 결제 외 2개 기능 · 3,255,000원',
    before: '결제 요청',
    after: '예치 완료',
    reasonLine: '카드 · 결제 건 끝자리 4821',
    reasonFull: '카드 · 결제 건 끝자리 4821',
    eventNo: 'evt_20261104_1420_0006',
    actorAccount: '시스템',
    kindFull: '예치 완료',
    targetFull: '예약 달력, 예약금 결제 외 2개 기능 · 3,255,000원',
    beforeDetail: 'status: "결제 요청"',
    afterDetail: 'status: "예치 완료"',
    impacts: [],
    contractHref: '/c/contracts/c-ondo',
    projectHref: '/c/projects/p-ondo',
  },
  {
    id: 'evt-07',
    at: '2026-11-03T21:05:00+09:00',
    actor: '운영자 김하늘',
    actorKind: '운영자',
    actorSub: '운영',
    kind: '결제 취소',
    target: '예치 · 면옥 × 김세라 · 2,100,000원',
    before: '보류',
    after: '취소 · 다시 결제 요청',
    reasonLine: '결제사 통지 2,010,000원으로 금액 불일치',
    reasonFull: '결제사 통지 2,010,000원으로 금액 불일치',
    eventNo: 'evt_20261103_2105_0007',
    actorAccount: '운영자 김하늘 · 운영 계정 ops-02',
    kindFull: '결제 취소 · 다시 결제 요청',
    targetFull: '예치 · 면옥 × 김세라 · 2,100,000원',
    beforeDetail: 'status: "보류"',
    afterDetail: 'status: "취소 · 다시 결제 요청"',
    impacts: ['의뢰인 화면에 다시 결제하기가 보임'],
    relatedHref: '/admin/payments',
    relatedLabel: '보류된 결제에서 보기',
  },
  {
    id: 'evt-08',
    at: '2026-11-03T15:20:00+09:00',
    actor: '의뢰인 정민재',
    actorKind: '의뢰인',
    actorSub: '온도 다이닝',
    kind: '합의 완료',
    target: '최종 합의 내용 · 최준호',
    before: '문의 중',
    after: '임시 계약',
    reasonLine: '—',
    reasonFull: '—',
    eventNo: 'evt_20261103_1520_0008',
    actorAccount: '의뢰인 정민재',
    kindFull: '합의 완료',
    targetFull: '최종 합의 내용 · 최준호',
    beforeDetail: 'status: "문의 중"',
    afterDetail: 'status: "임시 계약"',
    impacts: [],
    contractHref: '/c/contracts/c-ondo',
    projectHref: '/c/projects/p-ondo',
  },
  {
    id: 'evt-09',
    at: '2026-11-02T10:20:00+09:00',
    actor: '운영자 김하늘',
    actorKind: '운영자',
    actorSub: '운영',
    kind: '블록 병합',
    target: '블록 · 노쇼 관리 → 노쇼 기록',
    before: '활성',
    after: '비활성(병합)',
    reasonLine: '기능 요약과 정할 것이 같고 이름만 다름',
    reasonFull: '기능 요약과 정할 것이 같고 이름만 다름',
    eventNo: 'evt_20261102_1020_0009',
    actorAccount: '운영자 김하늘 · 운영 계정 ops-02',
    kindFull: '블록 병합',
    targetFull: '블록 · 노쇼 관리 → 노쇼 기록',
    beforeDetail: 'status: "active"',
    afterDetail: 'status: "merged"',
    impacts: ['이후 매칭 · 추천에서 빠짐'],
    relatedHref: '/admin/blocks',
    relatedLabel: '블록 검토에서 보기',
  },
  {
    id: 'evt-10',
    at: '2026-11-02T10:05:00+09:00',
    actor: '운영자 김하늘',
    actorKind: '운영자',
    actorSub: '운영',
    kind: '단가 수정',
    target: '블록 · 주차 안내',
    before: '800,000원',
    after: '950,000원',
    reasonLine: '주차권 안내 문자 발송 연동이 근거에서 빠짐',
    reasonFull:
      '제휴 주차장 요금 계산과 주차권 안내 문자 발송이 근거에서 빠져 작업량이 적게 잡혔습니다. 발송 연동 1건(약 1일)을 더합니다.',
    eventNo: 'evt_20261102_1005_0041',
    actorAccount: '운영자 김하늘 · 운영 계정 ops-02',
    kindFull: '블록 단가 수정(㉑)',
    targetFull: '블록 · 주차 안내 · blk_0381 · 음식점(한식)',
    beforeDetail: `unit_price: 800,000
basis_days: 4
basis_note: "예약 확인 주차 안내 · 가게용 주차장 설정"
status: "active"`,
    afterDetail: `unit_price: 950,000
basis_days: 5
basis_note: "… + 주차권 안내 문자 발송 연동 1건"
status: "active"`,
    impacts: [
      '이 시각 뒤에 만들어지는 초안부터 950,000원이 쓰입니다.',
      '이미 쓰인 초안 3건 · 명세 1건은 800,000원 그대로입니다.',
      '공급자 화면에는 단가가 보이지 않습니다.',
    ],
    relatedHref: '/admin/blocks',
    relatedLabel: '블록 검토에서 보기',
  },
  {
    id: 'evt-11',
    at: '2026-11-02T09:52:00+09:00',
    actor: '운영자 김하늘',
    actorKind: '운영자',
    actorSub: '운영',
    kind: '비활성화',
    target: '블록 · 방문 후 리뷰 요청',
    before: '활성',
    after: '비활성',
    reasonLine: '리마인드 알림의 발송 시점으로 다룰 수 있음',
    reasonFull: '리마인드 알림의 발송 시점으로 다룰 수 있음',
    eventNo: 'evt_20261102_0952_0011',
    actorAccount: '운영자 김하늘 · 운영 계정 ops-02',
    kindFull: '블록 비활성화',
    targetFull: '블록 · 방문 후 리뷰 요청',
    beforeDetail: 'status: "active"',
    afterDetail: 'status: "inactive"',
    impacts: ['이후 매칭 · 추천에서 빠짐'],
    relatedHref: '/admin/blocks',
    relatedLabel: '블록 검토에서 보기',
  },
  {
    id: 'evt-12',
    at: '2026-11-01T14:21:00+09:00',
    actor: '공급자 최준호',
    actorKind: '공급자',
    actorSub: '공급자',
    kind: '견적 수정',
    target: '예약 달력, 예약금 결제 외 2개 기능 · 견적',
    before: '3,000,000원 · 42일',
    after: '3,100,000원 · 42일',
    reasonLine: '회차마다 환불 기준을 다르게 두려면 관리 화면 작업이 늘어남',
    reasonFull: '회차마다 환불 기준을 다르게 두려면 관리 화면 작업이 늘어남',
    eventNo: 'evt_20261101_1421_0012',
    actorAccount: '공급자 최준호',
    kindFull: '견적 수정',
    targetFull: '예약 달력, 예약금 결제 외 2개 기능 · 견적',
    beforeDetail: 'amount: 3,000,000 · days: 42',
    afterDetail: 'amount: 3,100,000 · days: 42',
    impacts: [],
    projectHref: '/s/projects/p-ondo',
  },
];

export function resolveEventMock(raw: string | null): EventMock {
  if (raw && (EVENT_MOCKS as readonly string[]).includes(raw)) return raw as EventMock;
  return '목록';
}

export function defaultIdOf(mock: EventMock): string {
  if (mock === '상세') return 'evt-10';
  return 'evt-01';
}

export function eventOf(id: string | null): EventRow {
  return EVENTS.find((e) => e.id === id) ?? EVENTS[0]!;
}

export function filterEvents(
  kind: string,
  actor: string,
): EventRow[] {
  return EVENTS.filter((e) => {
    if (kind !== '모든 종류' && e.kind !== kind) return false;
    if (actor !== '전체' && e.actorKind !== actor) return false;
    return true;
  });
}

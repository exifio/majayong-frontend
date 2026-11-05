/* 내 계약 시연 데이터 — PRD 9.6 · F-11 · F-13 · 11.3. 화면에서 계산하지 않는다(개수 · 금액 · D-day 기준일 모두 값으로 둔다). */

export const CONTRACTS_MOCKS = [
  '서명 대기',
  '예치 대기',
  '진행 중',
  '검수 대기',
  '완료',
  '취소 요청 중',
  '결렬 — 예치 기한 초과',
  '마감 지남',
] as const;

export type ContractsMock = (typeof CONTRACTS_MOCKS)[number];

export const DEFAULT_CID = 'c-ondo';
export const SETTLEMENTS_HREF = `/c/settlements?contract=${DEFAULT_CID}`;
export const SETTLEMENTS_PLAIN_HREF = '/c/settlements';
export const CHAT_HREF = '/c/chat/p-ondo/s-junho';
export const COMPARE_HREF = '/c/projects/p-ondo/proposals';

export function resolveContractsMock(raw: string | null): ContractsMock {
  if (raw && (CONTRACTS_MOCKS as readonly string[]).includes(raw)) return raw as ContractsMock;
  return '진행 중';
}

export const contractHref = (cid = DEFAULT_CID) => `/c/contracts/${cid}`;
export const escrowHref = (cid = DEFAULT_CID) => `/c/contracts/${cid}/escrow`;
export const inspectHref = (cid = DEFAULT_CID) => `/c/contracts/${cid}/inspect`;
export const cancelHref = (cid = DEFAULT_CID) => `/c/contracts/${cid}/cancel`;
export const reviewHref = (cid = DEFAULT_CID) => `/c/contracts/${cid}/review`;

export const PAGE = {
  title: '내 계약',
  sub: '계약의 진행 상태를 여기서 봅니다. 예치 · 납품 · 지급은 따로 알림을 보내지 않고 이 화면에 표시합니다.',
  settle: '정산 내역 보기',
  countsLabel: '상태별 계약 수',
  agreed: 3_100_000,
  agreedLabel: '합의 금액',
  stepsLabel: '계약 진행 단계',
  todoLabel: '지금 할 일',
  contractDoc: '계약서 보기',
  cancelReq: '계약 취소 요청',
  chat: '채팅',
  chatSchedule: '채팅으로 일정 정하기',
  endedLabel: '끝난 계약',
  endedTail: '완료 · 결렬 · 취소됨',
  settleRow: '정산 보기',
  inspectOffReason: '공급자가 납품하면 검수할 수 있습니다',
} as const;

/* ── 5단계 ── 서명 → 예치 → 중간 검수 · 지급 → 최종 검수 · 지급 → 완료 */
export const STEP_NAMES = ['서명', '예치', '중간 검수 · 지급', '최종 검수 · 지급', '완료'] as const;
export type StepState = 'done' | 'now' | 'todo' | 'hold';
export type StepView = { name: string; state: StepState; sub: string };

function steps(st: StepState[], subs: string[]): StepView[] {
  return STEP_NAMES.map((name, i) => ({ name, state: st[i] ?? 'todo', sub: subs[i] ?? '' }));
}

/* ── 구간 상자 ── */
export type SegItem = { text: string; ok?: boolean };
export type SegView = {
  name: string;
  /** chipToneOf에 있는 상태 이름 */
  status: string;
  items: [SegItem, SegItem];
  amtLabel: string;
  amount: number;
  pay: string;
};

const MID_ITEMS: [SegItem, SegItem] = [{ text: '예약 달력' }, { text: '예약금 결제' }];
const FIN_ITEMS: [SegItem, SegItem] = [{ text: '노쇼 기록' }, { text: '리마인드 알림' }];
const MID_PAY = '중간 항목이 모두 승인되면 지급';
const FIN_PAY = '최종 항목이 모두 승인되면 지급';
const SEG = 1_550_000;

/** 기한 줄 — Deadline(보드의 D-day) 또는 그냥 글 */
export type DueView =
  | { kind: 'deadline'; label: string; at: string; now: string; actionable: boolean; note?: string }
  | { kind: 'text'; text: string; strong?: boolean };

export type TodoPart = string | number;

export type CardAct =
  | { kind: 'link'; label: string; to: string }
  | { kind: 'off'; label: string; reason: string }
  | { kind: 'none' };

export type CardView = {
  now: boolean;
  title: string;
  who: string;
  period: string;
  /** 칩 색을 정하는 chipToneOf용 짧은 상태 */
  status: string;
  /** 보드의 복합 칩 문구 */
  chipLabel: string;
  due: DueView;
  steps: StepView[];
  segs: [SegView, SegView];
  todo: TodoPart[];
  act: CardAct;
  /** 진행 중 카드의 '계약 취소 요청' 텍스트 링크 */
  cancelLink: boolean;
  /** 마감 지남 — 채팅으로 일정 정하기(ghost) + 계약 취소 요청(warn) */
  late: boolean;
  /** 일반 '채팅' 텍스트 링크 */
  plainChat: boolean;
};

const WHO = '공급자 최준호 · ★ 4.8';
const TITLE = '예약 달력, 예약금 결제 외 2개 기능';
const PERIOD_BEFORE = '작업 기간 42일(예치 다음 날부터)';
const PERIOD_RUN = '작업 기간 42일 · 11월 4일 ~ 12월 16일';

const seg = (
  name: string,
  status: string,
  items: [SegItem, SegItem],
  amtLabel: string,
  pay: string,
  amount = SEG,
): SegView => ({ name, status, items, amtLabel, amount, pay });

const MID_NOT_STARTED = seg('중간 구간', '시작 전', MID_ITEMS, '구간 금액', MID_PAY);
const FIN_NOT_STARTED = seg('최종 구간', '시작 전', FIN_ITEMS, '구간 금액', FIN_PAY);
const MID_PAID = (done: boolean): SegView =>
  seg(
    '중간 구간',
    '지급 완료',
    [
      { text: '예약 달력 승인', ok: true },
      { text: done ? '예약금 결제 승인' : '예약금 결제 승인(보완 1회)', ok: true },
    ],
    '지급',
    '11월 27일',
  );

export function cardOf(mock: ContractsMock): CardView {
  const base = { now: true, title: TITLE, who: WHO, cancelLink: false, late: false, plainChat: true };
  switch (mock) {
    case '서명 대기':
      return {
        ...base,
        period: PERIOD_BEFORE,
        status: '서명 대기',
        chipLabel: '임시 계약 · 서명 대기',
        due: { kind: 'deadline', label: '서명 기한', at: '2026-11-10', now: '2026-11-03', actionable: true },
        steps: steps(['now', 'todo', 'todo', 'todo', 'todo'], ['내 서명 전 · 공급자 서명 전', '서명 후', '', '', '']),
        segs: [MID_NOT_STARTED, FIN_NOT_STARTED],
        todo: ['계약서를 확인하고 서명해 주세요. 두 분이 모두 서명하면 계약이 체결되고 예치로 넘어갑니다.'],
        act: { kind: 'link', label: '서명하기', to: contractHref() },
      };
    case '예치 대기':
      return {
        ...base,
        period: PERIOD_BEFORE,
        status: '예치 대기',
        chipLabel: '계약 체결 · 예치 대기',
        due: {
          kind: 'deadline',
          label: '예치 기한',
          at: '2026-11-07',
          now: '2026-11-04',
          actionable: true,
          note: '지나면 자동 결렬',
        },
        steps: steps(['done', 'now', 'todo', 'todo', 'todo'], ['11월 4일 · 양측 서명', '예치 전 · 11월 7일까지', '', '', '']),
        segs: [MID_NOT_STARTED, FIN_NOT_STARTED],
        todo: [
          '계약이 체결되었습니다. 11월 7일까지 ',
          3_255_000,
          '을 예치하면 공급자가 작업을 시작합니다. 기한이 지나면 자동으로 결렬됩니다.',
        ],
        act: { kind: 'link', label: '예치하기', to: escrowHref() },
      };
    case '검수 대기':
      return {
        ...base,
        period: PERIOD_RUN,
        status: '검수 대기',
        chipLabel: '진행 중 · 검수 대기',
        due: {
          kind: 'deadline',
          label: '검수 기한',
          at: '2026-12-02',
          now: '2026-11-25',
          actionable: true,
          note: '지나면 자동 승인',
        },
        steps: steps(
          ['done', 'done', 'now', 'todo', 'todo'],
          ['11월 4일', '11월 4일 · 3,255,000원', '11월 25일 납품 · 검수 중', '', ''],
        ),
        segs: [
          seg('중간 구간', '검수 대기', [{ text: '예약 달력 납품' }, { text: '예약금 결제 납품' }], '지급 예정', '두 항목이 모두 승인되면 지급'),
          seg('최종 구간', '작업 중', FIN_ITEMS, '지급 예정', FIN_PAY),
        ],
        todo: ['중간 납품 2건이 도착했습니다. 12월 2일까지 항목마다 승인하거나 보완을 요청해 주세요. 작업 마감은 12월 16일입니다.'],
        act: { kind: 'link', label: '검수하기', to: inspectHref() },
      };
    case '취소 요청 중':
      return {
        ...base,
        period: PERIOD_RUN,
        status: '취소 요청 중',
        chipLabel: '취소 요청 · 공급자 답 기다림',
        due: { kind: 'text', text: '11월 8일 요청', strong: true },
        steps: steps(
          ['done', 'done', 'hold', 'todo', 'todo'],
          ['11월 4일', '11월 4일 · 3,255,000원', '취소 요청으로 멈춤', '', ''],
        ),
        segs: [
          seg('중간 구간', '작업 멈춤', MID_ITEMS, '지급 전', '납품 전 · 취소 정산으로 처리'),
          seg('최종 구간', '시작 전', FIN_ITEMS, '구간 금액', '취소되면 전액 환불'),
        ],
        todo: ['11월 8일 취소를 요청했습니다(의뢰인 사정). 최준호님이 사유에 동의하면 정산이 확정되고, 이견이면 운영자가 판정합니다. 그동안 작업과 검수는 멈춥니다.'],
        act: { kind: 'link', label: '요청 보기', to: cancelHref() },
      };
    case '결렬 — 예치 기한 초과':
      return {
        ...base,
        now: false,
        period: PERIOD_BEFORE,
        status: '결렬',
        chipLabel: '결렬',
        due: { kind: 'text', text: '11월 8일 결렬 · 예치 기한 초과' },
        steps: steps(['done', 'hold', 'todo', 'todo', 'todo'], ['11월 4일 · 양측 서명', '11월 7일 기한 지남', '', '', '']),
        segs: [
          seg('중간 구간', '결렬', MID_ITEMS, '구간 금액', '예치 전 · 오간 금액 없음'),
          seg('최종 구간', '결렬', FIN_ITEMS, '구간 금액', '예치 전 · 오간 금액 없음'),
        ],
        todo: ['예치 기한(11월 7일)이 지나 결렬되었습니다. 보류했던 지원자 중 다시 고를 수 있습니다.'],
        act: { kind: 'link', label: '제안 비교로', to: COMPARE_HREF },
      };
    case '마감 지남':
      return {
        ...base,
        period: PERIOD_RUN,
        status: '마감 지남',
        chipLabel: '마감 지남 · 최종 납품 없음',
        due: { kind: 'deadline', label: '작업 마감', at: '2026-12-16', now: '2026-12-18', actionable: false },
        steps: steps(
          ['done', 'done', 'done', 'hold', 'todo'],
          ['11월 4일', '11월 4일 · 3,255,000원', '11월 27일 지급', '마감 12월 16일 지남 · 납품 없음', ''],
        ),
        segs: [
          MID_PAID(false),
          seg('최종 구간', '납품 없음', FIN_ITEMS, '지급 전', "취소 사유 '공급자 사정'이면 전액 환불"),
        ],
        todo: ['작업 마감이 지났는데 최종 납품이 없습니다. 채팅으로 새 날짜를 정해 기다리거나, 계약 취소를 요청할 수 있습니다.'],
        act: { kind: 'none' },
        late: true,
        plainChat: false,
      };
    case '완료':
      return {
        ...base,
        period: PERIOD_RUN,
        status: '완료',
        chipLabel: '완료',
        due: { kind: 'text', text: '12월 16일 완료' },
        steps: steps(
          ['done', 'done', 'done', 'done', 'done'],
          ['11월 4일', '11월 4일', '11월 27일 지급', '12월 16일 지급', '12월 16일'],
        ),
        segs: [
          MID_PAID(true),
          seg(
            '최종 구간',
            '지급 완료',
            [{ text: '노쇼 기록 승인', ok: true }, { text: '리마인드 알림 승인', ok: true }],
            '지급',
            '12월 16일',
          ),
        ],
        todo: ['최준호님과의 거래는 어떠셨나요? 리뷰는 한 번만 쓸 수 있고 고칠 수 없습니다.'],
        act: { kind: 'link', label: '리뷰 쓰기', to: reviewHref() },
      };
    case '진행 중':
    default:
      return {
        ...base,
        now: false,
        period: PERIOD_RUN,
        status: '진행 중',
        chipLabel: '진행 중',
        due: { kind: 'deadline', label: '작업 마감', at: '2026-12-16', now: '2026-11-27', actionable: false },
        steps: steps(
          ['done', 'done', 'done', 'now', 'todo'],
          ['11월 4일', '11월 4일 · 3,255,000원', '11월 27일 지급', '작업 중 · 마감 12월 16일', ''],
        ),
        segs: [
          MID_PAID(false),
          seg('최종 구간', '작업 중', FIN_ITEMS, '지급 예정', '최종 항목이 모두 승인되면'),
        ],
        todo: ['공급자가 최종 구간을 작업 중입니다. 납품되면 검수할 수 있습니다.'],
        act: { kind: 'off', label: '검수하기', reason: PAGE.inspectOffReason },
        cancelLink: true,
      };
  }
}

/* ── 상태별 개수 ── 할 일이 있는 상태는 hot(amber) */
export type CountView = { name: string; n: number; hot: boolean };

export function countsOf(mock: ContractsMock): CountView[] {
  const sign = mock === '서명 대기';
  const esc = mock === '예치 대기';
  const done = mock === '완료';
  const lapse = mock === '결렬 — 예치 기한 초과';
  const running = mock === '진행 중' || mock === '검수 대기' || mock === '취소 요청 중' || mock === '마감 지남';
  const runningHot = mock === '검수 대기' || mock === '취소 요청 중' || mock === '마감 지남';
  const rows = [
    { name: '서명 대기', n: sign ? 1 : 0, hot: sign },
    { name: '예치 대기', n: esc ? 1 : 0, hot: esc },
    { name: '진행 중', n: running ? 1 : 0, hot: runningHot },
    { name: '완료', n: (done ? 1 : 0) + 2, hot: false },
    { name: '결렬 · 취소', n: 1 + (lapse ? 1 : 0), hot: lapse },
  ];
  const total = rows.reduce((sum, r) => sum + r.n, 0);
  return [{ name: '전체', n: total, hot: false }, ...rows];
}

/* ── 끝난 계약 ── */
export type EndedView = {
  status: '완료' | '결렬';
  title: string;
  who: string;
  amount: number;
  when: string;
  note?: string;
  review?: string;
};

export const ENDED: EndedView[] = [
  {
    status: '결렬',
    title: '포장 주문 접수 외 1개 기능',
    who: '공급자 김세라',
    amount: 2_400_000,
    when: '10월 31일 결렬',
    note: '7일 안에 공급자 서명이 없어 결렬되었습니다. 예치 전이라 오간 금액은 없습니다.',
  },
  {
    status: '완료',
    title: '메뉴판 페이지, 오시는 길 외 1개 기능',
    who: '공급자 이도윤',
    amount: 900_000,
    when: '9월 30일 완료',
    review: '내 리뷰 씀 · 받은 리뷰 ★ 5',
  },
  {
    status: '완료',
    title: '단체 예약 문의 폼 외 1개 기능',
    who: '공급자 한서진',
    amount: 700_000,
    when: '9월 18일 완료',
    review: '내 리뷰 씀 · 받은 리뷰 ★ 4',
  },
];

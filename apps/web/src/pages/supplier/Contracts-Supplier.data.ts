/* 공급자 내 계약 시연 — PRD F-15. 받을 금액만. 의뢰인 예치액 · 결제 정보 없음. */

export const CONTRACTS_S_MOCKS = [
  '서명 대기',
  '예치 대기',
  '진행 중',
  '검수 대기',
  '완료',
  '취소 요청 받음',
  '마감 지남',
] as const;

export type ContractsSMock = (typeof CONTRACTS_S_MOCKS)[number];

export const DEFAULT_CID = 'c-ondo';
export const SETTLEMENTS_HREF = `/s/settlements?contract=${DEFAULT_CID}`;
export const SETTLEMENTS_PLAIN_HREF = '/s/settlements';
export const CHAT_HREF = '/s/chat/p-ondo';

export function resolveContractsSMock(raw: string | null): ContractsSMock {
  if (raw && (CONTRACTS_S_MOCKS as readonly string[]).includes(raw)) return raw as ContractsSMock;
  return '진행 중';
}

export const contractHref = (cid = DEFAULT_CID) => `/s/contracts/${cid}`;
export const deliverHref = (cid = DEFAULT_CID) => `/s/contracts/${cid}/deliver`;
export const cancelHref = (cid = DEFAULT_CID) => `/s/contracts/${cid}/cancel`;
export const reviewHref = (cid = DEFAULT_CID) => `/s/contracts/${cid}/review`;

export const PAGE = {
  title: '내 계약',
  sub: '계약의 진행 상태를 여기서 봅니다. 예치 · 납품 · 지급은 따로 알림을 보내지 않고 이 화면에 표시합니다.',
  settle: '정산 내역 보기',
  countsLabel: '상태별 계약 수',
  /** 카드 오른쪽 — 합의 금액(수수료 전). 구간 줄은 받을 금액. */
  agreed: 3_100_000,
  agreedLabel: '합의 금액',
  receive: 2_945_000,
  stageNet: 1_472_500,
  stepsLabel: '계약 진행 단계',
  todoLabel: '지금 할 일',
  contractDoc: '계약서 보기',
  chat: '채팅',
  chatSchedule: '채팅으로 일정 정하기',
  endedLabel: '끝난 계약',
  endedTail: '완료 · 결렬 · 취소됨',
  settleRow: '정산 보기',
  deliverOffReason: '의뢰인이 예치하면 작업을 시작할 수 있습니다',
} as const;

export const STEP_NAMES = ['서명', '예치', '중간 검수 · 지급', '최종 검수 · 지급', '완료'] as const;
export type StepState = 'done' | 'now' | 'todo' | 'hold';
export type StepView = { name: string; state: StepState; sub: string };

function steps(st: StepState[], subs: string[]): StepView[] {
  return STEP_NAMES.map((name, i) => ({ name, state: st[i] ?? 'todo', sub: subs[i] ?? '' }));
}

export type SegItem = { text: string; ok?: boolean };
export type SegView = {
  name: string;
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
const NET = PAGE.stageNet;

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
  status: string;
  chipLabel: string;
  due: DueView;
  steps: StepView[];
  segs: [SegView, SegView];
  todo: TodoPart[];
  act: CardAct;
  late: boolean;
  plainChat: boolean;
};

const WHO = '의뢰인 온도 다이닝 · 정민재';
const TITLE = '예약 달력, 예약금 결제 외 2개 기능';
const PERIOD_BEFORE = '작업 기간 42일(예치 다음 날부터)';
const PERIOD_RUN = '작업 기간 42일 · 11월 4일 ~ 12월 16일';

const seg = (
  name: string,
  status: string,
  items: [SegItem, SegItem],
  amtLabel: string,
  pay: string,
  amount = NET,
): SegView => ({ name, status, items, amtLabel, amount, pay });

const MID_NOT_STARTED = seg('중간 구간', '시작 전', MID_ITEMS, '받을 예정', MID_PAY);
const FIN_NOT_STARTED = seg('최종 구간', '시작 전', FIN_ITEMS, '받을 예정', FIN_PAY);
const MID_PAID = (done: boolean): SegView =>
  seg(
    '중간 구간',
    '지급 완료',
    [
      { text: '예약 달력 승인', ok: true },
      { text: done ? '예약금 결제 승인' : '예약금 결제 승인(보완 1회)', ok: true },
    ],
    '받음',
    '11월 27일',
  );

export function cardOf(mock: ContractsSMock): CardView {
  const base = { now: true, title: TITLE, who: WHO, late: false, plainChat: true };
  switch (mock) {
    case '서명 대기':
      return {
        ...base,
        period: PERIOD_BEFORE,
        status: '서명 대기',
        chipLabel: '임시 계약 · 서명 대기',
        due: { kind: 'deadline', label: '서명 기한', at: '2026-11-10', now: '2026-11-03', actionable: true },
        steps: steps(
          ['now', 'todo', 'todo', 'todo', 'todo'],
          ['내 서명 전 · 의뢰인 서명 전', '서명 후', '', '', ''],
        ),
        segs: [MID_NOT_STARTED, FIN_NOT_STARTED],
        todo: ['계약서를 확인하고 서명해 주세요. 기한 안에 서명하지 않거나 거절하면 결렬됩니다.'],
        act: { kind: 'link', label: '계약서 확인하고 서명', to: contractHref() },
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
          actionable: false,
          note: '지나면 자동 결렬',
        },
        steps: steps(['done', 'now', 'todo', 'todo', 'todo'], ['11월 4일 · 양측 서명', '예치 전', '', '', '']),
        segs: [MID_NOT_STARTED, FIN_NOT_STARTED],
        todo: [
          '의뢰인이 11월 7일까지 예치하지 않으면 자동 결렬됩니다 · 예치 전에는 작업을 시작하지 않아도 됩니다.',
        ],
        act: { kind: 'off', label: '납품하기', reason: PAGE.deliverOffReason },
      };
    case '검수 대기':
      return {
        ...base,
        period: PERIOD_RUN,
        status: '검수 대기',
        chipLabel: '진행 중 · 검수 대기',
        due: {
          kind: 'deadline',
          label: '작업 마감',
          at: '2026-12-16',
          now: '2026-11-25',
          actionable: false,
        },
        steps: steps(
          ['done', 'done', 'now', 'todo', 'todo'],
          ['11월 4일', '11월 4일', '11월 25일 납품 · 검수 중', '', ''],
        ),
        segs: [
          seg(
            '중간 구간',
            '검수 대기',
            [{ text: '예약 달력 납품' }, { text: '예약금 결제 납품' }],
            '받을 예정',
            '검수 기한 12월 2일 · 지나면 자동 승인',
          ),
          seg('최종 구간', '작업 중', FIN_ITEMS, '받을 예정', FIN_PAY),
        ],
        todo: [
          '의뢰인 검수 기한 12월 2일 · 지나면 자동 승인되고 지급됩니다. 보완 요청이 오면 그 항목만 다시 내면 됩니다.',
        ],
        act: { kind: 'link', label: '납품 보기', to: deliverHref() },
      };
    case '취소 요청 받음':
      return {
        ...base,
        period: PERIOD_RUN,
        status: '취소 요청 중',
        chipLabel: '취소 요청 · 내 답 필요',
        due: { kind: 'text', text: '11월 8일 의뢰인 요청 · 의뢰인 사정', strong: true },
        steps: steps(
          ['done', 'done', 'hold', 'todo', 'todo'],
          ['11월 4일', '11월 4일', '취소 요청 · 11월 8일', '', ''],
        ),
        segs: [
          seg('중간 구간', '작업 멈춤', MID_ITEMS, '받을 예정', '납품 전 · 취소 정산을 기다리는 중'),
          seg('최종 구간', '시작 전', FIN_ITEMS, '받을 예정', '취소가 확정되면 지급하지 않음'),
        ],
        todo: [
          '의뢰인이 11월 8일 취소를 요청했습니다. 동의하거나 이의를 제기해 주세요. 답하기 전까지 작업과 지급이 멈춥니다.',
        ],
        act: { kind: 'link', label: '요청 보기', to: cancelHref() },
      };
    case '마감 지남':
      return {
        ...base,
        period: PERIOD_RUN,
        status: '마감 지남',
        chipLabel: '진행 중 · 마감 지남',
        due: { kind: 'deadline', label: '작업 마감', at: '2026-12-16', now: '2026-12-18', actionable: false },
        steps: steps(
          ['done', 'done', 'done', 'hold', 'todo'],
          ['11월 4일', '11월 4일', '11월 27일 지급', '마감 지남 · 최종 미납', ''],
        ),
        segs: [
          MID_PAID(false),
          seg(
            '최종 구간',
            '마감 지남',
            [{ text: '노쇼 기록 미납' }, { text: '리마인드 알림 미납' }],
            '받을 예정',
            '납품하면 검수 후 지급',
          ),
        ],
        todo: [
          '작업 마감(12월 16일)이 지났습니다 · 납품하거나 채팅으로 일정을 정하세요. 의뢰인이 취소를 요청할 수 있습니다.',
        ],
        act: { kind: 'link', label: '납품하기', to: deliverHref() },
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
            [
              { text: '노쇼 기록 승인', ok: true },
              { text: '리마인드 알림 승인', ok: true },
            ],
            '받음',
            '12월 16일',
          ),
        ],
        todo: ['온도 다이닝과의 거래는 어떠셨나요? 리뷰는 한 번만 쓸 수 있고 고칠 수 없습니다.'],
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
          ['11월 4일', '11월 4일', '11월 27일 지급', '작업 중 · 마감 12월 16일', ''],
        ),
        segs: [
          MID_PAID(false),
          seg('최종 구간', '작업 중', FIN_ITEMS, '받을 예정', '최종 항목이 모두 승인되면'),
        ],
        todo: ['최종 구간(노쇼 기록 · 리마인드 알림)을 12월 16일까지 납품해 주세요.'],
        act: { kind: 'link', label: '납품하기', to: deliverHref() },
      };
  }
}

export type CountView = { name: string; n: number; hot: boolean };

export function countsOf(mock: ContractsSMock): CountView[] {
  const sign = mock === '서명 대기';
  const esc = mock === '예치 대기';
  const done = mock === '완료';
  const running =
    mock === '진행 중' || mock === '검수 대기' || mock === '취소 요청 받음' || mock === '마감 지남';
  const runningHot = mock === '검수 대기' || mock === '취소 요청 받음' || mock === '마감 지남';
  const rows = [
    { name: '서명 대기', n: sign ? 1 : 0, hot: sign },
    { name: '예치 대기', n: esc ? 1 : 0, hot: esc },
    { name: '진행 중', n: running ? 1 : 0, hot: runningHot },
    { name: '완료', n: (done ? 1 : 0) + 2, hot: false },
    { name: '결렬 · 취소', n: 1, hot: false },
  ];
  const total = rows.reduce((sum, r) => sum + r.n, 0);
  return [{ name: '전체', n: total, hot: false }, ...rows];
}

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
    status: '완료',
    title: '테이블 예약, 대기 등록 외 2개 기능',
    who: '의뢰인 담소 키친',
    amount: 2_000_000,
    when: '10월 18일 완료',
    review: '받은 리뷰 ★ 5',
  },
  {
    status: '결렬',
    title: '클래스 예약, 수강권 결제 외 1개 기능',
    who: '의뢰인 공방 결',
    amount: 1_900_000,
    when: '10월 12일 결렬',
    note: '7일 안에 서명이 없어 결렬되었습니다. 예치 전이라 오간 금액은 없습니다.',
  },
  {
    status: '완료',
    title: '케이크 예약, 픽업 시간 선택 외 1개 기능',
    who: '의뢰인 하루 베이커리',
    amount: 1_600_000,
    when: '8월 22일 완료',
    review: '내 리뷰 씀 · 받은 리뷰 ★ 5',
  },
];

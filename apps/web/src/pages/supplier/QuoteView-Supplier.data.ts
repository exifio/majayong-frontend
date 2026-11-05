/* 공급자 내 견적 보기 시연 — PRD F-05 · F-10. 읽기 전용. 예산·AI·단가 없음. */

export const QUOTE_VIEW_MOCKS = ['문의 중', '이전 명세 기준', '임시 계약 중'] as const;
export type QuoteViewMock = (typeof QUOTE_VIEW_MOCKS)[number];

export const DEFAULT_PID = 'p-ondo';
export const CHAT_HREF = '/s/chat/p-ondo';
export const PROJECT_HREF = '/s/projects/p-ondo';
export const QUOTE_WRITE_HREF = '/s/projects/p-ondo/quote';
export const CONTRACT_HREF = '/s/contracts/c-ondo';
export const APPS_HREF = '/s/applications';

export const DEMO = {
  pageTitle: '내 견적',
  crumbApps: '내 지원',
  crumbProject: '온도 다이닝 예약 사이트',
  sub: "보낸 견적을 읽기 전용으로 봅니다. 견적은 의뢰인과의 채팅에서 '견적 수정'으로만 고칠 수 있습니다.",
  total: 3_100_000,
  prevTotal: 3_000_000,
  net: 2_945_000,
  days: 42,
  canCount: '4 / 4',
  editWhen: '11월 1일 채팅에서 수정',
  editWhy: '회차별로 환불 기준을 다르게 두려면 관리 화면 작업이 늘어 금액을 조정했습니다.',
  changeLine: '3,000,000원 → 3,100,000원',
  chatCta: '채팅으로',
  chatEdit: '채팅에서 견적 수정',
  chatEditOff: '의뢰인이 문의를 시작하면 수정할 수 있습니다',
  projectView: '프로젝트 보기',
  staleBandTitle: '11월 2일 의뢰인이 명세를 고쳤습니다 — 이 견적은 선택될 수 없습니다',
  staleBandBody:
    "'리마인드 알림' 설명이 바뀌고 '단골 표시'가 새로 더해졌습니다. 바뀐 명세로 다시 견적을 내면 새 회차로 들어갑니다.",
  reQuote: '다시 견적 내기',
  heldBandTitle: '선택되었습니다 — 임시 계약 · 서명 기한 11월 10일',
  heldBandBody:
    '임시 계약 중에는 견적을 고치거나 지원을 철회할 수 없습니다. 계약서에서 합의한 기능과 조건을 확인하고 서명해 주세요.',
  contractCta: '계약서 보기',
  withdraw: '지원 철회',
  withdrawOff: '임시 계약 중에는 지원을 철회할 수 없습니다. 원하지 않으면 계약서에서 서명을 거절하세요.',
  message:
    '소규모 식당 예약 사이트를 12곳 만들었습니다. 회차제 코스 레스토랑 예약 달력과 PG 예약금 결제를 함께 붙인 경험이 있어, 환불 규정처럼 정해야 할 부분을 먼저 여쭤보며 진행하겠습니다. 궁금하신 점은 연락처 가림 대신 채팅으로 편하게 물어봐 주세요.',
  messageNote:
    '메시지의 연락처 형식은 저장 전에 가려졌습니다. 연락처는 계약 체결 뒤 채팅에서 주고받을 수 있습니다.',
  deadline: '11월 3일',
  appliedAt: '10월 29일',
  noteEdit: "견적은 채팅의 '견적 수정'으로만 고칩니다. 고치면 새 회차가 되고, 지금 회차는 '대체됨'으로 남습니다.",
  staleOff: "이전 명세 기준 견적은 채팅에서 고칠 수 없습니다. '다시 견적 내기'로 새 회차를 내 주세요.",
  heldEditOff: '임시 계약 중에는 견적을 고칠 수 없습니다.',
} as const;

export const FEATURES = [
  { name: '예약 달력', desc: '회차별로 예약받고 정원이 차면 마감', ok: true },
  { name: '예약금 결제', desc: '예약할 때 예약금을 받고 환불 규정 안내', ok: true },
  { name: '노쇼 기록', desc: '노쇼 손님을 기록해 다음 예약 때 표시', ok: true },
  { name: '리마인드 알림', desc: '예약 전날 손님에게 안내 자동 발송', ok: true },
] as const;

export type HistRow = {
  when: string;
  title: string;
  chip: string;
  tone: 'blue' | 'amber' | 'outline';
  note: string;
  old?: boolean;
};

export type QuoteViewDemo = {
  mock: QuoteViewMock;
  ask: boolean;
  stale: boolean;
  held: boolean;
  status: string;
  statusLabel: string;
  curH: string;
  history: HistRow[];
  /** 문의 전 시연 — 현재 보드 상태에는 없으나 수정 CTA 비활성 규칙을 보여 줌 */
  chatStarted: boolean;
};

export function resolveQuoteViewMock(raw: string | null): QuoteViewMock {
  if (raw && (QUOTE_VIEW_MOCKS as readonly string[]).includes(raw)) return raw as QuoteViewMock;
  return '문의 중';
}

export function quoteViewDemoOf(mock: QuoteViewMock): QuoteViewDemo {
  const ask = mock === '문의 중';
  const stale = mock === '이전 명세 기준';
  const held = mock === '임시 계약 중';
  const status = held ? '서명 대기' : stale ? '이전 명세 기준' : '문의 중';
  const statusLabel = held ? '임시 계약 · 서명 대기' : status;
  return {
    mock,
    ask,
    stale,
    held,
    status,
    statusLabel,
    curH: stale ? '지금 견적 · 이전 명세 기준' : '지금 견적 · 2회차',
    chatStarted: ask,
    history: [
      {
        when: '11월 1일 · 채팅에서 견적 수정',
        title: '2회차 · 3,100,000원 · 42일',
        chip: statusLabel,
        tone: held || stale ? 'amber' : 'blue',
        note: '4 / 4 가능 · 의뢰인 채팅에 수정 기록이 남았습니다',
      },
      {
        when: '10월 29일 · 지원',
        title: '1회차 · 3,000,000원 · 42일',
        chip: '대체됨',
        tone: 'outline',
        note: '4 / 4 가능 · 제안 비교에는 최신 회차만 보입니다',
        old: true,
      },
    ],
  };
}

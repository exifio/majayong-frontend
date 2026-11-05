/* 견적 작성 시연 — 보드 QuoteWrite-Supplier · PRD F-05 · 11.2 · ㉜
 * 항목별 금액 · AI 단가 없음. 총액 − 수수료 5% = 예상 수령액. */

import { CONTACT_MASK_TOKEN } from '@majayong/types';

export const QUOTE_WRITE_MOCKS = ['작성 중', '모두 불가', '연락처 가림', '재견적'] as const;
export type QuoteWriteMock = (typeof QUOTE_WRITE_MOCKS)[number];

export const DEFAULT_PID = 'p-ondo';
export const FIND_HREF = '/s/projects';
export const PROJECT_HREF = '/s/projects/p-ondo';
export const SUBMIT_HREF = `/s/applications?mock=${encodeURIComponent('제출 완료')}`;

export const FEE_RATE = 0.05;
export const MSG_MAX = 1000;
export const ASK_MAX = 3;

export type QuoteItem = {
  id: string;
  name: string;
  desc: string;
  cond: string;
  change?: string;
};

export const BASE_ITEMS: QuoteItem[] = [
  {
    id: 'calendar',
    name: '예약 달력',
    desc: '회차별로 예약받고 정원이 차면 마감',
    cond: '회차 구성 · 예약 가능 기간',
  },
  {
    id: 'deposit',
    name: '예약금 결제',
    desc: '예약할 때 예약금을 받고 환불 규정 안내',
    cond: '예약금 금액 · 환불 기준',
  },
  {
    id: 'noshow',
    name: '노쇼 기록',
    desc: '노쇼 손님을 기록해 다음 예약 때 표시',
    cond: '노쇼 판정 기준 · 표시 방식',
  },
  {
    id: 'remind',
    name: '리마인드 알림',
    desc: '예약 전날 손님에게 안내 자동 발송',
    cond: '발송 시점 · 발송 수단',
  },
];

export const REQUOTE_ITEMS: QuoteItem[] = [
  ...BASE_ITEMS.slice(0, 3),
  {
    id: 'remind',
    name: '리마인드 알림',
    desc: '예약 전날과 당일 3시간 전 손님에게 안내 자동 발송',
    cond: '발송 시점 · 발송 수단',
    change: '설명 바뀜',
  },
  {
    id: 'regular',
    name: '단골 표시',
    desc: '세 번 이상 방문한 손님을 예약 목록에 표시',
    cond: '단골 기준',
    change: '새 항목',
  },
];

export const DEMO = {
  projectTitle: '예약 달력, 예약금 결제 외 2개 기능',
  title: '견적 작성',
  titleRe: '다시 견적하기 · 3회차',
  crumbWrite: '견적 작성',
  crumbRe: '다시 견적',
  pageLead:
    '항목마다 할 수 있는지 고르고, 총액과 기간만 적어 주세요. 항목별 금액은 받지 않습니다. 총액은 부가세 포함으로 적어 주세요. 세부 조건은 의뢰인이 문의 채팅을 열면 함께 정합니다.',
  reNoteTitle: '의뢰인이 명세를 고쳤습니다 — 다시 견적해 주세요',
  reNoteBody:
    '11월 2일에 명세가 바뀌어 이전 견적(2회차 3,100,000원)은 \'이전 명세 기준\'이 되었고, 의뢰인이 고를 수 없습니다. 이전 견적을 미리 채워 두었습니다.',
  reChanges: [
    { name: '리마인드 알림', detail: '설명이 바뀌었습니다: "예약 전날 안내" → "예약 전날과 당일 3시간 전 안내"' },
    { name: '단골 표시', detail: '새로 더해진 항목입니다' },
  ],
  itemsLead: '불가로 고른 항목은 이 견적으로 계약할 때 범위에 들어가지 않습니다.',
  allNoNote: '할 수 있는 항목이 하나 이상 있어야 보낼 수 있습니다',
  allNoInline: '할 수 있는 항목을 하나 이상 골라 주세요. 모두 불가로는 제출할 수 없습니다.',
  amtLead: '가능으로 고른 항목 전체를 만드는 금액입니다. 의뢰인에게는 수수료 5%를 더한 금액이 함께 보입니다.',
  amtLabel: '총액',
  daysLabel: '작업 기간',
  daysHint: '예치 다음 날부터 셉니다',
  rePrev: '2회차 3,100,000원 · 42일을 미리 채웠습니다',
  netUnderAmt: '예상 수령액',
  feeUnderAmt: '플랫폼 수수료 5%',
  msgLead: '비슷한 작업 경험, 진행 방식을 적어 주세요. 의뢰인이 견적서에서 읽습니다.',
  msgDefault:
    '소규모 식당 예약 사이트를 12곳 만들었습니다. 예약 달력과 PG 결제 연동은 거의 매번 하는 작업이라 일정이 안정적입니다.\n중간 납품 때 관리 화면부터 보여 드리겠습니다. 정해야 할 조건은 문의 채팅에서 편하게 물어봐 주세요.',
  /** 연락처 가림 시연 — 전화번호가 있던 자리 */
  msgMaskedRaw: `소규모 식당 예약 사이트를 12곳 만들었습니다. 예약 달력과 PG 결제 연동은 거의 매번 하는 작업이라 일정이 안정적입니다.
중간 납품 때 관리 화면부터 보여 드리겠습니다. 자세한 건 ${CONTACT_MASK_TOKEN} 으로 연락 주세요.`,
  maskNoteTitle: '연락처는 계약 체결 후 주고받을 수 있습니다',
  maskNoteBody:
    '메시지에 적힌 전화번호를 저장 전에 가렸습니다. 문의는 의뢰인이 문의 채팅을 열면 그곳에서 이어집니다.',
  askTitle: '의뢰인에게 묻고 싶은 것',
  askSub: '선택 · 최대 3개',
  askSubRe: '2회차에 남긴 질문 2개를 그대로 보냅니다',
  askAdd: '+ 질문 추가',
  askNote: '견적과 함께 의뢰인에게 보입니다 · 연락처는 가려집니다',
  defaultAsks: [
    '예약금은 카드 결제만 받으시나요, 계좌이체도 받으시나요?',
    '기존 전화 예약 고객 명단을 옮겨야 하나요?',
  ],
  submit: '견적 보내기',
  submitDisabledReason: '할 수 있는 항목이 없어 제출할 수 없습니다',
  summaryTitle: '견적 요약',
  summaryFee: '플랫폼 수수료 5%',
  summaryNet: '예상 수령액',
  summaryOk: '할 수 있는 항목',
  summaryDays: '작업 기간',
  summarySx: '수수료는 지급이 확정된 금액에만 부과됩니다. 구간마다 나눠 받습니다.',
  afterTitle: '제출하면',
  defaultAmt: 3_000_000,
  requoteAmt: 3_100_000,
  defaultDays: 42,
} as const;

export function resolveQuoteWriteMock(raw: string | null): QuoteWriteMock {
  if (raw && (QUOTE_WRITE_MOCKS as readonly string[]).includes(raw)) return raw as QuoteWriteMock;
  return '작성 중';
}

export function feeOf(amount: number): number {
  if (amount <= 0) return 0;
  return Math.round(amount * FEE_RATE);
}

export function netOf(amount: number): number {
  if (amount <= 0) return 0;
  return amount - feeOf(amount);
}

export function parseWonInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return 0;
  return Number(digits);
}

export function formatWonInput(n: number): string {
  if (!n) return '';
  return n.toLocaleString('ko-KR');
}

export type QuoteWriteSeed = {
  mock: QuoteWriteMock;
  requote: boolean;
  masked: boolean;
  items: QuoteItem[];
  /** 초기 가능 여부 */
  okById: Record<string, boolean>;
  amount: number;
  days: number;
  message: string;
  asks: string[];
  asksEditable: boolean;
};

export function quoteWriteSeedOf(mock: QuoteWriteMock): QuoteWriteSeed {
  const requote = mock === '재견적';
  const masked = mock === '연락처 가림';
  const allNo = mock === '모두 불가';
  const items = requote ? REQUOTE_ITEMS : BASE_ITEMS;
  const okById: Record<string, boolean> = {};
  for (const it of items) okById[it.id] = !allNo;

  return {
    mock,
    requote,
    masked,
    items,
    okById,
    amount: allNo ? 0 : requote ? DEMO.requoteAmt : DEMO.defaultAmt,
    days: allNo ? 0 : DEMO.defaultDays,
    message: masked ? DEMO.msgMaskedRaw : DEMO.msgDefault,
    asks: [...DEMO.defaultAsks],
    asksEditable: !requote,
  };
}

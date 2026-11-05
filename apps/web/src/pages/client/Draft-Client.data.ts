/* 초안 · 명세 2분할 시연 데이터 — 보드 Draft-Client.dc.html renderVals · PRD 9.2 · F-01 · F-02 · F-04
 * 포함 4건 단가(NOTES 10/28 정본): 예약 달력 140만 · 예약금 결제 120만 · 노쇼 기록 100만 · 리마인드 알림 60만
 * = 기능 합계 4,200,000 + 수수료 5% 210,000 = AI 예상 총액 4,410,000. 희망 예산 5,000,000.
 * 재방문 알림 38만 · 알레르기·선호 메모는 금액 미정(NOTES 10/28). 단골 등급 관리 66만은 제외 항목.
 * 노쇼 위약금 62만 · 예약 확정 문자 31만은 폐기된 가격 등록 보드에만 있다. */
import { fee } from '@/lib/format';

export const DRAFT_MOCKS = ['기본', '초안 만드는 중', '만들기 실패', '채팅 반영 중'] as const;
export type DraftMock = (typeof DRAFT_MOCKS)[number];

export const HOPE_BUDGET = 5_000_000;
export const INPUT_HREF = '/c/drafts/new';

export function confirmHref(did: string) {
  return `/c/drafts/${did}/confirm`;
}

export function creatingHref(did: string) {
  return `/c/drafts/${did}?mock=${encodeURIComponent('초안 만드는 중')}`;
}

export function draftHref(did: string) {
  return `/c/drafts/${did}`;
}

export function reportHref(did: string, mock: string | null) {
  const q = new URLSearchParams();
  if (mock && (DRAFT_MOCKS as readonly string[]).includes(mock)) q.set('mock', mock);
  q.set('modal', 'report');
  return `/c/drafts/${did}?${q.toString()}`;
}

export function resolveDraftMock(raw: string | null): DraftMock {
  if (raw && (DRAFT_MOCKS as readonly string[]).includes(raw)) return raw as DraftMock;
  return '기본';
}

export const GEN = {
  makingTitle: '화면 초안을 그리고 있습니다',
  makingSub: '적어 주신 문장에서 필요한 기능을 찾아 블록으로 맞추고, 화면 초안과 명세를 함께 만듭니다.',
  failTitle: '화면 초안',
  failSub: '다시 만들어 보거나, 업종 기본 구성에서 시작할 수 있습니다.',
  failTitleBand: '초안을 만들지 못했습니다',
  failBody: '잠시 연결이 불안정했습니다. 적어 주신 문장은 그대로 남아 있고, 채팅 수정 횟수도 줄지 않았습니다.',
  foot: '보통 8초쯤 걸립니다. 화면을 닫아도 초안은 \'작성 중\'에 남습니다.',
  painLabel: '적어 주신 불편',
  pain: '예약 앱이랑 전화를 같이 받는데 노쇼 나면 재료를 다 버려요',
};

/** 디자인 시스템 9절 로딩: 문장 읽기 → 기능 고르기 → 화면 그리기. 2단계는 진행 중. */
export const GEN_STEPS = [
  { key: 'read', state: 'done', kicker: '1 · 완료', label: '문장 읽기' },
  { key: 'pick', state: 'now', kicker: '2 · 진행 중', label: '기능 고르기' },
  { key: 'draw', state: 'wait', kicker: '3', label: '화면 그리기' },
] as const;

export const CHAT = {
  label: '초안에서 바꾸고 싶은 점을 말씀해 주세요',
  placeholder: '예) 저녁은 한 회차만 받을래요. 단체 예약은 전화로만 받고 싶어요',
  left: 27,
  max: 30,
  reflecting: '예약금은 1인 3만원 정액으로, 전날 18시 전에 취소하면 전액 돌려주게 해 주세요',
  reflectReason: '요청을 화면 초안과 명세에 반영하고 있습니다.',
};

export const BASIS =
  '예상 총액은 AI가 기능마다 분석해 둔 단가를 더한 참고용 추정치이며, 실제 견적과 다를 수 있습니다. 공급자에게는 보이지 않고, 명세를 확정하면 더 이상 표시하지 않습니다.';

export type WireKind = 'calendar' | 'pay' | 'guests' | 'remind' | 'grades' | 'penalty' | 'confirm' | 'revisit' | 'allergy';

export type DraftBlock = {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  memo: string;
  /** null이면 금액 미정. 합계에서 빼고 '+ 금액 미정 N건'으로만 보여 준다. */
  amount: number | null;
  wire: WireKind;
  wide?: boolean;
  updating?: boolean;
};

export type ExcludedBlock = DraftBlock & { reason: string };

export type RecBlock = {
  id: string;
  reason: string;
  block: DraftBlock;
};

const INCLUDED: DraftBlock[] = [
  {
    id: 'calendar',
    name: '예약 달력',
    description: '회차별로 예약받고 정원이 차면 마감',
    conditions: ['회차 구성', '예약 가능 기간'],
    memo: '',
    amount: 1_400_000,
    wire: 'calendar',
    wide: true,
  },
  {
    id: 'pay',
    name: '예약금 결제',
    description: '예약할 때 예약금을 받고 환불 규정 안내',
    conditions: ['예약금 금액', '환불 기준'],
    memo: '전날 취소면 돌려주고 싶음',
    amount: 1_200_000,
    wire: 'pay',
  },
  {
    id: 'noshow',
    name: '노쇼 기록',
    description: '노쇼 손님을 기록해 다음 예약 때 표시',
    conditions: ['노쇼 판정 기준', '표시 방식'],
    memo: '',
    amount: 1_000_000,
    wire: 'guests',
  },
  {
    id: 'remind',
    name: '리마인드 알림',
    description: '예약 전날 손님에게 안내 자동 발송',
    conditions: ['발송 시점', '발송 수단'],
    memo: '',
    amount: 600_000,
    wire: 'remind',
  },
];

const EXCLUDED: ExcludedBlock[] = [
  {
    id: 'grade',
    name: '단골 등급 관리',
    description: '방문 횟수로 등급을 나눠 혜택 적용',
    conditions: ['등급 기준', '등급별 혜택'],
    memo: '',
    amount: 660_000,
    wire: 'grades',
    reason: '직접 삭제',
  },
];

const RECS: RecBlock[] = [
  {
    id: 'penalty',
    reason: '노쇼가 나도 재료값은 돌려받고 싶다면',
    block: {
      id: 'penalty',
      name: '노쇼 위약금 자동 청구',
      description: '사전 고지한 규정대로 위약금을 자동 청구',
      conditions: ['위약금 기준', '청구 시점'],
      memo: '',
      amount: 620_000,
      wire: 'penalty',
    },
  },
  {
    id: 'confirm-sms',
    reason: '예약마다 규정을 직접 안내하고 계신다면',
    block: {
      id: 'confirm-sms',
      name: '예약 확정 문자',
      description: '예약이 잡히면 즉시 확정 안내 발송',
      conditions: ['발송 시점', '안내 문구'],
      memo: '',
      amount: 310_000,
      wire: 'confirm',
    },
  },
  {
    id: 'revisit',
    reason: '뜸해진 단골에게 먼저 연락하고 싶다면',
    block: {
      id: 'revisit',
      name: '재방문 알림',
      description: '한동안 오지 않은 손님에게 안내 발송',
      conditions: ['뜸한 기간', '발송 수단'],
      memo: '',
      amount: 380_000,
      wire: 'revisit',
    },
  },
  {
    id: 'allergy',
    reason: '단골 손님 취향을 기억해 두고 싶다면',
    block: {
      id: 'allergy',
      name: '알레르기·선호 메모',
      description: '손님별 알레르기와 취향을 미리 받아 기록',
      conditions: ['받을 항목', '보여주는 곳'],
      memo: '',
      amount: null,
      wire: 'allergy',
    },
  },
];

export function initialDraft(mock: DraftMock) {
  const next = structuredClone({ included: INCLUDED, excluded: EXCLUDED, recs: RECS });
  if (mock === '채팅 반영 중') {
    const pay = next.included.find((item) => item.id === 'pay');
    if (pay) pay.updating = true;
  }
  return next;
}

/** 금액이 있는 항목만 더하고 수수료 5%(원 단위 내림)를 붙인다. 금액 미정은 건수로만 센다. */
export function quoteOf(items: { amount: number | null }[]) {
  const tbd = items.filter((item) => item.amount == null).length;
  const sub = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const feeAmt = fee(sub);
  return { count: items.length - tbd, sub, fee: feeAmt, total: sub + feeAmt, tbd };
}

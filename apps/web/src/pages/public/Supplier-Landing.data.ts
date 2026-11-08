/* 공급자 랜딩 문구 — 디자인 캔버스 Supplier-Landing 보드(랜딩 v3) · PRD F-01 · 13.2
 * routes.ts states=[] → '기본'만. 금액은 예시 화면용 시연 값(화면에서 계산하지 않음). */
import type { FlowStep, PayStep, ValueCard } from '@/components/landing/LandingSections';

export const SL_MOCKS = ['기본'] as const;
export type SlMock = (typeof SL_MOCKS)[number];

export type SlDemo = {
  pill: string;
  title: string;
  lead: string;
  freeNote: string;
  cta: string;
  ctaGhost: string;
  hero: {
    label: string;
    steps: [string, string, string];
    projectTitle: string;
    itemCount: string;
    budgetRange: string;
    recruit: string;
    items: { name: string; ask: string }[];
    impossible: string;
    quoteTotal: number;
    periodDays: string;
    payout: number;
  };
  howTitle: string;
  howCards: Omit<ValueCard, 'shot'>[];
  flowTitle: string;
  flowSteps: FlowStep[];
  payTitle: string;
  paySteps: PayStep[];
  payNote: string;
  bottomTitle: string;
  bottomLead: string;
  bottomSub: string;
};

const BASE: SlDemo = {
  pill: '예약 기반 음식점 프로젝트부터 올라옵니다',
  title: '글을 읽고 기능을 뽑는\n시간을 없앱니다',
  lead: '가능 · 불가만 고르면 견적이 끝납니다.',
  freeNote: '가입 · 견적 · 채팅 무료',
  cta: '공급자로 등록하기',
  ctaGhost: '견적 방식 보기',
  hero: {
    label: '기능 단위로 쪼개진 명세를 보고, 할 수 없는 항목을 불가로 바꾼 뒤, 총액과 기간을 적어 견적을 보내는 과정',
    steps: ['명세 보기', '가능 · 불가 고르기', '총액 · 기간 적기'],
    projectTitle: '코스 레스토랑 예약 사이트',
    itemCount: '4개',
    budgetRange: '400~500만원',
    recruit: 'D-5',
    items: [
      { name: '예약 달력', ask: '정할 것 · 회차 구성, 예약 기간' },
      { name: '예약금 결제', ask: '정할 것 · 예약금 금액, 환불 기준' },
      { name: '리마인드 알림', ask: '정할 것 · 발송 시점, 발송 수단' },
      { name: '노쇼 기록', ask: '정할 것 · 노쇼 판정 기준, 표시 방식' },
    ],
    impossible: '노쇼 기록',
    quoteTotal: 3_000_000,
    periodDays: '42일',
    payout: 2_850_000,
  },
  howTitle: '견적이 쉬워집니다',
  howCards: [
    { title: '기능이 이미 정리돼 있습니다', body: '글을 해석하지 않고 바로 견적합니다' },
    { title: '총액으로 제안합니다', body: '항목별 가격표에 맞추지 않습니다' },
    { title: '계약 후 범위가 늘지 않습니다', body: '추가 기능은 새 프로젝트로 들어옵니다' },
  ],
  flowTitle: '등록부터 정산까지',
  flowSteps: [
    { title: '프로필 등록', body: '포트폴리오는 AI가 요약', icon: 'user' },
    { title: '명세 고르기', body: '업종 · 예산 구간으로', icon: 'search' },
    { title: '견적 보내기', body: '가능 항목 · 총액 · 기간', icon: 'list' },
    { title: '채팅 · 서명', body: '조건을 정하고 7일 안에 서명', icon: 'chat' },
    { title: '구간 정산', body: '검수 승인마다 지급', icon: 'won', money: true },
  ],
  payTitle: '대금은 나눠서 받습니다',
  paySteps: [
    { title: '계약 · 전액 예치', body: '의뢰인이 대금을 마자용에 맡깁니다', icon: 'lock' },
    { title: '중간 검수 승인', body: '1차 지급', icon: 'check', paid: true },
    { title: '최종 검수 승인', body: '2차 지급', icon: 'check', paid: true },
  ],
  payNote: '의뢰인이 7일 안에 답하지 않으면 자동으로 승인됩니다',
  bottomTitle: '할 수 있는 일을 등록해 두세요',
  bottomLead: '등록은 10분이면 충분합니다.',
  bottomSub: '가입 · 견적 · 채팅 무료 · 지급될 때만 수수료 5%',
};

const BY_MOCK: Record<SlMock, SlDemo> = {
  기본: BASE,
};

export function resolveSlMock(raw: string | null): SlMock {
  if (raw && (SL_MOCKS as readonly string[]).includes(raw)) return raw as SlMock;
  return '기본';
}

export function slDemoOf(mock: SlMock): SlDemo {
  return BY_MOCK[mock];
}

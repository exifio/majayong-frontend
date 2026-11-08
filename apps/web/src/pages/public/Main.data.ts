/* 의뢰인 랜딩(Main) 문구 — 디자인 캔버스 Main 보드(랜딩 v3)
 * routes.ts states가 비어 있어 상태는 '기본' 하나만 둔다. 숫자는 예시 화면용 시연 값이다. */
import type { FlowStep, ValueCard } from '@/components/landing/LandingSections';

export const MAIN_MOCKS = ['기본'] as const;
export type MainMock = (typeof MAIN_MOCKS)[number];

export type MainDemo = {
  pill: string;
  title: string;
  lead: string;
  freeNote: string;
  hero: {
    label: string;
    steps: [string, string, string];
    question: string;
    sentence: [string, string];
    industries: string[];
    draftBlocks: string[];
    removed: string;
    budget: string;
    totalBefore: string;
    totalAfter: string;
    budgetBefore: string;
    budgetAfter: string;
  };
  valueTitle: string;
  valueCards: Omit<ValueCard, 'shot'>[];
  proposals: { initial: string; name: string; meta: string; quote: number }[];
  flowTitle: string;
  flowSteps: FlowStep[];
  safetyTitle: string;
  safetyCards: Required<Omit<ValueCard, 'shot'>>[];
  ctaTitle: string;
  ctaLead: string;
};

const BASE: MainDemo = {
  pill: '예약 기반 음식점부터 시작합니다',
  title: '요구사항을 쓰지 마세요.\n그려드린 걸 고치세요.',
  lead: '한 문장을 적으면 화면 초안이 먼저 나옵니다.',
  freeNote: '명세까지 무료 · 계약이 성사될 때만 수수료 5%',
  hero: {
    label: '한 문장을 적으면 화면 초안이 그려지고, 필요 없는 기능을 지우면 예상 총액이 예산 안으로 줄어드는 과정',
    steps: ['한 문장 적기', '화면 초안', '지우면 총액이 줄어요'],
    question: '가게에서 불편한 점을 한 문장으로 적어 주세요',
    sentence: ['예약 앱이랑 전화를 같이 받는데', '노쇼가 나면 재료를 다 버려요.'],
    industries: ['음식점', '카페', '미용', '학원', '공방'],
    draftBlocks: ['예약 달력', '예약금 결제', '리마인드 알림', '노쇼 기록'],
    removed: '노쇼 기록',
    budget: '희망 예산 500만원',
    totalBefore: '512만원',
    totalAfter: '441만원',
    budgetBefore: '예산보다 12만원 많아요',
    budgetAfter: '예산 안에 들어옵니다',
  },
  valueTitle: '외주 맡기기가 쉬워집니다',
  valueCards: [
    { title: '기능을 몰라도 시작할 수 있습니다', body: '한 문장이면 화면 초안이 먼저 나옵니다' },
    { title: '예산 안에 드는지 바로 압니다', body: '고칠 때마다 예상 총액이 함께 바뀝니다' },
    { title: '같은 명세로 견적을 비교합니다', body: '공급자마다 처음부터 설명하지 않아도 됩니다' },
  ],
  proposals: [
    { initial: '최', name: '최준호', meta: '경력 5년 · ★ 4.8', quote: 3_100_000 },
    { initial: '김', name: '김세라', meta: '경력 7년 · ★ 4.6', quote: 4_400_000 },
    { initial: '넛', name: '스튜디오 넛', meta: '경력 9년 · 리뷰 없음', quote: 4_500_000 },
  ],
  flowTitle: '명세를 확정한 다음은',
  flowSteps: [
    { title: '명세 확정', body: '확정하면 공급자 모집이 시작됩니다', icon: 'specCheck' },
    { title: '견적 받기', body: '공급자가 총액과 기간을 보냅니다', icon: 'inbox' },
    { title: '조건 정하기', body: '세부 조건은 채팅에서 정합니다', icon: 'chat' },
    { title: '계약 · 예치', body: '대금은 마자용이 맡아 둡니다', icon: 'lock', money: true },
    { title: '검수 후 지급', body: '승인한 만큼만 지급됩니다', icon: 'check', money: true },
  ],
  safetyTitle: '안심하고 맡길 수 있도록',
  safetyCards: [
    { title: '돈은 마자용이 맡아 둡니다', body: '검수를 승인해야 공급자에게 지급됩니다', icon: 'lock' },
    { title: '계약한 범위는 바뀌지 않습니다', body: '확정한 명세가 그대로 검수 기준이 됩니다', icon: 'doc' },
    { title: '명세를 본 사람이 기록됩니다', body: '공급자는 비밀유지에 동의하고 열람합니다', icon: 'eye' },
  ],
  ctaTitle: '지금 겪고 있는 불편을 한 문장으로 적어보세요',
  ctaLead: '기능을 몰라도 괜찮습니다. 화면을 먼저 그려드립니다.',
};

const BY_MOCK: Record<MainMock, MainDemo> = {
  기본: BASE,
};

export function resolveMainMock(raw: string | null): MainMock {
  if (raw && (MAIN_MOCKS as readonly string[]).includes(raw)) return raw as MainMock;
  return '기본';
}

export function mainDemoOf(mock: MainMock): MainDemo {
  return BY_MOCK[mock];
}

/* 공급자 홈 시연 데이터 — PRD F-18 · F-17 · 9.6.
 * 추천 카드에는 예산 · AI 금액 · 단가를 두지 않는다(@majayong/types/supplier). */
import type { SupplierProjectCard } from '@majayong/types/supplier';

export const HOME_MOCKS = ['기본', '첫 방문'] as const;
export type HomeMock = (typeof HOME_MOCKS)[number];

export function resolveHomeMock(raw: string | null): HomeMock {
  if (raw && (HOME_MOCKS as readonly string[]).includes(raw)) return raw as HomeMock;
  return '기본';
}

export const PROJECT_HREF = '/s/projects/p-ondo';
export const FIND_HREF = '/s/projects';
export const PROFILE_HREF = '/s/profile';
export const ACCOUNT_HREF = '/s/account';
export const DELIVER_HREF = '/s/contracts/c-ondo/deliver';
export const CHAT_HREF = '/s/chat/p-ondo';

export const DEMO = {
  hello: '안녕하세요, 최준호님',
  helloMeta: '웹 외주 프리랜서 5년 차 · ★ 4.8 (리뷰 12건)',
  helloFirst: '환영합니다, 최준호님',
  helloFirstMeta: '공급자 가입을 마쳤습니다 · 아직 지원한 프로젝트가 없습니다',
  focusKick: '지금 할 일',
  focusTitle: '납품 2건이 검수를 기다립니다',
  focusBody:
    '의뢰인이 항목별로 확인한 뒤 승인하면 중간 구간 금액이 지급됩니다. 보완 요청이 오면 그 항목만 다시 납품하시면 됩니다.',
  focusCta: '납품 현황 보기',
  focusHref: DELIVER_HREF,
  focusSideTitle: '온도 다이닝 · 예약 달력, 예약금 결제 외 2개 기능',
  focusSideRows: [
    { k: '검수 상태', v: '4건 중 2건 제출 · 검수 중' },
    { k: '구간', v: '중간 검수 대기' },
    { k: '작업 마감', v: '12월 16일' },
  ],
  firstKick: '처음 오셨나요',
  firstTitle: '업종과 기술 스택이 맞는 프로젝트부터 찾아보세요',
  firstBody:
    '의뢰인이 기능을 고르고 AI가 정리한 명세를 보고, 할 수 있는 항목과 총액 · 기간으로 견적을 냅니다. 의뢰인이 문의하면 채팅이 열립니다.',
  firstCta: '프로젝트 찾기',
  firstHref: FIND_HREF,
  recommendTitle: '추천 프로젝트',
  recommendAll: '전체 보기',
  recommendNote:
    '활동 업종이 같은 프로젝트 중 내 기술 스택과 겹치는 수가 많은 순입니다. 이미 지원한 프로젝트는 빼며, 예산 · AI 예상 금액은 보여 주지 않습니다.',
  checklistTitle: '프로필 채우기',
  checklistDone: 1,
  checklistTotal: 4,
} as const;

export type ChecklistItem = {
  id: string;
  label: string;
  hint: string;
  done: boolean;
  cta: string;
  href: string;
};

export const CHECKLIST: ChecklistItem[] = [
  {
    id: 'profile',
    label: '프로필',
    hint: '활동 소개와 경력을 채웁니다',
    done: true,
    cta: '프로필 보기',
    href: PROFILE_HREF,
  },
  {
    id: 'stack',
    label: '기술 스택',
    hint: '추천 프로젝트를 고르는 데 씁니다',
    done: false,
    cta: '기술 스택 채우기',
    href: PROFILE_HREF,
  },
  {
    id: 'portfolio',
    label: '포트폴리오',
    hint: '의뢰인이 제안을 비교할 때 봅니다',
    done: false,
    cta: '포트폴리오 올리기',
    href: PROFILE_HREF,
  },
  {
    id: 'account',
    label: '정산 계좌',
    hint: '첫 지급 전까지 넣으시면 됩니다',
    done: false,
    cta: '정산 정보 넣기',
    href: ACCOUNT_HREF,
  },
];

/** 홈 추천용 — 화면에는 스택 일치만 표시(예산 필드 미사용) */
export type RecommendCard = Pick<
  SupplierProjectCard,
  'id' | 'industry' | 'title' | 'itemCount' | 'deadline' | 'matchedSkills' | 'requiredSkills'
> & { deadlineLabel: string };

export const RECOMMENDS_BASE: RecommendCard[] = [
  {
    id: 'p-pickup',
    industry: '카페 · 베이커리',
    title: '픽업 주문, 적립 쿠폰 외 1개 기능',
    itemCount: 3,
    deadline: '2026-11-12',
    deadlineLabel: '마감 11월 12일',
    matchedSkills: ['Next.js'],
    requiredSkills: ['Next.js', 'Node.js'],
  },
  {
    id: 'p-table',
    industry: '음식점',
    title: '테이블 오더, 메뉴판 관리 외 1개 기능',
    itemCount: 3,
    deadline: '2026-11-25',
    deadlineLabel: '마감 11월 25일',
    matchedSkills: ['React'],
    requiredSkills: ['React', 'Node.js'],
  },
  {
    id: 'p-sub',
    industry: '카페 · 베이커리',
    title: '정기 구독, 원두 주문 외 2개 기능',
    itemCount: 4,
    deadline: '2026-11-28',
    deadlineLabel: '마감 11월 28일',
    matchedSkills: ['Next.js'],
    requiredSkills: ['Next.js'],
  },
];

export const RECOMMENDS_FIRST: RecommendCard[] = [
  {
    id: 'p-ondo',
    industry: '음식점',
    title: '예약 달력, 예약금 결제 외 2개 기능',
    itemCount: 4,
    deadline: '2026-11-03',
    deadlineLabel: '마감 11월 3일 · 2일 남음',
    matchedSkills: ['React', 'Supabase'],
    requiredSkills: ['React', 'Supabase'],
  },
  {
    id: 'p-round',
    industry: '음식점',
    title: '회차 예약, 알레르기 사전 접수 외 2개 기능',
    itemCount: 4,
    deadline: '2026-11-09',
    deadlineLabel: '마감 11월 9일',
    matchedSkills: ['React', 'Supabase'],
    requiredSkills: ['React', 'Supabase'],
  },
  RECOMMENDS_BASE[0]!,
];

export type HomeDemo = {
  first: boolean;
  recommends: RecommendCard[];
};

export function homeDemoOf(mock: HomeMock): HomeDemo {
  return {
    first: mock === '첫 방문',
    recommends: mock === '첫 방문' ? RECOMMENDS_FIRST : RECOMMENDS_BASE,
  };
}

export function matchLabel(n: number) {
  return `기술 스택 ${n}개 일치`;
}

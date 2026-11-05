/* 공급자 공개 프로필 시연 — PRD F-21 · F-23. 판정 문구 없음. */

export const PUBLIC_MOCKS = ['기본', '리뷰 없음'] as const;
export type PublicMock = (typeof PUBLIC_MOCKS)[number];

export type PublicProfile = {
  sid: string;
  name: string;
  initial: string;
  role: string;
  career: string;
  business: string;
  rating: number | null;
  reviewCount: number;
  done: number;
  joined: string;
  industry: string;
  stack: string[];
  bio: string;
  summary: string | null;
  links: { t: string; s: string }[];
  reviews: {
    score: number;
    date: string;
    who: string;
    contract: string;
    tags: string[];
    text: string;
  }[];
};

const JUNHO_REVIEWS: PublicProfile['reviews'] = [
  {
    score: 5,
    date: '10월 20일',
    who: '음식점(한식 주점)',
    contract: '테이블 예약, 대기 등록 외 2개 기능',
    tags: ['설명이 쉬웠어요', '일정을 지켰어요'],
    text: '대기 등록 화면을 직원들이 바로 쓸 수 있게 만들어 주셨습니다. 관리 화면 사용법도 짧게 정리해 주셨어요.',
  },
  {
    score: 5,
    date: '9월 28일',
    who: '음식점(이탈리안)',
    contract: '코스 예약, 와인 리스트 외 1개 기능',
    tags: ['일정을 지켰어요', '조건대로 만들었어요', '다시 맡기고 싶어요'],
    text: '예약 마감 시각처럼 제가 미처 생각 못 한 부분을 채팅에서 먼저 물어봐 주셔서 좋았습니다.',
  },
  {
    score: 4,
    date: '8월 24일',
    who: '베이커리',
    contract: '케이크 예약, 픽업 시간 선택 외 1개 기능',
    tags: ['조건대로 만들었어요', '보완 요청에 빨리 답했어요'],
    text: '픽업 시간 선택이 정해진 조건대로 잘 됩니다. 범위 안에서 꼼꼼하게 해 주셨습니다.',
  },
  {
    score: 5,
    date: '7월 9일',
    who: '카페',
    contract: '원두 정기배송 신청 외 1개 기능',
    tags: ['다시 맡기고 싶어요', '일정을 지켰어요'],
    text: '마감보다 사흘 먼저 납품해 주셨고, 결제 연동 테스트까지 같이 봐 주셨습니다.',
  },
];

export const PROFILES: Record<string, PublicProfile> = {
  's-junho': {
    sid: 's-junho',
    name: '최준호',
    initial: '최',
    role: '웹 외주 프리랜서',
    career: '경력 5년',
    business: '사업자',
    rating: 4.8,
    reviewCount: 12,
    done: 12,
    joined: '2025년 가입',
    industry: '예약 기반 음식점',
    stack: ['React', 'Next.js', 'Supabase'],
    bio: '예약·결제 연동 위주로 작업해 온 웹 개발 프리랜서입니다. 소규모 식당 사이트를 열두 곳 만들었습니다.',
    summary:
      '소규모 식당 예약 사이트 12곳을 만들었습니다. 예약 달력과 PG 결제 연동 작업이 대부분이고, 가장 최근 작업은 회차제 코스 레스토랑의 예약 사이트입니다.',
    links: [
      { t: 'junho.work', s: '작업 사례와 소개' },
      { t: 'junho-works.kr/booking', s: '최근 작업 — 회차제 코스 레스토랑 예약' },
      { t: '작업소개서.pdf', s: 'PDF · 올린 파일' },
    ],
    reviews: JUNHO_REVIEWS,
  },
  's-sera': {
    sid: 's-sera',
    name: '김세라',
    initial: '김',
    role: '웹 외주 프리랜서',
    career: '경력 3년',
    business: '개인',
    rating: null,
    reviewCount: 0,
    done: 0,
    joined: '2026년 10월 가입',
    industry: '예약 기반 음식점',
    stack: ['Vue', 'Firebase', 'Figma'],
    bio: '소규모 가게 웹사이트를 중심으로 작업합니다. 예약·메뉴 소개 화면을 주로 만듭니다.',
    summary: null,
    links: [{ t: 'sera.dev', s: '작업 소개' }],
    reviews: [],
  },
};

export const DEMO = {
  back: '제안 비교로 돌아가기',
  backHref: '/c/projects/p-ondo/proposals',
  portfolio: '포트폴리오',
  summaryLabel: '포트폴리오 요약',
  summaryHint: 'AI가 등록 자료를 읽고 정리 · 공급자가 확인 후 공개',
  noSummary: '요약이 아직 없습니다. 아래 등록 자료를 직접 열어 보세요.',
  reviewsTitle: '받은 리뷰',
  emptyTitle: '아직 받은 리뷰가 없습니다',
  emptyBody: '마자용에서 거래를 마치면 리뷰가 쌓입니다.',
  contactNote:
    '연락처는 공개하지 않습니다. 계약이 체결된 뒤 채팅에서 주고받을 수 있습니다.',
} as const;

export function resolvePublicMock(raw: string | null, sid: string | undefined): PublicMock {
  if (raw && (PUBLIC_MOCKS as readonly string[]).includes(raw)) return raw as PublicMock;
  if (sid === 's-sera') return '리뷰 없음';
  return '기본';
}

export function profileOf(mock: PublicMock, sid: string | undefined): PublicProfile {
  if (mock === '리뷰 없음') return PROFILES['s-sera']!;
  if (sid && PROFILES[sid]) return PROFILES[sid]!;
  return PROFILES['s-junho']!;
}

export function starsOf(score: number): string {
  return `${'★'.repeat(score)}${'☆'.repeat(Math.max(0, 5 - score))}`;
}

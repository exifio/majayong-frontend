/* 공급자 내 프로필 시연 — PRD F-07 · F-21 · F-23. */

export const PROFILE_MOCKS = [
  '기본 정보',
  '받은 리뷰',
  '요약 공개 중',
  '확인 대기',
  '숨김',
] as const;
export type ProfileMock = (typeof PROFILE_MOCKS)[number];
export type SummaryState = '요약 공개 중' | '확인 대기' | '숨김';

export const DEMO = {
  name: '최준호',
  initial: '최',
  roleMeta: '공급자 · 웹 외주 프리랜서 5년 차 · 2025년 가입',
  ratingLine: '★ 4.8 (리뷰 12건)',
  tabs: [
    { key: 'basic', label: '기본 정보' },
    { key: 'reviews', label: '받은 리뷰' },
  ] as const,

  nameLabel: '활동 이름',
  nameHint: '지원에 필요',
  career: '경력',
  careerValue: '5',
  careerHint: '연 단위로 적어 주세요.',
  business: '구분',
  businessValue: '사업자',
  businessOptions: ['사업자', '개인'] as const,
  skills: '기술 스택',
  skillOptions: [
    'React',
    'Next.js',
    'Supabase',
    'Node.js',
    'PG 연동',
    'Vue',
    'SQL',
    'Firebase',
    '디자인',
  ] as const,
  skillSelected: ['React', 'Next.js', 'Supabase'] as const,
  portfolio: '포트폴리오 링크',
  portfolioValue: 'https://junho.work',
  portfolioHint: '작업한 사이트, 깃허브, 노션 등.',

  summaryTitle: '포트폴리오 요약',
  summaryBody:
    '소규모 식당 예약 사이트 12곳을 만들었습니다. 예약 달력과 PG 결제 연동 작업이 대부분이고, 가장 최근 작업은 회차제 코스 레스토랑의 예약 사이트입니다.',
  summaryHints: {
    '요약 공개 중': '의뢰인 제안 비교 카드에 이 요약이 보입니다. 숨기면 링크만 보입니다.',
    '확인 대기': 'AI가 만든 초안입니다. 확인하신 뒤에 공개됩니다.',
    숨김: '숨겨 두었습니다. 의뢰인에게는 등록한 링크만 보입니다.',
  } as const,

  cancel: '취소',
  save: '저장',

  avg: '4.8',
  reviewSummary: '받은 리뷰 12건 · 완료한 계약 12건',
  reviewHint:
    '리뷰는 공개 프로필과 의뢰인의 제안 비교 카드에 보입니다. 계약을 마친 의뢰인이 계약당 한 번 씁니다.',
  reviewListTitle: '최근 리뷰',
  tagCounts: [
    { n: '일정을 지켰어요', c: 10 },
    { n: '조건대로 만들었어요', c: 9 },
    { n: '다시 맡기고 싶어요', c: 8 },
    { n: '설명이 쉬웠어요', c: 7 },
    { n: '보완 요청에 빨리 답했어요', c: 6 },
  ] as const,
  reviews: [
    {
      who: '음식점(한식 주점)',
      date: '10월 20일',
      score: 5,
      tags: ['설명이 쉬웠어요', '일정을 지켰어요'],
      text: '대기 등록 화면을 직원들이 바로 쓸 수 있게 만들어 주셨습니다. 관리 화면 사용법도 짧게 정리해 주셨어요.',
      ctx: '테이블 예약, 대기 등록 외 2개 기능',
    },
    {
      who: '음식점(이탈리안)',
      date: '9월 28일',
      score: 5,
      tags: ['일정을 지켰어요', '조건대로 만들었어요', '다시 맡기고 싶어요'],
      text: '예약 마감 시각처럼 제가 미처 생각 못 한 부분을 채팅에서 먼저 물어봐 주셔서 좋았습니다.',
      ctx: '코스 예약, 와인 리스트 외 1개 기능',
    },
    {
      who: '베이커리',
      date: '8월 24일',
      score: 4,
      tags: ['조건대로 만들었어요', '보완 요청에 빨리 답했어요'],
      text: '픽업 시간 선택이 정해진 조건대로 잘 됩니다. 범위 안에서 꼼꼼하게 해 주셨습니다.',
      ctx: '케이크 예약, 픽업 시간 선택 외 1개 기능',
    },
    {
      who: '카페',
      date: '7월 9일',
      score: 5,
      tags: ['다시 맡기고 싶어요', '일정을 지켰어요'],
      text: '마감보다 사흘 먼저 납품해 주셨고, 결제 연동 테스트까지 같이 봐 주셨습니다.',
      ctx: '원두 정기배송 신청 외 1개 기능',
    },
  ] as const,
} as const;

export function resolveProfileMock(raw: string | null, tab: string | null): ProfileMock {
  if (raw && (PROFILE_MOCKS as readonly string[]).includes(raw)) return raw as ProfileMock;
  if (tab === 'reviews') return '받은 리뷰';
  return '기본 정보';
}

export function summaryOf(mock: ProfileMock): SummaryState {
  if (mock === '확인 대기' || mock === '숨김' || mock === '요약 공개 중') return mock;
  return '요약 공개 중';
}

export function starsOf(score: number): string {
  return `${'★'.repeat(score)}${'☆'.repeat(Math.max(0, 5 - score))}`;
}

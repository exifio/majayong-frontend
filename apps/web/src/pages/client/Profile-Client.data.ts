/* 의뢰인 내 프로필 시연 — PRD F-07 · F-23. */

export const PROFILE_MOCKS = ['기본 정보', '받은 리뷰'] as const;
export type ProfileMock = (typeof PROFILE_MOCKS)[number];

export const DEMO = {
  name: '정민재',
  initial: '민',
  roleMeta: '의뢰인 · 음식점(코스 레스토랑) · 2026년 8월 가입',
  ratingLine: '★ 4.5 (리뷰 2건)',
  publicLink: '공급자에게 보이는 모습',
  tabs: [
    { key: 'basic', label: '기본 정보' },
    { key: 'reviews', label: '받은 리뷰' },
  ] as const,
  biz: '상호',
  bizValue: '온도 다이닝',
  bizNeeded: '프로젝트 등록에 필요',
  industry: '업종',
  industryValue: '카운터 코스 레스토랑',
  industries: ['카운터 코스 레스토랑', '음식점(코스 레스토랑)', '기타 (직접 입력)'] as const,
  scale: '규모',
  scaleValue: '10석',
  scaleHint: '좌석 수나 직원 규모를 적어 주세요.',
  joined: '가입',
  joinedValue: '2026년 8월 가입',
  intro: '한 줄 소개',
  introValue: '카운터 10석 코스 레스토랑을 3년째 운영하고 있습니다. 전화 예약을 줄이고 싶어요.',
  note: '연락처는 받지 않습니다. 이메일은 로그인에만 쓰이며 어느 단계에서도 공개되지 않습니다.',
  cancel: '취소',
  save: '저장',
  avg: '4.5',
  reviewSummary: '받은 리뷰 2건 · 완료한 계약 2건',
  reviewHint: '함께 일한 공급자가 계약을 마친 뒤 남긴 리뷰입니다. 한 번만 쓸 수 있고 고칠 수 없습니다.',
  reviewListTitle: '리뷰 2건',
  tagCounts: [
    { n: '검수가 빨랐어요', c: 2 },
    { n: '조건을 분명히 정해 줬어요', c: 1 },
    { n: '답장이 빨랐어요', c: 1 },
    { n: '요청 범위를 지켰어요', c: 1 },
    { n: '다시 일하고 싶어요', c: 1 },
  ] as const,
  reviews: [
    {
      who: '이도윤',
      date: '10월 2일',
      score: 5,
      tags: ['검수가 빨랐어요', '요청 범위를 지켰어요', '다시 일하고 싶어요'],
      text: '계약에 없는 요청은 새 프로젝트로 나눠 주셔서 범위가 흔들리지 않았습니다. 검수도 이틀 안에 끝내 주셨어요.',
      ctx: '메뉴판 페이지, 오시는 길 외 1개 기능 · 합의 900,000원',
    },
    {
      who: '한서진',
      date: '9월 20일',
      score: 4,
      tags: ['조건을 분명히 정해 줬어요', '검수가 빨랐어요', '답장이 빨랐어요'],
      text: '처음 문의 때부터 무엇을 정해야 하는지 알고 계셔서 진행이 빨랐습니다. 검수 기준이 분명해서 좋았습니다.',
      ctx: '단체 예약 문의 폼 외 1개 기능 · 합의 700,000원',
    },
  ] as const,
} as const;

export function resolveProfileMock(raw: string | null, tab: string | null): ProfileMock {
  if (raw && (PROFILE_MOCKS as readonly string[]).includes(raw)) return raw as ProfileMock;
  if (tab === 'reviews') return '받은 리뷰';
  return '기본 정보';
}

export function starsOf(score: number): string {
  return `${'★'.repeat(score)}${'☆'.repeat(Math.max(0, 5 - score))}`;
}

/* 의뢰인 공개 프로필 시연 — PRD F-07 · F-23. 공급자 공개 범위만. */

export const PUBLIC_MOCKS = ['기본', '첫 거래'] as const;
export type PublicMock = (typeof PUBLIC_MOCKS)[number];

export const DEMO = {
  back: '프로젝트로 돌아가기',
  backHref: '/s/projects/p-ondo',
  viewBand: '상세 공개 정보입니다 · 열람 기록이 남습니다 · 비밀유지 의무',

  name: '정민재',
  biz: '온도 다이닝',
  initial: '민',
  industry: '카운터 코스 레스토랑',
  seats: '10석',
  joined: '2026년 8월 가입',
  rating: 4.5,
  done: 2,
  intro: '마포에서 10석 코스 레스토랑을 운영합니다. 전화 예약을 줄이고 싶어요.',
  address: '서울 마포구 와우산로 00길 00',
  website: 'ondo-dining.kr',

  reviewsTitle: '받은 리뷰',
  emptyTitle: '아직 완료한 거래가 없습니다',
  emptyBody: '이 의뢰인과 계약을 마친 공급자가 리뷰를 남기면 여기에 보입니다.',
  contactNote:
    '연락처 · 계정 이메일은 보이지 않습니다. 의뢰인이 채팅을 열면 대화할 수 있습니다.',

  tagCounts: [
    { n: '검수가 빨랐어요', c: 2 },
    { n: '조건을 분명히 정해 줬어요', c: 1 },
    { n: '답장이 빨랐어요', c: 1 },
    { n: '요청 범위를 지켰어요', c: 1 },
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

export function resolvePublicMock(raw: string | null): PublicMock {
  if (raw && (PUBLIC_MOCKS as readonly string[]).includes(raw)) return raw as PublicMock;
  return '기본';
}

export function starsOf(score: number): string {
  return `${'★'.repeat(score)}${'☆'.repeat(Math.max(0, 5 - score))}`;
}

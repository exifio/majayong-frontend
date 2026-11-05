/* 내 프로젝트 시연 — PRD F-03 · 결정메모 #9. */

export const MY_MOCKS = ['홈과 같은 데이터', '모든 상태 예시', '프로젝트 없음'] as const;
export type MyMock = (typeof MY_MOCKS)[number];

export const DEMO = {
  title: '내 프로젝트',
  sub: '작성 중인 초안부터 계약까지, 맡기신 일을 한곳에서 봅니다.',
  newCta: '새 프로젝트',
  newHref: '/c/drafts/new',
  emptyTitle: '아직 맡기신 프로젝트가 없습니다',
  emptyBody: '불편한 점을 한 문장으로 적으면 화면 초안부터 그려드립니다.',
  emptyCta: '첫 프로젝트 만들기',
  draftHref: '/c/drafts/d-ondo',
  projectHref: '/c/projects/p-ondo',
  quotesLabel: '받은 견적',
} as const;

export type ProjectCard = {
  id: string;
  title: string;
  status: string;
  quotes?: number;
  deadlineAt?: string;
  deadlineLabel?: string;
  meta: string;
  href: string;
  isDraft: boolean;
  showAi?: boolean;
  aiAmount?: number;
};

export function resolveMyMock(raw: string | null): MyMock {
  if (raw && (MY_MOCKS as readonly string[]).includes(raw)) return raw as MyMock;
  return '홈과 같은 데이터';
}

const RECRUITING: ProjectCard = {
  id: 'p-ondo',
  title: '예약 달력, 예약금 결제 외 2개 기능',
  status: '모집 중',
  quotes: 3,
  deadlineAt: '2026-11-03T23:59:00+09:00',
  deadlineLabel: '모집 마감',
  meta: '명세 항목 4개 · 문의 중 2건',
  href: DEMO.projectHref,
  isDraft: false,
};

const DRAFTING: ProjectCard = {
  id: 'd-ondo',
  title: '단골 등급 관리 외 2개 기능',
  status: '작성 중',
  meta: '명세 항목 3개 · 3일 전 수정',
  href: DEMO.draftHref,
  isDraft: true,
  showAi: true,
  aiAmount: 1_092_000,
};

const SIGNING: ProjectCard = {
  id: 'p-sign',
  title: '노쇼 위약금 자동 청구 외 1개 기능',
  status: '임시 계약',
  quotes: 1,
  deadlineAt: '2026-11-10T23:59:00+09:00',
  deadlineLabel: '서명 기한',
  meta: '공급자 이도윤 · 작업 28일',
  href: '/c/contracts/c-ondo',
  isDraft: false,
};

const ACTIVE: ProjectCard = {
  id: 'p-active',
  title: '예약 확정 문자 외 2개 기능',
  status: '계약 중',
  meta: '공급자 한서윤 · 예치 완료',
  href: '/c/contracts/c-ondo',
  isDraft: false,
};

const DONE: ProjectCard = {
  id: 'p-done',
  title: '리마인드 알림 외 1개 기능',
  status: '완료',
  meta: '공급자 박서준 · 최종 지급 완료',
  href: '/c/contracts/c-ondo/review',
  isDraft: false,
};

const SCHEDULED: ProjectCard = {
  id: 'p-sched',
  title: '알레르기·선호 메모 외 1개 기능',
  status: '모집 예정',
  deadlineAt: '2026-11-10T00:00:00+09:00',
  deadlineLabel: '모집 시작',
  meta: '명세 항목 2개',
  href: DEMO.projectHref,
  isDraft: false,
};

export type MyDemo = {
  mock: MyMock;
  empty: boolean;
  cards: ProjectCard[];
};

export function myDemoOf(mock: MyMock): MyDemo {
  if (mock === '프로젝트 없음') {
    return { mock, empty: true, cards: [] };
  }
  if (mock === '모든 상태 예시') {
    return {
      mock,
      empty: false,
      cards: [SIGNING, RECRUITING, DRAFTING, SCHEDULED, ACTIVE, DONE],
    };
  }
  return { mock, empty: false, cards: [RECRUITING, DRAFTING] };
}

/* 프로젝트 찾기 · 북마크 시연 — 보드 Find-Supplier · PRD F-08 · 7.1 전체 공개
 * 카드에 AI 금액 · 의뢰인 정보 · 기능 설명 없음. */

export const FIND_MOCKS = ['전체', '북마크', '검색 결과 없음'] as const;
export type FindMock = (typeof FIND_MOCKS)[number];

export const MY_STACK = ['React', 'Next.js', 'Supabase'] as const;

export const PROJECT_DETAIL_HREF = '/s/projects/p-ondo';
export const FIND_HREF = '/s/projects';
export const BOOKMARKS_HREF = '/s/projects?view=bookmarks';

export const PAGE_SIZE = 10;

export type SortKey = 'latest' | 'deadline' | 'budget';

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '최신순' },
  { key: 'deadline', label: '마감임박순' },
  { key: 'budget', label: '예산 높은순' },
];

export const CATEGORIES = [
  { name: '음식점', count: 11 },
  { name: '카페 · 베이커리', count: 5 },
  { name: '미용 · 뷰티', count: 3 },
  { name: '학원 · 교육', count: 2 },
  { name: '숙박', count: 2 },
] as const;

export const BUDGET_FILTERS = ['200만원 미만', '200~400만원', '400만원 이상'] as const;

export const STACK_FILTERS = ['React', 'Next.js', 'Supabase', 'Vue', 'Firebase', 'Node.js'] as const;

export type DeadlineFilter = '3' | '7' | 'all';

export type ProjectCard = {
  id: string;
  category: string;
  title: string;
  items: string[];
  /** Attr 값 — 예: 400~500만원 */
  budget: string;
  /** 정렬용(만원 구간 상한 근사) */
  budgetHigh: number;
  deadlineLabel: string;
  deadlineSoon: boolean;
  /** 정렬용 YYYY-MM-DD */
  deadlineAt: string;
  stack: string[];
  bookmarked: boolean;
  closed: boolean;
  /** 정렬용(클수록 최신) */
  newest: number;
};

/** 보드 시연 10건 — 전체 공개 필드만 */
export const PROJECTS: ProjectCard[] = [
  {
    id: 'p-ondo',
    category: '음식점',
    title: '예약 달력, 예약금 결제 외 2개 기능',
    items: ['예약 달력', '예약금 결제', '노쇼 기록', '리마인드 알림'],
    budget: '400~500만원',
    budgetHigh: 500,
    deadlineLabel: '마감 11월 3일 · 2일 남음',
    deadlineSoon: true,
    deadlineAt: '2026-11-03',
    stack: ['React', 'Supabase'],
    bookmarked: true,
    closed: false,
    newest: 10,
  },
  {
    id: 'p-2',
    category: '음식점',
    title: '회차 예약, 알레르기 사전 접수 외 2개 기능',
    items: ['회차 예약', '알레르기 사전 접수', '코스 안내', '예약 확인 문자'],
    budget: '200~300만원',
    budgetHigh: 300,
    deadlineLabel: '마감 11월 9일',
    deadlineSoon: false,
    deadlineAt: '2026-11-09',
    stack: ['React', 'Supabase'],
    bookmarked: false,
    closed: false,
    newest: 9,
  },
  {
    id: 'p-3',
    category: '카페 · 베이커리',
    title: '픽업 주문, 적립 쿠폰 외 1개 기능',
    items: ['픽업 주문', '적립 쿠폰', '영업시간 안내'],
    budget: '100~200만원',
    budgetHigh: 200,
    deadlineLabel: '마감 11월 12일',
    deadlineSoon: false,
    deadlineAt: '2026-11-12',
    stack: ['Next.js'],
    bookmarked: false,
    closed: false,
    newest: 8,
  },
  {
    id: 'p-4',
    category: '음식점',
    title: '좌석 배치도, 코스 메뉴 선택 외 3개 기능',
    items: ['좌석 배치도', '코스 메뉴 선택', '단체 예약', '대기 등록', '리뷰 모음'],
    budget: '300~400만원',
    budgetHigh: 400,
    deadlineLabel: '마감 11월 21일',
    deadlineSoon: false,
    deadlineAt: '2026-11-21',
    stack: ['Vue', 'Firebase'],
    bookmarked: true,
    closed: false,
    newest: 7,
  },
  {
    id: 'p-5',
    category: '미용 · 뷰티',
    title: '디자이너별 예약, 시술 사진 갤러리 외 2개 기능',
    items: ['디자이너별 예약', '시술 사진 갤러리', '예약금 결제', '리마인드 알림'],
    budget: '200~300만원',
    budgetHigh: 300,
    deadlineLabel: '마감 11월 14일',
    deadlineSoon: false,
    deadlineAt: '2026-11-14',
    stack: ['React'],
    bookmarked: false,
    closed: false,
    newest: 6,
  },
  {
    id: 'p-6',
    category: '학원 · 교육',
    title: '수강 신청, 출결 알림 외 1개 기능',
    items: ['수강 신청', '출결 알림', '공지 게시판'],
    budget: '300~400만원',
    budgetHigh: 400,
    deadlineLabel: '마감 11월 18일',
    deadlineSoon: false,
    deadlineAt: '2026-11-18',
    stack: ['Next.js', 'Supabase'],
    bookmarked: false,
    closed: false,
    newest: 5,
  },
  {
    id: 'p-7',
    category: '음식점',
    title: '테이블 오더, 메뉴판 관리 외 1개 기능',
    items: ['테이블 오더', '메뉴판 관리', '주방 알림'],
    budget: '200~300만원',
    budgetHigh: 300,
    deadlineLabel: '마감 11월 25일',
    deadlineSoon: false,
    deadlineAt: '2026-11-25',
    stack: ['React', 'Node.js'],
    bookmarked: false,
    closed: false,
    newest: 4,
  },
  {
    id: 'p-8',
    category: '카페 · 베이커리',
    title: '정기 구독, 원두 주문 외 2개 기능',
    items: ['정기 구독', '원두 주문', '배송 조회', '적립 쿠폰'],
    budget: '300~400만원',
    budgetHigh: 400,
    deadlineLabel: '마감 11월 28일',
    deadlineSoon: false,
    deadlineAt: '2026-11-28',
    stack: ['Next.js'],
    bookmarked: false,
    closed: false,
    newest: 3,
  },
  {
    id: 'p-9',
    category: '음식점',
    title: '단골 등급 관리, 재방문 알림 외 1개 기능',
    items: ['단골 등급 관리', '재방문 알림', '쿠폰 발송'],
    budget: '100~200만원',
    budgetHigh: 200,
    deadlineLabel: '마감 11월 14일',
    deadlineSoon: false,
    deadlineAt: '2026-11-14',
    stack: ['Next.js'],
    bookmarked: false,
    closed: false,
    newest: 2,
  },
  {
    id: 'p-10',
    category: '숙박',
    title: '객실 예약, 후기 모음 외 2개 기능',
    items: ['객실 예약', '후기 모음', '체크인 안내', '부가 서비스'],
    budget: '400~500만원',
    budgetHigh: 500,
    deadlineLabel: '10월 30일 마감',
    deadlineSoon: false,
    deadlineAt: '2026-10-30',
    stack: ['React'],
    bookmarked: true,
    closed: true,
    newest: 1,
  },
];

export const DEMO = {
  findTitle: '프로젝트 찾기',
  findSub:
    '목록에는 업종 · 기능 이름 · 항목 수 · 희망 예산 구간 · 마감일만 보입니다. 기능 설명과 의뢰인 정보는 명세를 열면 보이고, 열람 기록이 남습니다.',
  bmTitle: '북마크',
  bmSub:
    '명세 상세에서 북마크한 프로젝트입니다. 모집이 끝난 프로젝트도 마감 표시로 남습니다.',
  searchLabel: '키워드 검색',
  searchPlaceholder: '제목이나 기능 이름으로 찾기 — 예: 예약, 쿠폰',
  searchBtn: '검색',
  emptyQ: '키오스크 연동',
  emptyTitle: (q: string) => `‘${q}’에 맞는 프로젝트가 없습니다`,
  emptyBody:
    '검색어는 프로젝트 제목과 기능 이름에서만 찾습니다. 기능 설명은 명세를 열어야 보입니다. 필터를 줄이거나 다른 기능 이름으로 찾아 보세요.',
  clearFilters: '필터 모두 지우기',
  myStackView: '내 기술 스택으로 보기',
  countAll: '23건 중 1–10',
  countBm: '북마크 3건 · 모집 중 2 · 마감 1',
  countEmpty: '검색 결과 0건',
  footFind:
    '한 쪽에 10건씩 보여 드립니다. 파란 테두리 기술 스택은 프로필에 등록하신 것과 같은 스택입니다. 희망 예산은 구간으로만 보이고, 정확한 금액은 명세 상세에 있습니다.',
  footBm: '북마크는 프로젝트 상세의 북마크 버튼으로 켜고 끕니다.',
  openBtn: '명세 열어보기',
  closedBtn: '명세 보기',
  budgetLabel: '희망 예산',
} as const;

export function resolveFindMock(mock: string | null, view: string | null): FindMock {
  if (view === 'bookmarks' || mock === '북마크' || mock === '북마크(?view=bookmarks)') {
    return '북마크';
  }
  if (mock === '검색 결과 없음') return '검색 결과 없음';
  if (mock && (FIND_MOCKS as readonly string[]).includes(mock)) return mock as FindMock;
  return '전체';
}

export function isMyStack(name: string): boolean {
  return (MY_STACK as readonly string[]).includes(name);
}

export function budgetBucket(budget: string): (typeof BUDGET_FILTERS)[number] | null {
  const high = Number(budget.match(/(\d+)만원$/)?.[1] ?? 0);
  const low = Number(budget.match(/^(\d+)/)?.[1] ?? 0);
  if (high > 0 && high < 200 && low < 200) return '200만원 미만';
  if (low >= 400 || high >= 400) return '400만원 이상';
  return '200~400만원';
}

export function sortProjects(list: ProjectCard[], sort: SortKey): ProjectCard[] {
  const copy = [...list];
  if (sort === 'latest') copy.sort((a, b) => b.newest - a.newest);
  else if (sort === 'deadline') copy.sort((a, b) => a.deadlineAt.localeCompare(b.deadlineAt));
  else copy.sort((a, b) => b.budgetHigh - a.budgetHigh);
  return copy;
}

export function filterProjects(
  list: ProjectCard[],
  opts: {
    q: string;
    categories: Set<string>;
    budgets: Set<string>;
    stacks: Set<string>;
    deadline: DeadlineFilter;
    openOnly: boolean;
    closedOnly: boolean;
    bookmarksOnly: boolean;
    bookmarkedIds: Set<string>;
  },
): ProjectCard[] {
  const q = opts.q.trim().toLowerCase();
  return list.filter((p) => {
    if (opts.bookmarksOnly && !opts.bookmarkedIds.has(p.id)) return false;
    if (opts.openOnly && !opts.closedOnly && p.closed) return false;
    if (opts.closedOnly && !opts.openOnly && !p.closed) return false;
    if (!opts.openOnly && !opts.closedOnly) return false;
    if (opts.categories.size && !opts.categories.has(p.category)) return false;
    if (opts.budgets.size) {
      const b = budgetBucket(p.budget);
      if (!b || !opts.budgets.has(b)) return false;
    }
    if (opts.stacks.size && !p.stack.some((s) => opts.stacks.has(s))) return false;
    if (opts.deadline === '3' && !p.deadlineSoon) return false;
    if (opts.deadline === '7') {
      // 시연: 마감임박(soon) 또는 11월 9일까지
      if (!(p.deadlineSoon || p.deadlineAt <= '2026-11-09')) return false;
    }
    if (q) {
      const hay = `${p.title} ${p.items.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

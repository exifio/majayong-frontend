/* 의뢰인 홈 시연 데이터 — PRD F-18 · 9.6. 화면에서 계산하지 않는다. */

export const HOME_MOCKS = ['기본', '첫 방문'] as const;
export type HomeMock = (typeof HOME_MOCKS)[number];

export function resolveHomeMock(raw: string | null): HomeMock {
  if (raw && (HOME_MOCKS as readonly string[]).includes(raw)) return raw as HomeMock;
  return '기본';
}

export const DEMO = {
  hello: '안녕하세요, 정민재님',
  helloMeta: '온도 다이닝 · 음식점(코스 레스토랑)',
  focusKick: '지금 할 일',
  focusTitle: '최준호님이 먼저 서명했습니다',
  focusBody:
    '계약서를 확인하고 서명하면 계약이 체결됩니다. 서명 뒤 3일 안에 예치하면 작업이 시작됩니다.',
  focusCta: '계약서 확인하고 서명',
  focusHref: '/c/contracts/c-ondo',
  focusSideTitle: '예약 달력, 예약금 결제 외 2개 기능',
  focusSideRows: [
    { k: '공급자', v: '최준호' },
    { k: '서명 기한', v: '11월 10일' },
    { k: '상태', v: '임시 계약 · 서명 대기' },
  ],
  projectsTitle: '최근 프로젝트',
  projectsAll: '전체 보기',
  projectsAllHref: '/c/projects',
  projectHref: '/c/projects/p-ondo',
  firstTitle: '불편한 점 한 문장이면 시작할 수 있습니다',
  firstBody:
    '요즘 가게에서 번거로운 일을 적어 주시면, 필요한 기능을 화면 초안으로 먼저 그려 드립니다. 고치면서 명세가 만들어지고, 그 명세로 공급자를 모집합니다.',
  firstCta: '첫 프로젝트 만들기',
  firstHref: '/c/drafts/new',
  firstNote: '아직 프로젝트가 없습니다. 가게 정보는 내 프로필에서 언제든 채울 수 있습니다.',
  profileHref: '/c/profile',
  steps: [
    { no: '1', title: '입력', body: '불편한 점을 한 문장으로 적습니다.' },
    { no: '2', title: '초안 확인', body: 'AI가 그린 초안을 고치며 명세를 만듭니다.' },
    { no: '3', title: '견적 받기', body: '명세를 공개하면 공급자 견적을 받아 비교합니다.' },
  ],
} as const;

export type StatCell = { label: string; value: string; sub: string };
export type ProjectRow = {
  id: string;
  title: string;
  status: string;
  meta: string;
  href: string;
};

export type HomeDemo = {
  first: boolean;
  stats: StatCell[];
  projects: ProjectRow[];
};

export function homeDemoOf(mock: HomeMock): HomeDemo {
  if (mock === '첫 방문') {
    return {
      first: true,
      stats: [],
      projects: [],
    };
  }
  return {
    first: false,
    stats: [
      { label: '진행 중 프로젝트', value: '1', sub: '모집 중 · 지원 3건' },
      { label: '받은 견적', value: '3', sub: '문의 중 2건' },
      { label: '진행 중 계약', value: '1', sub: '서명 대기' },
      { label: '안 읽은 메시지', value: '1', sub: '최준호님' },
    ],
    projects: [
      {
        id: 'p-ondo',
        title: '예약 달력, 예약금 결제 외 2개 기능',
        status: '모집 중',
        meta: '명세 항목 4개 · 지원 3건 · 마감 11월 3일',
        href: '/c/projects/p-ondo',
      },
      {
        id: 'p-draft',
        title: '단골 등급 관리 외 2개 기능',
        status: '작성 중',
        meta: '명세 항목 3개 · 3일 전 수정',
        href: '/c/projects/p-ondo',
      },
    ],
  };
}

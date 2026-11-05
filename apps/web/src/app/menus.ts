/* GNB 메뉴 — 디자인 시스템 3절. 공간마다 고정, 모든 화면 동일. 화면마다 바꾸지 않는다.
 * 화면의 주 행동 버튼은 GNB에 넣지 않는다. 공급자 GNB에는 '정산 내역'이 없다(내 계약 → 정산 내역 보기). */
export type MenuItem = { label: string; to: string; match: (path: string, search: URLSearchParams) => boolean };

const starts = (prefix: string) => (p: string) => p === prefix || p.startsWith(`${prefix}/`);

export const CLIENT_MENU: MenuItem[] = [
  { label: '홈', to: '/c', match: (p) => p === '/c' },
  { label: '프로젝트 시작', to: '/c/drafts/new', match: starts('/c/drafts') },
  { label: '내 프로젝트', to: '/c/projects', match: starts('/c/projects') },
  { label: '내 계약', to: '/c/contracts', match: starts('/c/contracts') },
  { label: '정산 내역', to: '/c/settlements', match: starts('/c/settlements') },
];

export const SUPPLIER_MENU: MenuItem[] = [
  { label: '홈', to: '/s', match: (p) => p === '/s' },
  { label: '프로젝트 찾기', to: '/s/projects', match: (p, q) => starts('/s/projects')(p) && q.get('view') !== 'bookmarks' },
  { label: '내 지원', to: '/s/applications', match: starts('/s/applications') },
  { label: '내 계약', to: '/s/contracts', match: (p) => starts('/s/contracts')(p) || starts('/s/settlements')(p) },
  { label: '북마크', to: '/s/projects?view=bookmarks', match: (p, q) => p === '/s/projects' && q.get('view') === 'bookmarks' },
];

export const ADMIN_MENU = [
  { label: '블록 검토', to: '/admin/blocks', queue: 'blocks' },
  { label: '보류된 결제', to: '/admin/payments', queue: 'payments' },
  { label: '환불 처리', to: '/admin/refunds', queue: 'refunds' },
  { label: '이견 개입', to: '/admin/disputes', queue: 'disputes' },
  { label: '신고 처리', to: '/admin/reports', queue: 'reports' },
  { label: '1:1 문의', to: '/admin/inquiries', queue: 'inquiries' },
] as const;

export const ADMIN_MENU_BOTTOM = { label: '이벤트 기록', to: '/admin/events' } as const;

/** 랜딩 안 메뉴(페이지 안 이동) */
export const LANDING_MENU = {
  client: [
    { label: '작동 방식', to: '#how' },
    { label: '안전장치', to: '#safe' },
    { label: '비용', to: '#start' },
  ],
  supplier: [
    { label: '견적 방식', to: '#how' },
    { label: '이용 흐름', to: '#flow' },
    { label: '정산·비용', to: '#price' },
  ],
} as const;

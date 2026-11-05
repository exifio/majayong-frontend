/* ─────────────────────────────────────────────────────────────
 * 마자용 화면 · 경로 목록 — 55개 화면의 단일 원본. 라우터 · 가드 · 테스트가 모두 이 표를 읽는다
 * 기준: 프론트엔드 개발 준비 2절 + 결정메모-프론트엔드 착수 기준 #1 · #2 (11/03)
 *       + M0 착수 계획 '새로 정한 것' (초안 경로 · 견적 경로 · 미설계 화면)
 *
 * 화면 55개 = 비로그인 · 공통 10 + 의뢰인 22 + 공급자 17 + 운영자 6
 *   kind: page     — 자기 경로가 있는 화면
 *         modal    — 부모 경로 + ?modal=<name> (뒤로 가기 = 닫기)
 *         dropdown — GNB 드롭다운(경로 없음)
 * 확인 창 · 신고 · 계정 변경 모달은 URL 없이 화면 상태로 둔다(목록에 없음).
 * 미설계 보조 화면(extra)은 55개에 세지 않는다.
 * ───────────────────────────────────────────────────────────── */

export type Space = 'public' | 'client' | 'supplier' | 'admin';
export type Kind = 'page' | 'modal' | 'dropdown';
export type Shell = 'public' | 'landing-client' | 'landing-supplier' | 'client' | 'supplier' | 'admin' | 'viewer';
export type Guard =
  | 'none'            // 누구나
  | 'guest-only'      // 로그인 상태면 역할 홈으로
  | 'signup-step'     // 가입 진행 중인 사람만
  | 'auth'            // 로그인한 누구나(역할 무관)
  | 'client'
  | 'supplier'
  | 'admin';
export type Milestone = 'M0' | 'M1' | 'M2' | 'M3' | 'M5' | 'M6';

export interface ScreenRoute {
  board: string;          // 캔버스 보드 파일명 = pages/ 폴더명
  name: string;           // 화면 이름(보드 이름과 같음)
  space: Space;
  kind: Kind;
  path: string | null;    // modal은 부모 경로, dropdown은 null
  modal?: string;         // ?modal= 값
  params?: string[];      // 모달 쿼리 파라미터
  shell: Shell;
  guard: Guard;
  milestone: Milestone;   // 실제 화면을 채우는 마일스톤(M0에는 모든 경로가 빈 페이지로 열린다)
  states: string[];       // 보드의 상태(Tweak)
}

export const SCREENS: ScreenRoute[] = [
  // ── 비로그인 · 공통 (10) ─────────────────────────────────────
  { board: 'Main', name: '의뢰인 랜딩', space: 'public', kind: 'page', path: '/', shell: 'landing-client', guard: 'guest-only', milestone: 'M1', states: [] },
  { board: 'Supplier-Landing', name: '공급자 랜딩', space: 'public', kind: 'page', path: '/supplier', shell: 'landing-supplier', guard: 'guest-only', milestone: 'M1', states: [] },
  { board: 'Login', name: '로그인', space: 'public', kind: 'modal', path: '/', modal: 'login', params: ['next'], shell: 'landing-client', guard: 'guest-only', milestone: 'M1',
    states: ['의뢰인 랜딩에서', '공급자 랜딩에서(/supplier?modal=login)', '로그인 실패', '역할 안내'] },
  { board: 'Reset', name: '비밀번호 재설정', space: 'public', kind: 'page', path: '/reset', shell: 'public', guard: 'guest-only', milestone: 'M1',
    states: ['이메일 입력', '메일 보냄', '새 비밀번호', '링크 만료', '완료'] },
  { board: 'Signup', name: '회원가입 ① 계정', space: 'public', kind: 'page', path: '/signup', shell: 'public', guard: 'guest-only', milestone: 'M1', states: ['기본', '이미 가입된 이메일'] },
  { board: 'Signup-Role', name: '회원가입 ② 역할', space: 'public', kind: 'page', path: '/signup/role', shell: 'public', guard: 'signup-step', milestone: 'M1', states: ['의뢰인 선택', '공급자 선택', '구글 가입'] },
  { board: 'Signup-Client', name: '회원가입 ③ 의뢰인 프로필', space: 'public', kind: 'page', path: '/signup/client', shell: 'public', guard: 'signup-step', milestone: 'M1', states: [] },
  { board: 'Signup-Supplier', name: '회원가입 ③ 공급자 프로필', space: 'public', kind: 'page', path: '/signup/supplier', shell: 'public', guard: 'signup-step', milestone: 'M1', states: [] },
  { board: 'Terms', name: '약관 · 정책', space: 'public', kind: 'page', path: '/terms/:doc', shell: 'viewer', guard: 'none', milestone: 'M1',
    states: ['terms 이용약관', 'privacy 개인정보 처리방침', 'nda 명세 비밀유지', 'broker 중개자 고지'] },
  { board: 'Help', name: '고객센터', space: 'public', kind: 'page', path: '/help', shell: 'viewer', guard: 'none', milestone: 'M6',
    states: ['자주 묻는 질문', '검색 결과(?q=)', '공지(?tab=notice)'] },
  { board: 'Help-Inquiry', name: '1:1 문의', space: 'public', kind: 'page', path: '/help/inquiry', shell: 'viewer', guard: 'none', milestone: 'M6',
    states: ['로그인 안내', '문의 작성', '내 문의', '문의 상세'] },

  // ── 의뢰인 (22) ─────────────────────────────────────────────
  { board: 'Home-Client', name: '홈', space: 'client', kind: 'page', path: '/c', shell: 'client', guard: 'client', milestone: 'M2', states: ['기본', '첫 방문'] },
  { board: 'Profile-Client', name: '내 프로필', space: 'client', kind: 'page', path: '/c/profile', shell: 'client', guard: 'client', milestone: 'M6', states: ['기본 정보', '받은 리뷰(?tab=reviews)'] },
  { board: 'Account-Client', name: '계정 설정', space: 'client', kind: 'page', path: '/c/account', shell: 'client', guard: 'client', milestone: 'M6',
    states: ['기본', '탈퇴 확인', '비밀번호 변경 완료', '이메일 바꾸기', '구글 연결 해제'] },
  { board: 'Input-Client', name: '입력', space: 'client', kind: 'page', path: '/c/drafts/new', shell: 'client', guard: 'client', milestone: 'M1', states: ['첫 방문', '작성 중 초안 있음', '한도 도달'] },
  { board: 'Draft-Client', name: '초안 · 명세 2분할', space: 'client', kind: 'page', path: '/c/drafts/:did', shell: 'client', guard: 'client', milestone: 'M1',
    states: ['기본', '초안 만드는 중', '만들기 실패', '채팅 반영 중'] },
  { board: 'Report-Client', name: '단가 분석 리포트', space: 'client', kind: 'modal', path: '/c/drafts/:did', modal: 'report', shell: 'client', guard: 'client', milestone: 'M2',
    states: ['예산 안', '예산 초과', '만드는 중 포함'] },
  { board: 'Confirm-Client', name: '명세 확정', space: 'client', kind: 'page', path: '/c/drafts/:did/confirm', shell: 'client', guard: 'client', milestone: 'M2', states: [] },
  { board: 'My-Client', name: '내 프로젝트', space: 'client', kind: 'page', path: '/c/projects', shell: 'client', guard: 'client', milestone: 'M2',
    states: ['홈과 같은 데이터', '모든 상태 예시', '프로젝트 없음'] },
  { board: 'Spec-Client', name: '명세 보기', space: 'client', kind: 'page', path: '/c/projects/:pid', shell: 'client', guard: 'client', milestone: 'M2',
    states: ['기본', '명세 고치기 확인', '마감 연장', '임시 계약 중', '모집 시작됨'] },
  { board: 'Compare-Client', name: '제안 비교', space: 'client', kind: 'page', path: '/c/projects/:pid/proposals', shell: 'client', guard: 'client', milestone: 'M3',
    states: ['지원 3건', '지원 1건', '이전 명세 기준', '임시 계약 중', '결렬 후 선택 중', '지원 0건 · 마감', '거절 확인'] },
  { board: 'Quote-Client', name: '견적서 상세', space: 'client', kind: 'modal', path: '/c/projects/:pid/proposals', modal: 'quote', params: ['sid'], shell: 'client', guard: 'client', milestone: 'M3',
    states: ['최준호(채팅에서 수정)', '김세라', '스튜디오 넛(불가 1건)', '이전 명세 기준', '거절 확인'] },
  { board: 'PublicSupplier', name: '공급자 공개 프로필', space: 'client', kind: 'page', path: '/c/suppliers/:sid', shell: 'client', guard: 'client', milestone: 'M6', states: ['기본', '리뷰 없음'] },
  { board: 'Chat-Client', name: '문의 채팅', space: 'client', kind: 'page', path: '/c/chat/:pid/:sid', shell: 'client', guard: 'client', milestone: 'M3',
    states: ['문의 중', '처음 문의', '임시 계약 중', '읽기 전용', '이전 명세 기준', '계약 체결 후', '신고'] },
  { board: 'Agreement-Client', name: '최종 합의 내용 확인', space: 'client', kind: 'page', path: '/c/chat/:pid/:sid/agreement', shell: 'client', guard: 'client', milestone: 'M3',
    states: ['미정 있음', '모두 정해짐', '첫 문장 기능 빠짐', '근거 보기'] },
  { board: 'Contract-Client', name: '계약 · 전자서명', space: 'client', kind: 'page', path: '/c/contracts/:cid', shell: 'client', guard: 'client', milestone: 'M3',
    states: ['상대가 먼저 서명', '아무도 서명 전', '내가 먼저 서명', '양쪽 서명 완료', '결렬 — 공급자 서명 거절', '결렬 — 기한 초과', '임시 계약 취소 확인'] },
  { board: 'Escrow-Client', name: '결제(예치)', space: 'client', kind: 'page', path: '/c/contracts/:cid/escrow', shell: 'client', guard: 'client', milestone: 'M5',
    states: ['결제 전', '결제 실패', '확인 중', '예치 완료'] },
  { board: 'Contracts-Client', name: '내 계약', space: 'client', kind: 'page', path: '/c/contracts', shell: 'client', guard: 'client', milestone: 'M5',
    states: ['서명 대기', '예치 대기', '진행 중', '검수 대기', '완료', '취소 요청 중', '결렬 — 예치 기한 초과', '마감 지남'] },
  { board: 'Cancel-Client', name: '계약 취소 요청', space: 'client', kind: 'page', path: '/c/contracts/:cid/cancel', shell: 'client', guard: 'client', milestone: 'M5',
    states: ['요청 작성', '공급자 사정 선택', '동의 대기', '이견 — 운영자 판정 중', '정산 확정'] },
  { board: 'Inspect-Client', name: '검수', space: 'client', kind: 'page', path: '/c/contracts/:cid/inspect', shell: 'client', guard: 'client', milestone: 'M5',
    states: ['검수 대기', '보완 요청 작성', '승인 확인', '최종 검수', '도움 요청', '중간 승인 완료', '검수 기한 하루 전'] },
  { board: 'Settle-Client', name: '결제 · 정산 내역', space: 'client', kind: 'page', path: '/c/settlements', shell: 'client', guard: 'client', milestone: 'M5',
    states: ['전체', '계약 하나만(?contract=:cid)', '취소된 계약 예시'] },
  { board: 'Review-Client', name: '리뷰 작성', space: 'client', kind: 'page', path: '/c/contracts/:cid/review', shell: 'client', guard: 'client', milestone: 'M6', states: ['작성 중', '제출함'] },
  { board: 'Notify-Client', name: '알림', space: 'client', kind: 'dropdown', path: null, shell: 'client', guard: 'client', milestone: 'M3', states: ['안 읽음 있음', '모두 읽음', '기한 알림'] },

  // ── 공급자 (17) ─────────────────────────────────────────────
  { board: 'Home-Supplier', name: '홈', space: 'supplier', kind: 'page', path: '/s', shell: 'supplier', guard: 'supplier', milestone: 'M3', states: ['기본', '첫 방문'] },
  { board: 'Profile-Supplier', name: '내 프로필', space: 'supplier', kind: 'page', path: '/s/profile', shell: 'supplier', guard: 'supplier', milestone: 'M6',
    states: ['기본 정보', '받은 리뷰(?tab=reviews)', '요약 공개 중', '확인 대기', '숨김'] },
  { board: 'Account-Supplier', name: '계정 설정', space: 'supplier', kind: 'page', path: '/s/account', shell: 'supplier', guard: 'supplier', milestone: 'M6',
    states: ['기본', '탈퇴 확인', '비밀번호 변경 완료', '이메일 바꾸기', '계좌 바꾸기'] },
  { board: 'Find-Supplier', name: '프로젝트 찾기 · 북마크', space: 'supplier', kind: 'page', path: '/s/projects', shell: 'supplier', guard: 'supplier', milestone: 'M3',
    states: ['전체', '북마크(?view=bookmarks)', '검색 결과 없음'] },
  { board: 'Project-Supplier', name: '프로젝트 상세', space: 'supplier', kind: 'page', path: '/s/projects/:pid', shell: 'supplier', guard: 'supplier', milestone: 'M3',
    states: ['지원 전', '지원함', '재견적 요청', '모집 마감'] },
  { board: 'QuoteWrite-Supplier', name: '견적 작성', space: 'supplier', kind: 'page', path: '/s/projects/:pid/quote', shell: 'supplier', guard: 'supplier', milestone: 'M3',
    states: ['작성 중', '모두 불가', '연락처 가림', '재견적'] },
  { board: 'Apps-Supplier', name: '내 지원 현황', space: 'supplier', kind: 'page', path: '/s/applications', shell: 'supplier', guard: 'supplier', milestone: 'M3',
    states: ['전체', '선택됨(서명 대기)', '보류 중', '지원 철회 확인', '제출 완료'] },
  { board: 'QuoteView-Supplier', name: '내 견적 보기', space: 'supplier', kind: 'page', path: '/s/applications/:pid', shell: 'supplier', guard: 'supplier', milestone: 'M3',
    states: ['문의 중', '이전 명세 기준', '임시 계약 중'] },
  { board: 'Chat-Supplier', name: '문의 채팅', space: 'supplier', kind: 'page', path: '/s/chat/:pid', shell: 'supplier', guard: 'supplier', milestone: 'M3',
    states: ['문의 중', '견적 수정', '임시 계약', '읽기 전용', '계약 체결 후', '신고'] },
  { board: 'Contract-Supplier', name: '계약 · 전자서명', space: 'supplier', kind: 'page', path: '/s/contracts/:cid', shell: 'supplier', guard: 'supplier', milestone: 'M3',
    states: ['상대가 먼저 서명', '아무도 서명 전', '내가 먼저 서명', '양쪽 서명 완료', '서명 거절 확인', '결렬 — 기한 초과'] },
  { board: 'Contracts-Supplier', name: '내 계약', space: 'supplier', kind: 'page', path: '/s/contracts', shell: 'supplier', guard: 'supplier', milestone: 'M5',
    states: ['서명 대기', '예치 대기', '진행 중', '검수 대기', '완료', '취소 요청 받음', '마감 지남'] },
  { board: 'Cancel-Supplier', name: '취소 요청 받음', space: 'supplier', kind: 'page', path: '/s/contracts/:cid/cancel', shell: 'supplier', guard: 'supplier', milestone: 'M5',
    states: ['요청 받음', '이의 작성', '운영자 판정 중', '정산 확정'] },
  { board: 'Deliver-Supplier', name: '납품', space: 'supplier', kind: 'page', path: '/s/contracts/:cid/deliver', shell: 'supplier', guard: 'supplier', milestone: 'M5',
    states: ['중간 납품', '제출함 · 검수 대기', '보완 요청', '최종 납품', '마감 지남', '정산 계좌 없음'] },
  { board: 'Settle-Supplier', name: '결제 · 정산 내역', space: 'supplier', kind: 'page', path: '/s/settlements', shell: 'supplier', guard: 'supplier', milestone: 'M5',
    states: ['전체', '계약 하나만(?contract=:cid)', '취소된 계약 예시', '개인 공급자 예시'] },
  { board: 'Review-Supplier', name: '리뷰 작성', space: 'supplier', kind: 'page', path: '/s/contracts/:cid/review', shell: 'supplier', guard: 'supplier', milestone: 'M6', states: ['작성 중', '제출함'] },
  { board: 'Notify-Supplier', name: '알림', space: 'supplier', kind: 'dropdown', path: null, shell: 'supplier', guard: 'supplier', milestone: 'M3', states: ['안 읽음 있음', '모두 읽음', '기한 알림'] },
  { board: 'PublicClient', name: '의뢰인 공개 프로필', space: 'supplier', kind: 'page', path: '/s/clients/:uid', shell: 'supplier', guard: 'supplier', milestone: 'M6', states: ['기본', '첫 거래'] },

  // ── 운영자 (6) — 목록 · 상세 2단, 상세는 ?id= ─────────────────
  { board: 'Admin-Blocks', name: '블록 검토', space: 'admin', kind: 'page', path: '/admin/blocks', shell: 'admin', guard: 'admin', milestone: 'M6', states: ['새 블록 목록', '병합', '단가 수정', '비활성화'] },
  { board: 'Admin-Payments', name: '보류된 결제', space: 'admin', kind: 'page', path: '/admin/payments', shell: 'admin', guard: 'admin', milestone: 'M6', states: ['목록', '금액 불일치', '확정'] },
  { board: 'Admin-Refunds', name: '환불 처리', space: 'admin', kind: 'page', path: '/admin/refunds', shell: 'admin', guard: 'admin', milestone: 'M6', states: ['처리 대기', '사유 다툼 판정', '처리 완료'] },
  { board: 'Admin-Disputes', name: '이견 개입', space: 'admin', kind: 'page', path: '/admin/disputes', shell: 'admin', guard: 'admin', milestone: 'M6', states: ['검토 중', '판정 작성', '판정 완료'] },
  { board: 'Admin-Reports', name: '신고 처리', space: 'admin', kind: 'page', path: '/admin/reports', shell: 'admin', guard: 'admin', milestone: 'M6', states: ['처리 대기', '조치 작성', '처리 완료', '계정 정지 선택'] },
  { board: 'Admin-Inquiries', name: '1:1 문의', space: 'admin', kind: 'page', path: '/admin/inquiries', shell: 'admin', guard: 'admin', milestone: 'M6', states: ['답변 대기', '답변 작성', '답변 완료'] },
  { board: 'Admin-Events', name: '이벤트 기록', space: 'admin', kind: 'page', path: '/admin/events', shell: 'admin', guard: 'admin', milestone: 'M6', states: ['목록', '상세'] },
];

/* ── 보조 경로 — 55개 화면에 세지 않음 ───────────────────────── */
export const EXTRA_ROUTES = [
  { path: '/auth/google/callback', to: 'Google OAuth 로그인 · 가입 콜백', guard: 'none' },
  { path: '/c/chat', to: '가장 최근 대화 /c/chat/:pid/:sid, 없으면 빈 상태', guard: 'client' },
  { path: '/s/chat', to: '가장 최근 대화 /s/chat/:pid, 없으면 빈 상태', guard: 'supplier' },
  { path: '/admin', to: '/admin/blocks', guard: 'admin' },
  { path: '/suspended', to: '정지 계정 안내(미설계 — EmptyState 패턴)', guard: 'auth' },
  { path: '*', to: '404(미설계 — EmptyState 패턴)', guard: 'none' },
  { path: '/dev/ui', to: '공통 컴포넌트 카탈로그(개발 환경에서만)', guard: 'none' },
] as const;

/* ── 가드 동작 ────────────────────────────────────────────────
 *  비로그인 → 보호된 경로        : /?modal=login&next=<원래 경로>
 *  로그인 → guest-only 경로       : 역할 홈(/c · /s · /admin)
 *  역할이 다른 공간 경로          : 자기 역할 홈(1계정 1역할, 공간 전환 없음)
 *  정지 계정(suspendedAt)         : /suspended 만
 *  가입 미완료 → signup-step 외   : 진행 중인 가입 단계로
 *  프로필 필수 항목 없음          : 행동 시점에 /signup/client · /signup/supplier?next= (경로 가드 아님)
 *  견적 작성에 상세 열람 기록 없음 : /s/projects/:pid (서버 응답으로 판정)
 * ─────────────────────────────────────────────────────────── */

export const ROLE_HOME = { CLIENT: '/c', SUPPLIER: '/s', ADMIN: '/admin' } as const;

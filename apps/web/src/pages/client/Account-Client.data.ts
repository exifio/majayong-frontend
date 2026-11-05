/* 의뢰인 계정 설정 시연 — PRD F-28 · F-06 · F-07. 결정메모 #2. */

export const ACCOUNT_MOCKS = [
  '기본',
  '탈퇴 확인',
  '비밀번호 변경 완료',
  '이메일 바꾸기',
  '구글 연결 해제',
] as const;
export type AccountMock = (typeof ACCOUNT_MOCKS)[number];

export const DEMO = {
  title: '계정 설정',
  sub: '로그인 · 알림 · 탈퇴를 관리합니다. 역할은 바꿀 수 없습니다.',
  name: '정민재',
  meta: '의뢰인 · 온도 다이닝 · 2026년 8월 가입 · ★ 4.5 (리뷰 2건)',

  emailLabel: '이메일',
  emailValue: 'minjae.ondo@example.com',
  emailPrivate: '공개 안 함',
  emailChange: '바꾸기',

  passwordLabel: '비밀번호',
  passwordValue: '비밀번호 사용 중',
  passwordChange: '비밀번호 바꾸기',

  googleLabel: '구글 연결',
  googleValue: '연결됨 · minjae.ondo@example.com',
  googleUnlink: '연결 해제',

  notifyLabel: '알림',
  notifyValue: '이메일 · 인앱 알림 받음',
  notifyEdit: '알림 설정',

  leaveLabel: '탈퇴',
  leaveValue: '진행 중 계약이 있으면 탈퇴할 수 없습니다.',
  leaveBtn: '탈퇴하기',

  pwDoneTitle: '비밀번호를 바꿨습니다 · 11월 3일 10:12',
  pwDoneBody: '다른 기기에서는 다시 로그인해야 합니다. 바꾸지 않으셨다면 바로 비밀번호를 다시 바꿔 주세요.',

  emailModalTitle: '계정 이메일 바꾸기',
  emailModalSub: '새 이메일로 인증 메일을 보냅니다. 링크를 눌러 인증해야 바뀝니다.',
  emailNew: '새 이메일',
  emailNewValue: 'ondo.dining@example.com',
  emailPw: '현재 비밀번호',
  emailSend: '인증 메일 보내기',
  emailCancel: '취소',
  emailHints: [
    '인증 메일의 링크는 24시간 동안 쓸 수 있습니다. 인증 전까지는 지금 이메일로 로그인합니다.',
    '바뀐 이메일도 다른 사용자에게는 공개되지 않습니다.',
  ] as const,

  googleModalTitle: '구글 연결을 해제할까요?',
  googleModalSub: '해제하면 이메일과 비밀번호로만 로그인합니다.',
  googleOk: '이메일 로그인 · 비밀번호 사용 중',
  googleOkHint: '비밀번호가 있어야 해제할 수 있습니다',
  googleConfirm: '연결 해제',
  googleCancel: '취소',
  googleHints: [
    '구글로만 가입했다면 먼저 비밀번호를 정해야 해제할 수 있습니다.',
    '해제해도 계약 · 정산 · 리뷰 기록은 그대로입니다.',
  ] as const,

  leaveTitle: '지금은 탈퇴할 수 없습니다',
  leaveBody:
    '진행 중인 계약이 있습니다. 진행 중 · 임시 계약 · 정산 처리 중인 건이 하나라도 있으면 탈퇴할 수 없습니다.',
  leaveContract: '예약 달력, 예약금 결제 외 2개 기능 · 공급자 최준호 · 작업 마감 12월 16일',
  leaveConfirm: '확인',
  leaveContractsHref: '/c/contracts',
} as const;

export function resolveAccountMock(raw: string | null): AccountMock {
  if (raw && (ACCOUNT_MOCKS as readonly string[]).includes(raw)) return raw as AccountMock;
  return '기본';
}

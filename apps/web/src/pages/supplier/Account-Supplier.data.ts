/* 공급자 계정 설정 시연 — PRD F-28 · F-29. Account-Client와 같은 구조 + 정산 계좌. */

export const ACCOUNT_MOCKS = [
  '기본',
  '탈퇴 확인',
  '비밀번호 변경 완료',
  '이메일 바꾸기',
  '계좌 바꾸기',
] as const;
export type AccountMock = (typeof ACCOUNT_MOCKS)[number];

export const DEMO = {
  title: '계정 설정',
  sub: '로그인 · 정산 계좌 · 알림 · 탈퇴를 관리합니다. 역할은 바꿀 수 없습니다.',
  name: '최준호',
  meta: '공급자 · 웹 외주 프리랜서 5년 차 · 2025년 가입 · ★ 4.8 (리뷰 12건)',

  emailLabel: '이메일',
  emailValue: 'junho.choi@example.com',
  emailPrivate: '공개 안 함',
  emailChange: '바꾸기',

  passwordLabel: '비밀번호',
  passwordValue: '비밀번호 사용 중',
  passwordChange: '비밀번호 바꾸기',

  googleLabel: '구글 연결',
  googleValue: '연결 안 됨',
  googleConnect: '구글 연결하기',

  bankLabel: '정산 계좌',
  bankValue: '신한은행 · ●●●● 2048',
  bankHint: '예금주 최준호 · 바꾼 계좌는 다음 지급부터 적용',
  bankChange: '계좌 바꾸기',

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
  emailNewValue: 'junho.dev@example.com',
  emailPw: '현재 비밀번호',
  emailSend: '인증 메일 보내기',
  emailCancel: '취소',
  emailHints: [
    '인증 메일의 링크는 24시간 동안 쓸 수 있습니다. 인증 전까지는 지금 이메일로 로그인합니다.',
    '바뀐 이메일도 다른 사용자에게는 공개되지 않습니다.',
  ] as const,

  bankModalTitle: '계좌 바꾸기',
  bankModalSub: '진행 중 정산이 있으면 다음 정산부터 새 계좌가 적용됩니다.',
  bankBank: '은행',
  bankBankValue: '신한은행',
  bankNumber: '계좌번호',
  bankNumberValue: '110-123-4562048',
  bankHolder: '예금주',
  bankHolderValue: '최준호',
  bankHolderHint: '가입 이름과 같아야 합니다.',
  bankSave: '계좌 저장',
  bankCancel: '취소',
  bankBanks: ['신한은행', '국민은행', '우리은행', '카카오뱅크'] as const,

  leaveTitle: '지금은 탈퇴할 수 없습니다',
  leaveBody:
    '진행 중인 계약이 있습니다. 진행 중 · 임시 계약 · 정산 처리 중인 건이 하나라도 있으면 탈퇴할 수 없습니다.',
  leaveContract: '예약 달력, 예약금 결제 외 2개 기능 · 의뢰인 온도 다이닝 · 작업 마감 12월 16일',
  leaveConfirm: '확인',
  leaveContractsHref: '/s/contracts',
} as const;

export function resolveAccountMock(raw: string | null): AccountMock {
  if (raw && (ACCOUNT_MOCKS as readonly string[]).includes(raw)) return raw as AccountMock;
  return '기본';
}

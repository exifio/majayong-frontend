/* 비밀번호 재설정 시연 — PRD F-06. */

export const RESET_MOCKS = [
  '이메일 입력',
  '메일 보냄',
  '새 비밀번호',
  '링크 만료',
  '완료',
] as const;
export type ResetMock = (typeof RESET_MOCKS)[number];

export const DEMO = {
  askTitle: '비밀번호를 잊으셨나요?',
  askSub: '가입한 이메일을 적어 주세요. 비밀번호를 새로 정하는 링크를 보내 드립니다.',
  email: '이메일',
  emailValue: 'minjae.ondo@example.com',
  send: '재설정 링크 보내기',
  googleHint: '구글로 가입한 계정은 비밀번호가 없습니다. 구글로 로그인하세요.',
  backLogin: '로그인으로 돌아가기',
  signup: '계정 만들기',
  loginHref: '/?modal=login',
  signupHref: '/signup',

  sentTitle: '메일을 보냈습니다',
  sentSub: '메일의 링크를 눌러 비밀번호를 새로 정해 주세요.',
  sentMask: 'm******@example.com',
  sentBody: '30분 동안 유효한 링크를 보냈습니다. 가입하지 않은 이메일이면 메일이 가지 않습니다.',
  sentLogin: '로그인으로',
  resendHint: '메일이 오지 않았나요? 스팸함을 확인하거나',
  resend: '다시 보내기',

  newTitle: '새 비밀번호를 정해 주세요',
  newSub: 'm******@example.com 계정의 비밀번호를 바꿉니다.',
  pw: '새 비밀번호',
  pwConfirm: '한 번 더',
  pwValue: 'ondo2026new',
  pwRules: ['8자 이상', '영문과 숫자를 섞음'] as const,
  change: '비밀번호 바꾸기',
  changeHint: '바꾸면 다른 기기에서는 다시 로그인해야 합니다.',
  pwShort: '8자 이상이어야 합니다',
  pwMixed: '영문과 숫자를 함께 넣어 주세요',
  pwMismatch: '비밀번호가 같지 않습니다',

  expiredTitle: '링크가 만료되었습니다',
  expiredSub: '재설정 링크는 30분 동안만 쓸 수 있고, 한 번 쓰면 다시 쓸 수 없습니다.',
  expiredBandTitle: '다시 요청해 주세요',
  expiredBandBody: '새 링크를 받으면 이전 링크는 모두 쓸 수 없게 됩니다.',
  expiredCta: '다시 보내기',

  doneTitle: '비밀번호를 바꿨습니다',
  doneSub: '새 비밀번호로 로그인해 주세요. 다른 기기에서는 로그아웃되었습니다.',
  doneBandTitle: '변경 완료',
  doneBandBody: '새 비밀번호로 로그인할 수 있습니다.',
  doneCta: '로그인하기',
} as const;

export function resolveResetMock(raw: string | null): ResetMock {
  if (raw && (RESET_MOCKS as readonly string[]).includes(raw)) return raw as ResetMock;
  return '이메일 입력';
}

export function passwordError(pw: string, confirm: string): string | undefined {
  if (pw.length < 8) return DEMO.pwShort;
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return DEMO.pwMixed;
  if (pw !== confirm) return DEMO.pwMismatch;
  return undefined;
}

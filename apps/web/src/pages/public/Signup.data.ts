/* 회원가입 ① 계정 시연 — PRD F-06 · 7.2. */

export const SIGNUP_MOCKS = ['기본', '이미 가입된 이메일'] as const;
export type SignupMock = (typeof SIGNUP_MOCKS)[number];

export const DEMO = {
  title: '계정을 만듭니다',
  sub: '이메일과 비밀번호만 있으면 됩니다. 어떤 역할로 쓰실지는 다음 단계에서 고르시게 됩니다.',
  google: '구글 계정으로 계속하기',
  googleHint: '구글로 시작하면 이 단계를 건너뛰고 바로 역할 선택으로 갑니다.',
  orEmail: '또는 이메일로',
  email: '이메일',
  emailHint: '로그인에만 씁니다. 어디에도 공개되지 않습니다.',
  password: '비밀번호',
  passwordHint: '8자 이상, 숫자와 영문을 섞어주세요.',
  passwordConfirm: '비밀번호 확인',
  next: '다음',
  dupError: '이미 가입된 이메일입니다',
  dupDisabled: '이미 가입된 이메일이라 다음으로 갈 수 없습니다',
  loginLink: '로그인하기',
  info: '이미 같은 이메일로 가입된 계정이 있으면 기존 계정으로 로그인됩니다. 그 계정의 역할이 그대로 유지되고, 다른 역할로 쓰시려면 다른 이메일이 필요합니다.',
  pwShort: '8자 이상이어야 합니다',
  pwMixed: '영문과 숫자를 함께 넣어 주세요',
  pwMismatch: '비밀번호가 같지 않습니다',
  termsNeed: '약관에 모두 동의해 주세요',
  emailDemo: 'minjae.ondo@example.com',
  steps: [
    { n: 1, label: '계정 만들기' },
    { n: 2, label: '역할 선택' },
    { n: 3, label: '프로필' },
  ] as const,
  terms: [
    { key: 'terms', label: '이용약관', href: '/terms/terms' },
    { key: 'privacy', label: '개인정보 처리방침', href: '/terms/privacy' },
    { key: 'nda', label: '명세 비밀유지', href: '/terms/nda' },
    { key: 'broker', label: '중개자 고지', href: '/terms/broker' },
  ] as const,
} as const;

export function resolveSignupMock(raw: string | null): SignupMock {
  if (raw && (SIGNUP_MOCKS as readonly string[]).includes(raw)) return raw as SignupMock;
  return '기본';
}

export type SignupDemo = {
  mock: SignupMock;
  dup: boolean;
  emailValue: string;
};

export function signupDemoOf(mock: SignupMock): SignupDemo {
  const dup = mock === '이미 가입된 이메일';
  return {
    mock,
    dup,
    emailValue: DEMO.emailDemo,
  };
}

/** 8자 이상 · 영문 + 숫자 */
export function passwordError(pw: string): string | null {
  if (pw.length < 8) return DEMO.pwShort;
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return DEMO.pwMixed;
  return null;
}

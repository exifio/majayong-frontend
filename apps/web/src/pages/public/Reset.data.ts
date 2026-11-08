/* 비밀번호 재설정 — PRD F-06. 초기값은 비워 두고 실제 API 응답으로만 상태가 바뀐다. */

export const DEMO = {
  askTitle: '비밀번호를 잊으셨나요?',
  askSub: '가입 이메일을 입력해 주세요. 재설정 링크를 보내 드립니다.',
  email: '이메일',
  emailNeed: '이메일을 입력해 주세요',
  send: '재설정 요청하기',
  sending: '요청 중',
  googleHint: '구글로 가입한 계정은 비밀번호가 없습니다. 구글로 로그인하세요.',
  backLogin: '로그인으로 돌아가기',
  signup: '계정 만들기',
  loginHref: '/?modal=login',
  signupHref: '/signup',

  sentTitle: '요청을 접수했습니다',
  sentSub: '재설정 안내를 요청했습니다.',
  sentBody: '메일이 보이지 않으면 스팸함을 확인해 주세요. 시연 환경에서는 실제 메일이 발송되지 않습니다. 링크는 30분 동안 한 번만 사용할 수 있습니다.',
  sentLogin: '로그인으로',
  resendHint: '메일이 보이지 않으면 스팸함을 확인해 주세요.',
  resend: '다시 요청하기',

  newTitle: '새 비밀번호를 정해 주세요',
  newSub: '새 비밀번호를 정하면 다른 기기에서는 다시 로그인해야 합니다.',
  pw: '새 비밀번호',
  pwConfirm: '한 번 더',
  pwRules: ['8자 이상', '영문과 숫자를 섞음'] as const,
  change: '비밀번호 바꾸기',
  changing: '바꾸는 중',
  changeHint: '바꾸면 다른 기기에서는 다시 로그인해야 합니다.',
  pwShort: '8자 이상이어야 합니다',
  pwMixed: '영문과 숫자를 함께 넣어 주세요',
  pwMismatch: '비밀번호가 같지 않습니다',

  expiredTitle: '링크가 만료되었습니다',
  expiredSub: '재설정 링크는 30분 동안만 쓸 수 있고, 한 번 쓰면 다시 쓸 수 없습니다.',
  expiredBandTitle: '다시 요청해 주세요',
  expiredBandBody: '새 링크를 받으면 이전 링크는 모두 쓸 수 없게 됩니다.',
  expiredCta: '다시 요청하기',

  doneTitle: '비밀번호를 바꿨습니다',
  doneSub: '새 비밀번호로 로그인해 주세요. 다른 기기에서는 로그아웃되었습니다.',
  doneBandTitle: '변경 완료',
  doneBandBody: '새 비밀번호로 로그인할 수 있습니다.',
  doneCta: '로그인하기',
} as const;

/** 메일 주소를 화면에 그대로 노출하지 않는다. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local.slice(0, 1)}${'*'.repeat(Math.max(5, local.length - 1))}@${domain}`;
}

export function passwordError(pw: string, confirm: string): string | undefined {
  if (pw.length < 8) return DEMO.pwShort;
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return DEMO.pwMixed;
  if (pw !== confirm) return DEMO.pwMismatch;
  return undefined;
}

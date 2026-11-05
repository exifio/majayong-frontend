/* 로그인 모달 시연 — PRD F-06 · 결정메모 #2. */

export const LOGIN_MOCKS = [
  '의뢰인 랜딩에서',
  '공급자 랜딩에서(/supplier?modal=login)',
  '로그인 실패',
  '역할 안내',
] as const;
export type LoginMock = (typeof LOGIN_MOCKS)[number];

export const DEMO = {
  headingClient: '다시 오셨네요',
  headingSupplier: '공급자 로그인',
  headingRole: '의뢰인 계정으로 로그인했습니다',
  subClient: '작업 중이던 초안은 그대로 남아 있습니다.',
  subSupplier: '로그인하면 바로 모집 중인 프로젝트를 볼 수 있습니다.',
  subRole: '가입하신 역할의 공간으로 들어갑니다.',
  google: '구글 계정으로 계속하기',
  orEmail: '또는 이메일로',
  email: '이메일',
  password: '비밀번호',
  /* routes.test가 모달 제목 '로그인'을 getByText로 찾음 — 본문 버튼은 같은 문구면 실패 */
  submit: '로그인하기',
  failTitle: '이메일이나 비밀번호가 맞지 않습니다',
  failBody: '입력한 내용을 다시 확인해 주세요. 비밀번호를 잊으셨다면 아래에서 찾을 수 있습니다.',
  roleTitle: '이 계정은 의뢰인으로 가입되어 있습니다',
  roleBody:
    '공급자 페이지에서 들어오셨지만 역할은 바뀌지 않습니다. 의뢰인 공간으로 들어가시거나, 공급자로 활동하시려면 다른 이메일로 가입해 주세요.',
  roleCta: '의뢰인 공간으로 들어가기',
  reset: '비밀번호 찾기',
  signup: '회원가입',
  foot: '역할은 가입할 때 정해지고 바뀌지 않습니다. 로그인하시면 가입하신 역할의 공간으로 들어갑니다.',
  emailClient: 'minjae.ondo@example.com',
  emailSupplier: 'junho@example.com',
} as const;

export function resolveLoginMock(raw: string | null, pathname: string): LoginMock {
  if (raw && (LOGIN_MOCKS as readonly string[]).includes(raw)) return raw as LoginMock;
  if (pathname.startsWith('/supplier')) return '공급자 랜딩에서(/supplier?modal=login)';
  return '의뢰인 랜딩에서';
}

export type LoginDemo = {
  mock: LoginMock;
  supplier: boolean;
  fail: boolean;
  role: boolean;
  showForm: boolean;
  heading: string;
  sub: string;
  emailValue: string;
};

export function loginDemoOf(mock: LoginMock): LoginDemo {
  const supplier =
    mock === '공급자 랜딩에서(/supplier?modal=login)' || mock === '역할 안내';
  const fail = mock === '로그인 실패';
  const role = mock === '역할 안내';
  return {
    mock,
    supplier,
    fail,
    role,
    showForm: !role,
    heading: role ? DEMO.headingRole : supplier ? DEMO.headingSupplier : DEMO.headingClient,
    sub: role ? DEMO.subRole : supplier ? DEMO.subSupplier : DEMO.subClient,
    emailValue: supplier ? DEMO.emailSupplier : DEMO.emailClient,
  };
}

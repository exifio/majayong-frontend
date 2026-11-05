/* 회원가입 ② 역할 시연 — PRD F-06 · F-07. */

export const ROLE_MOCKS = ['의뢰인 선택', '공급자 선택', '구글 가입'] as const;
export type RoleMock = (typeof ROLE_MOCKS)[number];

export const DEMO = {
  title: '어떤 쪽으로 시작하시나요?',
  sub: '역할은 지금 정해지고 이후 바꿀 수 없습니다. 두 역할이 모두 필요하시면 다른 이메일로 계정을 하나 더 만들어주세요.',
  noteTitle: '역할은 가입 후 바꿀 수 없습니다',
  noteBody:
    '가입 후에는 다른 공간을 둘러볼 수는 있지만 그 역할의 행위는 할 수 없습니다. 의뢰인으로 가입하면 프로젝트를 등록할 수 있고, 공급자로 가입하면 견적을 낼 수 있습니다.',
  next: '다음',
  back: '이전',
  clientKey: 'client',
  supplierKey: 'supplier',
  clientTitle: '의뢰인',
  clientDesc: '웹사이트나 앱이 필요한데 무엇을 요청해야 할지 모르시는 분',
  supplierTitle: '공급자',
  supplierDesc: '웹 개발·디자인 프리랜서와 소규모 제작사',
  googleAcct: '구글 계정으로 시작합니다 — junho@example.com',
  emailClient: '계정이 만들어졌습니다 — minjae.ondo@example.com',
  emailSupplier: '계정이 만들어졌습니다 — junho@example.com',
  steps: [
    { n: 1, label: '계정 만들기' },
    { n: 2, label: '역할 선택' },
    { n: 3, label: '프로필' },
  ] as const,
  googleTermsHint: '구글로 가입하면 계정 만들기 단계를 건너뛰므로 여기서 동의를 받습니다.',
  termsTitle: '약관 동의',
} as const;

export function resolveRoleMock(raw: string | null): RoleMock {
  if (raw && (ROLE_MOCKS as readonly string[]).includes(raw)) return raw as RoleMock;
  return '의뢰인 선택';
}

export type RoleDemo = {
  mock: RoleMock;
  google: boolean;
  role: 'client' | 'supplier';
  acctMsg: string;
  nextHref: string;
  backHref: string;
};

export function roleDemoOf(mock: RoleMock): RoleDemo {
  const google = mock === '구글 가입';
  const supplier = mock === '공급자 선택' || mock === '구글 가입';
  const role = supplier ? 'supplier' : 'client';
  return {
    mock,
    google,
    role,
    acctMsg: google
      ? DEMO.googleAcct
      : supplier
        ? DEMO.emailSupplier
        : DEMO.emailClient,
    nextHref: role === 'supplier' ? '/signup/supplier' : '/signup/client',
    backHref: google ? '/?modal=login' : '/signup',
  };
}

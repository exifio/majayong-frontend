/* 회원가입 ③ 의뢰인 프로필 시연 — PRD F-07. 연락처 없음. */

export const DEMO = {
  title: '의뢰인 프로필',
  sub: '프로젝트를 등록할 때 공급자에게 공개할 정보입니다. 상호를 입력하면 공급자가 의뢰인을 알아보기 쉽습니다.',
  steps: [
    { n: 1, label: '계정 만들기' },
    { n: 2, label: '역할 선택' },
    { n: 3, label: '프로필' },
  ] as const,
  biz: '상호',
  bizNeeded: '입력하면 공급자에게 공개',
  bizError: '상호를 입력해 주세요',
  bizPlaceholder: '상호를 입력해 주세요',
  industry: '업종',
  industryPlaceholder: '업종을 선택해 주세요',
  industryHint: '지금은 예약 기반 음식점만 지원합니다.',
  industries: ['예약 기반 음식점', '기타 (직접 입력)'] as const,
  scale: '규모',
  scaleHint: '좌석 수나 직원 규모를 적어 주세요.',
  scalePlaceholder: '좌석 수나 직원 규모',
  intro: '한 줄 소개',
  introHint: '어떤 가게인지 알면 견적과 상담이 쉬워집니다.',
  introPlaceholder: '가게를 한 줄로 소개해 주세요',
  noContact:
    '연락처는 받지 않습니다. 이메일은 로그인에만 쓰이며 어느 단계에서도 공개되지 않습니다. 공급자와는 마자용 채팅으로 이야기하시고, 계약이 체결되면 채팅에서 연락처를 주고받으실 수 있습니다.',
  back: '이전',
  backHref: '/signup/role',
  skip: '나중에 입력하기',
  submit: '가입 완료',
  skipHint: '지금 건너뛰셔도 됩니다. 프로젝트를 등록하실 때 이 화면으로 다시 안내해 드립니다.',
} as const;

/* 의뢰인 랜딩(Main) 시연 데이터 — 보드 Main.dc.html · PRD 9.6
 * routes.ts states가 비어 있어 상태는 '기본' 하나만 둔다. */
export const MAIN_MOCKS = ['기본'] as const;
export type MainMock = (typeof MAIN_MOCKS)[number];

export type SpecItemTone = 'derived' | 'pick' | 'out';

export type MainDemo = {
  pill: string;
  title: string;
  lead: string;
  feeNote: string;
  demoTitle: string;
  canvasBlocks: string[];
  specItems: { name: string; detail: string; tone: SpecItemTone }[];
  aiTotal: number;
  hopeBudget: number;
  budgetNote: string;
  howTitle: string;
  howLead: string;
  howSteps: { title: string; body: string }[];
  budgetTitle: string;
  budgetLead: string;
  budgetChecks: string[];
  proposalsLabel: string;
  proposals: {
    initial: string;
    name: string;
    meta: string;
    summary: string;
    quote: number;
  }[];
  proposalsFoot: string;
  safetyTitle: string;
  safetyLead: string;
  safetyCards: { title: string; body: string }[];
  costTitle: string;
  costLead: string;
  costRows: { label: string; value: string }[];
  costNote: string;
  ctaTitle: string;
  ctaLead: string;
  ctaSub: string;
};

const BASE: MainDemo = {
  pill: '예약 기반 음식점부터 시작합니다',
  title: '요구사항을 쓰지 마세요.\n그려드린 걸 고치세요.',
  lead: '불편한 점을 한 문장으로 적으면 화면 초안이 먼저 나옵니다. 틀린 곳을 지우고 고치기만 하면, 그 행동이 그대로 요구사항 명세가 되고 예산 안에 드는지도 바로 보입니다.',
  feeNote: '명세를 만드는 데까지는 비용이 들지 않습니다. 계약이 성사될 때만 5% 수수료가 붙습니다.',
  demoTitle: '코스 레스토랑 예약 사이트',
  canvasBlocks: ['예약 달력', '예약금 결제', '리마인드 알림', '노쇼 기록'],
  specItems: [
    { name: '예약 달력', detail: '정할 것 · 회차 구성, 예약 기간', tone: 'derived' },
    { name: '예약금 결제', detail: '정할 것 · 예약금 금액, 환불 기준', tone: 'derived' },
    { name: '리마인드 알림', detail: '추천에서 추가', tone: 'pick' },
    { name: '단골 등급 관리', detail: '이번 범위에서 제외', tone: 'out' },
  ],
  aiTotal: 4_410_000,
  hopeBudget: 5_000_000,
  budgetNote: '안에 들어옵니다. 항목을 빼면 총액이 바로 줄어듭니다.',
  howTitle: '빈 입력창을 드리지 않습니다',
  howLead: '사람은 백지에서 떠올리는 것보다, 눈앞의 것을 보고 틀렸다고 지적하는 것을 훨씬 잘합니다. 마자용은 늘 고칠 것을 먼저 드립니다.',
  howSteps: [
    {
      title: '한 문장만 적습니다',
      body: '“예약 앱이랑 전화를 같이 받는데 노쇼가 나면 재료를 다 버려요.” 적기 어려우면 업종만 고르셔도 됩니다.',
    },
    {
      title: '화면 초안을 고칩니다',
      body: '필요 없는 블록은 지우고, 빠진 건 추천에서 골라 넣습니다. 고치는 행동이 그대로 명세가 됩니다.',
    },
    {
      title: '공급자를 보고 고릅니다',
      body: '같은 명세를 본 공급자들의 경력과 평점, 포트폴리오, 견적을 비교합니다. 세부 조건은 채팅에서 정하고, 이 사람과 계약하기를 누르면 최종 합의 내용으로 남습니다.',
    },
  ],
  budgetTitle: '예산 안에 드는지\n계약 전에 보입니다',
  budgetLead:
    '기능마다 AI가 분석해 둔 단가로 예상 총액을 계산합니다. 같은 기능은 누구에게나 같은 금액이고, 기능별 금액과 근거는 단가 분석 리포트에서 볼 수 있습니다. 항목을 빼면 총액이 즉시 줄어듭니다.',
  budgetChecks: [
    '바로 정하기 어려운 조건은 ‘공급자와 정할 것’으로 남겨 채팅에서 정합니다',
    '범위에서 뺀 항목도 숨기지 않고 보여줍니다',
  ],
  proposalsLabel: '제안 비교 — 지원 3건',
  /* 보드 Main 예시 카드(랜딩 일러스트). 김세라 금액·경력은 PRD 9.6과 다를 수 있음 → 확인 필요 */
  proposals: [
    {
      initial: '최',
      name: '최준호',
      meta: '경력 5년 · ★ 4.8 · 리뷰 12건',
      summary: '식당 예약 사이트 12곳, 예약 달력 · PG 결제 연동 위주',
      quote: 3_100_000,
    },
    {
      initial: '김',
      name: '김세라',
      meta: '경력 7년 · ★ 4.6 · 리뷰 21건',
      summary: '카페 · 베이커리 웹사이트와 예약 시스템 9건',
      quote: 4_400_000,
    },
    {
      initial: '넛',
      name: '스튜디오 넛',
      meta: '제작사 · 경력 9년 · 리뷰 없음',
      summary: '포트폴리오 링크 2개',
      quote: 4_500_000,
    },
  ],
  proposalsFoot: '예시 화면입니다. 지원한 순서대로 놓이고, 항목별 금액이 아니라 공급자와 견적 총액을 봅니다.',
  safetyTitle: '계약 전에 만든 명세가\n계약 후에도 기준으로 남습니다',
  safetyLead:
    '외주에서 돈이 새는 지점은 서로 다른 것을 상상한 채 계약했을 때입니다. 확정된 명세는 검수 기준으로 계약서에 첨부되고, 납품물은 그 명세로 판정됩니다.',
  safetyCards: [
    {
      title: '예상 금액의 근거를 보여드립니다',
      body: '기능마다 단가와 그 근거를 리포트로 확인할 수 있습니다. 예상 총액은 참고용이고, 실제 금액은 공급자의 견적과 합의로 정해집니다.',
    },
    {
      title: '명세를 본 사람이 남습니다',
      body: '공급자는 가입할 때 비밀유지 의무에 동의합니다. 누가 열람했는지 기록이 남고, 계약이 체결되기 전까지 채팅의 연락처는 가려집니다.',
    },
    {
      title: '범위는 서명 시점에 고정됩니다',
      body: '계약 뒤에는 범위가 바뀌지 않습니다. 모르는 사이에 늘어나지도, 중간에 조건이 달라지지도 않습니다. 더 필요한 기능은 새 프로젝트로 맡기시면 됩니다.',
    },
    {
      title: '대금은 예치해 두고 나눠 줍니다',
      body: '계약 시 전액을 에스크로에 예치하고, 중간 검수와 최종 검수를 승인할 때 나눠 지급합니다.',
    },
  ],
  costTitle: '명세를 만드는 데까지는\n비용이 들지 않습니다',
  costLead: '계약이 성사될 때만 수수료가 붙습니다. 화면에 보이는 예상 금액은 수수료를 포함한 총액입니다.',
  costRows: [
    { label: '명세 작성 · 제안 비교', value: '무료' },
    { label: '계약 성사 시 수수료', value: '5%' },
  ],
  costNote:
    '공급자도 같은 5%를 부담합니다. 마자용은 계약 당사자가 아닌 중개자이며, 이 사실은 계약서와 결제 화면에 표시됩니다.',
  ctaTitle: '지금 겪고 있는 불편을 한 문장으로 적어보세요',
  ctaLead: '어떤 기능이 필요한지 몰라도 괜찮습니다. 화면을 먼저 그려드립니다.',
  ctaSub: '구글 계정으로 30초면 시작할 수 있습니다.',
};

const BY_MOCK: Record<MainMock, MainDemo> = {
  기본: BASE,
};

export function resolveMainMock(raw: string | null): MainMock {
  if (raw && (MAIN_MOCKS as readonly string[]).includes(raw)) return raw as MainMock;
  return '기본';
}

export function mainDemoOf(mock: MainMock): MainDemo {
  return BY_MOCK[mock];
}

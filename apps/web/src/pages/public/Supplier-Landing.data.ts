/* 공급자 랜딩 시연 — 보드 Supplier-Landing · PRD F-01 · 13.2
 * routes.ts states=[] → '기본'만. 금액은 데이터 값(화면에서 계산하지 않음). */
export const SL_MOCKS = ['기본'] as const;
export type SlMock = (typeof SL_MOCKS)[number];

export type QuoteRowTone = 'ok' | 'no';

export type SlDemo = {
  pill: string;
  title: string;
  lead: string;
  feeNote: string;
  cta: string;
  ctaGhost: string;
  demoTitle: string;
  quoteRows: { name: string; detail: string; tone: QuoteRowTone; mark: string }[];
  totalLabel: string;
  totalAmount: number;
  periodLabel: string;
  periodDays: string;
  payoutLabel: string;
  payoutAmount: number;
  demoFoot: string;
  quoteTitle: string;
  quoteLead: string;
  quoteCards: { title: string; body: string }[];
  flowTitle: string;
  flowLead: string;
  flowSteps: { title: string; body: string }[];
  criteriaTitle: string;
  criteriaLead: string;
  criteriaChecks: string[];
  criteriaInfo: string;
  costTitle: string;
  costLead: string;
  costRows: { label: string; value: string }[];
  costExampleLabel: string;
  costExampleQuote: number;
  costExampleFee: number;
  costExampleWithhold: number;
  costExampleNet: number;
  costNote: string;
  bottomTitle: string;
  bottomLead: string;
  bottomSub: string;
};

const BASE: SlDemo = {
  pill: '예약 기반 음식점 프로젝트부터 올라옵니다',
  title: '글을 읽고 기능을 뽑는\n시간을 없앱니다',
  lead: '마자용에 올라오는 프로젝트는 이미 기능 단위로 쪼개진 명세입니다. 할 수 있는 항목을 고르고 총액과 기간만 적으면 견적이 끝납니다.',
  feeNote: '가입과 견적 제출, 의뢰인과의 채팅까지는 비용이 들지 않습니다.',
  cta: '공급자로 시작하기',
  ctaGhost: '견적 방식 보기',
  demoTitle: '견적 작성 — 코스 레스토랑 예약 사이트',
  quoteRows: [
    { name: '예약 달력', detail: '정할 것 · 회차 구성, 예약 기간', tone: 'ok', mark: '가능' },
    { name: '예약금 결제', detail: '정할 것 · 예약금 금액, 환불 기준', tone: 'ok', mark: '가능' },
    { name: '리마인드 알림', detail: '정할 것 · 발송 시점, 발송 수단', tone: 'ok', mark: '가능' },
    { name: '노쇼 기록', detail: '정할 것 · 노쇼 판정 기준, 표시 방식', tone: 'no', mark: '불가' },
  ],
  totalLabel: '견적 총액 · 작업 기간',
  totalAmount: 3_000_000,
  periodLabel: '가능한 항목 전체에 대한 금액',
  periodDays: '42일',
  payoutLabel: '수수료 5% 제외 예상 수령액',
  payoutAmount: 2_850_000,
  demoFoot: '불가로 둔 항목은 범위에서 빠집니다. 블록 가격을 미리 등록하지 않습니다.',
  quoteTitle: '견적 전에 하던 무료 노동이 사라집니다',
  quoteLead:
    '자유 텍스트로 쓰인 프로젝트 글을 읽고, 만들 기능을 직접 뽑아내고, 모호한 부분은 다시 물어봐야 견적이 나옵니다. 그 시간은 지금까지 아무도 쳐주지 않았습니다.',
  quoteCards: [
    {
      title: '기능은 이미 쪼개져 있습니다',
      body: '의뢰인이 화면 초안을 고치면서 만든 명세가 그대로 올라옵니다. 항목마다 기능 설명과 화면 초안이 붙어 있고, 공급자와 정할 조건도 미리 적혀 있습니다.',
    },
    {
      title: '가격표에 맞추지 않아도 됩니다',
      body: '플랫폼 평균 단가가 없고, 의뢰인도 항목별 금액을 나란히 놓고 비교하지 않습니다. 경력과 평점, 포트폴리오와 견적 총액을 함께 보고 고릅니다.',
    },
    {
      title: '계약 후에 범위가 늘지 않습니다',
      body: '합의한 명세가 검수 기준으로 계약서에 붙고, 범위는 서명하는 순간 고정됩니다. 의뢰인이 기능을 더 원하면 새 프로젝트로 발주합니다.',
    },
  ],
  flowTitle: '등록부터 정산까지',
  flowLead: '프로필을 한 번 등록해 두면 그다음은 고르고 적기만 하면 됩니다.',
  flowSteps: [
    {
      title: '프로필 등록',
      body: '기술 스택과 경력, 포트폴리오 링크를 등록합니다. AI가 포트폴리오를 요약해 드리고, 확인한 뒤 공개합니다.',
    },
    {
      title: '명세 열람',
      body: '업종·항목 수·예산 구간을 보고 고른 뒤, 상세에서 전체 명세와 화면 초안, 의뢰인 정보를 엽니다.',
    },
    {
      title: '견적',
      body: '할 수 있는 항목과 총액, 작업 기간을 적습니다. 못 하는 항목은 불가로 두면 범위에서 빠집니다.',
    },
    {
      title: '문의와 계약',
      body: '의뢰인이 문의하면 채팅으로 조건을 정합니다. 최종 합의 내용이 붙은 계약서에 7일 안에 서명합니다.',
    },
    {
      title: '구간 정산',
      body: '대금 지급 방식은 계약 시 합의합니다. 예치·구간 지급은 결제 연동이 완료된 뒤 적용됩니다.',
    },
  ],
  criteriaTitle: '가격이 아니라\n일한 내용으로 고릅니다',
  criteriaLead:
    '의뢰인의 비교 화면에는 경력 · 평점 · 리뷰 · 포트폴리오 요약과 견적 총액이 나옵니다. 항목별 금액을 나란히 놓고 가장 싼 칸을 고르는 구조가 아닙니다.',
  criteriaChecks: [
    '블록 가격을 미리 등록하지 않습니다',
    '의뢰인이 본 AI 예상 금액은 공급자에게 보이지 않습니다',
    '작업이 늘면 채팅에서 견적을 고칠 수 있습니다',
  ],
  criteriaInfo:
    '의뢰인 정보는 명세 상세에서 열립니다. 이름 · 상호 · 가게 주소를 보고 견적하실 수 있고, 연락은 계약 체결 전까지 마자용 채팅으로만 합니다.',
  costTitle: '비용',
  costLead: '수수료는 지급이 확정된 금액에만 부과됩니다. 가입 · 견적 · 채팅은 무료입니다.',
  costRows: [
    { label: '가입 · 견적 제출 · 채팅', value: '무료' },
    { label: '거래 수수료', value: '5%' },
    { label: '개인 공급자 원천징수', value: '3.3%' },
  ],
  costExampleLabel: '예시 · 견적 3,000,000원 구간 지급 시',
  costExampleQuote: 3_000_000,
  costExampleFee: 150_000,
  costExampleWithhold: 99_000,
  costExampleNet: 2_751_000,
  costNote:
    '원천징수 3.3%는 개인 공급자에게만 적용됩니다. 사업자 공급자는 세금계산서를 발행합니다. 가입 시 명세 비밀유지 의무에 동의하게 됩니다.',
  bottomTitle: '할 수 있는 일을 등록해 두세요',
  bottomLead: '맞는 프로젝트가 올라오면 총액과 기간만 적으면 됩니다. 등록에는 10분이면 충분합니다.',
  bottomSub: '지금은 예약 기반 음식점 프로젝트가 올라옵니다.',
};

export function resolveSlMock(raw: string | null): SlMock {
  if (raw && (SL_MOCKS as readonly string[]).includes(raw)) return raw as SlMock;
  return '기본';
}

export function slDemoOf(mock: SlMock): Omit<SlDemo, never> {
  return mock === '기본' ? BASE : BASE;
}

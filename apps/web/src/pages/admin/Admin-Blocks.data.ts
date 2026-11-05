/* 블록 검토 시연 — PRD F-22. */

export const BLOCK_MOCKS = ['새 블록 목록', '병합', '단가 수정', '비활성화'] as const;
export type BlockMock = (typeof BLOCK_MOCKS)[number];

export type BlockRow = {
  id: string;
  name: string;
  status: '새 블록' | '병합 후보';
  projects: number;
  when: string;
  industry: string;
  why: string;
  price: number;
  use: string;
  summary: string;
  decisions: string[];
  similarId: string;
  similarName: string;
  similarPrice: number;
  similarity: number;
  mergeTargets: { id: string; name: string; price: number; use: string; similarity: number }[];
};

export const DEMO = {
  title: '블록 검토',
  sub: 'AI가 새로 만든 블록을 확인합니다. 화면은 근거만 보여 주고 판단은 운영자가 합니다.',
  listLabel: '새 블록 목록',
  detailLabel: '블록 상세',
  approve: '승인',
  merge: '기존 블록에 병합',
  priceEdit: '단가 수정',
  deactivate: '비활성화',
  eventNote: '이 처리는 이벤트 기록에 남습니다',
  reasonLabel: '사유',
  reasonNeed: '사유를 적어 주세요',
  cancel: '취소',

  mergeTitle: (name: string) => `‘${name}’을 기존 블록에 병합`,
  mergePick: '합칠 기존 블록',
  mergeConfirm: '병합하기',
  mergeHint:
    '합쳐진 블록은 이후 매칭 · 추천에서 빠집니다. 이미 쓰인 초안 · 명세 · 계약은 그대로 둡니다.',
  mergeReason:
    '기능 요약과 정할 것이 ‘노쇼 기록’과 같고 이름만 다릅니다.',

  priceTitle: (name: string) => `‘${name}’ 단가 수정`,
  priceNow: '지금 단가',
  priceNew: '새 단가',
  priceConfirm: '단가 확정',
  priceHint:
    '고친 값은 이 시각 뒤 새 초안부터 쓰입니다. 이미 쓰인 초안 · 명세 · 계약은 바뀌지 않습니다.',
  priceReason:
    '제휴 주차장 요금 계산과 주차권 안내 문자 발송이 근거에서 빠져 작업량이 적게 잡혔습니다.',
  priceNewValue: 950_000,

  deactTitle: (name: string) => `‘${name}’ 비활성화`,
  deactConfirm: '비활성화',
  deactHint:
    '이후 매칭 · 추천에서 빠집니다. 이미 쓰인 초안 · 명세 · 계약은 그대로 두고, 전체 블록에서 다시 켤 수 있습니다.',
  deactReason:
    '방문 다음 날 안내는 ‘리마인드 알림’의 발송 시점 조건으로 다룰 수 있어 따로 둘 블록이 아닙니다.',
} as const;

export const BLOCKS: BlockRow[] = [
  {
    id: 'b-12',
    name: '노쇼 관리',
    status: '병합 후보',
    projects: 2,
    when: '11월 2일 09:14',
    industry: '음식점(코스)',
    why: '노쇼 손님을 표시하고 횟수를 기록',
    price: 950_000,
    use: '초안 2 · 명세 0',
    summary: '노쇼 손님을 표시하고 노쇼 횟수를 기록해 다음 예약 때 보여 줍니다.',
    decisions: ['노쇼 횟수 기준', '표시 위치'],
    similarId: 'b-noshow',
    similarName: '노쇼 기록',
    similarPrice: 1_000_000,
    similarity: 92,
    mergeTargets: [
      { id: 'b-noshow', name: '노쇼 기록', price: 1_000_000, use: '사용 중 12건', similarity: 92 },
      { id: 'b-memo', name: '예약 메모', price: 400_000, use: '사용 중 28건', similarity: 41 },
    ],
  },
  {
    id: 'b-13',
    name: '알레르기 사전 접수',
    status: '새 블록',
    projects: 2,
    when: '11월 2일 08:30',
    industry: '음식점(코스)',
    why: '예약할 때 손님의 알레르기 재료를 미리 받기',
    price: 550_000,
    use: '초안 1 · 명세 1',
    summary: '예약할 때 손님의 알레르기 재료를 미리 받습니다.',
    decisions: ['필수 여부', '안내 문구'],
    similarId: 'b-memo',
    similarName: '예약 메모',
    similarPrice: 400_000,
    similarity: 41,
    mergeTargets: [
      { id: 'b-memo', name: '예약 메모', price: 400_000, use: '사용 중 28건', similarity: 41 },
    ],
  },
  {
    id: 'b-14',
    name: '반려동물 동반 표시',
    status: '새 블록',
    projects: 2,
    when: '11월 1일 19:02',
    industry: '카페',
    why: '반려동물 동반 여부와 가능한 자리 표시',
    price: 650_000,
    use: '초안 2 · 명세 0',
    summary: '반려동물 동반 여부와 가능한 자리를 표시합니다.',
    decisions: ['가능 자리', '표시 방식'],
    similarId: 'b-memo',
    similarName: '예약 메모',
    similarPrice: 400_000,
    similarity: 54,
    mergeTargets: [
      { id: 'b-memo', name: '예약 메모', price: 400_000, use: '사용 중 28건', similarity: 54 },
    ],
  },
  {
    id: 'b-15',
    name: '와인 페어링 추천',
    status: '새 블록',
    projects: 1,
    when: '10월 31일 21:15',
    industry: '음식점(와인 바)',
    why: '코스 메뉴별 어울리는 와인 추천',
    price: 900_000,
    use: '초안 1 · 명세 0',
    summary: '코스 메뉴별 어울리는 와인을 추천합니다.',
    decisions: ['추천 개수', '표시 위치'],
    similarId: 'b-none',
    similarName: '비슷한 블록 없음',
    similarPrice: 0,
    similarity: 23,
    mergeTargets: [],
  },
  {
    id: 'b-16',
    name: '주차 안내',
    status: '새 블록',
    projects: 4,
    when: '10월 31일 16:40',
    industry: '음식점(한식)',
    why: '주차 가능 여부와 제휴 주차장 안내',
    price: 800_000,
    use: '초안 3 · 명세 1',
    summary: '방문 전에 주차 가능 여부와 제휴 주차장 위치 · 요금을 손님에게 안내합니다.',
    decisions: ['제휴 주차장 범위', '안내 시점'],
    similarId: 'b-way',
    similarName: '오시는 길',
    similarPrice: 500_000,
    similarity: 35,
    mergeTargets: [
      { id: 'b-way', name: '오시는 길', price: 500_000, use: '사용 중 14건', similarity: 35 },
    ],
  },
  {
    id: 'b-17',
    name: '수강권 차감',
    status: '새 블록',
    projects: 1,
    when: '10월 30일 11:20',
    industry: '공방',
    why: '수업에 올 때마다 수강권 횟수를 차감',
    price: 1_050_000,
    use: '초안 1 · 명세 0',
    summary: '수업에 올 때마다 수강권 횟수를 차감합니다.',
    decisions: ['차감 시점', '잔여 표시'],
    similarId: 'b-pay',
    similarName: '예약금 결제',
    similarPrice: 1_200_000,
    similarity: 38,
    mergeTargets: [
      { id: 'b-pay', name: '예약금 결제', price: 1_200_000, use: '사용 중 22건', similarity: 38 },
    ],
  },
  {
    id: 'b-18',
    name: '방문 후 리뷰 요청',
    status: '병합 후보',
    projects: 0,
    when: '10월 30일 10:05',
    industry: '음식점(코스)',
    why: '방문 다음 날 리뷰를 부탁하는 알림 발송',
    price: 450_000,
    use: '초안 0 · 명세 0',
    summary: '방문 다음 날 손님에게 리뷰를 부탁하는 알림을 보냅니다.',
    decisions: ['발송 시점', '발송 수단'],
    similarId: 'b-remind',
    similarName: '리마인드 알림',
    similarPrice: 600_000,
    similarity: 71,
    mergeTargets: [
      { id: 'b-remind', name: '리마인드 알림', price: 600_000, use: '사용 중 27건', similarity: 71 },
    ],
  },
];

export function resolveBlockMock(raw: string | null): BlockMock {
  if (raw && (BLOCK_MOCKS as readonly string[]).includes(raw)) return raw as BlockMock;
  return '새 블록 목록';
}

export function defaultIdOf(mock: BlockMock): string {
  if (mock === '단가 수정') return 'b-16';
  if (mock === '비활성화') return 'b-18';
  return 'b-12';
}

export function blockOf(id: string | null): BlockRow {
  return BLOCKS.find((b) => b.id === id) ?? BLOCKS[0]!;
}

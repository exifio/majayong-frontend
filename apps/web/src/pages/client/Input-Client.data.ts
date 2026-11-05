/* 의뢰인 입력(Input-Client) 시연 데이터 — 보드 Input-Client.dc.html · PRD 9.1 · F-01 · F-02 · 11.1 */
export const INPUT_MOCKS = ['첫 방문', '작성 중 초안 있음', '한도 도달'] as const;
export type InputMock = (typeof INPUT_MOCKS)[number];

export type DraftRow = {
  id: string;
  when: string;
  title: string;
  meta: string;
  amount: number;
  tbd?: string;
};

export type InputDemo = {
  atLimit: boolean;
  canStart: boolean;
  showDrafts: boolean;
  drafts: DraftRow[];
  archived: DraftRow[];
  archivedNote: string;
  limitNoteTitle: string;
  limitNoteBody: string;
  limitReason: string;
  placeholder: string;
  defaultBudget: string;
  howSteps: { title: string; body: string }[];
};

const DRAFT_ALL: DraftRow[] = [
  {
    id: 'd-active-1',
    when: '3일 전 수정',
    title: '단골 등급 관리 외 2개 기능',
    meta: '명세 항목 3개 · 채팅 수정 22회 남음',
    amount: 1_092_000,
  },
  {
    id: 'd-active-2',
    when: '8일 전 수정',
    title: '예약 달력 외 4개 기능',
    meta: '명세 항목 5개 · 채팅 수정 30회 남음',
    amount: 4_305_000,
  },
  {
    id: 'd-active-3',
    when: '12일 전 수정',
    title: '회차 예약 외 1개 기능',
    meta: '명세 항목 2개 · 채팅 수정 27회 남음',
    amount: 945_000,
  },
];

const ARCHIVED: DraftRow[] = [
  {
    id: 'd-arch-1',
    when: '10월 24일 보관 · 9월 24일 마지막 수정',
    title: '좌석 배치도 외 1개 기능',
    meta: '명세 항목 2개 · 채팅 수정 28회 남음',
    amount: 640_500,
  },
];

const HOW = [
  {
    title: '문장에서 기능을 뽑습니다',
    body: 'AI가 적으신 문장에서 기능만 뽑아 블록으로 그립니다. 처음 보는 기능이면 새 블록을 만들고, 한 번 만든 블록은 다른 분께도 같은 모습으로 쓰입니다.',
  },
  {
    title: '예상 총액으로 예산을 가늠합니다',
    body: '블록마다 AI가 분석해 정해 둔 단가로 예상 총액을 보여드립니다. 같은 기능은 누구에게나 같은 금액이고, 실제 금액은 공급자의 견적으로 정해집니다.',
  },
  {
    title: '적으신 문장은 공개되지 않습니다',
    body: '공급자에게는 블록으로 정리된 명세만 보입니다. 문장 속 이름이나 연락처는 기능을 뽑을 때 걸러지고, 원문은 어느 공급자에게도 열리지 않습니다.',
  },
] as const;

const SHARED = {
  archived: ARCHIVED,
  archivedNote:
    '30일 동안 손대지 않았거나 \'처음부터\'로 새로 시작한 초안은 여기 보관합니다. 다시 열어도 예상 금액은 처음 그대로입니다. 필요 없는 초안은 삭제할 수 있지만, 삭제하면 되돌릴 수 없습니다.',
  limitNoteTitle: '작성 중인 초안이 3개입니다',
  limitNoteBody:
    '새로 시작하려면 아래 초안 중 하나를 확정하거나, 보관하거나, 삭제해 주세요. 보관한 초안은 나중에 다시 열 수 있고, 삭제한 초안은 되살릴 수 없습니다.',
  limitReason: '작성 중인 초안이 3개입니다. 하나를 확정·보관·삭제해 주세요.',
  placeholder: '예) 예약 앱이랑 전화를 같이 받는데 노쇼 나면 재료를 다 버려요.',
  defaultBudget: '5,000,000',
  howSteps: [...HOW],
};

const BY_MOCK: Record<InputMock, InputDemo> = {
  '첫 방문': {
    ...SHARED,
    atLimit: false,
    canStart: true,
    showDrafts: false,
    drafts: [],
  },
  '작성 중 초안 있음': {
    ...SHARED,
    atLimit: false,
    canStart: true,
    showDrafts: true,
    drafts: DRAFT_ALL.slice(0, 1),
  },
  '한도 도달': {
    ...SHARED,
    atLimit: true,
    canStart: false,
    showDrafts: true,
    drafts: DRAFT_ALL,
  },
};

export function resolveInputMock(raw: string | null): InputMock {
  if (raw && (INPUT_MOCKS as readonly string[]).includes(raw)) return raw as InputMock;
  return '작성 중 초안 있음';
}

export function inputDemoOf(mock: InputMock): InputDemo {
  return BY_MOCK[mock];
}

/** 새 초안 받기 → 2분할 '초안 만드는 중' */
export const DRAFT_CREATING_HREF = `/c/drafts/d-1?mock=${encodeURIComponent('초안 만드는 중')}`;
/** 업종 기본 구성 · 이어서 고치기 · 다시 열기 */
export const DRAFT_HREF = '/c/drafts/d-1';

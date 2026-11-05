/* 검수 시연 — PRD F-13 · 11.3. 금액·기한은 데이터 값. */

export const INSPECT_MOCKS = [
  '검수 대기',
  '보완 요청 작성',
  '승인 확인',
  '최종 검수',
  '도움 요청',
  '중간 승인 완료',
  '검수 기한 하루 전',
] as const;
export type InspectMock = (typeof INSPECT_MOCKS)[number];

export const DEFAULT_CID = 'c-ondo';
export const LIST_HREF = '/c/contracts';
export const REVIEW_HREF = '/c/contracts/c-ondo/review';
export const CHAT_HREF = '/c/chat/p-ondo/s-junho';

export function resolveInspectMock(raw: string | null): InspectMock {
  if (raw && (INSPECT_MOCKS as readonly string[]).includes(raw)) return raw as InspectMock;
  return '검수 대기';
}

export type Cond = { q: string; a: string; unset?: boolean };
export type Item = {
  id: string;
  name: string;
  desc: string;
  status: 'wait' | 'ok' | 'fix';
  statusLabel: string;
  conds: Cond[];
  link: string;
  files: string[];
  when: string;
  memo: string;
  okNote?: string;
};

export type InspectDemo = {
  mock: InspectMock;
  stage: 'mid' | 'final';
  stageLabel: string;
  stageAmount: number;
  deadlineAt: string;
  showDeadline: boolean;
  dueWarn: boolean;
  midDone: boolean;
  finalDoneCta: boolean;
  approveOpen: boolean;
  helpOpen: boolean;
  fixForm: boolean;
  titleChip: string;
  titleChipTone: 'blue' | 'amber' | 'teal';
  items: Item[];
  deliveryNote: string;
};

export const DEMO = {
  pageTitle: '검수',
  crumbContracts: '내 계약',
  crumbContract: '예약 달력, 예약금 결제 외 2개 기능',
  sub: '계약서에 붙은 기능과 조건이 검수 기준입니다. 항목마다 결과물을 확인하고 승인하거나 보완을 요청해 주세요.',
  supplierName: '최준호',
  supplierInitial: '최',
  midLabel: '중간 구간',
  finalLabel: '최종 구간',
  stageAmount: 1_550_000,
  approve: '승인하기',
  approveDialogTitle: '이 구간을 승인합니다',
  approveDialogBody: '승인하면 이 구간 금액이 공급자에게 지급됩니다',
  approveConfirm: '승인하고 지급',
  fix: '보완 요청',
  fixTitle: '보완 요청 작성',
  fixSend: '보완 요청 보내기',
  fixCancel: '취소',
  fixEmpty: '사유를 적어 주세요',
  fixHint: '어느 항목인지 고르고 사유를 적어 주세요. 비어 있으면 보낼 수 없습니다.',
  help: '도움 요청',
  helpTitle: '운영자에게 도움 요청',
  helpBody: '같은 문제로 보완이 반복되거나 조건 해석이 다를 때 운영자가 근거를 보고 판정합니다.',
  helpSent: '도움 요청을 보냈습니다. 판정 전까지 이 항목 검수는 멈춥니다.',
  dueTitle: '내일까지 검수하지 않으면 자동 승인됩니다',
  dueBody:
    '내일(12월 2일)까지 검수하지 않으면 예약 달력 · 예약금 결제가 자동 승인되고 중간 구간 1,550,000원이 최준호님에게 지급됩니다.',
  midDoneTitle: '중간 구간 승인 · 1,550,000원 지급 완료',
  midDoneBody:
    '11월 27일 · 예약 달력과 예약금 결제를 모두 승인해 중간 구간 금액이 최준호님에게 지급되었습니다.',
  toContracts: '내 계약으로',
  toReview: '리뷰 쓰기',
  checkLabel: '확인함',
  deliveryHeading: '공급자 납품물',
  criteriaHeading: '검수 기준 · 계약서에 붙은 합의 조건',
  unset: '정하지 않음',
  unsetHint: '기능 설명대로 동작하는지만 봅니다',
} as const;

const CAL: Item = {
  id: 'cal',
  name: '예약 달력',
  desc: '회차별로 예약받고 정원이 차면 마감',
  status: 'wait',
  statusLabel: '검수 대기',
  conds: [
    { q: '회차 구성', a: '점심 1회 · 저녁 2회, 회차마다 정원 10석' },
    { q: '예약 가능 기간', a: '방문 30일 전부터 전날 18시까지' },
  ],
  link: 'https://test.ondo-dining.kr/admin/slots',
  files: ['회차설정_화면.png'],
  when: '11월 25일 납품',
  memo: '관리 화면 › 예약 설정에서 회차와 정원을 바꾼 뒤, 손님 화면에서 정원이 차면 마감되는지 확인해 주세요.',
};

const DEP: Item = {
  id: 'dep',
  name: '예약금 결제',
  desc: '예약할 때 예약금을 받고 환불 규정 안내',
  status: 'wait',
  statusLabel: '검수 대기',
  conds: [
    { q: '예약금 금액', a: '1인당 30,000원 정액, 관리 화면에서 바꿀 수 있게' },
    { q: '환불 기준', a: '회차마다 정한 마감 시각 전에 취소하면 전액 환불, 그 뒤에는 환불 없음' },
  ],
  link: 'https://test.ondo-dining.kr/reserve',
  files: [],
  when: '11월 25일 납품',
  memo: '메모 없음',
};

const DEP2: Item = {
  ...DEP,
  files: ['환불마감_수정.mp4'],
  when: '11월 26일 다시 납품 · 보완 1회',
  memo: '저녁 2부(마감 17:00) 예약을 만든 뒤 17:01 이후 취소해 보세요. 환불 버튼 대신 “환불 기간이 지났습니다”가 보입니다.',
};

const NOS: Item = {
  id: 'nos',
  name: '노쇼 기록',
  desc: '노쇼 손님을 기록해 다음 예약 때 표시',
  status: 'wait',
  statusLabel: '검수 대기',
  conds: [
    { q: '노쇼 판정 기준', a: '예약 시각 30분이 지나도 연락이 없으면 노쇼' },
    { q: '표시 방식', a: '기능 설명대로 동작하는지만 봅니다', unset: true },
  ],
  link: 'https://test.ondo-dining.kr/admin/noshow',
  files: ['노쇼기록_흐름.pdf'],
  when: '12월 12일 납품',
  memo: '관리 화면 › 예약 목록에서 지난 예약을 노쇼로 표시한 뒤, 같은 손님이 다시 예약하면 표시가 붙는지 확인해 주세요.',
};

const REM: Item = {
  id: 'rem',
  name: '리마인드 알림',
  desc: '예약 전날 손님에게 안내 자동 발송',
  status: 'wait',
  statusLabel: '검수 대기',
  conds: [
    { q: '발송 시점', a: '방문 전날 18:00' },
    { q: '발송 수단', a: '카카오 알림톡, 실패하면 문자' },
  ],
  link: 'https://test.ondo-dining.kr/admin/remind',
  files: [],
  when: '12월 12일 납품',
  memo: '관리 화면 › 알림 기록에서 테스트 발송을 눌러 보세요. 알림톡이 실패하면 문자로 바뀐 기록이 남습니다.',
};

function ok(item: Item, note: string): Item {
  return { ...item, status: 'ok', statusLabel: '승인', okNote: note };
}

export function inspectDemoOf(mock: InspectMock): InspectDemo {
  const final = mock === '최종 검수';
  const midDone = mock === '중간 승인 완료';
  const fixForm = mock === '보완 요청 작성';
  const approveOpen = mock === '승인 확인';
  const helpOpen = mock === '도움 요청';
  const dueWarn = mock === '검수 기한 하루 전';

  let items: Item[];
  if (midDone) {
    items = [
      ok(CAL, '11월 25일 승인 · 다시 검수하지 않습니다'),
      ok(DEP2, '11월 27일 승인 · 보완 1회 · 다시 검수하지 않습니다'),
    ];
  } else if (final) {
    items = [NOS, REM];
  } else if (fixForm) {
    items = [
      ok(CAL, '11월 25일 승인 · 다시 검수하지 않습니다'),
      { ...DEP, status: 'fix', statusLabel: '보완 요청 작성 중' },
    ];
  } else if (approveOpen || helpOpen) {
    items = [ok(CAL, '11월 25일 승인 · 다시 검수하지 않습니다'), DEP2];
  } else {
    items = [CAL, DEP];
  }

  return {
    mock,
    stage: final ? 'final' : 'mid',
    stageLabel: final ? DEMO.finalLabel : DEMO.midLabel,
    stageAmount: DEMO.stageAmount,
    deadlineAt: final ? '2026-12-19T23:59:00+09:00' : '2026-12-02T23:59:00+09:00',
    showDeadline: !midDone,
    dueWarn,
    midDone,
    finalDoneCta: final,
    approveOpen,
    helpOpen,
    fixForm,
    titleChip: midDone
      ? '지급 완료'
      : fixForm
        ? '보완 요청 작성 중'
        : final
          ? '검수 대기'
          : '검수 대기',
    titleChipTone: midDone ? 'teal' : fixForm || dueWarn ? 'amber' : 'blue',
    items,
    deliveryNote: '조건 줄대로 동작하는지 확인해 주세요',
  };
}

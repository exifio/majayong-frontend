/* 이견 개입 시연 — PRD F-27 · 11.3. */

export const DISPUTE_MOCKS = ['검토 중', '판정 작성', '판정 완료'] as const;
export type DisputeMock = (typeof DISPUTE_MOCKS)[number];

export type DisputeRow = {
  id: string;
  title: string;
  status: '검토 중' | '처리 완료';
  listMeta: string;
  meta: string;
  client: string;
  supplier: string;
  clientClaim: string;
  supplierClaim: string;
  conditions: { q: string; a: string; hl?: boolean; nd?: boolean }[];
  conditionNote: string;
  revisions: { b: string; s: string; now?: boolean; amber?: boolean }[];
  deliverLink: string;
  deliverMeta: string;
  quotes: { who: string; text: string }[];
  timeline: { who: string; when: string; text: string }[];
  resultSummary?: string;
  resultDetail?: string;
  doneBand?: { title: string; body: string };
};

export const DEMO = {
  title: '이견 개입',
  sub: '같은 항목에 보완 요청이 반복되면 개입합니다. 판단 근거는 계약서에 첨부된 합의 내용의 조건 줄이고, 화면은 근거를 모아 보여 줍니다.',
  listLabel: '이견 목록',
  detailLabel: '이견 상세',
  confirm: '판정 확정',
  reasonLabel: '판정 사유',
  reasonNeed: '사유를 적어 주세요',
  eventNote: '이 처리는 이벤트 기록에 남습니다',
  resultLabel: '판정 결과',
} as const;

export const RESULT_KEYS = ['approve', 'revise', 'partial'] as const;

export const REASON_DEMO =
  "회차 구성 줄(정원 12석)은 3회차 납품에서 충족했다 — 의뢰인도 11월 27일 동시 예약 문제는 해결됐다고 확인. 3회 요청은 정원을 바꿨을 때의 처리로, 계약서에 '정원 변경 — 정하지 않음'으로 남은 조건이다. 기능 설명(회차마다 정원을 정해 예약받기)대로 동작하므로 이 부분은 검수 대상이 아니다.";

export const DISPUTES: DisputeRow[] = [
  {
    id: 'dp-1',
    title: '회차 예약 — 회차 예약, 대기 등록 외 1개 기능',
    status: '검토 중',
    listMeta:
      '회차 예약, 대기 등록 외 1개 기능\n의뢰인 누리 국수 · 공급자 이도윤\n11월 28일 의뢰인이 도움 요청',
    meta: '의뢰인 누리 국수 · 공급자 이도윤 · 합의 2,200,000원 · 중간 구간(회차 예약 · 대기 등록) 1,100,000원 · 대기 등록은 11월 20일 승인',
    client: '누리 국수',
    supplier: '이도윤',
    clientClaim:
      '두 손님이 동시에 예약하면 정원 12석을 넘겨 14명까지 받습니다. 정원을 10석으로 줄였을 때도 이미 받은 예약이 그대로라 넘칩니다.',
    supplierClaim:
      '정원 12석은 지켜집니다. 동시 예약은 고쳤습니다. 정원을 바꾸는 기능은 계약서에서 정하지 않은 조건이라 이번 범위가 아닙니다.',
    conditions: [
      { q: '회차 구성', a: '점심 1회 · 저녁 2회, 회차마다 정원 12석', hl: true },
      { q: '예약 마감', a: '방문 전날 21시까지' },
      { q: '정원 변경', a: '정하지 않음 — 검수 기준이 아님 · 기능 설명대로 동작하는지만 봅니다', nd: true },
    ],
    conditionNote:
      "계약서 제4조 — 각 항목에 적힌 합의 조건이 검수 기준이고, '정하지 않음' 조건은 검수 기준이 되지 않으며 그 항목은 기능 설명에 맞게 동작하는지만 본다. 계약에 없는 기능은 새 프로젝트로.",
    revisions: [
      {
        b: '11월 20일 · 1회 · 조건과 다름(회차 구성)',
        s: '"13번째 손님도 예약이 됩니다." → 11월 21일 다시 납품',
        amber: true,
      },
      {
        b: '11월 24일 · 2회 · 조건과 다름(회차 구성)',
        s: '"두 명이 동시에 누르면 14명이 됩니다." → 11월 26일 다시 납품',
        amber: true,
      },
      {
        b: '11월 27일 · 3회 · 조건과 다름(회차 구성)',
        s: '"정원을 10석으로 바꾸니 이미 받은 12명이 그대로입니다."',
        amber: true,
      },
      {
        b: '11월 28일 · 의뢰인 도움 요청',
        s: '공급자는 3회 요청이 범위 밖이라고 답함',
        now: true,
      },
    ],
    deliverLink: 'test.nuri-guksu.kr/reserve',
    deliverMeta: '3회차 제출 · 11월 26일 · 확인 방법: 두 창에서 같은 회차를 동시에 예약',
    quotes: [
      {
        who: '공급자 이도윤 · 11월 26일 18:02',
        text: '"동시에 눌러도 12석을 넘지 않게 고쳤습니다. 두 창으로 확인해 주세요."',
      },
      {
        who: '의뢰인 누리 국수 · 11월 27일 11:15',
        text: '"동시 예약은 이제 괜찮아요. 그런데 정원을 줄이면 넘친 예약은 어떻게 되나요?"',
      },
    ],
    timeline: [
      {
        who: '의뢰인 누리 국수',
        when: '11월 20일',
        text: '1회 보완 요청 — 정원 초과',
      },
      {
        who: '공급자 이도윤',
        when: '11월 21일',
        text: '다시 납품',
      },
      {
        who: '의뢰인 누리 국수',
        when: '11월 24일',
        text: '2회 보완 요청 — 동시 예약',
      },
      {
        who: '공급자 이도윤',
        when: '11월 26일',
        text: '다시 납품 · 동시 예약 수정',
      },
      {
        who: '의뢰인 누리 국수',
        when: '11월 27일',
        text: '3회 보완 요청 — 정원 변경 후 처리',
      },
      {
        who: '의뢰인 누리 국수',
        when: '11월 28일',
        text: '운영자에게 도움 요청',
      },
      {
        who: '공급자 이도윤',
        when: '11월 28일',
        text: '3회 요청은 범위 밖이라고 답함',
      },
    ],
  },
  {
    id: 'dp-done',
    title: '회차 예약 — 회차 예약, 대기 등록 외 1개 기능',
    status: '처리 완료',
    listMeta:
      '회차 예약, 대기 등록 외 1개 기능\n의뢰인 누리 국수 · 공급자 이도윤\n11월 28일 판정 완료',
    meta: '의뢰인 누리 국수 · 공급자 이도윤 · 합의 2,200,000원 · 중간 구간 1,100,000원',
    client: '누리 국수',
    supplier: '이도윤',
    clientClaim:
      '두 손님이 동시에 예약하면 정원 12석을 넘겨 14명까지 받습니다. 정원을 10석으로 줄였을 때도 이미 받은 예약이 그대로라 넘칩니다.',
    supplierClaim:
      '정원 12석은 지켜집니다. 동시 예약은 고쳤습니다. 정원을 바꾸는 기능은 계약서에서 정하지 않은 조건이라 이번 범위가 아닙니다.',
    conditions: [
      { q: '회차 구성', a: '점심 1회 · 저녁 2회, 회차마다 정원 12석', hl: true },
      { q: '예약 마감', a: '방문 전날 21시까지' },
      { q: '정원 변경', a: '정하지 않음', nd: true },
    ],
    conditionNote:
      "계약서 제4조 — '정하지 않음' 조건은 검수 기준이 되지 않으며 기능 설명에 맞게 동작하는지만 본다.",
    revisions: [
      { b: '11월 20일 · 1회', s: '조건과 다름(회차 구성)', amber: true },
      { b: '11월 24일 · 2회', s: '조건과 다름(회차 구성)', amber: true },
      { b: '11월 27일 · 3회', s: '조건과 다름(회차 구성)', amber: true },
      { b: '11월 28일 · 의뢰인 도움 요청', s: '운영자 개입' },
    ],
    deliverLink: 'test.nuri-guksu.kr/reserve',
    deliverMeta: '3회차 제출 · 11월 26일',
    quotes: [],
    timeline: [
      { who: '의뢰인', when: '11월 28일', text: '도움 요청' },
      { who: '운영자 김하늘', when: '11월 28일 16:40', text: '판정 보냄 — 부분 정산(정하지 않은 조건)' },
      { who: '의뢰인', when: '11월 29일', text: '회차 예약 승인 → 중간 구간 1,100,000원 지급' },
    ],
    resultSummary: '부분 정산 · 정하지 않은 조건',
    resultDetail:
      "회차 구성 줄(정원 12석)은 3회차 납품에서 충족. 3회 요청은 '정원 변경 — 정하지 않음' 조건이라 검수 대상이 아님. 기능 설명대로 동작함.",
    doneBand: {
      title: '판정을 보냈습니다 · 11월 28일 16:40 · 운영자 김하늘',
      body: '양쪽 채팅과 내 계약에 판정이 기록되었습니다. 판정 사유는 이벤트 기록에 남았습니다.',
    },
  },
];

export function resolveDisputeMock(raw: string | null): DisputeMock {
  if (raw && (DISPUTE_MOCKS as readonly string[]).includes(raw)) return raw as DisputeMock;
  return '검토 중';
}

export function defaultIdOf(mock: DisputeMock): string {
  if (mock === '판정 완료') return 'dp-done';
  return 'dp-1';
}

export function disputeOf(id: string | null): DisputeRow {
  return DISPUTES.find((d) => d.id === id) ?? DISPUTES[0]!;
}

export function listFor(mock: DisputeMock): DisputeRow[] {
  if (mock === '판정 완료') return [DISPUTES[1]!];
  return [DISPUTES[0]!];
}

/* 견적서 상세 시연 데이터 — 보드 Quote-Client.dc.html · PRD F-09 · ㉜
 * 모달 틀은 App. sid · mock으로 공급자 선택. 판정·선택하기 없음. */
import { CONTACT_MASK_TOKEN } from '@majayong/types';

export const QUOTE_MOCKS = [
  '최준호(채팅에서 수정)',
  '김세라',
  '스튜디오 넛(불가 1건)',
  '이전 명세 기준',
  '거절 확인',
] as const;
export type QuoteMock = (typeof QUOTE_MOCKS)[number];

export const QUOTE_SIDS = ['s-junho', 's-sera', 's-nut'] as const;
export type QuoteSid = (typeof QUOTE_SIDS)[number];

export const DEFAULT_PID = 'p-ondo';
export const FEE_RATE = 0.05;

export function resolveQuoteMock(raw: string | null): QuoteMock | null {
  if (raw && (QUOTE_MOCKS as readonly string[]).includes(raw)) return raw as QuoteMock;
  return null;
}

export function resolveQuoteSid(raw: string | null): QuoteSid {
  if (raw && (QUOTE_SIDS as readonly string[]).includes(raw)) return raw as QuoteSid;
  return 's-junho';
}

export function chatHref(pid: string, sid: string) {
  return `/c/chat/${pid}/${sid}`;
}

export function profileHref(sid: string) {
  return `/c/suppliers/${sid}`;
}

export function withFee(amount: number) {
  return amount + Math.floor(amount * FEE_RATE);
}

export type QuoteItem = {
  name: string;
  description: string;
  ok: boolean;
};

export type QuoteHist = {
  date: string;
  title: string;
  amount: number;
  days: number;
  why: string;
  now: boolean;
};

export type QuoteDemo = {
  sid: QuoteSid;
  ini: string;
  name: string;
  career: string;
  rating: string;
  reviews: string;
  applied: string;
  revLabel: string;
  amount: number;
  days: number;
  chg: string;
  okCnt: number;
  okNote: string;
  items: QuoteItem[];
  hasNo: boolean;
  message: string;
  masked: boolean;
  questions: string[];
  hist: QuoteHist[];
  hasChat: boolean;
  stale: boolean;
  openReject: boolean;
  basis: string;
  footNote: string;
};

const SPEC: { name: string; description: string }[] = [
  { name: '예약 달력', description: '회차별로 예약받고 정원이 차면 마감' },
  { name: '예약금 결제', description: '예약할 때 예약금을 받고 환불 규정 안내' },
  { name: '노쇼 기록', description: '노쇼 손님을 기록해 다음 예약 때 표시' },
  { name: '리마인드 알림', description: '예약 전날 손님에게 안내 자동 발송' },
];

type SupplierSeed = {
  sid: QuoteSid;
  ini: string;
  name: string;
  career: string;
  rating: string;
  reviews: string;
  applied: string;
  amount: number;
  days: number;
  ok: boolean[];
  chat: boolean;
  masked: boolean;
  questions: string[];
  msgA: string;
  msgB: string;
  hist: QuoteHist[];
};

const JUNHO: SupplierSeed = {
  sid: 's-junho',
  ini: '최',
  name: '최준호',
  career: '경력 5년',
  rating: '★ 4.8',
  reviews: '리뷰 12건',
  applied: '10월 29일 지원',
  amount: 3_100_000,
  days: 42,
  ok: [true, true, true, true],
  chat: true,
  masked: true,
  questions: [
    '예약금은 카드 결제만 받으시나요, 계좌이체도 받으시나요?',
    '기존 전화 예약 고객 명단을 새 예약 화면으로 옮겨야 하나요?',
  ],
  msgA:
    '회차제 코스 레스토랑 예약 사이트를 올해 만들어 지금도 운영을 돕고 있습니다. 예약금 금액과 환불 기준은 관리 화면에서 직접 바꾸실 수 있게 만들겠습니다. 리마인드는 문자보다 도달률이 높은 알림톡을 권합니다.\n작업 화면은 주 1회 공유드리고, 급한 문의는',
  msgB: '로 주셔도 됩니다.',
  hist: [
    {
      date: '11월 1일 · 채팅에서 수정',
      title: '2회차',
      amount: 3_100_000,
      days: 42,
      why: '환불 기준을 회차별로 다르게 두려면 작업이 늘어납니다',
      now: true,
    },
    {
      date: '10월 29일 · 지원',
      title: '1회차',
      amount: 3_000_000,
      days: 42,
      why: '',
      now: false,
    },
  ],
};

const SERA: SupplierSeed = {
  sid: 's-sera',
  ini: '김',
  name: '김세라',
  career: '경력 7년',
  rating: '★ 4.6',
  reviews: '리뷰 21건',
  applied: '10월 30일 지원',
  amount: 4_400_000,
  days: 35,
  ok: [true, true, true, true],
  chat: true,
  masked: false,
  questions: ['8인 이상 단체 예약도 온라인으로 받으실 건가요?'],
  msgA:
    '디자인부터 개발까지 혼자 맡습니다. 손님이 휴대폰으로 예약하기 편한 화면에 신경을 많이 쓰고, 문자 알림 연동 경험이 여러 번 있습니다. 전날 취소는 전액 환불, 당일 취소는 환불 없음을 기본값으로 두고 바꿀 수 있게 하겠습니다.',
  msgB: '',
  hist: [
    {
      date: '10월 30일 · 지원',
      title: '1회차',
      amount: 4_400_000,
      days: 35,
      why: '',
      now: true,
    },
  ],
};

const NUT: SupplierSeed = {
  sid: 's-nut',
  ini: '넛',
  name: '스튜디오 넛',
  career: '제작사 · 경력 9년',
  rating: '평점 없음',
  reviews: '리뷰 없음',
  applied: '11월 1일 지원',
  amount: 4_500_000,
  days: 56,
  ok: [true, true, true, false],
  chat: false,
  masked: false,
  questions: [],
  msgA:
    '기획 · 디자인 · 개발 3인이 함께 맡습니다. 예약과 결제, 노쇼 관리는 관리자 화면까지 포함해 만들고, 리마인드 알림은 이미 쓰고 계신 예약 앱의 알림을 그대로 쓰시는 편이 낫다고 판단해 이번 견적에서 뺐습니다.',
  msgB: '',
  hist: [
    {
      date: '11월 1일 · 지원',
      title: '1회차',
      amount: 4_500_000,
      days: 56,
      why: '',
      now: true,
    },
  ],
};

const BY_SID: Record<QuoteSid, SupplierSeed> = {
  's-junho': JUNHO,
  's-sera': SERA,
  's-nut': NUT,
};

export const DEMO = {
  staleTitle: '이 견적으로는 계약할 수 없습니다',
  staleBody:
    '명세를 고치기 전에 받은 견적입니다. 공급자에게 재견적을 요청했고, 새 견적이 들어오면 채팅에서 \'이 사람과 계약하기\'를 누를 수 있습니다.',
  unavailableNote:
    '불가 항목은 이 공급자와의 계약 범위에 들어가지 않습니다. 필요하면 채팅으로 다시 이야기해 보실 수 있습니다.',
  maskNote: '계약이 체결되기 전에는 연락처가 자동으로 가려집니다.',
  footOk: '조건을 채팅에서 정한 뒤, 채팅의 \'이 사람과 계약하기\'로 계약을 진행합니다.',
  footStale:
    '명세를 고치기 전에 받은 견적입니다. 공급자에게 재견적을 요청했고, 새 견적이 들어오면 계약할 수 있습니다.',
  rejectPlaceholder: '예: 예산과 차이가 큽니다',
  chatLabel: '문의하기 (채팅)',
};

function seedOf(mock: QuoteMock | null, sid: QuoteSid): { seed: SupplierSeed; stale: boolean; openReject: boolean } {
  const openReject = mock === '거절 확인';
  const view = openReject ? '최준호(채팅에서 수정)' : mock;
  const stale = view === '이전 명세 기준';

  if (view === '김세라' || stale) return { seed: SERA, stale, openReject };
  if (view === '스튜디오 넛(불가 1건)') return { seed: NUT, stale, openReject };
  if (view === '최준호(채팅에서 수정)') return { seed: JUNHO, stale, openReject };
  return { seed: BY_SID[sid], stale: false, openReject: false };
}

export function quoteDemoOf(mock: QuoteMock | null, sidRaw: string | null): QuoteDemo {
  const sid = resolveQuoteSid(sidRaw);
  const { seed, stale, openReject } = seedOf(mock, sid);
  const okCnt = seed.ok.filter(Boolean).length;
  const firstAmt = seed.hist[seed.hist.length - 1]?.amount ?? seed.amount;
  const chg = seed.hist.length > 1 ? `채팅에서 수정 · 처음 ${firstAmt.toLocaleString('ko-KR')}원` : '';

  const message = seed.masked
    ? `${seed.msgA}${CONTACT_MASK_TOKEN}${seed.msgB}`
    : `${seed.msgA}${seed.msgB}`;

  return {
    sid: seed.sid,
    ini: seed.ini,
    name: seed.name,
    career: seed.career,
    rating: seed.rating,
    reviews: seed.reviews,
    applied: seed.applied,
    revLabel: `${seed.hist.length}회차`,
    amount: seed.amount,
    days: seed.days,
    chg,
    okCnt,
    okNote: okCnt === 4 ? '모든 항목 가능' : `불가 ${4 - okCnt}건`,
    items: SPEC.map((s, i) => ({
      name: s.name,
      description: s.description,
      ok: !!seed.ok[i],
    })),
    hasNo: okCnt < 4,
    message,
    masked: seed.masked,
    questions: seed.questions,
    hist: seed.hist,
    hasChat: seed.chat,
    stale,
    openReject,
    basis: stale ? '고치기 전 명세(1판) 기준 · 지금 명세는 2판' : '확정한 명세 1판 기준',
    footNote: stale ? DEMO.footStale : DEMO.footOk,
  };
}

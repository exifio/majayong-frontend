/* 내 지원 현황 시연 — PRD F-10 · 9.6. 금액·수령액은 데이터 값(화면에서 계산하지 않음). */

export const APPS_MOCKS = [
  '전체',
  '선택됨(서명 대기)',
  '보류 중',
  '지원 철회 확인',
  '제출 완료',
] as const;
export type AppsMock = (typeof APPS_MOCKS)[number];

export function resolveAppsMock(raw: string | null): AppsMock {
  if (raw && (APPS_MOCKS as readonly string[]).includes(raw)) return raw as AppsMock;
  return '전체';
}

export const QUOTE_HREF = '/s/applications/p-ondo';
export const CONTRACT_HREF = '/s/contracts/c-ondo';
export const CHAT_HREF = '/s/chat/p-ondo';

export const DEMO = {
  title: '내 지원',
  sub: '보낸 견적이 어디까지 왔는지 봅니다. 문의 채팅은 의뢰인이 열면 시작되고, 견적은 채팅에서 고칠 수 있습니다.',
  sortHint: '지원한 날짜 최신순',
  sentTitle: '견적을 보냈습니다 · 예약 달력, 예약금 결제 외 2개 기능',
  sentBody: '1회차 3,000,000원 · 42일 · 예상 수령 2,850,000원. 의뢰인이 문의하면 채팅이 열리고, 이 목록에서 상태가 바뀝니다.',
  sentCta: '보낸 견적 보기',
  pickKick: '선택됨 · 임시 계약',
  pickTitle: '선택되었습니다 — 11월 10일까지 서명해 주세요',
  pickBody:
    '온도 다이닝이 최종 합의 내용을 확인하고 임시 계약을 만들었습니다. 계약서에서 합의한 기능과 조건을 확인하고 서명해 주세요.',
  pickCta: '서명하러 가기',
  withdraw: '지원 철회',
  withdrawTitle: '지원을 철회할까요?',
  withdrawConfirm: '지원 철회',
  withdrawLead: '단골 등급 관리, 재방문 알림 외 1개 기능 · 브루잉 랩 · 내 견적 1,800,000원',
  withdrawBullets: [
    '철회하면 이 프로젝트에서 다시 선택될 수 없습니다.',
    '지금 진행 중인 임시 계약이 결렬되어도 마찬가지입니다.',
    '의뢰인과의 채팅은 읽기 전용이 됩니다. 되돌릴 수 없습니다.',
  ],
  holdExpandTitle: '보류는 거절이 아닙니다',
  holdReason: '다른 공급자와 계약 진행 중(예치 전) · 결렬되면 다시 선택될 수 있습니다',
} as const;

export type AppCard = {
  id: string;
  title: string;
  client: string;
  applied: string;
  when: string;
  /** chipToneOf용 상태 */
  status: string;
  /** 복합 칩 문구(있으면 Chip에 표시) */
  chipLabel?: string;
  quote: number;
  payout: number;
  quoteLabel: string;
  meta: string;
  note?: string;
  holdReason?: string;
  href: string;
  primary?: { label: string; to: string };
  withdraw?: boolean;
  expand?: boolean;
};

export type TabView = { key: string; label: string; count: number };

export type AppsDemo = {
  mock: AppsMock;
  sent: boolean;
  picked: boolean;
  withdrawOpen: boolean;
  tabs: TabView[];
  cards: AppCard[];
  showEnded: boolean;
  ended: AppCard[];
};

const ONDO: AppCard = {
  id: 'p-ondo',
  title: '예약 달력, 예약금 결제 외 2개 기능',
  client: '온도 다이닝 · 음식점(코스 레스토랑)',
  applied: '10월 29일 지원',
  when: '마감 11월 3일',
  status: '문의 중',
  quote: 3_100_000,
  payout: 2_945_000,
  quoteLabel: '내 견적 · 2회차',
  meta: '42일',
  note: '11월 1일 채팅에서 견적을 고쳤습니다. 새 메시지 1건이 있습니다.',
  href: QUOTE_HREF,
};

const HOLD: AppCard = {
  id: 'p-hold',
  title: '단골 등급 관리, 재방문 알림 외 1개 기능',
  client: '브루잉 랩 · 카페',
  applied: '10월 25일 지원',
  when: '다른 공급자 서명 기한 11월 10일',
  status: '보류',
  quote: 1_800_000,
  payout: 1_710_000,
  quoteLabel: '내 견적 · 1회차',
  meta: '28일',
  holdReason: DEMO.holdReason,
  href: QUOTE_HREF,
  withdraw: true,
};

const REVIEW: AppCard = {
  id: 'p-review',
  title: '회차 예약, 알레르기 사전 접수 외 2개 기능',
  client: '담소 키친 · 음식점(한식 주점)',
  applied: '10월 31일 지원',
  when: '마감 11월 9일',
  status: '문의 중',
  quote: 2_400_000,
  payout: 2_280_000,
  quoteLabel: '내 견적 · 1회차',
  meta: '35일',
  note: '의뢰인이 11월 1일 문의 채팅을 열었습니다.',
  href: QUOTE_HREF,
};

const REQUOTE: AppCard = {
  id: 'p-requote',
  title: '좌석 배치도, 코스 메뉴 선택 외 3개 기능',
  client: '라운드 테이블 · 음식점(와인 바)',
  applied: '10월 27일 지원',
  when: '마감 11월 21일',
  status: '재견적 요청',
  quote: 3_600_000,
  payout: 3_420_000,
  quoteLabel: '내 견적 · 1회차',
  meta: '이전 명세 기준',
  note: '11월 2일 의뢰인이 명세를 고쳤습니다. 지금 견적으로는 선택될 수 없습니다.',
  href: QUOTE_HREF,
};

const PICKED: AppCard = {
  id: 'p-ondo',
  title: '예약 달력, 예약금 결제 외 2개 기능',
  client: '온도 다이닝 · 음식점(코스 레스토랑)',
  applied: '10월 29일 지원',
  when: '서명 기한 11월 10일 · D-7',
  status: '임시 계약',
  chipLabel: '임시 계약 · 서명 대기',
  quote: 3_100_000,
  payout: 2_945_000,
  quoteLabel: '합의 금액 · 2회차',
  meta: '42일',
  note: '임시 계약 중에는 견적을 고칠 수 없습니다. 위 카드에서 서명해 주세요.',
  href: QUOTE_HREF,
};

const SENT_ONDO: AppCard = {
  id: 'p-ondo',
  title: '예약 달력, 예약금 결제 외 2개 기능',
  client: '온도 다이닝 · 음식점(코스 레스토랑)',
  applied: '10월 29일 지원',
  when: '방금 제출 · 마감 11월 3일',
  status: '검토 중',
  quote: 3_000_000,
  payout: 2_850_000,
  quoteLabel: '내 견적 · 1회차',
  meta: '42일',
  note: '의뢰인에게 묻고 싶은 것 2개를 함께 보냈습니다.',
  href: QUOTE_HREF,
};

const ENDED: AppCard[] = [
  {
    id: 'e1',
    title: '전화 예약 대체, 대기 명단 외 1개 기능',
    client: '하루 베이커리 · 베이커리',
    applied: '10월 18일 지원',
    when: '10월 30일',
    status: '자동 거절',
    quote: 1_500_000,
    payout: 1_425_000,
    quoteLabel: '내 견적 · 1회차',
    meta: '21일',
    note: '의뢰인이 다른 공급자와 계약하고 예치를 마쳐 자동으로 거절되었습니다.',
    href: CHAT_HREF,
  },
  {
    id: 'e2',
    title: '포장 주문, 픽업 시간 선택 외 2개 기능',
    client: '면옥 · 음식점(냉면)',
    applied: '10월 15일 지원',
    when: '10월 22일',
    status: '직접 거절',
    quote: 2_200_000,
    payout: 2_090_000,
    quoteLabel: '내 견적 · 1회차',
    meta: '30일',
    note: '의뢰인이 견적을 거절했습니다.',
    href: QUOTE_HREF,
  },
];

export function appsDemoOf(mock: AppsMock): AppsDemo {
  const withdrawOpen = mock === '지원 철회 확인';
  const picked = mock === '선택됨(서명 대기)';
  const held = mock === '보류 중' || withdrawOpen;
  const sent = mock === '제출 완료';

  let cards: AppCard[];
  if (sent) {
    cards = [SENT_ONDO, { ...REQUOTE, status: '검토 중', note: '의뢰인이 아직 문의하지 않았습니다.' }, { ...HOLD, status: '검토 중', holdReason: undefined, withdraw: false, note: '의뢰인이 아직 문의하지 않았습니다.' }];
  } else if (held) {
    cards = [{ ...HOLD, expand: true }];
  } else if (picked) {
    cards = [PICKED, REVIEW, REQUOTE, HOLD];
  } else {
    cards = [ONDO, REVIEW, REQUOTE, HOLD];
  }

  const tabs: TabView[] = sent
    ? [
        { key: 'all', label: '전체', count: 5 },
        { key: 'review', label: '검토 중', count: 3 },
        { key: 'chat', label: '문의 중', count: 0 },
        { key: 'pick', label: '선택됨', count: 0 },
        { key: 'hold', label: '보류', count: 0 },
        { key: 'end', label: '종료', count: 2 },
      ]
    : [
        { key: 'all', label: '전체', count: 7 },
        { key: 'review', label: '검토 중', count: 1 },
        { key: 'chat', label: '문의 중', count: picked ? 1 : 2 },
        { key: 'pick', label: '선택됨', count: picked ? 1 : 0 },
        { key: 'hold', label: '보류', count: 1 },
        { key: 'end', label: '종료', count: 3 },
      ];

  return {
    mock,
    sent,
    picked,
    withdrawOpen,
    tabs,
    cards,
    showEnded: !held,
    ended: sent ? ENDED.slice(0, 1) : ENDED,
  };
}

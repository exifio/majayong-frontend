/* 최종 합의 내용 확인 시연 — 보드 Agreement-Client · PRD F-20 · D4
 * 확인만. 입력 · 고치기 · 빼기 · 비율 조절 없음. */

export const AGREEMENT_MOCKS = [
  '미정 있음',
  '모두 정해짐',
  '첫 문장 기능 빠짐',
  '근거 보기',
] as const;
export type AgreementMock = (typeof AGREEMENT_MOCKS)[number];

export const DEFAULT_PID = 'p-ondo';
export const DEFAULT_SID = 's-junho';
export const MY_HREF = '/c/projects';
export const SUPPLIER = {
  name: '최준호',
  initial: '최',
  meta: '경력 5년 · ★ 4.8 · 리뷰 12건',
} as const;

export function resolveAgreementMock(raw: string | null): AgreementMock {
  if (raw && (AGREEMENT_MOCKS as readonly string[]).includes(raw)) return raw as AgreementMock;
  return '미정 있음';
}

export function chatHref(pid: string, sid: string) {
  return `/c/chat/${pid}/${sid}`;
}

/** 합의 완료 → 임시 계약(아무도 서명 전) */
export function contractHref() {
  return `/c/contracts/c-ondo?mock=${encodeURIComponent('아무도 서명 전')}`;
}

export type CondStatus = 'ok' | 'pr' | 'no';

export type EvidenceMsg = {
  who: string;
  text: string;
  key?: boolean;
};

export type CondDemo = {
  name: string;
  text: string;
  evidenceCount: number;
  /** 미정 있음일 때만 쓰는 상태. 모두 정해짐이면 ok로 덮음 */
  whenOpen: CondStatus;
  proposer?: string;
  evidence?: {
    ai: string;
    note: string;
    messages: EvidenceMsg[];
  };
};

export type FeatureDemo = {
  id: string;
  name: string;
  desc: string;
  stage: '중간' | '최종';
  /** 첫 문장에서 나온 기능 — 빠짐 상태에서 제외 */
  fromFirstSentence?: boolean;
  conds: CondDemo[];
};

/** 보드 · PRD 9.6 시연 — 노쇼 '표시 방식'만 미정(미정 있음) */
export const FEATURES: FeatureDemo[] = [
  {
    id: 'calendar',
    name: '예약 달력',
    desc: '회차별로 예약받고 정원이 차면 마감',
    stage: '중간',
    conds: [
      {
        name: '회차 구성',
        text: '점심 1회 · 저녁 2회, 회차마다 정원 10석',
        evidenceCount: 2,
        whenOpen: 'ok',
      },
      {
        name: '예약 가능 기간',
        text: '방문 30일 전부터 전날 18시까지',
        evidenceCount: 1,
        whenOpen: 'ok',
      },
    ],
  },
  {
    id: 'deposit',
    name: '예약금 결제',
    desc: '예약할 때 예약금을 받고 환불 규정 안내',
    stage: '중간',
    conds: [
      {
        name: '예약금 금액',
        text: '1인당 30,000원 정액, 관리 화면에서 바꿀 수 있게',
        evidenceCount: 2,
        whenOpen: 'ok',
      },
      {
        name: '환불 기준',
        text: '회차마다 정한 마감 시각 전에 취소하면 전액 환불, 그 뒤에는 환불 없음',
        evidenceCount: 3,
        whenOpen: 'ok',
        evidence: {
          ai: '회차마다 정한 마감 시각 전에 취소하면 전액 환불, 그 뒤에는 환불 없음',
          note: "제안 → 받아들임이 있어 '정해짐'으로 표시했습니다 · 근거 3건",
          messages: [
            {
              who: '나 · 11월 1일 14:02',
              text: '전날 취소면 돌려주고 싶은데, 회차마다 다르게 정할 수 있을까요?',
            },
            {
              who: '최준호 · 11월 1일 14:20',
              text: '점심과 저녁 회차마다 마감 시각을 따로 두고, 그 전에 취소하면 전액 환불, 이후는 환불 없음으로 설정하실 수 있게 만들겠습니다.',
            },
            {
              who: '나 · 11월 1일 14:35 — 받아들임',
              text: '좋아요. (환불 기준은 말씀하신 대로)',
              key: true,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'noshow',
    name: '노쇼 기록',
    desc: '노쇼 손님을 기록해 다음 예약 때 표시',
    stage: '최종',
    fromFirstSentence: true,
    conds: [
      {
        name: '노쇼 판정 기준',
        text: '예약 시각 30분이 지나도 연락이 없으면 노쇼',
        evidenceCount: 2,
        whenOpen: 'ok',
      },
      {
        name: '표시 방식',
        text: '다음 예약 때 관리 화면에 노쇼 횟수 표시',
        evidenceCount: 1,
        whenOpen: 'no',
      },
    ],
  },
  {
    id: 'remind',
    name: '리마인드 알림',
    desc: '예약 전날 손님에게 안내 자동 발송',
    stage: '최종',
    conds: [
      {
        name: '발송 시점',
        text: '방문 전날 18:00',
        evidenceCount: 2,
        whenOpen: 'ok',
      },
      {
        name: '발송 수단',
        text: '카카오 알림톡, 실패하면 문자',
        evidenceCount: 2,
        whenOpen: 'ok',
      },
    ],
  },
];

export const DEMO = {
  pageTitle: '최종 합의 내용 확인',
  pageLead:
    '채팅에서 정한 내용을 AI가 기능마다 정리했습니다. 이 화면에서는 고칠 수 없습니다. 다른 점이 있으면 채팅으로 돌아가 고쳐 주세요. 정한 내용은 이 화면에 바로 반영됩니다.',
  openBandTitle: '정하지 않은 조건 1건',
  openBandBody:
    "이 조건은 계약서에 '정하지 않음'으로 남고 검수 기준에서 빠집니다. 기능은 그대로 검수 기준에 들어갑니다. 정하고 싶으면 채팅에서 마저 이야기해 주세요.",
  doneBandTitle: '정할 것 10건이 모두 채팅에서 정해졌습니다',
  doneBandTitleDropped: '정할 것 8건이 모두 채팅에서 정해졌습니다',
  doneBandBody: '아래 내용이 계약서에 검수 기준으로 붙습니다. 다른 점이 있으면 채팅에서 고쳐 주세요.',
  droppedTitle: '처음 문장에서 나온 기능이 빠졌습니다',
  droppedBody:
    '채팅에서 \'노쇼 기록\'을 이번 계약에서 빼기로 하고, 견적을 2,800,000원(3회차)으로 고쳤습니다. 처음 적으신 불편("노쇼 나면 재료를 다 버려요")에서 나온 기능이라 알려 드립니다. 이대로 합의하면 계약 범위에 들어가지 않습니다.',
  payTitle: '지급 구간 · 비율',
  payRatio: '중간 50 : 최종 50',
  payNoteOk: '채팅에서 정한 구간과 비율입니다 · AI 정리 · 근거 2건',
  payNoteOpen:
    '채팅에서 정하지 않아 기본값이 들어갑니다 — 비율 50 : 50, 구간은 명세 순서대로. 바꾸려면 채팅에서 정해 주세요(10~90%).',
  midNames: '예약 달력, 예약금 결제',
  finNames: '노쇼 기록, 리마인드 알림',
  finNamesDropped: '리마인드 알림',
  afterTitle: '합의를 마치면',
  after: [
    '임시 계약이 만들어지고 최준호님에게 알림이 갑니다.',
    '11월 10일까지 두 분이 서명하면 계약이 체결됩니다. 기한이 지나면 결렬됩니다.',
    '그동안 다른 지원은 거절되지 않고 보류됩니다.',
    '임시 계약 중에는 내용을 바꿀 수 없습니다.',
  ],
  quoteLabel: '견적 최종 금액',
  feeLabel: '플랫폼 수수료 5%',
  escrowLabel: '예치할 금액',
  quoteSub: '2회차 · 11월 1일 채팅에서 수정',
  quoteSubDropped: '3회차 · 노쇼 기록을 빼며 채팅에서 수정',
  backChat: '채팅으로 돌아가기',
  submit: '이 내용으로 합의 완료',
  whyOpen: "세부 조건 1건은 계약서에 '정하지 않음'으로 남고(기능만 검수) 검수 기준에서 빠집니다.",
  whyDropped: '노쇼 기록은 이번 계약 범위에 들어가지 않습니다.',
  evidenceCta: '채팅에서 보기',
  popDefaultCond: '환불 기준',
} as const;

export type Amounts = {
  quote: number;
  fee: number;
  escrow: number;
  stage: number;
  quoteSub: string;
};

const AMOUNTS_FULL: Amounts = {
  quote: 3_100_000,
  fee: 155_000,
  escrow: 3_255_000,
  stage: 1_550_000,
  quoteSub: DEMO.quoteSub,
};

const AMOUNTS_DROPPED: Amounts = {
  quote: 2_800_000,
  fee: 140_000,
  escrow: 2_940_000,
  stage: 1_400_000,
  quoteSub: DEMO.quoteSubDropped,
};

export type CondView = CondDemo & {
  status: CondStatus;
  chip: string;
  openRow: boolean;
};

export type FeatureView = {
  id: string;
  name: string;
  desc: string;
  stage: '중간' | '최종';
  gone: boolean;
  conds: CondView[];
};

export type AgreementDemo = {
  mock: AgreementMock;
  open: boolean;
  allDone: boolean;
  dropped: boolean;
  popOpen: boolean;
  nOpen: number;
  nAll: number;
  features: FeatureView[];
  amounts: Amounts;
  paySettled: boolean;
  payNote: string;
  finNames: string;
  why?: string;
};

function chipOf(st: CondStatus): string {
  if (st === 'ok') return '정해짐';
  if (st === 'pr') return '한쪽 제안';
  return '아직 안 정함';
}

export function agreementDemoOf(mock: AgreementMock): AgreementDemo {
  const popOpen = mock === '근거 보기';
  const open = mock === '미정 있음' || popOpen;
  const dropped = mock === '첫 문장 기능 빠짐';
  let nOpen = 0;

  const features: FeatureView[] = FEATURES.map((f) => {
    const gone = dropped && !!f.fromFirstSentence;
    const conds: CondView[] = f.conds.map((c) => {
      const status: CondStatus = gone ? 'ok' : open ? c.whenOpen : 'ok';
      if (!gone && status !== 'ok') nOpen += 1;
      return {
        ...c,
        status,
        chip: chipOf(status),
        openRow: status !== 'ok',
      };
    });
    return {
      id: f.id,
      name: f.name,
      desc: f.desc,
      stage: f.stage,
      gone,
      conds,
    };
  });

  const nAll = dropped ? 8 : 10;
  const amounts = dropped ? AMOUNTS_DROPPED : AMOUNTS_FULL;
  const paySettled = !open;

  return {
    mock,
    open,
    allDone: !open,
    dropped,
    popOpen,
    nOpen,
    nAll,
    features,
    amounts,
    paySettled,
    payNote: paySettled ? DEMO.payNoteOk : DEMO.payNoteOpen,
    finNames: dropped ? DEMO.finNamesDropped : DEMO.finNames,
    why: dropped ? DEMO.whyDropped : open ? DEMO.whyOpen : undefined,
  };
}

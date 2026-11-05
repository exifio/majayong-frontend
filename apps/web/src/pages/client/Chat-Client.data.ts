/* 문의 채팅 시연 데이터 — 보드 Chat-Client.dc.html · PRD F-19 · F-24 · 디자인 시스템 9절 대화
 * 파란 버튼 없음. 보내기는 tint. */
import { CONTACT_MASK_TOKEN } from '@majayong/types';

export const CHAT_MOCKS = [
  '문의 중',
  '처음 문의',
  '임시 계약 중',
  '읽기 전용',
  '이전 명세 기준',
  '계약 체결 후',
  '신고',
] as const;
export type ChatMock = (typeof CHAT_MOCKS)[number];

export const CHAT_SIDS = ['s-junho', 's-sera', 's-nut'] as const;
export type ChatSid = (typeof CHAT_SIDS)[number];

export const DEFAULT_PID = 'p-ondo';
export const CONTRACT_HREF = '/c/contracts/c-ondo';
export const PROJECT_TITLE = '예약 달력, 예약금 결제 외 2개 기능';
export const PROJECT_HREF = '/c/projects/p-ondo';

export function resolveChatMock(raw: string | null): ChatMock {
  if (raw && (CHAT_MOCKS as readonly string[]).includes(raw)) return raw as ChatMock;
  return '문의 중';
}

export function resolveChatSid(raw: string | null): ChatSid {
  if (raw && (CHAT_SIDS as readonly string[]).includes(raw)) return raw as ChatSid;
  return 's-junho';
}

export function chatHref(pid: string, sid: string, mock?: string | null) {
  const base = `/c/chat/${pid}/${sid}`;
  if (!mock || mock === '문의 중') return base;
  return `${base}?mock=${encodeURIComponent(mock)}`;
}

export function quoteModalHref(pid: string, sid: string) {
  return `/c/projects/${pid}/proposals?modal=quote&sid=${sid}`;
}

export function agreementHref(pid: string, sid: string) {
  return `/c/chat/${pid}/${sid}/agreement`;
}

export const REPORT_REASONS = [
  { key: 'contact', label: '연락처 · 외부 거래 유도' },
  { key: 'abuse', label: '욕설 · 비방' },
  { key: 'false', label: '거짓 정보' },
  { key: 'other', label: '기타' },
] as const;

export type TagKind = 'ok' | 'pr' | 'no';

export type CondTag = {
  fn: string;
  done: number;
  total: number;
  kind: TagKind;
  tip: string;
};

export type ListItem = {
  sid: ChatSid;
  ini: string;
  name: string;
  time: string;
  preview: string;
  chip: string;
  unread: number;
};

export type Msg =
  | { kind: 'day'; text: string }
  | { kind: 'me'; id: string; at: string; text: string }
  | { kind: 'them'; id: string; at: string; text: string; flagged?: boolean }
  | { kind: 'sys'; text: string; tone?: 'chg' | 'ok' | 'plain'; html?: boolean }
  | { kind: 'newline' };

export type Person = {
  sid: ChatSid;
  ini: string;
  name: string;
  meta: string;
  amount: number;
  days: number;
  okLabel: string;
};

export const PEOPLE: Record<ChatSid, Person> = {
  's-junho': {
    sid: 's-junho',
    ini: '최',
    name: '최준호',
    meta: '경력 5년 · ★ 4.8 · 리뷰 12건',
    amount: 3_100_000,
    days: 42,
    okLabel: '4 / 4',
  },
  's-sera': {
    sid: 's-sera',
    ini: '김',
    name: '김세라',
    meta: '경력 7년 · ★ 4.6 · 리뷰 21건',
    amount: 4_400_000,
    days: 35,
    okLabel: '4 / 4',
  },
  's-nut': {
    sid: 's-nut',
    ini: '넛',
    name: '스튜디오 넛',
    meta: '제작사 · 경력 9년 · 리뷰 없음',
    amount: 4_500_000,
    days: 56,
    okLabel: '3 / 4',
  },
};

export const DEMO = {
  listFoot: '문의는 의뢰인만 시작할 수 있습니다. 제안 비교에서 공급자마다 \'문의하기\'를 누르면 대화가 열립니다.',
  condHint:
    'AI가 이 대화를 읽고 어떤 조건이 정해졌는지 표시합니다. 확인용이며, 모두 정해지지 않아도 \'이 사람과 계약하기\'로 진행할 수 있습니다.',
  staleTitle: '명세를 고쳐서 이 견적으로는 계약할 수 없습니다',
  staleBody:
    '11월 2일 명세를 고쳤습니다. 최준호님에게 재견적을 요청했고, 새 견적이 오면 이 대화에 기록되고 \'이 사람과 계약하기\'가 다시 켜집니다. 대화는 그대로 이어집니다.',
  staleDisabled: '새 견적이 오면 계약할 수 있습니다',
  readOnlyReason: '다른 공급자와의 계약에 대금이 예치되어 이 대화는 읽기 전용입니다.',
  hintDefault: '계약 체결 전에는 연락처가 자동으로 가려집니다. 견적은 공급자만 고칠 수 있고, 고치면 이 대화에 기록이 남습니다.',
  hintSigned: '계약이 체결되어 이제 연락처가 가려지지 않습니다. 견적은 더 이상 고칠 수 없습니다.',
  phDefault: '메시지를 입력하세요',
  phNew: '스튜디오 넛님에게 첫 메시지를 보내 보세요',
  starterLead: '스튜디오 넛님에게 아직 문의하지 않았습니다.',
  starterBody: '첫 메시지를 보내면 대화가 열리고 공급자가 답할 수 있습니다. 공급자는 먼저 채팅을 걸 수 없습니다.',
  suggestions: [
    '리마인드 알림을 빼신 이유가 궁금해요',
    '예약금 환불 기준은 어떻게 정하면 좋을까요?',
    '작업 기간 56일을 줄일 수 있을까요?',
  ],
  reportTitle: '이 메시지를 신고할까요?',
  reportNote: '신고 내용은 상대에게 알리지 않습니다 · 운영자가 확인합니다. 대화는 그대로 이어집니다.',
  reportPlaceholder: '어떤 점이 문제인지 적어 주세요',
};

const TAG_DEFS: [string, string[]][] = [
  ['예약 달력', ['회차 구성', '예약 가능 기간']],
  ['예약금 결제', ['예약금 금액', '환불 기준']],
  ['노쇼 기록', ['노쇼 판정 기준', '표시 방식']],
  ['리마인드 알림', ['발송 시점', '발송 수단']],
  ['지급 구간 · 비율', ['기능별 지급 구간', '중간 · 최종 비율']],
];

const LBL = { ok: '정해짐', pr: '한쪽 제안', no: '아직 안 정함' } as const;

function buildTags(st: TagKind[], defs: [string, string[]][]): CondTag[] {
  let k = 0;
  return defs.map(([fn, conds]) => {
    const ss = conds.map(() => st[k++] ?? 'no');
    const done = ss.filter((x) => x === 'ok').length;
    const kind: TagKind = done === ss.length ? 'ok' : ss.every((x) => x === 'no') ? 'no' : 'pr';
    return {
      fn,
      done,
      total: ss.length,
      kind,
      tip: conds.map((n, i) => `${n} — ${LBL[ss[i]!]}`).join(' · '),
    };
  });
}

export type ChatDemo = {
  mock: ChatMock;
  isNew: boolean;
  readOnly: boolean;
  stale: boolean;
  held: boolean;
  signed: boolean;
  reportOpen: boolean;
  canPick: boolean;
  showContract: boolean;
  showRev: boolean;
  person: Person;
  list: ListItem[];
  tags: CondTag[];
  nAll: number;
  nDone: number;
  nOk: number;
  nPr: number;
  nNo: number;
  stamp: string;
  chip: string;
  messages: Msg[];
  hint: string;
  placeholder: string;
  reportTargetId: string | null;
};

function defaultSidForMock(mock: ChatMock): ChatSid {
  if (mock === '처음 문의') return 's-nut';
  if (mock === '읽기 전용') return 's-sera';
  return 's-junho';
}

function junhoMainMessages(opts: { showRev: boolean; report: boolean; held: boolean; signed: boolean; showNew: boolean }): Msg[] {
  const name = PEOPLE['s-junho'].name;
  const msgs: Msg[] = [
    { kind: 'day', text: '11월 1일 (일)' },
    {
      kind: 'me',
      id: 'm1',
      at: '14:02',
      text: '안녕하세요, 견적 잘 봤습니다. 예약금 환불 기준을 어떻게 정하면 좋을지 여쭤보고 싶어요. 전날 취소면 돌려주고 싶은데, 회차마다 다르게도 할 수 있나요?',
    },
    {
      kind: 'them',
      id: 'm2',
      at: '14:20',
      text: '네, 가능합니다. 점심과 저녁 회차마다 마감 시각을 따로 두고, 그 전에 취소하면 전액 환불, 이후는 환불 없음으로 설정하실 수 있게 만들 수 있습니다.',
    },
  ];
  if (opts.showRev) {
    msgs.push({
      kind: 'them',
      id: 'm3',
      at: '14:21',
      text: '다만 회차별로 기준을 다르게 두면 관리 화면 작업이 늘어서 견적을 조금 올려야 할 것 같습니다.',
    });
    msgs.push({
      kind: 'sys',
      tone: 'chg',
      text: `${name}님이 견적을 고쳤습니다 · 3,000,000원 → 3,100,000원 · 기간 42일 그대로\n사유: 환불 기준을 회차별로 다르게 두려면 작업이 늘어납니다`,
    });
  }
  msgs.push(
    {
      kind: 'me',
      id: 'm4',
      at: '14:35',
      text: '좋아요. 예약금은 1인당 3만 원으로 생각하고 있어요. 리마인드는 어떤 방식이 좋을까요?',
    },
    {
      kind: 'them',
      id: 'm5',
      at: '14:48',
      text: '알림톡을 권합니다. 실패하면 문자로 다시 보내게 해 두겠습니다. 방문 전날 18시에 보내는 걸로 할까요?',
    },
    {
      kind: 'me',
      id: 'm6',
      at: '15:02',
      text: `네, 그렇게 해 주세요. 진행 상황은 전화로도 여쭤봐도 될까요? 제 번호는 ${CONTACT_MASK_TOKEN} 입니다.`,
    },
    {
      kind: 'sys',
      tone: 'plain',
      text: '계약이 체결되기 전에는 전화번호 · 이메일 · 메신저 아이디가 자동으로 가려집니다.',
    },
    { kind: 'day', text: '11월 3일 (화)' },
  );
  if (opts.showNew) msgs.push({ kind: 'newline' });
  if (opts.report) {
    msgs.push({
      kind: 'them',
      id: 'm-report',
      at: '09:12',
      flagged: true,
      text: `마자용 밖에서 직접 계약하시면 수수료 없이 해 드릴 수 있어요. 편하실 때 ${CONTACT_MASK_TOKEN} 으로 연락 주세요.`,
    });
  } else {
    msgs.push({
      kind: 'them',
      id: 'm7',
      at: '09:12',
      text: '노쇼 판정 기준도 정해 두면 좋겠습니다. 예약 시각 30분이 지나도 연락이 없으면 노쇼로 볼까요?',
    });
  }
  if (opts.held) {
    msgs.push({
      kind: 'me',
      id: 'm8',
      at: '09:30',
      text: '네, 30분으로 해 주세요. 노쇼 표시 방식은 따로 정하지 않고 진행할게요. 합의 마칠게요.',
    });
    msgs.push({
      kind: 'sys',
      tone: 'ok',
      text: '최종 합의 내용으로 임시 계약이 되었습니다 · 서명 기한 11월 10일',
    });
  }
  if (opts.signed) {
    msgs.push({ kind: 'day', text: '11월 4일 (수)' });
    msgs.push({
      kind: 'sys',
      tone: 'ok',
      text: '계약이 체결되었습니다 · 이제 연락처를 주고받을 수 있습니다. 계약 전에 가려진 연락처는 그대로 가려져 있습니다.',
    });
    msgs.push({
      kind: 'me',
      id: 'm9',
      at: '14:30',
      text: '예치까지 마쳤어요. 급한 일은 전화 주셔도 됩니다. 제 번호는 010-0000-1234 입니다.',
    });
    msgs.push({
      kind: 'them',
      id: 'm10',
      at: '14:41',
      text: '감사합니다. 중간 납품은 11월 25일로 맞추겠습니다. 진행 상황은 여기에도 계속 남기겠습니다.',
    });
  }
  return msgs;
}

function seraRoMessages(): Msg[] {
  return [
    { kind: 'day', text: '11월 2일 (월)' },
    {
      kind: 'me',
      id: 's1',
      at: '10:15',
      text: '안녕하세요, 견적 잘 봤습니다. 예약금 환불은 어떻게 두는 게 좋을까요? 손님이 헷갈리지 않았으면 해요.',
    },
    {
      kind: 'them',
      id: 's2',
      at: '10:42',
      text: '전날 취소는 전액 환불로 두는 게 좋겠습니다. 당일 취소만 환불하지 않으면 손님 안내도 간단하고, 노쇼도 줄어듭니다.',
    },
    { kind: 'me', id: 's3', at: '11:05', text: '좋네요. 리마인드는 문자로도 보낼 수 있나요?' },
    {
      kind: 'them',
      id: 's4',
      at: '11:20',
      text: '네, 문자 알림 연동은 여러 번 해 봤습니다. 방문 전날 오후에 보내는 걸 권합니다.',
    },
    {
      kind: 'sys',
      tone: 'plain',
      text: '11월 4일 다른 공급자와의 계약에 대금이 예치되어 이 지원은 자동으로 거절되었습니다.',
    },
  ];
}

function seraShortMessages(): Msg[] {
  return [
    { kind: 'day', text: '11월 2일 (월)' },
    {
      kind: 'them',
      id: 'ss1',
      at: '10:42',
      text: '전날 취소는 전액 환불로 두는 게 좋겠습니다. 당일 취소만 환불하지 않으면 손님 안내도 간단하고, 노쇼도 줄어듭니다.',
    },
  ];
}

export function chatDemoOf(mock: ChatMock, sidRaw: string | null): ChatDemo {
  const isNew = mock === '처음 문의';
  const readOnly = mock === '읽기 전용';
  const stale = mock === '이전 명세 기준';
  const signed = mock === '계약 체결 후';
  const reportOpen = mock === '신고';
  const held = mock === '임시 계약 중' || signed;
  const urlSid = resolveChatSid(sidRaw);
  const defaultSid = defaultSidForMock(mock);

  // mock이 특정 상대를 강제하면 그걸 쓰고, 아니면 URL sid
  let activeSid: ChatSid = defaultSid;
  if (!isNew && !readOnly) {
    activeSid = urlSid === 's-nut' ? 's-junho' : urlSid;
  }

  const person = PEOPLE[activeSid];

  let list: ListItem[] = [];
  if (readOnly) {
    list = [
      {
        sid: 's-sera',
        ini: '김',
        name: '김세라',
        time: '11월 4일',
        preview: '전날 취소는 전액 환불로 두는 게 좋겠습니다',
        chip: '자동 거절',
        unread: 0,
      },
      {
        sid: 's-junho',
        ini: '최',
        name: '최준호',
        time: '11월 4일',
        preview: '계약이 체결되었습니다',
        chip: '계약 체결',
        unread: 0,
      },
    ];
  } else if (isNew) {
    list = [
      {
        sid: 's-nut',
        ini: '넛',
        name: '스튜디오 넛',
        time: '지금',
        preview: '아직 메시지가 없습니다',
        chip: '문의 전',
        unread: 0,
      },
      {
        sid: 's-junho',
        ini: '최',
        name: '최준호',
        time: '09:12',
        preview: '노쇼 판정 기준도 정해 두면 좋겠습니다',
        chip: '문의 중',
        unread: 1,
      },
      {
        sid: 's-sera',
        ini: '김',
        name: '김세라',
        time: '11월 2일',
        preview: '전날 취소는 전액 환불로 두는 게 좋겠습니다',
        chip: '문의 중',
        unread: 0,
      },
    ];
  } else {
    const c1: ListItem = {
      sid: 's-junho',
      ini: '최',
      name: '최준호',
      time: held ? '09:30' : signed ? '11월 4일' : '09:12',
      preview: held
        ? signed
          ? '감사합니다. 중간 납품은 11월 25일로…'
          : '최종 합의 내용으로 임시 계약이 되었습니다'
        : reportOpen
          ? '마자용 밖에서 직접 계약하시면 수수료 없이…'
          : '노쇼 판정 기준도 정해 두면 좋겠습니다',
      chip: signed ? '계약 체결' : held ? '임시 계약' : stale ? '이전 명세 기준' : '문의 중',
      unread: 0,
    };
    const c2: ListItem = {
      sid: 's-sera',
      ini: '김',
      name: '김세라',
      time: '11월 2일',
      preview: '전날 취소는 전액 환불로 두는 게 좋겠습니다',
      chip: signed ? '자동 거절' : held ? '보류' : stale ? '이전 명세 기준' : '문의 중',
      unread: 0,
    };
    list = [c1, c2];
  }

  let st: TagKind[] = ['no', 'no', 'pr', 'ok', 'pr', 'no', 'ok', 'ok', 'no', 'no'];
  let defs = TAG_DEFS;
  if (isNew) {
    defs = TAG_DEFS.filter((t) => t[0] !== '리마인드 알림');
    st = Array.from({ length: 8 }, () => 'no' as TagKind);
  } else if (held) {
    st = st.map((_, i) => (i === 5 ? 'no' : 'ok'));
  } else if (readOnly) {
    st = ['no', 'no', 'no', 'ok', 'no', 'no', 'pr', 'no', 'no', 'no'];
  }
  const tags = buildTags(st, defs);
  const nOk = tags.filter((t) => t.kind === 'ok').length;
  const nPr = tags.filter((t) => t.kind === 'pr').length;
  const nNo = tags.filter((t) => t.kind === 'no').length;
  const nDone = st.filter((x) => x === 'ok').length;

  let chip = '문의 중';
  if (isNew) chip = '문의 전';
  else if (readOnly) chip = '자동 거절';
  else if (signed) chip = '계약 체결';
  else if (held) chip = '임시 계약 · 서명 대기';
  else if (stale) chip = '이전 명세 기준';

  let messages: Msg[] = [];
  if (isNew) {
    messages = [];
  } else if (readOnly) {
    messages = seraRoMessages();
  } else if (activeSid === 's-sera') {
    messages = seraShortMessages();
  } else {
    messages = junhoMainMessages({
      showRev: true,
      report: reportOpen,
      held: mock === '임시 계약 중' || signed,
      signed,
      showNew: mock === '문의 중' || reportOpen,
    });
  }

  const stamp = isNew
    ? ''
    : signed
      ? '11월 4일 14:41 기준'
      : held
        ? '11월 3일 09:30 기준'
        : '11월 3일 09:15 기준';

  return {
    mock,
    isNew,
    readOnly,
    stale,
    held: held && !signed,
    signed,
    reportOpen,
    canPick: !held && !readOnly && !stale && !signed,
    showContract: held || signed,
    showRev: !readOnly && !isNew,
    person,
    list,
    tags,
    nAll: st.length,
    nDone,
    nOk,
    nPr,
    nNo,
    stamp,
    chip,
    messages,
    hint: signed ? DEMO.hintSigned : DEMO.hintDefault,
    placeholder: isNew ? DEMO.phNew : DEMO.phDefault,
    reportTargetId: reportOpen ? 'm-report' : 'm7',
  };
}

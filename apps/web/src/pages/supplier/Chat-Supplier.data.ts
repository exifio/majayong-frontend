/* 공급자 문의 채팅 시연 — PRD F-19 · 결정메모 #1. 의뢰인 이메일 · 원문 · AI 예상 금액 없음. */
import { CONTACT_MASK_TOKEN } from '@majayong/types';

export const CHAT_MOCKS = [
  '문의 중',
  '견적 수정',
  '임시 계약',
  '읽기 전용',
  '계약 체결 후',
  '신고',
] as const;
export type ChatMock = (typeof CHAT_MOCKS)[number];

export const DEFAULT_PID = 'p-ondo';
export const PROJECT_TITLE = '예약 달력, 예약금 결제 외 2개 기능';
export const PROJECT_HREF = '/s/projects/p-ondo';
export const QUOTE_HREF = '/s/applications/p-ondo';
export const CONTRACT_HREF = '/s/contracts/c-ondo';

export function resolveChatMock(raw: string | null): ChatMock {
  if (raw && (CHAT_MOCKS as readonly string[]).includes(raw)) return raw as ChatMock;
  return '문의 중';
}

export function chatHref(pid: string, mock?: string | null) {
  const base = `/s/chat/${pid}`;
  if (!mock || mock === '문의 중') return base;
  return `${base}?mock=${encodeURIComponent(mock)}`;
}

export const REPORT_REASONS = [
  { key: 'contact', label: '연락처 · 외부 거래 유도' },
  { key: 'abuse', label: '욕설 · 비방' },
  { key: 'false', label: '거짓 정보' },
  { key: 'other', label: '기타' },
] as const;

export type Msg =
  | { kind: 'day'; text: string }
  | { kind: 'me'; id: string; at: string; text: string }
  | { kind: 'them'; id: string; at: string; text: string; flagged?: boolean }
  | { kind: 'sys'; text: string; tone?: 'chg' | 'ok' | 'plain' };

export type ListItem = {
  id: string;
  /** 대화가 속한 프로젝트 id — 목록 링크에 씀 */
  pid: string;
  ini: string;
  name: string;
  time: string;
  preview: string;
  chip: string;
  unread: number;
  active: boolean;
};

export const DEMO = {
  listFoot: '문의는 의뢰인만 시작할 수 있습니다. 공급자는 먼저 채팅을 걸 수 없습니다.',
  clientName: '정민재',
  clientIni: '민',
  clientMeta: '온도 다이닝 · 음식점',
  amount: 3_100_000,
  prevAmount: 3_000_000,
  days: 42,
  okLabel: '4 / 4',
  quoteRound: '2회차',
  revTitle: '견적 수정',
  revSave: '수정 보내기',
  revCancel: '닫기',
  revAmountLabel: '새 총액(원)',
  revReasonLabel: '수정 사유',
  revReasonPh: '예: 환불 기준을 회차별로 다르게 두려면 작업이 늘어납니다',
  heldTitle: '의뢰인이 최종 합의를 마쳐 임시 계약이 되었습니다',
  heldBody: '서명 기한 11월 10일까지 · 기한 안에 서명하지 않거나 거절하면 결렬됩니다. 임시 계약 중에는 견적을 고칠 수 없습니다.',
  heldCta: '계약서 보기',
  readOnlyReason: '다른 공급자와의 계약에 대금이 예치되어 이 대화는 읽기 전용입니다.',
  signedHint: '계약이 체결되어 연락처를 주고받을 수 있습니다. 납품과 검수는 내 계약 › 납품에서 합니다.',
  hintDefault:
    "계약 체결 전에는 연락처가 자동으로 가려집니다. 금액 · 기간을 바꾸려면 '견적 수정'을 쓰세요 — 이 대화에 기록이 남습니다.",
  hintHeld: '서명 전까지 대화를 이어갈 수 있습니다. 계약 체결 전에는 연락처가 자동으로 가려집니다.',
  ph: '메시지를 입력하세요',
  reportTitle: '메시지 신고',
  reportNote: '신고 내용은 상대에게 알리지 않습니다 · 운영자가 확인합니다.',
  reportPlaceholder: '어떤 점이 문제인지 적어 주세요',
  bandQuote: '견적서 보기',
  editQuote: '견적 수정',
  editDisabledHeld: '임시 계약 중에는 견적을 고칠 수 없습니다',
  editDisabledSigned: '계약 뒤에는 견적을 고칠 수 없습니다',
} as const;

export type ChatDemo = {
  mock: ChatMock;
  readOnly: boolean;
  held: boolean;
  signed: boolean;
  reportOpen: boolean;
  revOpen: boolean;
  canRev: boolean;
  showContract: boolean;
  chip: string;
  list: ListItem[];
  messages: Msg[];
  hint: string;
  reportTargetId: string | null;
};

function baseMessages(opts: {
  showRev: boolean;
  report: boolean;
  held: boolean;
  signed: boolean;
}): Msg[] {
  const msgs: Msg[] = [
    { kind: 'day', text: '11월 1일 (일)' },
    {
      kind: 'them',
      id: 't1',
      at: '14:02',
      text: '안녕하세요, 견적 잘 봤습니다. 예약금 환불 기준을 어떻게 정하면 좋을지 여쭤보고 싶어요. 전날 취소면 돌려주고 싶은데, 회차마다 다르게도 할 수 있나요?',
    },
    {
      kind: 'me',
      id: 'm1',
      at: '14:20',
      text: '네, 가능합니다. 점심과 저녁 회차마다 마감 시각을 따로 두고, 그 전에 취소하면 전액 환불, 이후는 환불 없음으로 설정하실 수 있게 만들 수 있습니다.',
    },
  ];
  if (opts.showRev) {
    msgs.push({
      kind: 'me',
      id: 'm2',
      at: '14:21',
      text: '다만 회차별로 기준을 다르게 두면 관리 화면 작업이 늘어서 견적을 조금 올려야 할 것 같습니다.',
    });
    msgs.push({
      kind: 'sys',
      tone: 'chg',
      text: `견적 수정 ${DEMO.prevAmount.toLocaleString('ko-KR')}원 → ${DEMO.amount.toLocaleString('ko-KR')}원`,
    });
  }
  msgs.push(
    {
      kind: 'them',
      id: 't2',
      at: '14:35',
      text: '좋아요. 예약금은 1인당 3만 원으로 생각하고 있어요. 리마인드는 어떤 방식이 좋을까요?',
    },
    {
      kind: 'me',
      id: 'm3',
      at: '14:48',
      text: '알림톡을 권합니다. 실패하면 문자로 다시 보내게 해 두겠습니다. 방문 전날 18시에 보내는 걸로 할까요?',
    },
    {
      kind: 'them',
      id: 't3',
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
  if (opts.report) {
    msgs.push({
      kind: 'them',
      id: 't-report',
      at: '09:12',
      flagged: true,
      text: `마자용 밖에서 직접 계약하시면 수수료 없이 해 드릴 수 있어요. 편하실 때 ${CONTACT_MASK_TOKEN} 으로 연락 주세요.`,
    });
  } else if (!opts.held && !opts.signed) {
    msgs.push({
      kind: 'them',
      id: 't4',
      at: '09:12',
      text: '노쇼 판정 기준도 정해 두면 좋겠습니다. 예약 시각 30분이 지나도 연락이 없으면 노쇼로 볼까요?',
    });
  }
  if (opts.held) {
    msgs.push({
      kind: 'them',
      id: 't5',
      at: '09:30',
      text: '네, 30분으로 해 주세요. 이제 다 정해진 것 같아요. 합의 마칠게요.',
    });
    msgs.push({
      kind: 'sys',
      tone: 'ok',
      text: '임시 계약',
    });
  }
  if (opts.signed) {
    msgs.push({
      kind: 'them',
      id: 't6',
      at: '16:20',
      text: '계약 축하드려요! 급한 일은 이 번호로 연락 주세요. 010-2345-6789 입니다. 예치도 방금 마쳤습니다.',
    });
    msgs.push({
      kind: 'me',
      id: 'm4',
      at: '16:32',
      text: '내일부터 예약 달력부터 작업하겠습니다.',
    });
    msgs.push({
      kind: 'sys',
      tone: 'ok',
      text: '계약이 체결되었습니다',
    });
  }
  return msgs;
}

export function chatDemoOf(mock: ChatMock): ChatDemo {
  const held = mock === '임시 계약';
  const signed = mock === '계약 체결 후';
  const reportOpen = mock === '신고';
  const revOpen = mock === '견적 수정';
  const readOnly = mock === '읽기 전용';
  const canRev = !held && !signed && !readOnly;
  const chip = signed ? '계약 체결' : held ? '임시 계약' : readOnly ? '자동 거절' : '문의 중';

  const list: ListItem[] = [
    {
      id: 'c-ondo',
      pid: DEFAULT_PID,
      ini: DEMO.clientIni,
      name: DEMO.clientName,
      time: signed ? '16:32' : held ? '09:30' : '09:12',
      preview: signed
        ? '내일부터 예약 달력부터 작업하겠습니다'
        : held
          ? '최종 합의를 마쳐 임시 계약이 되었습니다'
          : '노쇼 판정 기준도 정해 두면 좋겠습니다',
      chip,
      unread: readOnly ? 1 : 0,
      active: !readOnly,
    },
    {
      id: 'other',
      pid: 'p-other',
      ini: '김',
      name: '김세라 프로젝트',
      time: '어제',
      preview: readOnly ? '다른 계약이 예치되어 읽기 전용입니다' : '문의가 있습니다',
      chip: readOnly ? '자동 거절' : '문의 중',
      unread: 0,
      active: readOnly,
    },
  ];

  return {
    mock,
    readOnly,
    held,
    signed,
    reportOpen,
    revOpen,
    canRev,
    showContract: held || signed,
    chip,
    list,
    messages: baseMessages({
      showRev: revOpen,
      report: reportOpen,
      held,
      signed,
    }),
    hint: signed ? DEMO.signedHint : held ? DEMO.hintHeld : DEMO.hintDefault,
    reportTargetId: reportOpen ? 't-report' : null,
  };
}

/* 신고 처리 시연 — PRD F-24. */
import { CONTACT_MASK_TOKEN } from '@majayong/types';

export const REPORT_MOCKS = ['처리 대기', '조치 작성', '처리 완료', '계정 정지 선택'] as const;
export type ReportMock = (typeof REPORT_MOCKS)[number];

export type ReportMsg = {
  who: string;
  when: string;
  text: string;
  hit?: boolean;
  sys?: boolean;
};

export type ReportRow = {
  id: string;
  reason: string;
  status: '처리 대기' | '처리 완료';
  title: string;
  reporter: string;
  target: string;
  whoLine: string;
  when: string;
  meta: string;
  reportBody: string;
  autoNote: string;
  messages: ReportMsg[];
  history: { k: string; v: string }[];
  doneBand?: { title: string; body: string };
  actionDone?: string;
};

export const DEMO = {
  title: '신고 처리',
  sub: '채팅에서 들어온 신고를 봅니다. 근거가 되는 메시지는 앞뒤 문맥만 보여 주고, 조치는 운영자가 사유와 함께 정합니다.',
  listLabel: '신고 목록',
  detailLabel: '신고 상세',
  confirm: '조치 확정',
  banConfirm: '계정 정지 확정',
  reasonLabel: '조치 사유',
  reasonNeed: '사유를 적어 주세요',
  eventNote: '이 처리는 이벤트 기록에 남습니다',
  actionLabel: '조치',
  banTitle: '계정을 정지할까요?',
  banBody:
    '로그인할 수 없고 공개 프로필이 숨겨집니다. 진행 중인 계약은 운영자가 따로 취소 정산합니다. 신고자 정보는 상대에게 알리지 않습니다.',
  whyWarn:
    '15:31 메시지에서 플랫폼 밖 연락(카톡)과 수수료 회피를 제안했습니다. 계약 체결 전 연락처 교환 금지 규칙 위반, 첫 위반이라 경고합니다.',
  whyBan:
    '15:31 메시지의 외부 거래 · 수수료 회피 제안과 연락처 형식 2회 전송을 근거로 계정을 정지합니다.',
} as const;

export const ACTION_PREVIEWS: Record<string, string> = {
  none: "신고를 닫고 양쪽에 따로 알리지 않습니다. 신고자에게만 '검토 완료'를 알립니다.",
  warn: '강태오님에게 경고와 연락처 규칙 안내를 보냅니다. 경고가 2회 쌓이면 채팅 제한을 검토합니다. 지원과 채팅은 그대로입니다.',
  ban: '로그인할 수 없고 공개 프로필이 숨겨집니다. 진행 중인 계약은 운영자가 따로 취소 정산합니다.',
};

export const REPORTS: ReportRow[] = [
  {
    id: 'rp-1',
    reason: '연락처 · 외부 거래 유도',
    status: '처리 대기',
    title: '음료 사전 주문, 픽업 알림 외 1개 기능',
    reporter: '의뢰인 오후 세시(문지아)',
    target: '공급자 강태오',
    whoLine: '의뢰인 오후 세시 → 공급자 강태오',
    when: '11월 2일 15:40 · 자동 탐지 2회',
    meta: '음료 사전 주문, 픽업 알림 외 1개 기능 · 문의 중(계약 전) · 신고 11월 2일 15:40',
    reportBody:
      '연락처를 계속 보내시고 카톡으로 따로 하자고 하십니다. 계약 전에는 여기서만 이야기하는 걸로 알고 있어서 신고합니다.',
    autoNote: '시스템이 대화에서 연락처 형식 2회 가림 · 자동 탐지 기록과 함께 접수',
    messages: [
      {
        who: '강태오',
        when: '11월 2일 15:12',
        text: `견적 관련해서 자세히 설명드리고 싶어서요. ${CONTACT_MASK_TOKEN} 로 연락 주세요.`,
      },
      {
        who: '문지아',
        when: '15:20',
        text: '연락처는 계약 체결 뒤에 주고받는다고 되어 있어서요. 여기서 말씀해 주세요.',
      },
      {
        who: '강태오',
        when: '15:31 · 신고됨',
        text: `카톡으로 따로 얘기해요, 수수료 아끼게. 아이디는 ${CONTACT_MASK_TOKEN} 이에요.`,
        hit: true,
      },
      {
        who: '시스템',
        when: '15:40',
        text: '문지아님이 이 메시지를 신고했습니다.',
        sys: true,
      },
    ],
    history: [
      { k: '지난 경고', v: '0회' },
      { k: '완료한 계약', v: '3건 · ★ 4.6' },
      { k: '이전 신고', v: '0건 · 이번이 처음' },
      { k: '가입', v: '2026년 6월' },
    ],
  },
  {
    id: 'rp-2',
    reason: '욕설 · 비방',
    status: '처리 대기',
    title: '수조 현황판, 포장 주문 외 1개 기능',
    reporter: '공급자 윤재하',
    target: '의뢰인 바다 횟집',
    whoLine: '공급자 윤재하 → 의뢰인 바다 횟집',
    when: '11월 3일 09:05',
    meta: '수조 현황판, 포장 주문 외 1개 기능 · 문의 중 · 신고 11월 3일 09:05',
    reportBody: '채팅에서 욕설이 있어 신고합니다.',
    autoNote: '자동 탐지 기록 없음',
    messages: [
      {
        who: '바다 횟집',
        when: '11월 3일 08:50',
        text: '이 견적은 말도 안 됩니다. 다시 내세요.',
      },
      {
        who: '윤재하',
        when: '08:58 · 신고됨',
        text: '정중히 말씀해 주세요. 이 메시지로 신고합니다.',
        hit: true,
      },
    ],
    history: [
      { k: '지난 경고', v: '0회' },
      { k: '완료한 계약', v: '1건' },
      { k: '이전 신고', v: '0건' },
      { k: '가입', v: '2026년 8월' },
    ],
  },
  {
    id: 'rp-done',
    reason: '연락처 · 외부 거래 유도',
    status: '처리 완료',
    title: '음료 사전 주문, 픽업 알림 외 1개 기능',
    reporter: '의뢰인 오후 세시(문지아)',
    target: '공급자 강태오',
    whoLine: '의뢰인 오후 세시 → 공급자 강태오',
    when: '11월 2일 15:40',
    meta: '음료 사전 주문, 픽업 알림 외 1개 기능 · 문의 중(계약 전) · 신고 11월 2일 15:40',
    reportBody:
      '연락처를 계속 보내시고 카톡으로 따로 하자고 하십니다. 계약 전에는 여기서만 이야기하는 걸로 알고 있어서 신고합니다.',
    autoNote: '시스템이 대화에서 연락처 형식 2회 가림 · 자동 탐지 기록과 함께 접수',
    messages: [
      {
        who: '강태오',
        when: '15:31 · 신고됨',
        text: `카톡으로 따로 얘기해요, 수수료 아끼게. 아이디는 ${CONTACT_MASK_TOKEN} 이에요.`,
        hit: true,
      },
    ],
    history: [
      { k: '지난 경고', v: '1회(이번 조치)' },
      { k: '완료한 계약', v: '3건 · ★ 4.6' },
      { k: '이전 신고', v: '1건' },
      { k: '가입', v: '2026년 6월' },
    ],
    actionDone: '경고',
    doneBand: {
      title: '경고를 보냈습니다 · 11월 3일 10:12 · 운영자 김하늘',
      body: "강태오님에게 경고와 연락처 규칙 안내가 갔습니다. 신고한 오후 세시에는 '검토 완료'만 알립니다. 조치와 사유는 이벤트 기록에 남았습니다.",
    },
  },
];

export function resolveReportMock(raw: string | null): ReportMock {
  if (raw && (REPORT_MOCKS as readonly string[]).includes(raw)) return raw as ReportMock;
  return '처리 대기';
}

export function defaultIdOf(mock: ReportMock): string {
  if (mock === '처리 완료') return 'rp-done';
  return 'rp-1';
}

export function reportOf(id: string | null): ReportRow {
  return REPORTS.find((r) => r.id === id) ?? REPORTS[0]!;
}

export function listFor(mock: ReportMock): ReportRow[] {
  if (mock === '처리 완료') return REPORTS.filter((r) => r.id === 'rp-done' || r.id === 'rp-2');
  return REPORTS.filter((r) => r.status === '처리 대기');
}

export function defaultActionOf(mock: ReportMock): string {
  if (mock === '계정 정지 선택') return 'ban';
  if (mock === '조치 작성' || mock === '처리 완료') return 'warn';
  return '';
}

/* 명세 보기 시연 데이터 — 보드 Spec-Client.dc.html renderVals · PRD F-03 · 11.2 · 13.2
 * AI 금액 · 블록 금액 없음. 희망 예산은 의뢰인 본인 값.
 * 모집 시작됨: 열람 0 · 지원 0(보드 · NOTES). */
export const SPEC_MOCKS = ['기본', '명세 고치기 확인', '마감 연장', '임시 계약 중', '모집 시작됨'] as const;
export type SpecMock = (typeof SPEC_MOCKS)[number];

export const MY_HREF = '/c/projects';
export const DRAFT_HREF = '/c/drafts/d-1';
export const DEFAULT_PID = 'p-ondo';

export function compareHref(pid: string) {
  return `/c/projects/${pid}/proposals`;
}

export function resolveSpecMock(raw: string | null): SpecMock {
  if (raw && (SPEC_MOCKS as readonly string[]).includes(raw)) return raw as SpecMock;
  return '기본';
}

export type SpecFn = {
  no: number;
  name: string;
  description: string;
  conditions: string[];
  memo: string;
};

export type SpecDemo = {
  started: boolean;
  held: boolean;
  canEdit: boolean;
  chip: string;
  chipTone: 'blue' | 'amber';
  views: string;
  apps: string;
  appsCount: number;
  openEdit: boolean;
  openExtend: boolean;
};

export const DEMO = {
  title: '예약 달력, 예약금 결제 외 2개 기능',
  industry: '음식점(코스 레스토랑)',
  registered: '10월 27일 등록',
  deadlineLabel: '마감 11월 3일',
  period: '10월 27일 ~ 11월 3일',
  hopeBudget: 5_000_000,
  hopeHint: '목록에서는 \'400~500만원\' 구간으로, 상세에서만 정확한 금액이 보입니다.',
  payGuide:
    '중간 · 최종 두 구간으로 나눠 지급합니다. 어느 기능을 어느 구간에 넣을지와 비율은 채팅에서 정하고, 정하지 않으면 50 : 50 · 명세 순서대로 나뉩니다.',
  railNote: '명세를 고치면 받은 견적은 \'이전 명세 기준\'이 되고 공급자에게 재견적을 요청합니다.',
  heldWhy:
    '최준호님과 임시 계약 중이라 명세를 고칠 수 없습니다. 고치려면 임시 계약을 먼저 취소해야 합니다.',
  heldReason: '임시 계약 중에는 명세를 고칠 수 없습니다.',
  startedTitle: '모집을 시작했습니다',
  startedBody: '마감 11월 3일 · 공급자에게 전체 공개 정보가 보입니다',
  startedSub: '지원이 오면 내 프로젝트와 알림에서 알려 드립니다.',
  editTitle: '명세를 고칠까요?',
  editLead: '고친 명세는 바로 공급자에게 보입니다.',
  editWarn:
    '지금 받은 견적 3건이 \'이전 명세 기준\'이 됩니다. 고친 명세로 새 견적이 들어오기 전까지 이 견적들로는 계약을 진행할 수 없습니다.',
  editPoints: [
    '세 공급자에게 재견적 요청 알림이 갑니다.',
    '공급자와 나눈 채팅은 그대로 이어집니다.',
    '모집 마감일은 바뀌지 않습니다. 필요하면 마감을 연장하세요.',
    '임시 계약 중에는 명세를 고칠 수 없습니다.',
  ] as const,
  extendTitle: '마감 연장',
  extendLead: '더 많은 견적을 받고 싶을 때 모집 기간을 늘립니다.',
  extendNow: '11월 3일',
  extendDefault: '2026-11-10',
  extendMaxDays: 14,
  extendDeadlineIso: '2026-11-03',
  extendHint: '지금 마감일부터 최대 14일까지 늘릴 수 있습니다.',
  extendKeep:
    '지원은 계속 받고, 이미 받은 견적 3건은 그대로 둡니다. 지원한 공급자에게는 마감이 바뀌었다는 표시만 보입니다.',
  pub: [
    {
      title: '전체 공개',
      who: '로그인한 공급자 모두',
      body: '업종 · 요약 · 항목 이름 · 항목 수 · 희망 예산 구간 · 마감일',
    },
    {
      title: '상세 공개',
      who: '열람 기록이 남음',
      body: '기능 설명 · 공급자와 정할 것 · 화면 초안 · 정확한 희망 예산 · 내 프로필. 열람한 사람 수는 나에게만 보입니다.',
    },
  ],
  thumbs: [
    { name: '예약 달력', cap: '날짜와 회차 고르기', kind: 'cal' as const },
    { name: '예약금 결제', cap: '금액 확인과 환불 안내', kind: 'pay' as const },
    { name: '관리 화면', cap: '노쇼 기록과 알림 발송', kind: 'list' as const },
  ],
  fns: [
    {
      no: 1,
      name: '예약 달력',
      description: '회차별로 예약받고 정원이 차면 마감',
      conditions: ['회차 구성', '예약 가능 기간'],
      memo: '',
    },
    {
      no: 2,
      name: '예약금 결제',
      description: '예약할 때 예약금을 받고 환불 규정 안내',
      conditions: ['예약금 금액', '환불 기준'],
      memo: '전날 취소면 돌려주고 싶음',
    },
    {
      no: 3,
      name: '노쇼 기록',
      description: '노쇼 손님을 기록해 다음 예약 때 표시',
      conditions: ['노쇼 판정 기준', '표시 방식'],
      memo: '',
    },
    {
      no: 4,
      name: '리마인드 알림',
      description: '예약 전날 손님에게 안내 자동 발송',
      conditions: ['발송 시점', '발송 수단'],
      memo: '',
    },
  ] satisfies SpecFn[],
};

export function specDemoOf(mock: SpecMock): SpecDemo {
  const held = mock === '임시 계약 중';
  const started = mock === '모집 시작됨';
  return {
    started,
    held,
    canEdit: !held,
    chip: held ? '임시 계약 중 · 서명 대기' : '모집 중',
    chipTone: held ? 'amber' : 'blue',
    views: started ? '0명' : '5명',
    apps: started ? '0건' : '3건',
    appsCount: started ? 0 : 3,
    openEdit: mock === '명세 고치기 확인',
    openExtend: mock === '마감 연장',
  };
}

/** 지금 마감일로부터 1~maxDays일 이내인지(시연용 YYYY-MM-DD). */
export function isWithinExtend(
  newIso: string,
  fromIso = DEMO.extendDeadlineIso,
  maxDays = DEMO.extendMaxDays,
) {
  const from = new Date(`${fromIso}T00:00:00`);
  const next = new Date(`${newIso}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(next.getTime())) return false;
  const diff = (next.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);
  return diff >= 1 && diff <= maxDays;
}

/* ── 실제 마감 연장(POST /projects/:projectId/extend-deadline) ──
 * 서버 규칙: RECRUITING · SELECTING · EXPIRED만, 새 마감 - 지금 마감이 0 초과 14일 이하(ms 단위). */
export const EXTENDABLE_STATUSES = ['RECRUITING', 'SELECTING', 'EXPIRED'] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 고른 날짜(YYYY-MM-DD)를 지금 마감과 같은 시각의 새 마감으로 바꾼다. 범위를 벗어나면 null. */
export function extendedDeadlineOf(currentIso: string, pickedIso: string, maxDays = DEMO.extendMaxDays): Date | null {
  const current = new Date(currentIso);
  const matched = pickedIso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (Number.isNaN(current.getTime()) || !matched) return null;
  const picked = new Date(Number(matched[1]), Number(matched[2]) - 1, Number(matched[3]));
  const base = new Date(current.getFullYear(), current.getMonth(), current.getDate());
  const days = Math.round((picked.getTime() - base.getTime()) / DAY_MS);
  if (!Number.isFinite(days) || days < 1 || days > maxDays) return null;
  return new Date(current.getTime() + days * DAY_MS);
}

export const EXTEND_ERROR_MESSAGES: Partial<Record<string, string>> = {
  PROJECT_NOT_FOUND: '프로젝트를 찾을 수 없습니다. 내 프로젝트에서 다시 열어 주세요.',
  PROJECT_DEADLINE_NOT_EXTENDABLE: '지금 상태에서는 마감을 연장할 수 없습니다. 모집 중 · 선정 중 · 마감된 프로젝트만 연장할 수 있습니다.',
  PROJECT_DEADLINE_MISSING: '마감일이 없는 프로젝트라 연장할 수 없습니다.',
  INVALID_DEADLINE_EXTENSION: '지금 마감일부터 최대 14일까지 늘릴 수 있습니다. 날짜를 다시 골라 주세요.',
  INVALID_REQUEST: '날짜 형식이 올바르지 않습니다. 다시 골라 주세요.',
  ROLE_MISMATCH: '의뢰인 계정으로 로그인한 뒤 다시 시도해 주세요.',
};

/* 단가 분석 리포트 시연 데이터 — 보드 Report-Client.dc.html renderVals · PRD F-04 · 디자인 시스템 8 · 10.3
 * 시연 정본은 2분할과 같다. 포함 4건 4,200,000 + 수수료 5% = 4,410,000 / 희망 예산 5,000,000.
 * 예산 초과는 단골 등급 관리 660,000을 포함(합계 5,103,000). 만드는 중은 금액 미정 1건. */
import type { DraftDto, PriceReportDto } from '@majayong/types/api';
import { fee } from '@/lib/format';

export const REPORT_MOCKS = ['예산 안', '예산 초과', '만드는 중 포함'] as const;
export type ReportMock = (typeof REPORT_MOCKS)[number];

export const HOPE_BUDGET = 5_000_000;

export const APPLY_WARN =
  '반영하면 희망 예산이 예상 총액으로 바뀝니다. 희망 예산은 명세를 확정하면 공급자에게 구간(목록)과 정확한 금액(상세)으로 보입니다.';

export const BASIS =
  '참고용 추정치이며 실제 견적과 다를 수 있습니다. 공급자에게는 보이지 않고, 명세를 확정하면 더 이상 표시하지 않습니다.';

export const HOW = [
  { bold: '처음 만들어질 때', rest: ' AI가 화면 수 · 처리할 데이터 · 외부 연동을 보고 예상 금액을 분석해 저장합니다.', prefix: '블록이 ' },
  { bold: '누구에게나 같은 예상 금액', rest: '으로 보입니다.', prefix: '같은 기능은 ' },
  { bold: null, rest: '공급자에게는 보이지 않고, 명세를 확정하면 이 리포트는 닫힙니다.', prefix: '' },
] as const;

/** 화면 모델 — 근거는 백엔드 priceBasis처럼 한 문자열(줄바꿈 구분)로 받는다. */
export type ReportFn = {
  id: string;
  name: string;
  /** AI 분석일. 실제 API에서 알 수 없으면 null */
  date: string | null;
  amount: number;
  basis: string;
  /** 합계 중 비중 %. 없으면 amount/합계로 계산한다 */
  share?: number;
};

/** 근거 3줄의 이름 — prisma BlockCatalog.priceBasis 주석(들어간 작업 / 작업량 기준 / 달라질 수 있는 것) */
export const BASIS_LABELS = ['들어간 작업', '작업량 기준', '달라질 수 있는 것'] as const;

/** priceBasis 한 문자열을 표시 행으로 나눈다. 정확히 3줄이면 이름을 붙이고, 아니면 '산정 근거' 한 행. */
export function basisRows(basis: string): { label: string; text: string }[] {
  const lines = basis.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  if (lines.length === BASIS_LABELS.length) {
    return lines.map((text, index) => ({ label: BASIS_LABELS[index]!, text }));
  }
  return [{ label: '산정 근거', text: lines.join('\n') }];
}

export type ReportDemo = {
  included: ReportFn[];
  excluded: ReportFn | null;
  making: boolean;
};

const BASE: ReportFn[] = [
  {
    id: 'calendar',
    name: '예약 달력',
    date: '2026. 9. 18',
    amount: 1_400_000,
    basis: ['손님용 달력 · 회차 선택 화면과 가게용 정원 관리 화면, 정원이 차면 회차를 닫는 처리', '약 7일 · 화면 2개', '회차가 요일마다 다르거나 좌석까지 고르게 하면 늘어날 수 있습니다'].join('\n'),
  },
  {
    id: 'pay',
    name: '예약금 결제',
    date: '2026. 9. 18',
    amount: 1_200_000,
    basis: ['PG 결제 연동 1건, 결제 실패 · 취소 처리, 환불 규정 안내', '약 6일 · 화면 1개 + 결제 연동', '환불 기준이 여러 단계이거나 부분 환불이 있으면 늘어날 수 있습니다'].join('\n'),
  },
  {
    id: 'noshow',
    name: '노쇼 기록',
    date: '2026. 9. 20',
    amount: 1_000_000,
    basis: ['손님별 방문 기록 목록과 노쇼 표시, 다음 예약 화면에 횟수 표시', '약 5일 · 화면 1개', '노쇼 손님의 예약을 자동으로 막는 기능을 더하면 늘어날 수 있습니다'].join('\n'),
  },
  {
    id: 'remind',
    name: '리마인드 알림',
    date: '2026. 9. 20',
    amount: 600_000,
    basis: ['예약 전날 자동 발송 1종, 발송 대행 서비스 연동', '약 3일 · 연동 1건', '알림 종류를 늘리거나 알림톡과 문자를 함께 쓰면 늘어날 수 있습니다'].join('\n'),
  },
];

const GRADE: ReportFn = {
  id: 'grade',
  name: '단골 등급 관리',
  date: '2026. 9. 22',
  amount: 660_000,
  basis: ['방문 횟수 집계, 등급 3단계와 등급별 표시', '약 3~4일 · 화면 1개', '등급별 할인 · 쿠폰을 자동으로 주면 늘어날 수 있습니다'].join('\n'),
};

export const MAKING = {
  name: '단체 예약 접수',
  body: '처음 보는 기능이라 새 블록을 만들고 있습니다. 예상 금액과 근거가 정해지면 합계에 더해집니다.',
};

export function resolveReportMock(raw: string | null): ReportMock {
  if (raw && (REPORT_MOCKS as readonly string[]).includes(raw)) return raw as ReportMock;
  return '예산 안';
}

export function reportDemoOf(mock: ReportMock): ReportDemo {
  if (mock === '예산 초과') {
    return { included: [...BASE, GRADE], excluded: null, making: false };
  }
  if (mock === '만드는 중 포함') {
    return { included: BASE, excluded: GRADE, making: true };
  }
  return { included: BASE, excluded: GRADE, making: false };
}

export function quoteOf(items: { amount: number }[]) {
  const sub = items.reduce((sum, item) => sum + item.amount, 0);
  const feeAmt = fee(sub);
  return { count: items.length, sub, fee: feeAmt, total: sub + feeAmt };
}

export function sharePct(amount: number, sub: number) {
  if (sub <= 0) return 0;
  return Math.round((amount / sub) * 100);
}

/* ── 실제 API(GET /drafts/:draftId/price-report) → 화면 모델 ── */
export type LiveReportModel = {
  included: ReportFn[];
  excluded: ReportFn[];
  suggested: ReportFn[];
  /** 만드는 중(금액 미정) 기능 이름. 초안을 못 읽으면 비어 있고 개수만 쓴다 */
  making: string[];
  pendingCount: number;
  totals: { count: number; sub: number; fee: number; total: number };
};

function dateLabel(iso: string | undefined): string | null {
  if (!iso) return null;
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return null;
  return `${at.getFullYear()}. ${at.getMonth() + 1}. ${at.getDate()}`;
}

/** 금액·비중·합계는 서버 값을 그대로 쓴다(프런트 재계산 없음). 분석일은 초안 블록 pricedAt에서만 가져온다. */
export function reportFromDto(report: PriceReportDto, draft: DraftDto | null): LiveReportModel {
  const pricedAt = new Map((draft?.blocks ?? []).map((block) => [block.blockId, block.pricedAt]));
  const toFn = (item: PriceReportDto['items'][number]): ReportFn => ({
    id: item.blockId,
    name: item.name,
    date: dateLabel(pricedAt.get(item.blockId)),
    amount: item.unitPrice,
    basis: item.priceBasis,
    share: item.sharePercent,
  });
  const included = report.items.filter((item) => item.includedInEstimate).map(toFn);
  return {
    included,
    excluded: report.items.filter((item) => !item.includedInEstimate && item.status === 'REMOVED').map(toFn),
    suggested: report.items.filter((item) => !item.includedInEstimate && item.status !== 'REMOVED').map(toFn),
    making: (draft?.pendingFeatures ?? []).map((feature) => feature.summary).slice(0, report.pendingFeatureCount),
    pendingCount: report.pendingFeatureCount,
    totals: { count: included.length, sub: report.subtotal, fee: report.clientFee, total: report.estimatedTotal },
  };
}

export const REPORT_ERROR_MESSAGES: Partial<Record<string, string>> = {
  DRAFT_NOT_FOUND: '초안을 찾을 수 없습니다. 초안 목록에서 다시 열어 주세요.',
  ROLE_MISMATCH: '의뢰인 계정으로 로그인한 뒤 다시 시도해 주세요.',
  DRAFT_NOT_IN_PROGRESS: '진행 중인 초안이 아니라 희망 예산을 바꿀 수 없습니다.',
  DRAFT_ALREADY_CONFIRMED: '명세를 확정한 초안이라 희망 예산을 바꿀 수 없습니다.',
  INVALID_REQUEST: '요청 정보가 올바르지 않습니다. 화면을 새로고침해 주세요.',
};

export const CONFIRMED_TITLE = '확정된 명세에는 리포트가 없습니다';
export const CONFIRMED_BODY =
  '단가 분석 리포트는 만드는 중인 초안에서만 참고용으로 보여 드립니다. 명세를 확정하면 AI 예상 금액을 더 이상 표시하지 않습니다.';

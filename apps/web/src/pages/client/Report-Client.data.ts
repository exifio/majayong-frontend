/* 단가 분석 리포트 시연 데이터 — 보드 Report-Client.dc.html renderVals · PRD F-04 · 디자인 시스템 8 · 10.3
 * 시연 정본은 2분할과 같다. 포함 4건 4,200,000 + 수수료 5% = 4,410,000 / 희망 예산 5,000,000.
 * 예산 초과는 단골 등급 관리 660,000을 포함(합계 5,103,000). 만드는 중은 금액 미정 1건. */
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

export type ReportFn = {
  id: string;
  name: string;
  date: string;
  amount: number;
  work: string;
  days: string;
  vary: string;
};

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
    work: '손님용 달력 · 회차 선택 화면과 가게용 정원 관리 화면, 정원이 차면 회차를 닫는 처리',
    days: '약 7일 · 화면 2개',
    vary: '회차가 요일마다 다르거나 좌석까지 고르게 하면 늘어날 수 있습니다',
  },
  {
    id: 'pay',
    name: '예약금 결제',
    date: '2026. 9. 18',
    amount: 1_200_000,
    work: 'PG 결제 연동 1건, 결제 실패 · 취소 처리, 환불 규정 안내',
    days: '약 6일 · 화면 1개 + 결제 연동',
    vary: '환불 기준이 여러 단계이거나 부분 환불이 있으면 늘어날 수 있습니다',
  },
  {
    id: 'noshow',
    name: '노쇼 기록',
    date: '2026. 9. 20',
    amount: 1_000_000,
    work: '손님별 방문 기록 목록과 노쇼 표시, 다음 예약 화면에 횟수 표시',
    days: '약 5일 · 화면 1개',
    vary: '노쇼 손님의 예약을 자동으로 막는 기능을 더하면 늘어날 수 있습니다',
  },
  {
    id: 'remind',
    name: '리마인드 알림',
    date: '2026. 9. 20',
    amount: 600_000,
    work: '예약 전날 자동 발송 1종, 발송 대행 서비스 연동',
    days: '약 3일 · 연동 1건',
    vary: '알림 종류를 늘리거나 알림톡과 문자를 함께 쓰면 늘어날 수 있습니다',
  },
];

const GRADE: ReportFn = {
  id: 'grade',
  name: '단골 등급 관리',
  date: '2026. 9. 22',
  amount: 660_000,
  work: '방문 횟수 집계, 등급 3단계와 등급별 표시',
  days: '약 3~4일 · 화면 1개',
  vary: '등급별 할인 · 쿠폰을 자동으로 주면 늘어날 수 있습니다',
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

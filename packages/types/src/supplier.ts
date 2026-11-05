/* 공급자 공간 응답 타입(/api/s)
 * PRD 7절: 공급자 API는 블록 단가 · 예상 총액 필드를 응답 타입에 두지 않는다.
 *          의뢰인 원문 · 계정 이메일 · 증빙 · 정산 정보(상대 것)도 없다.
 * 아래 SupplierNoForbiddenKeys 검사가 컴파일 단계에서 이를 막는다. */
import type { ApplicationDisplayStatus, ConditionLine, ContractDisplayStatus, IsoDate, Won } from './common';

/** 전체 공개 — 프로젝트 찾기 카드 */
export interface SupplierProjectCard {
  id: string;
  industry: string;
  title: string;
  itemNames: string[];
  itemCount: number;
  budgetRange: string;       // 희망 예산 구간 '400~600만원'
  deadline: IsoDate | null;
  requiredSkills: string[];
  matchedSkills: string[];   // 내 기술 스택과 같은 태그(점수 · 순위 없음)
  bookmarked: boolean;
}

/** 상세 공개 — 열람 기록이 남는다 */
export interface SupplierProjectDetail extends SupplierProjectCard {
  items: { specItemId: string; title: string; description: string; conditions: { key: string; text: string; note?: string }[] }[];
  hopeBudget: Won | null;
  interimRatioGuide: string;
  client: { userId: string; name: string; businessName: string; industry: string; storeAddress: string | null; websiteUrl: string | null; bio: string | null };
  myApplication: { status: ApplicationDisplayStatus; totalAmount: Won; durationDays: number } | null;
}

export interface SupplierApplicationRow {
  projectId: string;
  projectTitle: string;
  status: ApplicationDisplayStatus;
  totalAmount: Won;
  expectedPayout: Won;       // 수수료 5%(개인은 원천징수 3.3%) 뺀 금액
  submittedAt: IsoDate;
  holdReason?: string;       // 보류 이유 한 줄
}

export interface SupplierContractCard {
  id: string;
  status: ContractDisplayStatus;
  counterpartName: string;
  agreedAmount: Won;
  payoutAmount: Won;         // 합의 − 수수료(− 원천징수)
  durationDays: number;
  deadline: { label: string; at: IsoDate } | null;
  items: { title: string; conditions: ConditionLine[] }[];
}

/* ── 컴파일 단계 검사 ─────────────────────────────────────── */
type ForbiddenKey =
  | 'unitPrice' | 'aiEstimatedTotal' | 'approxPrice' | 'featureSum' | 'priceBasis'
  | 'utterance' | 'firstSentence' | 'email' | 'bizRegNo' | 'taxInvoiceEmail' | 'payoutAccountNo';

type DeepKeys<T> = T extends readonly (infer U)[]
  ? DeepKeys<U>
  : T extends object
    ? { [K in keyof T]: K | DeepKeys<T[K]> }[keyof T]
    : never;

type AssertNoForbidden<T> = Extract<DeepKeys<T>, ForbiddenKey> extends never ? true : ['금지 필드', Extract<DeepKeys<T>, ForbiddenKey>];

/** 공급자 응답 타입에 금지 필드가 생기면 여기서 타입 오류가 난다 */
export const SupplierNoForbiddenKeys: [
  AssertNoForbidden<SupplierProjectCard>,
  AssertNoForbidden<SupplierProjectDetail>,
  AssertNoForbidden<SupplierApplicationRow>,
  AssertNoForbidden<SupplierContractCard>,
] = [true, true, true, true];

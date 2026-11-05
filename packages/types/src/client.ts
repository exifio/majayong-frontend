/* 의뢰인 화면 모델. API 전송 DTO는 ./api.ts에 둔다. */
import type { ApplicationDisplayStatus, ConditionLine, ContractDisplayStatus, IsoDate, ProjectDisplayStatus, Won } from './common';

export interface ClientDraftBlock {
  id: string;
  blockId: string;
  name: string;
  description: string;
  status: 'SUGGESTED' | 'ADDED' | 'REMOVED';
  conditions: { key: string; text: string; note?: string }[];
  /** 와이어프레임 부품 6종 */
  wireframe: { parts: { type: 'CALENDAR' | 'FORM' | 'LIST' | 'BUTTON' | 'TEXT' | 'PREVIEW'; label?: string }[] } | null;
}

/** 초안 · 2분할 합계 — 명세 확정 후에는 어떤 응답에도 없다 */
export interface ClientDraftTotal {
  featureSum: Won;
  clientFee: Won;
  aiEstimatedTotal: Won;
  pendingCount: number;      // '+ 금액 미정 N건'
  hopeBudget: Won | null;
}

export interface ClientPriceReportRow {
  blockId: string;
  name: string;
  approxPrice: Won;          // '약 N원'
  share: number;             // 비중 %
  basis: [string, string, string];
  excluded: boolean;
}

export interface ClientProjectRow {
  id: string;
  title: string;
  status: ProjectDisplayStatus;
  deadline: IsoDate | null;
  applicationCount: number;
  detailViewCount: number;   // 'N명이 열람했습니다' — 의뢰인에게만
}

/** 제안 비교 카드 — 견적 금액 하나, 판정 표시 없음(D6) */
export interface ClientProposalCard {
  supplierId: string;
  supplierName: string;
  careerYears: number | null;
  ratingAvg: number | null;
  reviewCount: number;
  appliedAt: IsoDate;
  portfolioSummary: string | null;
  quoteAmount: Won;
  quoteAmountWithFee: Won;
  firstQuoteAmount: Won | null;   // 채팅에서 수정했으면 '처음 N원'
  questionCount: number;
  status: ApplicationDisplayStatus;
}

export interface ClientContractCard {
  id: string;
  status: ContractDisplayStatus;
  counterpartName: string;
  agreedAmount: Won;
  depositAmount: Won;            // 합의 + 수수료 5%
  durationDays: number;
  deadline: { label: string; at: IsoDate } | null;
  items: { title: string; conditions: ConditionLine[] }[];
}

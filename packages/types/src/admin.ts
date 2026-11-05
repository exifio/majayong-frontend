/* 운영자 공간 응답 타입(/api/admin) — 개인정보는 끝자리만(디자인 시스템 3절) */
import type { IsoDate, Won } from './common';

export interface AdminBlockRow {
  id: string;
  name: string;
  functionSummary: string;   // 생성 계기 — 원문이 아니라 기능 요약
  source: 'TEAM' | 'AI';
  unitPrice: Won;            // 운영자에게만
  usageCount: number;
  similarBlock: { id: string; name: string; similarity: number } | null;  // 70% 이상이면 병합 후보
  createdAt: IsoDate;
  reviewedAt: IsoDate | null;
  isActive: boolean;
}

export interface AdminQueueCounts {
  blocks: number;
  payments: number;
  refunds: number;
  disputes: number;
  reports: number;
}

/** 운영자 행위는 사유 필수, 이벤트 기록에 남는다 */
export interface AdminActionInput {
  reason: string;
}

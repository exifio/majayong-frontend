/* 운영자 화면 모델. API 전송 DTO는 ./api.ts에 둔다. */
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
  inquiries: number;
}

/** 운영자 행위는 사유 필수, 이벤트 기록에 남는다 */
export interface AdminActionInput {
  reason: string;
}

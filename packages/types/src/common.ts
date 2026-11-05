/* 공간 공통 타입 — 어느 공간 응답에 실려도 되는 값만 둔다.
 * 기준: schema v0.7 최종본.prisma · ERD v0.7 최종본 7절 · 결정메모 #1~#3 */

export type Role = 'CLIENT' | 'SUPPLIER' | 'ADMIN';

/** 금액은 모두 원 단위 정수, 부가세 포함(PRD 7.2 · F-29) */
export type Won = number;

/** ISO 8601(UTC). 화면은 Asia/Seoul로 표시한다 */
export type IsoDate = string;

/**
 * 연락처 가림 토큰. 서버가 저장 전에 연락처 형식을 이 문자열로 바꾸고,
 * 프론트엔드는 이 문자열을 ContactMaskToken 컴포넌트로 그린다(결정메모 · 착수 계획 5절).
 */
export const CONTACT_MASK_TOKEN = '⟦연락처 가림⟧';

/* ── 화면 표시 상태 — 서버가 계산해서 displayStatus로 내려준다(보류 · 마감 지남은 저장하지 않음) ── */

export type ProjectDisplayStatus =
  | '작성 중' | '모집 예정' | '모집 중' | '선택 중' | '임시 계약 중' | '계약 중'
  | '모집 마감' | '지원 0건 · 마감' | '보관됨';

export type ApplicationDisplayStatus =
  | '검토 중' | '문의 중' | '서명 대기' | '계약 중' | '보류' | '재견적 요청' | '이전 명세 기준'
  | '직접 거절' | '자동 거절' | '결렬' | '철회' | '대체됨';

export type ContractDisplayStatus =
  | '서명 대기' | '예치 대기' | '진행 중' | '검수 대기' | '마감 지남'
  | '취소 요청 중' | '취소 요청 받음' | '완료' | '결렬' | '취소';

export type BreakReason = 'CONSENT_TIMEOUT' | 'SIGN_REFUSED' | 'CLIENT_CANCELLED' | 'DEPOSIT_TIMEOUT';

/** 조건 줄 상태 — DECIDED만 검수 기준(ERD 6절) */
export type ConditionState = 'DECIDED' | 'PROPOSED' | 'UNDECIDED';

export interface ConditionLine {
  key: string;
  text: string;
  state: ConditionState;
  agreed?: string;
  evidenceMessageIds?: string[];
}

/** 인앱 알림 15종(schema NotificationType) */
export type NotificationType =
  | 'APPLICATION_RECEIVED' | 'APPLICATION_ACCEPTED' | 'APPLICATION_AUTO_REJECTED' | 'APPLICATION_REJECTED'
  | 'PROJECT_CLOSED' | 'REQUOTE_REQUESTED' | 'NEW_MESSAGE' | 'CONTRACT_BROKEN'
  | 'DEPOSIT_DUE' | 'INSPECTION_DUE' | 'WORK_DUE' | 'WORK_OVERDUE' | 'AUTO_APPROVED'
  | 'REPORT_REVIEWED' | 'INQUIRY_ANSWERED';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  target: string;      // 대상 한 줄(프로젝트 · 계약 이름)
  targetUrl: string;   // 결정메모 #1 형식
  isRead: boolean;
  createdAt: IsoDate;
}

export interface Me {
  id: string;
  role: Role;
  name: string;
  suspended: boolean;
  chatRestrictedUntil: IsoDate | null;
}

/** Backend success envelope: payload DTOs remain endpoint-specific. */
export interface DataEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  requestId: string;
}

/** Backend error envelope. */
export interface ErrorEnvelope {
  error: ApiError;
}

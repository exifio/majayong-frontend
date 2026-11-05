import type { ApiApplicationStatus } from '@majayong/types/api';
import type { ApplicationDisplayStatus } from '@majayong/types/common';

const APPLICATION_LABEL: Record<ApiApplicationStatus, ApplicationDisplayStatus> = {
  SUBMITTED: '검토 중',
  STALE: '이전 명세 기준',
  ACCEPTED: '계약 중',
  REJECTED: '직접 거절',
  AUTO_REJECTED: '자동 거절',
  WITHDRAWN: '철회',
  SUPERSEDED: '대체됨',
};

export function applicationStatusLabel(status: ApiApplicationStatus): ApplicationDisplayStatus {
  return APPLICATION_LABEL[status];
}

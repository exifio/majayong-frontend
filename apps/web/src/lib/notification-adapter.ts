import type { NotificationDto } from '@majayong/types/api';
import type { NotificationItem, NotificationType, Role } from '@majayong/types/common';

const MESSAGE_BY_TYPE: Record<NotificationType, string> = {
  APPLICATION_RECEIVED: '새 지원이 도착했습니다.',
  APPLICATION_ACCEPTED: '계약 서명이 필요합니다.',
  APPLICATION_AUTO_REJECTED: '지원이 자동 거절되었습니다.',
  APPLICATION_REJECTED: '지원이 거절되었습니다.',
  PROJECT_CLOSED: '프로젝트 모집이 종료되었습니다.',
  REQUOTE_REQUESTED: '다시 견적을 보내 주세요.',
  NEW_MESSAGE: '새 메시지가 도착했습니다.',
  CONTRACT_BROKEN: '계약이 결렬되었습니다.',
  DEPOSIT_DUE: '예치 기한이 다가옵니다.',
  INSPECTION_DUE: '검수 기한이 다가옵니다.',
  WORK_DUE: '작업 기한이 다가옵니다.',
  WORK_OVERDUE: '작업 기한이 지났습니다.',
  AUTO_APPROVED: '납품이 자동 승인되었습니다.',
  REPORT_REVIEWED: '신고 처리 결과가 등록되었습니다.',
  INQUIRY_ANSWERED: '문의에 답변이 등록되었습니다.',
};

function screenUrl(notification: NotificationDto, role: Exclude<Role, 'ADMIN'>): string {
  const targetId = encodeURIComponent(notification.targetId);
  switch (notification.type) {
    case 'APPLICATION_RECEIVED':
      return `/c/projects/${targetId}/proposals`;
    case 'APPLICATION_ACCEPTED':
      return `/s/contracts/${targetId}`;
    case 'APPLICATION_AUTO_REJECTED':
    case 'APPLICATION_REJECTED':
    case 'REQUOTE_REQUESTED':
      // shortcut: the existing detail route takes projectId, replace with an applicationId route when one exists.
      return '/s/applications';
    case 'PROJECT_CLOSED':
      return role === 'CLIENT' ? `/c/projects/${targetId}` : '/s/projects';
    case 'NEW_MESSAGE': {
      const [projectId, supplierId] = notification.targetId.split(':', 2);
      if (!projectId || !supplierId) return role === 'CLIENT' ? '/c' : '/s';
      return role === 'CLIENT'
        ? `/c/chat/${encodeURIComponent(projectId)}/${encodeURIComponent(supplierId)}`
        : `/s/chat/${encodeURIComponent(projectId)}`;
    }
    case 'CONTRACT_BROKEN':
      return `/${role === 'CLIENT' ? 'c' : 's'}/contracts/${targetId}`;
    case 'DEPOSIT_DUE':
      return role === 'CLIENT' ? `/c/contracts/${targetId}/escrow` : `/s/contracts/${targetId}`;
    case 'INSPECTION_DUE':
      return role === 'CLIENT' ? `/c/contracts/${targetId}/inspect` : `/s/contracts/${targetId}`;
    case 'WORK_DUE':
    case 'WORK_OVERDUE':
      return role === 'SUPPLIER' ? `/s/contracts/${targetId}/deliver` : `/c/contracts/${targetId}`;
    case 'AUTO_APPROVED':
      return role === 'CLIENT' ? '/c/settlements' : '/s/settlements';
    case 'REPORT_REVIEWED':
      // shortcut: no report-result screen exists, use the role home until that route is added.
      return role === 'CLIENT' ? '/c' : '/s';
    case 'INQUIRY_ANSWERED':
      return '/help';
  }
}

/** Convert wire DTOs to the existing notification screen model. */
export function notificationToItem(
  notification: NotificationDto,
  role: Exclude<Role, 'ADMIN'>,
): NotificationItem {
  return {
    id: notification.id,
    type: notification.type,
    message: MESSAGE_BY_TYPE[notification.type],
    target: notification.targetId,
    targetUrl: screenUrl(notification, role),
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  };
}

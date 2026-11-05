import type { ApiApplicationStatus, ChatMessageDto, ChatRoomSummaryDto } from '@majayong/types/api';
import type { ApplicationDisplayStatus, ContractDisplayStatus, Role } from '@majayong/types/common';
import { formatDate, formatTime } from './format';

const APPLICATION_LABEL: Record<ApiApplicationStatus, ApplicationDisplayStatus> = {
  SUBMITTED: '검토 중',
  STALE: '이전 명세 기준',
  ACCEPTED: '계약 중',
  REJECTED: '직접 거절',
  AUTO_REJECTED: '자동 거절',
  WITHDRAWN: '철회',
  SUPERSEDED: '대체됨',
};

const CONTRACT_LABEL: Record<NonNullable<ChatRoomSummaryDto['contractStatus']>, ContractDisplayStatus> = {
  PENDING_CONSENT: '서명 대기',
  ACTIVE: '진행 중',
  CANCEL_REQUESTED: '취소 요청 중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

/** Screen model for one chat room. Names are not in the chat API, so the real id is shown. */
export interface ChatRoomItem {
  applicationId: string;
  projectId: string;
  clientUserId: string;
  supplierId: string;
  counterpart: string;
  preview: string;
  timeLabel: string;
  statusLabel: ApplicationDisplayStatus | ContractDisplayStatus;
  unreadCount: number;
}

export type ChatMessageItem =
  | { kind: 'day'; id: string; text: string }
  | { kind: 'me'; id: string; at: string; text: string }
  | { kind: 'them'; id: string; at: string; text: string }
  | { kind: 'sys'; id: string; text: string };

function shortId(id: string): string {
  return id.slice(0, 8);
}

export function chatRoomToItem(room: ChatRoomSummaryDto, role: Role): ChatRoomItem {
  const counterpart = role === 'SUPPLIER'
    ? `의뢰인 ${shortId(room.clientUserId)}`
    : `공급자 ${shortId(room.supplierId)}`;
  return {
    applicationId: room.id,
    projectId: room.projectId,
    clientUserId: room.clientUserId,
    supplierId: room.supplierId,
    counterpart,
    preview: room.lastMessage?.body ?? '아직 메시지가 없습니다.',
    timeLabel: room.lastMessage ? formatTime(room.lastMessage.createdAt) : '',
    statusLabel: room.contractStatus ? CONTRACT_LABEL[room.contractStatus] : APPLICATION_LABEL[room.status],
    unreadCount: room.unreadCount,
  };
}

/** Messages in server order, with a day separator whenever the Seoul date changes. */
export function chatMessagesToItems(
  messages: readonly ChatMessageDto[],
  viewerId: string,
): ChatMessageItem[] {
  const items: ChatMessageItem[] = [];
  let lastDay = '';
  for (const message of messages) {
    const day = formatDate(message.createdAt);
    if (day !== lastDay) {
      items.push({ kind: 'day', id: `day-${message.id}`, text: day });
      lastDay = day;
    }
    if (message.kind === 'SYSTEM') {
      items.push({ kind: 'sys', id: message.id, text: message.body });
    } else if (message.senderId === viewerId) {
      items.push({ kind: 'me', id: message.id, at: formatTime(message.createdAt), text: message.body });
    } else {
      items.push({ kind: 'them', id: message.id, at: formatTime(message.createdAt), text: message.body });
    }
  }
  return items;
}

export function chatRoomHref(role: Role, room: Pick<ChatRoomItem, 'projectId' | 'supplierId'>): string {
  return role === 'SUPPLIER'
    ? `/s/chat/${encodeURIComponent(room.projectId)}`
    : `/c/chat/${encodeURIComponent(room.projectId)}/${encodeURIComponent(room.supplierId)}`;
}

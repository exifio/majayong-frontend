import type { ChatMessageDto, ChatRoomSummaryDto } from '@majayong/types/api';
import type { ApplicationDisplayStatus, ContractDisplayStatus, Role } from '@majayong/types/common';
import { CONTACT_MASK_TOKEN } from '@majayong/types';
import { applicationStatusLabel } from './application-status';
import { formatDate, formatTime } from './format';

/** Server stores this placeholder in masked message bodies. */
const SERVER_MASK_PLACEHOLDER = '[연락처 비공개]';

export function chatMessageText(message: Pick<ChatMessageDto, 'body' | 'isMasked'>): string {
  return message.isMasked
    ? message.body.split(SERVER_MASK_PLACEHOLDER).join(CONTACT_MASK_TOKEN)
    : message.body;
}

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
  projectTitle: string;
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

export function chatRoomToItem(room: ChatRoomSummaryDto): ChatRoomItem {
  return {
    applicationId: room.id,
    projectId: room.projectId,
    clientUserId: room.clientUserId,
    supplierId: room.supplierId,
    projectTitle: room.projectTitle,
    counterpart: room.counterpartDisplayName,
    preview: room.lastMessage ? chatMessageText(room.lastMessage) : '아직 메시지가 없습니다.',
    timeLabel: room.lastMessage ? formatTime(room.lastMessage.createdAt) : '',
    statusLabel: room.contractStatus ? CONTRACT_LABEL[room.contractStatus] : applicationStatusLabel(room.status),
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
      items.push({ kind: 'me', id: message.id, at: formatTime(message.createdAt), text: chatMessageText(message) });
    } else {
      items.push({ kind: 'them', id: message.id, at: formatTime(message.createdAt), text: chatMessageText(message) });
    }
  }
  return items;
}

export function chatRoomHref(role: Role, room: Pick<ChatRoomItem, 'projectId' | 'supplierId'>): string {
  return role === 'SUPPLIER'
    ? `/s/chat/${encodeURIComponent(room.projectId)}`
    : `/c/chat/${encodeURIComponent(room.projectId)}/${encodeURIComponent(room.supplierId)}`;
}

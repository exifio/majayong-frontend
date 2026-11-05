/* 실제 B 채팅 API로 방 목록과 메시지를 보여 준다. 화면 모델 변환은 lib/chat-adapter에 둔다. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Role } from '@majayong/types';
import { Button, MaskedText, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import {
  chatMessagesToItems,
  chatRoomHref,
  chatRoomToItem,
  type ChatMessageItem,
  type ChatRoomItem,
} from '@/lib/chat-adapter';
import s from './Chat-Client.module.css';

type LoadState = 'loading' | 'success' | 'auth-error' | 'error';

const STATE_MESSAGE: Record<Exclude<LoadState, 'success'>, string> = {
  loading: '대화를 불러오는 중입니다.',
  'auth-error': 'API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.',
  error: '대화를 불러오지 못했습니다.',
};

function StateLine({ state, onRetry }: { state: Exclude<LoadState, 'success'>; onRetry: () => void }) {
  return (
    <p role={state === 'loading' ? 'status' : 'alert'} style={{ padding: 24 }}>
      {STATE_MESSAGE[state]}
      {state !== 'loading' && (
        <Button variant="text" onClick={onRetry}>다시 시도</Button>
      )}
    </p>
  );
}

function Message({ item, counterpart }: { item: ChatMessageItem; counterpart: string }) {
  if (item.kind === 'day') return <div className={s.day}>{item.text}</div>;
  if (item.kind === 'sys') return <p className={s.sys}>{item.text}</p>;
  return (
    <div className={`${s.m} ${item.kind === 'me' ? s.me : ''}`}>
      <p className={s.by}>{item.kind === 'me' ? '나' : counterpart} · {item.at}</p>
      <div className={s.bb}>
        <MaskedText text={item.text} />
      </div>
    </div>
  );
}

export function LiveChat({ pid, sid }: { pid?: string; sid?: string }) {
  const { apiAccessToken, session } = useSession();
  const role: Role = session.status === 'user' ? session.role : 'CLIENT';
  const [rooms, setRooms] = useState<ChatRoomItem[]>([]);
  const [listState, setListState] = useState<LoadState>('loading');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [messageState, setMessageState] = useState<LoadState>('loading');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setListState('loading');
    apiRequest('listChatRooms', '/me/chats', { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        setRooms(response.data.map((room) => chatRoomToItem(room, role)));
        setListState('success');
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setListState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
      });
    return () => controller.abort();
  }, [apiAccessToken, role, retry]);

  const selected = rooms.find((room) => room.projectId === pid && (!sid || room.supplierId === sid)) ?? rooms[0];
  const applicationId = selected?.applicationId;
  const viewerId = selected === undefined ? '' : role === 'SUPPLIER' ? selected.supplierId : selected.clientUserId;

  useEffect(() => {
    if (applicationId === undefined || !viewerId) return;
    const controller = new AbortController();
    setMessageState('loading');
    apiRequest('listMessages', `/applications/${encodeURIComponent(applicationId)}/messages`, {
      accessToken: apiAccessToken,
      signal: controller.signal,
    }).then(async (response) => {
      setMessages(chatMessagesToItems(response.data.messages, viewerId));
      setMessageState('success');
      if (response.data.unreadCount > 0) {
        await apiRequest('readMessages', `/applications/${encodeURIComponent(applicationId)}/messages/read`, {
          method: 'POST',
          accessToken: apiAccessToken,
        });
        setRooms((current) => current.map((room) =>
          room.applicationId === applicationId ? { ...room, unreadCount: 0 } : room));
      }
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setMessageState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
    });
    return () => controller.abort();
  }, [applicationId, apiAccessToken, viewerId, retry]);

  const retryAll = () => setRetry((count) => count + 1);

  if (listState !== 'success') {
    return <div className={s.page}><StateLine state={listState} onRetry={retryAll} /></div>;
  }
  if (selected === undefined) {
    return <div className={s.page}><p role="status" style={{ padding: 24 }}>대화가 없습니다.</p></div>;
  }

  return (
    <div className={s.page} data-screen="Chat-Client-Live">
      <div className={s.ch}>
        <aside className={s.ls} aria-label="대화 목록">
          <div className={s.lh}>채팅</div>
          {rooms.map((room) => (
            <Link
              key={room.applicationId}
              className={`${s.it} ${room.applicationId === applicationId ? s.itOn : ''}`}
              to={chatRoomHref(role, room)}
            >
              <span className={s.av} aria-hidden="true">{role === 'SUPPLIER' ? '의' : '공'}</span>
              <span className={s.bd}>
                <span className={s.r1}>
                  <span className={s.nm}>{room.counterpart}</span>
                  <span className={s.tm}>{room.timeLabel}</span>
                </span>
                <span className={s.pv}>{room.preview}</span>
                <span className={s.r3}>
                  <StatusChip status={room.statusLabel} />
                  {room.unreadCount > 0 ? <span className={s.ub}>{room.unreadCount}</span> : null}
                </span>
              </span>
            </Link>
          ))}
        </aside>

        <section className={s.cv} aria-label={`${selected.counterpart} 대화`}>
          <div className={s.cvh}>
            <div className={s.who}>
              <span className={s.whoAv} aria-hidden="true">{role === 'SUPPLIER' ? '의' : '공'}</span>
              <div>
                <div className={s.whoNm}>
                  {selected.counterpart} <StatusChip status={selected.statusLabel} />
                </div>
                <div className={s.whoMt}>프로젝트 {selected.projectId.slice(0, 8)}</div>
              </div>
            </div>
          </div>

          <div className={s.msgs}>
            {messageState !== 'success' && <StateLine state={messageState} onRetry={retryAll} />}
            {messageState === 'success' && messages.length === 0 && (
              <p role="status" style={{ padding: 24 }}>아직 메시지가 없습니다.</p>
            )}
            {messageState === 'success' && messages.map((item) => (
              <Message key={item.id} item={item} counterpart={selected.counterpart} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

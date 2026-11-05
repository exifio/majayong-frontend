/* 실제 B 채팅 API 화면 — CLIENT/SUPPLIER가 같은 목록·메시지·전송 로직을 쓴다.
 * 화면 모델 변환은 lib/chat-adapter에 두고, 스타일 모듈만 화면별로 받는다. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Role } from '@majayong/types';
import type { ChatMessageDto } from '@majayong/types/api';
import { Button, MaskedText, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatTime } from '@/lib/format';
import {
  chatMessageText,
  chatMessagesToItems,
  chatRoomHref,
  chatRoomToItem,
  type ChatMessageItem,
  type ChatRoomItem,
} from '@/lib/chat-adapter';

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
      {state !== 'loading' && <Button variant="text" onClick={onRetry}>다시 시도</Button>}
    </p>
  );
}

function Message({ item, counterpart, s }: { item: ChatMessageItem; counterpart: string; s: Record<string, string> }) {
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

export function LiveChat({ pid, sid, styles }: { pid?: string; sid?: string; styles: Record<string, string> }) {
  const s = styles;
  const { apiAccessToken, session } = useSession();
  const role: Role = session.status === 'user' ? session.role : 'CLIENT';
  const [rooms, setRooms] = useState<ChatRoomItem[]>([]);
  const [listState, setListState] = useState<LoadState>('loading');
  const [rawMessages, setRawMessages] = useState<ChatMessageDto[]>([]);
  const [messageState, setMessageState] = useState<LoadState>('loading');
  const [retry, setRetry] = useState(0);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setListState('loading');
    apiRequest('listChatRooms', '/me/chats', { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        setRooms(response.data.map((room) => chatRoomToItem(room)));
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
  const items = chatMessagesToItems(rawMessages, viewerId);
  // Server policy: a supplier may answer only after the client has sent a message.
  const canReply = selected !== undefined && (role !== 'SUPPLIER' ||
    rawMessages.some((message) => message.senderId === selected.clientUserId));

  useEffect(() => {
    if (applicationId === undefined || !viewerId) return;
    const controller = new AbortController();
    setMessageState('loading');
    setSendError(null);
    setDraft('');
    apiRequest('listMessages', `/applications/${encodeURIComponent(applicationId)}/messages`, {
      accessToken: apiAccessToken,
      signal: controller.signal,
    }).then(async (response) => {
      setRawMessages(response.data.messages);
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

  async function send() {
    const body = draft.trim();
    if (!body || sending || applicationId === undefined) return;
    setSending(true);
    setSendError(null);
    try {
      const response = await apiRequest('sendMessage', `/applications/${encodeURIComponent(applicationId)}/messages`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { body },
      });
      // The server returns the stored, possibly masked message; use it as-is.
      setRawMessages((current) => [...current, response.data]);
      setRooms((current) => current.map((room) => room.applicationId === applicationId
        ? {
          ...room,
          preview: chatMessageText(response.data),
          timeLabel: formatTime(response.data.createdAt),
        }
        : room));
      setDraft('');
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setMessageState('auth-error');
      } else {
        setSendError(error instanceof ApiRequestError && error.message
          ? error.message
          : '메시지를 보내지 못했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setSending(false);
    }
  }

  if (listState !== 'success') {
    return <div className={s.page}><StateLine state={listState} onRetry={retryAll} /></div>;
  }
  if (selected === undefined) {
    return <div className={s.page}><p role="status" style={{ padding: 24 }}>대화가 없습니다.</p></div>;
  }

  return (
    <div className={s.page} data-screen="Chat-Live" data-role={role}>
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
                <div className={s.whoMt}>{selected.projectTitle}</div>
              </div>
            </div>
          </div>

          <div className={s.msgs}>
            {messageState !== 'success' && <StateLine state={messageState} onRetry={retryAll} />}
            {messageState === 'success' && items.length === 0 && (
              <p role="status" style={{ padding: 24 }}>아직 메시지가 없습니다.</p>
            )}
            {messageState === 'success' && items.map((item) => (
              <Message key={item.id} item={item} counterpart={selected.counterpart} s={s} />
            ))}
          </div>

          <div className={s.in}>
            <div className={s.inRow}>
              <input
                className={s.inp}
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder={canReply ? '메시지 입력' : '의뢰인의 첫 메시지 이후 답장할 수 있습니다'}
                aria-label="메시지 입력"
                disabled={sending || !canReply}
              />
              <Button
                variant="tint"
                onClick={() => void send()}
                disabled={sending || !canReply || !draft.trim()}
                disabledReason={!canReply ? '의뢰인의 첫 메시지 이후 답장할 수 있습니다.' : '메시지를 입력해 주세요.'}
              >
                {sending ? '보내는 중' : '보내기'}
              </Button>
            </div>
            {!canReply && <p className={s.hint} role="status">의뢰인의 첫 메시지 이후에 답장할 수 있습니다.</p>}
            {sendError && <p className={s.hint} role="alert">{sendError}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

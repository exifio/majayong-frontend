/* 계약 취소 — 실제 GET/POST /contracts/:id/cancellation(·agree·object) API. CLIENT/SUPPLIER 공용.
 * 요청 작성(예치 완료된 ACTIVE 계약) → 상대방 동의 또는 이의(운영자 판정) → 취소 확정 정산 표시. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  ApiCancelCause,
  CancellationDto,
  ChatMessageDto,
  ContractRecordDto,
  RequestCancellationRequestDto,
} from '@majayong/types/api';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatDateTime, formatWon } from '@/lib/format';
import {
  Band,
  Button,
  ConfirmCheck,
  ConfirmDialog,
  LoadingState,
  SelectCards,
  TextAreaField,
  TextField,
} from '@/components/ui';
import s from './LiveCancellation.module.css';

type LoadState = 'loading' | 'ready' | 'auth-error' | 'error';
type Role = 'CLIENT' | 'SUPPLIER';

export const CANCEL_CAUSE_LABEL: Record<ApiCancelCause, string> = {
  CLIENT: '의뢰인 사정',
  SUPPLIER: '공급자 사정',
  MUTUAL: '서로 합의',
};

const CAUSE_DESC: Record<ApiCancelCause, string> = {
  CLIENT: '납품 전이면 공급자에게 정해진 보상(50% 이상)을 정산합니다.',
  SUPPLIER: '지급되지 않은 구간을 의뢰인에게 전액 환불합니다.',
  MUTUAL: '양쪽이 정한 보상 비율로 나눕니다.',
};

/** 서버 규칙: 의뢰인 사정은 의뢰인만, 공급자 사정은 공급자만 요청할 수 있다. */
const CAUSES_BY_ROLE: Record<Role, ApiCancelCause[]> = {
  CLIENT: ['CLIENT', 'MUTUAL'],
  SUPPLIER: ['SUPPLIER', 'MUTUAL'],
};

const MESSAGE_LIMIT = 30;

function parseRate(value: string): number | null {
  if (!/^\d{1,3}$/.test(value.trim())) return null;
  const rate = Number(value.trim());
  return rate >= 0 && rate <= 100 ? rate : null;
}

export function LiveCancellation({ cid, role }: { cid: string; role: Role }) {
  const { apiAccessToken } = useSession();
  const screen = role === 'SUPPLIER' ? 'Cancel-Supplier' : 'Cancel-Client';
  const [state, setState] = useState<LoadState>('loading');
  const [contract, setContract] = useState<ContractRecordDto | null>(null);
  const [cancellation, setCancellation] = useState<CancellationDto | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[] | null>(null);
  const [messagesError, setMessagesError] = useState(false);
  const [retry, setRetry] = useState(0);

  const [cause, setCause] = useState<ApiCancelCause | null>(null);
  const [note, setNote] = useState('');
  const [rate, setRate] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const [confirm, setConfirm] = useState<'request' | 'agree' | null>(null);

  const [objecting, setObjecting] = useState(false);
  const [objectionRate, setObjectionRate] = useState('');
  const [objectionNote, setObjectionNote] = useState('');
  const [objectionTried, setObjectionTried] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    const options = { accessToken: apiAccessToken, signal: controller.signal };
    Promise.all([
      apiRequest('getContract', `/contracts/${encodeURIComponent(cid)}`, options),
      apiRequest('getCancellation', `/contracts/${encodeURIComponent(cid)}/cancellation`, options),
    ])
      .then(([contractResponse, cancellationResponse]) => {
        setContract(contractResponse.data);
        setCancellation(cancellationResponse.data);
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setState(caught instanceof ApiRequestError && caught.status === 401 ? 'auth-error' : 'error');
      });
    return () => controller.abort();
  }, [cid, apiAccessToken, retry]);

  /* 근거 메시지: 계약이 나온 지원(applicationId)의 채팅. 실패해도 요청은 근거 없이 보낼 수 있다. */
  const applicationId = contract?.applicationId;
  useEffect(() => {
    if (!applicationId) return;
    const controller = new AbortController();
    setMessagesError(false);
    apiRequest('listMessages', `/applications/${encodeURIComponent(applicationId)}/messages`, {
      accessToken: apiAccessToken,
      signal: controller.signal,
    })
      .then((response) => setMessages(response.data.messages))
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setMessages(null);
        setMessagesError(true);
      });
    return () => controller.abort();
  }, [applicationId, apiAccessToken]);

  if (state === 'loading') {
    return <div data-screen={screen}><LoadingState title="계약 취소" label="취소 정보를 불러오는 중입니다." /></div>;
  }
  if (state === 'auth-error') {
    return <div data-screen={screen}><p role="alert" className={s.state}>로그인이 필요합니다. 다시 로그인해 주세요.</p></div>;
  }
  if (state === 'error' || !contract || !cancellation) {
    return (
      <div data-screen={screen}>
        <p role="alert" className={s.state}>
          취소 정보를 불러오지 못했습니다.
          <Button variant="text" type="button" onClick={() => setRetry((count) => count + 1)}>다시 시도</Button>
        </p>
      </div>
    );
  }

  const isSupplier = role === 'SUPPLIER';
  const myId = isSupplier ? contract.supplierId : contract.clientUserId;
  const base = isSupplier ? '/s' : '/c';
  const contractHref = `${base}/contracts/${encodeURIComponent(cid)}`;
  const settleHref = `${base}/settlements?contract=${encodeURIComponent(cid)}`;
  const partyMessages = (messages ?? []).filter((message) => message.kind === 'TEXT' && message.senderId !== null);
  const recentMessages = partyMessages.slice(-MESSAGE_LIMIT);
  const messageById = new Map(partyMessages.map((message) => [message.id, message]));

  const canRequest = contract.status === 'ACTIVE' &&
    (contract.paymentStatus === 'DEPOSITED' || contract.paymentStatus === 'PARTIALLY_RELEASED');
  const pending = contract.status === 'CANCEL_REQUESTED' && cancellation.cancelResolvedAt === null;
  const requestedByMe = cancellation.cancelRequestedBy === myId;
  const escalated = cancellation.cancelEscalatedAt !== null;
  const canRespond = pending && !requestedByMe && !escalated && cancellation.cancelRequestedBy !== null;

  const parsedRate = parseRate(rate);
  const noteOk = note.trim().length > 0;
  const rateOk = cause !== 'MUTUAL' || parsedRate !== null;
  const formOk = cause !== null && noteOk && rateOk;

  const parsedObjectionRate = parseRate(objectionRate);
  const minObjection = cancellation.cancelCause === 'CLIENT' ? 50 : 0;
  const objectionOk = parsedObjectionRate !== null && objectionNote.trim().length > 0;

  const fail = (caught: unknown, fallback: string) => {
    if (caught instanceof ApiRequestError && caught.status === 401) {
      setState('auth-error');
      return;
    }
    setError(caught instanceof ApiRequestError ? caught.message : fallback);
    if (caught instanceof ApiRequestError && caught.status === 409) setRetry((count) => count + 1);
  };

  const sendRequest = async () => {
    setConfirm(null);
    if (!formOk || cause === null || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const jsonBody: RequestCancellationRequestDto = {
      cause,
      note: note.trim(),
      ...(picked.length > 0 ? { evidence: { messageIds: picked } } : {}),
      ...(cause === 'MUTUAL' && parsedRate !== null ? { proposedCompensationRate: parsedRate } : {}),
    };
    try {
      await apiRequest('requestCancellation', `/contracts/${encodeURIComponent(cid)}/cancellation`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody,
      });
      setNotice('취소 요청을 보냈습니다. 상대방의 응답을 기다립니다.');
      setRetry((count) => count + 1);
    } catch (caught) {
      fail(caught, '취소 요청을 보내지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const agree = async () => {
    setConfirm(null);
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await apiRequest('agreeCancellation', `/contracts/${encodeURIComponent(cid)}/cancellation/agree`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: {},
      });
      setNotice('취소에 동의했습니다. 계약이 취소되고 정산이 확정되었습니다.');
      setRetry((count) => count + 1);
    } catch (caught) {
      fail(caught, '동의를 처리하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const object = async () => {
    setObjectionTried(true);
    if (!objectionOk || parsedObjectionRate === null || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await apiRequest('objectCancellation', `/contracts/${encodeURIComponent(cid)}/cancellation/object`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { objectionRate: parsedObjectionRate, note: objectionNote.trim() },
      });
      setNotice('이의를 보냈습니다. 운영자가 양쪽 사유를 보고 판정합니다.');
      setObjecting(false);
      setRetry((count) => count + 1);
    } catch (caught) {
      fail(caught, '이의를 보내지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const togglePick = (id: string, on: boolean) => {
    setPicked((prev) => (on ? [...prev.filter((x) => x !== id), id] : prev.filter((x) => x !== id)));
  };

  const evidenceIds = cancellation.cancelEvidence?.messageIds ?? [];

  return (
    <div className={s.page} data-screen={screen} data-role={role}>
      <p className={s.crumb}>
        <Link to={`${base}/contracts`}>내 계약</Link>{' › '}
        <Link to={contractHref}>계약서</Link>{' › '}
        취소
      </p>
      <h1 className={s.title}>
        {canRequest ? '계약 취소 요청' : pending ? (requestedByMe ? '취소 요청 · 응답 대기' : '취소 요청 받음') : '계약 취소'}
      </h1>
      <p className={s.sub}>
        {formatWon(contract.agreedAmount)} · 예치 {formatWon(contract.totalDeposited)} · 요청 중에는 작업과 검수가 멈춥니다.
      </p>

      {notice ? <p role="status">{notice}</p> : null}

      {pending && escalated ? (
        <Band tone="warn" title="운영자 판정 중">
          이견이 있어 운영자가 양쪽 사유를 보고 정산 비율을 정합니다.
        </Band>
      ) : null}
      {pending && !escalated && requestedByMe ? (
        <Band tone="wait" title="상대방 응답 대기">
          상대방이 동의하면 확정되고, 이의를 제기하면 운영자가 판정합니다. 철회는 계약서 화면에서 할 수 있습니다.
        </Band>
      ) : null}
      {contract.status === 'CANCELLED' ? (
        <Band tone="done" title="계약 취소 확정">
          {cancellation.cancelResolution === 'ADMIN_DECIDED' ? '운영자 판정으로 정산이 확정되었습니다.' : cancellation.cancelResolution === 'AGREED' ? '양쪽 동의로 정산이 확정되었습니다.' : '계약이 취소되었습니다.'}
        </Band>
      ) : null}

      {cancellation.cancelCause !== null || contract.status === 'CANCELLED' ? (
        <section className={s.blk} aria-labelledby="cancel-detail">
          <h2 id="cancel-detail">취소 내용</h2>
          <dl className={s.kv}>
            {cancellation.cancelCause ? (<><dt>사유</dt><dd>{CANCEL_CAUSE_LABEL[cancellation.cancelCause]}</dd></>) : null}
            {cancellation.cancelRequestedAt ? (<><dt>요청 시각</dt><dd>{formatDateTime(cancellation.cancelRequestedAt)}</dd></>) : null}
            {cancellation.cancelNote ? (<><dt>요청 설명</dt><dd>{cancellation.cancelNote}</dd></>) : null}
            {cancellation.compensationRate !== null ? (<><dt>보상 비율</dt><dd>{cancellation.compensationRate}%</dd></>) : null}
            {cancellation.objectionRate !== null ? (<><dt>이의 보상 비율</dt><dd>{cancellation.objectionRate}%</dd></>) : null}
            {cancellation.objectionNote ? (<><dt>이의 설명</dt><dd>{cancellation.objectionNote}</dd></>) : null}
            {cancellation.refundAmount !== null ? (<><dt>환불 금액</dt><dd>{formatWon(cancellation.refundAmount)}</dd></>) : null}
            {cancellation.clientFeeRefund !== null ? (<><dt>수수료 환불</dt><dd>{formatWon(cancellation.clientFeeRefund)}</dd></>) : null}
            {cancellation.settledAmount !== null ? (<><dt>공급자 정산</dt><dd>{formatWon(cancellation.settledAmount)}</dd></>) : null}
            {cancellation.refundReason ? (<><dt>환불 사유</dt><dd>{cancellation.refundReason}</dd></>) : null}
            {contract.status === 'CANCELLED' ? (
              <>
                <dt>환불 처리</dt>
                <dd>{cancellation.refundedAt ? formatDateTime(cancellation.refundedAt) : '처리 전'}</dd>
                <dt>공급자 지급 처리</dt>
                <dd>{cancellation.cancelPayoutAt ? formatDateTime(cancellation.cancelPayoutAt) : '처리 전'}</dd>
              </>
            ) : null}
          </dl>
          {evidenceIds.length > 0 ? (
            <>
              <h3 className={s.hint}>근거 메시지 {evidenceIds.length}개</h3>
              <ul className={s.msgs} aria-label="근거 메시지">
                {evidenceIds.map((id) => (
                  <li key={id}>{messageById.get(id)?.body ?? '메시지를 불러오지 못했습니다.'}</li>
                ))}
              </ul>
            </>
          ) : null}
          {contract.status === 'CANCELLED' ? (
            <div className={s.actions}>
              <Button variant="ghost" to={settleHref}>정산 내역 보기</Button>
            </div>
          ) : null}
        </section>
      ) : null}

      {canRequest ? (
        <>
          <section className={s.blk} aria-labelledby="cancel-cause">
            <h2 id="cancel-cause">취소 사유</h2>
            <p className={s.hint}>사유에 따라 정산이 달라집니다.</p>
            <SelectCards
              label="취소 사유"
              value={cause}
              onChange={(key) => setCause(key as ApiCancelCause)}
              options={CAUSES_BY_ROLE[role].map((key) => ({
                key,
                label: (
                  <span className={s.cardLabel}>
                    <span className={s.cardTitle}>{CANCEL_CAUSE_LABEL[key]}</span>
                    <span className={s.cardDesc}>{CAUSE_DESC[key]}</span>
                  </span>
                ),
              }))}
            />
            {tried && cause === null ? <p className={s.error} role="alert">취소 사유를 골라 주세요.</p> : null}
            <div className={s.fields}>
              {cause === 'MUTUAL' ? (
                <TextField
                  label="공급자 보상 비율(%)"
                  inputMode="numeric"
                  required
                  value={rate}
                  hint="0~100 사이 정수. 상대방이 동의하면 이 비율로 정산합니다."
                  error={tried && parsedRate === null ? '0~100 사이 정수를 입력해 주세요.' : undefined}
                  onChange={(event) => setRate(event.target.value)}
                />
              ) : null}
              <TextAreaField
                label="사유 설명"
                required
                value={note}
                hint="상대방과 운영자가 함께 봅니다. 연락처는 적어도 가려집니다."
                error={tried && !noteOk ? '사유 설명을 입력해 주세요.' : undefined}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </section>

          <section className={s.blk} aria-labelledby="cancel-evidence">
            <h2 id="cancel-evidence">근거 메시지 (선택)</h2>
            <p className={s.hint}>이 계약 채팅에서 근거가 되는 메시지를 고르면 운영자 판정에 함께 쓰입니다.</p>
            {messages === null && !messagesError ? <LoadingState compact label="메시지를 불러오는 중입니다." /> : null}
            {messagesError ? <p className={s.hint} role="alert">채팅 메시지를 불러오지 못했습니다. 근거 없이 요청할 수 있습니다.</p> : null}
            {messages !== null && recentMessages.length === 0 ? <p className={s.hint}>고를 수 있는 메시지가 없습니다.</p> : null}
            {recentMessages.length > 0 ? (
              <ul className={s.msgs} aria-label="채팅 메시지">
                {recentMessages.map((message) => (
                  <li key={message.id}>
                    <ConfirmCheck checked={picked.includes(message.id)} onChange={(on) => togglePick(message.id, on)}>
                      {message.body}
                      <span className={s.msgMeta}>{message.senderId === myId ? '나' : '상대방'} · {formatDateTime(message.createdAt)}</span>
                    </ConfirmCheck>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {error ? <p className={s.error} role="alert">{error}</p> : null}
          <div className={s.actions}>
            <Button variant="ghost" to={contractHref}>계약서로</Button>
            <Button
              variant="warn"
              type="button"
              disabled={busy}
              disabledReason={busy ? '보내는 중입니다' : undefined}
              onClick={() => {
                setTried(true);
                if (formOk) setConfirm('request');
              }}
            >
              {busy ? '보내는 중' : '취소 요청 보내기'}
            </Button>
          </div>
        </>
      ) : null}

      {!canRequest && contract.status === 'ACTIVE' ? (
        <p className={s.state}>예치가 완료된 계약만 취소를 요청할 수 있습니다. 예치 전 계약은 기한이 지나면 자동으로 결렬됩니다.</p>
      ) : null}
      {contract.status === 'PENDING_CONSENT' ? (
        <p className={s.state}>서명 전 계약은 계약서 화면에서 서명 거절 또는 임시 계약 취소를 할 수 있습니다.</p>
      ) : null}
      {contract.status === 'COMPLETED' ? <p className={s.state}>완료된 계약은 취소할 수 없습니다.</p> : null}

      {canRespond ? (
        <section className={s.blk} aria-labelledby="cancel-respond">
          <h2 id="cancel-respond">응답</h2>
          <p className={s.hint}>동의하면 바로 취소가 확정되고 위 조건으로 정산됩니다. 동의하지 않으면 보상 비율과 사유를 적어 이의를 보내세요.</p>
          {objecting ? (
            <div className={s.fields}>
              <TextField
                label="요청하는 보상 비율(%)"
                inputMode="numeric"
                required
                value={objectionRate}
                hint={minObjection > 0 ? '의뢰인 사정 취소는 50% 이상이어야 합니다.' : '0~100 사이 정수'}
                error={objectionTried && parsedObjectionRate === null ? '0~100 사이 정수를 입력해 주세요.' : undefined}
                onChange={(event) => setObjectionRate(event.target.value)}
              />
              <TextAreaField
                label="이의 사유"
                required
                value={objectionNote}
                error={objectionTried && !objectionNote.trim() ? '이의 사유를 입력해 주세요.' : undefined}
                onChange={(event) => setObjectionNote(event.target.value)}
              />
            </div>
          ) : null}
          {error ? <p className={s.error} role="alert">{error}</p> : null}
          <div className={s.actions}>
            {objecting ? (
              <>
                <Button variant="ghost" type="button" disabled={busy} onClick={() => setObjecting(false)}>이의 작성 닫기</Button>
                <Button variant="tint" type="button" disabled={busy} disabledReason={busy ? '보내는 중입니다' : undefined} onClick={() => void object()}>
                  이의 보내기
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" type="button" disabled={busy} onClick={() => setObjecting(true)}>이의 제기</Button>
                <Button variant="primary" type="button" disabled={busy} disabledReason={busy ? '처리 중입니다' : undefined} onClick={() => setConfirm('agree')}>
                  동의하기
                </Button>
              </>
            )}
          </div>
        </section>
      ) : null}

      {pending && !canRespond && error ? <p className={s.error} role="alert">{error}</p> : null}

      {confirm === 'request' && cause !== null ? (
        <ConfirmDialog
          title="취소 요청을 보낼까요?"
          confirmLabel="요청 보내기"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => void sendRequest()}
        >
          <p>
            사유 {CANCEL_CAUSE_LABEL[cause]}
            {cause === 'MUTUAL' && parsedRate !== null ? ` · 보상 비율 ${parsedRate}%` : ''}
            {picked.length > 0 ? ` · 근거 메시지 ${picked.length}개` : ''}
          </p>
          <p>요청 중에는 작업과 검수가 멈춥니다. 상대방이 응답하기 전에는 계약서 화면에서 철회할 수 있습니다.</p>
        </ConfirmDialog>
      ) : null}
      {confirm === 'agree' ? (
        <ConfirmDialog
          title="취소에 동의할까요?"
          confirmLabel="동의하기"
          onCancel={() => setConfirm(null)}
          onConfirm={() => void agree()}
        >
          <p>동의하면 계약이 취소되고 정산이 확정됩니다. 동의한 뒤에는 되돌릴 수 없습니다.</p>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

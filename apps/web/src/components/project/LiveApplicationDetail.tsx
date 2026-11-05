/* B 의뢰인 지원서 상세 — getApplication 응답과 agreement-preview의 항목 제목만 사용한다. */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApplicationRevisionDto } from '@majayong/types/api';
import { Button, ConfirmDialog, MaskedText, Money, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { applicationStatusLabel } from '@/lib/application-status';
import { formatDateTime } from '@/lib/format';

type State = 'loading' | 'success' | 'auth-error' | 'error';

export function LiveApplicationDetail({
  applicationId,
  projectId,
  supplierId,
  styles,
  onClose,
  onStatusChange,
}: {
  applicationId: string;
  projectId: string;
  supplierId: string;
  styles: Record<string, string>;
  onClose: () => void;
  onStatusChange?: (applicationId: string, status: ApplicationRevisionDto['status']) => void;
}) {
  const s = styles;
  const navigate = useNavigate();
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<State>('loading');
  const [application, setApplication] = useState<ApplicationRevisionDto | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    apiRequest('getApplication', `/applications/${encodeURIComponent(applicationId)}`, {
      accessToken: apiAccessToken,
      signal: controller.signal,
    }).then((response) => {
      setApplication(response.data);
      setState('success');
      // Item titles are not in getApplication; the agreement preview provides them.
      apiRequest('previewAgreement', `/applications/${encodeURIComponent(applicationId)}/agreement-preview`, {
        accessToken: apiAccessToken,
        signal: controller.signal,
      }).then((preview) => {
        setTitles(Object.fromEntries(preview.data.draft.items.map((item) => [item.specItemId, item.title])));
      }).catch(() => { /* titles are optional */ });
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
    });
    return () => controller.abort();
  }, [applicationId, apiAccessToken]);

  async function openChat() {
    setChatBusy(true);
    setChatError(null);
    try {
      await apiRequest('openChat', `/applications/${encodeURIComponent(applicationId)}/chat/open`, {
        method: 'POST',
        accessToken: apiAccessToken,
      });
      navigate(`/c/chat/${encodeURIComponent(projectId)}/${encodeURIComponent(supplierId)}`);
    } catch (error) {
      setChatError(error instanceof ApiRequestError && error.status === 401
        ? 'API 토큰 인증에 실패했습니다.'
        : '채팅을 열지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setChatBusy(false);
    }
  }

  async function reject() {
    if (rejecting) return;
    setConfirming(false);
    setRejecting(true);
    setRejectError(null);
    try {
      const response = await apiRequest('rejectApplication', `/applications/${encodeURIComponent(applicationId)}/reject`, {
        method: 'POST',
        accessToken: apiAccessToken,
      });
      setApplication((current) => current ? { ...current, status: response.data.status } : current);
      onStatusChange?.(applicationId, response.data.status);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setState('auth-error');
      } else if (error instanceof ApiRequestError && error.message) {
        setRejectError(error.message);
      } else {
        setRejectError('지원을 거절하지 못했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setRejecting(false);
    }
  }

  const label = (specItemId: string) => titles[specItemId] ?? `항목 ${specItemId.slice(0, 8)}`;
  const canReject = application !== null && ['SUBMITTED', 'STALE'].includes(application.status);

  return (
    <section className={s.card} aria-label="지원서 상세" data-application-detail={applicationId}>
      {state === 'loading' && <p role="status">지원서를 불러오는 중입니다.</p>}
      {state === 'auth-error' && <p role="alert">API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.</p>}
      {state === 'error' && <p role="alert">지원서를 불러오지 못했습니다.</p>}

      {state === 'success' && application && (
        <div>
          <div className={s.top}>
            <p className={s.nm}>지원서 상세</p>
            <StatusChip status={applicationStatusLabel(application.status)} />
          </div>
          <p className={s.mt}>지원일 {formatDateTime(application.submittedAt)} · {application.durationDays}일</p>

          <div className={s.amt}>
            <p className={s.amtK}>지원 금액</p>
            <Money amount={application.totalAmount} size="big" />
          </div>

          <div className={s.pf}>
            <p className={s.pfK}>지원 메시지</p>
            <p>{application.message ? <MaskedText text={application.message} /> : '메시지가 없습니다.'}</p>
          </div>

          <div className={s.pf}>
            <p className={s.pfK}>가능 항목</p>
            <ul>
              {application.items.filter((item) => item.isAvailable).map((item) => (
                <li key={item.specItemId}>{label(item.specItemId)}</li>
              ))}
            </ul>
            {application.items.every((item) => !item.isAvailable) && <p>가능 항목이 없습니다.</p>}
          </div>

          {application.items.some((item) => !item.isAvailable) && (
            <div className={`${s.pf} ${s.pfNone}`}>
              <p className={s.pfK}>불가 항목</p>
              <ul>
                {application.items.filter((item) => !item.isAvailable).map((item) => (
                  <li key={item.specItemId}>{label(item.specItemId)}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={s.pf}>
            <p className={s.pfK}>질문</p>
            {application.questions.length > 0 ? (
              <ul>
                {application.questions.map((question, index) => (
                  <li key={index}>{question.text}</li>
                ))}
              </ul>
            ) : (
              <p>질문이 없습니다.</p>
            )}
          </div>

          {chatError && <p role="alert">{chatError}</p>}
          {rejectError && <p role="alert">{rejectError}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button variant="tint" onClick={() => void openChat()} disabled={chatBusy}>
              {chatBusy ? '여는 중' : '문의 채팅'}
            </Button>
            {canReject && (
              <Button variant="warn" onClick={() => setConfirming(true)} disabled={rejecting}>
                {rejecting ? '거절 중' : '지원 거절'}
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>닫기</Button>
          </div>

          {confirming && (
            <ConfirmDialog
              title="이 지원을 거절할까요?"
              confirmLabel="거절하기"
              danger
              onConfirm={() => void reject()}
              onCancel={() => setConfirming(false)}
            >
              <p>거절하면 되돌릴 수 없습니다. 지원자에게 직접 거절 알림이 가고, 이 지원의 채팅은 읽기 전용으로 바뀝니다.</p>
            </ConfirmDialog>
          )}
        </div>
      )}
    </section>
  );
}

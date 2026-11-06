/* 공급자 견적 작성·지원 제출 — A 상세의 specItemId만 사용하고 새 ID를 만들지 않는다. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ApplicationRevisionDto, SubmitApplicationRequestDto } from '@majayong/types/api';
import type { SupplierProjectDetail } from '@majayong/types';
import { LoadingState, Button, MaskedText } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { fee, formatWon } from '@/lib/format';
import { projectDetailToScreen } from '@/lib/project-adapter';

const MSG_MAX = 1000;

type State = 'loading' | 'success' | 'auth-error' | 'nda' | 'error';

function wonOf(text: string): number {
  return Number(text.replace(/[^\d]/g, ''));
}

function wonText(amount: number): string {
  return amount > 0 ? amount.toLocaleString('ko-KR') : '';
}

export function LiveQuoteWrite({ pid, styles }: { pid?: string; styles: Record<string, string> }) {
  const s = styles;
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<State>('loading');
  const [detail, setDetail] = useState<SupplierProjectDetail | null>(null);
  const [okById, setOkById] = useState<Record<string, boolean>>({});
  const [amountText, setAmountText] = useState('');
  const [daysText, setDaysText] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplicationRevisionDto | null>(null);

  useEffect(() => {
    if (!pid) return;
    const controller = new AbortController();
    setState('loading');
    apiRequest('getSupplierProjectDetail', `/projects/${encodeURIComponent(pid)}`, {
      accessToken: apiAccessToken,
      signal: controller.signal,
    }).then((response) => {
      const screen = projectDetailToScreen(response.data);
      setDetail(screen);
      setOkById(Object.fromEntries(screen.items.map((item) => [item.specItemId, true])));
      setState('success');
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (error instanceof ApiRequestError && error.status === 403 && error.code === 'SUPPLIER_NDA_REQUIRED') {
        setState('nda');
      } else {
        setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
      }
    });
    return () => controller.abort();
  }, [pid, apiAccessToken]);

  const amount = wonOf(amountText);
  const days = wonOf(daysText);
  const items = detail?.items ?? [];
  const available = items.filter((item) => okById[item.specItemId] !== false);
  const canSubmit = available.length > 0 && amount > 0 && days > 0 && !submitting;

  async function submit() {
    if (!pid || !detail || submitting) return;
    const [first, ...rest] = detail.items.map((item) => ({
      specItemId: item.specItemId,
      isAvailable: okById[item.specItemId] !== false,
    }));
    if (first === undefined) {
      setSubmitError('지원할 항목이 없습니다.');
      return;
    }
    if (amount <= 0 || days <= 0) {
      setSubmitError('총액과 기간을 입력해 주세요.');
      return;
    }
    const payload: SubmitApplicationRequestDto = {
      totalAmount: amount,
      durationDays: days,
      items: [first, ...rest],
      ...(message.trim() ? { message: message.trim() } : {}),
    };
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await apiRequest('submitApplication', `/projects/${encodeURIComponent(pid)}/applications`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: payload,
      });
      setResult(response.data);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setState('auth-error');
      } else if (error instanceof ApiRequestError && error.status === 403 && error.code === 'DETAIL_VIEW_REQUIRED') {
        setSubmitError('명세 상세를 먼저 열람해야 지원할 수 있습니다. 프로젝트 상세에서 다시 열어 주세요.');
      } else if (error instanceof ApiRequestError && error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError('지원을 제출하지 못했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!pid) return <div className={s.page}><p role="alert" style={{ padding: 24 }}>프로젝트를 찾을 수 없습니다.</p></div>;

  if (result !== null) {
    return (
      <div className={s.page} data-screen="QuoteWrite-Supplier-Live">
        <div className={s.card} style={{ padding: 24 }}>
          <h1 className={s.title}>지원이 접수되었습니다</h1>
          <p className={s.sub}>총액 {formatWon(result.totalAmount)} · {result.durationDays}일 · 가능 항목 {result.items.filter((item) => item.isAvailable).length}개</p>
          <p className={s.sd}>의뢰인이 지원서를 확인한 뒤 문의 채팅을 열 수 있습니다.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="primary" to={`/s/projects/${encodeURIComponent(pid)}`}>프로젝트로 돌아가기</Button>
            <Button variant="ghost" to="/s/applications">내 지원 내역</Button>
          </div>
        </div>
      </div>
    );
  }

  if (state !== 'success' || detail === null) {
    return (
      <div className={s.page}>
        {state === 'loading' && <LoadingState title="견적 작성" label="프로젝트를 불러오는 중입니다." />}
        {state === 'nda' && (
          <p role="status" style={{ padding: 24 }}>
            명세 상세를 먼저 열람해야 지원할 수 있습니다.{' '}
            <Link to={`/s/projects/${encodeURIComponent(pid)}`}>프로젝트 상세로 이동</Link>
          </p>
        )}
        {state === 'auth-error' && <p role="alert" style={{ padding: 24 }}>API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.</p>}
        {state === 'error' && <p role="alert" style={{ padding: 24 }}>프로젝트를 불러오지 못했습니다.</p>}
      </div>
    );
  }

  return (
    <div className={s.page} data-screen="QuoteWrite-Supplier-Live">
      <p className={s.crumb}>
        <Link to="/s/projects">프로젝트 찾기</Link>
        {' › '}
        <Link to={`/s/projects/${encodeURIComponent(pid)}`}>{detail.title}</Link>
        {' › '}
        견적 작성
      </p>

      <div className={s.head}>
        <h1 className={s.title}>견적 작성</h1>
        <p className={s.sub}>
          항목마다 할 수 있는지 고르고, 총액과 기간만 적어 주세요.{' '}
          <b>항목별 금액은 받지 않습니다.</b> 총액은 부가세 포함으로 적어 주세요.
        </p>
      </div>

      <div className={s.lay}>
        <div>
          <section className={s.card} aria-labelledby="live-h-it">
            <h2 id="live-h-it">
              항목별 가능 여부
              <span>할 수 있는 항목 {available.length} / {items.length}</span>
            </h2>
            <div className={s.items}>
              {items.map((item) => {
                const ok = okById[item.specItemId] !== false;
                return (
                  <div key={item.specItemId} className={`${s.ir} ${ok ? '' : s.irDis}`} data-spec-item-id={item.specItemId}>
                    <div style={{ minWidth: 0 }}>
                      <div className={s.nm}>{item.title}</div>
                      <div className={s.ds}>{item.description}</div>
                      {ok ? (
                        item.conditions.length > 0 && (
                          <div className={s.cd}>
                            공급자와 정할 것 · <b>{item.conditions.map((condition) => condition.text).join(' / ')}</b>
                          </div>
                        )
                      ) : (
                        <div className={s.ex}>이 항목은 계약 범위에 들어가지 않습니다</div>
                      )}
                    </div>
                    <span className={s.tg} role="group" aria-label={`${item.title} 가능 여부`}>
                      <button
                        type="button"
                        className={`${s.tgBtn} ${ok ? s.tgOn : ''}`}
                        aria-pressed={ok}
                        onClick={() => setOkById((current) => ({ ...current, [item.specItemId]: true }))}
                      >
                        가능
                      </button>
                      <button
                        type="button"
                        className={`${s.tgBtn} ${!ok ? s.tgNo : ''}`}
                        aria-pressed={!ok}
                        onClick={() => setOkById((current) => ({ ...current, [item.specItemId]: false }))}
                      >
                        불가
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
            {available.length === 0 && <p className={s.awarn}>가능한 항목을 1개 이상 골라 주세요.</p>}
          </section>

          <section className={s.card} aria-labelledby="live-h-amt">
            <h2 id="live-h-amt">총액과 기간</h2>
            <div className={s.two}>
              <div className={s.field}>
                <label htmlFor="live-amt">총액</label>
                <div className={s.money}>
                  <input
                    id="live-amt"
                    type="text"
                    inputMode="numeric"
                    value={amountText}
                    placeholder="0"
                    onChange={(event) => setAmountText(wonText(wonOf(event.target.value)))}
                    aria-label="총액"
                  />
                  <span className={s.u}>원</span>
                </div>
                {amount > 0 && (
                  <div className={s.netBox}>
                    수수료 5% −{formatWon(fee(amount))}
                    <br />
                    예상 수령액 <b>{formatWon(amount - fee(amount))}</b>
                  </div>
                )}
              </div>
              <div className={s.field}>
                <label htmlFor="live-days">기간</label>
                <div className={s.money}>
                  <input
                    id="live-days"
                    type="text"
                    inputMode="numeric"
                    value={daysText}
                    placeholder="0"
                    onChange={(event) => setDaysText(event.target.value.replace(/[^\d]/g, ''))}
                    aria-label="기간"
                  />
                  <span className={s.u}>일</span>
                </div>
              </div>
            </div>
          </section>

          <section className={s.card} aria-labelledby="live-h-msg">
            <h2 id="live-h-msg">지원 메시지</h2>
            <textarea
              className={s.msg}
              value={message}
              maxLength={MSG_MAX}
              onChange={(event) => setMessage(event.target.value)}
              aria-label="지원 메시지"
            />
            <p className={s.cnt}>{message.length} / {MSG_MAX}자</p>
            <p className={s.sd}>
              <MaskedText text={message} />
            </p>
          </section>
        </div>

        <aside className={s.rail}>
          <section className={s.sumc} aria-labelledby="live-h-sum">
            <h3 id="live-h-sum">지원 요약</h3>
            <div className={s.sr}><span>총액</span><b>{amount > 0 ? formatWon(amount) : '—'}</b></div>
            <div className={s.sr}><span>가능 항목</span><b>{available.length} / {items.length}</b></div>
            <div className={`${s.sr} ${s.srTot}`}><span>기간</span><b>{days > 0 ? `${days}일` : '—'}</b></div>
            {submitError && <p role="alert" className={s.why}>{submitError}</p>}
            <Button
              variant="primary"
              full
              onClick={() => void submit()}
              disabled={!canSubmit}
              disabledReason={available.length === 0 ? '가능한 항목을 1개 이상 골라 주세요.' : '총액과 기간을 입력해 주세요.'}
            >
              {submitting ? '제출 중' : '지원 제출'}
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

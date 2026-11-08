/* 보류된 결제 — 보드 Admin-Payments · /admin/payments · M6
 * 실제: GET /admin/deposits/held, POST /admin/deposits/{depositId}/resolve
 * 시연(?mock=, 개발 전용): 목록 / 금액 불일치 / 확정
 * F-27 · 11절. 선택 결제는 ?id=. */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AdminHeldDepositDecision, AdminHeldDepositDto } from '@majayong/types/api';
import {
  Band,
  Button,
  EmptyState,
  LoadingState,
  Money,
  StatusChip,
  TextAreaField,
  TextField,
} from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { DEMO_DATA_ENABLED } from '@/lib/feature-flags';
import {
  DEMO,
  defaultIdOf,
  listFor,
  payOf,
  resolvePayMock,
  type PayMock,
} from './Admin-Payments.data';
import s from './Admin-Payments.module.css';

const LIVE = {
  sub: '결제사 확인이 늦거나 금액이 맞지 않아 예치 완료로 바꾸지 않고 멈춘 결제입니다. 결제 건 키로 결제사에 다시 조회해 확정하거나, 결제를 취소합니다.',
  loading: '보류된 결제를 불러오는 중입니다.',
  loadError: '보류된 결제를 불러오지 못했습니다. 다시 시도해 주세요.',
  retry: '다시 불러오기',
  empty: '보류된 결제가 없습니다',
  emptyBody: '결과 통지가 늦거나 금액이 맞지 않는 결제가 생기면 여기에 표시됩니다.',
  heldStatus: '판정 필요',
  heldBand: '예치 완료로 바꾸지 않고 멈춘 결제입니다',
  noHeldReason: '보류 사유 기록 없음',
  paymentKeyLabel: '결제 건 키(paymentKey)',
  paymentKeyHint: '확정할 때 서버가 이 키로 결제사에 다시 조회해 금액을 확인합니다. 취소에는 필요 없습니다.',
  paymentKeyNeed: '확정하려면 결제 건 키를 적어 주세요',
  missingData:
    '결제사 기록 비교 · 결제 시각 · 결제 수단 · 의뢰인/공급자 이름은 현재 서버 응답에 없어 보여 주지 않습니다.',
  saving: '저장 중',
  saveError: '처리를 저장하지 못했습니다. 다시 시도해 주세요.',
} as const;

const RESULT_TEXT: Record<AdminHeldDepositDecision, { title: string; body: string }> = {
  OPERATOR_CONFIRMED: {
    title: '예치 완료로 확정했습니다',
    body: '결제사 재조회로 금액을 확인했습니다. 의뢰인 · 공급자 화면이 예치 완료로 바뀝니다.',
  },
  OPERATOR_VOIDED: {
    title: '결제를 취소했습니다',
    body: '이 예치 건은 실패로 닫혔습니다. 예치 기한 안이면 의뢰인이 다시 결제할 수 있습니다.',
  },
};

function shortId(id: string): string {
  return id.length > 8 ? `…${id.slice(-6)}` : id;
}

export default function AdminPayments() {
  const [params] = useSearchParams();
  if (DEMO_DATA_ENABLED && params.has('mock')) return <AdminPaymentsDemo />;
  return <AdminPaymentsLive />;
}

function AdminPaymentsLive() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [rows, setRows] = useState<AdminHeldDepositDto[]>([]);
  const [paymentKey, setPaymentKey] = useState('');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState<AdminHeldDepositDecision | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    decision: AdminHeldDepositDecision;
    deposit: AdminHeldDepositDto;
  } | null>(null);

  const load = (signal?: AbortSignal) => {
    setState('loading');
    return apiRequest('listHeldDeposits', '/admin/deposits/held', { accessToken: apiAccessToken, signal })
      .then((response) => {
        setRows(response.data.filter((row) => row.status === 'HELD'));
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setState('error');
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
    // apiAccessToken이 바뀔 때만 다시 읽는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiAccessToken]);

  const selected = rows.find((row) => row.id === params.get('id')) ?? rows[0] ?? null;

  useEffect(() => {
    setPaymentKey('');
    setReason('');
    setTried(null);
    setError(null);
  }, [selected?.id]);

  const select = (id: string) => {
    setResult(null);
    navigate(`/admin/payments?id=${encodeURIComponent(id)}`);
  };

  const reasonOk = reason.trim().length > 0;
  const keyOk = paymentKey.trim().length > 0;

  const resolve = async (decision: AdminHeldDepositDecision) => {
    if (!selected) return;
    setTried(decision);
    setError(null);
    if (!reasonOk || (decision === 'OPERATOR_CONFIRMED' && !keyOk)) return;
    setBusy(true);
    try {
      const response = await apiRequest(
        'resolveHeldDeposit',
        `/admin/deposits/${encodeURIComponent(selected.id)}/resolve`,
        {
          method: 'POST',
          accessToken: apiAccessToken,
          jsonBody:
            decision === 'OPERATOR_CONFIRMED'
              ? { decision, reason: reason.trim(), paymentKey: paymentKey.trim() }
              : { decision, reason: reason.trim() },
        },
      );
      setResult({ decision, deposit: response.data });
      await load();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : LIVE.saveError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.page} data-screen="Admin-Payments">
      <header className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{LIVE.sub}</p>
      </header>

      {result ? (
        <div className={s.bandWrap} role="status">
          <Band
            tone={result.decision === 'OPERATOR_CONFIRMED' ? 'done' : 'warn'}
            title={RESULT_TEXT[result.decision].title}
          >
            예치 건 {result.deposit.id} · 계약 {result.deposit.contractId} ·{' '}
            <Money amount={result.deposit.amount} /> · {RESULT_TEXT[result.decision].body}
          </Band>
        </div>
      ) : null}

      {state === 'loading' ? <LoadingState label={LIVE.loading} /> : null}
      {state === 'error' ? (
        <div>
          <p role="alert" className={s.note}>
            {LIVE.loadError}
          </p>
          <Button variant="ghost" size="sm" type="button" onClick={() => void load()}>
            {LIVE.retry}
          </Button>
        </div>
      ) : null}
      {state === 'ready' && rows.length === 0 ? (
        <EmptyState title={LIVE.empty}>{LIVE.emptyBody}</EmptyState>
      ) : null}

      {state === 'ready' && selected ? (
        <div className={s.grid}>
          <section className={s.list} aria-label={DEMO.listLabel}>
            <ul className={s.rows}>
              {rows.map((row) => {
                const on = row.id === selected.id;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      className={`${s.row} ${on ? s.rowOn : ''}`}
                      aria-current={on ? 'true' : undefined}
                      onClick={() => select(row.id)}
                    >
                      <div className={s.rowTop}>
                        <StatusChip status={LIVE.heldStatus} />
                      </div>
                      <span className={s.rowName}>
                        계약 {shortId(row.contractId)} · <Money amount={row.amount} />
                      </span>
                      <span className={s.rowMeta}>{row.heldReason || LIVE.noHeldReason}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className={s.detail} aria-label={DEMO.detailLabel}>
            <div className={s.detailHead}>
              <div>
                <h2 className={s.detailTitle}>
                  계약 {shortId(selected.contractId)} · 예치 <Money amount={selected.amount} />
                </h2>
                <p className={s.detailMeta}>
                  예치 건 {selected.id} · 계약 {selected.contractId}
                </p>
              </div>
              <StatusChip status={LIVE.heldStatus} />
            </div>

            <div className={s.bandWrap}>
              <Band tone="wait" title={LIVE.heldBand}>
                {selected.heldReason || LIVE.noHeldReason}
              </Band>
            </div>

            <div className={s.who}>
              <div>
                <span>{DEMO.escrowLabel}</span>
                <Money amount={selected.amount} />
              </div>
            </div>
            <p className={s.note}>{LIVE.missingData}</p>

            <div className={s.act}>
              <TextField
                label={LIVE.paymentKeyLabel}
                value={paymentKey}
                onChange={(e) => setPaymentKey(e.target.value)}
                hint={LIVE.paymentKeyHint}
                error={tried === 'OPERATOR_CONFIRMED' && !keyOk ? LIVE.paymentKeyNeed : undefined}
                autoComplete="off"
              />
              <TextAreaField
                label={DEMO.reasonLabel}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                error={tried && !reasonOk ? DEMO.reasonNeed : undefined}
              />
              {error ? (
                <p role="alert" className={s.blockWhy}>
                  {error}
                </p>
              ) : null}
              <div className={s.actRow}>
                <p className={s.eventNote}>{DEMO.eventNote}</p>
                <div className={s.btns}>
                  <Button
                    variant="warn"
                    size="sm"
                    type="button"
                    disabled={!reasonOk || busy}
                    disabledReason={busy ? LIVE.saving : !reasonOk ? DEMO.reasonNeed : undefined}
                    onClick={() => void resolve('OPERATOR_VOIDED')}
                  >
                    {DEMO.cancel}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    disabled={!reasonOk || !keyOk || busy}
                    disabledReason={
                      busy
                        ? LIVE.saving
                        : !reasonOk
                          ? DEMO.reasonNeed
                          : !keyOk
                            ? LIVE.paymentKeyNeed
                            : undefined
                    }
                    onClick={() => void resolve('OPERATOR_CONFIRMED')}
                  >
                    {busy ? LIVE.saving : DEMO.confirm}
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function AdminPaymentsDemo() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolvePayMock(params.get('mock'));
  const selectedId = params.get('id') ?? defaultIdOf(mock);
  const pay = payOf(selectedId);
  const rows = listFor(mock);

  const [reason, setReason] = useState(pay.why);

  useEffect(() => {
    setReason(payOf(params.get('id') ?? defaultIdOf(mock)).why);
  }, [mock, params]);

  const go = (next: PayMock, id = selectedId) => {
    const q = new URLSearchParams();
    q.set('mock', next);
    q.set('id', id);
    navigate(`/admin/payments?${q.toString()}`, { replace: true });
  };

  const select = (id: string) => {
    if (id === 'pay-done') go('확정', id);
    else if (id === 'pay-2') go(mock === '목록' ? '금액 불일치' : mock, id);
    else go(mock === '확정' ? '목록' : mock === '금액 불일치' ? '목록' : mock, id);
  };

  const reasonOk = reason.trim().length > 0;
  const confirmDisabled = !reasonOk || !pay.canConfirm;
  const confirmWhy = !reasonOk
    ? DEMO.reasonNeed
    : !pay.canConfirm
      ? pay.confirmBlockWhy
      : undefined;

  return (
    <div className={s.page} data-screen="Admin-Payments">
      <header className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
      </header>

      <div className={s.grid}>
        <section className={s.list} aria-label={DEMO.listLabel}>
          <ul className={s.rows}>
            {rows.map((row) => {
              const on = row.id === pay.id;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    className={`${s.row} ${on ? s.rowOn : ''} ${row.done ? s.rowDone : ''}`}
                    aria-current={on ? 'true' : undefined}
                    onClick={() => select(row.id)}
                  >
                    <div className={s.rowTop}>
                      <StatusChip status={row.status} />
                      <span className={s.rowElapsed}>{row.elapsed}</span>
                    </div>
                    <span className={s.rowName}>
                      {row.contract} · <Money amount={row.amount} />
                    </span>
                    <span className={s.rowMeta}>
                      {row.holdReason}
                      {row.done ? ` · 운영자 김하늘` : ` · 공급자 ${row.supplier}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className={s.detail} aria-label={DEMO.detailLabel}>
          <div className={s.detailHead}>
            <div>
              <h2 className={s.detailTitle}>
                {pay.contract} · 예치 <Money amount={pay.amount} />
              </h2>
              <p className={s.detailMeta}>{pay.meta}</p>
            </div>
            <StatusChip status={pay.status} />
          </div>

          <div className={s.bandWrap}>
            <Band tone={pay.bandTone} title={pay.bandTitle}>
              {pay.bandBody}
            </Band>
          </div>

          <div className={s.split}>
            <div>
              <p className={s.k}>요청 금액과 결제사 기록</p>
              <div className={s.moneyRow}>
                <div className={s.moneyCard}>
                  <span className={s.moneyLabel}>{DEMO.escrowLabel}</span>
                  <span className={s.moneyVal}>
                    <Money amount={pay.escrowAmount} size="row" />
                  </span>
                </div>
                <div className={s.moneyCard}>
                  <span className={s.moneyLabel}>{DEMO.pgLabel}</span>
                  <span className={s.moneyVal}>
                    <Money amount={pay.pgAmount} size="row" />
                  </span>
                </div>
              </div>
              {pay.diffAmount > 0 ? (
                <div className={`${s.moneyCard} ${s.moneyCardDiff}`}>
                  <span className={s.moneyLabel}>{DEMO.diffLabel}</span>
                  <span className={s.moneyVal}>
                    <Money amount={pay.diffAmount} />
                  </span>
                </div>
              ) : null}

              <table className={s.cmp}>
                <thead>
                  <tr>
                    <th />
                    <th className={s.cmpNum}>우리 요청</th>
                    <th className={s.cmpNum}>결제사 기록</th>
                  </tr>
                </thead>
                <tbody>
                  {pay.cmp.map((c) => (
                    <tr key={c.k} className={c.diff ? s.cmpDiff : undefined}>
                      <td className={s.cmpKey}>{c.k}</td>
                      <td className={s.cmpNum}>{c.a}</td>
                      <td className={s.cmpNum}>{c.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={s.who}>
                <div>
                  <span>계약</span>
                  {pay.contract}
                </div>
                <div>
                  <span>의뢰인</span>
                  {pay.client}
                </div>
                <div>
                  <span>공급자</span>
                  {pay.supplier}
                </div>
                <div>
                  <span>결제 수단</span>
                  {pay.method}
                </div>
              </div>

              <p className={s.k} style={{ marginTop: 14 }}>
                중복 방지 키
              </p>
              <div className={s.key}>{pay.key}</div>
              <p className={s.keyn}>
                결제사가 중복 방지 키를 주지 않아 입금 건 식별자 · 금액 · 요청 시각으로 만들었습니다. 같은
                키로는 예치가 두 번 잡히지 않습니다.
              </p>
            </div>

            <div>
              <p className={s.k}>시각</p>
              <ol className={s.flow}>
                {pay.flow.map((f) => (
                  <li key={f.b} className={f.now ? s.flowNow : undefined}>
                    <b>{f.b}</b>
                    {f.s}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {!pay.done ? (
            <div className={s.act}>
              <TextAreaField
                label={DEMO.reasonLabel}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className={s.actRow}>
                <p className={s.eventNote}>{DEMO.eventNote}</p>
                <div className={s.btns}>
                  <Button variant="ghost" size="sm" type="button">
                    {DEMO.requery}
                  </Button>
                  <Button
                    variant="warn"
                    size="sm"
                    type="button"
                    disabled={!reasonOk}
                    disabledReason={!reasonOk ? DEMO.reasonNeed : undefined}
                  >
                    {DEMO.cancel}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    disabled={confirmDisabled}
                    disabledReason={confirmWhy}
                    onClick={() => go('확정', 'pay-done')}
                  >
                    {DEMO.confirm}
                  </Button>
                </div>
              </div>
              {!pay.canConfirm && pay.confirmBlockWhy ? (
                <p className={s.blockWhy}>{pay.confirmBlockWhy}</p>
              ) : null}
            </div>
          ) : (
            <>
              <p className={s.k} style={{ marginTop: 18 }}>
                이벤트 기록
              </p>
              <div className={s.eventBox}>{pay.eventLog}</div>
            </>
          )}

          <p className={s.note}>{pay.note}</p>
        </aside>
      </div>
    </div>
  );
}

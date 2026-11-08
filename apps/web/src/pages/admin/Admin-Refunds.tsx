/* 환불 처리 — 보드 Admin-Refunds · /admin/refunds · M6
 * 실제: GET /admin/contracts/cancellation-queue,
 *       POST /admin/contracts/{contractId}/cancellation/decide,
 *       POST /admin/contracts/{contractId}/settlement/mark-processed
 * 시연(?mock=, 개발 전용): 처리 대기 / 사유 다툼 판정 / 처리 완료
 * F-27 · F-26 · 13.2. 선택은 ?id=. */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AdminCancellationContractDto, ApiCancelCause } from '@majayong/types/api';
import {
  Band,
  Button,
  Chip,
  ConfirmCheck,
  EmptyState,
  LoadingState,
  Money,
  SelectCards,
  StatusChip,
  TextAreaField,
  TextField,
} from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { DEMO_DATA_ENABLED } from '@/lib/feature-flags';
import { formatDateTime } from '@/lib/format';
import {
  DEMO,
  JUDGE_REASON_DEMO,
  defaultIdOf,
  listFor,
  refundOf,
  resolveRefundMock,
  type RefundMock,
} from './Admin-Refunds.data';
import s from './Admin-Refunds.module.css';

const JUDGE_OPTIONS = [
  {
    key: 'client',
    label: (
      <span>
        <b>의뢰인 사정</b>
        <span>진행 중 구간의 일부를 공급자에게 보상</span>
      </span>
    ),
  },
  {
    key: 'supplier',
    label: (
      <span>
        <b>공급자 사정</b>
        <span>지급되지 않은 구간을 의뢰인에게 전액 환불</span>
      </span>
    ),
  },
];

const LIVE = {
  loading: '취소 대기 계약을 불러오는 중입니다.',
  loadError: '환불 목록을 불러오지 못했습니다. 다시 시도해 주세요.',
  retry: '다시 불러오기',
  empty: '처리할 취소 요청이 없습니다',
  emptyBody: '예치 후 취소를 요청한 계약이 생기면 여기에 표시됩니다.',
  rateLabel: '공급자 보상 비율(%)',
  rateNeed: '0~100 사이의 정수를 적어 주세요',
  clientRateHint:
    '의뢰인 사정 취소는 50% 이상이어야 합니다. 예치 24시간 안 · 중간 구간 검수 전이면 서버가 전액 환불로 계산합니다.',
  rateHint: '진행 중 구간 금액에 이 비율을 곱해 공급자 보상을 계산합니다. 공급자 사정이면 보상은 없습니다.',
  waiting:
    '상대 응답을 기다리는 중입니다. 이의가 들어오거나 3일 동안 응답이 없어야 운영자가 판정할 수 있습니다.',
  settleBefore: '환불 · 보상 금액은 판정을 저장하면 서버가 계산해 여기에 보여 줍니다.',
  missingData: '양쪽 주장 · 근거 메시지 · 계약 제목 · 당사자 이름은 현재 서버 응답에 없어 보여 주지 않습니다.',
  processTitle: '환불 · 지급 처리',
  processHint: '실제 환불 · 이체를 마친 뒤 표시합니다. 이 화면은 돈을 보내지 않습니다.',
  refundedCheck: '의뢰인 환불을 처리했습니다',
  payoutCheck: '공급자 보상 지급을 처리했습니다',
  processReason: '처리 메모',
  processNeed: '처리한 일을 하나 이상 고르고 메모를 적어 주세요',
  processConfirm: '처리 완료로 표시',
  decided: '판정을 저장했습니다',
  processed: '정산 처리를 표시했습니다',
  saving: '저장 중',
  saveError: '처리를 저장하지 못했습니다. 다시 시도해 주세요.',
  queueGone: '판정한 계약은 서버 취소 대기 목록에서 빠지므로, 다시 불러오면 이 목록에 보이지 않습니다.',
} as const;

const CAUSE_LABEL: Record<ApiCancelCause, string> = {
  CLIENT: '의뢰인 사정',
  SUPPLIER: '공급자 사정',
  MUTUAL: '서로 합의',
};

const INSTALLMENT_LABEL: Record<string, string> = {
  PENDING: '작업 중',
  DELIVERED: '검수 대기',
  REWORK_REQUESTED: '보완 요청',
  APPROVED: '승인',
  RELEASED: '지급 완료',
  REFUNDED: '환불',
};

function causeLabel(cause: AdminCancellationContractDto['cancelCause']): string {
  return cause ? CAUSE_LABEL[cause] : '사유 기록 없음';
}

function canDecide(row: AdminCancellationContractDto): boolean {
  return Boolean(row.cancelEscalatedAt) || (row.objectionRate !== null && row.objectionRate !== undefined);
}

function isDecided(row: AdminCancellationContractDto): boolean {
  return row.cancelResolution === 'ADMIN_DECIDED' || Boolean(row.cancelResolvedAt);
}

function isProcessed(row: AdminCancellationContractDto): boolean {
  return Boolean(row.refundedAt) && Boolean(row.cancelPayoutAt);
}

function statusOf(row: AdminCancellationContractDto): string {
  if (isProcessed(row)) return '처리 완료';
  if (isDecided(row)) return '처리 대기';
  return canDecide(row) ? '판정 필요' : '취소 요청 중';
}

function shortId(id: string): string {
  return id.length > 8 ? `…${id.slice(-6)}` : id;
}

function rateText(rate: number | null | undefined): string {
  return rate === null || rate === undefined ? '—' : `${rate}%`;
}

function parseRate(raw: string): number | null {
  if (!/^\d{1,3}$/.test(raw.trim())) return null;
  const value = Number(raw.trim());
  return value >= 0 && value <= 100 ? value : null;
}

export default function AdminRefunds() {
  const [params] = useSearchParams();
  if (DEMO_DATA_ENABLED && params.has('mock')) return <AdminRefundsDemo />;
  return <AdminRefundsLive />;
}

function AdminRefundsLive() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [rows, setRows] = useState<AdminCancellationContractDto[]>([]);
  const [rate, setRate] = useState('');
  const [reason, setReason] = useState('');
  const [refunded, setRefunded] = useState(false);
  const [payout, setPayout] = useState(false);
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = (signal?: AbortSignal) => {
    setState('loading');
    return apiRequest('listCancellationQueue', '/admin/contracts/cancellation-queue', {
      accessToken: apiAccessToken,
      signal,
    })
      .then((response) => {
        setRows(response.data);
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
    setRate('');
    setReason('');
    setRefunded(false);
    setPayout(false);
    setMemo('');
    setError(null);
    setNotice(null);
  }, [selected?.id]);

  const select = (id: string) => {
    navigate(`/admin/refunds?id=${encodeURIComponent(id)}`);
  };

  const replaceRow = (next: AdminCancellationContractDto) => {
    setRows((current) => current.map((row) => (row.id === next.id ? { ...row, ...next } : row)));
  };

  const parsedRate = parseRate(rate);
  const decideOk = parsedRate !== null && reason.trim().length > 0;
  const processOk = (refunded || payout) && memo.trim().length > 0;

  const decide = async () => {
    if (!selected || parsedRate === null || !reason.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await apiRequest(
        'decideCancellation',
        `/admin/contracts/${encodeURIComponent(selected.id)}/cancellation/decide`,
        {
          method: 'POST',
          accessToken: apiAccessToken,
          jsonBody: { compensationRate: parsedRate, reason: reason.trim() },
        },
      );
      replaceRow(response.data);
      setNotice(LIVE.decided);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : LIVE.saveError);
    } finally {
      setBusy(false);
    }
  };

  const markProcessed = async () => {
    if (!selected || !processOk) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await apiRequest(
        'markSettlementProcessed',
        `/admin/contracts/${encodeURIComponent(selected.id)}/settlement/mark-processed`,
        {
          method: 'POST',
          accessToken: apiAccessToken,
          jsonBody: { refunded, cancelPayout: payout, reason: memo.trim() },
        },
      );
      replaceRow(response.data);
      setRefunded(false);
      setPayout(false);
      setMemo('');
      setNotice(LIVE.processed);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : LIVE.saveError);
    } finally {
      setBusy(false);
    }
  };

  const decided = selected ? isDecided(selected) : false;
  const processed = selected ? isProcessed(selected) : false;
  const decidable = selected ? canDecide(selected) : false;

  return (
    <div className={s.page} data-screen="Admin-Refunds">
      <header className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
      </header>

      {state === 'loading' ? <LoadingState label={LIVE.loading} /> : null}
      {state === 'error' ? (
        <div>
          <p role="alert" className={s.detailMeta}>
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
          <section aria-label={DEMO.listLabel}>
            <ul className={s.rows}>
              {rows.map((r) => {
                const on = r.id === selected.id;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      className={`${s.row} ${on ? s.rowOn : ''}`}
                      aria-current={on ? 'true' : undefined}
                      onClick={() => select(r.id)}
                    >
                      <div className={s.rowChips}>
                        <Chip tone="outline">{causeLabel(r.cancelCause)}</Chip>
                        <StatusChip status={statusOf(r)} />
                      </div>
                      <span className={s.rowName}>계약 {shortId(r.id)}</span>
                      <span className={s.rowMeta}>
                        {r.cancelRequestedAt ? `취소 요청 ${formatDateTime(r.cancelRequestedAt)} · ` : ''}
                        예치 <Money amount={r.totalDeposited} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className={s.detail} aria-label={DEMO.detailLabel}>
            {processed ? (
              <div className={s.bandWrap}>
                <Band tone="done" title="정산 처리를 마쳤습니다">
                  환불 처리 {formatDateTime(selected.refundedAt!)} · 보상 지급 처리{' '}
                  {formatDateTime(selected.cancelPayoutAt!)}
                </Band>
              </div>
            ) : decided ? (
              <div className={s.bandWrap}>
                <Band tone="wait" title="판정을 저장했습니다 — 환불 · 지급 처리가 남았습니다">
                  {selected.cancelResolvedAt ? `판정 ${formatDateTime(selected.cancelResolvedAt)} · ` : ''}
                  {LIVE.queueGone}
                </Band>
              </div>
            ) : null}

            <div className={s.detailHead}>
              <div className={s.detailChips}>
                <Chip tone="outline">{causeLabel(selected.cancelCause)}</Chip>
                <StatusChip status={statusOf(selected)} />
              </div>
              <h2 className={s.detailTitle}>계약 {selected.id}</h2>
              <p className={s.detailMeta}>
                합의 <Money amount={selected.agreedAmount} /> · 의뢰인 수수료 <Money amount={selected.clientFee} /> ·
                예치 <Money amount={selected.totalDeposited} />
                {selected.depositedAt ? ` · ${formatDateTime(selected.depositedAt)} 예치` : ''}
              </p>
            </div>

            <div className={s.sec}>
              <p className={s.k}>{DEMO.cancelTitle}</p>
              <p className={s.detailMeta}>
                {causeLabel(selected.cancelCause)}
                {selected.cancelRequestedAt ? ` · 요청 ${formatDateTime(selected.cancelRequestedAt)}` : ''}
                {selected.cancelEscalatedAt
                  ? ` · 운영자 판정 대기 ${formatDateTime(selected.cancelEscalatedAt)}부터`
                  : ''}
              </p>
            </div>

            <div className={s.sec}>
              <p className={s.k}>보상 비율</p>
              <div className={s.settle}>
                <div className={s.settleRow}>
                  <span className={s.settleK}>
                    {decided ? '확정 보상 비율' : '요청한 보상 비율'}
                  </span>
                  <span className={s.settleV}>{rateText(selected.compensationRate)}</span>
                </div>
                <div className={s.settleRow}>
                  <span className={s.settleK}>공급자 이의 비율</span>
                  <span className={s.settleV}>{rateText(selected.objectionRate)}</span>
                </div>
              </div>
            </div>

            {selected.installmentStatuses && selected.installmentStatuses.length > 0 ? (
              <div className={s.sec}>
                <p className={s.k}>구간 상태</p>
                <p className={s.detailMeta}>
                  {selected.installmentStatuses
                    .map((status, index) => `${index + 1}구간 ${INSTALLMENT_LABEL[status] ?? status}`)
                    .join(' · ')}
                </p>
              </div>
            ) : null}

            <div className={s.sec}>
              <p className={s.k}>{DEMO.settleTitle}</p>
              {selected.refundAmount !== null && selected.refundAmount !== undefined ? (
                <div className={s.settle}>
                  <div className={`${s.settleRow} ${s.settleTot}`}>
                    <span className={s.settleK}>
                      의뢰인 환불<i>결제한 수단으로</i>
                    </span>
                    <span className={s.settleV}>
                      <Money amount={selected.refundAmount} />
                    </span>
                  </div>
                  {selected.clientFeeRefund !== null && selected.clientFeeRefund !== undefined ? (
                    <div className={s.settleRow}>
                      <span className={s.settleK}>
                        의뢰인 수수료 환불<i>결제한 수단으로</i>
                      </span>
                      <span className={s.settleV}>
                        <Money amount={selected.clientFeeRefund} />
                      </span>
                    </div>
                  ) : null}
                  {selected.settledAmount !== null && selected.settledAmount !== undefined ? (
                    <div className={`${s.settleRow} ${s.settleTot}`}>
                      <span className={s.settleK}>
                        공급자 보상<i>수수료를 뺀 금액 · 정산 계좌로</i>
                      </span>
                      <span className={s.settleV}>
                        <Money amount={selected.settledAmount} />
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className={s.detailMeta}>{LIVE.settleBefore}</p>
              )}
            </div>

            <p className={s.eventNote}>{LIVE.missingData}</p>

            {notice ? (
              <p role="status" className={s.detailMeta}>
                {notice}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className={s.detailMeta}>
                {error}
              </p>
            ) : null}

            {!decided ? (
              <>
                <div className={s.sec}>
                  <p className={s.k}>{DEMO.judgeLabel}</p>
                  {!decidable ? <p className={s.detailMeta}>{LIVE.waiting}</p> : null}
                  <TextField
                    label={LIVE.rateLabel}
                    required
                    inputMode="numeric"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    hint={selected.cancelCause === 'CLIENT' ? LIVE.clientRateHint : LIVE.rateHint}
                    error={rate.trim() && parsedRate === null ? LIVE.rateNeed : undefined}
                    disabled={!decidable}
                  />
                  <TextAreaField
                    label={DEMO.reasonLabel}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={!decidable}
                  />
                </div>
                <div className={s.foot}>
                  <p className={s.eventNote}>{DEMO.eventNote}</p>
                  <Button
                    variant="primary"
                    type="button"
                    disabled={!decidable || !decideOk || busy}
                    disabledReason={
                      busy
                        ? LIVE.saving
                        : !decidable
                          ? LIVE.waiting
                          : parsedRate === null
                            ? LIVE.rateNeed
                            : !reason.trim()
                              ? DEMO.reasonNeed
                              : undefined
                    }
                    onClick={() => void decide()}
                  >
                    {busy ? LIVE.saving : DEMO.judgeConfirm}
                  </Button>
                </div>
              </>
            ) : null}

            {decided && !processed ? (
              <>
                <div className={s.sec}>
                  <p className={s.k}>{LIVE.processTitle}</p>
                  <p className={s.detailMeta}>{LIVE.processHint}</p>
                  {selected.refundedAt ? (
                    <p className={s.eventNote}>환불 처리 완료 · {formatDateTime(selected.refundedAt)}</p>
                  ) : (
                    <ConfirmCheck checked={refunded} onChange={setRefunded}>
                      {LIVE.refundedCheck}
                    </ConfirmCheck>
                  )}
                  {selected.cancelPayoutAt ? (
                    <p className={s.eventNote}>보상 지급 처리 완료 · {formatDateTime(selected.cancelPayoutAt)}</p>
                  ) : (
                    <ConfirmCheck checked={payout} onChange={setPayout}>
                      {LIVE.payoutCheck}
                    </ConfirmCheck>
                  )}
                  <TextAreaField
                    label={LIVE.processReason}
                    required
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="승인 번호 끝자리 · 이체 확인 번호 끝자리처럼 처리 근거를 적어 주세요."
                  />
                </div>
                <div className={s.foot}>
                  <p className={s.eventNote}>{DEMO.eventNote}</p>
                  <Button
                    variant="primary"
                    type="button"
                    disabled={!processOk || busy}
                    disabledReason={busy ? LIVE.saving : !processOk ? LIVE.processNeed : undefined}
                    onClick={() => void markProcessed()}
                  >
                    {busy ? LIVE.saving : LIVE.processConfirm}
                  </Button>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function AdminRefundsDemo() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveRefundMock(params.get('mock'));
  const selectedId = params.get('id') ?? defaultIdOf(mock);
  const row = refundOf(selectedId);
  const rows = listFor(mock);

  const [judge, setJudge] = useState('client');
  const [reason, setReason] = useState(JUDGE_REASON_DEMO);

  useEffect(() => {
    setJudge('client');
    setReason(JUDGE_REASON_DEMO);
  }, [mock, params]);

  const go = (next: RefundMock, id = selectedId) => {
    const q = new URLSearchParams();
    q.set('mock', next);
    q.set('id', id);
    navigate(`/admin/refunds?${q.toString()}`, { replace: true });
  };

  const select = (id: string) => {
    if (id === 'rf-2') go('사유 다툼 판정', id);
    else if (id === 'rf-done') go('처리 완료', id);
    else go(mock === '사유 다툼 판정' ? '처리 대기' : mock === '처리 완료' ? '처리 대기' : mock, id);
  };

  const judgeOk = reason.trim().length > 0 && !!judge;
  const isJudge = !!row.judge && mock === '사유 다툼 판정';
  const isDone = row.status === '처리 완료';

  return (
    <div className={s.page} data-screen="Admin-Refunds">
      <header className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
      </header>

      <div className={s.grid}>
        <section aria-label={DEMO.listLabel}>
          <ul className={s.rows}>
            {rows.map((r) => {
              const on = r.id === row.id;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className={`${s.row} ${on ? s.rowOn : ''}`}
                    aria-current={on ? 'true' : undefined}
                    onClick={() => select(r.id)}
                  >
                    <div className={s.rowChips}>
                      <Chip tone="outline">{r.reasonChip}</Chip>
                      <StatusChip status={r.status} />
                    </div>
                    <span className={s.rowName}>{r.title}</span>
                    <span className={s.rowMeta}>{r.listMeta}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className={s.detail} aria-label={DEMO.detailLabel}>
          {isDone && row.doneBand ? (
            <div className={s.bandWrap}>
              <Band tone="done" title={row.doneBand.title}>
                {row.doneBand.body}
              </Band>
            </div>
          ) : null}

          <div className={s.detailHead}>
            <div className={s.detailChips}>
              <Chip tone="outline">{row.reasonChip}</Chip>
              <StatusChip status={row.status} />
            </div>
            <h2 className={s.detailTitle}>{row.title}</h2>
            <p className={s.detailMeta}>{row.meta}</p>
          </div>

          <div className={s.sec}>
            <p className={s.k}>{DEMO.cancelTitle}</p>
            <p className={s.detailMeta}>{row.cancelReason}</p>
          </div>

          <div className={s.sec}>
            <p className={s.k}>{DEMO.claimsTitle}</p>
            <div className={s.claims}>
              <div className={s.claim}>
                <p className={s.claimWho}>
                  <b>의뢰인 {row.client}</b>
                </p>
                <p>{row.clientClaim}</p>
              </div>
              <div className={s.claim}>
                <p className={s.claimWho}>
                  <b>공급자 {row.supplier}</b>
                </p>
                <p>{row.supplierClaim}</p>
              </div>
            </div>
          </div>

          <div className={s.sec}>
            <p className={s.k}>{DEMO.settleTitle}</p>
            <div className={s.settle}>
              <div className={`${s.settleRow} ${s.settleTot}`}>
                <span className={s.settleK}>
                  의뢰인 환불<i>결제한 수단으로</i>
                </span>
                <span className={s.settleV}>
                  <Money amount={row.refundAmount} />
                </span>
              </div>
              <div className={`${s.settleRow} ${s.settleTot}`}>
                <span className={s.settleK}>
                  공급자 보상<i>정산 계좌로</i>
                </span>
                <span className={s.settleV}>
                  <Money amount={row.supplierPay} />
                </span>
              </div>
            </div>
          </div>

          {row.timeline.length > 0 ? (
            <div className={s.sec}>
              <p className={s.k}>취소 경위</p>
              <ol className={s.flow}>
                {row.timeline.map((f) => (
                  <li key={f.b} className={f.now ? s.flowNow : undefined}>
                    <b>{f.b}</b>
                    {f.s}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {isJudge ? (
            <>
              {row.evidence ? (
                <div className={s.sec}>
                  <p className={s.k}>근거</p>
                  {row.evidence.map((e) => (
                    <div key={e.k} className={`${s.ev} ${e.dash ? s.evDash : ''}`}>
                      <span className={s.evLabel}>{e.k}</span>
                      {e.v}
                    </div>
                  ))}
                  {row.quotes?.map((q) => (
                    <div key={q.who} className={s.quote}>
                      <i>{q.who}</i>
                      {q.text}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className={s.sec}>
                <p className={s.k}>{DEMO.judgeLabel}</p>
                <div className={s.judgeOpts}>
                  <SelectCards
                    label={DEMO.judgeLabel}
                    options={JUDGE_OPTIONS}
                    value={judge}
                    onChange={setJudge}
                  />
                </div>
                <TextAreaField
                  label={DEMO.reasonLabel}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className={s.foot}>
                <p className={s.eventNote}>{DEMO.eventNote}</p>
                <Button
                  variant="primary"
                  type="button"
                  disabled={!judgeOk}
                  disabledReason={!judgeOk ? DEMO.reasonNeed : undefined}
                  onClick={() => go('처리 대기', 'rf-1')}
                >
                  {DEMO.judgeConfirm}
                </Button>
              </div>
            </>
          ) : null}

          {!isJudge && !isDone && row.tasks.length > 0 ? (
            <>
              <div className={s.sec}>
                <p className={s.k}>처리할 일 {row.tasks.length}건</p>
                {row.tasks.map((t) => (
                  <div key={t.id} className={s.task}>
                    <div className={s.taskTop}>
                      <div>
                        <b>{t.title}</b>
                        <span>{t.detail}</span>
                      </div>
                      <span className={s.taskAmt}>
                        <Money amount={t.amount} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={s.foot}>
                <p className={s.eventNote}>{DEMO.eventNote}</p>
                <Button variant="primary" type="button" onClick={() => go('처리 완료', 'rf-done')}>
                  {DEMO.confirm}
                </Button>
              </div>
            </>
          ) : null}

          {isDone && row.tasks.length > 0 ? (
            <div className={s.sec}>
              <p className={s.k}>처리한 일</p>
              {row.tasks.map((t) => (
                <div key={t.id} className={s.task}>
                  <div className={s.taskTop}>
                    <div>
                      <b>{t.title}</b>
                      <span>{t.detail}</span>
                    </div>
                    <span className={s.taskAmt}>
                      <Money amount={t.amount} />
                    </span>
                  </div>
                  {t.doneAt ? (
                    <p className={s.eventNote}>
                      처리 완료 · {t.doneAt}
                      {t.memo ? ` · ${t.memo}` : ''}
                    </p>
                  ) : null}
                </div>
              ))}
              <p className={s.eventNote}>{DEMO.eventNote}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

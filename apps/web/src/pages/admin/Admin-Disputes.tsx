/* 이견 개입 — 보드 Admin-Disputes · /admin/disputes · M6
 * 운영자만 접근. GET /admin/inspection-requests/escalated,
 * POST /admin/inspection-requests/{id}/decision */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AdminEscalatedInspectionDto, ApiDisputeDecision } from '@majayong/types/api';
import {
  LoadingState,
  Band,
  Button,
  Chip,
  EmptyState,
  SelectCards,
  StatusChip,
  TextAreaField,
} from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import s from './Admin-Disputes.module.css';

const PAGE = {
  title: '이견 개입',
  sub: '같은 항목에 보완 요청이 반복되면 개입합니다. 판단 근거는 계약서에 첨부된 합의 내용의 조건 줄이고, 화면은 근거를 모아 보여 줍니다.',
  listLabel: '이견 목록',
  detailLabel: '이견 상세',
  confirm: '판정 보내기',
  reasonLabel: '판정 사유',
  reasonNeed: '사유를 적어 주세요',
  eventNote: '이 처리는 이벤트 기록에 남습니다',
  resultLabel: '판정 결과',
  loadError: '이견 목록을 불러오지 못했습니다. 다시 시도해 주세요.',
  saveError: '판정을 저장하지 못했습니다. 다시 시도해 주세요.',
  empty: '이견이 없습니다',
  emptyBody: '보완 요청이 반복되어 운영자 개입이 필요하면 여기에 표시됩니다.',
  saving: '저장 중',
} as const;

/* 백엔드 enum DisputeDecision(schema.prisma) 순서·의미와 맞춘다. */
const DECISION_LABEL: Record<ApiDisputeDecision, string> = {
  REWORK_VALID: '보완이 맞다',
  APPROVE: '승인이 맞다',
  UNDECIDED_CONDITION: '정하지 않은 조건이다',
};

const DECISION_OPTIONS = [
  {
    key: 'REWORK_VALID',
    label: (
      <span>
        <b>{DECISION_LABEL.REWORK_VALID}</b>
        <span>조건 줄을 지키지 못했다 — 공급자가 다시 작업하고 이 항목은 검수 대기로 돌아갑니다</span>
      </span>
    ),
  },
  {
    key: 'APPROVE',
    label: (
      <span>
        <b>{DECISION_LABEL.APPROVE}</b>
        <span>조건 줄을 충족했다 — 이 항목을 승인 처리합니다. 구간의 항목이 모두 승인되면 지급됩니다</span>
      </span>
    ),
  },
  {
    key: 'UNDECIDED_CONDITION',
    label: (
      <span>
        <b>{DECISION_LABEL.UNDECIDED_CONDITION}</b>
        <span>요청한 부분이 &lsquo;정하지 않음&rsquo; 조건이다 — 기능 설명 기준으로 보고 그 부분은 검수 대상에서 뺍니다</span>
      </span>
    ),
  },
];

const STATUS_LABEL: Record<string, string> = {
  OPEN: '검토 대기',
  ESCALATED: '검토 중',
  RESOLVED: '처리 완료',
};

function statusOf(row: AdminEscalatedInspectionDto): string {
  return row.status === 'RESOLVED' ? '처리 완료' : '검토 중';
}

function won(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export default function AdminDisputes() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [rows, setRows] = useState<AdminEscalatedInspectionDto[]>([]);
  const [decision, setDecision] = useState<ApiDisputeDecision | ''>('');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = (signal?: AbortSignal) => {
    setState('loading');
    return apiRequest('listEscalatedInspections', '/admin/inspection-requests/escalated', {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiAccessToken]);

  const selected = rows.find((row) => row.id === params.get('id')) ?? rows[0] ?? null;
  const done = selected?.status === 'RESOLVED';
  const revisionCount = selected
    ? selected.history.filter((entry) => entry.reason === 'CONDITION_MISMATCH').length
    : 0;

  useEffect(() => {
    setDecision('');
    setReason('');
    setTried(false);
    setNotice(null);
    setError(null);
  }, [selected?.id]);

  const select = (id: string) => {
    navigate(`/admin/disputes?id=${encodeURIComponent(id)}`);
  };

  const canConfirm = decision.length > 0 && reason.trim().length > 0;

  const submit = async () => {
    if (!selected || !decision) return;
    setTried(true);
    setError(null);
    if (!canConfirm) return;
    setBusy(true);
    try {
      await apiRequest(
        'decideInspectionDispute',
        `/admin/inspection-requests/${encodeURIComponent(selected.id)}/decision`,
        {
          method: 'POST',
          accessToken: apiAccessToken,
          jsonBody: {
            decision,
            reason: reason.trim(),
            decisionNotes: { client: reason.trim(), supplier: reason.trim() },
          },
        },
      );
      await load();
      setNotice('판정을 저장했습니다.');
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : PAGE.saveError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.page} data-screen="Admin-Disputes">
      <header className={s.head}>
        <h1 className={s.title}>{PAGE.title}</h1>
        <p className={s.sub}>{PAGE.sub}</p>
      </header>

      {state === 'loading' ? <LoadingState label="이견 목록을 불러오는 중입니다." /> : null}
      {state === 'error' ? <p role="alert" className={s.detailMeta}>{PAGE.loadError}</p> : null}
      {state === 'ready' && rows.length === 0 ? (
        <EmptyState title={PAGE.empty}>{PAGE.emptyBody}</EmptyState>
      ) : null}
      {notice ? <p role="status" className={s.rule}>{notice}</p> : null}

      {state === 'ready' && selected ? (
        <div className={s.grid}>
          <section aria-label={PAGE.listLabel}>
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
                      <div className={s.rowChips}>
                        <Chip tone="amber">보완 {row.history.filter((entry) => entry.reason === 'CONDITION_MISMATCH').length}회</Chip>
                        <StatusChip status={statusOf(row)} />
                      </div>
                      <span className={s.rowName}>{row.itemTitle} — {row.projectTitle}</span>
                      <span className={s.rowMeta}>
                        의뢰인 {row.clientName ?? '이름 미등록'} · 공급자 {row.supplierName ?? '이름 미등록'}
                      </span>
                      <span className={s.rowMeta}>{formatDateTime(row.createdAt)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className={s.detail} aria-label={PAGE.detailLabel}>
            {done ? (
              <div className={s.bandWrap}>
                <Band
                  tone="done"
                  title={`판정 완료 · ${selected.resolvedAt ? formatDateTime(selected.resolvedAt) : ''}`}
                >
                  {selected.decision ? `결과: ${DECISION_LABEL[selected.decision]}` : ''}
                  {selected.decisionNotes?.client ? ` · ${selected.decisionNotes.client}` : ''}
                </Band>
              </div>
            ) : null}

            <div className={s.detailHead}>
              <div className={s.detailChips}>
                <Chip tone="amber">보완 요청 {revisionCount}회</Chip>
                <StatusChip status={statusOf(selected)} />
              </div>
              <h2 className={s.detailTitle}>{selected.itemTitle}</h2>
              <p className={s.detailMeta}>
                {selected.projectTitle} · 의뢰인 {selected.clientName ?? '이름 미등록'} · 공급자{' '}
                {selected.supplierName ?? '이름 미등록'} · 합의 {won(selected.agreedAmount)} · 중간 구간{' '}
                {won(Math.round((selected.agreedAmount * selected.interimRatio) / 100))}
              </p>
            </div>

            <div className={s.sec}>
              <p className={s.k}>양쪽 주장</p>
              <div className={s.claims}>
                <div className={s.claim}>
                  <p className={s.claimWho}>
                    <b>의뢰인 {selected.clientName ?? '이름 미등록'}</b>
                  </p>
                  <p>{selected.escalation?.client || selected.escalation?.what || '기록된 주장이 없습니다.'}</p>
                </div>
                <div className={s.claim}>
                  <p className={s.claimWho}>
                    <b>공급자 {selected.supplierName ?? '이름 미등록'}</b>
                  </p>
                  <p>{selected.escalation?.supplier || '기록된 주장이 없습니다.'}</p>
                </div>
              </div>
            </div>

            <div className={s.sec}>
              <p className={s.k}>계약 기능 항목 — 합의 조건</p>
              <div className={s.cond}>
                <div className={s.condHead}>
                  <b>{selected.itemTitle}</b>
                  <span>{selected.itemDescription}</span>
                </div>
                {selected.conditions.length === 0 ? (
                  <p className={s.rule}>기록된 조건이 없습니다.</p>
                ) : (
                  selected.conditions.map((condition, index) => (
                    <div
                      key={`${condition.key}-${index}`}
                      className={`${s.condRow} ${condition.state === 'DECIDED' ? s.condHl : ''} ${condition.state === 'UNDECIDED' ? s.condNd : ''}`}
                    >
                      <span className={s.condQ}>{condition.key || `조건 ${index + 1}`}</span>
                      <span className={s.condA}>
                        {condition.state === 'UNDECIDED' ? <span className={s.ndMark}>정하지 않음</span> : null}
                        {condition.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <p className={s.rule}>
                계약서 — 각 항목에 적힌 합의 조건이 검수 기준이고, &lsquo;정하지 않음&rsquo; 조건은 검수
                기준이 되지 않으며 그 항목은 기능 설명에 맞게 동작하는지만 봅니다.
              </p>
            </div>

            <div className={s.sec}>
              <div className={s.two}>
                <div>
                  <p className={s.k}>보완 요청 기록</p>
                  {selected.history.length === 0 ? (
                    <p className={s.rule}>기록이 없습니다.</p>
                  ) : (
                    <ol className={s.flow}>
                      {selected.history.map((entry, index) => (
                        <li
                          key={entry.id}
                          className={
                            index === selected.history.length - 1
                              ? selected.status === 'RESOLVED'
                                ? undefined
                                : s.flowNow
                              : s.flowAmber
                          }
                        >
                          <b>
                            {formatDateTime(entry.createdAt)} · {entry.deliveryAttemptNo}회 ·{' '}
                            {STATUS_LABEL[entry.status] ?? entry.status}
                          </b>
                          {entry.note ?? entry.conditionKey ?? entry.reason}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
                <div>
                  <p className={s.k}>납품 내역</p>
                  {selected.delivery ? (
                    <>
                      <span className={s.link}>{selected.delivery.summary ?? '요약 없음'}</span>
                      <span className={s.linkMeta}>
                        {selected.delivery.attemptNo}회차 제출 · {formatDateTime(selected.delivery.submittedAt)}
                      </span>
                    </>
                  ) : (
                    <span className={s.linkMeta}>납품 기록이 없습니다.</span>
                  )}
                </div>
              </div>
            </div>

            {done && selected.decisionNotes ? (
              <div className={s.sec}>
                <div className={s.resultBox}>
                  <span className={s.k}>
                    보낸 판정 {selected.resolvedAt ? `· ${formatDateTime(selected.resolvedAt)}` : ''}
                  </span>
                  <b>{selected.decision ? DECISION_LABEL[selected.decision] : '판정'}</b>
                  <p>{selected.decisionNotes.client}</p>
                </div>
              </div>
            ) : null}

            {!done ? (
              <div className={s.sec}>
                <p className={s.k}>{PAGE.resultLabel}</p>
                <div className={s.judgeOpts}>
                  <SelectCards
                    label={PAGE.resultLabel}
                    options={DECISION_OPTIONS}
                    value={decision || null}
                    onChange={(key) => setDecision(key as ApiDisputeDecision)}
                  />
                </div>
                <TextAreaField
                  label={PAGE.reasonLabel}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  error={tried && !reason.trim() ? PAGE.reasonNeed : undefined}
                  placeholder="어느 조건 줄을 근거로 판단했는지 적어 주세요. 양쪽에 그대로 전달됩니다."
                />
                {error ? <p role="alert" className={s.rule}>{error}</p> : null}
                <div className={s.foot}>
                  <p className={s.eventNote}>{PAGE.eventNote}</p>
                  <Button
                    variant="primary"
                    type="button"
                    disabled={!canConfirm || busy}
                    disabledReason={busy ? PAGE.saving : !canConfirm ? PAGE.reasonNeed : undefined}
                    onClick={() => void submit()}
                  >
                    {busy ? PAGE.saving : PAGE.confirm}
                  </Button>
                </div>
              </div>
            ) : (
              <p className={s.eventNote}>{PAGE.eventNote}</p>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}

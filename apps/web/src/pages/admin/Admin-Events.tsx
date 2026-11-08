/* 이벤트 기록 — 보드 Admin-Events · /admin/events · M6
 * 실제: GET /admin/event-logs?actionType&targetType&from (읽기 전용)
 * 시연(?mock=, 개발 전용): 목록 / 상세
 * F-27 · EventLog. 선택은 ?id=. */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AdminEventLogDto, AdminEventLogQueryDto } from '@majayong/types/api';
import { Button, Chip, EmptyState, LoadingState } from '@/components/ui';
import { useSession } from '@/app/session';
import { apiRequest } from '@/lib/api';
import { DEMO_DATA_ENABLED } from '@/lib/feature-flags';
import { formatDate, formatDateTime } from '@/lib/format';
import {
  DEMO,
  EVENTS,
  KINDS,
  PERIODS,
  defaultIdOf,
  eventOf,
  resolveEventMock,
  type EventMock,
} from './Admin-Events.data';
import s from './Admin-Events.module.css';

const LIVE = {
  sub: '운영자 행위와 거래의 주요 사건을 최신 순으로 봅니다. 운영자 조치는 사유와 함께 남습니다.',
  loading: '이벤트 기록을 불러오는 중입니다.',
  loadError: '이벤트 기록을 불러오지 못했습니다. 다시 시도해 주세요.',
  retry: '다시 불러오기',
  empty: '조건에 맞는 기록이 없습니다',
  emptyBody: '기간이나 종류를 바꿔 보세요.',
  targetLabel: '대상 종류',
  missingData: '전후 값과 행위자 이름은 현재 서버 응답에 없어 보여 주지 않습니다.',
  system: '시스템',
} as const;

const PERIOD_DAYS: Record<string, number | null> = {
  '최근 30일': 30,
  '최근 7일': 7,
  전체: null,
};

/* 백엔드 admin-ops가 남기는 actionType. 이 밖의 값은 코드 그대로 보여 준다. */
const ACTION_LABEL: Record<string, string> = {
  BLOCK_UPDATE_PRICE: '단가 수정',
  BLOCK_MERGE: '블록 병합',
  BLOCK_DISABLE: '비활성화',
  BLOCK_DEACTIVATE: '비활성화',
  BLOCK_ENABLE: '다시 켜기',
  OPERATOR_CONFIRMED: '결제 확정',
  OPERATOR_VOIDED: '결제 취소',
  OPERATOR_REVIEWED: '결제 검토',
  DISPUTE_REWORK_VALID: '판정 · 보완이 맞다',
  DISPUTE_APPROVE: '판정 · 승인이 맞다',
  DISPUTE_UNDECIDED_CONDITION: '판정 · 정하지 않은 조건이다',
  DISPUTE_DECIDED: '판정',
  DISPUTE_ESCALATED: '이견 개입 요청',
  CANCELLATION_ADMIN_DECIDED: '취소 판정',
  SETTLEMENT_MANUAL_PROCESSED: '정산 처리',
  SETTLEMENT_MANUAL_RELEASED: '구간 지급',
};

const ACTION_FILTERS = ['', ...Object.keys(ACTION_LABEL).filter((key) => key !== 'BLOCK_DEACTIVATE')];

const TARGET_LABEL: Record<string, string> = {
  BLOCK: '블록',
  DEPOSIT: '예치',
  INSPECTION: '이견',
  CONTRACT: '계약',
  INSTALLMENT: '정산 구간',
};

function actionLabel(code: string): string {
  return ACTION_LABEL[code] ?? code;
}

function targetText(row: AdminEventLogDto): string {
  if (!row.targetType && !row.targetId) return '—';
  return `${TARGET_LABEL[row.targetType] ?? row.targetType} ${row.targetId}`.trim();
}

function actorText(row: AdminEventLogDto): string {
  return row.actorUserId ? `사용자 ${row.actorUserId}` : LIVE.system;
}

function relatedHref(row: AdminEventLogDto): string | null {
  if (row.targetType === 'BLOCK' && row.targetId) return `/admin/blocks?id=${encodeURIComponent(row.targetId)}`;
  return null;
}

export default function AdminEvents() {
  const [params] = useSearchParams();
  if (DEMO_DATA_ENABLED && params.has('mock')) return <AdminEventsDemo />;
  return <AdminEventsLive />;
}

function AdminEventsLive() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [rows, setRows] = useState<AdminEventLogDto[]>([]);
  const [period, setPeriod] = useState<string>(PERIODS[0]);
  const [actionType, setActionType] = useState('');
  const [targetType, setTargetType] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const days = PERIOD_DAYS[period] ?? null;
    const query: AdminEventLogQueryDto = {
      actionType: actionType || undefined,
      targetType: targetType || undefined,
      from: days === null ? undefined : new Date(Date.now() - days * 86_400_000).toISOString(),
    };
    setState('loading');
    apiRequest('listEventLogs', '/admin/event-logs', {
      accessToken: apiAccessToken,
      signal: controller.signal,
      query,
    })
      .then((response) => {
        setRows(response.data);
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken, period, actionType, targetType, reloadKey]);

  const ordered = useMemo(
    () => [...rows].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    [rows],
  );
  const selectedId = params.get('id');
  const selected = selectedId ? (ordered.find((row) => row.id === selectedId) ?? null) : null;

  const openDetail = (id: string) =>
    navigate(`/admin/events?id=${encodeURIComponent(id)}`, { replace: true });
  const closeDetail = () => navigate('/admin/events', { replace: true });

  return (
    <div className={s.page} data-screen="Admin-Events">
      <header className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{LIVE.sub}</p>
      </header>

      <p className={s.note}>
        <b>기록은 지우거나 고칠 수 없습니다.</b> {LIVE.missingData}
      </p>

      <div className={s.filters}>
        <select
          className={s.sel}
          aria-label={DEMO.periodLabel}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          className={s.sel}
          aria-label={LIVE.targetLabel}
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
        >
          <option value="">모든 대상</option>
          {Object.entries(TARGET_LABEL).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>

        <select
          className={s.sel}
          aria-label={DEMO.kindLabel}
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
        >
          {ACTION_FILTERS.map((code) => (
            <option key={code || 'all'} value={code}>
              {code ? actionLabel(code) : KINDS[0]}
            </option>
          ))}
        </select>
      </div>

      {state === 'loading' ? <LoadingState label={LIVE.loading} /> : null}
      {state === 'error' ? (
        <div>
          <p role="alert" className={s.note}>
            {LIVE.loadError}
          </p>
          <Button variant="ghost" size="sm" type="button" onClick={() => setReloadKey((key) => key + 1)}>
            {LIVE.retry}
          </Button>
        </div>
      ) : null}
      {state === 'ready' && ordered.length === 0 ? (
        <EmptyState title={LIVE.empty}>{LIVE.emptyBody}</EmptyState>
      ) : null}

      {state === 'ready' && ordered.length > 0 ? (
        <div className={`${s.layout} ${selected ? s.layoutDetail : ''}`}>
          <section className={s.tableWrap} aria-label={DEMO.listLabel}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th scope="col">시각</th>
                  <th scope="col">행위자</th>
                  <th scope="col">종류</th>
                  <th scope="col">대상</th>
                  <th scope="col">사유</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((r) => {
                  const on = selected?.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      className={on ? s.trOn : undefined}
                      onClick={() => openDetail(r.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openDetail(r.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-current={on ? 'true' : undefined}
                    >
                      <td className={s.tm}>
                        <time dateTime={r.occurredAt} title={formatDate(r.occurredAt)}>
                          {formatDateTime(r.occurredAt)}
                        </time>
                      </td>
                      <td>
                        <span className={s.who}>{actorText(r)}</span>
                      </td>
                      <td>
                        <Chip tone={ACTION_LABEL[r.actionType] ? 'amber' : 'neutral'}>
                          {actionLabel(r.actionType)}
                        </Chip>
                      </td>
                      <td>{targetText(r)}</td>
                      <td className={s.why}>{r.reason || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className={s.pager}>
              <span>전체 {ordered.length}건 · 최신 순</span>
            </div>
          </section>

          {selected ? (
            <aside className={s.detail} aria-label={DEMO.detailLabel}>
              <div className={s.detailHead}>
                <div>
                  <Chip tone={ACTION_LABEL[selected.actionType] ? 'amber' : 'neutral'}>
                    {actionLabel(selected.actionType)}
                  </Chip>
                  <h2 className={s.detailTitle}>
                    {actionLabel(selected.actionType)} · {targetText(selected)}
                  </h2>
                  <p className={s.detailMeta}>
                    {formatDateTime(selected.occurredAt)} · {actorText(selected)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" type="button" onClick={closeDetail}>
                  닫기
                </Button>
              </div>

              <dl className={s.kv}>
                <dt>이벤트 번호</dt>
                <dd>{selected.id}</dd>
                <dt>행위자</dt>
                <dd>{actorText(selected)}</dd>
                <dt>종류</dt>
                <dd>
                  {actionLabel(selected.actionType)} ({selected.actionType})
                </dd>
                <dt>대상</dt>
                <dd>{targetText(selected)}</dd>
              </dl>

              <p className={s.k}>사유</p>
              <p className={s.whyBox}>{selected.reason || '기록된 사유가 없습니다.'}</p>

              {relatedHref(selected) ? (
                <div className={s.links}>
                  <Button variant="tint" size="sm" to={relatedHref(selected)!}>
                    블록 검토에서 보기
                  </Button>
                </div>
              ) : null}

              <p className={s.foot}>{DEMO.readonly}</p>
            </aside>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const ACTORS = ['전체', '운영자', '시스템', '사용자'] as const;

function matchesActor(actorKind: string, filter: string): boolean {
  if (filter === '전체') return true;
  if (filter === '사용자') return actorKind === '의뢰인' || actorKind === '공급자';
  return actorKind === filter;
}

function kindTone(kind: string, actorKind: string): 'amber' | 'blue' | 'neutral' {
  if (actorKind === '운영자') return 'amber';
  if (actorKind === '의뢰인' || actorKind === '공급자') return 'blue';
  return 'neutral';
}

function AdminEventsDemo() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveEventMock(params.get('mock'));
  const selectedId = params.get('id') ?? (mock === '상세' ? defaultIdOf(mock) : null);
  const showDetail = mock === '상세' || !!params.get('id');
  const selected = selectedId ? eventOf(selectedId) : null;

  const [period, setPeriod] = useState<string>(PERIODS[0]);
  const [kind, setKind] = useState<string>(KINDS[0]);
  const [actor, setActor] = useState<string>('전체');

  const rows = useMemo(() => {
    void period; /* 시연: 기간 UI만, 데이터는 최근 30일 묶음 */
    return EVENTS.filter((e) => {
      if (kind !== '모든 종류' && e.kind !== kind) return false;
      if (!matchesActor(e.actorKind, actor)) return false;
      return true;
    });
  }, [kind, actor, period]);

  const go = (next: EventMock, id?: string | null) => {
    const q = new URLSearchParams();
    q.set('mock', next);
    if (id) q.set('id', id);
    navigate(`/admin/events?${q.toString()}`, { replace: true });
  };

  const openDetail = (id: string) => go('상세', id);
  const closeDetail = () => go('목록');

  return (
    <div className={s.page} data-screen="Admin-Events">
      <header className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
      </header>

      <p className={s.note}>
        <b>기록은 지우거나 고칠 수 없습니다.</b> {DEMO.note.replace(/^기록은 지우거나 고칠 수 없습니다\.\s*/, '')}
      </p>

      <div className={s.filters}>
        <select
          className={s.sel}
          aria-label={DEMO.periodLabel}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <div className={s.seg} role="group" aria-label={DEMO.actorLabel}>
          {ACTORS.map((a) => (
            <button
              key={a}
              type="button"
              className={`${s.segBtn} ${actor === a ? s.segOn : ''}`}
              onClick={() => setActor(a)}
            >
              {a}
            </button>
          ))}
        </div>

        <select
          className={s.sel}
          aria-label={DEMO.kindLabel}
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div className={`${s.layout} ${showDetail && selected ? s.layoutDetail : ''}`}>
        <section className={s.tableWrap} aria-label={DEMO.listLabel}>
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">시각</th>
                <th scope="col">행위자</th>
                <th scope="col">종류</th>
                <th scope="col">대상</th>
                <th scope="col">전 → 후</th>
                <th scope="col">사유</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const on = selected?.id === r.id;
                return (
                  <tr
                    key={r.id}
                    className={on ? s.trOn : undefined}
                    onClick={() => openDetail(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openDetail(r.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-current={on ? 'true' : undefined}
                  >
                    <td className={s.tm}>
                      <time dateTime={r.at} title={formatDate(r.at)}>
                        {formatDateTime(r.at)}
                      </time>
                    </td>
                    <td>
                      <span className={s.who}>{r.actor}</span>
                      <span className={s.who2}>{r.actorSub}</span>
                    </td>
                    <td>
                      <Chip tone={kindTone(r.kind, r.actorKind)}>{r.kind}</Chip>
                    </td>
                    <td>{r.target}</td>
                    <td className={s.ba}>
                      <s>{r.before}</s> → <b>{r.after}</b>
                    </td>
                    <td className={s.why}>{r.reasonLine}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className={s.pager}>
            <span>
              1 – {rows.length} · 전체 {EVENTS.length}건 · 최신 순
            </span>
          </div>
        </section>

        {showDetail && selected ? (
          <aside className={s.detail} aria-label={DEMO.detailLabel}>
            <div className={s.detailHead}>
              <div>
                <Chip tone={kindTone(selected.kind, selected.actorKind)}>{selected.kind}</Chip>
                <h2 className={s.detailTitle}>
                  {selected.kind === '단가 수정'
                    ? `‘주차 안내’ 블록 단가 수정`
                    : `${selected.kind} · ${selected.target}`}
                </h2>
                <p className={s.detailMeta}>
                  {formatDateTime(selected.at)} · {selected.actor}
                </p>
              </div>
              <Button variant="ghost" size="sm" type="button" onClick={closeDetail}>
                닫기
              </Button>
            </div>

            <dl className={s.kv}>
              <dt>이벤트 번호</dt>
              <dd>{selected.eventNo}</dd>
              <dt>행위자</dt>
              <dd>{selected.actorAccount}</dd>
              <dt>종류</dt>
              <dd>{selected.kindFull}</dd>
              <dt>대상</dt>
              <dd>{selected.targetFull}</dd>
            </dl>

            <p className={s.k}>전 → 후</p>
            <div className={s.diff}>
              <pre className={s.code}>
                <span className={s.codeLabel}>전</span>
                {selected.beforeDetail}
              </pre>
              <pre className={`${s.code} ${s.codeAfter}`}>
                <span className={s.codeLabel}>후</span>
                {selected.afterDetail}
              </pre>
            </div>

            <p className={s.k}>사유</p>
            <p className={s.whyBox}>{selected.reasonFull}</p>

            {selected.impacts.length > 0 ? (
              <>
                <p className={s.k}>영향</p>
                <ul className={s.imp}>
                  {selected.impacts.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </>
            ) : null}

            <div className={s.links}>
              {selected.relatedHref ? (
                <Button variant="tint" size="sm" to={selected.relatedHref}>
                  {selected.relatedLabel ?? '관련 화면'}
                </Button>
              ) : null}
              {selected.contractHref ? (
                <Button variant="ghost" size="sm" to={selected.contractHref}>
                  관련 계약
                </Button>
              ) : null}
              {selected.projectHref ? (
                <Button variant="ghost" size="sm" to={selected.projectHref}>
                  관련 프로젝트
                </Button>
              ) : null}
            </div>

            <p className={s.foot}>{DEMO.readonly}</p>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

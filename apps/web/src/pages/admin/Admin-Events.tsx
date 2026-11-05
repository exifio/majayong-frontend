/* 이벤트 기록 — 보드 Admin-Events · /admin/events · M6
 * 상태: 목록 / 상세
 * F-27 · EventLog. 선택은 ?id=. 읽기 전용. */
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Chip } from '@/components/ui';
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

export default function AdminEvents() {
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

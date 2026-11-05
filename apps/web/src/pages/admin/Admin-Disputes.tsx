/* 이견 개입 — 보드 Admin-Disputes · /admin/disputes · M6
 * 상태: 검토 중 / 판정 작성 / 판정 완료
 * F-27 · 11.3. 선택은 ?id=. */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  Chip,
  SelectCards,
  StatusChip,
  TextAreaField,
} from '@/components/ui';
import { AdminDemoNotice } from '@/components/admin/AdminDemoNotice';
import {
  DEMO,
  REASON_DEMO,
  defaultIdOf,
  disputeOf,
  listFor,
  resolveDisputeMock,
  type DisputeMock,
} from './Admin-Disputes.data';
import s from './Admin-Disputes.module.css';

const RESULT_OPTIONS = [
  {
    key: 'approve',
    label: (
      <span>
        <b>승인</b>
        <span>조건 줄을 충족했다 — 이 항목을 승인 처리합니다</span>
      </span>
    ),
  },
  {
    key: 'revise',
    label: (
      <span>
        <b>보완</b>
        <span>조건 줄을 지키지 못했다 — 검수 대기로 돌아갑니다</span>
      </span>
    ),
  },
  {
    key: 'partial',
    label: (
      <span>
        <b>부분 정산</b>
        <span>정하지 않은 조건 등은 검수에서 빼고 나머지는 승인합니다</span>
      </span>
    ),
  },
];

export default function AdminDisputes() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveDisputeMock(params.get('mock'));
  const selectedId = params.get('id') ?? defaultIdOf(mock);
  const row = disputeOf(selectedId);
  const rows = listFor(mock);

  const writing = mock === '판정 작성';
  const done = mock === '판정 완료' || row.status === '처리 완료';

  const [result, setResult] = useState(writing ? 'partial' : '');
  const [reason, setReason] = useState(writing ? REASON_DEMO : '');

  useEffect(() => {
    const w = mock === '판정 작성';
    setResult(w ? 'partial' : '');
    setReason(w ? REASON_DEMO : '');
  }, [mock, params]);

  const go = (next: DisputeMock, id = selectedId) => {
    const q = new URLSearchParams();
    q.set('mock', next);
    q.set('id', id);
    navigate(`/admin/disputes?${q.toString()}`, { replace: true });
  };

  const select = (id: string) => {
    if (id === 'dp-done') go('판정 완료', id);
    else go(mock === '판정 완료' ? '검토 중' : mock, id);
  };

  const canConfirm = result.length > 0 && reason.trim().length > 0;
  const showJudge = mock === '검토 중' || mock === '판정 작성';

  return (
    <div className={s.page} data-screen="Admin-Disputes">
      <header className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
      </header>

      {mock === '판정 작성' || mock === '판정 완료' ? <AdminDemoNotice /> : null}

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
                      <Chip tone="amber">보완 3회</Chip>
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
          {done && row.doneBand ? (
            <div className={s.bandWrap}>
              <Band tone="done" title={row.doneBand.title}>
                {row.doneBand.body}
              </Band>
            </div>
          ) : null}

          <div className={s.detailHead}>
            <div className={s.detailChips}>
              <Chip tone="amber">보완 요청 3회 · 조건과 다름</Chip>
              <StatusChip status={row.status} />
            </div>
            <h2 className={s.detailTitle}>{row.title}</h2>
            <p className={s.detailMeta}>{row.meta}</p>
          </div>

          <div className={s.sec}>
            <p className={s.k}>양쪽 주장</p>
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
            <p className={s.k}>계약 기능 항목 — 합의 조건</p>
            <div className={s.cond}>
              <div className={s.condHead}>
                <b>회차 예약</b>
                <span>점심 · 저녁 회차를 열고 회차마다 정원을 정해 예약받기</span>
              </div>
              {row.conditions.map((c) => (
                <div
                  key={c.q}
                  className={`${s.condRow} ${c.hl ? s.condHl : ''} ${c.nd ? s.condNd : ''}`}
                >
                  <span className={s.condQ}>{c.q}</span>
                  <span className={s.condA}>
                    {c.nd ? <span className={s.ndMark}>정하지 않음</span> : null}
                    {c.a.replace(/^정하지 않음\s*[—·-]?\s*/, '')}
                  </span>
                </div>
              ))}
            </div>
            <p className={s.rule}>{row.conditionNote}</p>
          </div>

          <div className={s.sec}>
            <div className={s.two}>
              <div>
                <p className={s.k}>보완 요청 기록</p>
                <ol className={s.flow}>
                  {row.revisions.map((f) => (
                    <li
                      key={f.b}
                      className={f.now ? s.flowNow : f.amber ? s.flowAmber : undefined}
                    >
                      <b>{f.b}</b>
                      {f.s}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className={s.k}>납품 내역</p>
                <span className={s.link}>{row.deliverLink}</span>
                <span className={s.linkMeta}>{row.deliverMeta}</span>
                {row.quotes.map((q) => (
                  <div key={q.who} className={s.quote}>
                    <i>{q.who}</i>
                    {q.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={s.sec}>
            <p className={s.k}>시간 순서</p>
            <ul className={s.timeline}>
              {row.timeline.map((t, i) => (
                <li key={`${t.when}-${i}`}>
                  <span className={s.timelineMeta}>
                    {t.when} · {t.who}
                  </span>
                  {t.text}
                </li>
              ))}
            </ul>
          </div>

          {done && row.resultSummary ? (
            <div className={s.sec}>
              <div className={s.resultBox}>
                <span className={s.k}>보낸 판정 · 11월 28일 16:40 · 운영자 김하늘</span>
                <b>{row.resultSummary}</b>
                <p>{row.resultDetail}</p>
              </div>
            </div>
          ) : null}

          {showJudge ? (
            <div className={s.sec}>
              <p className={s.k}>{DEMO.resultLabel}</p>
              <div className={s.judgeOpts}>
                <SelectCards
                  label={DEMO.resultLabel}
                  options={RESULT_OPTIONS}
                  value={result || null}
                  onChange={setResult}
                />
              </div>
              <TextAreaField
                label={DEMO.reasonLabel}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="어느 조건 줄을 근거로 판단했는지 적어 주세요. 양쪽에 그대로 전달됩니다."
              />
              <div className={s.foot}>
                <p className={s.eventNote}>{DEMO.eventNote}</p>
                <Button
                  variant="primary"
                  type="button"
                  disabled={!canConfirm}
                  disabledReason={!canConfirm ? DEMO.reasonNeed : undefined}
                  onClick={() => go('판정 완료', 'dp-done')}
                >
                  {DEMO.confirm}
                </Button>
              </div>
            </div>
          ) : (
            <p className={s.eventNote}>{DEMO.eventNote}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

/* 환불 처리 — 보드 Admin-Refunds · /admin/refunds · M6
 * 상태: 처리 대기 / 사유 다툼 판정 / 처리 완료
 * F-27 · F-26 · 13.2. 선택은 ?id=. */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  Chip,
  Money,
  SelectCards,
  StatusChip,
  TextAreaField,
} from '@/components/ui';
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

export default function AdminRefunds() {
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
                  의뢰인 환불<i>데이터 값</i>
                </span>
                <span className={s.settleV}>
                  <Money amount={row.refundAmount} />
                </span>
              </div>
              <div className={`${s.settleRow} ${s.settleTot}`}>
                <span className={s.settleK}>
                  공급자 보상<i>데이터 값</i>
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

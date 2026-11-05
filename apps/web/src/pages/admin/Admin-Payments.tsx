/* 보류된 결제 — 보드 Admin-Payments · /admin/payments · M6
 * 상태: 목록 / 금액 불일치 / 확정
 * F-27 · 11절. 선택 결제는 ?id=. */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Band, Button, Money, StatusChip, TextAreaField } from '@/components/ui';
import {
  DEMO,
  defaultIdOf,
  listFor,
  payOf,
  resolvePayMock,
  type PayMock,
} from './Admin-Payments.data';
import s from './Admin-Payments.module.css';

export default function AdminPayments() {
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

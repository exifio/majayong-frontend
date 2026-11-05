/* 결제 · 정산 내역 — 보드 Settle-Client · /c/settlements · M5
 * 상태: 전체 / 계약 하나만(?contract=:cid) / 취소된 계약 예시
 * F-16 · F-29. 조회 화면 — primary 없음. */
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Chip, Money, StatusChip } from '@/components/ui';
import {
  DEMO,
  resolveSettleMock,
  settleDemoOf,
  type TxRow,
} from './Settle-Client.data';
import s from './Settle-Client.module.css';

function rowStatus(status: string) {
  if (status === '예정') return <Chip tone="outline">예정</Chip>;
  return <StatusChip status={status} />;
}

function TxLine({ row }: { row: TxRow }) {
  return (
    <div className={s.tr}>
      <span className={s.d}>{row.date}</span>
      <span className={s.kd}>{row.kind}</span>
      <span className={s.nt}>{row.note}</span>
      <span className={s.am}>
        <Money amount={row.amount} />
        {row.sub ? <i>{row.sub}</i> : null}
      </span>
      <span className={s.st}>{rowStatus(row.status)}</span>
    </div>
  );
}

export default function SettleClient() {
  const [params] = useSearchParams();
  const mock = resolveSettleMock(params.get('mock'), params.get('contract'));
  const demo = settleDemoOf(mock);

  return (
    <div className={s.page} data-screen="Settle-Client">
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{DEMO.title}</h1>
          <p className={s.sub}>{DEMO.sub}</p>
        </div>
        <Link to={DEMO.contractsHref}>{DEMO.contractsLabel}</Link>
      </div>

      <div className={s.sum} aria-label="요약">
        {demo.sum.map((m) => (
          <div key={m.k}>
            <p className={s.k}>{m.k}</p>
            <div className={s.v}>
              <Money amount={m.v} />
            </div>
            <div className={s.s}>{m.s}</div>
          </div>
        ))}
      </div>

      {demo.one ? (
        <div className={s.banner}>
          <span>
            {DEMO.oneBanner} — <b>{demo.oneName}</b>
          </span>
          <Link to="/c/settlements">{DEMO.allView}</Link>
        </div>
      ) : null}

      {demo.cards.map((card) => (
        <div key={card.id}>
          {card.group ? <p className={s.grp}>{card.group}</p> : null}
          <section className={s.card} aria-label={card.title}>
            <div className={s.ph}>
              <div>
                <div className={s.top}>
                  <StatusChip status={card.status} />
                  <span className={s.when}>{card.when}</span>
                </div>
                <p className={s.ti}>{card.title}</p>
                <div className={s.mt}>
                  {card.who} · {card.agreedLabel}
                </div>
              </div>
              <div className={s.rt}>
                <div className={s.k}>예치한 금액</div>
                <div className={s.bigV}>
                  <Money amount={card.escrow} />
                </div>
                <div className={s.lk2}>
                  <Button variant="ghost" size="sm" type="button">
                    {DEMO.feeReceipt}
                  </Button>
                  <span className={s.dot}>·</span>
                  <Button variant="ghost" size="sm" type="button">
                    {DEMO.payReceipt}
                  </Button>
                  <span className={s.dot}>·</span>
                  <Link to={`/c/contracts/${card.id === 'c-ondo' ? 'c-ondo' : 'c-ondo'}`}>
                    {DEMO.contractView}
                  </Link>
                </div>
              </div>
            </div>

            <div className={s.stats}>
              <div>
                <div className={s.k}>공급자에게 지급</div>
                <div className={s.v}>
                  <Money amount={card.paid} />
                </div>
              </div>
              <div>
                <div className={s.k}>남은 예치금</div>
                <div className={s.v}>
                  <Money amount={card.remain} />
                </div>
              </div>
              <div>
                <div className={s.k}>낸 수수료 5%</div>
                <div className={s.v}>
                  <Money amount={card.fee} />
                </div>
              </div>
            </div>

            <div className={s.tl}>
              {card.rows.map((r) => (
                <TxLine key={`${r.date}-${r.kind}`} row={r} />
              ))}
            </div>

            {card.cancelBox ? (
              <div className={s.cxb}>
                <b>취소 정산</b>
                {card.cancelBox.lines.map((x) => (
                  <div
                    key={x.k}
                    className={`${s.cxr} ${x.k.includes('돌려받을') || x.k.includes('공급자 보상(수수료') ? s.tot : ''}`}
                  >
                    <span>{x.k}</span>
                    <span>{x.v}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ))}

      <div className={s.rule}>
        <b>{DEMO.rulesTitle}</b>
        <ul>
          {DEMO.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* 공급자 정산 내역 — 보드 Settle-Supplier · /s/settlements · M5
 * 상태: 전체 / 계약 하나만(?contract=:cid) / 취소된 계약 예시 / 개인 공급자 예시
 * F-16 · F-29. 받을 금액만. 조회 화면 — primary 없음. */
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Chip, Money, StatusChip } from '@/components/ui';
import {
  DEMO,
  resolveSettleSMock,
  settleSDemoOf,
  type SettleSCard,
  type StatCell,
  type TxRow,
} from './Settle-Supplier.data';
import s from './Settle-Supplier.module.css';

function rowStatus(status: string) {
  if (status === '예정') return <Chip tone="outline">예정</Chip>;
  return <StatusChip status={status} />;
}

function cardChip(card: SettleSCard) {
  if (card.status === '지급 처리 중') {
    return <Chip tone="amber">취소 · 지급 처리 중</Chip>;
  }
  return <StatusChip status={card.status} />;
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

function StatBlock({
  cell,
  issued,
  onIssue,
}: {
  cell: StatCell;
  issued: boolean;
  onIssue: () => void;
}) {
  const showIssued = issued && cell.link === 'tax';
  return (
    <div>
      <div className={s.k}>{cell.k}</div>
      <div className={`${s.v} ${cell.dim && !showIssued ? s.dim : ''}`}>
        {cell.amount !== undefined ? <Money amount={cell.amount} /> : null}
        {cell.text ? (showIssued ? DEMO.taxIssued : cell.text) : null}
      </div>
      {cell.link === 'fee' ? (
        <span className={s.statLink}>
          <Button variant="text" type="button">
            {DEMO.feeReceipt}
          </Button>
        </span>
      ) : null}
      {cell.link === 'withhold' ? (
        <span className={s.statLink}>
          <Button variant="text" type="button">
            {DEMO.withholdReceipt}
          </Button>
        </span>
      ) : null}
      {cell.link === 'tax' && !issued ? (
        <span className={s.statLink}>
          <Button variant="tint" size="sm" type="button" onClick={onIssue}>
            {DEMO.taxIssue}
          </Button>
        </span>
      ) : null}
    </div>
  );
}

function Card({ card }: { card: SettleSCard }) {
  const [issued, setIssued] = useState(false);

  return (
    <section className={s.card} aria-label={card.title}>
      <div className={s.ph}>
        <div>
          <div className={s.top}>
            {cardChip(card)}
            <span className={s.when}>{card.when}</span>
          </div>
          <p className={s.ti}>{card.title}</p>
          <div className={s.mt}>
            {card.who} · {card.agreedLabel}
          </div>
        </div>
        <div className={s.rt}>
          <div className={s.k}>{card.receivedLabel}</div>
          <div className={s.bigV}>
            <Money amount={card.received} />
          </div>
          <div className={s.lk2}>
            <Link to="/s/contracts/c-ondo">{DEMO.contractView}</Link>
          </div>
        </div>
      </div>

      {!card.empty && card.stats.length > 0 ? (
        <div className={s.stats}>
          {card.stats.map((c) => (
            <StatBlock key={c.k} cell={c} issued={issued} onIssue={() => setIssued(true)} />
          ))}
        </div>
      ) : null}

      {!card.empty && card.rows.length > 0 ? (
        <div className={s.tl}>
          {card.rows.map((r) => (
            <TxLine key={`${r.date}-${r.kind}`} row={r} />
          ))}
        </div>
      ) : null}

      {card.cancelBox ? (
        <div className={s.cxb}>
          <b>취소 정산 계산 — 정산은 계약당 한 번</b>
          {card.cancelBox.lines.map((x) => (
            <div key={x.k} className={`${s.cxr} ${x.tot ? s.tot : ''}`}>
              <span>{x.k}</span>
              <span>{x.v}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function SettleSupplier() {
  const [params] = useSearchParams();
  const mock = resolveSettleSMock(params.get('mock'), params.get('contract'));
  const demo = settleSDemoOf(mock);

  return (
    <div className={s.page} data-screen="Settle-Supplier">
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{DEMO.title}</h1>
          <p className={s.sub}>{demo.sub}</p>
        </div>
        <Link to={DEMO.contractsHref}>{DEMO.contractsLabel}</Link>
      </div>

      <div className={s.sum} aria-label="요약">
        {demo.sum.map((m) => (
          <div key={m.k}>
            <p className={s.k}>
              {m.k}
              {m.link ? (
                <>
                  {' · '}
                  <Link to={DEMO.accountHref}>{DEMO.bizLink}</Link>
                </>
              ) : null}
            </p>
            <div className={s.v}>
              {typeof m.v === 'number' ? <Money amount={m.v} /> : m.v}
            </div>
            <div className={s.s}>{m.s}</div>
          </div>
        ))}
      </div>

      {demo.indiv ? (
        <div className={s.exb} role="note">
          <Chip tone="amber">예시</Chip>
          <span>{DEMO.indivNote}</span>
          <Link to={DEMO.accountHref}>정산 정보</Link>
        </div>
      ) : null}

      {demo.one ? (
        <div className={s.banner}>
          <span>
            {DEMO.oneBanner} — <b>{demo.oneName}</b>
          </span>
          <Link to="/s/settlements">{DEMO.allView}</Link>
        </div>
      ) : null}

      {demo.cards.map((card) => (
        <div key={card.id + (card.group ?? '')}>
          {card.group ? <p className={s.grp}>{card.group}</p> : null}
          <Card card={card} />
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

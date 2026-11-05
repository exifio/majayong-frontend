/* 내 계약 — 보드 Contracts-Client · /c/contracts · M5
 * 상태: 서명 대기 / 예치 대기 / 진행 중 / 검수 대기 / 완료 / 취소 요청 중 / 결렬 — 예치 기한 초과 / 마감 지남
 * F-11 · F-13 · 11.3. 카드마다 행동은 tint 하나. 화면은 값을 계산하지 않고 data의 값을 그린다. */
import { useSearchParams } from 'react-router-dom';
import { Button, Chip, Deadline, Money, StatusChip, chipToneOf } from '@/components/ui';
import {
  CHAT_HREF,
  ENDED,
  PAGE,
  SETTLEMENTS_HREF,
  SETTLEMENTS_PLAIN_HREF,
  cancelHref,
  cardOf,
  contractHref,
  countsOf,
  resolveContractsMock,
  type CardView,
  type DueView,
  type EndedView,
  type SegView,
  type StepView,
} from './Contracts-Client.data';
import s from './Contracts-Client.module.css';

export default function ContractsClient() {
  const [params] = useSearchParams();
  const mock = resolveContractsMock(params.get('mock'));
  const card = cardOf(mock);
  const counts = countsOf(mock);

  return (
    <div className={s.page} data-screen="Contracts-Client">
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{PAGE.title}</h1>
          <p className={s.sub}>{PAGE.sub}</p>
        </div>
        <Button variant="text" to={SETTLEMENTS_HREF}>
          {PAGE.settle}
        </Button>
      </div>

      <div className={s.cnt} aria-label={PAGE.countsLabel}>
        {counts.map((c) => (
          <span key={c.name} className={`${s.cntItem} ${c.hot ? s.hot : ''}`}>
            {c.name}
            <b>{c.n}</b>
          </span>
        ))}
      </div>

      <ContractCard card={card} />

      <section className={s.ended} aria-label={PAGE.endedLabel}>
        <div className={s.endedHead}>
          <b>
            {PAGE.endedLabel} · {ENDED.length}건
          </b>
          <span>{PAGE.endedTail}</span>
        </div>
        {ENDED.map((e) => (
          <EndedRow key={e.title} row={e} />
        ))}
      </section>
    </div>
  );
}

function DueLine({ due }: { due: DueView }) {
  if (due.kind === 'text') {
    return <span className={`${s.dd} ${due.strong ? s.ddSoon : ''}`}>{due.text}</span>;
  }
  return (
    <span className={s.dd}>
      <Deadline label={due.label} at={due.at} now={due.now} actionable={due.actionable} />
      {due.note ? ` · ${due.note}` : ''}
    </span>
  );
}

function ContractCard({ card }: { card: CardView }) {
  return (
    <article className={`${s.card} ${card.now ? s.cardNow : ''}`} aria-label={card.title}>
      <div className={s.body}>
        <div className={s.hd}>
          <Chip tone={chipToneOf(card.status)}>{card.chipLabel}</Chip>
          <DueLine due={card.due} />
        </div>

        <div className={s.row1}>
          <div>
            <h3 className={s.ti}>{card.title}</h3>
            <p className={s.mt}>
              {card.who}
              <span className={s.sep}>|</span>
              {card.period}
              <span className={s.sep}>|</span>
              지급 중간 50 : 최종 50
            </p>
          </div>
          <div className={s.amt}>
            <div className={s.amtK}>{PAGE.agreedLabel}</div>
            <div className={s.amtV}>
              <Money amount={PAGE.agreed} size="row" />
            </div>
          </div>
        </div>

        <Stepper steps={card.steps} />

        <div className={s.segs}>
          {card.segs.map((g) => (
            <Segment key={g.name} seg={g} />
          ))}
        </div>
      </div>

      <div className={s.foot}>
        <p className={s.todo}>
          <b>{PAGE.todoLabel}</b>
          {card.todo.map((p, i) =>
            typeof p === 'number' ? <Money key={i} amount={p} /> : <span key={i}>{p}</span>,
          )}
        </p>
        <div className={s.acts}>
          {card.cancelLink ? (
            <Button variant="text" to={cancelHref()}>
              {PAGE.cancelReq}
            </Button>
          ) : null}
          <Button variant="text" to={contractHref()}>
            {PAGE.contractDoc}
          </Button>
          {card.plainChat ? (
            <Button variant="text" to={CHAT_HREF}>
              {PAGE.chat}
            </Button>
          ) : null}
          {card.late ? (
            <>
              <Button variant="ghost" size="sm" to={CHAT_HREF}>
                {PAGE.chatSchedule}
              </Button>
              <Button variant="warn" size="sm" to={cancelHref()}>
                {PAGE.cancelReq}
              </Button>
            </>
          ) : null}
          {card.act.kind === 'link' ? (
            <Button variant="tint" size="sm" to={card.act.to}>
              {card.act.label}
            </Button>
          ) : null}
          {card.act.kind === 'off' ? (
            <Button variant="tint" size="sm" disabled disabledReason={card.act.reason}>
              {card.act.label}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** 5단계 — 이 화면 안에서만 쓰는 진행 막대(공통 Stepper 없음) */
function Stepper({ steps }: { steps: StepView[] }) {
  return (
    <ol className={s.steps} aria-label={PAGE.stepsLabel}>
      {steps.map((st) => (
        <li key={st.name} className={`${s.step} ${s[`step_${st.state}`]}`} data-step={st.state}>
          <i className={s.dot} aria-hidden="true" />
          <span className={s.lb}>
            <b>{st.name}</b>
            {st.sub ? <em>{st.sub}</em> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Segment({ seg }: { seg: SegView }) {
  return (
    <div className={s.sg}>
      <div className={s.sgH}>
        <b>{seg.name}</b>
        <StatusChip status={seg.status} />
      </div>
      <div className={s.it}>
        <span className={seg.items[0].ok ? s.ok : ''}>{seg.items[0].text}</span>
        {' · '}
        <span className={seg.items[1].ok ? s.ok : ''}>{seg.items[1].text}</span>
      </div>
      <div className={s.pay}>
        {seg.amtLabel} <b><Money amount={seg.amount} /></b> · {seg.pay}
      </div>
    </div>
  );
}

function EndedRow({ row }: { row: EndedView }) {
  return (
    <div className={`${s.ed} ${row.status === '결렬' ? s.edOff : ''}`}>
      <div className={s.lt}>
        <StatusChip status={row.status} />
        <div className={s.edTi}>{row.title}</div>
        <div className={s.edMt}>
          {row.who}
          <span className={s.sep}>|</span>합의 <Money amount={row.amount} />
          <span className={s.sep}>|</span>
          {row.when}
        </div>
        {row.note ? <p className={s.nt}>{row.note}</p> : null}
      </div>
      <div className={s.rt}>
        {row.review ? <span className={s.rv}>{row.review}</span> : null}
        <Button variant="text" to={SETTLEMENTS_PLAIN_HREF}>
          {PAGE.settleRow}
        </Button>
      </div>
    </div>
  );
}

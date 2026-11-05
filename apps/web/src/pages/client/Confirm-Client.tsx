/* 명세 확정 — 보드 Confirm-Client · /c/drafts/:did/confirm · M2
 * routes states: 없음. 날짜 오류 · 동의는 화면 상태로 처리한다.
 * AI 금액 없음. 확정 CTA → 명세 보기(모집 시작됨). */
import { useId, useState } from 'react';
import { Attr, Button, ConfirmCheck } from '@/components/ui';
import { PageHeader } from '@/components/layout/Chrome';
import { formatWon } from '@/lib/format';
import {
  CONSENT_LABEL,
  CONSENT_VERSION,
  DEMO,
  DRAFT_HREF,
  SPEC_STARTED_HREF,
  isStartBeforeEnd,
} from './Confirm-Client.data';
import s from './Confirm-Client.module.css';

export default function ConfirmClient() {
  const [start, setStart] = useState(DEMO.defaultStart);
  const [end, setEnd] = useState(DEMO.defaultEnd);
  const [agreed, setAgreed] = useState(false);
  const startId = useId();
  const endId = useId();

  const dateOk = isStartBeforeEnd(start, end);
  const canSubmit = dateOk && agreed;
  const disabledReason = !dateOk ? DEMO.needDate : !agreed ? DEMO.needConsent : undefined;

  return (
    <div className={s.page} data-screen="Confirm-Client">
      <PageHeader title={DEMO.pageTitle} description={DEMO.pageLead} />

      <section className={s.card} aria-labelledby="s1">
        <h2 id="s1">1. 확정될 범위</h2>
        <p className={s.lead}>{DEMO.scopeLead}</p>

        <p className={s.grp}>포함 · {DEMO.included.length}건</p>
        {DEMO.included.map((item) => (
          <div key={item.id} className={s.item}>
            <div className={s.itemName}>{item.name}</div>
            <div className={s.itemDesc}>{item.description}</div>
            <div className={s.conds}>
              <Attr label="공급자와 정할 것">{item.conditions.join(' · ')}</Attr>
              {item.memo ? <Attr label="메모">{item.memo}</Attr> : null}
            </div>
          </div>
        ))}

        <p className={s.grp}>이번 범위에서 제외 · {DEMO.excluded.length}건</p>
        {DEMO.excluded.map((item) => (
          <div key={item.id} className={`${s.item} ${s.out}`}>
            <span className={s.outName}>{item.name}</span>
            <span className={s.outWhy}>{item.reason}</span>
          </div>
        ))}
      </section>

      <section className={s.card} aria-labelledby="s2">
        <h2 id="s2">2. 등록 정보와 모집 기간</h2>
        <p className={s.lead}>제목 · 요약 · 필요 기술은 기능(블록) 이름에서 자동으로 만듭니다. 적으신 문장은 목록에 쓰지 않습니다.</p>
        <dl className={s.dl}>
          <dt>제목</dt>
          <dd>
            {DEMO.title}
            <span className={s.dlHint}>{DEMO.titleHint}</span>
          </dd>
          <dt>요약</dt>
          <dd>{DEMO.summary}</dd>
          <dt>필요 기술</dt>
          <dd>{DEMO.skills}</dd>
          <dt>희망 예산</dt>
          <dd>
            {formatWon(DEMO.hopeBudget)}
            <span className={s.dlHint}>{DEMO.hopeBudgetHint}</span>
          </dd>
        </dl>

        <hr className={s.hr} />

        <div className={s.dates}>
          <div className={s.field}>
            <label className={s.lbl} htmlFor={startId}>모집 시작</label>
            <input
              className={`${s.input} ${dateOk ? '' : s.inputErr}`}
              id={startId}
              type="text"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-invalid={!dateOk}
              aria-describedby={dateOk ? `${startId}-hint` : `${startId}-err`}
            />
          </div>
          <div className={s.field}>
            <label className={s.lbl} htmlFor={endId}>모집 마감</label>
            <input
              className={s.input}
              id={endId}
              type="text"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
        {dateOk ? (
          <p id={`${startId}-hint`} className={s.hint}>{DEMO.dateHint}</p>
        ) : (
          <p id={`${startId}-err`} className={s.err} role="alert">{DEMO.dateError}</p>
        )}
      </section>

      <section className={s.card} aria-labelledby="s3">
        <h2 id="s3">3. 공개 범위 동의</h2>
        <p className={s.lead}>{DEMO.pubLead}</p>

        <div className={s.pub} aria-label="공개 범위">
          {DEMO.pubCards.map((card) => (
            <div key={card.title} className={s.pubCard}>
              <p className={s.pubTitle}>
                {card.title}
                <span className={s.pubWho}>{card.who}</span>
              </p>
              <p className={s.pubBody}>{card.body}</p>
            </div>
          ))}
        </div>

        <p className={s.hide}>
          <b>공개하지 않는 것</b> — {DEMO.hideNote}
        </p>

        <div className={s.consent}>
          <ConfirmCheck checked={agreed} onChange={setAgreed}>
            <span className={s.consentLabel}>{CONSENT_LABEL}</span>
          </ConfirmCheck>
          <p className={s.ver}>{CONSENT_VERSION}</p>
        </div>
      </section>

      <div className={s.foot}>
        <Button variant="ghost" to={DRAFT_HREF}>초안으로 돌아가기</Button>
        {canSubmit ? (
          <Button variant="primary" size="lg" to={SPEC_STARTED_HREF}>확정하고 공급자 모집 시작</Button>
        ) : (
          <Button variant="primary" size="lg" disabled disabledReason={disabledReason}>
            확정하고 공급자 모집 시작
          </Button>
        )}
      </div>
      {!dateOk && <p className={s.after}>{DEMO.needDate}</p>}
      <p className={s.after}>{DEMO.afterNote}</p>
    </div>
  );
}

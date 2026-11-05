/* 견적 작성 — 보드 QuoteWrite-Supplier · /s/projects/:pid/quote · M3
 * 상태: 작성 중 / 모두 불가 / 연락처 가림 / 재견적
 * F-05 · 11.2 · ㉜. 항목별 금액 · AI 단가 없음. */
import { useEffect, useId, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, MaskedText, Note } from '@/components/ui';
import { formatWon } from '@/lib/format';
import {
  ASK_MAX,
  DEMO,
  FIND_HREF,
  MSG_MAX,
  PROJECT_HREF,
  SUBMIT_HREF,
  feeOf,
  formatWonInput,
  netOf,
  parseWonInput,
  quoteWriteSeedOf,
  resolveQuoteWriteMock,
} from './QuoteWrite-Supplier.data';
import { useSession } from '@/app/session';
import { LiveQuoteWrite } from '@/components/project/LiveQuoteWrite';
import s from './QuoteWrite-Supplier.module.css';
import { AuthRequired } from '@/components/system/AuthRequired';
import { DEMO_DATA_ENABLED } from '@/lib/feature-flags';

export default function QuoteWriteSupplier() {
  const { apiAccessToken } = useSession();
  const { pid } = useParams();
  const [params] = useSearchParams();
  const mock = resolveQuoteWriteMock(params.get('mock'));
  const seed = quoteWriteSeedOf(mock);

  const [okById, setOkById] = useState(seed.okById);
  const [amount, setAmount] = useState(seed.amount);
  const [amtText, setAmtText] = useState(formatWonInput(seed.amount));
  const [days, setDays] = useState(seed.days);
  const [daysText, setDaysText] = useState(seed.days ? String(seed.days) : '');
  const [message, setMessage] = useState(seed.message);
  const [asks, setAsks] = useState(seed.asks);

  const amtId = useId();
  const daysId = useId();
  const msgId = useId();

  useEffect(() => {
    const next = quoteWriteSeedOf(resolveQuoteWriteMock(params.get('mock')));
    setOkById(next.okById);
    setAmount(next.amount);
    setAmtText(formatWonInput(next.amount));
    setDays(next.days);
    setDaysText(next.days ? String(next.days) : '');
    setMessage(next.message);
    setAsks(next.asks);
  }, [params]);

  if (apiAccessToken.trim()) return <LiveQuoteWrite pid={pid} styles={s} />;

  if (!DEMO_DATA_ENABLED) return <AuthRequired />;

  const okCnt = seed.items.filter((it) => okById[it.id]).length;
  const allNo = okCnt === 0;
  const canSubmit = !allNo;
  const fee = feeOf(amount);
  const net = netOf(amount);
  const msgLen = seed.masked ? message.replace(/\s+/g, ' ').trim().length : message.length;

  const setOk = (id: string, ok: boolean) => {
    setOkById((prev) => ({ ...prev, [id]: ok }));
  };

  const onAmtChange = (raw: string) => {
    const n = parseWonInput(raw);
    setAmount(n);
    setAmtText(raw === '' ? '' : formatWonInput(n));
  };

  const onDaysChange = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '');
    setDaysText(digits);
    setDays(digits ? Number(digits) : 0);
  };

  const addAsk = () => {
    if (asks.length >= ASK_MAX) return;
    setAsks((prev) => [...prev, '']);
  };

  return (
    <div className={s.page} data-screen="QuoteWrite-Supplier">
      <p className={s.crumb}>
        <Link to={FIND_HREF}>프로젝트 찾기</Link>
        {' › '}
        <Link to={PROJECT_HREF}>{DEMO.projectTitle}</Link>
        {' › '}
        {seed.requote ? DEMO.crumbRe : DEMO.crumbWrite}
      </p>

      <div className={s.head}>
        <h1 className={s.title}>{seed.requote ? DEMO.titleRe : DEMO.title}</h1>
        <p className={s.sub}>
          항목마다 할 수 있는지 고르고, 총액과 기간만 적어 주세요.{' '}
          <b>항목별 금액은 받지 않습니다.</b> 총액은 부가세 포함으로 적어 주세요. 세부 조건은 의뢰인이
          문의 채팅을 열면 함께 정합니다.
        </p>
      </div>

      {seed.requote ? (
        <div className={s.reBand} role="status">
          <b>{DEMO.reNoteTitle}</b>
          <p>{DEMO.reNoteBody}</p>
          <ul>
            {DEMO.reChanges.map((c) => (
              <li key={c.name}>
                <b>{c.name}</b> — {c.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {allNo ? (
        <div className={s.allNoNote}>
          <Note title={DEMO.allNoNote} />
        </div>
      ) : null}

      <div className={s.lay}>
        <div>
          <section className={s.card} aria-labelledby="h-it">
            <h2 id="h-it">
              항목별 가능 여부
              <span>
                할 수 있는 항목 {okCnt} / {seed.items.length}
              </span>
            </h2>
            <p className={s.sd}>{DEMO.itemsLead}</p>
            <div className={s.items}>
              {seed.items.map((it) => {
                const ok = !!okById[it.id];
                return (
                  <div key={it.id} className={`${s.ir} ${ok ? '' : s.irDis}`}>
                    <div style={{ minWidth: 0 }}>
                      <div className={s.nm}>
                        {it.name}
                        {it.change ? <span className={s.chg}>{it.change}</span> : null}
                      </div>
                      <div className={s.ds}>{it.desc}</div>
                      {ok ? (
                        <div className={s.cd}>
                          공급자와 정할 것 · <b>{it.cond}</b>
                        </div>
                      ) : (
                        <div className={s.ex}>이 항목은 계약 범위에 들어가지 않습니다</div>
                      )}
                    </div>
                    <span className={s.tg} role="group" aria-label={`${it.name} 가능 여부`}>
                      <button
                        type="button"
                        className={`${s.tgBtn} ${ok ? s.tgOn : ''}`}
                        aria-pressed={ok}
                        onClick={() => setOk(it.id, true)}
                      >
                        가능
                      </button>
                      <button
                        type="button"
                        className={`${s.tgBtn} ${!ok ? s.tgNo : ''}`}
                        aria-pressed={!ok}
                        onClick={() => setOk(it.id, false)}
                      >
                        불가
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
            {allNo ? <p className={s.awarn}>{DEMO.allNoInline}</p> : null}
          </section>

          <section className={s.card} aria-labelledby="h-amt">
            <h2 id="h-amt">총액과 기간</h2>
            <p className={s.sd}>{DEMO.amtLead}</p>
            <div className={s.two}>
              <div className={s.field}>
                <label htmlFor={amtId}>{DEMO.amtLabel}</label>
                <div className={s.money}>
                  <input
                    id={amtId}
                    type="text"
                    inputMode="numeric"
                    value={amtText}
                    placeholder="0"
                    onChange={(e) => onAmtChange(e.target.value)}
                    aria-label={DEMO.amtLabel}
                  />
                  <span className={s.u}>원</span>
                </div>
                {amount > 0 ? (
                  <div className={s.netBox}>
                    {DEMO.feeUnderAmt} −{formatWon(fee)}
                    <br />
                    {DEMO.netUnderAmt}{' '}
                    <b>{formatWon(net)}</b>
                  </div>
                ) : null}
                {seed.requote ? <p className={s.prev}>{DEMO.rePrev}</p> : null}
              </div>
              <div className={s.field}>
                <label htmlFor={daysId}>{DEMO.daysLabel}</label>
                <div className={s.money}>
                  <input
                    id={daysId}
                    type="text"
                    inputMode="numeric"
                    value={daysText}
                    placeholder="0"
                    onChange={(e) => onDaysChange(e.target.value)}
                    aria-label={DEMO.daysLabel}
                  />
                  <span className={s.u}>일</span>
                </div>
                <p className={s.prev}>{DEMO.daysHint}</p>
              </div>
            </div>
          </section>

          <section className={s.card} aria-labelledby="h-msg">
            <h2 id="h-msg">지원 메시지</h2>
            <p className={s.sd}>{DEMO.msgLead}</p>
            {seed.masked ? (
              <>
                <div className={s.msgbox} aria-label="가려진 지원 메시지 미리보기">
                  <MaskedText text={message} />
                </div>
                <div className={s.maskNote}>
                  <Note title={DEMO.maskNoteTitle}>{DEMO.maskNoteBody}</Note>
                </div>
              </>
            ) : (
              <textarea
                id={msgId}
                className={s.msg}
                value={message}
                maxLength={MSG_MAX}
                onChange={(e) => setMessage(e.target.value)}
                aria-label="지원 메시지"
              />
            )}
            <p className={s.cnt}>
              {msgLen} / {MSG_MAX}자
            </p>

            <div className={s.askq}>
              <div className={s.ah}>
                <b>{DEMO.askTitle}</b>
                <span>{seed.asksEditable ? DEMO.askSub : DEMO.askSubRe}</span>
              </div>
              {seed.asksEditable ? (
                <>
                  {asks.map((q, i) => (
                    <div key={i} className={s.qrow}>
                      <span className={s.qn}>{i + 1}</span>
                      <input
                        type="text"
                        value={q}
                        aria-label={`질문 ${i + 1}`}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAsks((prev) => prev.map((x, j) => (j === i ? v : x)));
                        }}
                      />
                    </div>
                  ))}
                  <div className={s.qfoot}>
                    <button
                      type="button"
                      className={s.qadd}
                      disabled={asks.length >= ASK_MAX}
                      onClick={addAsk}
                    >
                      {DEMO.askAdd}
                    </button>
                    <span className={s.qnote}>{DEMO.askNote}</span>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>

        <aside className={s.rail}>
          <section className={s.sumc} aria-labelledby="h-sum">
            <h3 id="h-sum">{DEMO.summaryTitle}</h3>
            <div className={s.sr}>
              <span>총액</span>
              <b>{amount > 0 ? formatWon(amount) : '—'}</b>
            </div>
            <div className={s.sr}>
              <span>{DEMO.summaryFee}</span>
              <b>− {amount > 0 ? formatWon(fee) : '—'}</b>
            </div>
            <div className={`${s.sr} ${s.srTot}`}>
              <span>{DEMO.summaryNet}</span>
              <b>{amount > 0 ? formatWon(net) : '—'}</b>
            </div>
            <p className={s.sx}>{DEMO.summarySx}</p>
            <div className={s.sr}>
              <span>{DEMO.summaryOk}</span>
              <b>
                {okCnt} / {seed.items.length}
              </b>
            </div>
            <div className={s.sr} style={{ marginBottom: 18 }}>
              <span>{DEMO.summaryDays}</span>
              <b>{days > 0 ? `${days}일` : '—'}</b>
            </div>

            {canSubmit ? (
              <Button variant="primary" full to={SUBMIT_HREF}>
                {DEMO.submit}
              </Button>
            ) : (
              <>
                <Button variant="primary" full disabled disabledReason={DEMO.submitDisabledReason}>
                  {DEMO.submit}
                </Button>
                <p className={s.why}>{DEMO.submitDisabledReason}</p>
              </>
            )}
          </section>

          <section className={s.afterCard} aria-labelledby="h-af">
            <h3 id="h-af">{DEMO.afterTitle}</h3>
            <ul className={s.after}>
              <li>
                의뢰인의 제안 비교에 <b>내 카드</b>가 지원한 순서대로 놓입니다.
              </li>
              <li>
                의뢰인이 <b>문의 채팅</b>을 열면 답할 수 있습니다. 먼저 채팅을 걸 수는 없습니다.
              </li>
              <li>
                금액 · 기간은 채팅의 <b>견적 수정</b>으로 고칠 수 있습니다.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

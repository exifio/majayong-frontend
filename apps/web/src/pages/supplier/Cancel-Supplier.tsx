/* 공급자 취소 요청 받음 — 보드 Cancel-Supplier · /s/contracts/:cid/cancel · M5
 * 상태: 요청 받음 / 이의 작성 / 운영자 판정 중 / 정산 확정
 * F-26 · 13.2. 받을 보상액만. 파란 버튼은 동의하기 하나. */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  Chip,
  Deadline,
  Money,
  SelectCards,
  TextAreaField,
} from '@/components/ui';
import { formatWon } from '@/lib/format';
import { useSession } from '@/app/session';
import { LiveCancellation } from '@/components/contract/LiveCancellation';
import { AuthRequired } from '@/components/system/AuthRequired';
import { DEMO_DATA_ENABLED } from '@/lib/feature-flags';
import {
  CAUSE_OPTIONS,
  CHAT_HREF,
  CONTRACT_HREF,
  DEMO,
  DEFAULT_CID,
  EVIDENCE,
  LIST_HREF,
  SETTLE_HREF,
  cancelSDemoOf,
  resolveCancelSMock,
  type CancelSMock,
} from './Cancel-Supplier.data';
import s from './Cancel-Supplier.module.css';

export default function CancelSupplier() {
  const { cid = DEFAULT_CID } = useParams();
  const [params] = useSearchParams();
  const { apiAccessToken } = useSession();
  const navigate = useNavigate();
  const mock = resolveCancelSMock(params.get('mock'));
  const demo = cancelSDemoOf(mock);

  const [cause, setCause] = useState('client');
  const [rate, setRate] = useState('70');
  const [explain, setExplain] = useState<string>(DEMO.explainDefault);
  const [evidence, setEvidence] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(EVIDENCE.map((e) => [e.id, e.defaultOn])),
  );

  useEffect(() => {
    resolveCancelSMock(params.get('mock'));
    setCause('client');
    setRate('70');
    setExplain(DEMO.explainDefault);
    setEvidence(Object.fromEntries(EVIDENCE.map((e) => [e.id, e.defaultOn])));
  }, [params]);

  const goMock = (next: CancelSMock) => {
    navigate(`?mock=${encodeURIComponent(next)}`, { replace: true });
  };

  const rateNum = Number(rate);
  const rateOk = Number.isFinite(rateNum) && rateNum >= 50;

  if (apiAccessToken.trim()) return <LiveCancellation cid={cid} role="SUPPLIER" />;
  if (!DEMO_DATA_ENABLED) return <AuthRequired />;

  void cid;

  return (
    <div className={s.page} data-screen="Cancel-Supplier">
      <p className={s.crumb}>
        <Link to={LIST_HREF}>{DEMO.crumbContracts}</Link>
        {' › '}
        <Link to={CONTRACT_HREF}>{DEMO.crumbContract}</Link>
        {' › '}
        취소 요청
      </p>

      <div className={s.head}>
        <h1 className={s.title}>{demo.title}</h1>
        <p className={s.sub}>{demo.sub}</p>
      </div>

      {demo.open ? (
        <Band tone="warn" title={DEMO.openBandTitle}>
          {DEMO.openBandBody}
        </Band>
      ) : null}

      {demo.open && !demo.form ? (
        <p className={s.dlWrap}>
          <Deadline label="응답 기한" at={DEMO.respondBy} actionable />
          <span className={s.dlHint}> · {DEMO.respondHint}</span>
        </p>
      ) : null}

      {demo.wait ? (
        <Band tone="wait" title={DEMO.waitTitle}>
          {DEMO.waitBody}
        </Band>
      ) : null}

      {demo.done ? (
        <div className={s.doneBand}>
          <Band tone="done" title={DEMO.doneTitle}>
            {DEMO.doneBody}
          </Band>
          <Button variant="primary" size="sm" to={SETTLE_HREF}>
            {DEMO.settleCta}
          </Button>
        </div>
      ) : null}

      <div className={s.lay}>
        <div>
          <section className={s.blk} aria-labelledby="h-rq">
            <h2 id="h-rq">의뢰인의 취소 요청</h2>
            <div className={s.rq}>
              <span className={s.av} aria-hidden="true">
                정
              </span>
              <div>
                <div className={s.nm}>{DEMO.clientName}</div>
                <div className={s.meta}>{DEMO.requestWhen}</div>
                <div className={s.tags}>
                  <Chip tone="amber">{DEMO.reasonChip}</Chip>
                  <Chip tone="outline">납품 전</Chip>
                  <Chip tone="outline">예치 24시간 지남</Chip>
                </div>
              </div>
            </div>
            <p className={s.quote}>{DEMO.quote}</p>
            <div className={s.kv}>
              <div>
                <div className={s.k}>작업</div>
                <div className={s.v}>{DEMO.workSince}</div>
              </div>
              <div>
                <div className={s.k}>진행 중인 구간</div>
                <div className={s.v}>{DEMO.stageLabel}</div>
              </div>
            </div>
          </section>

          <section className={s.blk} aria-labelledby="h-calc">
            <h2 id="h-calc">{demo.calcH}</h2>
            {demo.lines.map((x) => (
              <div key={x.k} className={`${s.r} ${x.tot ? s.tot : ''}`}>
                <span>
                  {x.k}
                  {x.s ? <i>{x.s}</i> : null}
                </span>
                <b>{x.v < 0 ? `− ${formatWon(Math.abs(x.v))}` : <Money amount={x.v} />}</b>
              </div>
            ))}
            <p className={s.cfoot}>취소 정산은 계약당 한 번이고, 실제 지급은 운영자가 처리합니다.</p>
          </section>

          {demo.open && !demo.form ? (
            <section className={s.blk} aria-label="답하기">
              <p className={s.hint}>{DEMO.agreeHint}</p>
              <div className={s.acts}>
                <Button variant="tint" onClick={() => goMock('이의 작성')}>
                  {DEMO.dispute}
                </Button>
                <Button variant="primary" onClick={() => goMock('정산 확정')}>
                  {DEMO.agree}
                </Button>
              </div>
            </section>
          ) : null}

          {demo.form ? (
            <section className={s.blk} aria-labelledby="h-ob">
              <h2 id="h-ob">{DEMO.objTitle}</h2>
              <p className={s.hint}>{DEMO.objQ}</p>
              <SelectCards
                label="주장하는 사유"
                value={cause}
                onChange={setCause}
                options={CAUSE_OPTIONS.map((o) => ({
                  key: o.key,
                  label: (
                    <span className={s.cardLabel}>
                      <span className={s.cardTitle}>{o.label}</span>
                      <span className={s.cardDesc}>{o.desc}</span>
                    </span>
                  ),
                }))}
              />
              <div className={s.rate}>
                <span>{DEMO.rateLabel}</span>
                <input
                  className={s.rateInp}
                  aria-label="보상 비율"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
                <span>{DEMO.rateHint}</span>
              </div>
              {!rateOk ? <p className={s.rateNote}>{DEMO.rateMinNote}</p> : null}
              <div className={s.fields}>
                <TextAreaField
                  label={DEMO.explainLabel}
                  value={explain}
                  onChange={(e) => setExplain(e.target.value)}
                />
              </div>
              <p className={s.hint}>{DEMO.evidenceLabel}</p>
              <ul className={s.ev}>
                {EVIDENCE.map((e) => (
                  <li key={e.id}>
                    <label className={s.evItem}>
                      <input
                        type="checkbox"
                        checked={!!evidence[e.id]}
                        onChange={(ev) =>
                          setEvidence((prev) => ({ ...prev, [e.id]: ev.target.checked }))
                        }
                      />
                      <span>
                        {e.label}
                        {e.hint ? <i>{e.hint}</i> : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className={s.hint}>{DEMO.sendHint}</p>
              <div className={s.acts}>
                <Button variant="ghost" onClick={() => goMock('요청 받음')}>
                  취소
                </Button>
                <Button
                  variant="warn"
                  disabled={!rateOk || !explain.trim()}
                  disabledReason={
                    !rateOk
                      ? DEMO.rateMinNote
                      : !explain.trim()
                        ? '설명을 적어 주세요'
                        : undefined
                  }
                  onClick={() => goMock('운영자 판정 중')}
                >
                  {DEMO.sendObj}
                </Button>
              </div>
            </section>
          ) : null}

          {demo.wait ? (
            <section className={s.blk} aria-labelledby="h-my">
              <h2 id="h-my">{DEMO.myObjTitle}</h2>
              <div className={s.kv}>
                <div>
                  <div className={s.k}>주장하는 사유</div>
                  <div className={s.v}>{DEMO.myReason}</div>
                </div>
                <div>
                  <div className={s.k}>요청한 보상</div>
                  <div className={s.v}>{DEMO.myRate}</div>
                </div>
                <div>
                  <div className={s.k}>붙인 근거</div>
                  <div className={s.v}>{DEMO.myEvidenceCount}</div>
                </div>
              </div>
              <p className={s.quote}>{DEMO.explainDefault}</p>
            </section>
          ) : null}
        </div>

        <aside className={s.rail}>
          <section className={s.pv} aria-labelledby="h-ct">
            <h3 id="h-ct">계약</h3>
            <p className={s.ctTitle}>{DEMO.contractTitle}</p>
            <div className={s.r2}>
              <span>합의 금액</span>
              <b>
                <Money amount={DEMO.agreed} />
              </b>
            </div>
            <div className={s.r2}>
              <span>지급 비율</span>
              <b>중간 50 : 최종 50</b>
            </div>
            <div className={s.r2}>
              <span>상태</span>
              <b>{demo.stateTxt}</b>
            </div>
            <p className={s.sideLinks}>
              <Link to={CONTRACT_HREF}>계약서 보기</Link>
              {' · '}
              <Link to={CHAT_HREF}>채팅</Link>
            </p>
          </section>

          <section className={s.pv} aria-labelledby="h-fl">
            <h3 id="h-fl">진행</h3>
            <ol className={s.flow}>
              {demo.flow.map((f) => (
                <li key={f.b} data-state={f.state}>
                  <b>{f.b}</b>
                  <span>{f.s}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className={s.pv} aria-labelledby="h-rl">
            <h3 id="h-rl">{DEMO.rulesTitle}</h3>
            <ul className={s.rules}>
              {DEMO.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

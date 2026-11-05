/* 결제(예치) — 보드 Escrow-Client · /c/contracts/:cid/escrow · M5
 * 상태: 결제 전 / 결제 실패 / 확인 중 / 예치 완료
 * F-13 · 11절. 실제 결제 없이 ?mock=으로만 이어 보인다. */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  ConfirmCheck,
  Deadline,
  Money,
  SelectCards,
  StatusChip,
} from '@/components/ui';
import {
  DEMO,
  DEFAULT_CID,
  LIST_HREF,
  SETTLE_HREF,
  contractHref,
  escrowDemoOf,
  resolveEscrowMock,
} from './Escrow-Client.data';
import s from './Escrow-Client.module.css';

const PAY_OPTIONS = [
  {
    key: 'card',
    label: (
      <span className={s.pmLabel}>
        <b>카드</b>
        <span>신용 · 체크카드 · 바로 예치됩니다</span>
      </span>
    ),
  },
  {
    key: 'bank',
    label: (
      <span className={s.pmLabel}>
        <b>계좌이체</b>
        <span>실시간 이체 · 입금이 확인되면 예치됩니다</span>
      </span>
    ),
  },
];

export default function EscrowClient() {
  const { cid = DEFAULT_CID } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveEscrowMock(params.get('mock'));
  const demo = escrowDemoOf(mock);

  const [pay, setPay] = useState('card');
  const [agreed, setAgreed] = useState(mock === '결제 실패');
  const doneTimer = useRef<number | null>(null);

  useEffect(() => {
    setPay('card');
    setAgreed(resolveEscrowMock(params.get('mock')) === '결제 실패');
    return () => {
      if (doneTimer.current != null) window.clearTimeout(doneTimer.current);
    };
  }, [params]);

  const goMock = (next: string) => {
    navigate(`?mock=${encodeURIComponent(next)}`, { replace: true });
  };

  const onDeposit = () => {
    goMock('확인 중');
    if (doneTimer.current != null) window.clearTimeout(doneTimer.current);
    doneTimer.current = window.setTimeout(() => goMock('예치 완료'), 900);
  };

  return (
    <div className={s.page} data-screen="Escrow-Client">
      <p className={s.crumb}>
        <Link to={LIST_HREF}>내 계약</Link>
        {' › '}
        <Link to={contractHref(cid)}>{DEMO.title}</Link>
        {' › '}
        예치
      </p>

      <div className={s.head}>
        <h1 className={s.title}>{demo.isDone ? DEMO.titleDone : DEMO.titleBefore}</h1>
        <p className={s.sub}>{demo.isDone ? DEMO.subDone : DEMO.subBefore}</p>
      </div>

      {demo.showDeadline ? (
        <div className={s.deadlineRow}>
          <Deadline label="예치 기한" at={DEMO.escrowAt} actionable />
        </div>
      ) : null}

      {demo.isFail ? (
        <div className={s.bandGap}>
          <Band tone="warn" title={DEMO.failTitle}>
            {DEMO.failBody}
          </Band>
        </div>
      ) : null}

      {demo.isWait ? (
        <div className={s.bandGap}>
          <Band tone="wait" title={DEMO.waitTitle}>
            {DEMO.waitBody}
          </Band>
        </div>
      ) : null}

      {demo.isDone ? (
        <div className={s.bandGap}>
          <Band tone="done" title={DEMO.doneTitle}>
            {DEMO.doneBody}
          </Band>
        </div>
      ) : null}

      <div className={s.lay}>
        <div>
          <section className={s.card} aria-labelledby="h-ct">
            <h2 className={s.ct} id="h-ct">
              계약 요약
            </h2>
            <div className={s.who}>
              <div className={s.pf}>
                <span className={s.av} aria-hidden="true">
                  {DEMO.supplierInitial}
                </span>
                <div>
                  <div className={s.nm}>{DEMO.supplierName}</div>
                  <div className={s.mt}>{DEMO.supplierMeta}</div>
                </div>
              </div>
              <StatusChip status={demo.status} />
            </div>
            <div className={s.kv}>
              <div>
                <div className={s.k}>합의 금액</div>
                <div className={s.v}>
                  <Money amount={DEMO.agreed} />
                </div>
                <div className={s.s}>견적 2회차</div>
              </div>
              <div>
                <div className={s.k}>작업 기간</div>
                <div className={s.v}>42일</div>
                <div className={s.s}>{demo.periodSub}</div>
              </div>
              <div>
                <div className={s.k}>지급 비율</div>
                <div className={s.v}>{DEMO.payRatio}</div>
                <div className={s.s}>계약서에서 정함</div>
              </div>
            </div>
            <div className={s.stg}>
              <div className={s.stgBox}>
                <div className={s.k}>중간 구간</div>
                <div className={s.n}>{DEMO.midItems}</div>
                <div className={s.v}>
                  <Money amount={DEMO.stage} />
                </div>
              </div>
              <div className={s.stgBox}>
                <div className={s.k}>최종 구간</div>
                <div className={s.n}>{DEMO.finItems}</div>
                <div className={s.v}>
                  <Money amount={DEMO.stage} />
                </div>
              </div>
            </div>
            <p className={s.secLink}>
              <Link to={contractHref(cid)}>계약서 보기</Link>
              {' · '}두 분 모두 11월 4일 서명
            </p>
          </section>

          {demo.showPay ? (
            <section className={s.card} aria-labelledby="h-pm">
              <h2 className={s.ct} id="h-pm">
                결제 수단
              </h2>
              <p className={s.hint}>결제한 수단으로 환불됩니다.</p>
              <SelectCards
                label="결제 수단"
                options={PAY_OPTIONS}
                value={pay}
                onChange={(k) => {
                  if (!demo.isWait) setPay(k);
                }}
              />
            </section>
          ) : null}

          <section className={s.card} aria-labelledby="h-use">
            <h2 className={s.ct} id="h-use">
              예치금은 이렇게 쓰입니다
            </h2>
            <div className={s.steps}>
              {DEMO.steps.map((st) => (
                <div className={s.step} key={st.no}>
                  <span className={s.no}>{st.no}</span>
                  <b>{st.title}</b>
                  <p>{st.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={s.card} aria-labelledby="h-cx">
            <h2 className={s.ct} id="h-cx">
              취소하면
            </h2>
            <ul className={s.rules}>
              {DEMO.cancelRules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside>
          <section className={s.pay} aria-labelledby="h-pay">
            <h3 id="h-pay">{demo.payHeading}</h3>
            <div className={s.payRow}>
              <span>합의 금액</span>
              <b>
                <Money amount={DEMO.agreed} />
              </b>
            </div>
            <div className={s.payRow}>
              <span>플랫폼 수수료 5%</span>
              <b>
                <Money amount={DEMO.fee} />
              </b>
            </div>
            <div className={s.payTot}>
              <span>{demo.totLabel}</span>
              <Money amount={DEMO.escrow} size="row" />
            </div>

            {demo.showDeadline ? (
              <p className={s.dlNote}>
                11월 7일 23:59까지 예치 · {DEMO.deadlineNote}
              </p>
            ) : null}

            <p className={s.feeNote}>{DEMO.feeNote}</p>

            {demo.isDone ? (
              <>
                <div className={s.receipt}>
                  <div className={s.receiptRow}>
                    <span>결제 수단</span>
                    <b>{DEMO.receiptMethod}</b>
                  </div>
                  <div className={s.receiptRow}>
                    <span>결제 건 번호</span>
                    <b>{DEMO.receiptId}</b>
                  </div>
                  <div className={s.receiptRow}>
                    <span>예치 시각</span>
                    <b>{DEMO.receiptAt}</b>
                  </div>
                </div>
                <p className={s.feeNote}>
                  <Deadline label="작업 마감" at={DEMO.workDueAt} />
                </p>
                <Button variant="primary" full to={LIST_HREF}>
                  {DEMO.doneCta}
                </Button>
                <div className={s.settleBtn}>
                  <Button variant="ghost" full to={SETTLE_HREF}>
                    {DEMO.settleCta}
                  </Button>
                </div>
              </>
            ) : null}

            {demo.showAgree ? (
              <div className={s.agreeWrap}>
                <ConfirmCheck checked={agreed} onChange={setAgreed}>
                  {DEMO.agreeLabel}
                </ConfirmCheck>
              </div>
            ) : null}

            {demo.isBefore ? (
              <>
                <Button
                  variant="primary"
                  full
                  disabled={!agreed}
                  disabledReason={!agreed ? DEMO.disabledReason : undefined}
                  onClick={onDeposit}
                >
                  {DEMO.cta}
                </Button>
                <p className={s.tiny}>{DEMO.tinyBefore}</p>
              </>
            ) : null}

            {demo.isFail ? (
              <>
                <Button
                  variant="primary"
                  full
                  disabled={!agreed}
                  disabledReason={!agreed ? DEMO.disabledReason : undefined}
                  onClick={onDeposit}
                >
                  {DEMO.retryCta}
                </Button>
                <p className={s.tiny}>{DEMO.tinyFail}</p>
              </>
            ) : null}

            {demo.isWait ? (
              <>
                <Button variant="primary" full disabled disabledReason="결제사 확인이 끝날 때까지 기다려 주세요">
                  {DEMO.waitingCta}
                </Button>
                <p className={s.tiny}>{DEMO.tinyWait}</p>
              </>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}

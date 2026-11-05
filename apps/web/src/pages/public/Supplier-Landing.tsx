/* 공급자 랜딩 — 보드 Supplier-Landing · /supplier · M1
 * 상태: 기본(routes states=[]). 섹션 id: quote · criteria · cost
 * F-01 · 13.2. 헤더 CTA는 onnavy → 히어로 primary 하나. */
import { useSearchParams } from 'react-router-dom';
import { Button, Money } from '@/components/ui';
import { formatWon } from '@/lib/format';
import { resolveSlMock, slDemoOf } from './Supplier-Landing.data';
import s from './Supplier-Landing.module.css';

export default function SupplierLanding() {
  const [params] = useSearchParams();
  const data = slDemoOf(resolveSlMock(params.get('mock')));

  return (
    <div className={s.root} data-screen="Supplier-Landing">
      <section className={s.hero}>
        <div className={s.inner}>
          <div className={s.half}>
            <div>
              <span className={s.pill}>{data.pill}</span>
              <h1 className={s.hl}>{data.title}</h1>
              <p className={`${s.lead} ${s.leadOn}`}>{data.lead}</p>
              <div className={s.ctaRow}>
                <Button variant="primary" size="lg" to="/signup">
                  {data.cta}
                </Button>
                <Button variant="ghost" size="lg" to="#quote" className={s.ghostOnNavy}>
                  {data.ctaGhost}
                </Button>
              </div>
              <p className={`${s.sec} ${s.feeNote}`}>{data.feeNote}</p>
            </div>

            <div>
              <div className={s.demo} aria-label="예시 화면">
                <div className={s.demoHead}>
                  <span>{data.demoTitle}</span>
                  <span>예시 화면</span>
                </div>
                {data.quoteRows.map((row) => (
                  <div key={row.name} className={s.qr}>
                    <div>
                      <div className={s.nm}>{row.name}</div>
                      <div className={s.est}>{row.detail}</div>
                    </div>
                    {row.tone === 'ok' ? (
                      <span className={s.qbox}>{row.mark}</span>
                    ) : (
                      <span className={s.chipNo}>{row.mark}</span>
                    )}
                  </div>
                ))}
                <div className={s.totalRow}>
                  <div>
                    <div className={s.nm}>{data.totalLabel}</div>
                    <div className={s.est}>{data.periodLabel}</div>
                  </div>
                  <div className={s.totalMarks}>
                    <span className={`${s.qbox} ${s.qboxAmt}`}>
                      {formatWon(data.totalAmount)}
                    </span>
                    <span className={s.qbox}>{data.periodDays}</span>
                  </div>
                </div>
                <div className={s.sum}>
                  <span className={s.sumLabel}>{data.payoutLabel}</span>
                  <span className={s.sumValue}>
                    <Money amount={data.payoutAmount} size="row" />
                  </span>
                </div>
                <p className={s.demoFoot}>{data.demoFoot}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.band} id="quote">
        <div className={s.inner}>
          <h2 className={s.sh}>{data.quoteTitle}</h2>
          <p className={s.lead}>{data.quoteLead}</p>
          <div className={s.cols}>
            {data.quoteCards.map((card) => (
              <div key={card.title}>
                <div className={s.card}>
                  <h3 className={s.st}>{card.title}</h3>
                  <p className={s.sec} style={{ margin: 0 }}>
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.band} ${s.bandAlt}`}>
        <div className={s.inner}>
          <h2 className={s.sh}>{data.flowTitle}</h2>
          <p className={s.lead}>{data.flowLead}</p>
          <div className={`${s.cols} ${s.flowCols}`}>
            {data.flowSteps.map((step, i) => (
              <div key={step.title}>
                <div className={s.card}>
                  <span className={s.stepNum}>{String(i + 1).padStart(2, '0')}</span>
                  <h3 className={s.st}>{step.title}</h3>
                  <p className={s.sec} style={{ margin: 0 }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.band} id="criteria">
        <div className={s.inner}>
          <div className={s.half}>
            <div>
              <h2 className={s.sh}>{data.criteriaTitle}</h2>
              <p className={s.lead} style={{ marginBottom: 20 }}>
                {data.criteriaLead}
              </p>
              <ul className={s.chkl}>
                {data.criteriaChecks.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className={s.info}>
                <b>{data.criteriaInfo.split('.')[0]}.</b>
                {data.criteriaInfo.slice(data.criteriaInfo.indexOf('.') + 1)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${s.band} ${s.bandAlt}`} id="cost">
        <div className={s.inner}>
          <div className={s.half}>
            <div>
              <h2 className={s.sh}>{data.costTitle}</h2>
              <p className={s.lead} style={{ margin: 0 }}>
                {data.costLead}
              </p>
            </div>
            <div>
              <div className={s.card}>
                {data.costRows.map((row) => (
                  <div key={row.label} className={s.priceRow}>
                    <span>{row.label}</span>
                    <span className={s.priceValue}>{row.value}</span>
                  </div>
                ))}
                <div className={s.costExample}>
                  <p className={s.costExampleTitle}>{data.costExampleLabel}</p>
                  <div className={s.priceRow}>
                    <span>견적 금액</span>
                    <span>{formatWon(data.costExampleQuote)}</span>
                  </div>
                  <div className={s.priceRow}>
                    <span>수수료 5%</span>
                    <span>{formatWon(data.costExampleFee)}</span>
                  </div>
                  <div className={s.priceRow}>
                    <span>원천징수 3.3%</span>
                    <span>{formatWon(data.costExampleWithhold)}</span>
                  </div>
                  <div className={s.priceRow}>
                    <span>예상 수령액</span>
                    <span className={s.priceValue}>{formatWon(data.costExampleNet)}</span>
                  </div>
                </div>
                <p className={`${s.sec} ${s.costNote}`}>{data.costNote}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.bandNavy} id="start">
        <div className={s.inner}>
          <h2 className={s.sh}>{data.bottomTitle}</h2>
          <p className={s.lead}>{data.bottomLead}</p>
          <Button variant="onnavy" size="lg" to="/signup">
            {data.cta}
          </Button>
          <p className={s.ctaSub}>{data.bottomSub}</p>
        </div>
      </section>
    </div>
  );
}

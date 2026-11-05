/* 의뢰인 랜딩 — 보드 Main · / · M1
 * 상태: routes.ts states=[] → '기본'만. ?mock=기본 */
import { useSearchParams } from 'react-router-dom';
import { Button, Money } from '@/components/ui';
import { formatWon } from '@/lib/format';
import { mainDemoOf, resolveMainMock, type SpecItemTone } from './Main.data';
import s from './Main.module.css';

function siToneClass(tone: SpecItemTone): string {
  if (tone === 'pick') return s.siPick ?? '';
  if (tone === 'out') return s.siOut ?? '';
  return s.siDerived ?? '';
}

export default function Main() {
  const [params] = useSearchParams();
  const data = mainDemoOf(resolveMainMock(params.get('mock')));

  return (
    <div className={s.root} data-screen="Main">
      {/* 히어로 */}
      <section className={s.hero}>
        <div className={s.inner}>
          <div className={s.half}>
            <div>
              <span className={s.pill}>{data.pill}</span>
              <h1 className={s.hl}>{data.title}</h1>
              <p className={s.lead}>{data.lead}</p>
              <div className={s.ctaRow}>
                {/* 헤더 primary가 이미 있으므로 본문은 tint */}
                <Button variant="tint" size="lg" to="/signup">화면 초안 받아보기</Button>
                <Button variant="ghost" size="lg" to="#how">작동 방식 보기</Button>
              </div>
              <p className={`${s.sec} ${s.feeNote}`}>{data.feeNote}</p>
            </div>

            <div>
              <div className={s.demo} aria-label="예시 화면">
                <div className={s.demoHead}>
                  <span>{data.demoTitle}</span>
                  <span>예시 화면</span>
                </div>
                <div className={s.two}>
                  <div>
                    <div className={s.capt}>화면 초안 — 틀린 곳을 고치세요</div>
                    <div className={s.canvas}>
                      {data.canvasBlocks.map((name) => (
                        <div key={name} className={s.block}>
                          <span className={s.blockName}>{name}</span>
                          <span className={s.blockX} aria-hidden="true">×</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className={s.capt}>요구사항 명세</div>
                    {data.specItems.map((item) => (
                      <div key={item.name} className={`${s.si} ${siToneClass(item.tone)}`}>
                        <div className={s.siName}>{item.name}</div>
                        <div className={s.siDetail}>{item.detail}</div>
                      </div>
                    ))}
                    <div className={s.sum}>
                      <span className={s.sumLabel}>수수료 포함 예상 총액</span>
                      <span className={s.sumValue}><Money amount={data.aiTotal} size="row" /></span>
                    </div>
                    <p className={s.budgetHint}>
                      희망 예산 {formatWon(data.hopeBudget)} {data.budgetNote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 작동 방식 */}
      <section className={s.band} id="how">
        <div className={s.inner}>
          <h2 className={s.sh}>{data.howTitle}</h2>
          <p className={s.lead}>{data.howLead}</p>
          <div className={s.cols}>
            {data.howSteps.map((step, i) => (
              <div key={step.title}>
                <div className={s.card}>
                  <span className={s.stepNum}>{i + 1}</span>
                  <h3 className={s.st}>{step.title}</h3>
                  <p className={s.sec} style={{ margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 예산 · 제안 비교 예시 */}
      <section className={`${s.band} ${s.bandAlt}`}>
        <div className={s.inner}>
          <div className={s.half}>
            <div style={{ flex: '1 1 420px' }}>
              <h2 className={s.sh}>{data.budgetTitle}</h2>
              <p className={s.lead} style={{ marginBottom: 20 }}>{data.budgetLead}</p>
              <ul className={s.chkl}>
                {data.budgetChecks.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div style={{ flex: '1 1 480px' }}>
              <div className={s.proposalCard}>
                <div className={s.proposalHead}>{data.proposalsLabel}</div>
                {data.proposals.map((p) => (
                  <div key={p.name} className={s.proposalRow}>
                    <span className={s.avatar} aria-hidden="true">{p.initial}</span>
                    <div className={s.proposalBody}>
                      <div className={s.proposalName}>{p.name}</div>
                      <div className={s.sec}>{p.meta}</div>
                      <div className={s.proposalSummary}>{p.summary}</div>
                    </div>
                    <div className={s.proposalQuote}>
                      <div className={s.quoteLabel}>견적 금액</div>
                      <div className={s.quoteValue}><Money amount={p.quote} size="row" /></div>
                    </div>
                  </div>
                ))}
                <p className={`${s.sec} ${s.proposalFoot}`}>{data.proposalsFoot}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 안전장치 — 헤더 앵커 #safe */}
      <section className={s.band} id="safe">
        <div className={s.inner}>
          <h2 className={s.sh}>{data.safetyTitle}</h2>
          <p className={s.lead}>{data.safetyLead}</p>
          <div className={`${s.cols} ${s.safetyCols}`}>
            {data.safetyCards.map((card) => (
              <div key={card.title}>
                <div className={s.card}>
                  <h3 className={s.st}>{card.title}</h3>
                  <p className={s.sec} style={{ margin: 0 }}>{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 비용 — 헤더 앵커 #start */}
      <section className={`${s.band} ${s.bandAlt}`} id="start">
        <div className={s.inner}>
          <div className={s.half}>
            <div>
              <h2 className={s.sh}>{data.costTitle}</h2>
              <p className={s.lead} style={{ margin: 0 }}>{data.costLead}</p>
            </div>
            <div>
              <div className={s.card}>
                {data.costRows.map((row) => (
                  <div key={row.label} className={s.priceRow}>
                    <span>{row.label}</span>
                    <span className={s.priceValue}>{row.value}</span>
                  </div>
                ))}
                <p className={`${s.sec} ${s.costNote}`}>{data.costNote}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 하단 CTA — navy 위라 onnavy(본문에 primary 없음) */}
      <section className={s.bandNavy}>
        <div className={s.inner}>
          <h2 className={s.sh}>{data.ctaTitle}</h2>
          <p className={s.lead}>{data.ctaLead}</p>
          <Button variant="onnavy" size="lg" to="/signup">화면 초안 받아보기</Button>
          <p className={s.ctaSub}>{data.ctaSub}</p>
        </div>
      </section>
    </div>
  );
}

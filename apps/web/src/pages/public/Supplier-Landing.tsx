/* 공급자 랜딩 — 디자인 캔버스 Supplier-Landing 보드(랜딩 v3) · /supplier · M1 · F-01 · 13.2
 * 히어로 3장면 → 견적 카드(#how) → 흐름도(#flow) → 정산 3칸(#price) → 마지막 띠(#signup)
 * 파란 버튼은 헤더 '공급자로 등록' 하나 — 본문 버튼은 onnavy(흰 바탕). */
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import { HeroStage } from '@/components/landing/HeroStage';
import { FlowSteps, PaySteps, SectionHead, ValueCards, landing as l } from '@/components/landing/LandingSections';
import { formatWon } from '@/lib/format';
import { resolveSlMock, slDemoOf, type SlDemo } from './Supplier-Landing.data';
import s from './Supplier-Landing.module.css';

function Thumb({ className }: { className?: string }) {
  return <div className={className}><i /><i style={{ width: '70%' }} /><i /></div>;
}

function HeroFrames({ h }: { h: SlDemo['hero'] }): [JSX.Element, JSX.Element, JSX.Element] {
  const possible = h.items.filter((it) => it.name !== h.impossible).length;
  return [
    <>
      <div className={l.mh}><b>프로젝트 상세</b><span className={l.ex}>예시 화면</span></div>
      <div className={l.ptitle}>{h.projectTitle}</div>
      <div className={l.attr}>항목 <b>{h.itemCount}</b><i />예산 <b>{h.budgetRange}</b><i />모집 <b>{h.recruit}</b></div>
      {h.items.map((it, i) => (
        <div key={it.name} className={`${l.srow}${i === 0 ? ` ${l.srowFirst}` : ''}`}>
          <Thumb className={l.thm} />
          <div><div className={l.nm}>{it.name}</div><div className={l.ds}>{it.ask}</div></div>
        </div>
      ))}
    </>,
    <>
      <div className={l.mh}><b>견적 작성</b><span className={l.ex}>1 / 2 · 항목 고르기</span></div>
      {h.items.map((it, i) => {
        const no = it.name === h.impossible;
        return (
          <div key={it.name} className={`${l.srow}${i === 0 ? ` ${l.srowFirst}` : ''}${no ? ` ${l.nrow}` : ''}`}>
            <Thumb className={l.thm} />
            <div><div className={l.nm}>{it.name}</div></div>
            <span className={l.tg2}>
              {no ? <><span className={l.flipA}>가능</span><span className={l.flipB}>불가</span></> : <><span className={l.ok}>가능</span><span>불가</span></>}
            </span>
          </div>
        );
      })}
      <div className={`${l.ovv} ${l.ovvTop}`}>불가로 둔 항목은 범위에서 빠집니다</div>
    </>,
    <>
      <div className={l.mh}><b>견적 작성</b><span className={l.ex}>2 / 2 · 총액 · 기간</span></div>
      <div className={l.ovv}>가능 {possible}개 · 불가 {h.items.length - possible}개</div>
      <div className={l.fld}>
        <div><span className={l.lbl}>견적 총액</span><div className={`${l.in} ${l.foc}`}>{formatWon(h.quoteTotal)}</div></div>
        <div><span className={l.lbl}>작업 기간</span><div className={l.in}>{h.periodDays}</div></div>
      </div>
      <div className={l.sum}><span className={l.l}>수수료 5% 제외 예상 수령액</span><span className={l.v}>{formatWon(h.payout)}</span></div>
      <div className={l.sent}>견적을 보냈습니다</div>
    </>,
  ];
}

function HowShots({ h }: { h: SlDemo['hero'] }) {
  const possible = h.items.filter((it) => it.name !== h.impossible).length;
  return [
    <div className={l.mp}>
      <div className={l.mpH}><span>{h.projectTitle}</span><span>항목 {h.itemCount}</span></div>
      {h.items.slice(0, 3).map((it) => (
        <div key={it.name} className={l.msr}>
          <Thumb className={l.msrTh} />
          <div><div className={l.nm}>{it.name}</div><div className={l.ds}>{it.ask}</div></div>
        </div>
      ))}
    </div>,
    <div className={l.mp}>
      <div className={l.mpH}><span>견적 작성</span><span>가능 {possible} · 불가 {h.items.length - possible}</span></div>
      <div className={l.mfl}>
        <div><span className={l.lbl}>견적 총액</span><div className={`${l.in} ${l.foc}`}>{formatWon(h.quoteTotal)}</div></div>
        <div><span className={l.lbl}>작업 기간</span><div className={l.in}>{h.periodDays}</div></div>
      </div>
      <div className={l.mnote}>가능한 항목 전체에 대한 금액 하나만 적습니다</div>
    </div>,
    <div className={l.mp}>
      <div className={l.mpH}><span>계약서</span><span className={l.mchip}>계약 체결</span></div>
      <div className={l.mline}>최종 합의 내용 · 명세 첨부</div>
      <div className={l.mline}>검수 기준 · 범위는 서명 시점에 고정</div>
      <div className={l.msig}><div>✓ 의뢰인 서명</div><div>✓ 공급자 서명</div></div>
    </div>,
  ];
}

export default function SupplierLanding() {
  const [params] = useSearchParams();
  const data = slDemoOf(resolveSlMock(params.get('mock')));
  const shots = HowShots({ h: data.hero });

  return (
    <div className={s.root} data-screen="Supplier-Landing">
      <section className={s.hero}>
        <div className={s.inner}>
          <div className={s.half}>
            <div className={s.heroText}>
              <span className={s.pill}>{data.pill}</span>
              <h1 className={s.hl}>{data.title}</h1>
              <p className={s.lead}>{data.lead}</p>
              <div className={s.ctaRow}>
                <Button variant="onnavy" size="lg" to="/signup">{data.cta}</Button>
                <Button variant="ghost" size="lg" to="#how" className={s.ghostOnNavy}>{data.ctaGhost}</Button>
              </div>
              <p className={s.miniNote}>{data.freeNote}</p>
            </div>
            <div className={s.heroArt}>
              <HeroStage tone="dark" label={data.hero.label} steps={data.hero.steps} frames={HeroFrames({ h: data.hero })} />
            </div>
          </div>
        </div>
      </section>

      {/* 견적 방식 — 헤더 앵커 #how */}
      <section className={s.band} id="how">
        <div className={s.inner}>
          <SectionHead title={data.howTitle} titleClassName={s.sh} more={{ to: '/help', label: '견적 방식 자세히 보기' }} />
          <ValueCards cards={data.howCards.map((c, i) => ({ ...c, shot: shots[i] }))} />
        </div>
      </section>

      {/* 이용 흐름 — 헤더 앵커 #flow */}
      <section className={`${s.band} ${s.bandAlt}`} id="flow">
        <div className={s.inner}>
          <SectionHead title={data.flowTitle} titleClassName={s.sh} />
          <FlowSteps steps={data.flowSteps} label={data.flowTitle} />
        </div>
      </section>

      {/* 정산 · 비용 — 헤더 앵커 #price */}
      <section className={s.band} id="price">
        <div className={s.inner}>
          <SectionHead title={data.payTitle} titleClassName={s.sh} more={{ to: '/help', label: '정산 자세히 보기' }} />
          <PaySteps steps={data.paySteps} note={data.payNote} />
        </div>
      </section>

      {/* 마지막 띠 */}
      <section className={s.bandNavy} id="signup">
        <div className={s.inner}>
          <h2 className={s.sh}>{data.bottomTitle}</h2>
          <p className={s.lead}>{data.bottomLead}</p>
          <Button variant="onnavy" size="lg" to="/signup">{data.cta}</Button>
          <p className={s.ctaSub}>{data.bottomSub}</p>
        </div>
      </section>
    </div>
  );
}

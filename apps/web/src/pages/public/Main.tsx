/* 의뢰인 랜딩 — 디자인 캔버스 Main 보드(랜딩 v3) · / · M1
 * 히어로 3장면 → 가치 카드(#value) → 흐름도(#how) → 안전장치(#safe) → 마지막 띠(#start)
 * 상태: routes.ts states=[] → '기본'만. ?mock=기본 */
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import { HeroStage } from '@/components/landing/HeroStage';
import { FlowSteps, SectionHead, ValueCards, landing as l } from '@/components/landing/LandingSections';
import { formatWon } from '@/lib/format';
import { mainDemoOf, resolveMainMock, type MainDemo } from './Main.data';
import s from './Main.module.css';

const CAL_ON = new Set([9, 17]);

function HeroFrames({ h }: { h: MainDemo['hero'] }): [JSX.Element, JSX.Element, JSX.Element] {
  return [
    <>
      <div className={l.mh}><b>프로젝트 시작</b><span className={l.ex}>예시 화면</span></div>
      <div className={l.q}>{h.question}</div>
      <div className={l.ta}>
        <span className={`${l.ln} ${l.l1}`}>{h.sentence[0]}</span>
        <span className={`${l.ln} ${l.l2}`}>{h.sentence[1]}<span className={l.caret} /></span>
      </div>
      <div className={l.inds}>
        {h.industries.map((name, i) => <span key={name} className={i === 0 ? l.on : undefined}>{name}</span>)}
      </div>
      <div className={l.mkBtn}><span>화면 초안 만들기</span></div>
    </>,
    <>
      <div className={l.mh}><b>화면 초안</b><span className={l.ex}>AI가 그린 초안</span></div>
      <div className={l.wf}>
        <div className={l.wb}>
          <div className={l.wt}>{h.draftBlocks[0]}<i>×</i></div>
          <div className={l.cal}>{Array.from({ length: 28 }, (_, i) => <i key={i} className={CAL_ON.has(i) ? l.on : undefined} />)}</div>
        </div>
        <div className={l.wb}>
          <div className={l.wt}>{h.draftBlocks[1]}<i>×</i></div>
          <div className={l.inp} /><div className={l.inp} style={{ width: '70%' }} /><div className={l.wbtn} />
        </div>
        <div className={l.wb}>
          <div className={l.wt}>{h.draftBlocks[2]}<i>×</i></div>
          {[0, 1, 2].map((i) => <div key={i} className={l.li}><b /><span style={i === 2 ? { maxWidth: '60%' } : undefined} /></div>)}
        </div>
        <div className={l.wb}>
          <div className={l.wt}>{h.draftBlocks[3]}<i>×</i></div>
          {[0, 1, 2].map((i) => <div key={i} className={l.li}><span /><em /></div>)}
        </div>
      </div>
      <div className={l.cap2}>필요한 기능이 화면으로 먼저 그려집니다</div>
    </>,
    <>
      <div className={l.mh}><b>초안 고치기</b><span className={l.ex}>{h.budget}</span></div>
      <div className={l.split}>
        <div className={l.wf}>
          {h.draftBlocks.map((name) => (
            <div key={name} className={`${l.wb}${name === h.removed ? ` ${l.rm}` : ''}`}><div className={l.wt}>{name}<i>×</i></div></div>
          ))}
        </div>
        <div>
          {h.draftBlocks.map((name) => (
            <div key={name} className={`${l.specIt}${name === h.removed ? ` ${l.specOut}` : ''}`}>{name}</div>
          ))}
          <div className={l.tot}>
            <div className={l.totL}>수수료 포함 예상 총액</div>
            <div className={`${l.sw} ${l.totV}`}><span className={l.old}>{h.totalBefore}</span><span className={l.new}>{h.totalAfter}</span></div>
          </div>
          <div className={`${l.bud} ${l.sw}`}><span className={l.old}>{h.budgetBefore}</span><span className={l.new}>{h.budgetAfter}</span></div>
        </div>
      </div>
    </>,
  ];
}

function ValueShots({ data }: { data: MainDemo }) {
  const [blockA, blockB, , blockD] = data.hero.draftBlocks;
  return [
    <>
      <div className={l.mp}>
        <div className={l.mpH}><span>프로젝트 시작</span></div>
        <div className={l.mta}>{data.hero.sentence[1]}</div>
      </div>
      <div className={l.mdown}>↓</div>
      <div className={l.mwf}>
        <div className={l.mwb}><em>{blockA}</em><div className={l.mwbGrid}>{Array.from({ length: 14 }, (_, i) => <i key={i} />)}</div></div>
        <div className={l.mwb}><em>{data.hero.draftBlocks[2]}</em><i /><i style={{ width: '70%' }} /></div>
      </div>
    </>,
    <div className={l.mp}>
      <div className={l.mit}>{blockA}</div>
      <div className={l.mit}>{blockB}</div>
      <div className={`${l.mit} ${l.mitOut}`}>{blockD}</div>
      <div className={l.mtot}><small>수수료 포함 예상 총액</small><b>{data.hero.totalAfter}</b></div>
      <div className={l.mok}>{data.hero.budget} 안에 들어옵니다</div>
    </div>,
    <div className={l.mp}>
      <div className={l.mpH}><span>제안 비교 — 지원 {data.proposals.length}건</span></div>
      {data.proposals.map((p) => (
        <div key={p.name} className={l.msc}>
          <span className={l.av}>{p.initial}</span>
          <div><div className={l.nm}>{p.name}</div><div className={l.mt}>{p.meta}</div></div>
          <span className={l.am}>{formatWon(p.quote)}</span>
        </div>
      ))}
    </div>,
  ];
}

export default function Main() {
  const [params] = useSearchParams();
  const data = mainDemoOf(resolveMainMock(params.get('mock')));
  const shots = ValueShots({ data });

  return (
    <div className={s.root} data-screen="Main">
      {/* 히어로 */}
      <section className={s.hero}>
        <div className={s.inner}>
          <div className={s.half}>
            <div className={s.heroText}>
              <span className={s.pill}>{data.pill}</span>
              <h1 className={s.hl}>{data.title}</h1>
              <p className={s.lead}>{data.lead}</p>
              <div className={s.ctaRow}>
                {/* 파란 버튼은 헤더 하나 — 본문은 흰 바탕 navy 테두리 */}
                <Button variant="ghost" size="lg" to="/signup" className={s.heroCta}>화면 초안 받아보기</Button>
                <Button variant="ghost" size="lg" to="#how">작동 방식 보기</Button>
              </div>
              <p className={s.miniNote}>{data.freeNote}</p>
            </div>
            <div className={s.heroArt}>
              <HeroStage label={data.hero.label} steps={data.hero.steps} frames={HeroFrames({ h: data.hero })} />
            </div>
          </div>
        </div>
      </section>

      {/* 가치 카드 */}
      <section className={s.band} id="value">
        <div className={s.inner}>
          <SectionHead title={data.valueTitle} titleClassName={s.sh} />
          <ValueCards cards={data.valueCards.map((c, i) => ({ ...c, shot: shots[i] }))} />
        </div>
      </section>

      {/* 작동 방식 — 헤더 앵커 #how */}
      <section className={`${s.band} ${s.bandAlt}`} id="how">
        <div className={s.inner}>
          <SectionHead title={data.flowTitle} titleClassName={s.sh} />
          <FlowSteps steps={data.flowSteps} label={data.flowTitle} />
        </div>
      </section>

      {/* 안전장치 — 헤더 앵커 #safe */}
      <section className={s.band} id="safe">
        <div className={s.inner}>
          <SectionHead title={data.safetyTitle} titleClassName={s.sh} more={{ to: '/help', label: '안전장치 자세히 보기' }} />
          <ValueCards cards={data.safetyCards} />
        </div>
      </section>

      {/* 마지막 띠 — 헤더 앵커 #start(비용) */}
      <section className={s.bandNavy} id="start">
        <div className={s.inner}>
          <h2 className={s.sh}>{data.ctaTitle}</h2>
          <p className={s.lead}>{data.ctaLead}</p>
          <Button variant="onnavy" size="lg" to="/signup">화면 초안 받아보기</Button>
          <p className={s.ctaSub}>{data.freeNote}</p>
        </div>
      </section>
    </div>
  );
}

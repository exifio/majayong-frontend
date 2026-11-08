/* 랜딩 공용 섹션 부품 — 섹션 머리 · 가치 카드 · 흐름도 · 정산 3칸 (디자인 캔버스 랜딩 v3) */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LandingIcon, type LandingIconName } from './LandingIcon';
import s from './landing.module.css';

export const landing = s;

export function SectionHead({ title, titleClassName, more }: { title: string; titleClassName?: string; more?: { to: string; label: string } }) {
  return (
    <div className={s.shead}>
      <h2 className={titleClassName}>{title}</h2>
      {more && <Link className={s.more} to={more.to}>{more.label}</Link>}
    </div>
  );
}

export type ValueCard = { title: string; body: string; shot?: ReactNode; icon?: LandingIconName };

/* shot이 있으면 화면 썸네일 카드, icon이면 아이콘 카드 */
export function ValueCards({ cards }: { cards: ValueCard[] }) {
  const shots = cards.some((c) => c.shot);
  return (
    <ul className={`${s.pts}${shots ? ` ${s.shots}` : ''}`}>
      {cards.map((c) => (
        <li key={c.title} className={s.pt}>
          {c.shot && <div className={s.shotv} aria-hidden="true">{c.shot}</div>}
          {c.icon && <div className={s.ic}><LandingIcon name={c.icon} /></div>}
          <div className={c.shot ? s.tx : undefined}>
            <h3 className={s.ptTitle}>{c.title}</h3>
            <span className={s.ptBody}>{c.body}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export type FlowStep = { title: string; body: string; icon: LandingIconName; money?: boolean };

export function FlowSteps({ steps, label }: { steps: FlowStep[]; label: string }) {
  return (
    <ol className={s.flow} aria-label={label}>
      {steps.map((st) => (
        <li key={st.title} className={`${s.node}${st.money ? ` ${s.money}` : ''}`}>
          <div className={s.ic}><LandingIcon name={st.icon} /></div>
          <b className={s.nodeTitle}>{st.title}</b>
          <span className={s.nodeBody}>{st.body}</span>
        </li>
      ))}
    </ol>
  );
}

export type PayStep = { title: string; body: string; icon: LandingIconName; paid?: boolean };

export function PaySteps({ steps, note }: { steps: PayStep[]; note: string }) {
  return (
    <>
      <div className={s.pay3}>
        {steps.map((st, i) => (
          <PayBox key={st.title} step={st} arrow={i > 0} />
        ))}
      </div>
      <p className={s.pnote}>{note}</p>
    </>
  );
}

function PayBox({ step, arrow }: { step: PayStep; arrow: boolean }) {
  return (
    <>
      {arrow && <div className={s.parr}><LandingIcon name="arrow" /></div>}
      <div className={`${s.pbox}${step.paid ? ` ${s.paid}` : ''}`}>
        <div className={s.ic}><LandingIcon name={step.icon} /></div>
        <b className={s.pboxTitle}>{step.title}</b>
        <span className={s.pboxBody}>{step.body}</span>
      </div>
    </>
  );
}

/* 랜딩 히어로 3장면 — 9초마다 ①→②→③을 보여 주고 아래 단계 표시가 따라 바뀐다(CSS 애니메이션).
 * 장면 내용은 보조기기에 하나의 그림으로 읽히도록 role="img" + aria-label로 설명한다.
 * 움직임 줄이기에서는 ③(결과) 장면만 보인다. */
import type { ReactNode } from 'react';
import s from './landing.module.css';

type Props = {
  label: string;
  frames: [ReactNode, ReactNode, ReactNode];
  steps: [string, string, string];
  tone?: 'light' | 'dark';
};

const FRAME_CLASS = [s.f1, s.f2, s.f3];
const STEP_CLASS = [s.sp1, s.sp2, s.sp3];

export function HeroStage({ label, frames, steps, tone = 'light' }: Props) {
  return (
    <div className={tone === 'dark' ? s.dark : undefined} data-hero-stage>
      <div className={s.stage} role="img" aria-label={label}>
        {frames.map((frame, i) => (
          <div key={i} className={`${s.fr} ${FRAME_CLASS[i]}`}>{frame}</div>
        ))}
      </div>
      <div className={s.steps} aria-hidden="true">
        {steps.map((step, i) => (
          <span key={step} className={`${s.sp} ${STEP_CLASS[i]}`}><b>{i + 1}</b>{step}</span>
        ))}
      </div>
    </div>
  );
}

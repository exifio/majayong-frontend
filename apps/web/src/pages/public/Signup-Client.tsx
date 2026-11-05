/* 회원가입 ③ 의뢰인 프로필 — 보드 Signup-Client · /signup/client · M1
 * 상태: 없음. F-07. Stepper는 Signup · Signup-Role과 같은 모양(이 파일 안). */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Note, TextAreaField, TextField } from '@/components/ui';
import { useSession } from '@/app/session';
import { DEMO } from './Signup-Client.data';
import s from './Signup-Client.module.css';

function SignupStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className={s.steps} aria-label="가입 단계">
      {DEMO.steps.flatMap((step, i) => {
        const cls = step.n === current ? s.stepOn : step.n < current ? s.stepDone : '';
        const item = (
          <li key={step.n} className={`${s.step} ${cls}`}>
            <i className={s.stepNum} aria-hidden="true">
              {step.n < current ? '✓' : step.n}
            </i>
            {step.label}
          </li>
        );
        if (i === 0) return [item];
        return [
          <li key={`sep-${step.n}`} className={s.sep} aria-hidden="true">
            ›
          </li>,
          item,
        ];
      })}
    </ol>
  );
}

export default function SignupClient() {
  const navigate = useNavigate();
  const { setDevSession } = useSession();

  const [biz, setBiz] = useState<string>(DEMO.bizValue);
  const [industry, setIndustry] = useState<string>(DEMO.industries[0]);
  const [scale, setScale] = useState<string>(DEMO.scaleValue);
  const [intro, setIntro] = useState<string>(DEMO.introValue);
  const [tried, setTried] = useState(false);

  const bizEmpty = biz.trim().length === 0;
  const bizError = tried && bizEmpty ? DEMO.bizError : undefined;

  const finish = () => {
    if (bizEmpty) {
      setTried(true);
      return;
    }
    setDevSession('client');
    navigate('/c', { replace: true });
  };

  const skip = () => {
    setDevSession('client');
    navigate('/c', { replace: true });
  };

  return (
    <div className={s.page} data-screen="Signup-Client">
      <SignupStepper current={3} />

      <h1 className={s.title}>{DEMO.title}</h1>
      <p className={s.sub}>{DEMO.sub}</p>

      <div className={s.fields}>
        <TextField
          label={DEMO.biz}
          required
          value={biz}
          onChange={(e) => setBiz(e.target.value)}
          error={bizError}
          hint={DEMO.bizNeeded}
        />

        <div className={s.selectField}>
          <label className={s.selectLabel} htmlFor="signup-client-industry">
            {DEMO.industry}
          </label>
          <select
            id="signup-client-industry"
            className={s.select}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            {DEMO.industries.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className={s.selectHint}>{DEMO.industryHint}</p>
        </div>

        <TextField
          label={DEMO.scale}
          optional
          value={scale}
          onChange={(e) => setScale(e.target.value)}
          hint={DEMO.scaleHint}
        />

        <TextAreaField
          label={DEMO.intro}
          optional
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          hint={DEMO.introHint}
        />
      </div>

      <div className={s.noteWrap}>
        <Note title="연락처는 받지 않습니다">{DEMO.noContact}</Note>
      </div>

      <div className={s.actions}>
        <Button variant="ghost" to={DEMO.backHref}>
          {DEMO.back}
        </Button>
        <div className={s.actionRight}>
          <Button variant="ghost" type="button" onClick={skip}>
            {DEMO.skip}
          </Button>
          <Button variant="primary" type="button" onClick={finish}>
            {DEMO.submit}
          </Button>
        </div>
      </div>
      <p className={s.skipHint}>{DEMO.skipHint}</p>
    </div>
  );
}

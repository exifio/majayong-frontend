/* 회원가입 ① 계정 — 보드 Signup · /signup · M1
 * 상태: 기본 / 이미 가입된 이메일
 * F-06 · 7.2. Stepper는 공통 없음 — 이 파일 안에서만. */
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ConfirmCheck, TextField } from '@/components/ui';
import { useSession } from '@/app/session';
import {
  DEMO,
  passwordError,
  resolveSignupMock,
  signupDemoOf,
  type SignupMock,
} from './Signup.data';
import s from './Signup.module.css';

type TermKey = (typeof DEMO.terms)[number]['key'];

function SignupStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className={s.steps} aria-label="가입 단계">
      {DEMO.steps.flatMap((step, i) => {
        const item = (
          <li key={step.n} className={`${s.step} ${step.n === current ? s.stepOn : ''}`}>
            <i className={s.stepNum} aria-hidden="true">
              {step.n}
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

export default function Signup() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setDevSession } = useSession();
  const mock: SignupMock = resolveSignupMock(params.get('mock'));
  const demo = signupDemoOf(mock);

  const [email, setEmail] = useState(demo.emailValue);
  const [password, setPassword] = useState('password1234');
  const [confirm, setConfirm] = useState('password1234');
  const [agreed, setAgreed] = useState<Record<TermKey, boolean>>({
    terms: true,
    privacy: true,
    nda: true,
    broker: true,
  });
  const [tried, setTried] = useState(false);

  const dup = demo.dup;
  const pwErr = passwordError(password);
  const confirmErr = confirm !== password ? DEMO.pwMismatch : null;
  const allTerms = DEMO.terms.every((t) => agreed[t.key]);
  const termsErr = tried && !allTerms ? DEMO.termsNeed : null;

  const goNext = () => {
    setDevSession('signup');
    navigate('/signup/role');
  };

  const onSubmit = () => {
    setTried(true);
    if (dup || pwErr || confirmErr || !allTerms) return;
    goNext();
  };

  return (
    <div className={s.page} data-screen="Signup">
      <SignupStepper current={1} />

      <h1 className={s.title}>{DEMO.title}</h1>
      <p className={s.sub}>{DEMO.sub}</p>

      <div className={s.card}>
        <Button variant="ghost" full onClick={goNext}>
          {DEMO.google}
        </Button>
        <p className={s.googleHint}>{DEMO.googleHint}</p>

        <div className={s.div}>{DEMO.orEmail}</div>

        <div className={s.fields}>
          <div>
            <TextField
              label={DEMO.email}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={dup ? DEMO.dupError : undefined}
              hint={dup ? undefined : DEMO.emailHint}
            />
            {dup ? (
              <div className={s.dupRow}>
                <Link to="/?modal=login">{DEMO.loginLink}</Link>
              </div>
            ) : null}
          </div>

          <TextField
            label={DEMO.password}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={tried && pwErr ? pwErr : undefined}
            hint={tried && pwErr ? undefined : DEMO.passwordHint}
          />

          <TextField
            label={DEMO.passwordConfirm}
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={tried && confirmErr ? confirmErr : undefined}
          />
        </div>

        <hr className={s.hr} />

        <div className={s.terms}>
          {DEMO.terms.map((t) => (
            <ConfirmCheck
              key={t.key}
              checked={agreed[t.key]}
              onChange={(v) => setAgreed((prev) => ({ ...prev, [t.key]: v }))}
            >
              <span className={s.termLabel}>
                {t.label}에 동의합니다
                <Link to={t.href} onClick={(e) => e.stopPropagation()}>
                  보기
                </Link>
              </span>
            </ConfirmCheck>
          ))}
        </div>
        {termsErr ? <p className={s.termsError}>{termsErr}</p> : null}

        <Button
          variant="primary"
          full
          disabled={dup}
          disabledReason={dup ? DEMO.dupDisabled : undefined}
          onClick={onSubmit}
        >
          {DEMO.next}
        </Button>
      </div>

      <div className={s.info}>{DEMO.info}</div>
    </div>
  );
}

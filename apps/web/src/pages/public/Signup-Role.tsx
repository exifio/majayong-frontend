/* 회원가입 ② 역할 — 보드 Signup-Role · /signup/role · M1
 * 상태: 의뢰인 선택 / 공급자 선택 / 구글 가입
 * F-06 · F-07. Stepper는 Signup과 같은 모양(이 파일 안). */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ConfirmCheck, Note, SelectCards } from '@/components/ui';
import { DEMO, resolveRoleMock, roleDemoOf, type RoleMock } from './Signup-Role.data';
import s from './Signup-Role.module.css';

function RoleStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className={s.steps} aria-label="가입 단계">
      {DEMO.steps.flatMap((step, i) => {
        const cls =
          step.n === current ? s.stepOn : step.n < current ? s.stepDone : '';
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

export default function SignupRole() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock: RoleMock = resolveRoleMock(params.get('mock'));
  const demo = roleDemoOf(mock);

  const [role, setRole] = useState<'client' | 'supplier'>(demo.role);
  const [termsOk, setTermsOk] = useState(true);
  const [privacyOk, setPrivacyOk] = useState(true);
  const [brokerOk, setBrokerOk] = useState(true);
  const [ndaOk, setNdaOk] = useState(true);

  useEffect(() => {
    setRole(roleDemoOf(resolveRoleMock(params.get('mock'))).role);
  }, [params]);

  const nextHref = role === 'supplier' ? '/signup/supplier' : '/signup/client';
  const googleReady =
    !demo.google || (termsOk && privacyOk && brokerOk && (role !== 'supplier' || ndaOk));

  return (
    <div className={s.page} data-screen="Signup-Role">
      <RoleStepper current={2} />

      <div className={s.acct} role="status">
        {demo.acctMsg}
      </div>

      <h1 className={s.title}>{DEMO.title}</h1>
      <p className={s.sub}>{DEMO.sub}</p>

      <SelectCards
        label="역할 선택"
        value={role}
        onChange={(k) => setRole(k as 'client' | 'supplier')}
        options={[
          {
            key: DEMO.clientKey,
            label: (
              <span className={s.cardLabel}>
                <span className={s.cardTitle}>{DEMO.clientTitle}</span>
                <span className={s.cardDesc}>{DEMO.clientDesc}</span>
              </span>
            ),
          },
          {
            key: DEMO.supplierKey,
            label: (
              <span className={s.cardLabel}>
                <span className={s.cardTitle}>{DEMO.supplierTitle}</span>
                <span className={s.cardDesc}>{DEMO.supplierDesc}</span>
              </span>
            ),
          },
        ]}
      />

      {demo.google ? (
        <section className={s.terms} aria-labelledby="agr-h">
          <h2 id="agr-h">{DEMO.termsTitle}</h2>
          <p className={s.termsHint}>{DEMO.googleTermsHint}</p>
          <div className={s.termList}>
            <ConfirmCheck checked={termsOk} onChange={setTermsOk}>
              <span className={s.termLabel}>
                이용약관에 동의합니다
                <Link to="/terms/terms">보기</Link>
              </span>
            </ConfirmCheck>
            <ConfirmCheck checked={privacyOk} onChange={setPrivacyOk}>
              <span className={s.termLabel}>
                개인정보 처리방침에 동의합니다
                <Link to="/terms/privacy">보기</Link>
              </span>
            </ConfirmCheck>
            <ConfirmCheck checked={brokerOk} onChange={setBrokerOk}>
              <span className={s.termLabel}>
                중개자 고지에 동의합니다
                <Link to="/terms/broker">보기</Link>
              </span>
            </ConfirmCheck>
            {role === 'supplier' ? (
              <ConfirmCheck checked={ndaOk} onChange={setNdaOk}>
                <span className={s.termLabel}>
                  명세 비밀유지에 동의합니다
                  <Link to="/terms/nda">보기</Link>
                </span>
              </ConfirmCheck>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className={s.noteWrap}>
        <Note title={DEMO.noteTitle}>{DEMO.noteBody}</Note>
      </div>

      <div className={s.actions}>
        <Button variant="ghost" to={demo.backHref}>
          {DEMO.back}
        </Button>
        <Button
          variant="primary"
          disabled={!googleReady}
          disabledReason={!googleReady ? '약관에 동의해 주세요' : undefined}
          onClick={() => navigate(nextHref)}
        >
          {DEMO.next}
        </Button>
      </div>
    </div>
  );
}

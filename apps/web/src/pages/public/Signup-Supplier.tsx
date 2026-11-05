/* 회원가입 ③ 공급자 프로필 — 보드 Signup-Supplier · /signup/supplier · M1
 * 상태: 없음. F-07 · F-21 · 7.2. Stepper는 Signup · Signup-Role과 같은 모양(이 파일 안). */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, ConfirmCheck, SelectCards, TextField } from '@/components/ui';
import { apiRequest } from '@/lib/api';
import { useSession } from '@/app/session';
import { DEMO } from './Signup-Supplier.data';
import s from './Signup-Supplier.module.css';

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

export default function SignupSupplier() {
  const navigate = useNavigate();
  const { apiAccessToken } = useSession();

  const [name, setName] = useState<string>(DEMO.nameValue);
  const [type, setType] = useState<'personal' | 'business'>('personal');
  const [career, setCareer] = useState<string>(DEMO.careerValue);
  const [skills, setSkills] = useState<string[]>([...DEMO.skillSelected]);
  const [portfolio, setPortfolio] = useState<string>(DEMO.portfolioValue);
  const [ndaOk, setNdaOk] = useState(true);
  const [feeOk, setFeeOk] = useState(true);
  const [aiOk, setAiOk] = useState(true);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameEmpty = name.trim().length === 0;
  const nameError = tried && nameEmpty ? DEMO.nameError : undefined;
  const agreesOk = ndaOk && feeOk && aiOk;

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((x) => x !== skill) : [...prev, skill],
    );
  };

  const saveProfile = async (displayName?: string) => {
    setBusy(true);
    setError(null);
    try {
      await apiRequest('updateSupplierProfile', '/me/supplier-profile', {
        method: 'PATCH',
        accessToken: apiAccessToken,
        jsonBody: {
          ...(displayName ? { displayName } : {}),
          ndaConsent: true,
        },
      });
      navigate('/s', { replace: true });
    } catch {
      setError('프로필을 저장하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    if (!agreesOk) return;
    if (nameEmpty) {
      setTried(true);
      return;
    }
    void saveProfile(name.trim());
  };

  const skip = () => {
    if (!agreesOk) return;
    void saveProfile();
  };
  return (
    <div className={s.page} data-screen="Signup-Supplier">
      <SignupStepper current={3} />

      <h1 className={s.title}>{DEMO.title}</h1>
      <p className={s.sub}>{DEMO.sub}</p>

      <div className={s.fields}>
        <TextField
          label={DEMO.name}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          hint={DEMO.nameHint}
        />

        <SelectCards
          label={DEMO.typeLabel}
          value={type}
          onChange={(k) => setType(k as 'personal' | 'business')}
          options={[
            {
              key: DEMO.personalKey,
              label: (
                <span className={s.cardLabel}>
                  <span className={s.cardTitle}>{DEMO.personalTitle}</span>
                  <span className={s.cardDesc}>{DEMO.personalDesc}</span>
                </span>
              ),
            },
            {
              key: DEMO.businessKey,
              label: (
                <span className={s.cardLabel}>
                  <span className={s.cardTitle}>{DEMO.businessTitle}</span>
                  <span className={s.cardDesc}>{DEMO.businessDesc}</span>
                </span>
              ),
            },
          ]}
        />

        <TextField
          label={DEMO.career}
          optional
          type="number"
          min={0}
          max={50}
          value={career}
          onChange={(e) => setCareer(e.target.value)}
          hint={DEMO.careerHint}
        />

        <div className={s.skillField}>
          <p className={s.skillLabel} id="signup-supplier-skills">
            {DEMO.skills}
          </p>
          <div className={s.tagRow} role="group" aria-labelledby="signup-supplier-skills">
            {DEMO.skillOptions.map((skill) => {
              const on = skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  className={`${s.tag} ${on ? s.tagOn : ''}`}
                  aria-pressed={on}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </button>
              );
            })}
          </div>
          <p className={s.skillHint}>{DEMO.skillsHint}</p>
        </div>

        <TextField
          label={DEMO.portfolio}
          optional
          type="url"
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
          hint={DEMO.portfolioHint}
        />
      </div>

      <section className={s.terms} aria-labelledby="agr-h">
        <h2 id="agr-h">{DEMO.agreeTitle}</h2>
        <div className={s.termList}>
          <ConfirmCheck checked={ndaOk} onChange={setNdaOk}>
            <span className={s.termLabel}>
              {DEMO.agrees[0].label}
              <Link to={DEMO.agrees[0].href}>{DEMO.agrees[0].link}</Link>
            </span>
          </ConfirmCheck>
          <ConfirmCheck checked={feeOk} onChange={setFeeOk}>
            <span className={s.termLabel}>{DEMO.agrees[1].label}</span>
          </ConfirmCheck>
          <ConfirmCheck checked={aiOk} onChange={setAiOk}>
            <span className={s.termLabel}>{DEMO.agrees[2].label}</span>
          </ConfirmCheck>
        </div>
      </section>

      <div className={s.actions}>
        <Button variant="ghost" to={DEMO.backHref}>
          {DEMO.back}
        </Button>
        <div className={s.actionRight}>
          <Button
            variant="ghost"
            type="button"
            disabled={busy}
            disabledReason={busy ? '저장 중입니다' : undefined}
            onClick={skip}
          >
            {DEMO.skip}
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={finish}
            disabled={!agreesOk || busy}
            disabledReason={!agreesOk ? DEMO.agreeNeed : busy ? '저장 중입니다' : undefined}
          >
            {DEMO.submit}
          </Button>
        </div>
      </div>
      {error ? <p className={s.error} role="alert">{error}</p> : null}
      <p className={s.skipHint}>{DEMO.skipHint}</p>
    </div>
  );
}

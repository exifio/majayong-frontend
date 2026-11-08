/* 회원가입 ③ 공급자 프로필 — 보드 Signup-Supplier · /signup/supplier · M1
 * 상태: 없음. F-07 · F-21 · 7.2.
 * 가입 완료: PATCH /me/supplier-profile(활동 이름·경력·기술 스택·포트폴리오 링크·NDA·요약 동의) 뒤
 * PATCH /me/supplier-tax-info(개인/사업자 구분). Stepper는 Signup · Signup-Role과 같은 모양(이 파일 안). */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, ConfirmCheck, SelectCards, TextField } from '@/components/ui';
import { apiRequest } from '@/lib/api';
import { useSession } from '@/app/session';
import type { UpdateSupplierProfileRequestDto } from '@majayong/types/api';
import { isHttpsUrl } from '@/lib/account-profile';
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
  const { apiAccessToken, authUser } = useSession();

  const [name, setName] = useState('');
  const [type, setType] = useState<'personal' | 'business'>('personal');
  const [career, setCareer] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState('');
  const [ndaOk, setNdaOk] = useState(false);
  const [feeOk, setFeeOk] = useState(false);
  const [aiOk, setAiOk] = useState(false);
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

  const careerText = career.trim();
  const careerYears = careerText === '' ? null : Number(careerText);
  const careerInvalid = careerYears !== null && (!Number.isInteger(careerYears) || careerYears < 0 || careerYears > 80);
  const careerError = tried && careerInvalid ? DEMO.careerError : undefined;
  const portfolioUrl = portfolio.trim();
  const portfolioInvalid = portfolioUrl.length > 0 && !isHttpsUrl(portfolioUrl);
  const portfolioError = tried && portfolioInvalid ? DEMO.portfolioError : undefined;

  const saveProfile = async (body: UpdateSupplierProfileRequestDto, withBusinessType: boolean) => {
    setBusy(true);
    setError(null);
    try {
      await apiRequest('updateSupplierProfile', '/me/supplier-profile', {
        method: 'PATCH',
        accessToken: apiAccessToken,
        jsonBody: body,
      });
      if (withBusinessType) {
        // 개인/사업자 구분은 프로필이 아니라 증빙 정보(계정 설정의 정산 구분)에 저장된다.
        await apiRequest('updateSupplierTaxInfo', '/me/supplier-tax-info', {
          method: 'PATCH',
          accessToken: apiAccessToken,
          jsonBody: { businessType: type === 'business' ? 'BUSINESS' : 'INDIVIDUAL' },
        });
      }
      navigate('/s', { replace: true });
    } catch {
      setError('프로필을 저장하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    if (!agreesOk) return;
    if (nameEmpty || careerInvalid || portfolioInvalid) {
      setTried(true);
      return;
    }
    void saveProfile({
      displayName: name.trim(),
      ...(careerYears !== null ? { careerYears } : {}),
      ...(skills.length ? { skills } : {}),
      ...(portfolioUrl ? { portfolioItems: [{ type: 'LINK' as const, url: portfolioUrl }] } : {}),
      ndaConsent: true,
      portfolioConsent: true,
    }, true);
  };

  /** 나중에 입력하기: 활동 이름(없으면 이메일 아이디)과 동의만 저장한다. */
  const skip = () => {
    if (!ndaOk) return;
    const emailName = authUser?.email.split('@', 1)[0]?.trim();
    void saveProfile({
      displayName: name.trim() || emailName || '공급자',
      ndaConsent: true,
      ...(aiOk ? { portfolioConsent: true } : {}),
    }, false);
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
          max={80}
          value={career}
          onChange={(e) => setCareer(e.target.value)}
          error={careerError}
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
          error={portfolioError}
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
            disabled={!ndaOk || busy}
            disabledReason={busy ? '저장 중입니다' : !ndaOk ? DEMO.ndaNeed : undefined}
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

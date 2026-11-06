/* 비밀번호 재설정 — 보드 Reset · /reset · M1
 * 상태: 이메일 입력 / 요청 접수 / 새 비밀번호 / 링크 만료 / 완료
 * F-06. 요청과 확정은 실제 API를 쓰고, 성공해도 메일 수신을 단정하지 않는다. */
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Band, Button, TextField } from '@/components/ui';
import { AuthError, confirmPasswordReset, requestPasswordReset } from '@/app/auth';
import { DEMO, maskEmail, passwordError } from './Reset.data';
import s from './Reset.module.css';

type ResetStep = 'ask' | 'sent' | 'confirm' | 'expired' | 'done';

export default function Reset() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [step, setStep] = useState<ResetStep>(() => (token ? 'confirm' : 'ask'));
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [tried, setTried] = useState(false);
  const [emailTried, setEmailTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailEmpty = email.trim().length === 0;
  const emailError = emailTried && emailEmpty ? DEMO.emailNeed : undefined;
  const pwError = tried ? passwordError(pw, pw2) : undefined;

  const backToAsk = () => {
    navigate('/reset', { replace: true });
    setStep('ask');
    setError(null);
    setTried(false);
  };

  const sendReset = async () => {
    setEmailTried(true);
    if (emailEmpty) return;
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setStep('sent');
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : '재설정 요청을 처리하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    const formatError = passwordError(pw, pw2);
    if (formatError) {
      setTried(true);
      return;
    }
    if (!token) {
      setStep('expired');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await confirmPasswordReset(token, pw);
      setStep('done');
    } catch (caught) {
      if (caught instanceof AuthError && (caught.status === 401 || caught.code === 'RESET_TOKEN_INVALID')) {
        navigate('/reset', { replace: true });
        setStep('expired');
        return;
      }
      setError(caught instanceof AuthError ? caught.message : '비밀번호를 바꾸지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.page} data-screen="Reset">
      <div className={s.formcard}>
        {step === 'ask' ? (
          <>
            <h1 className={s.title}>{DEMO.askTitle}</h1>
            <p className={s.sub}>{DEMO.askSub}</p>
            <div className={s.card}>
              <TextField
                label={DEMO.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
              />
              {error ? <p className={s.error} role="alert">{error}</p> : null}
              <Button
                variant="primary"
                full
                type="button"
                disabled={busy}
                disabledReason={busy ? '요청을 처리하는 중입니다' : undefined}
                onClick={() => void sendReset()}
              >
                {busy ? DEMO.sending : DEMO.send}
              </Button>
              <p className={s.hintCenter}>{DEMO.googleHint}</p>
            </div>
            <div className={s.links}>
              <Link to={DEMO.loginHref}>{DEMO.backLogin}</Link>
              <Link to={DEMO.signupHref}>{DEMO.signup}</Link>
            </div>
          </>
        ) : null}

        {step === 'sent' ? (
          <>
            <h1 className={s.title}>{DEMO.sentTitle}</h1>
            <p className={s.sub}>{DEMO.sentSub}</p>
            <div className={s.card}>
              <div className={s.mailbox}>
                <b>{maskEmail(email)}</b>
                <p>{DEMO.sentBody}</p>
              </div>
              <Button variant="primary" full to={DEMO.loginHref}>
                {DEMO.sentLogin}
              </Button>
              <p className={s.hintCenter}>
                {DEMO.resendHint}{' '}
                <button type="button" className={s.txb} disabled={busy} onClick={() => void sendReset()}>
                  {DEMO.resend}
                </button>
              </p>
            </div>
          </>
        ) : null}

        {step === 'confirm' ? (
          <>
            <h1 className={s.title}>{DEMO.newTitle}</h1>
            <p className={s.sub}>{DEMO.newSub}</p>
            <div className={s.card}>
              <TextField
                label={DEMO.pw}
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                error={pwError === DEMO.pwShort || pwError === DEMO.pwMixed ? pwError : undefined}
              />
              <ul className={s.rules}>
                {DEMO.pwRules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <TextField
                label={DEMO.pwConfirm}
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                error={pwError === DEMO.pwMismatch ? pwError : undefined}
              />
              {error ? <p className={s.error} role="alert">{error}</p> : null}
              <Button
                variant="primary"
                full
                type="button"
                disabled={busy}
                disabledReason={busy ? '비밀번호를 바꾸는 중입니다' : undefined}
                onClick={() => void changePassword()}
              >
                {busy ? DEMO.changing : DEMO.change}
              </Button>
              <p className={s.hintCenter}>{DEMO.changeHint}</p>
            </div>
          </>
        ) : null}

        {step === 'expired' ? (
          <>
            <h1 className={s.title}>{DEMO.expiredTitle}</h1>
            <p className={s.sub}>{DEMO.expiredSub}</p>
            <div className={s.card}>
              <Band tone="warn" title={DEMO.expiredBandTitle}>
                {DEMO.expiredBandBody}
              </Band>
              <div className={s.bandGap}>
                <Button variant="primary" full type="button" onClick={backToAsk}>
                  {DEMO.expiredCta}
                </Button>
              </div>
            </div>
            <div className={s.links}>
              <Link to={DEMO.loginHref}>{DEMO.backLogin}</Link>
            </div>
          </>
        ) : null}

        {step === 'done' ? (
          <>
            <h1 className={s.title}>{DEMO.doneTitle}</h1>
            <p className={s.sub}>{DEMO.doneSub}</p>
            <div className={s.card}>
              <Band tone="done" title={DEMO.doneBandTitle}>
                {DEMO.doneBandBody}
              </Band>
              <div className={s.bandGap}>
                <Button variant="primary" full to={DEMO.loginHref}>
                  {DEMO.doneCta}
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

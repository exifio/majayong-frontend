/* 비밀번호 재설정 — 보드 Reset · /reset · M1
 * 상태: 이메일 입력 / 메일 보냄 / 새 비밀번호 / 링크 만료 / 완료
 * F-06. */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Band, Button, TextField } from '@/components/ui';
import {
  DEMO,
  passwordError,
  resolveResetMock,
  type ResetMock,
} from './Reset.data';
import s from './Reset.module.css';

export default function Reset() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock: ResetMock = resolveResetMock(params.get('mock'));

  const [email, setEmail] = useState<string>(DEMO.emailValue);
  const [pw, setPw] = useState<string>(DEMO.pwValue);
  const [pw2, setPw2] = useState<string>(DEMO.pwValue);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setTried(false);
    setEmail(DEMO.emailValue);
    setPw(DEMO.pwValue);
    setPw2(DEMO.pwValue);
  }, [mock]);

  const go = (next: ResetMock) => {
    navigate(`/reset?mock=${encodeURIComponent(next)}`, { replace: true });
  };

  const err = tried ? passwordError(pw, pw2) : undefined;

  return (
    <div className={s.page} data-screen="Reset">
      <div className={s.formcard}>
        {mock === '이메일 입력' ? (
          <>
            <h1 className={s.title}>{DEMO.askTitle}</h1>
            <p className={s.sub}>{DEMO.askSub}</p>
            <div className={s.card}>
              <TextField
                label={DEMO.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="primary" full type="button" onClick={() => go('메일 보냄')}>
                {DEMO.send}
              </Button>
              <p className={s.hintCenter}>{DEMO.googleHint}</p>
            </div>
            <div className={s.links}>
              <Link to={DEMO.loginHref}>{DEMO.backLogin}</Link>
              <Link to={DEMO.signupHref}>{DEMO.signup}</Link>
            </div>
          </>
        ) : null}

        {mock === '메일 보냄' ? (
          <>
            <h1 className={s.title}>{DEMO.sentTitle}</h1>
            <p className={s.sub}>{DEMO.sentSub}</p>
            <div className={s.card}>
              <div className={s.mailbox}>
                <b>{DEMO.sentMask}</b>
                <p>{DEMO.sentBody}</p>
              </div>
              <Button variant="primary" full to={DEMO.loginHref}>
                {DEMO.sentLogin}
              </Button>
              <p className={s.hintCenter}>
                {DEMO.resendHint}{' '}
                <button type="button" className={s.txb} onClick={() => go('메일 보냄')}>
                  {DEMO.resend}
                </button>
              </p>
            </div>
          </>
        ) : null}

        {mock === '새 비밀번호' ? (
          <>
            <h1 className={s.title}>{DEMO.newTitle}</h1>
            <p className={s.sub}>{DEMO.newSub}</p>
            <div className={s.card}>
              <TextField
                label={DEMO.pw}
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                error={err && (err === DEMO.pwShort || err === DEMO.pwMixed) ? err : undefined}
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
                error={err === DEMO.pwMismatch ? err : undefined}
              />
              <Button
                variant="primary"
                full
                type="button"
                onClick={() => {
                  const e = passwordError(pw, pw2);
                  if (e) {
                    setTried(true);
                    return;
                  }
                  go('완료');
                }}
              >
                {DEMO.change}
              </Button>
              <p className={s.hintCenter}>{DEMO.changeHint}</p>
            </div>
          </>
        ) : null}

        {mock === '링크 만료' ? (
          <>
            <h1 className={s.title}>{DEMO.expiredTitle}</h1>
            <p className={s.sub}>{DEMO.expiredSub}</p>
            <div className={s.card}>
              <Band tone="warn" title={DEMO.expiredBandTitle}>
                {DEMO.expiredBandBody}
              </Band>
              <div className={s.bandGap}>
                <Button variant="primary" full type="button" onClick={() => go('이메일 입력')}>
                  {DEMO.expiredCta}
                </Button>
              </div>
            </div>
            <div className={s.links}>
              <Link to={DEMO.loginHref}>{DEMO.backLogin}</Link>
            </div>
          </>
        ) : null}

        {mock === '완료' ? (
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

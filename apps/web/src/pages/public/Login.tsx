/* 로그인 — 실제 /auth/login. 모달 틀은 App, 본문만. */
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, TextField } from '@/components/ui';
import { AuthError } from '@/app/auth';
import { ROLE_HOME, useSession } from '@/app/session';
import { startGoogleOAuth } from '@/app/google-oauth';
import { DEMO } from './Login.data';
import s from './Login.module.css';

function safeNext(value: string | null): string | null {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null;
}

export default function Login() {
  const [params] = useSearchParams();
  const loc = useLocation();
  const navigate = useNavigate();
  const { login } = useSession();
  const next = safeNext(params.get('next'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState(false);

  function loginWithGoogle() {
    setGoogleError(false);
    try {
      startGoogleOAuth();
    } catch {
      setGoogleError(true);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const user = await login(email.trim(), password);
      setPassword('');
      navigate(next ?? ROLE_HOME[user.role], { replace: true });
    } catch (caught) {
      if (caught instanceof AuthError) {
        setError(caught.status === 401 || caught.code === 'INVALID_CREDENTIALS'
          ? '이메일 또는 비밀번호를 확인해 주세요.'
          : caught.code === 'ACCOUNT_INACTIVE'
            ? '사용할 수 없는 계정입니다.'
            : caught.message);
      } else {
        setError('로그인에 실패했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.body} data-screen="Login">
      <p className={s.heading}>{loc.pathname === '/supplier' ? DEMO.headingSupplier : DEMO.headingClient}</p>
      <p className={s.sub}>{loc.pathname === '/supplier' ? DEMO.subSupplier : DEMO.subClient}</p>

      {error && (
        <div className={s.fail} role="alert">
          <b>로그인하지 못했습니다</b>
          <p>{error}</p>
        </div>
      )}

      {googleError && (
        <div className={s.fail} role="alert">
          <b>구글 로그인을 시작할 수 없습니다</b>
          <p>잠시 후 다시 시도해 주세요.</p>
        </div>
      )}

      <Button variant="ghost" full className={s.google} onClick={loginWithGoogle}>
        {DEMO.google}
      </Button>
      <div className={s.div}>{DEMO.orEmail}</div>

      <form onSubmit={(event) => void submit(event)}>
        <div className={s.fields}>
          <TextField
            label={DEMO.email}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label={DEMO.password}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <Button type="submit" variant="primary" full disabled={busy}>
          {busy ? '로그인 중' : DEMO.submit}
        </Button>
      </form>

      <div className={s.subrow}>
        <Link to="/reset">{DEMO.reset}</Link>
        <span className={s.bar} aria-hidden="true">|</span>
        <Link to="/signup">{DEMO.signup}</Link>
      </div>

      <p className={s.foot}>{DEMO.foot}</p>
    </div>
  );
}

/* 로그인 — 보드 Login · /?modal=login · M1
 * 상태: 의뢰인 랜딩에서 / 공급자 랜딩에서(/supplier?modal=login) / 로그인 실패 / 역할 안내
 * 모달 틀은 App. 본문만. F-06 · 결정메모 #2. */
import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, TextField } from '@/components/ui';
import { useSession } from '@/app/session';
import { DEMO, loginDemoOf, resolveLoginMock } from './Login.data';
import s from './Login.module.css';

export default function Login() {
  const [params] = useSearchParams();
  const loc = useLocation();
  const navigate = useNavigate();
  const { setDevSession } = useSession();
  const mock = resolveLoginMock(params.get('mock'), loc.pathname);
  const demo = loginDemoOf(mock);

  const [email, setEmail] = useState(demo.emailValue);
  const [password, setPassword] = useState(demo.fail ? '' : 'password1234');

  const enter = (role: 'client' | 'supplier') => {
    setDevSession(role);
    navigate(role === 'client' ? '/c' : '/s', { replace: true });
  };

  return (
    <div className={s.body} data-screen="Login">
      <p className={s.heading}>{demo.heading}</p>
      <p className={s.sub}>{demo.sub}</p>

      {demo.fail ? (
        <div className={s.fail} role="status">
          <b>{DEMO.failTitle}</b>
          <p>{DEMO.failBody}</p>
        </div>
      ) : null}

      {demo.role ? (
        <>
          <div className={s.role}>
            <b>{DEMO.roleTitle}</b>
            {DEMO.roleBody}
          </div>
          <Button variant="primary" full onClick={() => enter('client')}>
            {DEMO.roleCta}
          </Button>
        </>
      ) : null}

      {demo.showForm ? (
        <>
          <div className={s.google}>
            <Button
              variant="ghost"
              full
              onClick={() => enter(demo.supplier ? 'supplier' : 'client')}
            >
              {DEMO.google}
            </Button>
          </div>

          <div className={s.div}>{DEMO.orEmail}</div>

          <div className={s.fields}>
            <TextField
              label={DEMO.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label={DEMO.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            variant="primary"
            full
            onClick={() => enter(demo.supplier ? 'supplier' : 'client')}
          >
            {DEMO.submit}
          </Button>

          <div className={s.subrow}>
            <Link to="/reset">{DEMO.reset}</Link>
            <span className={s.bar} aria-hidden="true">
              |
            </span>
            <Link to="/signup">{DEMO.signup}</Link>
          </div>
        </>
      ) : null}

      <p className={s.foot}>{DEMO.foot}</p>
    </div>
  );
}

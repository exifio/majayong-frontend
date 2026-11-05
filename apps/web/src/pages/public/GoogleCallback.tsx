import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROLE_HOME, useSession } from '@/app/session';
import { consumeGoogleOAuthState } from '@/app/google-oauth';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { exchangeGoogleAuthorizationCode } = useSession();
  const attempted = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    const state = query.get('state');
    const providerError = query.get('error');
    navigate(location.pathname, { replace: true });

    if (!consumeGoogleOAuthState(state) || providerError || !code) {
      setFailed(true);
      return;
    }

    void exchangeGoogleAuthorizationCode(code).then((result) => {
      navigate(
        result.onboardingRequired ? '/signup/role' : ROLE_HOME[result.role],
        { replace: true },
      );
    }).catch(() => setFailed(true));
  }, [exchangeGoogleAuthorizationCode, location.pathname, location.search, navigate]);

  if (failed) {
    return (
      <section data-screen="GoogleCallback" aria-labelledby="google-callback-title">
        <h1 id="google-callback-title">구글 로그인을 완료하지 못했습니다</h1>
        <p role="alert">다시 시도해 주세요.</p>
        <Button to="/signup" variant="primary">회원가입으로 돌아가기</Button>
      </section>
    );
  }

  return <p role="status" data-screen="GoogleCallback">구글 로그인을 완료하는 중입니다.</p>;
}

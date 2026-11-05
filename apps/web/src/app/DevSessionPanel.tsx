/* 개발 시연 세션과 로컬 API 인증 입력. 운영 빌드에는 렌더링하지 않는다. */
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_PATH } from '@/lib/api';
import { DEV_SESSIONS, useSession } from './session';

const LABELS: Record<keyof typeof DEV_SESSIONS, string> = {
  guest: '비로그인', signup: '가입 중', client: '의뢰인', supplier: '공급자', admin: '운영자', suspended: '정지',
};

function tokenFromResponse(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null || !('data' in payload)) return null;
  const data = payload.data;
  if (typeof data !== 'object' || data === null || !('accessToken' in data)) return null;
  return typeof data.accessToken === 'string' && data.accessToken.trim() ? data.accessToken : null;
}

export function DevSessionPanel() {
  const { session, setDevSession, apiAccessToken, setApiAccessToken } = useSession();
  const [draftApiAccessToken, setDraftApiAccessToken] = useState(apiAccessToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  useEffect(() => setDraftApiAccessToken(apiAccessToken), [apiAccessToken]);
  if (!import.meta.env.DEV || import.meta.env.MODE === 'test') return null;

  const current = Object.entries(DEV_SESSIONS).find(([, value]) => value === session)?.[0];

  async function loginToBackend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginMessage(null);
    try {
      const response = await fetch(`${API_BASE_PATH}/auth/login`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload: unknown = await response.json().catch(() => undefined);
      const accessToken = response.ok ? tokenFromResponse(payload) : null;
      if (!accessToken) {
        setLoginMessage(response.status === 401 ? '이메일 또는 비밀번호를 확인해 주세요.' : 'API 로그인에 실패했습니다.');
        return;
      }
      setApiAccessToken(accessToken);
      setDraftApiAccessToken(accessToken);
      setPassword('');
      setLoginMessage('인증 완료. 액세스 토큰은 이 탭의 메모리에만 보관됩니다.');
    } catch {
      setLoginMessage('백엔드에 연결할 수 없습니다.');
    } finally {
      setLoginBusy(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', left: 12, bottom: 12, zIndex: 200, background: '#0F172A', color: '#fff', borderRadius: 10,
      padding: '8px 10px', fontSize: 12, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
      maxWidth: 'calc(100vw - 24px)', opacity: .92,
    }}>
      <strong style={{ marginRight: 4 }}>시연 세션</strong>
      {import.meta.env.DEV && (
        <form onSubmit={loginToBackend} style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            API 계정
            <input
              type="email"
              aria-label="개발 계정 이메일"
              autoComplete="off"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{ width: 160, padding: '3px 6px', borderRadius: 5, border: '1px solid #64748B' }}
            />
          </label>
          <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            비밀번호
            <input
              type="password"
              aria-label="개발 계정 비밀번호"
              autoComplete="off"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ width: 120, padding: '3px 6px', borderRadius: 5, border: '1px solid #64748B' }}
            />
          </label>
          <button type="submit" disabled={loginBusy} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, border: 0, cursor: 'pointer' }}>
            로그인
          </button>
          {loginMessage && <span role="status">{loginMessage}</span>}
        </form>
      )}
      {import.meta.env.DEV && (
        <form onSubmit={(event) => { event.preventDefault(); setApiAccessToken(draftApiAccessToken.trim()); }}
          style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            API 토큰
            <input
              type="password"
              aria-label="개발 API 액세스 토큰"
              autoComplete="off"
              value={draftApiAccessToken}
              onChange={(event) => setDraftApiAccessToken(event.target.value)}
              style={{ width: 150, padding: '3px 6px', borderRadius: 5, border: '1px solid #64748B' }}
            />
          </label>
          <button type="submit" style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, border: 0, cursor: 'pointer' }}>적용</button>
        </form>
      )}
      {(Object.keys(DEV_SESSIONS) as (keyof typeof DEV_SESSIONS)[]).map((key) => (
        <button key={key} type="button" onClick={() => setDevSession(key)} style={{
          fontSize: 12, padding: '3px 8px', borderRadius: 6, border: 0, cursor: 'pointer',
          background: current === key ? '#2563EB' : '#334155', color: '#fff',
        }}>{LABELS[key]}</button>
      ))}
      <Link to="/dev/ui" style={{ color: '#A9BDD6', marginLeft: 6 }}>/dev/ui</Link>
    </div>
  );
}

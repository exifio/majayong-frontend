/* 시연용 세션 전환 — 실제 로그인이 없는 시연 모드(VITE_USE_MOCK, 기본 켜짐)에서 역할별 화면 · 가드를 보여 주는 도구.
 * 개발 서버와 목업 배포에서 보이고, VITE_USE_MOCK=false(실제 API) 빌드에서는 그려지지 않는다. */
import { Link } from 'react-router-dom';
import { DEV_SESSIONS, useSession } from './session';

const LABELS: Record<keyof typeof DEV_SESSIONS, string> = {
  guest: '비로그인', signup: '가입 중', client: '의뢰인', supplier: '공급자', admin: '운영자', suspended: '정지',
};

export function DevSessionPanel() {
  const { session, setDevSession } = useSession();
  if (import.meta.env.VITE_USE_MOCK === 'false' || import.meta.env.MODE === 'test') return null;
  const current = Object.entries(DEV_SESSIONS).find(([, v]) => v === session)?.[0];
  return (
    <div style={{
      position: 'fixed', left: 12, bottom: 12, zIndex: 200, background: '#0F172A', color: '#fff', borderRadius: 10,
      padding: '8px 10px', fontSize: 12, display: 'flex', gap: 6, alignItems: 'center', opacity: .92,
    }}>
      <strong style={{ marginRight: 4 }}>시연 세션</strong>
      {(Object.keys(DEV_SESSIONS) as (keyof typeof DEV_SESSIONS)[]).map((k) => (
        <button key={k} type="button" onClick={() => setDevSession(k)} style={{
          fontSize: 12, padding: '3px 8px', borderRadius: 6, border: 0, cursor: 'pointer',
          background: current === k ? '#2563EB' : '#334155', color: '#fff',
        }}>{LABELS[k]}</button>
      ))}
      {import.meta.env.DEV && <Link to="/dev/ui" style={{ color: '#A9BDD6', marginLeft: 6 }}>/dev/ui</Link>}
    </div>
  );
}

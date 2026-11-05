/* 세션 — M0에서는 개발용 목업 세션. M1에서 실제 로그인(Access/Refresh Token)으로 바꾼다.
 * 개발 중에는 화면 왼쪽 아래 'DEV 세션' 패널로 비로그인 · 가입 중 · 의뢰인 · 공급자 · 운영자 · 정지를 바꿔 본다. */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Role } from '@majayong/types';

export type Session =
  | { status: 'guest' }
  | { status: 'signup' }                        // 가입 진행 중(① 계정 이후 ③ 프로필 전)
  | { status: 'user'; role: Role; name: string; suspended: boolean };

const KEY = 'mj.dev.session';

export const DEV_SESSIONS: Record<string, Session> = {
  guest: { status: 'guest' },
  signup: { status: 'signup' },
  client: { status: 'user', role: 'CLIENT', name: '정민재', suspended: false },
  supplier: { status: 'user', role: 'SUPPLIER', name: '최준호', suspended: false },
  admin: { status: 'user', role: 'ADMIN', name: '운영자', suspended: false },
  suspended: { status: 'user', role: 'CLIENT', name: '정지된 사용자', suspended: true },
};

function load(): Session {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw && raw in DEV_SESSIONS) return DEV_SESSIONS[raw]!;
  } catch { /* 저장소를 쓸 수 없으면 비로그인 */ }
  return DEV_SESSIONS.guest!;
}

type Ctx = {
  session: Session;
  setDevSession: (key: keyof typeof DEV_SESSIONS) => void;
  apiAccessToken: string;
  setApiAccessToken: (token: string) => void;
};
const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ initial, children }: { initial?: Session; children: ReactNode }) {
  const [session, setSession] = useState<Session>(() => initial ?? load());
  const [apiAccessToken, setApiAccessToken] = useState('');
  const setDevSession = useCallback((key: keyof typeof DEV_SESSIONS) => {
    try { window.localStorage.setItem(KEY, key); } catch { /* 무시 */ }
    setSession(DEV_SESSIONS[key]!);
  }, []);
  const value = useMemo(
    () => ({ session, setDevSession, apiAccessToken, setApiAccessToken }),
    [session, setDevSession, apiAccessToken],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('SessionProvider 밖에서 useSession을 썼습니다');
  return ctx;
}

export const ROLE_HOME: Record<Role, string> = { CLIENT: '/c', SUPPLIER: '/s', ADMIN: '/admin' };

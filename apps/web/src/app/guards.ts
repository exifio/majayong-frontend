/* 가드 — routes.ts의 guard 값과 세션으로 '어디로 보낼지'만 정한다(순수 함수 → 테스트 쉬움).
 * 기준: 착수 계획 '라우트와 가드' · 결정메모 #2 */
import type { Guard } from './routes';
import { ROLE_HOME, type Session } from './session';

export function loginRedirect(next: string): string {
  return `/?modal=login&next=${encodeURIComponent(next)}`;
}

/** 보낼 경로를 돌려준다. null이면 통과 */
export function resolveGuard(guard: Guard, session: Session, here: string): string | null {
  if (session.status === 'user' && session.suspended) {
    return here === '/suspended' ? null : '/suspended';
  }
  switch (guard) {
    case 'none':
      return null;
    case 'guest-only':
      if (session.status === 'user') return ROLE_HOME[session.role];
      return null;
    case 'signup-step':
      if (session.status === 'signup') return null;
      if (session.status === 'user') return ROLE_HOME[session.role];
      return '/signup';
    case 'auth':
      if (session.status === 'user') return null;
      return session.status === 'signup' ? '/signup/role' : loginRedirect(here);
    case 'client':
    case 'supplier':
    case 'admin': {
      if (session.status === 'guest') return loginRedirect(here);
      if (session.status === 'signup') return '/signup/role';
      const need = guard === 'client' ? 'CLIENT' : guard === 'supplier' ? 'SUPPLIER' : 'ADMIN';
      // 1계정 1역할 — 다른 공간 경로는 자기 역할 홈으로(공간 전환 없음)
      return session.role === need ? null : ROLE_HOME[session.role];
    }
  }
}

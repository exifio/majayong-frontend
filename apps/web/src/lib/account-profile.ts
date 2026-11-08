/* 계정 · 프로필 공용 규칙 — 백엔드 검증(src/modules/profile/api.ts, identity/auth.ts)과 같은 기준을 화면에서 먼저 확인한다. */
import { ApiRequestError } from './api';

/** 백엔드 nullableUrl · safePortfolioLink와 같은 기준: https, 계정 정보 없음, 점이 있는 호스트. */
export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && url.hostname.includes('.');
  } catch {
    return false;
  }
}

/** 백엔드 hashPassword 규칙: 8자 이상, 영문과 숫자를 함께. 어기면 서버가 500을 돌려주므로 먼저 막는다. */
export function newPasswordError(pw: string, confirm: string): string | undefined {
  if (pw.length < 8) return '8자 이상이어야 합니다';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return '영문과 숫자를 함께 넣어 주세요';
  if (pw !== confirm) return '비밀번호가 같지 않습니다';
  return undefined;
}

export function isAbort(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function errorCode(error: unknown): string | null {
  return error instanceof ApiRequestError ? error.code : null;
}

/** 'YYYY년 M월 가입' */
export function joinedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric' })
    .formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  return `${year}년 ${month}월 가입`;
}

export function starsOf(score: number): string {
  const n = Math.max(0, Math.min(5, Math.round(score)));
  return `${'★'.repeat(n)}${'☆'.repeat(5 - n)}`;
}

/** 공급자 → 의뢰인 공개 프로필 경로. 백엔드는 프로젝트 기준으로만 의뢰인 프로필을 열고 의뢰인 ID를 주지 않아
 * /s/clients/:uid 자리에는 고정 값을 두고 프로젝트 ID를 ?project=로 넘긴다. */
export function publicClientHref(projectId: string): string {
  return `/s/clients/project?project=${encodeURIComponent(projectId)}`;
}

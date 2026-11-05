/* 금액 · 날짜 표기 — 디자인 시스템 8절, 착수 계획 5절
 * 금액: 언제나 '원', 부가세 포함, 원 단위 정수.
 * 날짜: 서버는 UTC, 화면은 Asia/Seoul. */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const TZ = 'Asia/Seoul';

export function formatWon(amount: number): string {
  return `${Math.trunc(amount).toLocaleString('ko-KR')}원`;
}

/** '11월 10일' */
export function formatDate(iso: string): string {
  const d = dayjs(iso).tz(TZ);
  return `${d.month() + 1}월 ${d.date()}일`;
}

/** '11월 4일 14:20' */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${dayjs(iso).tz(TZ).format('HH:mm')}`;
}

/** '14:20' */
export function formatTime(iso: string): string {
  return dayjs(iso).tz(TZ).format('HH:mm');
}

/**
 * 기한까지 남은 날 — 서울 날짜 기준.
 * 남았으면 'D-7', 오늘이면 'D-day', 지났으면 '2일 지남'
 */
export function dday(iso: string, now: Date | string = new Date()): { label: string; overdue: boolean; days: number } {
  const due = dayjs(iso).tz(TZ).startOf('day');
  const today = dayjs(now).tz(TZ).startOf('day');
  const days = due.diff(today, 'day');
  if (days > 0) return { label: `D-${days}`, overdue: false, days };
  if (days === 0) return { label: 'D-day', overdue: false, days };
  return { label: `${-days}일 지남`, overdue: true, days };
}

/* 수수료 · 원천징수 — 끝수는 원 단위 내림(schema 명명 규칙) */
export const FEE_RATE = 0.05;
export const WITHHOLDING_RATE = 0.033;

export function fee(amount: number): number {
  return Math.floor(amount * FEE_RATE);
}

export function withholding(amount: number): number {
  return Math.floor(amount * WITHHOLDING_RATE);
}

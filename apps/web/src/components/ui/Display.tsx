/* 표시 요소 — 디자인 시스템 7 · 8 · 9절: 띠 · 속성 표기 · 기한 · 금액 · 안내 상자 · 빈 상태 · 스켈레톤 · 연락처 가림 */
import type { ReactNode } from 'react';
import { CONTACT_MASK_TOKEN } from '@majayong/types';
import { dday, formatDate, formatWon } from '@/lib/format';
import s from './ui.module.css';

/* ── 띠 ── 열람 기록 띠는 경고색 · 모달 금지 */
export type BandTone = 'done' | 'warn' | 'wait' | 'viewlog';

export function Band({ tone, title, children }: { tone: BandTone; title?: ReactNode; children?: ReactNode }) {
  if (tone === 'viewlog') {
    return <div className={`${s.band} ${s['band-viewlog']}`} data-band="viewlog">{children ?? '열람 기록이 남습니다 · 비밀유지 의무'}</div>;
  }
  return (
    <div className={`${s.band} ${s[`band-${tone}`]}`} data-band={tone} role={tone === 'warn' ? 'status' : undefined}>
      {title && <p className={s.bandTitle}>{title}</p>}
      {children && <p className={s.bandBody}>{children}</p>}
    </div>
  );
}

/* ── 속성 표기 `항목 │ 값` ── 상태는 칩, 속성은 이것 */
export function Attr({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className={s.attr}>
      <span className={s.attrLabel}>{label}</span>
      <span className={s.attrBar} aria-hidden="true" />
      <span className={s.attrValue}>{children}</span>
    </span>
  );
}

/* ── 기한 ── 할 일이 걸린 기한은 amber, 지난 기한은 'N일 지남' */
export function Deadline({ label, at, actionable = false, now }: { label: string; at: string; actionable?: boolean; now?: Date | string }) {
  const d = dday(at, now);
  const strong = actionable || d.overdue;
  return (
    <span className={`${s.deadline} ${strong ? s.deadlineAction : ''}`}>
      {label} {formatDate(at)} · {d.label}
    </span>
  );
}

/* ── 금액 ── 언제나 '원' + tabular-nums */
export function Money({ amount, size = 'item' }: { amount: number; size?: 'item' | 'row' | 'big' }) {
  return <span className={`${s.money} ${s[`money-${size}`]}`}>{formatWon(amount)}</span>;
}

/* ── 안내 상자 ── */
export function Note({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={s.note} role="note">
      <p className={s.noteTitle}>{title}</p>
      {children && <p className={s.noteBody}>{children}</p>}
    </div>
  );
}

export function Info({ children }: { children: ReactNode }) {
  return <div className={s.info}>{children}</div>;
}

/** 체크해야 연결된 기본 버튼이 열린다(예치: '계약서와 정산 규칙을 확인했습니다') */
export function ConfirmCheck({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className={s.confirmCheck}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  );
}

/* ── 빈 상태 · 스켈레톤 ── 일러스트 없음 */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={s.empty}>
      <p className={s.emptyTitle}>{title}</p>
      {children && <p className={s.emptyBody}>{children}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 16 }: { width?: number | string; height?: number }) {
  return <div className={s.skeleton} style={{ width, height }} aria-hidden="true" />;
}

export function LoadingState({ label, title, compact = false }: { label: string; title?: string; compact?: boolean }) {
  return (
    <div className={compact ? s.loadingCompact : s.loadingState}>
      {title && <h1 className={s.loadingTitle}>{title}</h1>}
      <div role="status">
        <span className={s.loadingSrOnly}>{label}</span>
        <div className={s.loadingLines} aria-hidden="true">
          <Skeleton width="55%" height={16} />
          <Skeleton width="85%" height={12} />
          <Skeleton width="70%" height={12} />
        </div>
      </div>
    </div>
  );
}

/* ── 연락처 가림 ── 서버가 가린 본문 속 토큰을 그리기만 한다 */
export function MaskedText({ text }: { text: string }) {
  const parts = text.split(CONTACT_MASK_TOKEN);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <span className={s.maskToken}>연락처 가림</span>}
        </span>
      ))}
    </>
  );
}

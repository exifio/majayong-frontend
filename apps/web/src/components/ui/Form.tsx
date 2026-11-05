/* 폼 · 탭 · 선택 카드 — 디자인 시스템 7 · 9절. 빨강은 폼 오류에만. */
import { useId, useRef, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type TextareaHTMLAttributes } from 'react';
import s from './ui.module.css';

/* ── 필드 ── */
type FieldProps = { label: string; required?: boolean; optional?: boolean; hint?: string; error?: string };

export function TextField({ label, required, optional, hint, error, ...input }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={s.field}>
      <label className={s.fieldLabel} htmlFor={id}>
        {label}{required && <span className={s.fieldRequired}>*</span>}
        {optional && <span className={s.fieldOptional}> (선택)</span>}
      </label>
      <input id={id} className={`${s.input} ${error ? s.inputError : ''}`} aria-invalid={!!error}
        aria-describedby={error || hint ? `${id}-d` : undefined} required={required} {...input} />
      {error ? <p id={`${id}-d`} className={s.fieldError}>{error}</p> : hint ? <p id={`${id}-d`} className={s.fieldHint}>{hint}</p> : null}
    </div>
  );
}

export function TextAreaField({ label, required, optional, hint, error, ...area }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className={s.field}>
      <label className={s.fieldLabel} htmlFor={id}>
        {label}{required && <span className={s.fieldRequired}>*</span>}
        {optional && <span className={s.fieldOptional}> (선택)</span>}
      </label>
      <textarea id={id} className={`${s.input} ${error ? s.inputError : ''}`} aria-invalid={!!error} rows={4} required={required} {...area} />
      {error ? <p className={s.fieldError}>{error}</p> : hint ? <p className={s.fieldHint}>{hint}</p> : null}
    </div>
  );
}

/* ── 탭 2종 ── segment: 목록 거르기 / underline: 같은 화면의 다른 면 */
export type TabItem = { key: string; label: string; count?: number };

export function Tabs({ kind = 'segment', items, value, onChange, label }: {
  kind?: 'segment' | 'underline'; items: TabItem[]; value: string; onChange: (key: string) => void; label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
    refs.current[next]?.focus();
    onChange(items[next]!.key);
  };
  return (
    <div role="tablist" aria-label={label} className={kind === 'segment' ? s.segment : s.underline}>
      {items.map((t, i) => (
        <button key={t.key} ref={(el) => { refs.current[i] = el; }} role="tab" type="button"
          aria-selected={t.key === value} tabIndex={t.key === value ? 0 : -1}
          className={kind === 'segment' ? s.segmentItem : s.underlineItem}
          onClick={() => onChange(t.key)} onKeyDown={(e) => onKey(e, i)}>
          {t.label}{t.count !== undefined && <span className={s.tabCount}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ── 선택 카드 ── 사유 · 유형 · 구분 선택. 위험 흐름이면 danger(navy 테두리) */
export function SelectCards({ options, value, onChange, label, danger }: {
  options: { key: string; label: ReactNode }[]; value: string | null; onChange: (key: string) => void; label: string; danger?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={s.selectGrid}>
      {options.map((o) => (
        <button key={o.key} type="button" role="radio" aria-checked={o.key === value}
          className={`${s.selectCard} ${danger ? s.danger : ''}`} onClick={() => onChange(o.key)}>
          <span className={s.radio} aria-hidden="true" />
          {o.label}
        </button>
      ))}
    </div>
  );
}

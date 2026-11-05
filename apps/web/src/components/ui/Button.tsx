/* 버튼 — 디자인 시스템 6절
 * primary는 화면당 하나(개발 모드 검사: app/devChecks.ts). 목록 · 카드 행동은 tint.
 * 위험 행동(삭제 · 거절 · 철회 · 취소 · 탈퇴 · 서명 거절 · 신고 · 계정 정지)은 warn — 빨강 없음.
 * 비활성이면 이유(disabledReason)를 반드시 적는다. */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import s from './ui.module.css';

export type ButtonVariant = 'primary' | 'tint' | 'ghost' | 'text' | 'warn' | 'onnavy';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Base = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  children: ReactNode;
};

type AsButton = Base & ButtonHTMLAttributes<HTMLButtonElement> & {
  to?: undefined;
  /** disabled일 때 바로 아래에 보일 이유 한 줄 — 비활성 버튼에는 필수 */
  disabledReason?: string;
};

type AsLink = Base & { to: string; className?: string; disabled?: undefined; disabledReason?: undefined };

export type ButtonProps = AsButton | AsLink;

function cls(variant: ButtonVariant, size: ButtonSize, full?: boolean, extra?: string) {
  return [s.btn, s[variant], size !== 'md' ? s[size] : '', full ? s.full : '', extra ?? ''].filter(Boolean).join(' ');
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', full, children } = props;

  if (props.to !== undefined) {
    return (
      <Link to={props.to} className={cls(variant, size, full, props.className)} data-btn={variant}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, full: _f, disabledReason, className, type = 'button', ...rest } = props;
  if (import.meta.env.DEV && rest.disabled && !disabledReason) {
    console.warn('[디자인 시스템 6절] 비활성 버튼에는 disabledReason이 필요합니다:', children);
  }
  const button = (
    <button type={type} className={cls(variant, size, full, className)} data-btn={variant} {...rest}>
      {children}
    </button>
  );
  if (rest.disabled && disabledReason) {
    return (
      <span className={[s.btnWrap, full ? s.full : ''].join(' ')}>
        {button}
        <span className={s.disabledReason}>{disabledReason}</span>
      </span>
    );
  }
  return button;
}

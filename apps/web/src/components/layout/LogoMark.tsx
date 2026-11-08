/* 마자용 로고 마크 — 디자인 캔버스 '마자용 로고 (8-2 확정)'
 * 블록 더미(currentColor) + 기울어진 포인트 블록(--logo-accent). 장식이라 aria-hidden.
 * 크기는 글자 크기를 따른다(1.46em × 1.5em). 색은 놓이는 곳(.logo, .onNavy, .footer)이 정한다. */
import s from './layout.module.css';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={`${s.logoMark}${className ? ` ${className}` : ''}`} viewBox="13 6 76 78" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <rect x="15" y="20" width="22" height="15" rx="4" />
        <rect x="40" y="20" width="22" height="15" rx="4" />
        <rect x="15" y="38" width="34" height="15" rx="4" />
        <rect x="52" y="38" width="33" height="15" rx="4" />
        <rect x="15" y="56" width="70" height="10" rx="4" />
        <rect x="44" y="69" width="12" height="7" />
        <rect x="32" y="76" width="36" height="6" rx="3" />
      </g>
      <rect className={s.logoAccent} x="69" y="9" width="17" height="15" rx="4" transform="rotate(10 77 16)" />
    </svg>
  );
}

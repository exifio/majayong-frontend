/* 브레이크포인트 — 결정메모 #4. CSS 미디어 쿼리 조건에는 변수를 쓸 수 없어 같은 값을 여기 둔다.
 * CSS 모듈에서는 아래 숫자를 그대로 쓴다: max-width: 1439.98px / 1023.98px / 767.98px */
export const BREAKPOINTS = {
  desktop: 1440, // 기준 화면 — 컨테이너 1280 · 거터 40
  laptop: 1024,  // 1024~1439 — 컨테이너 유동 · 거터 32, 2분할 · 2단 유지
  tablet: 768,   // 768~1023 — 2단 → 1단, 초안 · 명세는 탭 전환, 거터 24
  // 768 미만 — 조회 · 간단한 응답 · 채팅, 거터 16
} as const;

export type Viewport = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export function viewportOf(width: number): Viewport {
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.laptop) return 'laptop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

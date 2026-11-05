/* 개발 모드 디자인 규칙 검사 — 디자인 시스템 6 · 12절 중 코드로 볼 수 있는 것.
 * 화면이 바뀔 때마다 한 번 돈다. 경고는 콘솔에만, 사용자 화면에는 아무것도 띄우지 않는다. */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function findDesignViolations(root: ParentNode = document): string[] {
  const issues: string[] = [];
  if (root.querySelector('[data-dev-catalog]')) return issues;

  const pagePrimary = Array.from(root.querySelectorAll('[data-btn="primary"]')).filter((el) => !el.closest('[role="dialog"]'));
  if (pagePrimary.length > 1) issues.push(`파란 버튼이 ${pagePrimary.length}개입니다 — 화면당 하나(6절)`);

  root.querySelectorAll('[role="dialog"][data-danger="true"]').forEach((d) => {
    if (d.querySelector('[data-btn="primary"]')) issues.push('위험 행동 모달에 파란 버튼이 있습니다(6 · 9절)');
  });

  if (root.querySelector('[data-shell="admin"] [data-footer]')) issues.push('운영자 화면에 푸터가 있습니다(12절)');
  if (root.querySelector('[data-gnb] nav[aria-label="공간 전환"]')) issues.push('로그인 후 화면에 공간 전환 토글이 있습니다(3절)');
  return issues;
}

export function useDevDesignChecks() {
  const location = useLocation();
  useEffect(() => {
    if (!import.meta.env.DEV || import.meta.env.MODE === 'test') return;
    const t = window.setTimeout(() => {
      findDesignViolations().forEach((m) => console.warn(`[디자인 시스템] ${location.pathname} — ${m}`));
    }, 300);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.search]);
}

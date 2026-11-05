/* M0 통과 조건 2 — 가드가 정해진 곳으로 보낸다(착수 계획 '라우트와 가드') */
import { describe, expect, it } from 'vitest';
import { location, renderAt } from './render';

const cases: [string, Parameters<typeof renderAt>[1], string][] = [
  // 비로그인 → 보호된 경로 : 로그인 모달 + next
  ['/c/contracts', 'guest', '/?modal=login&next=%2Fc%2Fcontracts'],
  ['/s/projects/p-ondo', 'guest', '/?modal=login&next=%2Fs%2Fprojects%2Fp-ondo'],
  ['/admin/blocks', 'guest', '/?modal=login&next=%2Fadmin%2Fblocks'],
  // 역할이 다른 공간 → 자기 역할 홈(1계정 1역할)
  ['/s/projects', 'client', '/c'],
  ['/c/projects', 'supplier', '/s'],
  ['/admin/reports', 'client', '/c'],
  ['/c', 'admin', '/admin/blocks'],
  // 로그인 → 랜딩 · 가입 · 재설정 : 역할 홈
  ['/', 'client', '/c'],
  ['/supplier', 'supplier', '/s'],
  ['/signup', 'client', '/c'],
  ['/reset', 'supplier', '/s'],
  // 가입 단계
  ['/signup/role', 'guest', '/signup'],
  ['/c', 'signup', '/signup/role'],
  // 정지 계정 → 안내만
  ['/c/contracts', 'suspended', '/suspended'],
  ['/help', 'suspended', '/suspended'],
  // 보조 경로 — /c/chat · /s/chat은 최근 대화 API 결과에 따르므로 App.test.tsx에서 검증한다.
  ['/admin', 'admin', '/admin/blocks'],
  ['/help/inquiry', 'guest', '/?modal=login&next=%2Fhelp%2Finquiry'],
];

describe('가드', () => {
  for (const [from, who, to] of cases) {
    it(`${who}: ${from} → ${to}`, () => {
      renderAt(from, who);
      expect(location.current).toBe(to);
    });
  }

  it('통과하는 경로는 그대로 둔다', () => {
    renderAt('/c/contracts', 'client');
    expect(location.current).toBe('/c/contracts');
    renderAt('/terms/privacy', 'supplier');
    expect(location.current).toBe('/terms/privacy');
    renderAt('/help', 'guest');
    expect(location.current).toBe('/help');
  });

  it('정지 계정은 /suspended에서 안내를 본다', () => {
    const { container } = renderAt('/suspended', 'suspended');
    expect(container.textContent).toContain('계정 이용이 정지되었습니다');
  });

  it('없는 경로는 404', () => {
    const { container } = renderAt('/nope', 'client');
    expect(container.textContent).toContain('페이지를 찾을 수 없습니다');
  });

  it('로그인한 사람에게는 로그인 모달이 뜨지 않는다', () => {
    const { container } = renderAt('/help?modal=login', 'client');
    expect(container.ownerDocument.querySelector('[role="dialog"]')).toBeNull();
  });
});

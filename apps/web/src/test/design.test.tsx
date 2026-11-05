/* M0 통과 조건 3 — 디자인 시스템 규칙 중 코드로 볼 수 있는 것 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CONTACT_MASK_TOKEN, SupplierNoForbiddenKeys } from '@majayong/types';
import { chipToneOf, ConfirmDialog, MaskedText } from '@/components/ui';
import { findDesignViolations } from '@/app/devChecks';
import { dday, fee, formatDate, formatWon, withholding } from '@/lib/format';
import { CLIENT_MENU, SUPPLIER_MENU } from '@/app/menus';
import { DEMO } from '@/mocks/demo';
import { SCREENS } from '@/app/routes';
import { renderAt, samplePath } from './render';

describe('칩 매핑 — 10.1 · 결정메모 #5', () => {
  it('자동 거절은 아웃라인, 레드 톤은 없다', () => {
    expect(chipToneOf('자동 거절')).toBe('outline');
    expect(chipToneOf('보류')).toBe('outline');
    expect(chipToneOf('예치 대기')).toBe('amber');
    expect(chipToneOf('결제 실패')).toBe('amber');
    expect(chipToneOf('예치 완료')).toBe('teal');
    expect(chipToneOf('모집 중')).toBe('blue');
  });
});

describe('위험 확인 창 — 6 · 9절', () => {
  it('파란 버튼 없이 취소 + warn', () => {
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ConfirmDialog title="탈퇴할까요?" danger confirmLabel="탈퇴하기" onConfirm={() => {}} onCancel={() => {}} /></MemoryRouter>);
    const d = screen.getByRole('dialog');
    expect(d.querySelector('[data-btn="primary"]')).toBeNull();
    expect(within(d).getByText('탈퇴하기').getAttribute('data-btn')).toBe('warn');
    expect(findDesignViolations(document)).toEqual([]);
  });
});

describe('셸 규칙 — 3 · 12절', () => {
  it('로그인 후 GNB에는 공간 토글이 없고, 랜딩에는 있다', () => {
    const a = renderAt('/c', 'client');
    expect(a.container.querySelector('nav[aria-label="공간 전환"]')).toBeNull();
    a.unmount();
    const b = renderAt('/', 'guest');
    expect(b.container.querySelector('nav[aria-label="공간 전환"]')).not.toBeNull();
  });

  it('로그인 후 로고는 역할 홈으로 간다', () => {
    const { container } = renderAt('/c/contracts', 'client');
    expect(container.querySelector('a[aria-label="마자용 홈"]')?.getAttribute('href')).toBe('/c');
  });

  it('GNB 메뉴는 디자인 시스템 3절 표와 같다', () => {
    expect(CLIENT_MENU.map((m) => m.label)).toEqual(['홈', '프로젝트 시작', '내 프로젝트', '내 계약', '정산 내역']);
    expect(SUPPLIER_MENU.map((m) => m.label)).toEqual(['홈', '프로젝트 찾기', '내 지원', '내 계약', '북마크']);
  });

  it('모든 페이지 화면이 규칙 검사를 통과한다', () => {
    const issues: string[] = [];
    for (const x of SCREENS.filter((s) => s.kind === 'page')) {
      const who = x.guard === 'client' ? 'client' : x.guard === 'supplier' ? 'supplier' : x.guard === 'admin' ? 'admin' : x.guard === 'signup-step' ? 'signup' : 'guest';
      const r = renderAt(samplePath(x.path!), who);
      findDesignViolations(r.container).forEach((m) => issues.push(`${x.board}: ${m}`));
      r.unmount();
    }
    expect(issues).toEqual([]);
  });
});

describe('금액 · 날짜 — 8절, PRD 9.6 시연 값', () => {
  it('금액은 언제나 원', () => {
    expect(formatWon(3_255_000)).toBe('3,255,000원');
  });
  it('수수료 5% · 원천징수 3.3% — 시연 값과 같다', () => {
    const inst = DEMO.contract.installment;
    expect(inst - fee(inst)).toBe(1_472_500);
    expect(inst - fee(inst) - withholding(inst)).toBe(1_421_350);
    expect(DEMO.contract.agreed + fee(DEMO.contract.agreed)).toBe(DEMO.contract.deposit);
  });
  it('서울 날짜 · D-day', () => {
    expect(formatDate(DEMO.contract.consentDeadline)).toBe('11월 10일');
    expect(formatDate(DEMO.contract.depositDeadline)).toBe('11월 7일');
    expect(formatDate(DEMO.contract.workDueAt)).toBe('12월 16일');
    expect(dday(DEMO.contract.consentDeadline, '2026-11-03T03:00:00Z').label).toBe('D-7');
    expect(dday(DEMO.contract.depositDeadline, '2026-11-09T03:00:00Z')).toMatchObject({ label: '2일 지남', overdue: true });
  });
});

describe('공개 범위 — PRD 7절', () => {
  it('공급자 응답 타입에 금지 필드가 없다(타입 검사가 통과하면 모두 true)', () => {
    expect(SupplierNoForbiddenKeys).toEqual([true, true, true, true]);
  });
  it('연락처 가림 토큰을 그린다', () => {
    const { container } = render(<MaskedText text={`번호는 ${CONTACT_MASK_TOKEN}입니다`} />);
    expect(container.textContent).toBe('번호는 연락처 가림입니다');
  });
});

describe('CSS 모듈 클래스 — 톤 클래스가 실제로 붙는다', () => {
  it('칩 · 띠 · 모달 크기 클래스', async () => {
    const { Chip, Band, Modal } = await import('@/components/ui');
    const { container } = render(<><Chip tone="amber">예치 대기</Chip><Band tone="warn" title="기한" /></>);
    expect(container.querySelector('[data-chip]')!.className).toMatch(/chip-amber/);
    expect(container.querySelector('[data-band]')!.className).toMatch(/band-warn/);
    render(<Modal title="견적서 상세" size="large" onClose={() => {}} />);
    expect(screen.getByRole('dialog').className).toMatch(/modal-large/);
  });
});

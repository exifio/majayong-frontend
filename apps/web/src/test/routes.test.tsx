/* M0 통과 조건 1 — 55개 화면이 모두 맞는 셸로 열린다 */
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { SCREENS, type ScreenRoute } from '@/app/routes';
import { PAGES } from '@/app/App';
import { renderAt, samplePath } from './render';

const whoFor = (x: ScreenRoute) =>
  x.guard === 'client' ? 'client' : x.guard === 'supplier' ? 'supplier' : x.guard === 'admin' ? 'admin'
  : x.guard === 'signup-step' ? 'signup' : 'guest';

const expectedShell = (x: ScreenRoute) => (x.shell === 'viewer' || x.shell === 'public' ? 'public' : x.shell);

describe('화면 목록', () => {
  it('55개 = 비로그인 · 공통 10 + 의뢰인 22 + 공급자 17 + 운영자 6', () => {
    const by = (sp: string) => SCREENS.filter((x) => x.space === sp).length;
    expect(SCREENS).toHaveLength(55);
    expect([by('public'), by('client'), by('supplier'), by('admin')]).toEqual([10, 22, 17, 6]);
  });

  it('드롭다운을 뺀 모든 화면에 페이지 파일이 있다', () => {
    const missing = SCREENS.filter((x) => x.kind !== 'dropdown' && !PAGES[x.board]).map((x) => x.board);
    expect(missing).toEqual([]);
  });
});

describe('페이지 화면이 열린다', () => {
  for (const x of SCREENS.filter((s) => s.kind === 'page')) {
    it(`${x.board} ${x.path}`, () => {
      const { container } = renderAt(samplePath(x.path!), whoFor(x));
      expect(container.querySelector(`[data-screen="${x.board}"]`)).not.toBeNull();
      expect(container.querySelector('[data-shell]')?.getAttribute('data-shell')).toBe(expectedShell(x));
      // 푸터: 운영자 화면에는 없고 나머지에는 있다
      expect(!!container.querySelector('[data-footer]')).toBe(x.shell !== 'admin');
    });
  }
});

describe('모달 화면은 부모 위에 ?modal=로 뜬다', () => {
  for (const x of SCREENS.filter((s) => s.kind === 'modal')) {
    it(`${x.board} ?modal=${x.modal}`, () => {
      const extra = x.modal === 'quote' ? '&sid=s-junho' : '';
      renderAt(`${samplePath(x.path!)}?modal=${x.modal}${extra}`, whoFor(x));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(x.name)).toBeTruthy();
      expect(dialog.querySelector(`[data-screen="${x.board}"]`)).not.toBeNull();
    });
  }

  it('로그인 모달은 공급자 랜딩 위에도 뜬다', () => {
    renderAt('/supplier?modal=login');
    expect(screen.getByRole('dialog').querySelector('[data-screen="Login"]')).not.toBeNull();
  });
});

describe('알림 드롭다운(Notify-Client · Notify-Supplier)', () => {
  for (const who of ['client', 'supplier'] as const) {
    it(`${who} GNB의 알림 아이콘을 누르면 드롭다운이 열린다`, () => {
      const { container } = renderAt(who === 'client' ? '/c' : '/s', who);
      fireEvent.click(screen.getByRole('button', { name: '알림' }));
      const dd = container.querySelector('[data-dropdown="notifications"]');
      expect(dd).not.toBeNull();
      expect(dd!.textContent).toContain('알림으로는 안내만 보냅니다');
    });
  }
});

describe('약관 셸', () => {
  it('로그인 역할에 맞는 셸로 열린다', () => {
    const client = renderAt('/terms/terms', 'client');
    expect(client.container.querySelector('[data-shell]')?.getAttribute('data-shell')).toBe('client');
    client.unmount();

    const supplier = renderAt('/terms/terms', 'supplier');
    expect(supplier.container.querySelector('[data-shell]')?.getAttribute('data-shell')).toBe('supplier');
    supplier.unmount();

    const guest = renderAt('/terms/terms', 'guest');
    expect(guest.container.querySelector('[data-shell]')?.getAttribute('data-shell')).toBe('public');
  });
});

/* 공급자 정산 내역 Settle-Supplier — 실제 정산 응답 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { renderAt } from './render';

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

const emptyStatements = {
  data: {
    simulated: true,
    transferNote: '실제 이체가 아닌 시뮬레이션/수동 처리 기록입니다.',
    statements: [],
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Settle-Supplier — 정산 내역', () => {
  it('시뮬레이션 고지와 빈 상태를 보여 주고 primary가 없다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse(emptyStatements)));
    const { container } = renderAt('/s/settlements', 'supplier', undefined, 'test-token');

    expect(screen.getByRole('heading', { level: 1, name: '정산 내역' })).toBeTruthy();
    expect(await screen.findByText(/시뮬레이션\/수동 처리 기록/)).toBeTruthy();
    expect(screen.getByText('아직 정산 내역이 없습니다')).toBeTruthy();
    expect(container.querySelectorAll('[data-btn="primary"]').length).toBe(0);
    expect(findDesignViolations(container)).toEqual([]);
  });
});

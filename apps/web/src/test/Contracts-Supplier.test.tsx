/* 공급자 내 계약 Contracts-Supplier — 실제 계약 목록 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { renderAt } from './render';

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Contracts-Supplier — 내 계약', () => {
  it('제목·정산 링크를 보여 주고, 계약이 없으면 빈 상태다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [] })));
    const { container } = renderAt('/s/contracts', 'supplier', undefined, 'test-token');

    expect(screen.getByRole('heading', { name: '내 계약' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '정산 내역 보기' }).getAttribute('href')).toBe('/s/settlements');
    expect(await screen.findByText('아직 계약이 없습니다')).toBeTruthy();
    expect(findDesignViolations(container)).toEqual([]);
  });
});

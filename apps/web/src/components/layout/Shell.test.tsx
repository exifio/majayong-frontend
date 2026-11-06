import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('운영자 셸', () => {
  it('문의가 아닌 운영자 화면에서도 WAITING 문의만 메뉴 배지로 표시한다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () =>
      jsonResponse({ data: [{ status: 'WAITING' }, { status: 'ANSWERED' }, { status: 'WAITING' }] })));
    renderAt('/admin/blocks', 'admin', undefined, 'test-token');
    const inquiryLink = within(screen.getByRole('navigation', { name: '운영자 메뉴' }))
      .getByRole('link', { name: /1:1 문의/ });

    await waitFor(() => expect(inquiryLink.textContent).toBe('1:1 문의2'));
  });
});

/* 운영자 1:1 문의 Admin-Inquiries — 실제 /admin/support/inquiries */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { InquiryDto } from '@majayong/types/api';
import { findDesignViolations } from '@/app/devChecks';
import { location, renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const inquiry = (over: Partial<InquiryDto> = {}): InquiryDto => ({
  id: 'inquiry-1',
  userId: 'user-1',
  category: 'PAYMENT',
  contractId: null,
  title: '예치 확인이 늦어요',
  body: '예치했는데 확인 중으로 나옵니다.',
  attachments: [],
  status: 'WAITING',
  answer: null,
  answeredById: null,
  answeredAt: null,
  createdAt: '2026-11-06T00:00:00.000Z',
  ...over,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Admin-Inquiries — 운영자 1:1 문의', () => {
  it('문의 목록과 선택한 문의 내용을 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () =>
      jsonResponse({ data: [inquiry()] })));
    const { container } = renderAt('/admin/inquiries', 'admin', undefined, 'test-token');

    expect(await screen.findByRole('heading', { level: 2, name: '예치 확인이 늦어요' })).toBeTruthy();
    const inquiryLink = within(screen.getByRole('navigation', { name: '운영자 메뉴' }))
      .getByRole('link', { name: /1:1 문의/ });
    await waitFor(() => expect(inquiryLink.textContent).toBe('1:1 문의1'));
    expect(screen.getAllByText('결제 · 예치').length).toBeGreaterThan(0);
    expect(screen.getByText('예치했는데 확인 중으로 나옵니다.')).toBeTruthy();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('답변을 등록하면 POST 후 답변 완료로 표시한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      if (String(input).endsWith('/answer') && init?.method === 'POST') {
        return jsonResponse({ data: inquiry({ status: 'ANSWERED', answer: '확인했습니다.', answeredAt: '2026-11-06T01:00:00.000Z' }) });
      }
      return jsonResponse({ data: [inquiry()] });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/inquiries', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Inquiries"]') as HTMLElement;

    fireEvent.change(await within(root).findByLabelText('답변'), { target: { value: '확인했습니다.' } });
    const inquiryLink = within(screen.getByRole('navigation', { name: '운영자 메뉴' }))
      .getByRole('link', { name: /1:1 문의/ });
    expect(inquiryLink.textContent).toBe('1:1 문의1');
    fireEvent.click(within(root).getByRole('button', { name: '답변 등록' }));

    await waitFor(() => expect(within(root).getByText('확인했습니다.')).toBeTruthy());
    expect(within(root).getAllByText('답변 완료').length).toBeGreaterThan(0);
    expect(inquiryLink.textContent).toBe('1:1 문의');
    const answerCall = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/answer'));
    expect(answerCall).toBeTruthy();
    expect(JSON.parse(String(answerCall![1]?.body))).toEqual({ answer: '확인했습니다.' });
  });

  it('빈 답변은 전송하지 않고 안내한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () =>
      jsonResponse({ data: [inquiry()] }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/admin/inquiries', 'admin', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Admin-Inquiries"]') as HTMLElement;

    fireEvent.click(await within(root).findByRole('button', { name: '답변 등록' }));

    expect(await within(root).findByText('답변 내용을 입력해 주세요')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([path]) => String(path).endsWith('/answer'))).toBe(false);
  });

  it('문의가 없으면 빈 상태를 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () =>
      jsonResponse({ data: [] })));
    renderAt('/admin/inquiries', 'admin', undefined, 'test-token');

    expect(await screen.findByText('문의가 없습니다')).toBeTruthy();
  });

  it('운영자가 아니면 역할 홈으로 보낸다', () => {
    renderAt('/admin/inquiries', 'client', undefined, 'test-token');
    expect(location.current).toBe('/c');
  });
});

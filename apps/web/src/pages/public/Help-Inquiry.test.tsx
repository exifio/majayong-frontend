/* 1:1 문의 Help-Inquiry — 실제 /support/inquiries API */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { InquiryDto } from '@majayong/types/api';
import { findDesignViolations } from '@/app/devChecks';
import { PAGE } from './Help-Inquiry.data';
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

describe('Help-Inquiry — 1:1 문의', () => {
  it('비로그인은 작성 폼 대신 로그인 안내를 보여 준다', () => {
    const { container } = renderAt('/help/inquiry', 'guest');
    const root = container.querySelector('[data-screen="Help-Inquiry"]') as HTMLElement;
    expect(screen.getByRole('heading', { level: 1, name: PAGE.title })).toBeTruthy();
    expect(within(root).getByText(PAGE.guestTitle)).toBeTruthy();
    expect(within(root).getByRole('link', { name: PAGE.login }).getAttribute('href')).toContain('/?modal=login');
    expect(within(root).queryByRole('button', { name: PAGE.submit })).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('문의를 보내면 POST /support/inquiries를 호출하고 보냄 상태를 보여 준다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: inquiry() }, 201));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderAt('/help/inquiry', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Help-Inquiry"]') as HTMLElement;

    fireEvent.change(within(root).getByLabelText(new RegExp(PAGE.titleLabel)), { target: { value: '예치 확인 문의' } });
    fireEvent.change(within(root).getByLabelText(PAGE.bodyLabel), { target: { value: '확인 부탁드립니다.' } });
    fireEvent.click(within(root).getByRole('button', { name: PAGE.submit }));

    expect(await within(root).findByText(PAGE.sentTitle)).toBeTruthy();
    const call = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/api/v1/support/inquiries'));
    expect(call).toBeTruthy();
    const [path, init] = call!;
    expect(path).toBe('/api/v1/support/inquiries');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      category: 'USAGE',
      title: '예치 확인 문의',
      body: '확인 부탁드립니다.',
    });
  });

  it('내 문의 목록에 상태를 표시한다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () =>
      jsonResponse({ data: [inquiry(), inquiry({ id: 'inquiry-2', title: '계정 문의', status: 'ANSWERED', answer: '답변입니다.' })] })));
    const { container } = renderAt('/help/inquiry?tab=mine', 'client', undefined, 'test-token');
    const root = container.querySelector('[data-screen="Help-Inquiry"]') as HTMLElement;

    expect(await within(root).findByText('예치 확인이 늦어요')).toBeTruthy();
    expect(within(root).getByText('답변 대기')).toBeTruthy();
    expect(within(root).getByText('답변 완료')).toBeTruthy();
  });

  it('내 문의 상세에서 답변을 보여 준다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () =>
      jsonResponse({ data: inquiry({ status: 'ANSWERED', answer: '확인했습니다.' }) })));
    renderAt('/help/inquiry?tab=mine&id=inquiry-1', 'client', undefined, 'test-token');

    await waitFor(() => expect(screen.getByText('확인했습니다.')).toBeTruthy());
    expect(location.current).toBe('/help/inquiry?tab=mine&id=inquiry-1');
  });

  it('알림의 tab=my 링크도 내 문의 상세로 연다', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockImplementation(async () =>
      jsonResponse({ data: inquiry({ status: 'ANSWERED', answer: '알림 답변입니다.' }) })));
    renderAt('/help/inquiry?tab=my&id=inquiry-1', 'client', undefined, 'test-token');

    await waitFor(() => expect(screen.getByText('알림 답변입니다.')).toBeTruthy());
    expect(screen.getByRole('tab', { name: PAGE.tabMine })).toBeTruthy();
  });
});

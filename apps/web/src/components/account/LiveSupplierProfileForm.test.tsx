/* 공급자 내 프로필 기본 정보 — GET/PATCH /me/supplier-profile */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, within } from '@testing-library/react';
import { findDesignViolations } from '@/app/devChecks';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const profile = {
  name: '최준호',
  profileImageUrl: null,
  bio: '예약 사이트를 만듭니다.',
  displayName: '준호 스튜디오',
  industryCodes: ['RESTAURANT'],
  skills: ['React', 'Remix'],
  careerYears: 5,
  portfolioItems: [
    { type: 'LINK', url: 'https://junho.example.com', title: '작업 소개' },
    { type: 'FILE', url: 'supplier-1/portfolio/intro.pdf', title: '작업소개서.pdf' },
  ],
  portfolioSummary: '예약 사이트 12곳을 만들었습니다.',
  portfolioSummaryStatus: 'PUBLISHED',
  portfolioConsentAt: '2026-10-01T00:00:00.000Z',
  ndaAgreedAt: '2026-10-01T00:00:00.000Z',
  ndaVersion: 'v1',
  businessType: 'INDIVIDUAL',
  bizRegNoMasked: null,
  payoutBank: null,
  payoutAccountMasked: null,
  payoutHolder: null,
  payoutVerifiedAt: null,
  ratingAvg: 4.8,
  reviewCount: 12,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

async function openForm(fetchMock: ReturnType<typeof vi.fn<typeof fetch>>) {
  vi.stubGlobal('fetch', fetchMock);
  const view = renderAt('/s/profile', 'supplier', undefined, 'test-token');
  const root = view.container.querySelector('[data-screen="Profile-Supplier"]') as HTMLElement;
  await within(root).findByDisplayValue('준호 스튜디오');
  return { ...view, root };
}

describe('LiveSupplierProfileForm — 공급자 기본 정보', () => {
  it('서버 값(경력·기술 스택·링크·요약 상태)을 채우고 개인/사업자 구분은 프로필에 두지 않는다', async () => {
    const { root, container } = await openForm(vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: profile })));

    expect(within(root).getByDisplayValue('5')).toBeTruthy();
    expect(within(root).getByDisplayValue('https://junho.example.com')).toBeTruthy();
    expect(within(root).getByRole('button', { name: 'React' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(root).getByRole('button', { name: 'Remix' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(root).getByText(/작업소개서\.pdf/)).toBeTruthy();
    expect(within(root).getByText('예약 사이트 12곳을 만들었습니다.')).toBeTruthy();
    expect(within(root).queryByLabelText('구분')).toBeNull();
    expect(findDesignViolations(container)).toEqual([]);
  });

  it('링크를 바꾸지 않으면 portfolioItems를 보내지 않아 요약이 초기화되지 않는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: profile }));
    const { root } = await openForm(fetchMock);

    fireEvent.change(within(root).getByLabelText(/경력/), { target: { value: '6' } });
    fireEvent.click(within(root).getByRole('button', { name: 'Node.js' }));
    fireEvent.click(within(root).getByRole('button', { name: '저장' }));

    expect(await within(root).findByText('저장했습니다')).toBeTruthy();
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH');
    expect(String(call?.[0])).toBe('/api/v1/me/supplier-profile');
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({
      name: '최준호',
      displayName: '준호 스튜디오',
      careerYears: 6,
      skills: ['React', 'Remix', 'Node.js'],
      bio: '예약 사이트를 만듭니다.',
    });
  });

  it('링크를 추가하면 올린 파일을 보존해 보내고, 요약 동의를 같은 요청에서 다시 보낸다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: profile }));
    const { root } = await openForm(fetchMock);

    fireEvent.click(within(root).getByRole('button', { name: '링크 추가' }));
    fireEvent.change(within(root).getByRole('textbox', { name: /포트폴리오 링크 2/ }), { target: { value: 'https://github.com/junho' } });
    expect(within(root).getByText(/요약과 요약 동의가 초기화됩니다/)).toBeTruthy();
    fireEvent.click(within(root).getByRole('button', { name: '저장' }));

    await within(root).findByText('저장했습니다');
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH');
    const body = JSON.parse(String(call?.[1]?.body));
    expect(body.portfolioItems).toEqual([
      { type: 'LINK', url: 'https://junho.example.com', title: '작업 소개' },
      { type: 'LINK', url: 'https://github.com/junho' },
      { type: 'FILE', url: 'supplier-1/portfolio/intro.pdf', title: '작업소개서.pdf' },
    ]);
    expect(body.portfolioConsent).toBe(true);
  });

  it('https가 아닌 링크와 범위를 벗어난 경력은 저장 요청 전에 막는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: profile }));
    const { root } = await openForm(fetchMock);

    fireEvent.change(within(root).getByRole('textbox', { name: /포트폴리오 링크/ }), { target: { value: 'http://junho.example.com' } });
    fireEvent.change(within(root).getByLabelText(/경력/), { target: { value: '90' } });
    fireEvent.click(within(root).getByRole('button', { name: '저장' }));

    expect(within(root).getByText('https://로 시작하는 주소를 입력해 주세요')).toBeTruthy();
    expect(within(root).getByText('0에서 80 사이의 정수로 적어 주세요')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false);
  });

  it('저장에 실패하면 오류를 알리고 저장했다고 표시하지 않는다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (_input, init) =>
      init?.method === 'PATCH'
        ? jsonResponse({ error: { code: 'INVALID_REQUEST', message: '요청을 확인해 주세요.', requestId: 'r1' } }, 400)
        : jsonResponse({ data: profile }));
    const { root } = await openForm(fetchMock);

    fireEvent.click(within(root).getByRole('button', { name: '저장' }));

    expect((await within(root).findByRole('alert')).textContent).toBe('프로필을 저장하지 못했습니다. 다시 시도해 주세요.');
    expect(within(root).queryByText('저장했습니다')).toBeNull();
  });
});

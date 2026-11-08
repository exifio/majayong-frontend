/* 단가 분석 리포트 — 실제 API(price-report · apply-estimate) 연결 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { DraftDto, PriceReportDto } from '@majayong/types/api';
import { location, renderAt } from '@/test/render';
import { CONFIRMED_TITLE, basisRows, reportFromDto } from './Report-Client.data';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function errorResponse(code: string, status: number) {
  return jsonResponse({ error: { code, message: '요청을 확인해 주세요.', requestId: 'req-1' } }, status);
}

function draft(hopeBudget: number | null = 3_000_000): DraftDto {
  const block = (blockId: string, name: string, status: 'ADDED' | 'REMOVED', sortOrder: number) => ({
    id: `db-${blockId}`,
    blockId,
    origin: 'FIRST_SENTENCE' as const,
    status,
    unitPrice: 1_000_000,
    pricedAt: '2026-10-05T03:00:00.000Z',
    conditionNotes: null,
    sortOrder,
    block: {
      id: blockId,
      code: blockId.toUpperCase(),
      name,
      functionSummary: `${name} 요약`,
      description: `${name} 설명`,
      conditions: [],
      wireframe: null,
      unitPrice: 1_000_000,
    },
  });
  return {
    id: 'd-7',
    entryType: 'SENTENCE',
    status: 'IN_PROGRESS',
    hopeBudget,
    chatEditCount: 0,
    pendingFeatures: [{ key: 'p-1', summary: '단체 손님 접수', attempts: 1, lastTriedAt: null }],
    firstInputAt: '2026-10-05T03:00:00.000Z',
    renderedAt: '2026-10-05T03:00:00.000Z',
    lastActiveAt: '2026-10-05T03:00:00.000Z',
    createdAt: '2026-10-05T03:00:00.000Z',
    utterances: [],
    blocks: [block('b-shift', '근무표 짜기', 'ADDED', 0), block('b-pay', '급여 계산', 'ADDED', 1), block('b-chat', '직원 메신저', 'REMOVED', 2)],
  };
}

const REPORT: PriceReportDto = {
  subtotal: 2_000_000,
  clientFee: 100_000,
  estimatedTotal: 2_100_000,
  pendingFeatureCount: 1,
  items: [
    { blockId: 'b-shift', name: '근무표 짜기', status: 'ADDED', unitPrice: 1_250_000, priceBasis: '근무표 화면 2개\n약 6일\n시장 검증 전 참고 추정치', includedInEstimate: true, sharePercent: 62.5 },
    { blockId: 'b-pay', name: '급여 계산', status: 'ADDED', unitPrice: 750_000, priceBasis: '급여 규칙 한 줄 설명', includedInEstimate: true, sharePercent: 37.5 },
    { blockId: 'b-chat', name: '직원 메신저', status: 'REMOVED', unitPrice: 900_000, priceBasis: '메신저\n약 4일\n참고', includedInEstimate: false, sharePercent: 0 },
  ],
};

type Handler = (url: string, init?: RequestInit) => Response | undefined;

function stubApi(handler: Handler) {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
    const url = String(input);
    const hit = handler(url, init);
    if (hit) return hit;
    if (url === '/api/v1/drafts/d-7') return jsonResponse({ data: draft() });
    if (url === '/api/v1/drafts/d-7/recommendations') return jsonResponse({ data: [] });
    if (url.startsWith('/api/v1/me/notifications')) return jsonResponse({ data: [], meta: { unreadCount: 0 } });
    return errorResponse('NOT_FOUND', 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const PATH = '/c/drafts/d-7?modal=report';

afterEach(() => vi.unstubAllGlobals());

describe('단가 분석 리포트 화면 모델', () => {
  it('priceBasis 세 줄은 이름을 붙이고, 그 밖에는 산정 근거 한 행으로 보인다', () => {
    expect(basisRows('작업\n기준\n참고').map((row) => row.label)).toEqual(['들어간 작업', '작업량 기준', '달라질 수 있는 것']);
    expect(basisRows('한 줄 근거')).toEqual([{ label: '산정 근거', text: '한 줄 근거' }]);
    expect(basisRows('  ')).toEqual([]);
  });

  it('금액 · 비중 · 합계는 서버 값을 그대로 쓰고 제외 · 만드는 중을 나눈다', () => {
    const model = reportFromDto(REPORT, draft());
    expect(model.totals).toEqual({ count: 2, sub: 2_000_000, fee: 100_000, total: 2_100_000 });
    expect(model.included.map((fn) => fn.share)).toEqual([62.5, 37.5]);
    expect(model.excluded.map((fn) => fn.name)).toEqual(['직원 메신저']);
    expect(model.making).toEqual(['단체 손님 접수']);
    expect(model.included[0]!.date).toMatch(/^2026\. 10\. 5$/);
  });
});

describe('단가 분석 리포트 — 실제 API', { timeout: 20_000 }, () => {
  it('리포트를 실제 금액으로 보이고 시연 데이터는 보이지 않는다', async () => {
    stubApi((url) => (url === '/api/v1/drafts/d-7/price-report' ? jsonResponse({ data: REPORT }) : undefined));
    renderAt(PATH, 'client', undefined, 'test-token');

    const dialog = await screen.findByRole('dialog', { name: '단가 분석 리포트' });
    expect(await within(dialog).findByText('포함 2건 · 수수료 전')).toBeTruthy();
    const list = within(dialog).getByRole('region', { name: '기능별 AI 예상 금액' });
    expect(within(list).getByText('근무표 짜기')).toBeTruthy();
    expect(list.textContent).toMatch(/약\s*1,250,000원/);
    expect(within(list).getByText('합계의 62.5%')).toBeTruthy();
    expect(within(list).getByText('근무표 화면 2개')).toBeTruthy();
    expect(within(list).getByText('산정 근거')).toBeTruthy();
    expect(within(list).getByText('이번 범위에서 제외 — 합계에 넣지 않습니다')).toBeTruthy();
    expect(within(list).getByText('단체 손님 접수')).toBeTruthy();

    expect(dialog.textContent).toMatch(/약\s*2,100,000원/);
    expect(within(dialog).getByText('+ 금액 미정 1건(만드는 중)')).toBeTruthy();
    expect(within(dialog).getByText(/예산보다 900,000원쯤 적습니다/)).toBeTruthy();
    expect(dialog.textContent).not.toMatch(/예약 달력|단골 등급 관리|4,410,000/);
  });

  it('확정된 초안(409)은 리포트가 없다고 안내한다', async () => {
    stubApi((url) => (url === '/api/v1/drafts/d-7/price-report' ? errorResponse('DRAFT_ALREADY_CONFIRMED', 409) : undefined));
    renderAt(PATH, 'client', undefined, 'test-token');

    const dialog = await screen.findByRole('dialog', { name: '단가 분석 리포트' });
    expect(await within(dialog).findByText(CONFIRMED_TITLE)).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: '예상 총액을 희망 예산으로 반영' })).toBeNull();
  });

  it('불러오기에 실패하면 오류와 다시 시도를 보인다', async () => {
    let calls = 0;
    stubApi((url) => {
      if (url !== '/api/v1/drafts/d-7/price-report') return undefined;
      calls += 1;
      return calls === 1 ? errorResponse('INTERNAL_ERROR', 500) : jsonResponse({ data: REPORT });
    });
    renderAt(PATH, 'client', undefined, 'test-token');

    const dialog = await screen.findByRole('dialog', { name: '단가 분석 리포트' });
    expect(await within(dialog).findByRole('alert')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: '다시 시도' }));
    expect(await within(dialog).findByText('포함 2건 · 수수료 전')).toBeTruthy();
  });

  it('반영하면 apply-estimate를 보내고 모달을 닫은 뒤 초안을 다시 읽는다', async () => {
    let applied = false;
    const fetchMock = stubApi((url, init) => {
      if (url === '/api/v1/drafts/d-7/price-report') return jsonResponse({ data: REPORT });
      if (url === '/api/v1/drafts/d-7/apply-estimate' && init?.method === 'POST') {
        applied = true;
        return jsonResponse({ data: { hopeBudget: 2_100_000, estimatedTotal: 2_100_000 } });
      }
      if (url === '/api/v1/drafts/d-7' && applied) return jsonResponse({ data: draft(2_100_000) });
      return undefined;
    });
    renderAt(PATH, 'client', undefined, 'test-token');

    const dialog = await screen.findByRole('dialog', { name: '단가 분석 리포트' });
    fireEvent.click(await within(dialog).findByRole('button', { name: '예상 총액을 희망 예산으로 반영' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(location.current).toBe('/c/drafts/d-7');
    expect(fetchMock.mock.calls.some(([url, init]) => String(url).endsWith('/apply-estimate') && init?.method === 'POST')).toBe(true);
    expect(await screen.findByText(/희망 예산을 AI 예상 총액|생각해 두신 예산 2,100,000원/)).toBeTruthy();
  }, 20_000);

  it('실제 초안 2분할에서 단가 분석 리포트로 갈 수 있다', async () => {
    stubApi(() => undefined);
    renderAt('/c/drafts/d-7', 'client', undefined, 'test-token');
    const link = await screen.findByRole('link', { name: '단가 분석 리포트 보기' });
    expect(link.getAttribute('href')).toBe('/c/drafts/d-7?modal=report');
  }, 20_000);
});

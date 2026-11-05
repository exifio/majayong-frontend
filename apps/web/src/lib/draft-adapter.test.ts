import { describe, expect, it } from 'vitest';
import type { DraftDto } from '@majayong/types/api';
import { endOfDay, parseDateInput, toDraftScreen } from './draft-adapter';

const draft: DraftDto = {
  id: 'draft-1',
  entryType: 'DEFAULT_DRAFT',
  status: 'IN_PROGRESS',
  hopeBudget: 5_000_000,
  chatEditCount: 3,
  pendingFeatures: [],
  firstInputAt: '2026-11-05T00:00:00.000Z',
  renderedAt: '2026-11-05T00:00:01.000Z',
  lastActiveAt: '2026-11-05T00:00:02.000Z',
  createdAt: '2026-11-05T00:00:00.000Z',
  utterances: [{ id: 'u1', kind: 'FIRST_SENTENCE', content: '노쇼가 나면 재료를 버립니다.', createdAt: '2026-11-05T00:00:00.000Z' }],
  blocks: [
    {
      id: 'b1',
      blockId: 'block-1',
      origin: 'DEFAULT_DRAFT',
      status: 'ADDED',
      unitPrice: 1_400_000,
      pricedAt: '2026-11-05T00:00:01.000Z',
      conditionNotes: [{ key: 'c1', note: '전날 취소면 환불', at: '2026-11-05T00:00:02.000Z' }],
      sortOrder: 0,
      block: {
        id: 'block-1',
        code: 'RR-001',
        name: '예약 가능 날짜 조회',
        functionSummary: '예약 가능한 날짜를 달력으로 확인한다.',
        description: '설명',
        conditions: [
          { key: 'c1', text: '조회 가능 기간' },
          { key: 'c2', text: '임시 휴무일 표시' },
        ],
        wireframe: null,
        unitPrice: 1_400_000,
      },
    },
    {
      id: 'b2',
      blockId: 'block-2',
      origin: 'DEFAULT_DRAFT',
      status: 'REMOVED',
      unitPrice: 600_000,
      pricedAt: '2026-11-05T00:00:01.000Z',
      conditionNotes: null,
      sortOrder: 1,
      block: {
        id: 'block-2',
        code: 'RR-006',
        name: '매장 예약 목록 관리',
        functionSummary: '직원이 예약 목록을 확인한다.',
        description: '설명',
        conditions: [{ key: 'c3', text: '정렬 기준' }],
        wireframe: null,
        unitPrice: 600_000,
      },
    },
  ],
};

describe('draft-adapter', () => {
  it('서버 초안을 포함·제외·메모·채팅 횟수로 옮긴다', () => {
    const screen = toDraftScreen(draft);
    expect(screen.included.map((item) => item.name)).toEqual(['예약 가능 날짜 조회']);
    expect(screen.excluded.map((item) => item.name)).toEqual(['매장 예약 목록 관리']);
    expect(screen.included[0]?.memo).toBe('전날 취소면 환불');
    expect(screen.included[0]?.memoKey).toBe('c1');
    expect(screen.hopeBudget).toBe(5_000_000);
    expect(screen.chatRemaining).toBe(27);
    expect(screen.title).toBe('예약 가능 날짜 조회');
    expect(screen.firstSentence).toContain('노쇼');
  });

  it('날짜 입력을 로컬 자정과 그날 끝으로 해석한다', () => {
    const date = parseDateInput('2026-11-19');
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(10);
    expect(date?.getDate()).toBe(19);
    expect(endOfDay(date as Date).getHours()).toBe(23);
    expect(parseDateInput('2026-02-31')).toBeNull();
  });
});

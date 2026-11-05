import { describe, expect, it } from 'vitest';
import type { SupplierProjectDetailDto } from '@majayong/types/api';
import { projectDetailToScreen, projectStatusLabel } from './project-adapter';

const dto: SupplierProjectDetailDto = {
  projectId: 'project-1',
  title: '예약 기능 개발',
  industryCode: 'RESTAURANT_RESERVATION',
  requiredSkills: ['React'],
  status: 'RECRUITING',
  deadline: '2026-11-12T04:07:29.669Z',
  itemCount: 2,
  hopeBudgetBand: '300~400만원',
  summary: '요약',
  hopeBudget: 3_000_000,
  items: [
    {
      specItemId: 'spec-item-1',
      title: '예약 달력',
      description: '달력 설명',
      conditions: [{ key: 'c1', text: '기간을 정한다' }, { key: 'c2', text: 1 }],
      wireframe: null,
    },
    {
      specItemId: 'spec-item-2',
      title: '예약금 결제',
      description: '결제 설명',
      conditions: null,
      wireframe: null,
    },
  ],
  client: {
    name: '의뢰인',
    businessName: '가게',
    industryField: '음식점',
    storeAddress: '서울',
    bio: null,
    websiteUrl: null,
    ratingAvg: 4.5,
    reviewCount: 2,
  },
};

describe('projectDetailToScreen', () => {
  it('keeps the real specItemId of every INCLUDED item', () => {
    const screen = projectDetailToScreen(dto);
    expect(screen.items.map((item) => item.specItemId)).toEqual(['spec-item-1', 'spec-item-2']);
    expect(screen.items[0]!.conditions).toEqual([{ key: 'c1', text: '기간을 정한다' }]);
  });

  it('does not depend on a client userId and carries the API industry code', () => {
    const screen = projectDetailToScreen(dto);
    expect(screen.client).toEqual({
      name: '의뢰인',
      businessName: '가게',
      industryField: '음식점',
      storeAddress: '서울',
      websiteUrl: null,
      bio: null,
    });
    expect('userId' in screen.client).toBe(false);
    expect(screen.industry).toBe('RESTAURANT_RESERVATION');
    expect(screen.status).toBe('모집 중');
  });

  it('maps project statuses to the screen vocabulary', () => {
    expect(projectStatusLabel('EXPIRED')).toBe('모집 마감');
    expect(projectStatusLabel('CONTRACTED')).toBe('계약 중');
  });
});

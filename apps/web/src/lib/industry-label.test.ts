import { describe, expect, it } from 'vitest';
import { INDUSTRY_LABEL_CONTRACT_VERSION, industryLabel } from './industry-label';

describe('industryLabel', () => {
  it('uses the backend contract version and label', () => {
    expect(INDUSTRY_LABEL_CONTRACT_VERSION).toBe(1);
    expect(industryLabel('RESTAURANT_RESERVATION')).toBe('예약기반음식점');
  });

  it('falls back to the contract fallback label for unknown codes', () => {
    expect(industryLabel('UNKNOWN_INDUSTRY')).toBe('기타');
  });
});

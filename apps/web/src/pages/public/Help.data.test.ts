import { describe, expect, test } from 'vitest';
import { DEMO, FAQS, searchFaqs } from './Help.data';

describe('Help FAQ 데이터', () => {
  test('설계 보드와 같은 14개 질문을 제공한다', () => {
    expect(FAQS).toHaveLength(14);
    expect(new Set(FAQS.map((faq) => faq.id)).size).toBe(14);
  });

  test('빠른 주제는 모두 검색 결과가 있다', () => {
    const emptyTopics = DEMO.quick.filter((topic) => searchFaqs(topic).length === 0);
    expect(emptyTopics).toEqual([]);
  });

  test('없는 검색어는 결과가 없다', () => {
    expect(searchFaqs('없는키워드xyz')).toEqual([]);
  });
});

/* 운영자 후처리 데모 상태 고지 — FE-09 */
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAt } from './render';

const NOTICE = /시연 상태/;

describe('운영자 후처리 ?mock 완료 상태', () => {
  it('이견 판정 완료는 저장된 결과가 아님을 알린다', () => {
    renderAt(`/admin/disputes?mock=${encodeURIComponent('판정 완료')}`, 'admin');
    expect(screen.getByText(NOTICE)).toBeTruthy();
  });

  it('블록 병합 화면은 저장 전 시연임을 알린다', () => {
    renderAt(`/admin/blocks?mock=${encodeURIComponent('병합')}`, 'admin');
    expect(screen.getByText(NOTICE)).toBeTruthy();
  });

  it('기본 목록에서는 고지를 표시하지 않는다', () => {
    renderAt('/admin/reports', 'admin');
    expect(screen.queryByText(NOTICE)).toBeNull();
  });
});

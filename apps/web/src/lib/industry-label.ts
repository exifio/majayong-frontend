/* Copied from backend openapi/industry-labels.json (commit 65e3f74, contract version 2).
 * Update this file only when the backend contract version changes. */
import contract from './industry-labels.json';

export const INDUSTRY_LABEL_CONTRACT_VERSION = contract.version;

export function industryLabel(code: string): string {
  return (contract.labels as Record<string, string>)[code] ?? contract.fallbackLabel;
}

/** 업종 필터 선택지 — 계약 파일의 코드 순서 그대로 */
export const INDUSTRY_OPTIONS: { code: string; label: string }[] = Object.entries(contract.labels as Record<string, string>)
  .map(([code, label]) => ({ code, label }));

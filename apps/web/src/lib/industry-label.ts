/* Copied from backend openapi/industry-labels.json (commit 38ea1f7, contract version 1).
 * Update this file only when the backend contract version changes. */
import contract from './industry-labels.json';

export const INDUSTRY_LABEL_CONTRACT_VERSION = contract.version;

export function industryLabel(code: string): string {
  return (contract.labels as Record<string, string>)[code] ?? contract.fallbackLabel;
}

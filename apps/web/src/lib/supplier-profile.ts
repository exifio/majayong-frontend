/* Applicant list helpers: one profile request per supplier, shared by the list and detail.
 * A failed profile request must not block the applicant list. */
import type { SupplierPublicProfileDto } from '@majayong/types/api';
import { ApiRequestError, apiRequest } from './api';

export type SupplierProfileSummary = Pick<SupplierPublicProfileDto, 'supplierId' | 'displayName' | 'profileImageUrl'>;

const cache = new Map<string, SupplierProfileSummary | null>();
const inflight = new Map<string, Promise<SupplierProfileSummary | null>>();

export function supplierProfile(supplierId: string, accessToken: string): Promise<SupplierProfileSummary | null> {
  if (cache.has(supplierId)) return Promise.resolve(cache.get(supplierId) ?? null);
  const pending = inflight.get(supplierId);
  if (pending) return pending;

  const request = apiRequest('getSupplierProfile', `/profiles/suppliers/${encodeURIComponent(supplierId)}`, {
    accessToken,
  }).then((response) => {
    const summary: SupplierProfileSummary = {
      supplierId: response.data.supplierId,
      displayName: response.data.displayName,
      profileImageUrl: response.data.profileImageUrl,
    };
    cache.set(supplierId, summary);
    return summary;
  }).catch((error: unknown) => {
    // Only a definitive 404 is cached; transient failures retry on the next render.
    if (error instanceof ApiRequestError && error.status === 404) cache.set(supplierId, null);
    return null;
  }).finally(() => {
    inflight.delete(supplierId);
  });

  inflight.set(supplierId, request);
  return request;
}

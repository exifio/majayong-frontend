import type { DataEnvelope, ErrorEnvelope } from '@majayong/types/common';
import { refreshAccessToken } from './auth-refresh-bridge';
import type {
  BApiEmptyJsonBodyOperation,
  BApiOperationId,
  BApiQueryParams,
  BApiRequestBodies,
  BApiResponses,
  EmptyJsonObjectDto,
} from '@majayong/types/api';

export const API_BASE_PATH = '/api/v1';

type RequestBodyFor<Operation extends BApiOperationId> =
  Operation extends keyof BApiRequestBodies ? BApiRequestBodies[Operation] : never;
type BodyOption<Operation extends BApiOperationId> =
  Operation extends BApiEmptyJsonBodyOperation
    ? { jsonBody?: EmptyJsonObjectDto }
    : Operation extends keyof BApiRequestBodies
      ? { jsonBody: RequestBodyFor<Operation> }
      : { jsonBody?: never };
type QueryOption<Operation extends BApiOperationId> =
  Operation extends keyof BApiQueryParams
    ? { query?: BApiQueryParams[Operation] }
    : { query?: never };

export type ApiRequestOptions<Operation extends BApiOperationId> =
  Omit<RequestInit, 'body' | 'headers'> & {
    accessToken: string;
    headers?: HeadersInit;
  } & BodyOption<Operation> & QueryOption<Operation>;

const EMPTY_JSON_BODY_OPERATIONS = new Set<BApiEmptyJsonBodyOperation>([
  'withdrawApplication',
  'rejectApplication',
  'openChat',
  'readMessages',
  'confirmAgreement',
  'declineContract',
  'cancelProvisionalContract',
  'readNotification',
  'readAllNotifications',
]);

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly requestId: string | null = null,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  if (!isRecord(value) || !isRecord(value.error)) return false;
  const { code, message, requestId } = value.error;
  return typeof code === 'string' && typeof message === 'string' && typeof requestId === 'string';
}

function isDataEnvelope(value: unknown): value is DataEnvelope<unknown> {
  if (!isRecord(value) || !('data' in value)) return false;
  return !('meta' in value) || isRecord(value.meta);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/**
 * B APIs use JSON envelopes; the operation ID determines request and response DTOs.
 * The response stays in transport form so feature adapters can map it to screen models.
 */
export async function apiRequest<Operation extends BApiOperationId>(
  operationId: Operation,
  path: string,
  options: ApiRequestOptions<Operation>,
): Promise<BApiResponses[Operation]> {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new TypeError(`${operationId}: API path must be below /api/v1.`);
  }

  const { accessToken, headers: suppliedHeaders, jsonBody, query, ...init } = options;
  const body = jsonBody !== undefined
    ? jsonBody
    : EMPTY_JSON_BODY_OPERATIONS.has(operationId as BApiEmptyJsonBodyOperation)
      ? {} satisfies EmptyJsonObjectDto
      : undefined;
  if (!accessToken.trim()) {
    throw new ApiRequestError(401, 'UNAUTHENTICATED', '로그인이 필요합니다.');
  }

  const search = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) search.set(key, String(value));
    }
  }
  const queryString = search.toString();
  const requestPath = `${API_BASE_PATH}${path}${queryString ? `${path.includes('?') ? '&' : '?'}${queryString}` : ''}`;

  async function send(token: string): Promise<Response> {
    const headers = new Headers(suppliedHeaders);
    headers.set('Accept', 'application/json');
    if (body !== undefined) headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${token.trim()}`);
    try {
      return await fetch(
        requestPath,
        body === undefined
          ? { ...init, headers }
          : { ...init, headers, body: JSON.stringify(body) },
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error;
      throw new ApiRequestError(0, 'NETWORK_ERROR', '서버에 연결할 수 없습니다.');
    }
  }

  let response = await send(accessToken);
  let payload = await readJson(response);

  // Expired access token: refresh once (concurrent callers share one refresh) and retry once.
  if (response.status === 401 && isErrorEnvelope(payload) && payload.error.code === 'INVALID_ACCESS_TOKEN') {
    const fresh = await refreshAccessToken();
    if (fresh) {
      response = await send(fresh);
      payload = await readJson(response);
    }
  }
  if (!response.ok) {
    if (isErrorEnvelope(payload)) {
      throw new ApiRequestError(
        response.status,
        payload.error.code,
        payload.error.message,
        payload.error.requestId,
      );
    }
    throw new ApiRequestError(response.status, 'HTTP_ERROR', '요청을 처리할 수 없습니다.');
  }

  if (!isDataEnvelope(payload)) {
    throw new ApiRequestError(response.status, 'INVALID_RESPONSE', '서버 응답 형식이 올바르지 않습니다.');
  }
  return payload as BApiResponses[Operation];
}

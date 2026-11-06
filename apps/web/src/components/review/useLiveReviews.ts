/* 리뷰 실제 API 연결 — 작성 화면과 프로필 받은 리뷰가 공유한다. */
import { useCallback, useEffect, useState } from 'react';
import type { ContractRecordDto, PublicReviewDto } from '@majayong/types/api';
import { useSession } from '@/app/session';
import { apiRequest, ApiRequestError } from '@/lib/api';

export type ReviewSide = 'CLIENT' | 'SUPPLIER';

export type LiveReviewState =
  | { status: 'loading' }
  | { status: 'auth' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      contract: ContractRecordDto;
      counterpartName: string;
      projectTitle: string;
      myReview: PublicReviewDto | null;
    };

export interface ReceivedReview {
  id: string;
  rating: number;
  comment: string | null;
  tags: string[];
  reviewerName: string;
  createdAt: string;
  projectTitle: string;
  agreedAmount: number;
}

export type ReceivedReviewsState =
  | { status: 'loading' }
  | { status: 'auth' }
  | { status: 'error'; message: string }
  | { status: 'ready'; reviews: ReceivedReview[] };

function messageOf(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return '리뷰를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

/** 계약 1건의 리뷰 작성 화면 상태. */
export function useLiveReview(cid: string, side: ReviewSide) {
  const { apiAccessToken, authReady } = useSession();
  const [state, setState] = useState<LiveReviewState>({ status: 'loading' });
  const [version, setVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    if (!authReady) return;
    if (!apiAccessToken.trim()) {
      setState({ status: 'auth' });
      return;
    }
    const controller = new AbortController();
    setState({ status: 'loading' });
    Promise.all([
      apiRequest('getContract', `/contracts/${encodeURIComponent(cid)}`, {
        accessToken: apiAccessToken,
        signal: controller.signal,
      }),
      apiRequest('listChatRooms', '/me/chats', {
        accessToken: apiAccessToken,
        signal: controller.signal,
      }),
      apiRequest('listContractReviews', `/contracts/${encodeURIComponent(cid)}/reviews`, {
        accessToken: apiAccessToken,
        signal: controller.signal,
      }),
    ])
      .then(([contractResponse, roomsResponse, reviewsResponse]) => {
        const contract = contractResponse.data;
        const room = roomsResponse.data.find((row) => row.projectId === contract.projectId);
        const myReview = reviewsResponse.data.find((review) => review.reviewerRole === side) ?? null;
        setState({
          status: 'ready',
          contract,
          counterpartName: room?.counterpartDisplayName ?? (side === 'CLIENT' ? '공급자' : '의뢰인'),
          projectTitle: room?.projectTitle ?? `계약 ${contract.id.slice(0, 8)}`,
          myReview,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setState(
          error instanceof ApiRequestError && error.status === 401
            ? { status: 'auth' }
            : { status: 'error', message: messageOf(error) },
        );
      });
    return () => controller.abort();
  }, [apiAccessToken, authReady, cid, side, version]);

  const submit = useCallback(
    async (input: { rating: number; comment?: string; tags?: string[] }) => {
      if (!apiAccessToken.trim() || submitting) return false;
      setSubmitting(true);
      setSubmitError(null);
      try {
        await apiRequest('createReview', `/contracts/${encodeURIComponent(cid)}/reviews`, {
          method: 'POST',
          accessToken: apiAccessToken,
          jsonBody: input,
        });
        reload();
        return true;
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 409) {
          reload();
          return true;
        }
        setSubmitError(messageOf(error));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [apiAccessToken, cid, reload, submitting],
  );

  return { state, submitting, submitError, reload, submit };
}

/** 내가 받은 리뷰 목록. 완료 계약별 리뷰를 모아 상대가 쓴 것만 남긴다. */
export function useReceivedReviews(side: ReviewSide) {
  const { apiAccessToken, authReady } = useSession();
  const [state, setState] = useState<ReceivedReviewsState>({ status: 'loading' });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    if (!authReady) return;
    if (!apiAccessToken.trim()) {
      setState({ status: 'auth' });
      return;
    }
    const controller = new AbortController();
    setState({ status: 'loading' });
    Promise.all([
      apiRequest('listMyContracts', '/me/contracts', {
        accessToken: apiAccessToken,
        signal: controller.signal,
      }),
      apiRequest('listChatRooms', '/me/chats', {
        accessToken: apiAccessToken,
        signal: controller.signal,
      }),
    ])
      .then(async ([contractsResponse, roomsResponse]) => {
        const completed = contractsResponse.data.filter((contract) => contract.status === 'COMPLETED');
        const perContract = await Promise.all(
          completed.map(async (contract) => {
            const response = await apiRequest(
              'listContractReviews',
              `/contracts/${encodeURIComponent(contract.id)}/reviews`,
              { accessToken: apiAccessToken, signal: controller.signal },
            );
            const room = roomsResponse.data.find((row) => row.projectId === contract.projectId);
            return response.data
              .filter((review) => review.reviewerRole !== side)
              .map((review) => ({
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                tags: review.tags,
                reviewerName: room?.counterpartDisplayName ?? review.reviewerDisplayName,
                createdAt: review.createdAt,
                projectTitle: room?.projectTitle ?? `계약 ${contract.id.slice(0, 8)}`,
                agreedAmount: contract.agreedAmount,
              }));
          }),
        );
        setState({
          status: 'ready',
          reviews: perContract
            .flat()
            .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
        });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setState(
          error instanceof ApiRequestError && error.status === 401
            ? { status: 'auth' }
            : { status: 'error', message: messageOf(error) },
        );
      });
    return () => controller.abort();
  }, [apiAccessToken, authReady, side, version]);

  return { state, reload };
}

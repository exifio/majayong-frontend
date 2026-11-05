/* B 의뢰인 지원자 목록 — listProjectApplications가 주는 필드만 보여 준다. 선정·거절은 계약 확정 전이라 연결하지 않는다. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SupplierApplicationCardDto } from '@majayong/types/api';
import { Money } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatDateTime } from '@/lib/format';

type State = 'loading' | 'success' | 'auth-error' | 'error';

function reviewsLabel(count: number): string {
  return count > 0 ? `리뷰 ${count}건` : '리뷰 없음';
}

export function LiveApplications({ pid, styles }: { pid?: string; styles: Record<string, string> }) {
  const s = styles;
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<State>('loading');
  const [cards, setCards] = useState<SupplierApplicationCardDto[]>([]);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!pid) return;
    const controller = new AbortController();
    setState('loading');
    apiRequest('listProjectApplications', `/projects/${encodeURIComponent(pid)}/applications`, {
      accessToken: apiAccessToken,
      signal: controller.signal,
    }).then((response) => {
      setCards(response.data);
      setState('success');
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
    });
    return () => controller.abort();
  }, [pid, apiAccessToken, retry]);

  if (!pid) return <div className={s.page}><p role="alert" style={{ padding: 24 }}>프로젝트를 찾을 수 없습니다.</p></div>;

  return (
    <div className={s.page} data-screen="Compare-Client-Live">
      <p className={s.crumb}>
        <Link to="/c/projects">내 프로젝트</Link> › 지원자
      </p>

      {state !== 'success' && (
        <>
          {state === 'loading' && <p role="status" style={{ padding: 24 }}>지원자를 불러오는 중입니다.</p>}
          {state === 'auth-error' && <p role="alert" style={{ padding: 24 }}>API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.</p>}
          {state === 'error' && <p role="alert" style={{ padding: 24 }}>지원자를 불러오지 못했습니다.</p>}
        </>
      )}

      {state === 'success' && (
        <>
          <div className={s.head}>
            <div>
              <h1 className={s.title}>지원자 {cards.length}건</h1>
              <p className={s.sub}>지원 금액·기간·경력·포트폴리오 요약만 표시합니다.</p>
            </div>
          </div>

          {cards.length === 0 ? (
            <p role="status" style={{ padding: 24 }}>아직 지원자가 없습니다.</p>
          ) : (
            <section className={s.list} aria-label="지원한 공급자">
              {cards.map((card) => (
                <article key={card.applicationId} className={s.card} data-application-id={card.applicationId}>
                  <div className={s.left}>
                    <div className={s.top}>
                      <p className={s.nm}>공급자 {card.supplierId.slice(0, 8)}</p>
                    </div>
                    <p className={s.mt}>
                      {card.careerYears === null ? '경력 미등록' : `경력 ${card.careerYears}년`}
                      <span className={s.sep}>|</span>
                      {card.ratingAvg === null ? '평점 없음' : `${card.ratingAvg}점`}
                      <span className={s.sep}>|</span>
                      {reviewsLabel(card.reviewCount)}
                      <span className={s.sep}>|</span>
                      완료 계약 {card.completedContractCount}건
                    </p>
                    <p className={s.mt}>
                      지원일 {formatDateTime(card.submittedAt)} · 질문 {card.questionCount}개 · 수정 {card.revisionCount}회
                    </p>
                    {card.portfolioSummary ? (
                      <div className={s.pf}>
                        <p className={s.pfK}>포트폴리오 요약</p>
                        <p>{card.portfolioSummary}</p>
                      </div>
                    ) : (
                      <div className={`${s.pf} ${s.pfNone}`}>
                        <p className={s.pfK}>포트폴리오</p>
                        <p>요약이 없습니다.</p>
                      </div>
                    )}
                  </div>

                  <div className={s.right}>
                    <div className={s.amt}>
                      <p className={s.amtK}>지원 금액</p>
                      <Money amount={card.totalAmount} size="big" />
                      <div className={s.fx}>{card.durationDays}일</div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

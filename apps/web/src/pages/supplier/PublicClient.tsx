/* 의뢰인 공개 프로필 — 보드 PublicClient · /s/clients/:uid · M6
 * 상태: 기본 / 첫 거래. F-07 · F-23. 이메일·연락처·원문·예산 없음. 파란 버튼 없음.
 * 백엔드는 프로젝트 기준으로만 의뢰인 프로필을 연다(GET /projects/:projectId/client-profile · /client-reviews).
 * 응답에 의뢰인 ID가 없으므로 실제 화면은 ?project=<projectId>로 들어온다. ?mock=이 있으면 보드 시연. */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ClientProjectProfileDto, PublicReviewDto } from '@majayong/types/api';
import { Band, Button, EmptyState, LoadingState } from '@/components/ui';
import { useSession } from '@/app/session';
import { apiRequest } from '@/lib/api';
import { errorCode, isAbort, joinedLabel, starsOf as liveStars } from '@/lib/account-profile';
import { formatDate } from '@/lib/format';
import { DEMO, resolvePublicMock, starsOf } from './PublicClient.data';
import s from './PublicClient.module.css';

export default function PublicClient() {
  const { apiAccessToken } = useSession();
  const [params] = useSearchParams();
  if (apiAccessToken.trim() && !params.has('mock')) return <LivePublicClient projectId={params.get('project')} />;
  return <PublicClientDemo />;
}

function PublicClientDemo() {
  const [params] = useSearchParams();
  const mock = resolvePublicMock(params.get('mock'));
  const first = mock === '첫 거래';

  return (
    <div className={s.page} data-screen="PublicClient">
      <p className={s.back}>
        <Button variant="text" to={DEMO.backHref}>
          {DEMO.back}
        </Button>
      </p>

      <Band tone="viewlog">{DEMO.viewBand}</Band>

      <section className={s.hero} aria-label="의뢰인 정보">
        <span className={s.ava} aria-hidden="true">
          {DEMO.initial}
        </span>
        <div>
          <h1 className={s.name}>
            {DEMO.name} · {DEMO.biz}
          </h1>
          <p className={s.meta}>
            {DEMO.industry} · {DEMO.seats} · {DEMO.joined}
            {!first ? (
              <>
                {' '}
                · ★ {DEMO.rating} · 완료 {DEMO.done}건
              </>
            ) : null}
          </p>
        </div>
      </section>

      <dl className={s.rows}>
        <div>
          <dt>업종</dt>
          <dd>{DEMO.industry}</dd>
        </div>
        <div>
          <dt>규모</dt>
          <dd>{DEMO.seats}</dd>
        </div>
        <div>
          <dt>가게 주소</dt>
          <dd>{DEMO.address}</dd>
        </div>
        <div>
          <dt>웹사이트</dt>
          <dd>{DEMO.website}</dd>
        </div>
        <div>
          <dt>자기소개</dt>
          <dd>{DEMO.intro}</dd>
        </div>
      </dl>

      <section className={s.block} aria-labelledby="h-rv">
        <h2 id="h-rv">{DEMO.reviewsTitle}</h2>
        {first ? (
          <EmptyState title={DEMO.emptyTitle}>{DEMO.emptyBody}</EmptyState>
        ) : (
          <>
            <div className={s.chips}>
              {DEMO.tagCounts.map((t) => (
                <span key={t.n} className={s.chip}>
                  {t.n}
                  <b>{t.c}</b>
                </span>
              ))}
            </div>
            <ul className={s.reviews}>
              {DEMO.reviews.map((r) => (
                <li key={r.who + r.date} className={s.review}>
                  <div className={s.reviewHead}>
                    <b>{r.who}</b>
                    <span>{r.date}</span>
                  </div>
                  <p className={s.stars}>
                    {starsOf(r.score)}
                    <em>{r.score}점</em>
                  </p>
                  <div className={s.chips}>
                    {r.tags.map((t) => (
                      <span key={t} className={s.chip}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className={s.reviewText}>{r.text}</p>
                  <p className={s.linkSub}>{r.ctx}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <p className={s.note}>{DEMO.contactNote}</p>
    </div>
  );
}

type LiveState =
  | { status: 'loading' }
  | { status: 'blocked'; title: string; body: string }
  | { status: 'error' }
  | { status: 'ready'; profile: ClientProjectProfileDto };

type ReviewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; reviews: PublicReviewDto[] };

function blockedOf(code: string | null): { title: string; body: string } | null {
  switch (code) {
    case 'SUPPLIER_NDA_REQUIRED':
      return { title: '비밀유지 의무 동의가 필요합니다', body: '프로젝트 상세에서 비밀유지 의무에 동의한 뒤 의뢰인 프로필을 볼 수 있습니다.' };
    case 'PROJECT_DETAIL_REQUIRED':
      return { title: '프로젝트 상세를 먼저 열어 주세요', body: '명세 상세를 연 프로젝트의 의뢰인만 프로필을 볼 수 있습니다.' };
    case 'CLIENT_PROFILE_NOT_FOUND':
      return { title: '의뢰인이 프로필을 아직 채우지 않았습니다', body: '상호를 입력한 의뢰인만 프로필이 공개됩니다.' };
    case 'PROJECT_NOT_FOUND':
      return { title: '프로젝트를 찾을 수 없습니다', body: '삭제됐거나 주소가 잘못된 프로젝트입니다.' };
    default:
      return null;
  }
}

function LivePublicClient({ projectId }: { projectId: string | null }) {
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<LiveState>({ status: 'loading' });
  const [reviews, setReviews] = useState<ReviewState>({ status: 'loading' });

  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();
    const base = `/projects/${encodeURIComponent(projectId)}`;
    setState({ status: 'loading' });
    setReviews({ status: 'loading' });
    apiRequest('getClientProjectProfile', `${base}/client-profile`, { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => setState({ status: 'ready', profile: response.data }))
      .catch((error: unknown) => {
        if (isAbort(error)) return;
        const blocked = blockedOf(errorCode(error));
        setState(blocked ? { status: 'blocked', ...blocked } : { status: 'error' });
      });
    apiRequest('listClientReviews', `${base}/client-reviews`, { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => setReviews({ status: 'ready', reviews: response.data }))
      .catch((error: unknown) => {
        if (isAbort(error)) return;
        setReviews({ status: 'error' });
      });
    return () => controller.abort();
  }, [apiAccessToken, projectId]);

  const backHref = projectId ? `/s/projects/${encodeURIComponent(projectId)}` : '/s/projects';
  const back = (
    <p className={s.back}>
      <Button variant="text" to={backHref}>{projectId ? DEMO.back : '프로젝트 찾기로 가기'}</Button>
    </p>
  );

  if (!projectId) {
    return (
      <div className={s.page} data-screen="PublicClient">
        {back}
        <EmptyState title="프로젝트에서 의뢰인 프로필을 열어 주세요">
          의뢰인 프로필은 명세 상세를 연 프로젝트 화면의 의뢰인 정보에서 볼 수 있습니다.
        </EmptyState>
      </div>
    );
  }

  if (state.status !== 'ready') {
    return (
      <div className={s.page} data-screen="PublicClient">
        {back}
        {state.status === 'loading' ? <LoadingState label="의뢰인 프로필을 불러오는 중입니다." compact /> : null}
        {state.status === 'blocked' ? <EmptyState title={state.title}>{state.body}</EmptyState> : null}
        {state.status === 'error' ? (
          <p role="alert">의뢰인 프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
        ) : null}
      </div>
    );
  }

  const p = state.profile;
  const heading = p.name?.trim() ? `${p.name.trim()} · ${p.businessName}` : p.businessName;
  const meta = [
    p.industryField,
    joinedLabel(p.createdAt),
    p.ratingAvg != null && p.reviewCount > 0 ? `★ ${p.ratingAvg.toFixed(1)} · 리뷰 ${p.reviewCount}건` : '리뷰 없음',
    `모집 중 프로젝트 ${p.recruitingProjectCount}건`,
  ].filter(Boolean).join(' · ');

  return (
    <div className={s.page} data-screen="PublicClient">
      {back}

      <Band tone="viewlog">{DEMO.viewBand}</Band>

      <section className={s.hero} aria-label="의뢰인 정보">
        <span className={s.ava} aria-hidden="true">{(p.name?.trim() || p.businessName).slice(0, 1)}</span>
        <div>
          <h1 className={s.name}>{heading}</h1>
          <p className={s.meta}>{meta}</p>
        </div>
      </section>

      <dl className={s.rows}>
        <div>
          <dt>업종</dt>
          <dd>{p.industryField || '등록하지 않음'}</dd>
        </div>
        <div>
          <dt>가게 주소</dt>
          <dd>{p.storeAddress || '등록하지 않음'}</dd>
        </div>
        <div>
          <dt>웹사이트</dt>
          <dd>
            {p.websiteUrl
              ? <a href={p.websiteUrl} target="_blank" rel="noreferrer noopener">{p.websiteUrl}</a>
              : '등록하지 않음'}
          </dd>
        </div>
        <div>
          <dt>자기소개</dt>
          <dd>{p.bio || '등록하지 않음'}</dd>
        </div>
      </dl>

      <section className={s.block} aria-labelledby="h-rv">
        <h2 id="h-rv">{DEMO.reviewsTitle}</h2>
        {reviews.status === 'loading' ? <LoadingState label="리뷰를 불러오는 중입니다." compact /> : null}
        {reviews.status === 'error' ? <p role="alert">리뷰를 불러오지 못했습니다.</p> : null}
        {reviews.status === 'ready' && reviews.reviews.length === 0 ? (
          <EmptyState title={DEMO.emptyTitle}>{DEMO.emptyBody}</EmptyState>
        ) : null}
        {reviews.status === 'ready' && reviews.reviews.length > 0 ? (
          <ul className={s.reviews}>
            {reviews.reviews.map((r) => (
              <li key={r.id} className={s.review}>
                <div className={s.reviewHead}>
                  <b>{r.reviewerDisplayName}</b>
                  <span>{formatDate(r.createdAt)}</span>
                </div>
                <p className={s.stars}>
                  {liveStars(r.rating)}
                  <em>{r.rating}점</em>
                </p>
                {r.tags.length ? (
                  <div className={s.chips}>
                    {r.tags.map((tag) => <span key={tag} className={s.chip}>{tag}</span>)}
                  </div>
                ) : null}
                {r.comment ? <p className={s.reviewText}>{r.comment}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className={s.note}>{DEMO.contactNote}</p>
    </div>
  );
}

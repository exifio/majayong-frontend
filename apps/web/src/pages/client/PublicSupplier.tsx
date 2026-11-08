/* 공급자 공개 프로필 — 보드 PublicSupplier · /c/suppliers/:sid · M6
 * 상태: 기본 / 리뷰 없음. F-21 · F-23. 판정 표시 없음 · 파란 버튼 없음.
 * 로그인(토큰)했으면 GET /profiles/suppliers/:sid · /reviews 실제 값, ?mock=이 있으면 보드 시연. */
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { PublicReviewDto, SupplierPublicProfileDto } from '@majayong/types/api';
import { Button, EmptyState, LoadingState } from '@/components/ui';
import { useSession } from '@/app/session';
import { apiRequest } from '@/lib/api';
import { errorCode, isAbort, joinedLabel, starsOf as liveStars } from '@/lib/account-profile';
import { formatDate } from '@/lib/format';
import { industryLabel } from '@/lib/industry-label';
import {
  DEMO,
  profileOf,
  resolvePublicMock,
  starsOf,
} from './PublicSupplier.data';
import s from './PublicSupplier.module.css';

export default function PublicSupplier() {
  const { apiAccessToken } = useSession();
  const { sid = '' } = useParams<{ sid: string }>();
  const [params] = useSearchParams();
  if (apiAccessToken.trim() && !params.has('mock')) return <LivePublicSupplier sid={sid} />;
  return <PublicSupplierDemo />;
}

function PublicSupplierDemo() {
  const { sid } = useParams<{ sid: string }>();
  const [params] = useSearchParams();
  const mock = resolvePublicMock(params.get('mock'), sid);
  const p = profileOf(mock, sid);

  return (
    <div className={s.page} data-screen="PublicSupplier">
      <p className={s.back}>
        <Button variant="text" to={DEMO.backHref}>
          {DEMO.back}
        </Button>
      </p>

      <section className={s.hero} aria-label="공급자 정보">
        <span className={s.ava} aria-hidden="true">
          {p.initial}
        </span>
        <div>
          <h1 className={s.name}>{p.name}</h1>
          <p className={s.meta}>
            {p.role} · {p.career} · {p.business}
            {p.rating != null ? (
              <>
                {' '}
                · ★ {p.rating} · 리뷰 {p.reviewCount}건
              </>
            ) : (
              <> · 리뷰 없음</>
            )}
            {' '}
            · 완료한 계약 {p.done}건 · {p.joined}
          </p>
        </div>
      </section>

      <dl className={s.rows}>
        <div>
          <dt>활동 업종</dt>
          <dd>
            <span className={s.chip}>{p.industry}</span>
          </dd>
        </div>
        <div>
          <dt>기술 스택</dt>
          <dd className={s.chips}>
            {p.stack.map((t) => (
              <span key={t} className={s.chip}>
                {t}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt>자기소개</dt>
          <dd>{p.bio}</dd>
        </div>
      </dl>

      <section className={s.block} aria-labelledby="h-pf">
        <h2 id="h-pf">{DEMO.portfolio}</h2>
        <div className={s.aiBox}>
          <p className={s.aiLabel}>
            {DEMO.summaryLabel}
            {p.summary ? <span>{DEMO.summaryHint}</span> : null}
          </p>
          <p>{p.summary ?? DEMO.noSummary}</p>
        </div>
        <ul className={s.links}>
          {p.links.map((l) => (
            <li key={l.t}>
              <span className={s.linkTitle}>{l.t}</span>
              <span className={s.linkSub}>{l.s}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.block} aria-labelledby="h-rv">
        <h2 id="h-rv">
          {DEMO.reviewsTitle}
          {p.reviewCount > 0 ? ` ${p.reviewCount}건` : ''}
        </h2>
        {p.reviews.length === 0 ? (
          <EmptyState title={DEMO.emptyTitle}>{DEMO.emptyBody}</EmptyState>
        ) : (
          <ul className={s.reviews}>
            {p.reviews.map((r) => (
              <li key={r.date + r.who} className={s.review}>
                <div className={s.reviewHead}>
                  <span className={s.stars}>{starsOf(r.score)}</span>
                  <span>{r.date}</span>
                </div>
                <p className={s.who}>
                  <b>{r.who}</b> · {r.contract}
                </p>
                <div className={s.chips}>
                  {r.tags.map((t) => (
                    <span key={t} className={s.chip}>
                      {t}
                    </span>
                  ))}
                </div>
                <p className={s.reviewText}>{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className={s.note}>{DEMO.contactNote}</p>
    </div>
  );
}

type LiveState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error' }
  | { status: 'ready'; profile: SupplierPublicProfileDto };

type ReviewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; reviews: PublicReviewDto[] };

function portfolioLabel(item: SupplierPublicProfileDto['portfolioItems'][number]): { title: string; sub: string } {
  if (item.type === 'FILE') return { title: item.title || '올린 파일', sub: '올린 파일 · 5분 동안 열 수 있는 링크' };
  let host = item.url;
  try { host = new URL(item.url).hostname; } catch { /* 표시용 */ }
  return { title: item.title || host, sub: item.title ? host : '링크' };
}

function LivePublicSupplier({ sid }: { sid: string }) {
  const { apiAccessToken } = useSession();
  const navigate = useNavigate();
  const [state, setState] = useState<LiveState>({ status: 'loading' });
  const [reviews, setReviews] = useState<ReviewState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    const path = `/profiles/suppliers/${encodeURIComponent(sid)}`;
    setState({ status: 'loading' });
    setReviews({ status: 'loading' });
    apiRequest('getSupplierProfile', path, { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => setState({ status: 'ready', profile: response.data }))
      .catch((error: unknown) => {
        if (isAbort(error)) return;
        setState({ status: errorCode(error) === 'SUPPLIER_PROFILE_NOT_FOUND' ? 'missing' : 'error' });
      });
    apiRequest('listSupplierReviews', `${path}/reviews`, { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => setReviews({ status: 'ready', reviews: response.data }))
      .catch((error: unknown) => {
        if (isAbort(error)) return;
        setReviews({ status: 'error' });
      });
    return () => controller.abort();
  }, [apiAccessToken, sid]);

  const back = (
    <p className={s.back}>
      <Button variant="text" onClick={() => navigate(-1)}>이전 화면으로</Button>
    </p>
  );

  if (state.status !== 'ready') {
    return (
      <div className={s.page} data-screen="PublicSupplier">
        {back}
        {state.status === 'loading' ? <LoadingState label="공급자 프로필을 불러오는 중입니다." compact /> : null}
        {state.status === 'missing' ? (
          <EmptyState title="공급자 프로필을 찾을 수 없습니다">탈퇴했거나 아직 프로필을 만들지 않은 공급자입니다.</EmptyState>
        ) : null}
        {state.status === 'error' ? (
          <p role="alert">공급자 프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
        ) : null}
      </div>
    );
  }

  const p = state.profile;
  const meta = [
    p.careerYears != null ? `경력 ${p.careerYears}년` : null,
    p.ratingAvg != null && p.reviewCount > 0 ? `★ ${p.ratingAvg.toFixed(1)} · 리뷰 ${p.reviewCount}건` : '리뷰 없음',
    `완료한 계약 ${p.completedContractCount}건`,
    joinedLabel(p.createdAt),
  ].filter(Boolean).join(' · ');

  return (
    <div className={s.page} data-screen="PublicSupplier">
      {back}

      <section className={s.hero} aria-label="공급자 정보">
        <span className={s.ava} aria-hidden="true">{p.displayName.slice(0, 1)}</span>
        <div>
          <h1 className={s.name}>{p.displayName}</h1>
          <p className={s.meta}>{meta}</p>
        </div>
      </section>

      <dl className={s.rows}>
        <div>
          <dt>활동 업종</dt>
          <dd className={s.chips}>
            {p.industryCodes.length
              ? p.industryCodes.map((code) => <span key={code} className={s.chip}>{industryLabel(code)}</span>)
              : '등록하지 않음'}
          </dd>
        </div>
        <div>
          <dt>기술 스택</dt>
          <dd className={s.chips}>
            {p.skills.length
              ? p.skills.map((skill) => <span key={skill} className={s.chip}>{skill}</span>)
              : '등록하지 않음'}
          </dd>
        </div>
        <div>
          <dt>자기소개</dt>
          <dd>{p.bio || '등록하지 않음'}</dd>
        </div>
      </dl>

      <section className={s.block} aria-labelledby="h-pf">
        <h2 id="h-pf">{DEMO.portfolio}</h2>
        <div className={s.aiBox}>
          <p className={s.aiLabel}>
            {DEMO.summaryLabel}
            {p.portfolioSummary ? <span>{DEMO.summaryHint}</span> : null}
          </p>
          <p>{p.portfolioSummary ?? '공개한 포트폴리오 요약이 없습니다.'}</p>
        </div>
        {p.portfolioItems.length ? (
          <ul className={s.links}>
            {p.portfolioItems.map((item) => {
              const label = portfolioLabel(item);
              return (
                <li key={item.url}>
                  <a className={s.linkTitle} href={item.url} target="_blank" rel="noreferrer noopener">{label.title}</a>
                  <span className={s.linkSub}>{label.sub}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <section className={s.block} aria-labelledby="h-rv">
        <h2 id="h-rv">
          {DEMO.reviewsTitle}
          {reviews.status === 'ready' && reviews.reviews.length > 0 ? ` ${reviews.reviews.length}건` : ''}
        </h2>
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
                  <span className={s.stars} aria-label={`${r.rating}점`}>{liveStars(r.rating)}</span>
                  <span>{formatDate(r.createdAt)}</span>
                </div>
                <p className={s.who}><b>{r.reviewerDisplayName}</b></p>
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

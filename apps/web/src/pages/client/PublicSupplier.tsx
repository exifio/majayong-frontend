/* 공급자 공개 프로필 — 보드 PublicSupplier · /c/suppliers/:sid · M6
 * 상태: 기본 / 리뷰 없음. F-21 · F-23. 판정 표시 없음 · 파란 버튼 없음. */
import { useParams, useSearchParams } from 'react-router-dom';
import { Button, EmptyState } from '@/components/ui';
import {
  DEMO,
  profileOf,
  resolvePublicMock,
  starsOf,
} from './PublicSupplier.data';
import s from './PublicSupplier.module.css';

export default function PublicSupplier() {
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

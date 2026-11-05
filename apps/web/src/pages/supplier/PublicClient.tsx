/* 의뢰인 공개 프로필 — 보드 PublicClient · /s/clients/:uid · M6
 * 상태: 기본 / 첫 거래. F-07 · F-23. 이메일·연락처·원문·예산 없음. 파란 버튼 없음. */
import { useSearchParams } from 'react-router-dom';
import { Band, Button, EmptyState } from '@/components/ui';
import { DEMO, resolvePublicMock, starsOf } from './PublicClient.data';
import s from './PublicClient.module.css';

export default function PublicClient() {
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

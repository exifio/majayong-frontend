/* 공급자 리뷰 작성 — 보드 Review-Supplier · /s/contracts/:cid/review · M6
 * 상태: 작성 중 / 제출함. F-14. Review-Client와 같은 구조, 상대는 의뢰인. */
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Band, Button, StatusChip, TextAreaField } from '@/components/ui';
import { LiveReview } from '@/components/review/LiveReview';
import { useSession } from '@/app/session';
import { DEMO, resolveReviewMock } from './Review-Supplier.data';
import s from './Review-Supplier.module.css';

export default function ReviewSupplier() {
  const { apiAccessToken } = useSession();
  const { cid = '' } = useParams();
  if (apiAccessToken.trim()) {
    return <LiveReview cid={cid} side="SUPPLIER" copy={DEMO} styles={s} />;
  }
  return <ReviewSupplierDemo />;
}

function ReviewSupplierDemo() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveReviewMock(params.get('mock'));
  const done = mock === '제출함';

  const [score, setScore] = useState<number | null>(done ? 5 : null);
  const [tags, setTags] = useState<string[]>([...DEMO.tagSelected]);
  const [text, setText] = useState<string>(DEMO.textValue);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
  };

  const submit = () => {
    if (score == null) return;
    navigate(`?mock=${encodeURIComponent('제출함')}`, { replace: true });
  };

  return (
    <div className={s.page} data-screen="Review-Supplier">
      <header className={s.head}>
        <h1 className={s.title}>{done ? DEMO.titleDone : DEMO.titleWrite}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
      </header>

      <section className={s.ctx} aria-label="평가할 계약">
        <div className={s.who}>
          <span className={s.ava} aria-hidden="true">
            {DEMO.initial}
          </span>
          <div>
            <p className={s.whoName}>{DEMO.who}</p>
            <p className={s.whoMeta}>{DEMO.whoMeta}</p>
          </div>
        </div>
        <div className={s.proj}>
          <StatusChip status={DEMO.status} />
          <p className={s.projTitle}>{DEMO.project}</p>
          <p className={s.projMeta}>{DEMO.contractMeta}</p>
        </div>
      </section>

      {done ? (
        <>
          <Band tone="done" title={DEMO.doneBandTitle}>
            {DEMO.doneBandBody}
          </Band>

          <h2 className={s.blockTitle}>{DEMO.myReviewTitle}</h2>
          <article className={s.card} aria-label="내가 쓴 리뷰">
            <div className={s.cardHead}>
              <b>{DEMO.who}님에게</b>
              <span>12월 17일</span>
            </div>
            <p className={s.starsLine}>
              {'★'.repeat(score ?? 5)}
              <em>{score ?? 5}점</em>
            </p>
            <div className={s.tagRow}>
              {tags.map((t) => (
                <span key={t} className={s.tag}>
                  {t}
                </span>
              ))}
            </div>
            <p className={s.cardText}>{text}</p>
          </article>

          <div className={s.actions}>
            <Button variant="primary" to={DEMO.doneHref}>
              {DEMO.doneCta}
            </Button>
          </div>
        </>
      ) : (
        <>
          <section className={s.form} aria-label="리뷰 작성">
            <div className={s.blk}>
              <h2>{DEMO.starLabel}</h2>
              <p className={s.hint}>{DEMO.starHint}</p>
              <div className={s.stars} role="radiogroup" aria-label="별점">
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = score != null && n <= score;
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={score === n}
                      aria-label={`${n}점`}
                      className={`${s.starBtn} ${on ? s.starOn : ''}`}
                      onClick={() => setScore(n)}
                    >
                      ★
                    </button>
                  );
                })}
                {score != null ? (
                  <span className={s.scoreLbl}>
                    {score}점 <span>{DEMO.scoreWords[score]}</span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className={s.blk}>
              <h2>{DEMO.tagsLabel}</h2>
              <p className={s.hint}>{DEMO.tagsHint}</p>
              <div className={s.tagRow}>
                {DEMO.tags.map((tag) => {
                  const on = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`${s.tag} ${on ? s.tagOn : ''}`}
                      aria-pressed={on}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={s.blk}>
              <TextAreaField
                label={DEMO.textLabel}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, DEMO.textMax))}
                hint={DEMO.textHint}
              />
              <p className={s.counter}>
                연락처는 적어도 가려집니다 · {text.length} / {DEMO.textMax}자
              </p>
            </div>
          </section>

          <div className={s.warn}>
            <b>{DEMO.warnTitle}</b>
            <p>{DEMO.warnBody}</p>
          </div>

          <div className={s.actions}>
            <Button variant="ghost" to={DEMO.laterHref}>
              {DEMO.later}
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={submit}
              disabled={score == null}
              disabledReason={score == null ? DEMO.needStar : undefined}
            >
              {DEMO.submit}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* 리뷰 작성 실제 API 화면 — 의뢰인·공급자가 같은 구조를 쓴다. */
import { useState } from 'react';
import { Band, Button, StatusChip, TextAreaField } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useLiveReview, type ReviewSide } from './useLiveReviews';

export interface ReviewCopy {
  titleWrite: string;
  titleDone: string;
  sub: string;
  status: string;
  starLabel: string;
  starHint: string;
  scoreWords: readonly string[];
  needStar: string;
  tagsLabel: string;
  tagsHint: string;
  tags: readonly string[];
  textLabel: string;
  textHint: string;
  textMax: number;
  warnTitle: string;
  warnBody: string;
  later: string;
  laterHref: string;
  submit: string;
  doneBandTitle: string;
  doneBandBody: string;
  doneCta: string;
  doneHref: string;
  myReviewTitle: string;
}

export function LiveReview({
  cid,
  side,
  copy,
  styles,
}: {
  cid: string;
  side: ReviewSide;
  copy: ReviewCopy;
  styles: Record<string, string>;
}) {
  const { state, submitting, submitError, reload, submit } = useLiveReview(cid, side);
  const [score, setScore] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState('');

  if (state.status === 'loading') {
    return <p role="status">리뷰를 불러오는 중입니다.</p>;
  }
  if (state.status === 'auth') {
    return <p role="alert">로그인이 필요합니다.</p>;
  }
  if (state.status === 'error') {
    return (
      <div>
        <p role="alert">{state.message}</p>
        <Button variant="ghost" type="button" onClick={reload}>다시 시도</Button>
      </div>
    );
  }

  const { contract, counterpartName, projectTitle, myReview } = state;
  const done = myReview !== null;
  const canWrite = contract.status === 'COMPLETED';
  const initial = counterpartName.slice(0, 1);
  const withCounterpart = (text: string) =>
    text.replace(/(최준호|정민재)님/g, `${counterpartName}님`);

  if (!canWrite) {
    return (
      <div className={styles.page} data-screen={side === 'CLIENT' ? 'Review-Client' : 'Review-Supplier'}>
        <header className={styles.head}>
          <h1 className={styles.title}>{copy.titleWrite}</h1>
          <p className={styles.sub}>{copy.sub}</p>
        </header>
        <Band tone="wait" title="리뷰를 작성할 수 없습니다">
          완료된 계약만 리뷰를 작성할 수 있습니다.
        </Band>
        <div className={styles.actions}>
          <Button variant="ghost" to={copy.doneHref}>{copy.later}</Button>
        </div>
      </div>
    );
  }

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((value) => value !== tag) : [...prev, tag]));
  };

  const onScore = (value: number) => setScore(value);

  return (
    <div className={styles.page} data-screen={side === 'CLIENT' ? 'Review-Client' : 'Review-Supplier'}>
      <header className={styles.head}>
        <h1 className={styles.title}>{done ? copy.titleDone : copy.titleWrite}</h1>
        <p className={styles.sub}>{copy.sub}</p>
      </header>

      <section className={styles.ctx} aria-label="평가할 계약">
        <div className={styles.who}>
          <span className={styles.ava} aria-hidden="true">{initial}</span>
          <div>
            <p className={styles.whoName}>{counterpartName}</p>
            <p className={styles.whoMeta}>{side === 'CLIENT' ? '공급자' : '의뢰인'}</p>
          </div>
        </div>
        <div className={styles.proj}>
          <StatusChip status={copy.status} />
          <p className={styles.projTitle}>{projectTitle}</p>
          <p className={styles.projMeta}>합의 금액 {contract.agreedAmount.toLocaleString('ko-KR')}원</p>
        </div>
      </section>

      {done ? (
        <>
          <Band tone="done" title={`리뷰를 제출했습니다 · ${formatDate(myReview.createdAt)}`}>
            {withCounterpart(copy.doneBandBody)}
          </Band>

          <h2 className={styles.blockTitle}>{copy.myReviewTitle}</h2>
          <article className={styles.card} aria-label="내가 쓴 리뷰">
            <div className={styles.cardHead}>
              <b>{counterpartName}님에게</b>
              <span>{formatDate(myReview.createdAt)}</span>
            </div>
            <p className={styles.starsLine}>
              {'★'.repeat(myReview.rating)}
              <em>{myReview.rating}점</em>
            </p>
            <div className={styles.tagRow}>
              {myReview.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
            {myReview.comment ? <p className={styles.cardText}>{myReview.comment}</p> : null}
          </article>

          <div className={styles.actions}>
            <Button variant="primary" to={copy.doneHref}>{copy.doneCta}</Button>
          </div>
        </>
      ) : (
        <>
          <section className={styles.form} aria-label="리뷰 작성">
            <div className={styles.blk}>
              <h2>{copy.starLabel}</h2>
              <p className={styles.hint}>{copy.starHint}</p>
              <div className={styles.stars} role="radiogroup" aria-label="별점">
                {[1, 2, 3, 4, 5].map((value) => {
                  const on = score !== null && value <= score;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={score === value}
                      aria-label={`${value}점`}
                      className={`${styles.starBtn} ${on ? styles.starOn : ''}`}
                      onClick={() => onScore(value)}
                    >
                      ★
                    </button>
                  );
                })}
                {score !== null ? (
                  <span className={styles.scoreLbl}>
                    {score}점 <span>{copy.scoreWords[score]}</span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className={styles.blk}>
              <h2>{copy.tagsLabel}</h2>
              <p className={styles.hint}>{copy.tagsHint}</p>
              <div className={styles.tagRow}>
                {copy.tags.map((tag) => {
                  const on = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`${styles.tag} ${on ? styles.tagOn : ''}`}
                      aria-pressed={on}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.blk}>
              <TextAreaField
                label={copy.textLabel}
                value={text}
                onChange={(event) => setText(event.target.value.slice(0, copy.textMax))}
                hint={copy.textHint}
              />
              <p className={styles.counter}>연락처는 적어도 가려집니다 · {text.length} / {copy.textMax}자</p>
            </div>
          </section>

          <div className={styles.warn}>
            <b>{copy.warnTitle}</b>
            <p>{withCounterpart(copy.warnBody)}</p>
          </div>

          {submitError ? <p role="alert">{submitError}</p> : null}

          <div className={styles.actions}>
            <Button variant="ghost" to={copy.laterHref}>{copy.later}</Button>
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                if (score === null) return;
                void submit({
                  rating: score,
                  ...(text.trim() ? { comment: text.trim() } : {}),
                  ...(tags.length ? { tags } : {}),
                });
              }}
              disabled={score === null || submitting}
              disabledReason={score === null ? copy.needStar : submitting ? '제출 중입니다' : undefined}
            >
              {submitting ? '제출 중…' : copy.submit}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

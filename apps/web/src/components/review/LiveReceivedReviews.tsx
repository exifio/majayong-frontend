/* 프로필 받은 리뷰 실제 API 섹션 — 완료 계약의 상대 리뷰만 모아 보여준다. */
import { Button } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useReceivedReviews, type ReviewSide } from './useLiveReviews';

export function LiveReceivedReviews({
  side,
  styles,
}: {
  side: ReviewSide;
  styles: Record<string, string>;
}) {
  const { state, reload } = useReceivedReviews(side);

  if (state.status === 'loading') {
    return (
      <section className={styles.section} aria-label="받은 리뷰">
        <p role="status">받은 리뷰를 불러오는 중입니다.</p>
      </section>
    );
  }
  if (state.status === 'auth') {
    return (
      <section className={styles.section} aria-label="받은 리뷰">
        <p role="alert">로그인이 필요합니다.</p>
      </section>
    );
  }
  if (state.status === 'error') {
    return (
      <section className={styles.section} aria-label="받은 리뷰">
        <p role="alert">{state.message}</p>
        <Button variant="ghost" type="button" onClick={reload}>다시 시도</Button>
      </section>
    );
  }

  const { reviews } = state;
  if (reviews.length === 0) {
    return (
      <section className={styles.section} aria-label="받은 리뷰">
        <div className={styles.summaryCard}>
          <div className={styles.avg}><span className={styles.star}>★</span>—</div>
          <div>
            <p className={styles.summaryTitle}>받은 리뷰 0건</p>
            <p className={styles.summaryHint}>완료한 계약의 상대가 리뷰를 남기면 여기에 표시됩니다.</p>
          </div>
        </div>
      </section>
    );
  }

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const tagCounts = new Map<string, number>();
  for (const review of reviews) {
    for (const tag of review.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
  const topTags = [...tagCounts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5);

  return (
    <section className={styles.section} aria-label="받은 리뷰">
      <div className={styles.summaryCard}>
        <div className={styles.avg}>
          <span className={styles.star}>★</span>
          {average.toFixed(1)}
        </div>
        <div>
          <p className={styles.summaryTitle}>받은 리뷰 {reviews.length}건</p>
          <p className={styles.summaryHint}>완료한 계약의 상대가 남긴 리뷰입니다.</p>
        </div>
      </div>

      <div className={styles.tagRow}>
        {topTags.map(([tag, count]) => (
          <span key={tag} className={styles.tag}>{tag}<b>{count}</b></span>
        ))}
      </div>

      <h2 className={styles.listTitle}>리뷰 {reviews.length}건</h2>
      <ul className={styles.reviews}>
        {reviews.map((review) => (
          <li key={review.id} className={styles.review}>
            <div className={styles.reviewHead}>
              <b>{review.reviewerName}</b>
              <span>{formatDate(review.createdAt)}</span>
            </div>
            <p className={styles.reviewStars}>
              {`${'★'.repeat(review.rating)}${'☆'.repeat(Math.max(0, 5 - review.rating))}`}
              <em>{review.rating}점</em>
            </p>
            <div className={styles.tagRow}>
              {review.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
            {review.comment ? <p className={styles.reviewText}>{review.comment}</p> : null}
            <p className={styles.reviewCtx}>
              {review.projectTitle} · 합의 {review.agreedAmount.toLocaleString('ko-KR')}원
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

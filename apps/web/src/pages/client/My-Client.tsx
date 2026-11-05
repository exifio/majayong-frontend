/* 내 프로젝트 — 보드 My-Client · /c/projects · M2
 * 상태: 홈과 같은 데이터 / 모든 상태 예시 / 프로젝트 없음
 * F-03 · 결정메모 #9. 명세 확정 후 AI 금액 없음. */
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Deadline, EmptyState, Money, StatusChip } from '@/components/ui';
import { DEMO, myDemoOf, resolveMyMock } from './My-Client.data';
import s from './My-Client.module.css';

export default function MyClient() {
  const [params] = useSearchParams();
  const demo = myDemoOf(resolveMyMock(params.get('mock')));

  return (
    <div className={s.page} data-screen="My-Client">
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{DEMO.title}</h1>
          <p className={s.sub}>{DEMO.sub}</p>
        </div>
        {!demo.empty ? (
          <Button variant="primary" to={DEMO.newHref}>
            {DEMO.newCta}
          </Button>
        ) : null}
      </div>

      {demo.empty ? (
        <div className={s.emptyWrap}>
          <EmptyState
            title={DEMO.emptyTitle}
            action={
              <Button variant="primary" to={DEMO.newHref}>
                {DEMO.emptyCta}
              </Button>
            }
          >
            {DEMO.emptyBody}
          </EmptyState>
        </div>
      ) : (
        <div className={s.list}>
          {demo.cards.map((card) => (
            <Link key={card.id} className={s.card} to={card.href}>
              <div>
                <div className={s.top}>
                  <StatusChip status={card.status} />
                  {card.deadlineAt ? (
                    <Deadline
                      label={card.deadlineLabel ?? '기한'}
                      at={card.deadlineAt}
                      actionable={card.status === '모집 중' || card.status === '임시 계약'}
                    />
                  ) : null}
                </div>
                <p className={s.name}>{card.title}</p>
                <div className={s.meta}>{card.meta}</div>
              </div>
              <div className={s.side}>
                {card.quotes != null ? (
                  <div className={s.quotes}>
                    {DEMO.quotesLabel}
                    <b>{card.quotes}건</b>
                  </div>
                ) : null}
                {card.showAi && card.aiAmount != null ? (
                  <div className={s.ai}>
                    수수료 포함 예상 총액
                    <b>
                      <Money amount={card.aiAmount} />
                    </b>
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

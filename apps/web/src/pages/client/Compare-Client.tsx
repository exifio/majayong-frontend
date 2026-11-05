/* 제안 비교 — 보드 Compare-Client · /c/projects/:pid/proposals · M3
 * 상태: 지원 3건 / 지원 1건 / 이전 명세 기준 / 임시 계약 중 / 결렬 후 선택 중 / 지원 0건 · 마감 / 거절 확인
 * 판정 없음 · 파란 버튼 없음. F-09 · 디자인 시스템 10.5 */
import { useEffect, useState, type MouseEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  Chip,
  ConfirmDialog,
  Info,
  Money,
  Note,
  StatusChip,
} from '@/components/ui';
import { formatWon } from '@/lib/format';
import {
  CONTRACT_HREF,
  DEMO,
  DEFAULT_PID,
  MY_HREF,
  chatHref,
  compareDemoOf,
  editSpecHref,
  extendHref,
  profileHref,
  resolveCompareMock,
  reviewsLabel,
  specHref,
  withFee,
  type CompareCard,
} from './Compare-Client.data';
import s from './Compare-Client.module.css';

export default function CompareClient() {
  const { pid = DEFAULT_PID } = useParams();
  const [params, setParams] = useSearchParams();
  const mock = resolveCompareMock(params.get('mock'));
  const demo = compareDemoOf(mock);

  const [reject, setReject] = useState<{ sid: string; name: string } | null>(
    demo.openReject ? { sid: demo.rejectSid, name: demo.rejectName } : null,
  );
  const [reason, setReason] = useState('');

  useEffect(() => {
    const next = compareDemoOf(mock);
    setReject(next.openReject ? { sid: next.rejectSid, name: next.rejectName } : null);
    setReason('');
  }, [mock]);

  const setMock = (next: string | null) => {
    const q = new URLSearchParams(params);
    if (!next || next === '지원 3건') q.delete('mock');
    else q.set('mock', next);
    setParams(q, { replace: true });
  };

  const openQuote = (sid: string) => {
    const q = new URLSearchParams(params);
    q.set('modal', 'quote');
    q.set('sid', sid);
    setParams(q);
  };

  const closeReject = () => {
    setReject(null);
    setReason('');
    if (mock === '거절 확인') setMock('지원 3건');
  };

  return (
    <div className={s.page} data-screen="Compare-Client">
      <p className={s.crumb}>
        <Link to={MY_HREF}>내 프로젝트</Link> › {DEMO.projectTitle}
      </p>

      <div className={s.head}>
        <div>
          <h1 className={s.title}>{demo.title}</h1>
          <p className={s.sub}>
            <b>지원 {demo.nApp}건</b> · {demo.viewsLabel}
          </p>
        </div>
        <div className={s.rt}>
          <Button variant="text" to={specHref(pid)}>
            명세 보기
          </Button>
          <Chip tone="amber">{demo.deadChip}</Chip>
        </div>
      </div>

      {demo.stale && (
        <div className={s.noteGap}>
          <Note title={DEMO.staleTitle}>{DEMO.staleBody}</Note>
        </div>
      )}

      {demo.held && (
        <div className={s.banner}>
          <div className={s.heldBox}>
            <p className={s.heldTitle}>{DEMO.heldTitle}</p>
            <p className={s.heldBody}>{DEMO.heldBody}</p>
          </div>
          <div className={s.bannerActs}>
            <Button variant="tint" size="sm" to={CONTRACT_HREF}>
              계약서 보기
            </Button>
          </div>
        </div>
      )}

      {demo.broke && (
        <div className={s.noteGap}>
          <Note title={DEMO.brokeTitle}>
            {DEMO.brokeBodyPrefix}
            {demo.nApp}
            건 중에서 고르실 수 있습니다 — 11월 17일까지. 새 지원을 받으시려면{' '}
            <Link to={extendHref(pid)}>마감일을 늘려 주세요</Link>.
          </Note>
        </div>
      )}

      {demo.zero && (
        <section className={s.zero} aria-label="지원 없음">
          <h2>{DEMO.zeroTitle}</h2>
          <p className={s.zeroLead}>{DEMO.zeroLead}</p>
          <div className={s.why3}>
            {DEMO.zeroWhy.map((w) => (
              <div key={w.title}>
                <b>{w.title}</b>
                <p>{w.body}</p>
              </div>
            ))}
          </div>
          <div className={s.zeroActs}>
            <Button variant="tint" to={extendHref(pid)}>
              마감 연장
            </Button>
            <Button variant="ghost" to={editSpecHref(pid)}>
              명세 고치기
            </Button>
          </div>
        </section>
      )}

      {!demo.zero && (
        <section className={s.list} aria-label="지원한 공급자">
          {demo.cards.map((card) => (
            <SupplierCard
              key={card.sid}
              card={card}
              pid={pid}
              onOpenQuote={() => openQuote(card.sid)}
              onReject={() => setReject({ sid: card.sid, name: card.name })}
            />
          ))}
        </section>
      )}

      {!demo.zero && (
        <Info>
          <ul className={s.after}>
            {DEMO.after.map((row, i) => (
              <li key={i}>
                {row.bold ? (
                  <>
                    {row.lead}
                    <b>{row.bold}</b>
                    {row.rest}
                  </>
                ) : (
                  row.lead
                )}
              </li>
            ))}
          </ul>
        </Info>
      )}

      {reject && (
        <ConfirmDialog
          title={`${reject.name}님의 지원을 거절할까요?`}
          confirmLabel="거절하기"
          danger
          onConfirm={closeReject}
          onCancel={closeReject}
        >
          <ul className={s.rejectList}>
            <li>
              거절하면 <b>되돌릴 수 없습니다.</b> {reject.name}님에게 &apos;직접 거절&apos; 알림이 갑니다.
            </li>
            <li>{reject.name}님과의 채팅은 읽기 전용이 됩니다.</li>
            <li>다른 지원은 그대로 남습니다.</li>
          </ul>
          <p className={s.rejectLabel}>
            거절 사유 <span>(선택 · 공급자에게 보이지 않습니다)</span>
          </p>
          <textarea
            className={s.rejectTa}
            aria-label="거절 사유"
            placeholder={DEMO.rejectPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </ConfirmDialog>
      )}
    </div>
  );
}

function SupplierCard({
  card,
  pid,
  onOpenQuote,
  onReject,
}: {
  card: CompareCard;
  pid: string;
  onOpenQuote: () => void;
  onReject: () => void;
}) {
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <article
      className={`${s.card} ${card.hold ? s.cardHold : ''}`}
      aria-label={card.name}
      onClick={onOpenQuote}
    >
      <div className={s.left}>
        <span className={s.av} aria-hidden="true">
          {card.ini}
        </span>
        <div className={s.bd}>
          <div className={s.top}>
            <p className={s.nm}>{card.name}</p>
            {card.chip && card.chipTone === 'amber' ? (
              <Chip tone="amber">{card.chip}</Chip>
            ) : null}
            {card.chip && card.chipTone === 'outline' ? (
              <StatusChip status={card.chip} />
            ) : null}
            {card.showQuestions ? (
              <Chip tone="blue">질문 {card.questions}</Chip>
            ) : null}
          </div>
          <p className={s.mt}>
            {card.career}
            <span className={s.sep}>|</span>
            {card.rating != null ? (
              <>
                <span className={s.star}>★</span>
                {card.rating}
              </>
            ) : (
              '평점 없음'
            )}
            <span className={s.sep}>|</span>
            {reviewsLabel(card.reviews)}
            <span className={s.sep}>|</span>
            {card.applied}
          </p>

          {card.summary ? (
            <div className={s.pf}>
              <p className={s.pfK}>
                포트폴리오 요약<span>AI가 등록 자료를 읽고 정리</span>
              </p>
              <p>{card.summary}</p>
            </div>
          ) : (
            <div className={`${s.pf} ${s.pfNone}`}>
              <p className={s.pfK}>포트폴리오</p>
              <p>
                요약이 없습니다. 등록한 링크 {card.linkCount}개는 프로필에서 보실 수 있습니다.
              </p>
            </div>
          )}

          <div className={s.links} onClick={stop}>
            <Button variant="text" to={profileHref(card.sid)}>
              프로필 보기
            </Button>
            <Button
              variant="text"
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuote();
              }}
            >
              견적서 보기
            </Button>
          </div>
        </div>
      </div>

      <div className={s.right}>
        <div className={s.amt}>
          <p className={s.amtK}>견적 금액</p>
          <Money amount={card.amount} size="big" />
          <div className={s.fx}>수수료 포함 {formatWon(withFee(card.amount))}</div>
          {card.chg ? <div className={s.chg}>{card.chg}</div> : null}
        </div>

        <div className={s.acts} onClick={stop}>
          {card.mode === 'act' && (
            <>
              <Button
                variant="text"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
              >
                거절
              </Button>
              <Button variant="tint" size="sm" to={chatHref(pid, card.sid)}>
                문의하기 (채팅)
                {card.unread > 0 ? <span className={s.unread}>{card.unread}</span> : null}
              </Button>
            </>
          )}
          {card.mode === 'chosen' && (
            <>
              <Button variant="ghost" size="sm" to={chatHref(pid, card.sid)}>
                문의하기 (채팅)
              </Button>
              <Button variant="tint" size="sm" to={CONTRACT_HREF}>
                계약서 보기
              </Button>
            </>
          )}
          {card.mode === 'locked' && (
            <Button variant="ghost" size="sm" to={chatHref(pid, card.sid)}>
              문의하기 (채팅)
            </Button>
          )}
        </div>

        {card.why ? <p className={s.why}>{card.why}</p> : null}
      </div>
    </article>
  );
}

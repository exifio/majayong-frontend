/* 내 지원 현황 — 보드 Apps-Supplier · /s/applications · M3
 * 상태: 전체 / 선택됨(서명 대기) / 보류 중 / 지원 철회 확인 / 제출 완료
 * F-10. 파란 버튼은 선택됨 상태의 '서명하러 가기' 하나. */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Chip, ConfirmDialog, Money, Tabs, chipToneOf } from '@/components/ui';
import {
  CONTRACT_HREF,
  DEMO,
  QUOTE_HREF,
  appsDemoOf,
  resolveAppsMock,
  type AppCard,
} from './Apps-Supplier.data';
import s from './Apps-Supplier.module.css';

export default function AppsSupplier() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveAppsMock(params.get('mock'));
  const demo = appsDemoOf(mock);
  const [tab, setTab] = useState(demo.tabs[0]!.key);
  const [withdrawOpen, setWithdrawOpen] = useState(demo.withdrawOpen);

  useEffect(() => {
    const next = appsDemoOf(resolveAppsMock(params.get('mock')));
    setTab(next.tabs.find((t) => (next.picked ? t.key === 'pick' : next.withdrawOpen || next.mock === '보류 중' ? t.key === 'hold' : t.key === 'all'))?.key ?? 'all');
    setWithdrawOpen(next.withdrawOpen);
  }, [params]);

  return (
    <div className={s.page} data-screen="Apps-Supplier">
      <div className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
      </div>

      {demo.sent ? (
        <div className={s.sent} role="status">
          <div>
            <b>{DEMO.sentTitle}</b>
            <p>{DEMO.sentBody}</p>
          </div>
          <Button variant="text" to={QUOTE_HREF}>
            {DEMO.sentCta}
          </Button>
        </div>
      ) : null}

      {demo.picked ? (
        <section className={s.focus} aria-label="서명 대기">
          <div>
            <p className={s.kick}>{DEMO.pickKick}</p>
            <h2 className={s.focusTitle}>{DEMO.pickTitle}</h2>
            <p className={s.focusBody}>{DEMO.pickBody}</p>
            <Button variant="primary" size="lg" to={CONTRACT_HREF}>
              {DEMO.pickCta}
            </Button>
          </div>
          <div className={s.mini}>
            <div className={s.miniTitle}>예약 달력, 예약금 결제 외 2개 기능</div>
            <div className={s.mrow}>
              <span>합의 금액</span>
              <b>
                <Money amount={3_100_000} />
              </b>
            </div>
            <div className={s.mrow}>
              <span>예상 수령액</span>
              <b>
                <Money amount={2_945_000} />
              </b>
            </div>
          </div>
        </section>
      ) : null}

      <div className={s.bar}>
        <Tabs
          label="상태별 보기"
          items={demo.tabs.map((t) => ({ key: t.key, label: t.label, count: t.count }))}
          value={tab}
          onChange={setTab}
        />
        <span className={s.hint}>{DEMO.sortHint}</span>
      </div>

      <section className={s.list} aria-label="지원 목록">
        {demo.cards.map((c) => (
          <AppRow key={`${c.id}-${c.status}-${c.when}`} card={c} onWithdraw={() => setWithdrawOpen(true)} />
        ))}
        {demo.showEnded ? (
          <>
            <div className={s.grp}>
              <span>
                <b>종료된 지원</b> {demo.ended.length}건 — 거절 · 결렬된 지원은 30일 동안 여기 남습니다
              </span>
            </div>
            {demo.ended.map((c) => (
              <AppRow key={`end-${c.id}`} card={c} ended onWithdraw={() => undefined} />
            ))}
          </>
        ) : null}
      </section>

      {withdrawOpen ? (
        <ConfirmDialog
          title={DEMO.withdrawTitle}
          confirmLabel={DEMO.withdrawConfirm}
          danger
          onCancel={() => setWithdrawOpen(false)}
          onConfirm={() => {
            setWithdrawOpen(false);
            navigate('/s/applications');
          }}
        >
          <p className={s.wdLead}>{DEMO.withdrawLead}</p>
          <ul className={s.wdList}>
            {DEMO.withdrawBullets.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

function AppRow({
  card,
  ended,
  onWithdraw,
}: {
  card: AppCard;
  ended?: boolean;
  onWithdraw: () => void;
}) {
  return (
    <article
      className={`${s.card} ${card.expand ? s.cardHeld : ''} ${ended ? s.end : ''}`}
      aria-label={card.title}
    >
      <Link to={card.href} className={s.lt} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className={s.top}>
          <Chip tone={chipToneOf(card.status)}>{card.chipLabel ?? card.status}</Chip>
          <span className={s.when}>{card.when}</span>
        </div>
        <div className={s.ti}>{card.title}</div>
        <div className={s.mt}>
          {card.client}
          <span aria-hidden="true"> · </span>
          {card.applied}
        </div>
        {card.holdReason ? <p className={s.holdReason}>{card.holdReason}</p> : null}
        {card.note ? <p className={s.note}>{card.note}</p> : null}
      </Link>
      <div className={s.rt}>
        <div className={s.amtL}>{card.quoteLabel}</div>
        <div className={s.amt}>
          <Money amount={card.quote} size="row" />
        </div>
        <div className={s.amtX}>
          {card.meta} · 예상 수령 <Money amount={card.payout} />
        </div>
        <div className={s.acts}>
          {card.withdraw ? (
            <Button
              variant="warn"
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onWithdraw();
              }}
            >
              {DEMO.withdraw}
            </Button>
          ) : null}
          {card.primary ? (
            <Button variant="primary" size="sm" to={card.primary.to}>
              {card.primary.label}
            </Button>
          ) : (
            <Button variant="tint" size="sm" to={card.href}>
              견적 보기
            </Button>
          )}
        </div>
      </div>
      {card.expand ? (
        <div className={s.expand}>
          <b>{DEMO.holdExpandTitle}</b>
          <ol>
            <li>의뢰인이 다른 공급자와 임시 계약 중입니다. 서명 기한은 11월 10일입니다.</li>
            <li>두 분이 서명하고 의뢰인이 대금을 예치하면 이 지원은 자동으로 거절됩니다.</li>
            <li>서명 없이 기한이 지나거나 결렬되면, 의뢰인이 보류된 지원 중에서 다시 고를 수 있습니다.</li>
          </ol>
        </div>
      ) : null}
    </article>
  );
}

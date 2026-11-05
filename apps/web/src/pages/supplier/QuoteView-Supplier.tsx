/* 공급자 내 견적 보기 — 보드 QuoteView-Supplier · /s/applications/:pid · M3
 * 상태: 문의 중 / 이전 명세 기준 / 임시 계약 중
 * F-05 · F-10. 읽기 전용. 예산·AI·단가 없음. */
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Band, Button, Chip, Money, MaskedText } from '@/components/ui';
import { CONTACT_MASK_TOKEN } from '@majayong/types';
import {
  APPS_HREF,
  CHAT_HREF,
  CONTRACT_HREF,
  DEMO,
  DEFAULT_PID,
  FEATURES,
  PROJECT_HREF,
  QUOTE_WRITE_HREF,
  quoteViewDemoOf,
  resolveQuoteViewMock,
} from './QuoteView-Supplier.data';
import s from './QuoteView-Supplier.module.css';

export default function QuoteViewSupplier() {
  const { pid = DEFAULT_PID } = useParams();
  const [params] = useSearchParams();
  const mock = resolveQuoteViewMock(params.get('mock'));
  const demo = quoteViewDemoOf(mock);

  void pid;

  const statusChip =
    demo.status === '이전 명세 기준' || demo.held ? (
      <Chip tone="amber">{demo.statusLabel}</Chip>
    ) : (
      <Chip tone="blue">{demo.statusLabel}</Chip>
    );

  return (
    <div className={s.page} data-screen="QuoteView-Supplier">
      <p className={s.crumb}>
        <Link to={APPS_HREF}>{DEMO.crumbApps}</Link>
        {' › '}
        {DEMO.crumbProject}
      </p>

      <div className={s.head}>
        <h1 className={s.title}>{DEMO.pageTitle}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
      </div>

      {demo.stale ? (
        <div className={s.bandRow}>
          <Band tone="warn" title={DEMO.staleBandTitle}>
            {DEMO.staleBandBody}
          </Band>
          <Button variant="primary" size="sm" to={QUOTE_WRITE_HREF}>
            {DEMO.reQuote}
          </Button>
        </div>
      ) : null}

      {demo.held ? (
        <div className={s.bandRow}>
          <Band tone="warn" title={DEMO.heldBandTitle}>
            {DEMO.heldBandBody}
          </Band>
          <Button variant="primary" size="sm" to={CONTRACT_HREF}>
            {DEMO.contractCta}
          </Button>
        </div>
      ) : null}

      <p className={s.change} role="note">
        {DEMO.changeLine}
      </p>

      <div className={s.lay}>
        <div>
          <section className={s.card} aria-labelledby="h-cur">
            <h2 id="h-cur">{demo.curH}</h2>
            <div className={s.cur}>
              <div>
                <div className={s.k}>견적 총액 · 수수료 전</div>
                <div className={s.amt}>
                  <Money amount={DEMO.total} />
                </div>
                <div className={s.s}>
                  {DEMO.editWhen} · 1회차 <Money amount={DEMO.prevTotal} />
                  에서 바뀜
                </div>
              </div>
              {statusChip}
            </div>
            <div className={s.kv}>
              <div>
                <div className={s.k}>작업 기간</div>
                <div className={s.v}>{DEMO.days}일</div>
              </div>
              <div>
                <div className={s.k}>할 수 있는 항목</div>
                <div className={s.v}>{DEMO.canCount}</div>
              </div>
              <div>
                <div className={s.k}>예상 수령액 · 수수료 5% 뺀 금액</div>
                <div className={s.v}>
                  <Money amount={DEMO.net} />
                </div>
              </div>
            </div>
            <p className={s.why}>
              <span>수정 사유</span>
              {DEMO.editWhy}
            </p>
          </section>

          <section className={s.card} aria-labelledby="h-it">
            <h2 id="h-it">항목별 가능 여부</h2>
            {FEATURES.map((f) => (
              <div key={f.name} className={s.it}>
                <div>
                  <div className={s.nm}>{f.name}</div>
                  <div className={s.ds}>{f.desc}</div>
                </div>
                <Chip tone={f.ok ? 'teal' : 'outline'}>{f.ok ? '가능' : '불가'}</Chip>
              </div>
            ))}
          </section>

          <section className={s.card} aria-labelledby="h-msg">
            <h2 id="h-msg">지원 메시지</h2>
            <p className={s.msg}>
              <MaskedText
                text={`소규모 식당 예약 사이트를 12곳 만들었습니다. 회차제 코스 레스토랑 예약 달력과 PG 예약금 결제를 함께 붙인 경험이 있어, 환불 규정처럼 정해야 할 부분을 먼저 여쭤보며 진행하겠습니다. 궁금하신 점은 ${CONTACT_MASK_TOKEN} 대신 채팅으로 편하게 물어봐 주세요.`}
              />
            </p>
            <p className={s.msgNote}>{DEMO.messageNote}</p>
          </section>

          <section className={s.card} aria-labelledby="h-hist">
            <h2 id="h-hist">회차 이력</h2>
            <ol className={s.hist}>
              {demo.history.map((h) => (
                <li key={h.when} className={h.old ? s.histOld : undefined}>
                  <div className={s.histWhen}>{h.when}</div>
                  <div className={s.histTitle}>
                    {h.title}
                    <Chip tone={h.tone}>{h.chip}</Chip>
                  </div>
                  <div className={s.histNote}>{h.note}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className={s.rail}>
          <section className={s.card} aria-labelledby="h-act">
            <h3 id="h-act">견적 고치기</h3>
            <p className={s.note}>{DEMO.noteEdit}</p>
            <div className={s.stack}>
              {demo.ask ? (
                <>
                  <Button variant="tint" to={CHAT_HREF}>
                    {DEMO.chatCta}
                  </Button>
                  {demo.chatStarted ? null : (
                    <Button variant="tint" disabled disabledReason={DEMO.chatEditOff}>
                      {DEMO.chatEdit}
                    </Button>
                  )}
                  <Button variant="ghost" to={PROJECT_HREF}>
                    {DEMO.projectView}
                  </Button>
                </>
              ) : null}
              {demo.stale ? (
                <>
                  <Button variant="ghost" to={PROJECT_HREF}>
                    바뀐 명세 보기
                  </Button>
                  <p className={s.off}>{DEMO.staleOff}</p>
                </>
              ) : null}
              {demo.held ? (
                <>
                  <Button variant="tint" disabled disabledReason={DEMO.heldEditOff}>
                    {DEMO.chatEdit}
                  </Button>
                  <p className={s.off}>{DEMO.heldEditOff}</p>
                </>
              ) : null}
            </div>
          </section>

          <section className={s.card} aria-labelledby="h-pj">
            <h3 id="h-pj">프로젝트</h3>
            <div className={s.r2}>
              <span>모집 마감</span>
              <b>{DEMO.deadline}</b>
            </div>
            <div className={s.r2}>
              <span>지원</span>
              <b>{DEMO.appliedAt}</b>
            </div>
            {!demo.held ? (
              <div style={{ marginTop: 12 }}>
                <Button variant="warn" size="sm" type="button">
                  {DEMO.withdraw}
                </Button>
              </div>
            ) : (
              <p className={s.off}>{DEMO.withdrawOff}</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

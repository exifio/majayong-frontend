/* 프로젝트 상세(상세 공개) — 보드 Project-Supplier · /s/projects/:pid · M3
 * 상태: 지원 전 / 지원함 / 재견적 요청 / 모집 마감
 * AI 금액 · 추천 없음. 7.1 · F-05 · ㉜. */
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Attr,
  Band,
  Button,
  Chip,
  Money,
  Note,
  StatusChip,
} from '@/components/ui';
import { formatWon } from '@/lib/format';
import {
  CHAT_HREF,
  CLIENT_HREF,
  DEMO,
  FIND_HREF,
  MY_QUOTE_HREF,
  QUOTE_HREF,
  REQUOTE_HREF,
  projectDemoOf,
  resolveProjectMock,
  type WireKind,
} from './Project-Supplier.data';
import { useSession } from '@/app/session';
import { LiveProjectDetail } from '@/components/project/LiveProjectDetail';
import s from './Project-Supplier.module.css';
import { AuthRequired } from '@/components/system/AuthRequired';
import { DEMO_DATA_ENABLED } from '@/lib/feature-flags';

export default function ProjectSupplier() {
  const { apiAccessToken } = useSession();
  const { pid } = useParams();
  const [params] = useSearchParams();
  const mock = resolveProjectMock(params.get('mock'));
  const demo = projectDemoOf(mock);
  const [bookmarked, setBookmarked] = useState(demo.bookmarkDefault);

  useEffect(() => {
    setBookmarked(projectDemoOf(resolveProjectMock(params.get('mock'))).bookmarkDefault);
  }, [params]);

  if (apiAccessToken.trim()) return <LiveProjectDetail pid={pid} styles={s} />;

  if (!DEMO_DATA_ENABLED) return <AuthRequired />;

  const nFn = demo.features.length;

  return (
    <div className={s.page} data-screen="Project-Supplier">
      <p className={s.crumb}>
        <Link to={FIND_HREF}>프로젝트 찾기</Link>
        {' › '}
        명세 상세
      </p>

      <div className={s.viewband}>
        <Band tone="viewlog">
          열람 기록이 남습니다 · 비밀유지 의무
        </Band>
      </div>

      <div className={s.head}>
        <div>
          <div className={s.chips}>
            <Chip tone="neutral">{DEMO.industry}</Chip>
            {demo.closed ? (
              <StatusChip status="모집 마감" />
            ) : (
              <StatusChip status="모집 중" />
            )}
            <span className={demo.deadlineSoon ? s.soon : undefined}>{demo.deadlineLabel}</span>
          </div>
          <h1 className={s.title}>{DEMO.title}</h1>
          <p className={s.sub}>
            명세 항목 {nFn}개 · {DEMO.registered}
            {demo.subMore}
          </p>
        </div>
        <button
          type="button"
          className={`${s.bm} ${bookmarked ? s.bmOn : ''}`}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? '북마크함' : '북마크'}
          onClick={() => setBookmarked((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3.5h12v17l-6-4-6 4z" />
          </svg>
          {bookmarked ? '북마크함' : '북마크'}
        </button>
      </div>

      <div className={s.lay}>
        <div>
          {demo.re ? (
            <div className={s.reNote}>
              <Note title={DEMO.reNoteTitle}>{DEMO.reNoteBody}</Note>
            </div>
          ) : null}

          {demo.closed ? (
            <div className={s.closedBand} role="status">
              <b>{DEMO.closedBandTitle}</b>
              <p>{DEMO.closedBandBody}</p>
            </div>
          ) : null}

          <div className={s.secH}>
            <h2>기능 {nFn}개</h2>
            <p>{DEMO.fnsLead}</p>
          </div>

          {demo.features.map((f) => (
            <section key={`${f.no}-${f.name}`} className={s.fc} aria-label={f.name}>
              <div className={s.nmrow}>
                <span className={s.no}>{f.no}</span>
                <span className={s.nm}>{f.name}</span>
                {f.change ? <Chip tone="amber">{f.change}</Chip> : null}
              </div>
              <p className={s.ds}>{f.desc}</p>
              <div className={s.dec}>
                <p className={s.decK}>공급자와 정할 것</p>
                <div className={s.tg}>
                  {f.conditions.map((c) => (
                    <span key={c} className={f.change === '새 항목' ? s.tgNew : undefined}>
                      {c}
                    </span>
                  ))}
                </div>
                {f.memo ? (
                  <div className={s.memo}>
                    <Attr label="의뢰인 메모">{f.memo}</Attr>
                  </div>
                ) : null}
              </div>
            </section>
          ))}

          <section className={s.fc} aria-label="지급 구간과 비율">
            <div className={s.nmrow}>
              <span className={s.no} aria-hidden="true" />
              <span className={s.nmPay}>{DEMO.payTitle}</span>
            </div>
            <p className={`${s.ds} ${s.dsPay}`}>{DEMO.payGuide}</p>
          </section>

          <div className={s.secH} style={{ marginTop: 22 }}>
            <h2>화면 초안</h2>
            <p>{DEMO.thumbsLead}</p>
          </div>
          <div className={s.wfs}>
            {DEMO.thumbs.map((t) => (
              <div key={t.name} className={s.wf}>
                <Wireframe kind={t.kind} />
                <p className={s.cap}>
                  <b>{t.name}</b> · {t.cap}
                </p>
              </div>
            ))}
          </div>
          <p className={s.thumbsFoot}>{DEMO.thumbsFoot}</p>
        </div>

        <aside className={s.rail}>
          <section className={s.card} aria-labelledby="b-h">
            <p className={s.budK} id="b-h">희망 예산</p>
            <Money amount={DEMO.hopeBudget} size="big" />
            <p className={s.budHint}>{DEMO.hopeHint}</p>
            <div className={s.meta}>
              <div className={s.metaRow}>
                <span>모집 마감</span>
                <b>{DEMO.deadlineMeta}</b>
              </div>
              <div className={s.metaRow}>
                <span>명세 항목</span>
                <b>{nFn}개</b>
              </div>
            </div>

            {demo.before ? (
              <>
                <div className={s.ctaGap}>
                  <Button variant="primary" full to={QUOTE_HREF}>{DEMO.quoteCta}</Button>
                </div>
                <p className={s.hint}>{DEMO.quoteHint}</p>
                <p className={s.askq}>
                  <b>{DEMO.askBefore}</b>
                  <br />
                  {DEMO.askBeforeDetail}
                </p>
              </>
            ) : null}

            {demo.applied ? (
              <>
                <div className={s.myq}>
                  <div className={s.myqRow}>
                    <span className={s.myqK}>{DEMO.myQuoteLabel}</span>
                    <StatusChip status="문의 중" />
                  </div>
                  <div className={s.myqAmt}>{formatWon(DEMO.myQuoteAmt)}</div>
                  <p className={s.myqM}>{DEMO.myQuoteMeta}</p>
                </div>
                <div className={s.ctaGap}>
                  {demo.chatOpen ? (
                    <Button variant="tint" full to={CHAT_HREF}>
                      {DEMO.chatCta}
                      <span className={s.unread}>1</span>
                    </Button>
                  ) : null}
                  <Button variant="ghost" full to={MY_QUOTE_HREF}>{DEMO.myQuoteCta}</Button>
                </div>
                <p className={s.hint}>{DEMO.appliedHint}</p>
              </>
            ) : null}

            {demo.re ? (
              <>
                <div className={s.myq}>
                  <div className={s.myqRow}>
                    <span className={s.myqK}>{DEMO.myQuoteLabel}</span>
                    <StatusChip status="이전 명세 기준" />
                  </div>
                  <div className={`${s.myqAmt} ${s.myqOld}`}>{formatWon(DEMO.myQuoteAmt)}</div>
                  <p className={s.myqM}>{DEMO.myQuoteMeta}</p>
                </div>
                <div className={s.ctaGap}>
                  <Button variant="primary" full to={REQUOTE_HREF}>{DEMO.requoteCta}</Button>
                </div>
                <p className={s.hint}>{DEMO.requoteHint}</p>
              </>
            ) : null}

            {demo.closed ? (
              <div className={s.ctaGap}>
                <Button variant="primary" full disabled disabledReason={DEMO.closedReason}>
                  {DEMO.closedCta}
                </Button>
              </div>
            ) : null}
          </section>

          <section className={s.card} aria-labelledby="c-h">
            <div className={s.clHead}>
              <h3 id="c-h">의뢰인</h3>
              <Link to={CLIENT_HREF}>프로필 보기</Link>
            </div>
            <div className={s.who}>
              <span className={s.av} aria-hidden="true">{DEMO.client.initial}</span>
              <div>
                <b>{DEMO.client.name}</b>
                <span>{DEMO.client.business}</span>
              </div>
            </div>
            <dl className={s.dl}>
              <div>
                <dt>업종</dt>
                <dd>{DEMO.client.industry}</dd>
              </div>
              <div>
                <dt>가게 주소</dt>
                <dd>{DEMO.client.address}</dd>
              </div>
              <div>
                <dt>웹사이트</dt>
                <dd>
                  <a className="ft" href={DEMO.client.websiteHref} target="_blank" rel="noreferrer">
                    {DEMO.client.website}
                  </a>
                </dd>
              </div>
              <div>
                <dt>자기소개</dt>
                <dd>{DEMO.client.intro}</dd>
              </div>
            </dl>
            <p className={s.nocontact}>{DEMO.noContact}</p>
          </section>

          <section className={s.card} aria-labelledby="n-h">
            <h3 id="n-h" style={{ marginBottom: 8 }}>{DEMO.afterTitle}</h3>
            <ul className={s.after}>
              <li>공급자가 먼저 채팅을 걸 수는 없습니다. 견적을 내면 의뢰인이 <b>문의</b>해 옵니다.</li>
              <li>의뢰인이 고르면 <b>7일 안에 서명</b>해야 계약이 됩니다.</li>
              <li>계약 범위는 서명할 때 고정되고, 그 뒤에 늘어나지 않습니다.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Wireframe({ kind }: { kind: WireKind }) {
  if (kind === 'calendar') {
    return (
      <div className={s.scr} aria-hidden="true">
        <i className={`${s.bar} ${s.barH}`} />
        <div className={s.gr}>
          {Array.from({ length: 21 }, (_, i) => (
            <i key={i} className={[2, 5, 10, 15].includes(i) ? s.grOn : undefined} />
          ))}
        </div>
        <i className={s.bar} style={{ width: '70%' }} />
      </div>
    );
  }
  if (kind === 'pay') {
    return (
      <div className={s.scr} aria-hidden="true">
        <i className={`${s.bar} ${s.barH}`} />
        <i className={s.bar} style={{ width: '80%' }} />
        <i className={s.bar} style={{ width: '60%' }} />
        <div className={s.bx} />
        <div className={s.bt} />
      </div>
    );
  }
  return (
    <div className={s.scr} aria-hidden="true">
      <i className={`${s.bar} ${s.barH}`} />
      <i className={s.bar} />
      <i className={s.bar} style={{ width: '85%' }} />
      <i className={s.bar} />
      <i className={s.bar} style={{ width: '75%' }} />
      <i className={s.bar} />
      <i className={s.bar} style={{ width: '65%' }} />
    </div>
  );
}

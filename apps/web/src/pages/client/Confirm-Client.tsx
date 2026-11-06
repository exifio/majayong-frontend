/* 명세 확정 — 보드 Confirm-Client · /c/drafts/:did/confirm · M2
 * routes states: 없음. 날짜 오류 · 동의는 화면 상태로 처리한다.
 * AI 금액 없음. 확정 CTA → 명세 보기(모집 시작됨). */
import { useEffect, useId, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingState, Attr, Button, ConfirmCheck } from '@/components/ui';
import { PageHeader } from '@/components/layout/Chrome';
import { formatWon } from '@/lib/format';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import {
  PROJECT_DISCLOSURE_CONSENT_VERSION,
  endOfDay,
  formatDateInput,
  parseDateInput,
  toDraftScreen,
  type DraftScreen,
} from '@/lib/draft-adapter';
import type { DraftDto } from '@majayong/types/api';
import {
  CONSENT_LABEL,
  CONSENT_VERSION,
  DEMO,
  DRAFT_HREF,
  SPEC_STARTED_HREF,
  isStartBeforeEnd,
} from './Confirm-Client.data';
import s from './Confirm-Client.module.css';

const PUBLISH_ERROR_MESSAGES: Partial<Record<string, string>> = {
  INVALID_REQUEST: '요청 정보가 올바르지 않습니다. 화면을 새로고침한 뒤 다시 시도해 주세요.',
  ROLE_MISMATCH: '의뢰인 계정으로 로그인한 뒤 다시 시도해 주세요.',
  DRAFT_NOT_FOUND: '초안을 찾을 수 없습니다. 초안 목록에서 다시 열어 주세요.',
  DRAFT_ALREADY_CONFIRMED: '이미 확정된 명세입니다. 내 프로젝트에서 확인해 주세요.',
  DRAFT_NOT_IN_PROGRESS: '이 초안은 더 이상 확정할 수 없습니다. 초안 목록을 새로고침해 주세요.',
  DRAFT_FEATURES_PENDING: '아직 반영하지 못한 기능이 있습니다. 초안으로 돌아가 다시 시도해 주세요.',
  INVALID_RECRUITMENT_PERIOD: '모집 시작일과 마감일을 확인해 주세요. 마감일은 시작일 이후이고 오늘 이후여야 합니다.',
  DISCLOSURE_CONSENT_REQUIRED: '공개 범위 동의가 필요합니다. 동의 항목을 확인해 주세요.',
  DISCLOSURE_CONSENT_VERSION_MISMATCH: '공개 범위 동의가 갱신되었습니다. 화면을 새로고침한 뒤 다시 동의해 주세요.',
  DISCLOSURE_CONSENT_UNAVAILABLE: '공개 범위 동의를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  INVALID_DISCLOSURE_SCOPE: '공개 범위를 다시 선택한 뒤 시도해 주세요.',
  NO_SELECTED_BLOCKS: '확정할 명세 항목이 없습니다. 초안으로 돌아가 기능을 추가해 주세요.',
};

export default function ConfirmClient() {
  const { apiAccessToken } = useSession();
  const live = Boolean(apiAccessToken.trim()) || !import.meta.env.DEV;
  return live ? <LiveConfirm /> : <DemoConfirm />;
}

function LiveConfirm() {
  const { apiAccessToken } = useSession();
  const { did = '' } = useParams();
  const draftHref = `/c/drafts/${encodeURIComponent(did)}`;
  const navigate = useNavigate();
  const [draft, setDraft] = useState<DraftDto | null>(null);
  const [screen, setScreen] = useState<DraftScreen | null>(null);
  const [start, setStart] = useState(formatDateInput(new Date()));
  const [end, setEnd] = useState(() => {
    const next = new Date();
    next.setDate(next.getDate() + 14);
    return formatDateInput(next);
  });
  const [scope, setScope] = useState<'FULL' | 'DETAIL'>('FULL');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startId = useId();
  const endId = useId();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    apiRequest('getDraft', `/drafts/${encodeURIComponent(did)}`, { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        setDraft(response.data);
        setScreen(toDraftScreen(response.data));
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setLoadError(caught instanceof ApiRequestError ? caught.message : '초안을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [did, apiAccessToken]);

  if (loading) {
    return (
      <div className={s.page} data-screen="Confirm-Client">
        <PageHeader title={DEMO.pageTitle} description={DEMO.pageLead} />
        <LoadingState label="명세를 불러오는 중입니다." />
      </div>
    );
  }

  if (loadError || !draft || !screen) {
    return (
      <div className={s.page} data-screen="Confirm-Client">
        <PageHeader title="명세를 불러오지 못했습니다" description="잠시 후 다시 시도해 주세요." />
        <p role="alert" style={{ padding: 24 }}>{loadError ?? '초안 정보가 없습니다.'}</p>
        <Button variant="tint" to={draftHref}>초안으로 돌아가기</Button>
      </div>
    );
  }

  if (draft.status !== 'IN_PROGRESS') {
    return (
      <div className={s.page} data-screen="Confirm-Client">
        <PageHeader
          title={draft.status === 'CONFIRMED' ? '이미 게시된 초안입니다' : '보관된 초안입니다'}
          description={draft.status === 'CONFIRMED' ? '내 프로젝트에서 게시된 프로젝트를 확인할 수 있습니다.' : '초안 목록에서 다시 열어 주세요.'}
        />
        <Button variant="primary" to={draft.status === 'CONFIRMED' ? '/c/projects' : draftHref}>
          {draft.status === 'CONFIRMED' ? '내 프로젝트로' : '초안으로 돌아가기'}
        </Button>
      </div>
    );
  }

  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);
  const dateOk = startDate !== null && endDate !== null && startDate.getTime() < endDate.getTime();
  const canSubmit = dateOk && agreed && !submitting && screen.pendingCount === 0 && screen.included.length > 0;
  const disabledReason = !dateOk
    ? DEMO.needDate
    : !agreed
      ? DEMO.needConsent
      : screen.pendingCount > 0
        ? `초안의 반영 대기 기능 ${screen.pendingCount}건을 먼저 처리해 주세요.`
      : screen.included.length === 0
        ? '명세 항목이 없습니다. 초안에 기능을 추가해 주세요.'
        : undefined;

  async function publish() {
    if (!canSubmit || !startDate || !endDate) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await apiRequest('publishDraft', `/drafts/${encodeURIComponent(did)}/publish`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: {
          recruitStartAt: startDate.toISOString(),
          deadline: endOfDay(endDate).toISOString(),
          disclosureConsentVersion: PROJECT_DISCLOSURE_CONSENT_VERSION,
          disclosureScope: scope,
          disclosureConsent: true,
        },
      });
      navigate(`/c/projects/${encodeURIComponent(response.data.projectId)}`);
    } catch (caught) {
      setSubmitError(caught instanceof ApiRequestError
        ? PUBLISH_ERROR_MESSAGES[caught.code] ?? `${caught.message} (오류 코드: ${caught.code})`
        : '프로젝트를 게시하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={s.page} data-screen="Confirm-Client">
      <PageHeader title={DEMO.pageTitle} description={DEMO.pageLead} />

      <section className={s.card} aria-labelledby="s1">
        <h2 id="s1">1. 확정될 범위</h2>
        <p className={s.lead}>{DEMO.scopeLead}</p>

        <p className={s.grp}>포함 · {screen.included.length}건</p>
        {screen.included.map((item) => (
          <div key={item.id} className={s.item}>
            <div className={s.itemName}>{item.name}</div>
            <div className={s.itemDesc}>{item.description}</div>
            <div className={s.conds}>
              <Attr label="공급자와 정할 것">{item.conditions.join(' · ')}</Attr>
              {item.memo ? <Attr label="메모">{item.memo}</Attr> : null}
            </div>
          </div>
        ))}

        {screen.excluded.length > 0 && (
          <>
            <p className={s.grp}>이번 범위에서 제외 · {screen.excluded.length}건</p>
            {screen.excluded.map((item) => (
              <div key={item.id} className={`${s.item} ${s.out}`}>
                <span className={s.outName}>{item.name}</span>
                <span className={s.outWhy}>{item.reason}</span>
              </div>
            ))}
          </>
        )}
      </section>

      <section className={s.card} aria-labelledby="s2">
        <h2 id="s2">2. 등록 정보와 모집 기간</h2>
        <p className={s.lead}>제목 · 요약 · 필요 기술은 기능(블록) 이름에서 자동으로 만듭니다. 적으신 문장은 목록에 쓰지 않습니다.</p>
        <dl className={s.dl}>
          <dt>제목</dt>
          <dd>
            {screen.title}
            <span className={s.dlHint}>기능 이름 앞 2개 + 나머지 개수로 만듭니다. 업종은 칩으로 따로 보입니다</span>
          </dd>
          <dt>요약</dt>
          <dd>{screen.included.map((item) => item.name).join(' · ')}</dd>
          <dt>필요 기술</dt>
          <dd>명세 확정 후 기능 이름에서 자동으로 만듭니다.</dd>
          <dt>희망 예산</dt>
          <dd>
            {screen.hopeBudget === null ? '정하지 않음' : formatWon(screen.hopeBudget)}
            {screen.hopeBudget !== null && <span className={s.dlHint}>상세에서는 정확한 금액으로 보입니다</span>}
          </dd>
        </dl>

        <hr className={s.hr} />

        <div className={s.dates}>
          <div className={s.field}>
            <label className={s.lbl} htmlFor={startId}>모집 시작</label>
            <input
              className={`${s.input} ${dateOk ? '' : s.inputErr}`}
              id={startId}
              type="text"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-invalid={!dateOk}
              aria-describedby={dateOk ? `${startId}-hint` : `${startId}-err`}
            />
          </div>
          <div className={s.field}>
            <label className={s.lbl} htmlFor={endId}>모집 마감</label>
            <input
              className={s.input}
              id={endId}
              type="text"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
        {dateOk ? (
          <p id={`${startId}-hint`} className={s.hint}>{DEMO.dateHint}</p>
        ) : (
          <p id={`${startId}-err`} className={s.err} role="alert">{DEMO.dateError}</p>
        )}
      </section>

      <section className={s.card} aria-labelledby="s3">
        <h2 id="s3">3. 공개 범위 동의</h2>
        <p className={s.lead}>{DEMO.pubLead}</p>

        <div className={s.pub} aria-label="공개 범위">
          {DEMO.pubCards.map((card) => (
            <div key={card.title} className={s.pubCard}>
              <p className={s.pubTitle}>
                {card.title}
                <span className={s.pubWho}>{card.who}</span>
              </p>
              <p className={s.pubBody}>{card.body}</p>
            </div>
          ))}
        </div>

        <div className={s.field} style={{ marginTop: 12 }}>
          <label className={s.lbl} htmlFor="disclosure-scope">공개 범위 선택</label>
          <select
            id="disclosure-scope"
            className={s.input}
            value={scope}
            onChange={(e) => setScope(e.target.value === 'DETAIL' ? 'DETAIL' : 'FULL')}
          >
            <option value="FULL">전체 공개</option>
            <option value="DETAIL">상세 공개</option>
          </select>
        </div>

        <p className={s.hide}>
          <b>공개하지 않는 것</b> — {DEMO.hideNote}
        </p>

        <div className={s.consent}>
          <ConfirmCheck checked={agreed} onChange={setAgreed}>
            <span className={s.consentLabel}>{CONSENT_LABEL}</span>
          </ConfirmCheck>
          <p className={s.ver}>동의 버전 {PROJECT_DISCLOSURE_CONSENT_VERSION} · 동의한 시각과 함께 보관됩니다</p>
        </div>
      </section>

      {screen.pendingCount > 0 && (
        <p className={s.err} role="alert">
          아직 반영하지 못한 기능 {screen.pendingCount}건이 있습니다. 초안으로 돌아가 다시 시도한 뒤 확정해 주세요.
        </p>
      )}
      {submitError && <p className={s.err} role="alert">{submitError}</p>}

      <div className={s.foot}>
        <Button variant="ghost" to={draftHref}>초안으로 돌아가기</Button>
        {canSubmit ? (
          <Button variant="primary" size="lg" onClick={() => void publish()}>확정하고 공급자 모집 시작</Button>
        ) : (
          <Button variant="primary" size="lg" disabled disabledReason={submitting ? '게시 중입니다.' : disabledReason}>
            {submitting ? '게시 중…' : '확정하고 공급자 모집 시작'}
          </Button>
        )}
      </div>
      {!dateOk && <p className={s.after}>{DEMO.needDate}</p>}
      <p className={s.after}>{DEMO.afterNote}</p>
    </div>
  );
}

function DemoConfirm() {
  const [start, setStart] = useState(DEMO.defaultStart);
  const [end, setEnd] = useState(DEMO.defaultEnd);
  const [agreed, setAgreed] = useState(false);
  const startId = useId();
  const endId = useId();

  const dateOk = isStartBeforeEnd(start, end);
  const canSubmit = dateOk && agreed;
  const disabledReason = !dateOk ? DEMO.needDate : !agreed ? DEMO.needConsent : undefined;

  return (
    <div className={s.page} data-screen="Confirm-Client">
      <PageHeader title={DEMO.pageTitle} description={DEMO.pageLead} />

      <section className={s.card} aria-labelledby="s1">
        <h2 id="s1">1. 확정될 범위</h2>
        <p className={s.lead}>{DEMO.scopeLead}</p>

        <p className={s.grp}>포함 · {DEMO.included.length}건</p>
        {DEMO.included.map((item) => (
          <div key={item.id} className={s.item}>
            <div className={s.itemName}>{item.name}</div>
            <div className={s.itemDesc}>{item.description}</div>
            <div className={s.conds}>
              <Attr label="공급자와 정할 것">{item.conditions.join(' · ')}</Attr>
              {item.memo ? <Attr label="메모">{item.memo}</Attr> : null}
            </div>
          </div>
        ))}

        <p className={s.grp}>이번 범위에서 제외 · {DEMO.excluded.length}건</p>
        {DEMO.excluded.map((item) => (
          <div key={item.id} className={`${s.item} ${s.out}`}>
            <span className={s.outName}>{item.name}</span>
            <span className={s.outWhy}>{item.reason}</span>
          </div>
        ))}
      </section>

      <section className={s.card} aria-labelledby="s2">
        <h2 id="s2">2. 등록 정보와 모집 기간</h2>
        <p className={s.lead}>제목 · 요약 · 필요 기술은 기능(블록) 이름에서 자동으로 만듭니다. 적으신 문장은 목록에 쓰지 않습니다.</p>
        <dl className={s.dl}>
          <dt>제목</dt>
          <dd>
            {DEMO.title}
            <span className={s.dlHint}>{DEMO.titleHint}</span>
          </dd>
          <dt>요약</dt>
          <dd>{DEMO.summary}</dd>
          <dt>필요 기술</dt>
          <dd>{DEMO.skills}</dd>
          <dt>희망 예산</dt>
          <dd>
            {formatWon(DEMO.hopeBudget)}
            <span className={s.dlHint}>{DEMO.hopeBudgetHint}</span>
          </dd>
        </dl>

        <hr className={s.hr} />

        <div className={s.dates}>
          <div className={s.field}>
            <label className={s.lbl} htmlFor={startId}>모집 시작</label>
            <input
              className={`${s.input} ${dateOk ? '' : s.inputErr}`}
              id={startId}
              type="text"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-invalid={!dateOk}
              aria-describedby={dateOk ? `${startId}-hint` : `${startId}-err`}
            />
          </div>
          <div className={s.field}>
            <label className={s.lbl} htmlFor={endId}>모집 마감</label>
            <input
              className={s.input}
              id={endId}
              type="text"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
        {dateOk ? (
          <p id={`${startId}-hint`} className={s.hint}>{DEMO.dateHint}</p>
        ) : (
          <p id={`${startId}-err`} className={s.err} role="alert">{DEMO.dateError}</p>
        )}
      </section>

      <section className={s.card} aria-labelledby="s3">
        <h2 id="s3">3. 공개 범위 동의</h2>
        <p className={s.lead}>{DEMO.pubLead}</p>

        <div className={s.pub} aria-label="공개 범위">
          {DEMO.pubCards.map((card) => (
            <div key={card.title} className={s.pubCard}>
              <p className={s.pubTitle}>
                {card.title}
                <span className={s.pubWho}>{card.who}</span>
              </p>
              <p className={s.pubBody}>{card.body}</p>
            </div>
          ))}
        </div>

        <p className={s.hide}>
          <b>공개하지 않는 것</b> — {DEMO.hideNote}
        </p>

        <div className={s.consent}>
          <ConfirmCheck checked={agreed} onChange={setAgreed}>
            <span className={s.consentLabel}>{CONSENT_LABEL}</span>
          </ConfirmCheck>
          <p className={s.ver}>{CONSENT_VERSION}</p>
        </div>
      </section>

      <div className={s.foot}>
        <Button variant="ghost" to={DRAFT_HREF}>초안으로 돌아가기</Button>
        {canSubmit ? (
          <Button variant="primary" size="lg" to={SPEC_STARTED_HREF}>확정하고 공급자 모집 시작</Button>
        ) : (
          <Button variant="primary" size="lg" disabled disabledReason={disabledReason}>
            확정하고 공급자 모집 시작
          </Button>
        )}
      </div>
      {!dateOk && <p className={s.after}>{DEMO.needDate}</p>}
      <p className={s.after}>{DEMO.afterNote}</p>
    </div>
  );
}

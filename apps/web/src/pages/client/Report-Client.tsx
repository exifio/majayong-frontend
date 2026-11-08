/* 단가 분석 리포트 — 보드 Report-Client · /c/drafts/:did?modal=report · M2
 * 상태: 예산 안 / 예산 초과 / 만드는 중 포함 (?mock 시연, 개발 환경에서만)
 * 실제: GET /drafts/:draftId/price-report + GET /drafts/:draftId(희망 예산) · 반영 POST /drafts/:draftId/apply-estimate
 * 모달 틀(배경막 · 제목 · ×)은 App이 그린다. 본문만 채운다. */
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button, EmptyState, LoadingState, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatWon } from '@/lib/format';
import type { DraftDto, PriceReportDto } from '@majayong/types/api';
import {
  APPLY_WARN,
  BASIS,
  CONFIRMED_BODY,
  CONFIRMED_TITLE,
  HOPE_BUDGET,
  HOW,
  MAKING,
  REPORT_ERROR_MESSAGES,
  basisRows,
  quoteOf,
  reportDemoOf,
  reportFromDto,
  resolveReportMock,
  sharePct,
  type ReportFn,
} from './Report-Client.data';
import s from './Report-Client.module.css';

/** App ModalLayer와 같이 modal · sid · next만 지운다. mock은 남긴다. */
const CLOSE_PARAMS = ['modal', 'sid', 'next'];

/** 리포트에서 희망 예산을 바꾼 뒤 초안 2분할이 다시 읽도록 history state로 알린다. */
export type DraftRefreshState = { draftRefreshedAt: number };

function useCloseModal() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const loc = useLocation();
  return useCallback((state?: DraftRefreshState) => {
    const next = new URLSearchParams(params);
    CLOSE_PARAMS.forEach((key) => next.delete(key));
    const q = next.toString();
    navigate(`${loc.pathname}${q ? `?${q}` : ''}`, { replace: true, state });
  }, [params, navigate, loc.pathname]);
}

export default function ReportClient() {
  const [params] = useSearchParams();
  const { apiAccessToken } = useSession();
  // 실제 경로에는 시연 데이터를 보이지 않는다. ?mock은 개발 환경에서만 시연으로 연다.
  const demoMode = import.meta.env.DEV && (!apiAccessToken.trim() || params.get('mock') !== null);
  return demoMode ? <DemoReport /> : <LiveReport />;
}

function DemoReport() {
  const [params] = useSearchParams();
  const close = useCloseModal();
  const demo = reportDemoOf(resolveReportMock(params.get('mock')));
  const quote = quoteOf(demo.included);
  return (
    <ReportBody
      included={demo.included}
      excluded={demo.excluded ? [demo.excluded] : []}
      suggested={[]}
      making={demo.making ? [MAKING.name] : []}
      pendingCount={demo.making ? 1 : 0}
      totals={quote}
      hopeBudget={HOPE_BUDGET}
      onClose={() => close()}
      onApply={() => close()}
    />
  );
}

type LiveState =
  | { kind: 'loading' }
  | { kind: 'confirmed' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; report: PriceReportDto; draft: DraftDto | null };

function LiveReport() {
  const { did = '' } = useParams();
  const { apiAccessToken } = useSession();
  const close = useCloseModal();
  const [state, setState] = useState<LiveState>({ kind: 'loading' });
  const [retry, setRetry] = useState(0);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const path = `/drafts/${encodeURIComponent(did)}`;
    setState({ kind: 'loading' });
    Promise.all([
      apiRequest('getDraftPriceReport', `${path}/price-report`, { accessToken: apiAccessToken, signal: controller.signal }),
      // 희망 예산 · 분석일 · 만드는 중 이름은 초안에서만 알 수 있다. 실패해도 리포트는 보여 준다.
      apiRequest('getDraft', path, { accessToken: apiAccessToken, signal: controller.signal })
        .then((response) => response.data)
        .catch((caught: unknown) => {
          if (caught instanceof Error && caught.name === 'AbortError') throw caught;
          return null;
        }),
    ]).then(([report, draft]) => {
      setState({ kind: 'ready', report: report.data, draft });
    }).catch((caught: unknown) => {
      if (caught instanceof Error && caught.name === 'AbortError') return;
      if (caught instanceof ApiRequestError && caught.status === 409) {
        setState({ kind: 'confirmed' });
        return;
      }
      setState({
        kind: 'error',
        message: caught instanceof ApiRequestError
          ? REPORT_ERROR_MESSAGES[caught.code] ?? '단가 분석 리포트를 불러오지 못했습니다.'
          : '단가 분석 리포트를 불러오지 못했습니다.',
      });
    });
    return () => controller.abort();
  }, [did, apiAccessToken, retry]);

  if (state.kind === 'loading') {
    return (
      <div className={s.page} data-screen="Report-Client">
        <LoadingState label="단가 분석 리포트를 불러오는 중입니다." />
      </div>
    );
  }

  if (state.kind === 'confirmed') {
    return (
      <div className={s.page} data-screen="Report-Client">
        <EmptyState
          title={CONFIRMED_TITLE}
          action={(
            <div className={s.acts}>
              <Button variant="ghost" onClick={() => close()}>닫기</Button>
              <Button variant="tint" to="/c/projects">내 프로젝트로</Button>
            </div>
          )}
        >
          {CONFIRMED_BODY}
        </EmptyState>
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className={s.page} data-screen="Report-Client">
        <p role="alert" className={s.lead}>{state.message}</p>
        <div className={s.acts}>
          <Button variant="ghost" onClick={() => close()}>닫기</Button>
          <Button variant="tint" onClick={() => setRetry((count) => count + 1)}>다시 시도</Button>
        </div>
      </div>
    );
  }

  const { report, draft } = state;
  const model = reportFromDto(report, draft);
  const hopeBudget = draft ? draft.hopeBudget : undefined;
  const applyDisabledReason = draft && draft.status !== 'IN_PROGRESS'
    ? '진행 중인 초안에서만 희망 예산을 바꿀 수 있습니다.'
    : model.totals.total <= 0
      ? '합계에 들어간 기능이 없어 반영할 금액이 없습니다.'
      : hopeBudget === model.totals.total
        ? '희망 예산이 이미 예상 총액과 같습니다.'
        : undefined;

  async function apply() {
    if (applying) return;
    setApplying(true);
    setApplyError(null);
    try {
      await apiRequest('applyDraftEstimate', `/drafts/${encodeURIComponent(did)}/apply-estimate`, {
        method: 'POST',
        accessToken: apiAccessToken,
      });
      close({ draftRefreshedAt: Date.now() });
    } catch (caught) {
      setApplyError(caught instanceof ApiRequestError
        ? REPORT_ERROR_MESSAGES[caught.code] ?? '희망 예산을 바꾸지 못했습니다. 다시 시도해 주세요.'
        : '희망 예산을 바꾸지 못했습니다. 다시 시도해 주세요.');
      setApplying(false);
    }
  }

  return (
    <ReportBody
      included={model.included}
      excluded={model.excluded}
      suggested={model.suggested}
      making={model.making}
      pendingCount={model.pendingCount}
      totals={model.totals}
      hopeBudget={hopeBudget}
      applying={applying}
      applyError={applyError}
      applyDisabledReason={applyDisabledReason}
      onClose={() => close()}
      onApply={() => void apply()}
    />
  );
}

function ReportBody({
  included,
  excluded,
  suggested,
  making,
  pendingCount,
  totals,
  hopeBudget,
  applying = false,
  applyError = null,
  applyDisabledReason,
  onClose,
  onApply,
}: {
  included: ReportFn[];
  excluded: ReportFn[];
  suggested: ReportFn[];
  /** 만드는 중 기능 이름(알 수 있을 때만) */
  making: string[];
  pendingCount: number;
  totals: { count: number; sub: number; fee: number; total: number };
  /** null: 정하지 않음 · undefined: 불러오지 못함 */
  hopeBudget: number | null | undefined;
  applying?: boolean;
  applyError?: string | null;
  applyDisabledReason?: string;
  onClose: () => void;
  onApply: () => void;
}) {
  const over = typeof hopeBudget === 'number' && totals.total > hopeBudget;
  const gap = typeof hopeBudget === 'number' ? Math.abs(hopeBudget - totals.total) : 0;
  const unnamedMaking = Math.max(0, pendingCount - making.length);

  return (
    <div className={s.page} data-screen="Report-Client">
      <div className={s.intro}>
        <span className={s.aiTag}>
          <Sparkles size={13} strokeWidth={2} aria-hidden />
          AI 예상 · 참고용
        </span>
      </div>
      <p className={s.lead}>
        초안에 담긴 기능마다 <b>AI가 분석한 예상 금액</b>과 그 근거입니다. 확정된 가격이 아니며, 실제 금액은 공급자의 견적과 합의로 정해집니다.
      </p>

      <div className={s.body}>
        <section className={s.list} aria-label="기능별 AI 예상 금액">
          <div className={s.listHead}>
            <b>기능별 예상 금액</b>
            <span>포함 {totals.count}건 · 수수료 전</span>
          </div>

          {included.length === 0 && (
            <p className={s.mkBody} role="status">합계에 들어간 기능이 아직 없습니다. 초안에 기능을 추가하면 여기에 금액과 근거가 보입니다.</p>
          )}

          {included.map((fn) => (
            <FeatureRow key={fn.id} fn={fn} sub={totals.sub} />
          ))}

          {making.map((name) => (
            <MakingRow key={name} name={name} />
          ))}
          {unnamedMaking > 0 && <MakingRow name={`반영 대기 기능 ${unnamedMaking}건`} />}

          {excluded.length > 0 && (
            <>
              <div className={s.grp}>이번 범위에서 제외 — 합계에 넣지 않습니다</div>
              {excluded.map((fn) => (
                <OutRow key={fn.id} fn={fn} note="직접 삭제 · 초안에서 되돌리면 합계에 다시 더해집니다" />
              ))}
            </>
          )}

          {suggested.length > 0 && (
            <>
              <div className={s.grp}>추천만 된 기능 — 합계에 넣지 않습니다</div>
              {suggested.map((fn) => (
                <OutRow key={fn.id} fn={fn} note="초안에 추가하면 합계에 더해집니다" />
              ))}
            </>
          )}
        </section>

        <aside className={s.rail}>
          <div className={s.tot} aria-label="AI 예상 총액">
            <p className={s.totHead}>AI 예상 총액 <span className={s.totTag}>참고용</span></p>
            <div className={s.totRow}><span>기능 {totals.count}건 합계</span><b>약 {formatWon(totals.sub)}</b></div>
            <div className={s.totRow}><span>플랫폼 수수료 5%</span><b>약 {formatWon(totals.fee)}</b></div>
            <hr />
            <div className={s.totMain}>
              <span className={s.totLabel}>수수료 포함</span>
              <span className={s.totValue}><span className={s.approx}>약</span> {formatWon(totals.total)}</span>
            </div>
            {pendingCount > 0 && <p className={s.tbd}>+ 금액 미정 {pendingCount}건(만드는 중)</p>}
          </div>

          <section className={s.card} aria-labelledby="bud-h">
            <h3 id="bud-h">희망 예산과 비교</h3>
            {hopeBudget === undefined ? (
              <p className={s.res} role="status">희망 예산을 불러오지 못했습니다. 초안 화면에서 확인해 주세요.</p>
            ) : hopeBudget === null ? (
              <>
                <div className={s.cmp}><span>AI 예상 총액</span><b>약 {formatWon(totals.total)}</b></div>
                <p className={s.res}>희망 예산을 정하지 않았습니다. 아래 버튼으로 예상 총액을 희망 예산으로 저장할 수 있습니다.</p>
              </>
            ) : (
              <>
                <div className={s.cmp}><span>생각해 두신 예산</span><b>{formatWon(hopeBudget)}</b></div>
                <div className={s.cmp}><span>AI 예상 총액</span><b>약 {formatWon(totals.total)}</b></div>
                {gap === 0 ? (
                  <p className={s.res}>예산과 같습니다.</p>
                ) : over ? (
                  <p className={`${s.res} ${s.resOver}`}>예산보다 {formatWon(gap)}쯤 많습니다. 초안에서 항목을 빼면 바로 줄어듭니다.</p>
                ) : (
                  <p className={s.res}>예산보다 {formatWon(gap)}쯤 적습니다.</p>
                )}
              </>
            )}
          </section>

          <section className={`${s.card} ${s.how}`} aria-labelledby="how-h">
            <h3 id="how-h">이 금액은 이렇게 나옵니다</h3>
            <ul>
              {HOW.map((item) => (
                <li key={item.rest}>
                  {item.prefix}
                  {item.bold ? <b>{item.bold}</b> : null}
                  {item.rest}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <p className={s.notice}>{BASIS}</p>

      <div className={s.foot}>
        <p className={s.footWarn}>{APPLY_WARN}</p>
        {applyError && <p role="alert" className={s.footWarn}>{applyError}</p>}
        <div className={s.acts}>
          <Button variant="ghost" onClick={onClose}>닫기</Button>
          {applying ? (
            <Button variant="primary" disabled disabledReason="희망 예산을 바꾸고 있습니다.">반영 중…</Button>
          ) : (
            <Button
              variant="primary"
              onClick={onApply}
              disabled={applyDisabledReason !== undefined}
              disabledReason={applyDisabledReason}
            >
              예상 총액을 희망 예산으로 반영
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function MakingRow({ name }: { name: string }) {
  return (
    <article className={`${s.fn} ${s.fnMk}`}>
      <div className={s.fnTop}>
        <div className={s.fnName}>{name}</div>
        <StatusChip status="만드는 중" />
      </div>
      <p className={s.mkBody}>{MAKING.body}</p>
    </article>
  );
}

function OutRow({ fn, note }: { fn: ReportFn; note: string }) {
  return (
    <article className={`${s.fn} ${s.fnOut}`}>
      <div className={s.fnTop}>
        <div>
          <div className={s.fnName}>{fn.name}</div>
          <div className={s.fnDate}>{note}</div>
        </div>
        <div className={s.est}>
          <p className={s.estK}>AI 예상 금액</p>
          <div className={s.estV}><span className={s.approx}>약</span> {formatWon(fn.amount)}</div>
        </div>
      </div>
    </article>
  );
}

function FeatureRow({ fn, sub }: { fn: ReportFn; sub: number }) {
  const pct = fn.share ?? sharePct(fn.amount, sub);
  const rows = basisRows(fn.basis);
  return (
    <article className={s.fn}>
      <div className={s.fnTop}>
        <div>
          <div className={s.fnName}>{fn.name}</div>
          {fn.date && <div className={s.fnDate}>AI 분석 {fn.date}</div>}
        </div>
        <div className={s.est}>
          <p className={s.estK}>AI 예상 금액</p>
          <div className={s.estV}><span className={s.approx}>약</span> {formatWon(fn.amount)}</div>
        </div>
      </div>
      <div className={s.share} aria-label={`예상 합계 중 비중 ${pct}%`}>
        <span className={s.bar}><span style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} /></span>
        <span className={s.pct}>합계의 {pct}%</span>
      </div>
      {rows.length > 0 && (
        <div className={s.basis}>
          {rows.map((row) => (
            <div key={row.label} className={s.basisRow}>
              <span className={s.basisK}>{row.label}</span>
              <span className={s.basisV}>{row.text}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

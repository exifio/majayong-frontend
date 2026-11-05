/* 단가 분석 리포트 — 보드 Report-Client · /c/drafts/:did?modal=report · M2
 * 상태: 예산 안 / 예산 초과 / 만드는 중 포함
 * 모달 틀(배경막 · 제목 · ×)은 App이 그린다. 본문만 채운다. */
import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button, StatusChip } from '@/components/ui';
import { formatWon } from '@/lib/format';
import {
  APPLY_WARN,
  BASIS,
  HOPE_BUDGET,
  HOW,
  MAKING,
  quoteOf,
  reportDemoOf,
  resolveReportMock,
  sharePct,
  type ReportFn,
} from './Report-Client.data';
import s from './Report-Client.module.css';

/** App ModalLayer와 같이 modal · sid · next만 지운다. mock은 남긴다. */
const CLOSE_PARAMS = ['modal', 'sid', 'next'];

export default function ReportClient() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const loc = useLocation();
  const mock = resolveReportMock(params.get('mock'));
  const demo = reportDemoOf(mock);
  const quote = quoteOf(demo.included);
  const over = quote.total > HOPE_BUDGET;
  const gap = Math.abs(HOPE_BUDGET - quote.total);

  const close = useCallback(() => {
    const next = new URLSearchParams(params);
    CLOSE_PARAMS.forEach((key) => next.delete(key));
    const q = next.toString();
    navigate(`${loc.pathname}${q ? `?${q}` : ''}`, { replace: true });
  }, [params, navigate, loc.pathname]);

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
            <span>포함 {quote.count}건 · 수수료 전</span>
          </div>

          {demo.included.map((fn) => (
            <FeatureRow key={fn.id} fn={fn} sub={quote.sub} />
          ))}

          {demo.making && (
            <article className={`${s.fn} ${s.fnMk}`}>
              <div className={s.fnTop}>
                <div className={s.fnName}>{MAKING.name}</div>
                <StatusChip status="만드는 중" />
              </div>
              <p className={s.mkBody}>{MAKING.body}</p>
            </article>
          )}

          {demo.excluded && (
            <>
              <div className={s.grp}>이번 범위에서 제외 — 합계에 넣지 않습니다</div>
              <article className={`${s.fn} ${s.fnOut}`}>
                <div className={s.fnTop}>
                  <div>
                    <div className={s.fnName}>{demo.excluded.name}</div>
                    <div className={s.fnDate}>직접 삭제 · 초안에서 되돌리면 합계에 다시 더해집니다</div>
                  </div>
                  <div className={s.est}>
                    <p className={s.estK}>AI 예상 금액</p>
                    <div className={s.estV}><span className={s.approx}>약</span> {formatWon(demo.excluded.amount)}</div>
                  </div>
                </div>
              </article>
            </>
          )}
        </section>

        <aside className={s.rail}>
          <div className={s.tot} aria-label="AI 예상 총액">
            <p className={s.totHead}>AI 예상 총액 <span className={s.totTag}>참고용</span></p>
            <div className={s.totRow}><span>기능 {quote.count}건 합계</span><b>약 {formatWon(quote.sub)}</b></div>
            <div className={s.totRow}><span>플랫폼 수수료 5%</span><b>약 {formatWon(quote.fee)}</b></div>
            <hr />
            <div className={s.totMain}>
              <span className={s.totLabel}>수수료 포함</span>
              <span className={s.totValue}><span className={s.approx}>약</span> {formatWon(quote.total)}</span>
            </div>
            {demo.making && <p className={s.tbd}>+ 금액 미정 1건(만드는 중)</p>}
          </div>

          <section className={s.card} aria-labelledby="bud-h">
            <h3 id="bud-h">희망 예산과 비교</h3>
            <div className={s.cmp}><span>생각해 두신 예산</span><b>{formatWon(HOPE_BUDGET)}</b></div>
            <div className={s.cmp}><span>AI 예상 총액</span><b>약 {formatWon(quote.total)}</b></div>
            {over ? (
              <p className={`${s.res} ${s.resOver}`}>예산보다 {formatWon(gap)}쯤 많습니다. 초안에서 항목을 빼면 바로 줄어듭니다.</p>
            ) : (
              <p className={s.res}>예산보다 {formatWon(gap)}쯤 적습니다.</p>
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
        <div className={s.acts}>
          <Button variant="ghost" onClick={close}>닫기</Button>
          <Button variant="primary" onClick={close}>예상 총액을 희망 예산으로 반영</Button>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ fn, sub }: { fn: ReportFn; sub: number }) {
  const pct = sharePct(fn.amount, sub);
  return (
    <article className={s.fn}>
      <div className={s.fnTop}>
        <div>
          <div className={s.fnName}>{fn.name}</div>
          <div className={s.fnDate}>AI 분석 {fn.date}</div>
        </div>
        <div className={s.est}>
          <p className={s.estK}>AI 예상 금액</p>
          <div className={s.estV}><span className={s.approx}>약</span> {formatWon(fn.amount)}</div>
        </div>
      </div>
      <div className={s.share} aria-label={`예상 합계 중 비중 ${pct}%`}>
        <span className={s.bar}><span style={{ width: `${pct}%` }} /></span>
        <span className={s.pct}>합계의 {pct}%</span>
      </div>
      <div className={s.basis}>
        <div className={s.basisRow}><span className={s.basisK}>들어간 작업</span><span>{fn.work}</span></div>
        <div className={s.basisRow}><span className={s.basisK}>작업량 기준</span><span>{fn.days}</span></div>
        <div className={s.basisRow}><span className={s.basisK}>달라질 수 있는 것</span><span>{fn.vary}</span></div>
      </div>
    </article>
  );
}

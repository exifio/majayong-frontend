/* 최종 합의 내용 확인 — 보드 Agreement-Client · /c/chat/:pid/:sid/agreement · M3
 * 상태: 미정 있음 / 모두 정해짐 / 첫 문장 기능 빠짐 / 근거 보기
 * 확인만. F-20 · D4. 파란 버튼 하나(합의 완료 · 언제나 켜짐). */
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, Chip, Note } from '@/components/ui';
import { formatWon } from '@/lib/format';
import {
  DEMO,
  DEFAULT_PID,
  DEFAULT_SID,
  MY_HREF,
  SUPPLIER,
  agreementDemoOf,
  chatHref,
  contractHref,
  resolveAgreementMock,
  type CondView,
  type FeatureView,
} from './Agreement-Client.data';
import { useSession } from '@/app/session';
import { LiveAgreement } from '@/components/agreement/LiveAgreement';
import s from './Agreement-Client.module.css';

export default function AgreementClient() {
  const { apiAccessToken } = useSession();
  const { pid = DEFAULT_PID, sid = DEFAULT_SID } = useParams();
  const [params] = useSearchParams();
  const mock = resolveAgreementMock(params.get('mock'));
  const demo = agreementDemoOf(mock);
  const back = chatHref(pid, sid);

  const [popCond, setPopCond] = useState<string | null>(
    demo.popOpen ? DEMO.popDefaultCond : null,
  );

  useEffect(() => {
    const next = agreementDemoOf(resolveAgreementMock(params.get('mock')));
    setPopCond(next.popOpen ? DEMO.popDefaultCond : null);
  }, [params]);

  if (apiAccessToken.trim()) return <LiveAgreement styles={s} />;

  return (
    <div className={s.page} data-screen="Agreement-Client">
      <p className={s.crumb}>
        <Link to={MY_HREF}>내 프로젝트</Link>
        {' › '}
        <Link to={back}>채팅</Link>
        {' › '}
        최종 합의 내용 확인
      </p>

      <div className={s.head}>
        <div>
          <h1 className={s.title}>{DEMO.pageTitle}</h1>
          <p className={s.sub}>{DEMO.pageLead}</p>
        </div>
        <div className={s.who}>
          <span className={s.av} aria-hidden="true">{SUPPLIER.initial}</span>
          <span>
            <b>{SUPPLIER.name}</b>
            <br />
            {SUPPLIER.meta}
          </span>
        </div>
      </div>

      {demo.open ? (
        <div className={`${s.band} ${s.bandOpen}`} role="status">
          <div>
            <b className={s.bandTitle}>{DEMO.openBandTitle}</b>
            <p className={s.bandBody}>{DEMO.openBandBody}</p>
          </div>
          <Link className={s.bandLink} to={back}>채팅에서 정하기</Link>
        </div>
      ) : (
        <div className={`${s.band} ${s.bandDone}`}>
          <div>
            <b className={s.bandTitle}>
              {demo.dropped ? DEMO.doneBandTitleDropped : DEMO.doneBandTitle}
            </b>
            <p className={s.bandBody}>{DEMO.doneBandBody}</p>
          </div>
          <Link className={s.bandLink} to={back}>채팅 보기</Link>
        </div>
      )}

      <div className={s.lay}>
        <div>
          {demo.dropped ? (
            <div className={s.dropNote}>
              <Note title={DEMO.droppedTitle}>{DEMO.droppedBody}</Note>
            </div>
          ) : null}

          {demo.features.map((f) => (
            <FeatureCard
              key={f.id}
              feature={f}
              chatTo={back}
              popCond={popCond}
              onTogglePop={(name) => setPopCond((cur) => (cur === name ? null : name))}
              onClosePop={() => setPopCond(null)}
            />
          ))}
        </div>

        <aside className={s.rail}>
          <section className={s.card} aria-labelledby="pay-h">
            <div className={s.payHead}>
              <h3 id="pay-h">{DEMO.payTitle}</h3>
              <Chip tone={demo.paySettled ? 'teal' : 'outline'}>
                {demo.paySettled ? '정해짐' : '아직 안 정함'}
              </Chip>
            </div>
            <div className={s.ratio}>{DEMO.payRatio}</div>
            <p className={s.payNote}>{demo.payNote}</p>
            <div className={s.split}>
              <div className={s.splitRow}>
                <span>중간 · {DEMO.midNames}</span>
                <b>{formatWon(demo.amounts.stage)}</b>
              </div>
              <div className={s.splitRow}>
                <span>최종 · {demo.finNames}</span>
                <b>{formatWon(demo.amounts.stage)}</b>
              </div>
            </div>
            <p className={s.splitHint}>구간에 담긴 기능이 모두 승인되면 그 구간 금액이 지급됩니다.</p>
          </section>

          <section className={s.card} aria-labelledby="after-h">
            <h3 id="after-h">{DEMO.afterTitle}</h3>
            <ul className={s.after}>
              <li><b>임시 계약</b>이 만들어지고 최준호님에게 알림이 갑니다.</li>
              <li>11월 10일까지 <b>두 분이 서명</b>하면 계약이 체결됩니다. 기한이 지나면 결렬됩니다.</li>
              <li>그동안 다른 지원은 거절되지 않고 <b>보류</b>됩니다.</li>
              <li>임시 계약 중에는 내용을 바꿀 수 없습니다.</li>
            </ul>
          </section>
        </aside>
      </div>

      <section className={s.dock} aria-label="합의 금액과 완료">
        <div className={s.dockRow}>
          <div className={s.amts}>
            <div>
              <p className={s.amtK}>{DEMO.quoteLabel}</p>
              <div className={s.amtV}>{formatWon(demo.amounts.quote)}</div>
              <div className={s.amtS}>{demo.amounts.quoteSub}</div>
            </div>
            <span className={s.op} aria-hidden="true">+</span>
            <div>
              <p className={s.amtK}>{DEMO.feeLabel}</p>
              <div className={s.amtV}>{formatWon(demo.amounts.fee)}</div>
              <div className={s.amtS}>&nbsp;</div>
            </div>
            <span className={s.op} aria-hidden="true">=</span>
            <div>
              <p className={s.amtK}>{DEMO.escrowLabel}</p>
              <div className={`${s.amtV} ${s.amtTot}`}>{formatWon(demo.amounts.escrow)}</div>
              <div className={s.amtS}>&nbsp;</div>
            </div>
          </div>
          <div className={s.acts}>
            <Button variant="ghost" to={back}>{DEMO.backChat}</Button>
            <Button variant="primary" to={contractHref()}>{DEMO.submit}</Button>
          </div>
        </div>
        {demo.why ? <p className={s.why}>{demo.why}</p> : null}
      </section>
    </div>
  );
}

function FeatureCard({
  feature,
  chatTo,
  popCond,
  onTogglePop,
  onClosePop,
}: {
  feature: FeatureView;
  chatTo: string;
  popCond: string | null;
  onTogglePop: (name: string) => void;
  onClosePop: () => void;
}) {
  const hasPop = feature.conds.some((c) => c.name === popCond && c.status === 'ok');
  return (
    <section
      className={`${s.fc} ${feature.gone ? s.fcGone : ''} ${hasPop ? s.fcPop : ''}`}
      aria-label={feature.name}
    >
      <div className={s.fh}>
        <div>
          <div className={s.nm}>{feature.name}</div>
          <div className={s.ds}>{feature.desc}</div>
        </div>
        {feature.gone ? (
          <span className={s.stg}>
            채팅에서 빼기로 함 · <Link to={chatTo}>근거 보기</Link>
          </span>
        ) : (
          <span className={s.stg}>지급 구간 <b>{feature.stage}</b></span>
        )}
      </div>
      {!feature.gone
        ? feature.conds.map((c, i) => (
            <CondRow
              key={c.name}
              cond={c}
              first={i === 0}
              chatTo={chatTo}
              popOpen={popCond === c.name && c.status === 'ok'}
              onTogglePop={() => onTogglePop(c.name)}
              onClosePop={onClosePop}
            />
          ))
        : null}
    </section>
  );
}

function CondRow({
  cond,
  first,
  chatTo,
  popOpen,
  onTogglePop,
  onClosePop,
}: {
  cond: CondView;
  first: boolean;
  chatTo: string;
  popOpen: boolean;
  onTogglePop: () => void;
  onClosePop: () => void;
}) {
  const chipTone = cond.status === 'ok' ? 'teal' : 'outline';
  return (
    <div
      className={`${s.cr} ${first ? s.crFirst : ''} ${cond.openRow ? s.crOpen : ''} ${popOpen ? s.crPop : ''}`}
    >
      <div className={s.q}>{cond.name}</div>
      <div>
        {cond.status === 'ok' ? (
          <>
            <div className={s.a}>{cond.text}</div>
            <div className={s.src}>
              AI 정리 · 근거 {cond.evidenceCount}건
              <button type="button" className={s.srcBtn} onClick={onTogglePop}>
                근거 보기
              </button>
            </div>
            {popOpen && cond.evidence ? (
              <EvidencePop
                condName={cond.name}
                evidence={cond.evidence}
                chatTo={chatTo}
                onClose={onClosePop}
              />
            ) : null}
          </>
        ) : null}
        {cond.status === 'pr' ? (
          <div className={s.pend}>
            {cond.proposer}
            <span className={s.a}> “{cond.text}”</span>
            상대가 답하지 않아 계약서에 &apos;정하지 않음&apos;으로 남습니다 ·{' '}
            <Link to={chatTo}>채팅에서 정하기</Link>
          </div>
        ) : null}
        {cond.status === 'no' ? (
          <div className={s.pend}>
            채팅에서 아직 이야기하지 않았습니다 · 계약서에 &apos;정하지 않음&apos;으로 남습니다
            <Link to={chatTo}>채팅에서 정하기</Link>
          </div>
        ) : null}
      </div>
      <div className={s.st}>
        <Chip tone={chipTone}>{cond.chip}</Chip>
      </div>
    </div>
  );
}

function EvidencePop({
  condName,
  evidence,
  chatTo,
  onClose,
}: {
  condName: string;
  evidence: NonNullable<CondView['evidence']>;
  chatTo: string;
  onClose: () => void;
}) {
  return (
    <div className={s.pop} role="dialog" aria-label={`${condName}의 근거`}>
      <div className={s.popHead}>
        <b>{condName} — 이 줄의 근거</b>
        <button type="button" className={s.popClose} aria-label="닫기" onClick={onClose}>
          ×
        </button>
      </div>
      <p className={s.ai}>
        <i className={s.aiLabel}>AI 정리</i>
        {evidence.ai}
      </p>
      {evidence.messages.map((m) => (
        <div key={m.who + m.text} className={`${s.q3} ${m.key ? s.q3Key : ''}`}>
          <span className={s.q3Who}>{m.who}</span>
          <p>{m.text}</p>
        </div>
      ))}
      <div className={s.popFoot}>
        <span>{evidence.note}</span>
        <Link to={chatTo}>{DEMO.evidenceCta}</Link>
      </div>
    </div>
  );
}

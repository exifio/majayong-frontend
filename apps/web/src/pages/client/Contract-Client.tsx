/* 계약 · 전자서명 — 보드 Contract-Client · /c/contracts/:cid · M3
 * 상태: 상대가 먼저 서명 / 아무도 서명 전 / 내가 먼저 서명 / 양쪽 서명 완료 /
 *       결렬 — 공급자 서명 거절 / 결렬 — 기한 초과 / 임시 계약 취소 확인
 * F-12 · F-10 · 7.2. 파란 버튼은 서명·예치 중 상태당 하나. */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  Chip,
  ConfirmCheck,
  ConfirmDialog,
  Deadline,
  Money,
  chipToneOf,
} from '@/components/ui';
import {
  ARTICLES,
  COMPARE_HREF,
  DEMO,
  DEFAULT_CID,
  LIST_HREF,
  SPEC_GROUPS,
  contractDemoOf,
  escrowHref,
  resolveContractMock,
  type CondRow,
  type FeatureRow,
  type PartySign,
} from './Contract-Client.data';
import { useSession } from '@/app/session';
import { LiveContract } from '@/components/contract/LiveContract';
import s from './Contract-Client.module.css';

export default function ContractClient() {
  const { apiAccessToken } = useSession();
  const { cid = DEFAULT_CID } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveContractMock(params.get('mock'));
  const demo = contractDemoOf(mock);

  const [agreed, setAgreed] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(demo.cancelOpen);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const next = contractDemoOf(resolveContractMock(params.get('mock')));
    setAgreed(false);
    setCancelOpen(next.cancelOpen);
    setReason('');
  }, [params]);

  if (apiAccessToken.trim()) return <LiveContract cid={cid} styles={s} />;

  const escrowTo = escrowHref(cid);

  return (
    <div className={s.page} data-screen="Contract-Client">
      <p className={s.crumb}>
        <Link to={LIST_HREF}>내 계약</Link>
        {' › '}
        {DEMO.title}
      </p>

      <div className={s.head}>
        <div>
          <div className={s.titleRow}>
            <h1 className={s.title}>{DEMO.pageTitle}</h1>
            <Chip tone={chipToneOf(demo.status)}>{demo.statusLabel}</Chip>
          </div>
          <p className={s.sub}>{DEMO.lead}</p>
        </div>
        {demo.bothSigned ? (
          <Button variant="ghost" size="sm" type="button">
            {DEMO.download}
          </Button>
        ) : null}
      </div>

      {demo.showSignDeadline ? (
        <div className={s.deadlineRow}>
          <Deadline label="서명 기한" at={DEMO.signAt} actionable={demo.signActionable} />
        </div>
      ) : null}

      {demo.broke ? (
        <div className={`${s.bandRow} ${s.bandWarn}`} role="status">
          <div>
            <p className={s.bandTitle}>임시 계약이 결렬되었습니다 · {demo.brokeWhy}</p>
            <p className={s.bandBody}>
              {demo.brokeText} 최준호님의 지원은 거절로 처리됩니다. 보류했던 지원자 중에서 다시
              고르실 수 있습니다.
            </p>
          </div>
          <Button variant="tint" size="sm" to={COMPARE_HREF}>
            {DEMO.compareCta}
          </Button>
        </div>
      ) : null}

      {demo.bothSigned ? (
        <div className={`${s.bandRow} ${s.bandDone}`} role="status">
          <div>
            <p className={s.bandTitle}>{DEMO.escrowBandTitle}</p>
            <p className={s.bandBody}>{DEMO.escrowBandBody}</p>
          </div>
          <Button variant="primary" size="sm" to={escrowTo}>
            {DEMO.escrowCta}
          </Button>
        </div>
      ) : null}

      <div className={s.lay}>
        <div>
          <section className={s.card} aria-labelledby="c1">
            <h2 className={s.ct} id="c1">
              검수 기준으로 첨부되는 최종 합의 내용
            </h2>
            <p className={s.sec}>
              채팅에서 정하고 최종 합의 내용에 적은 기능과 조건 그대로입니다. 서명하면 고정되고,
              계약 뒤에는 범위를 바꾸지 않습니다.
            </p>
            <div className={s.specHead}>{DEMO.specHead}</div>
            {SPEC_GROUPS.map((g) => (
              <div key={g.title}>
                <div className={s.grp}>{g.title}</div>
                {g.features.map((f) => (
                  <FeatureBlock key={f.name} feature={f} />
                ))}
              </div>
            ))}
          </section>

          <section className={s.card} aria-labelledby="c2">
            <h2 className={s.ct} id="c2">
              계약 본문
            </h2>
            {ARTICLES.map((a) => (
              <div className={s.art} key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </div>
            ))}
          </section>
        </div>

        <aside>
          <div className={s.money} aria-label="예치할 금액">
            <p className={s.moneyK}>예치할 금액</p>
            <div className={s.moneyRow}>
              <span>합의 금액</span>
              <b>
                <Money amount={DEMO.agreed} />
              </b>
            </div>
            <div className={s.moneyRow}>
              <span>의뢰인 수수료 5%</span>
              <b>
                <Money amount={DEMO.fee} />
              </b>
            </div>
            <hr className={s.moneyHr} />
            <div className={s.moneyTot}>
              <span>총액</span>
              <span className={s.moneyTotValue}>
                <Money amount={DEMO.escrow} size="big" />
              </span>
            </div>
          </div>

          <section className={s.card} aria-labelledby="c3">
            <h2 className={s.ct} id="c3">
              {DEMO.payRatio}
            </h2>
            <p className={s.sec}>{DEMO.payNote}</p>
            <div className={s.splitRow}>
              <span>{DEMO.midLabel}</span>
              <b>
                <Money amount={DEMO.stage} />
              </b>
            </div>
            <div className={s.splitRow}>
              <span>{DEMO.finLabel}</span>
              <b>
                <Money amount={DEMO.stage} />
              </b>
            </div>
          </section>

          <section className={s.card} aria-labelledby="c4">
            <h2 className={s.ct} id="c4">
              서명 현황
            </h2>
            <SignRow party={demo.client} kind="cli" />
            <SignRow party={demo.supplier} kind="sup" />
            {demo.showSignDeadline ? (
              <p className={s.signHint}>{DEMO.signDeadlineHint}</p>
            ) : null}
          </section>

          {demo.canSign ? (
            <div className={s.signbox}>
              <ConfirmCheck checked={agreed} onChange={setAgreed}>
                {DEMO.agreeLabel}
              </ConfirmCheck>
              <div style={{ marginTop: 12 }}>
                <Button
                  variant="primary"
                  full
                  disabled={!agreed}
                  disabledReason={!agreed ? '계약 본문과 최종 합의 내용을 확인해 주세요' : undefined}
                  onClick={() => {
                    if (demo.supplier.chip === '서명 완료') {
                      navigate(`${escrowTo}`);
                    } else {
                      navigate(`?mock=${encodeURIComponent('내가 먼저 서명')}`);
                    }
                  }}
                >
                  서명하기
                </Button>
              </div>
              <p className={s.cancelLine}>
                {DEMO.cancelTail}{' '}
                <Button variant="warn" size="sm" type="button" onClick={() => setCancelOpen(true)}>
                  {DEMO.cancelLabel}
                </Button>
              </p>
            </div>
          ) : null}

          {demo.waiting ? <p className={s.doneNote}>{DEMO.waitText}</p> : null}
        </aside>
      </div>

      <p className={s.broker}>{DEMO.broker}</p>

      {cancelOpen ? (
        <ConfirmDialog
          title={DEMO.cancelDialogTitle}
          confirmLabel={DEMO.cancelConfirm}
          danger
          onCancel={() => setCancelOpen(false)}
          onConfirm={() => {
            setCancelOpen(false);
            navigate(COMPARE_HREF);
          }}
        >
          <ul className={s.cancelList}>
            {DEMO.cancelBullets.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <label className={s.reasonLabel} htmlFor="cancel-reason">
            {DEMO.cancelReasonLabel}
          </label>
          <textarea
            id="cancel-reason"
            className={s.reason}
            aria-label="취소 사유"
            placeholder={DEMO.cancelReasonPh}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

function FeatureBlock({ feature }: { feature: FeatureRow }) {
  return (
    <div className={s.feat} aria-label={feature.name}>
      <div className={s.featName}>{feature.name}</div>
      <div className={s.featDesc}>{feature.desc}</div>
      <ul className={s.conds}>
        {feature.conds.map((c) => (
          <CondItem key={c.q} cond={c} />
        ))}
      </ul>
    </div>
  );
}

function CondItem({ cond }: { cond: CondRow }) {
  return (
    <li className={`${s.cond} ${cond.unset ? s.condUnset : ''}`}>
      <span className={s.condQ}>{cond.q}</span>
      <span className={s.condA}>{cond.a}</span>
    </li>
  );
}

function SignRow({ party, kind }: { party: PartySign; kind: 'cli' | 'sup' }) {
  return (
    <div className={s.sg}>
      <span className={`${s.av} ${kind === 'cli' ? s.avCli : s.avSup}`} aria-hidden="true">
        {party.initial}
      </span>
      <div>
        <div className={s.sgNm}>{party.name}</div>
        <div className={s.sgRl}>
          {party.role}
          {party.at}
        </div>
      </div>
      <span className={s.sgChip}>
        <Chip tone={party.tone}>{party.chip}</Chip>
      </span>
    </div>
  );
}

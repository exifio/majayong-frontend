/* 계약 취소 요청 — 보드 Cancel-Client · /c/contracts/:cid/cancel · M5
 * 상태: 요청 작성 / 공급자 사정 선택 / 동의 대기 / 이견 — 운영자 판정 중 / 정산 확정
 * F-26 · 13.2. 금액은 데이터. */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  ConfirmDialog,
  Deadline,
  Money,
  SelectCards,
  StatusChip,
  TextAreaField,
} from '@/components/ui';
import { formatWon } from '@/lib/format';
import { useSession } from '@/app/session';
import { LiveCancellation } from '@/components/contract/LiveCancellation';
import { AuthRequired } from '@/components/system/AuthRequired';
import { DEMO_DATA_ENABLED } from '@/lib/feature-flags';
import {
  DEMO,
  DEFAULT_CID,
  LIST_HREF,
  SETTLE_HREF,
  cancelDemoOf,
  resolveCancelMock,
  type CancelMock,
} from './Cancel-Client.data';
import s from './Cancel-Client.module.css';

export default function CancelClient() {
  const { cid = DEFAULT_CID } = useParams();
  const [params] = useSearchParams();
  const { apiAccessToken } = useSession();
  const navigate = useNavigate();
  const mock: CancelMock = resolveCancelMock(params.get('mock'));
  const demo = cancelDemoOf(mock);

  const [reason, setReason] = useState<'client' | 'supplier'>(demo.reason);
  const [explain, setExplain] = useState(demo.explain);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const next = cancelDemoOf(resolveCancelMock(params.get('mock')));
    setReason(next.reason);
    setExplain(next.explain);
    setConfirmOpen(false);
  }, [params]);

  if (apiAccessToken.trim()) return <LiveCancellation cid={cid} role="CLIENT" />;
  if (!DEMO_DATA_ENABLED) return <AuthRequired />;

  const lines =
    reason === 'supplier'
      ? cancelDemoOf('공급자 사정 선택').lines
      : cancelDemoOf('요청 작성').lines;

  const goMock = (next: CancelMock) => {
    navigate(`?mock=${encodeURIComponent(next)}`, { replace: true });
  };

  return (
    <div className={s.page} data-screen="Cancel-Client">
      <p className={s.crumb}>
        <Link to={LIST_HREF}>{DEMO.crumbContracts}</Link>
        {' › '}
        <Link to={`/c/contracts/${cid}`}>{DEMO.crumbContract}</Link>
        {' › '}
        취소 요청
      </p>

      <div className={s.head}>
        <h1 className={s.title}>{demo.title}</h1>
        <p className={s.sub}>{demo.sub}</p>
      </div>

      {demo.wait ? (
        <Band tone="wait" title={DEMO.waitTitle}>
          {DEMO.waitBody}
        </Band>
      ) : null}
      {demo.wait ? (
        <p className={s.dlWrap}>
          <Deadline label="응답 기한" at={DEMO.respondBy} actionable />
        </p>
      ) : null}

      {demo.dispute ? (
        <Band tone="warn" title={DEMO.disputeTitle}>
          {DEMO.disputeBody}
        </Band>
      ) : null}

      {demo.done ? (
        <Band tone="done" title={DEMO.doneTitle}>
          {DEMO.doneBody}
        </Band>
      ) : null}

      <div className={s.lay}>
        <div>
          <section className={s.blk} aria-labelledby="h-ct">
            <h2 id="h-ct">계약 요약</h2>
            <div className={s.who}>
              <div>
                <div className={s.nm}>{DEMO.supplier}</div>
                <div className={s.meta}>{DEMO.supplierMeta}</div>
              </div>
              <StatusChip status={demo.status} />
            </div>
            <div className={s.kv}>
              <div>
                <div className={s.k}>예치한 금액</div>
                <div className={s.v}>
                  <Money amount={DEMO.escrow} />
                </div>
                <div className={s.s}>11월 4일 · 합의 3,100,000원 + 수수료</div>
              </div>
              <div>
                <div className={s.k}>구간 금액</div>
                <div className={s.v}>
                  <Money amount={DEMO.stage} />
                </div>
                <div className={s.s}>중간 50 : 최종 50 · 납품 전</div>
              </div>
            </div>
          </section>

          {demo.dispute ? (
            <section className={s.blk} aria-labelledby="h-two">
              <h2 id="h-two">양쪽이 고른 사유</h2>
              <div className={s.two}>
                <div className={s.claim}>
                  <p className={s.k}>{DEMO.myClaimTitle}</p>
                  <p className={s.rsn}>{DEMO.myClaimReason}</p>
                  <p>{DEMO.myClaimBody}</p>
                </div>
                <div className={s.claim}>
                  <p className={s.k}>{DEMO.theirClaimTitle}</p>
                  <p className={s.rsn}>{DEMO.theirClaimReason}</p>
                  <p>{DEMO.theirClaimBody}</p>
                </div>
              </div>
            </section>
          ) : null}

          <section className={s.blk} aria-labelledby="h-rs">
            <h2 id="h-rs">취소 사유</h2>
            <p className={s.hint}>사유에 따라 정산이 달라집니다.</p>
            <SelectCards
              label="취소 사유"
              value={reason}
              onChange={(k) => {
                if (!demo.write) return;
                setReason(k as 'client' | 'supplier');
              }}
              options={[
                {
                  key: 'client',
                  label: (
                    <span className={s.cardLabel}>
                      <span className={s.cardTitle}>{DEMO.reasonClient}</span>
                      <span className={s.cardDesc}>{DEMO.reasonClientDesc}</span>
                    </span>
                  ),
                },
                {
                  key: 'supplier',
                  label: (
                    <span className={s.cardLabel}>
                      <span className={s.cardTitle}>{DEMO.reasonSupplier}</span>
                      <span className={s.cardDesc}>{DEMO.reasonSupplierDesc}</span>
                    </span>
                  ),
                },
              ]}
            />
          </section>

          <section className={s.blk} aria-labelledby="h-tx">
            <h2 id="h-tx">{DEMO.explainLabel}</h2>
            <p className={s.hint}>{DEMO.explainHint}</p>
            <div className={s.fields}>
              <TextAreaField
                label={DEMO.explainLabel}
                value={explain}
                onChange={(e) => setExplain(e.target.value)}
                disabled={!demo.write}
              />
            </div>
          </section>
        </div>

        <aside className={s.rail}>
          <section className={s.pv} aria-labelledby="h-pv">
            <h3 id="h-pv">{demo.previewTitle}</h3>
            <p className={s.tag}>{demo.write ? (reason === 'supplier' ? DEMO.tagSupplier : DEMO.tagClient) : demo.tag}</p>
            {(demo.write ? lines : demo.lines).map((x) => (
              <div key={x.k} className={`${s.r} ${x.tot ? s.tot : ''}`}>
                <span>
                  {x.k}
                  {x.s ? <i>{x.s}</i> : null}
                </span>
                <b>{x.v < 0 ? `− ${formatWon(Math.abs(x.v))}` : <Money amount={x.v} />}</b>
              </div>
            ))}
            <ul className={s.notes}>
              <li>최준호님이 동의하면 확정, 이견이면 운영자가 판정합니다.</li>
              <li>정산은 계약당 한 번입니다.</li>
              <li>요청 중에는 작업과 검수가 멈춥니다.</li>
            </ul>

            {demo.write ? (
              <>
                <Button variant="warn" full onClick={() => setConfirmOpen(true)}>
                  {DEMO.send}
                </Button>
                <p className={s.tiny}>{DEMO.sendHint}</p>
              </>
            ) : null}

            {demo.done ? (
              <Button variant="primary" full to={SETTLE_HREF}>
                {DEMO.settleCta}
              </Button>
            ) : null}

            {demo.wait || demo.dispute ? (
              <Button variant="ghost" full to={LIST_HREF}>
                내 계약으로
              </Button>
            ) : null}
          </section>
        </aside>
      </div>

      {confirmOpen ? (
        <ConfirmDialog
          title={DEMO.dialogTitle}
          confirmLabel={DEMO.dialogConfirm}
          danger
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            goMock('동의 대기');
          }}
        >
          <p>{DEMO.dialogBody}</p>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

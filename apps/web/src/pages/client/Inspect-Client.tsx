/* 검수 — 보드 Inspect-Client · /c/contracts/:cid/inspect · M5
 * 상태: 검수 대기 / 보완 요청 작성 / 승인 확인 / 최종 검수 / 도움 요청 / 중간 승인 완료 / 검수 기한 하루 전
 * F-13 · 11.3. 금액·기한은 데이터. */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  Chip,
  ConfirmDialog,
  Deadline,
  Money,
  StatusChip,
  TextAreaField,
} from '@/components/ui';
import {
  CHAT_HREF,
  DEFAULT_CID,
  DEMO,
  LIST_HREF,
  REVIEW_HREF,
  inspectDemoOf,
  resolveInspectMock,
  type InspectMock,
  type Item,
} from './Inspect-Client.data';
import s from './Inspect-Client.module.css';

function itemChip(item: Item) {
  if (item.status === 'ok') return <StatusChip status="승인" />;
  if (item.statusLabel === '보완 요청 작성 중') return <StatusChip status="보완 요청 작성 중" />;
  return <StatusChip status="검수 대기" />;
}

export default function InspectClient() {
  const { cid = DEFAULT_CID } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock: InspectMock = resolveInspectMock(params.get('mock'));
  const demo = inspectDemoOf(mock);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [fixItem, setFixItem] = useState(demo.items.find((i) => i.status !== 'ok')?.id ?? '');
  const [fixReason, setFixReason] = useState(
    demo.fixForm
      ? '저녁 2부 회차는 마감 시각이 지나도 환불 버튼이 보여요. 회차마다 정한 마감 시각 이후에는 환불이 안 되게 해 주세요.'
      : '',
  );
  const [approveOpen, setApproveOpen] = useState(demo.approveOpen);
  const [showFix, setShowFix] = useState(demo.fixForm);
  const [fixSent, setFixSent] = useState(false);

  useEffect(() => {
    const next = inspectDemoOf(resolveInspectMock(params.get('mock')));
    setApproveOpen(next.approveOpen);
    setShowFix(next.fixForm);
    setFixSent(false);
    setFixItem(next.items.find((i) => i.status !== 'ok')?.id ?? '');
    setFixReason(
      next.fixForm
        ? '저녁 2부 회차는 마감 시각이 지나도 환불 버튼이 보여요. 회차마다 정한 마감 시각 이후에는 환불이 안 되게 해 주세요.'
        : '',
    );
    setChecked({});
  }, [params]);

  const goMock = (next: InspectMock) => {
    navigate(`?mock=${encodeURIComponent(next)}`, { replace: true });
  };

  const canSendFix = fixItem.trim().length > 0 && fixReason.trim().length > 0;
  const waitItems = demo.items.filter((i) => i.status === 'wait' || i.status === 'fix');
  const showPrimaryApprove = !demo.midDone && !showFix && waitItems.length > 0;

  return (
    <div className={s.page} data-screen="Inspect-Client">
      <p className={s.crumb}>
        <Link to={LIST_HREF}>{DEMO.crumbContracts}</Link>
        {' › '}
        <Link to={`/c/contracts/${cid}`}>{DEMO.crumbContract}</Link>
        {' › '}
        {DEMO.pageTitle}
      </p>

      <div className={s.head}>
        <div>
          <div className={s.titleRow}>
            <h1 className={s.title}>{DEMO.pageTitle}</h1>
            <Chip tone={demo.titleChipTone}>{demo.titleChip}</Chip>
            {demo.showDeadline ? (
              <Deadline label="검수 기한" at={demo.deadlineAt} actionable />
            ) : null}
          </div>
          <p className={s.sub}>{DEMO.sub}</p>
        </div>
        <div className={s.who}>
          <span className={s.av} aria-hidden="true">
            {DEMO.supplierInitial}
          </span>
          <span>
            <b>{DEMO.supplierName}</b>
            <br />
            공급자 · <Link to={CHAT_HREF}>채팅</Link>
          </span>
        </div>
      </div>

      <div className={s.stageCard}>
        <div>
          <div className={s.stageAmt}>
            {demo.stageLabel} · <Money amount={demo.stageAmount} />
          </div>
          <div className={s.stageMeta}>구간 금액 · 모두 승인하면 공급자에게 지급</div>
        </div>
      </div>

      {demo.dueWarn ? (
        <Band tone="warn" title={DEMO.dueTitle}>
          {DEMO.dueBody}
        </Band>
      ) : null}

      {demo.midDone ? (
        <Band tone="done" title={DEMO.midDoneTitle}>
          {DEMO.midDoneBody}
        </Band>
      ) : null}

      {demo.helpOpen ? (
        <div className={s.helpBox} role="status">
          <b>{DEMO.helpTitle}</b>
          <p style={{ margin: '6px 0 0' }}>{DEMO.helpSent}</p>
          <p style={{ margin: '6px 0 0' }}>{DEMO.helpBody}</p>
        </div>
      ) : null}

      <div className={s.lay}>
        <div>
          {demo.items.map((it) => (
            <section key={it.id} className={s.ic} aria-label={it.name}>
              <div className={s.ih}>
                <div>
                  <div className={s.nm}>{it.name}</div>
                  <div className={s.ds}>{it.desc}</div>
                </div>
                {itemChip(it)}
              </div>

              <div className={s.crit}>
                <p className={s.k}>{DEMO.criteriaHeading}</p>
                <ul>
                  {it.conds.map((c) => (
                    <li key={c.q}>
                      <span className={s.q}>{c.q}</span>
                      <span className={s.a}>
                        {c.unset ? <em className={s.unset}>{DEMO.unset}</em> : null}
                        {c.a}
                      </span>
                    </li>
                  ))}
                </ul>
                {it.status !== 'ok' ? (
                  <label className={s.checkRow}>
                    <input
                      type="checkbox"
                      checked={!!checked[it.id]}
                      onChange={(e) =>
                        setChecked((prev) => ({ ...prev, [it.id]: e.target.checked }))
                      }
                    />
                    {DEMO.checkLabel} — {it.name}
                  </label>
                ) : null}
              </div>

              {it.status !== 'ok' || it.okNote ? (
                <div className={s.dl}>
                  <p className={s.dlHead}>
                    {DEMO.deliveryHeading}
                    <span>{it.when}</span>
                  </p>
                  <div className={s.rw}>
                    <span className={s.q}>결과물 링크</span>
                    <a href={it.link} target="_blank" rel="noreferrer">
                      {it.link}
                    </a>
                  </div>
                  <div className={s.rw}>
                    <span className={s.q}>첨부 파일</span>
                    <span>
                      {it.files.length === 0 ? (
                        <span className={s.none}>없음</span>
                      ) : (
                        it.files.map((f) => (
                          <span key={f} className={s.fchip}>
                            {f}
                          </span>
                        ))
                      )}
                    </span>
                  </div>
                  <div className={s.rw}>
                    <span className={s.q}>확인 방법</span>
                    <span>{it.memo}</span>
                  </div>
                </div>
              ) : null}

              {it.status === 'ok' && it.okNote ? (
                <div className={s.doneRow}>
                  <span>✓ {it.okNote}</span>
                </div>
              ) : null}
            </section>
          ))}

          {showFix ? (
            <div className={s.fixf}>
              <p className={s.fixTitle}>{DEMO.fixTitle}</p>
              <p className={s.fixHint}>{DEMO.fixHint}</p>
              <label className={s.k} htmlFor="fix-item">
                항목
              </label>
              <select
                id="fix-item"
                value={fixItem}
                onChange={(e) => setFixItem(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: 12,
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--slate-300)',
                  fontSize: 15,
                  background: '#fff',
                }}
              >
                {demo.items
                  .filter((i) => i.status !== 'ok')
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
              </select>
              <TextAreaField
                label="사유"
                value={fixReason}
                onChange={(e) => setFixReason(e.target.value)}
              />
              <div className={s.fixActions}>
                <Button variant="ghost" size="sm" onClick={() => setShowFix(false)}>
                  {DEMO.fixCancel}
                </Button>
                <Button
                  variant="tint"
                  size="sm"
                  disabled={!canSendFix || fixSent}
                  disabledReason={!canSendFix ? DEMO.fixEmpty : fixSent ? '보완 요청을 보냈습니다' : undefined}
                  onClick={() => setFixSent(true)}
                >
                  {DEMO.fixSend}
                </Button>
              </div>
            </div>
          ) : null}

          {fixSent ? (
            <p className={s.actsHint} role="status">
              보완 요청을 보냈습니다. 시연 상태라 서버에는 저장되지 않았습니다.
            </p>
          ) : null}

          <div className={s.acts}>
            <span className={s.actsHint}>{demo.deliveryNote}</span>
            {!demo.midDone ? (
              <Button variant="text" onClick={() => goMock('도움 요청')}>
                {DEMO.help}
              </Button>
            ) : null}
            {!demo.midDone && !showFix ? (
              <Button variant="tint" onClick={() => setShowFix(true)}>
                {DEMO.fix}
              </Button>
            ) : null}
            {showPrimaryApprove ? (
              <Button variant="primary" onClick={() => setApproveOpen(true)}>
                {DEMO.approve}
              </Button>
            ) : null}
            {demo.midDone ? (
              <Button variant="primary" to={LIST_HREF}>
                {DEMO.toContracts}
              </Button>
            ) : null}
            {demo.finalDoneCta && !showPrimaryApprove ? (
              <Button variant="primary" to={REVIEW_HREF}>
                {DEMO.toReview}
              </Button>
            ) : null}
          </div>
        </div>

        <aside className={s.rail}>
          <section className={s.card}>
            <h3>이번 구간 지급</h3>
            <div className={s.payTot}>
              <span>{demo.stageLabel} · 50%</span>
              <b>
                <Money amount={demo.stageAmount} />
              </b>
            </div>
            <p className={s.payNote}>
              항목을 모두 승인하면 {DEMO.supplierName}님에게 지급됩니다.
            </p>
          </section>
          <section className={s.card}>
            <h3>알아두실 것</h3>
            <ul className={s.after}>
              <li>
                구간의 항목이 <b>모두 승인되면</b> 그 구간 금액이 공급자에게 지급됩니다.
              </li>
              <li>
                <b>승인한 항목은 다시 검수하지 않습니다.</b>
              </li>
              <li>
                납품 후 <b>7일 안에</b> 검수하지 않으면 자동 승인되고 지급됩니다.
              </li>
            </ul>
          </section>
        </aside>
      </div>

      {approveOpen ? (
        <ConfirmDialog
          title={DEMO.approveDialogTitle}
          confirmLabel={DEMO.approveConfirm}
          onCancel={() => setApproveOpen(false)}
          onConfirm={() => {
            setApproveOpen(false);
            if (demo.stage === 'final') {
              navigate(REVIEW_HREF);
            } else {
              goMock('중간 승인 완료');
            }
          }}
        >
          <p>{DEMO.approveDialogBody}</p>
          <div className={s.dialogAmt}>
            <span>{DEMO.supplierName}님에게 지급</span>
            <b>
              <Money amount={demo.stageAmount} />
            </b>
          </div>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

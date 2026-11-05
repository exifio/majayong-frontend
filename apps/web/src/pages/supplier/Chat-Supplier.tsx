/* 문의 채팅 — 보드 Chat-Supplier · /s/chat/:pid · M3
 * 상태: 문의 중 / 견적 수정 / 임시 계약 / 읽기 전용 / 계약 체결 후 / 신고
 * Chat-Client와 같은 구조, me=공급자. 계약하기 없음. F-19. */
import { useEffect, useId, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Attr,
  Button,
  Chip,
  MaskedText,
  Modal,
  SelectCards,
  StatusChip,
} from '@/components/ui';
import { formatWon } from '@/lib/format';
import {
  CONTRACT_HREF,
  DEMO,
  DEFAULT_PID,
  PROJECT_HREF,
  PROJECT_TITLE,
  QUOTE_HREF,
  REPORT_REASONS,
  chatDemoOf,
  chatHref,
  resolveChatMock,
  type Msg,
} from './Chat-Supplier.data';
import { useSession } from '@/app/session';
import { LiveChat } from '@/components/chat/LiveChat';
import s from './Chat-Supplier.module.css';

export default function ChatSupplier() {
  const { apiAccessToken } = useSession();
  const { pid = DEFAULT_PID } = useParams();
  const [params] = useSearchParams();
  const mock = resolveChatMock(params.get('mock'));
  const demo = chatDemoOf(mock);

  const [draft, setDraft] = useState('');
  const [extra, setExtra] = useState<Msg[]>([]);
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set(
    demo.messages.flatMap((m) => (m.kind === 'them' && m.flagged ? [m.id] : [])),
  ));
  const [reportId, setReportId] = useState<string | null>(
    demo.reportOpen ? demo.reportTargetId : null,
  );
  const [reason, setReason] = useState<string | null>(demo.reportOpen ? 'contact' : null);
  const [reportDesc, setReportDesc] = useState('');
  const [revOpen, setRevOpen] = useState(demo.revOpen);
  const [revAmount, setRevAmount] = useState(String(DEMO.amount));
  const [revReason, setRevReason] = useState('');
  const inputId = useId();

  useEffect(() => {
    const next = chatDemoOf(resolveChatMock(params.get('mock')));
    setDraft('');
    setExtra([]);
    setFlagged(new Set(next.messages.flatMap((m) => (m.kind === 'them' && m.flagged ? [m.id] : []))));
    setReportId(next.reportOpen ? next.reportTargetId : null);
    setReason(next.reportOpen ? 'contact' : null);
    setReportDesc('');
    setRevOpen(next.revOpen);
    setRevAmount(String(DEMO.amount));
    setRevReason('');
  }, [params]);

  if (apiAccessToken.trim()) return <LiveChat pid={pid} styles={s} />;

  const messages = [...demo.messages, ...extra];

  const send = (text: string) => {
    const body = text.trim();
    if (!body || demo.readOnly) return;
    const now = new Date();
    const at = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setExtra((list) => [...list, { kind: 'me', id: `local-${Date.now()}`, at, text: body }]);
    setDraft('');
  };

  const saveRev = () => {
    const next = Number(revAmount.replace(/,/g, ''));
    const won = Number.isFinite(next) ? next : DEMO.amount;
    setExtra((list) => [
      ...list,
      {
        kind: 'sys',
        tone: 'chg',
        text: `견적 수정 ${formatWon(DEMO.prevAmount)} → ${formatWon(won)}${revReason ? ` · 사유: ${revReason}` : ''}`,
      },
    ]);
    setRevOpen(false);
  };

  const reportMsg = messages.find((m) => m.kind === 'them' && m.id === reportId);

  return (
    <div className={s.page} data-screen="Chat-Supplier">
      <div className={s.ch}>
        <aside className={s.ls} aria-label="대화 목록">
          <div className={s.lh}>채팅</div>
          <div className={s.pj}>{PROJECT_TITLE}</div>
          {demo.list.map((c) => (
            <Link
              key={c.id}
              className={`${s.it} ${c.active ? s.itOn : ''}`}
              to={chatHref(c.pid, mock)}
            >
              <span className={s.av} aria-hidden="true">
                {c.ini}
              </span>
              <span className={s.bd}>
                <span className={s.r1}>
                  <span className={s.nm}>{c.name}</span>
                  <span className={s.tm}>{c.time}</span>
                </span>
                <span className={s.pv}>{c.preview}</span>
                <span className={s.r3}>
                  <HeadChip status={c.chip} />
                  {c.unread > 0 ? <span className={s.ub}>{c.unread}</span> : null}
                </span>
              </span>
            </Link>
          ))}
          <p className={s.listFoot}>{DEMO.listFoot}</p>
        </aside>

        <section className={s.cv} aria-label={`${DEMO.clientName}님과의 대화`}>
          <div className={s.cvh}>
            <div className={s.who}>
              <span className={s.whoAv} aria-hidden="true">
                {DEMO.clientIni}
              </span>
              <div>
                <div className={s.whoNm}>
                  {DEMO.clientName} <HeadChip status={demo.chip} />
                </div>
                <div className={s.whoMt}>
                  {DEMO.clientMeta}
                  <span className={s.sep}>|</span>
                  <Link className={s.projLink} to={PROJECT_HREF}>
                    {PROJECT_TITLE}
                  </Link>
                </div>
              </div>
            </div>
            <div className={s.acts}>
              <Button variant="ghost" size="sm" to={QUOTE_HREF}>
                {DEMO.bandQuote}
              </Button>
              {demo.canRev ? (
                <Button variant="tint" size="sm" type="button" onClick={() => setRevOpen(true)}>
                  {DEMO.editQuote}
                </Button>
              ) : null}
              {demo.held || demo.signed ? (
                <Button
                  variant="tint"
                  size="sm"
                  disabled
                  disabledReason={demo.held ? DEMO.editDisabledHeld : DEMO.editDisabledSigned}
                >
                  {DEMO.editQuote}
                </Button>
              ) : null}
              {demo.signed ? (
                <Button variant="ghost" size="sm" to={CONTRACT_HREF}>
                  {DEMO.heldCta}
                </Button>
              ) : null}
            </div>
          </div>

          {demo.held ? (
            <div className={s.stl} role="status">
              <div>
                <b>{DEMO.heldTitle}</b>
                <p style={{ margin: '4px 0 0' }}>{DEMO.heldBody}</p>
              </div>
              <Button variant="tint" size="sm" to={CONTRACT_HREF}>
                {DEMO.heldCta}
              </Button>
            </div>
          ) : null}

          <div className={s.qbar} aria-label="지금 견적">
            <Attr label="지금 견적">{formatWon(DEMO.amount)}</Attr>
            <Attr label="기간">{DEMO.days}일</Attr>
            <Attr label="가능 항목">{DEMO.okLabel}</Attr>
            <Attr label="회차">{DEMO.quoteRound}</Attr>
          </div>

          <div className={s.msgs}>
            {messages.map((m, i) => (
              <MessageRow
                key={m.kind === 'me' || m.kind === 'them' ? m.id : `${m.kind}-${i}`}
                msg={m}
                name={DEMO.clientName}
                flagged={m.kind === 'them' && flagged.has(m.id)}
                onReport={m.kind === 'them' ? () => {
                  setReportId(m.id);
                  setReason('contact');
                  setReportDesc('');
                } : undefined}
              />
            ))}
          </div>

          {demo.readOnly ? (
            <div className={s.ro}>{DEMO.readOnlyReason}</div>
          ) : (
            <div className={s.in}>
              <div className={s.inRow}>
                <input
                  id={inputId}
                  className={s.inp}
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      send(draft);
                    }
                  }}
                  placeholder={DEMO.ph}
                  aria-label="메시지 입력"
                />
                <Button variant="tint" onClick={() => send(draft)}>
                  보내기
                </Button>
              </div>
              <p className={s.hint}>{demo.hint}</p>
            </div>
          )}
        </section>
      </div>

      {revOpen ? (
        <Modal
          title={DEMO.revTitle}
          size="content"
          onClose={() => setRevOpen(false)}
          actions={
            <>
              <Button variant="ghost" onClick={() => setRevOpen(false)}>
                {DEMO.revCancel}
              </Button>
              <Button variant="tint" onClick={saveRev}>
                {DEMO.revSave}
              </Button>
            </>
          }
        >
          <p className={s.reportLb}>
            지금 {DEMO.quoteRound} · {formatWon(DEMO.amount)} · {DEMO.days}일
          </p>
          <label className={s.reportLb} htmlFor="rev-amt">
            {DEMO.revAmountLabel}
          </label>
          <input
            id="rev-amt"
            className={s.inp}
            style={{ width: '100%', marginBottom: 12 }}
            value={revAmount}
            onChange={(e) => setRevAmount(e.target.value)}
            inputMode="numeric"
          />
          <label className={s.reportLb} htmlFor="rev-rs">
            {DEMO.revReasonLabel}
          </label>
          <textarea
            id="rev-rs"
            className={s.reportTa}
            placeholder={DEMO.revReasonPh}
            value={revReason}
            onChange={(e) => setRevReason(e.target.value)}
          />
        </Modal>
      ) : null}

      {reportId && reportMsg && reportMsg.kind === 'them' ? (
        <Modal
          title={DEMO.reportTitle}
          size="content"
          danger
          onClose={() => {
            setReportId(null);
            setReason(null);
          }}
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setReportId(null);
                  setReason(null);
                }}
              >
                취소
              </Button>
              <Button
                variant="warn"
                disabled={!reason}
                disabledReason={!reason ? '사유를 골라 주세요' : undefined}
                onClick={() => {
                  setFlagged((prev) => new Set(prev).add(reportId));
                  setReportId(null);
                  setReason(null);
                }}
              >
                신고하기
              </Button>
            </>
          }
        >
          <div className={s.reportQ}>
            <i>
              {DEMO.clientName} · {reportMsg.at}
            </i>
            <MaskedText text={reportMsg.text} />
          </div>
          <p className={s.reportLb}>사유</p>
          <SelectCards
            label="신고 사유"
            danger
            options={REPORT_REASONS.map((r) => ({ key: r.key, label: r.label }))}
            value={reason}
            onChange={setReason}
          />
          <p className={s.reportLb} style={{ marginTop: 16 }}>
            설명 <span>(선택)</span>
          </p>
          <textarea
            className={s.reportTa}
            aria-label="신고 설명"
            placeholder={DEMO.reportPlaceholder}
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
          />
          <p className={s.reportNt}>{DEMO.reportNote}</p>
        </Modal>
      ) : null}
    </div>
  );
}

function HeadChip({ status }: { status: string }) {
  if (status === '임시 계약' || status === '임시 계약 · 서명 대기') {
    return <Chip tone="amber">{status}</Chip>;
  }
  return <StatusChip status={status} />;
}

function MessageRow({
  msg,
  name,
  flagged,
  onReport,
}: {
  msg: Msg;
  name: string;
  flagged?: boolean;
  onReport?: () => void;
}) {
  if (msg.kind === 'day') return <div className={s.day}>{msg.text}</div>;
  if (msg.kind === 'sys') {
    const tone = msg.tone === 'chg' ? s.sysChg : msg.tone === 'ok' ? s.sysOk : '';
    if (msg.text === '임시 계약') {
      return (
        <p className={`${s.sys} ${tone}`}>
          <b>의뢰인이 최종 합의를 마쳐 임시 계약이 되었습니다</b>
          {' · 서명 기한 11월 10일'}
          <br />
          <Link to={CONTRACT_HREF}>계약서 확인하기</Link>
        </p>
      );
    }
    if (msg.text === '계약이 체결되었습니다') {
      return (
        <p className={`${s.sys} ${tone}`}>
          <b>계약이 체결되었습니다</b>
          {' · 이제 연락처를 주고받을 수 있습니다.'}
        </p>
      );
    }
    return <p className={`${s.sys} ${tone}`}>{msg.text}</p>;
  }
  if (msg.kind === 'me') {
    return (
      <div className={`${s.m} ${s.me}`}>
        <p className={s.by}>나 · {msg.at}</p>
        <div className={s.bb}>
          <MaskedText text={msg.text} />
        </div>
      </div>
    );
  }
  return (
    <div className={`${s.m} ${flagged ? s.flag : ''}`}>
      <p className={s.by}>
        {name} · {msg.at}{' '}
        <button type="button" className={s.rp} title="이 메시지 신고" onClick={onReport}>
          신고
        </button>
      </p>
      <div className={s.bb}>
        <MaskedText text={msg.text} />
      </div>
    </div>
  );
}

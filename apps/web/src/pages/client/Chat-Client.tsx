/* 문의 채팅 — 보드 Chat-Client · /c/chat/:pid/:sid · M3
 * 상태: 문의 중 / 처음 문의 / 임시 계약 중 / 읽기 전용 / 이전 명세 기준 / 계약 체결 후 / 신고
 * 파란 버튼 없음. F-19 · F-24 · 디자인 시스템 9절 대화. */
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
import { useSession } from '@/app/session';
import { LiveChat } from './Chat-Client.live';
import {
  CONTRACT_HREF,
  DEMO,
  DEFAULT_PID,
  PROJECT_HREF,
  PROJECT_TITLE,
  REPORT_REASONS,
  agreementHref,
  chatDemoOf,
  chatHref,
  quoteModalHref,
  resolveChatMock,
  type CondTag,
  type Msg,
} from './Chat-Client.data';
import s from './Chat-Client.module.css';

export default function ChatClient() {
  const { apiAccessToken } = useSession();
  const { pid = DEFAULT_PID, sid } = useParams();
  const [params] = useSearchParams();
  const mock = resolveChatMock(params.get('mock'));
  const demo = chatDemoOf(mock, sid ?? null);

  const [draft, setDraft] = useState('');
  const [extra, setExtra] = useState<Msg[]>([]);
  const [flagged, setFlagged] = useState<Set<string>>(() => {
    const ids = demo.messages.flatMap((m) => (m.kind === 'them' && m.flagged ? [m.id] : []));
    return new Set(ids);
  });
  const [reportId, setReportId] = useState<string | null>(demo.reportOpen ? demo.reportTargetId : null);
  const [reason, setReason] = useState<string | null>(demo.reportOpen ? 'contact' : null);
  const [reportDesc, setReportDesc] = useState('');
  const inputId = useId();

  useEffect(() => {
    const next = chatDemoOf(mock, sid ?? null);
    setDraft('');
    setExtra([]);
    setFlagged(new Set(next.messages.flatMap((m) => (m.kind === 'them' && m.flagged ? [m.id] : []))));
    setReportId(next.reportOpen ? next.reportTargetId : null);
    setReason(next.reportOpen ? 'contact' : null);
    setReportDesc('');
  }, [mock, sid]);

  if (apiAccessToken.trim()) return <LiveChat pid={pid} sid={sid} />;

  const messages = [...demo.messages, ...extra];
  const activeSid = demo.person.sid;

  const send = (text: string) => {
    const body = text.trim();
    if (!body || demo.readOnly) return;
    const now = new Date();
    const at = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setExtra((list) => [...list, { kind: 'me', id: `local-${Date.now()}`, at, text: body }]);
    setDraft('');
  };

  const openReport = (id: string) => {
    setReportId(id);
    setReason('contact');
    setReportDesc('');
  };

  const closeReport = () => {
    setReportId(null);
    setReason(null);
    setReportDesc('');
  };

  const submitReport = () => {
    if (!reportId || !reason) return;
    setFlagged((prev) => new Set(prev).add(reportId));
    closeReport();
  };

  const reportMsg = messages.find((m) => m.kind === 'them' && m.id === reportId);

  return (
    <div className={s.page} data-screen="Chat-Client">
      <div className={s.ch}>
        <aside className={s.ls} aria-label="대화 목록">
          <div className={s.lh}>채팅</div>
          <div className={s.pj}>{PROJECT_TITLE}</div>
          {demo.list.map((c) => (
            <Link
              key={c.sid}
              className={`${s.it} ${c.sid === activeSid ? s.itOn : ''}`}
              to={chatHref(pid, c.sid, mock)}
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
                  <ListChip status={c.chip} />
                  {c.unread > 0 ? <span className={s.ub}>{c.unread}</span> : null}
                </span>
              </span>
            </Link>
          ))}
          <p className={s.listFoot}>{DEMO.listFoot}</p>
        </aside>

        <section className={s.cv} aria-label={`${demo.person.name}님과의 대화`}>
          <div className={s.cvh}>
            <div className={s.who}>
              <span className={s.whoAv} aria-hidden="true">
                {demo.person.ini}
              </span>
              <div>
                <div className={s.whoNm}>
                  {demo.person.name} <HeadChip status={demo.chip} />
                </div>
                <div className={s.whoMt}>
                  {demo.person.meta}
                  <span className={s.sep}>|</span>
                  <Link className={s.projLink} to={PROJECT_HREF}>
                    {PROJECT_TITLE}
                  </Link>
                </div>
              </div>
            </div>
            <div className={s.acts}>
              <Button variant="ghost" size="sm" to={quoteModalHref(pid, activeSid)}>
                견적서 보기
              </Button>
              {demo.canPick ? (
                <Button variant="tint" size="sm" to={agreementHref(pid, activeSid)}>
                  이 사람과 계약하기
                </Button>
              ) : null}
              {demo.stale ? (
                <Button variant="ghost" size="sm" disabled disabledReason={DEMO.staleDisabled}>
                  이 사람과 계약하기
                </Button>
              ) : null}
              {demo.showContract ? (
                <Button variant="tint" size="sm" to={CONTRACT_HREF}>
                  계약서 보기
                </Button>
              ) : null}
            </div>
          </div>

          {demo.stale ? (
            <div className={s.stl} role="status">
              <div>
                <b>{DEMO.staleTitle}</b>
                {DEMO.staleBody}
              </div>
            </div>
          ) : null}

          <div className={s.qbar} aria-label="지금 견적">
            <Attr label="지금 견적">{formatWon(demo.person.amount)}</Attr>
            <Attr label="기간">{demo.person.days}일</Attr>
            <Attr label="가능 항목">{demo.person.okLabel}</Attr>
          </div>

          <div className={s.cond}>
            <div className={s.condHead}>
              <p className={s.condK}>
                공급자와 정할 것 · 조건 {demo.nAll}건 중 {demo.nDone}건 정해짐
              </p>
              <p className={s.legend}>
                <span className={s.lgOk}>✓ 모두 정해짐 {demo.nOk}</span>
                <span className={s.lgPr}>● 정하는 중 {demo.nPr}</span>
                <span>아직 안 정함 {demo.nNo}</span>
                {demo.stamp ? <span className={s.lgTs}>{demo.stamp}</span> : null}
              </p>
            </div>
            <div className={s.tags}>
              {demo.tags.map((t) => (
                <TagPill key={t.fn} tag={t} />
              ))}
            </div>
            <p className={s.condHint}>{DEMO.condHint}</p>
          </div>

          <div className={s.msgs}>
            {demo.isNew ? (
              <div className={s.starter}>
                <p>
                  <b>{DEMO.starterLead}</b>
                  <br />
                  {DEMO.starterBody}
                </p>
                <div className={s.sugg}>
                  {DEMO.suggestions.map((q) => (
                    <button key={q} type="button" className={s.suggBtn} onClick={() => send(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((m, i) => (
              <MessageRow
                key={m.kind === 'me' || m.kind === 'them' ? m.id : `${m.kind}-${i}`}
                msg={m}
                name={demo.person.name}
                flagged={m.kind === 'them' && flagged.has(m.id)}
                onReport={m.kind === 'them' ? () => openReport(m.id) : undefined}
                quoteHref={quoteModalHref(pid, activeSid)}
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
                  placeholder={demo.placeholder}
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

      {reportId && reportMsg && reportMsg.kind === 'them' ? (
        <Modal
          title={DEMO.reportTitle}
          size="content"
          danger
          onClose={closeReport}
          actions={
            <>
              <Button variant="ghost" onClick={closeReport}>
                취소
              </Button>
              <Button
                variant="warn"
                disabled={!reason}
                disabledReason={!reason ? '사유를 골라 주세요' : undefined}
                onClick={submitReport}
              >
                신고하기
              </Button>
            </>
          }
        >
          <div className={s.reportQ}>
            <i>
              {demo.person.name} · 11월 3일 {reportMsg.at}
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

function ListChip({ status }: { status: string }) {
  if (status === '임시 계약 · 서명 대기' || status === '임시 계약') {
    return <Chip tone="amber">{status}</Chip>;
  }
  return <StatusChip status={status} />;
}

function HeadChip({ status }: { status: string }) {
  return <ListChip status={status} />;
}

function TagPill({ tag }: { tag: CondTag }) {
  const cls =
    tag.kind === 'ok' ? `${s.tag} ${s.tagOk}` : tag.kind === 'pr' ? `${s.tag} ${s.tagPr}` : `${s.tag} ${s.tagNo}`;
  const mark = tag.kind === 'ok' ? '✓' : tag.kind === 'pr' ? '●' : '';
  return (
    <span className={cls} title={tag.tip}>
      {mark ? <b>{mark}</b> : null}
      {tag.fn}
      <i>
        {tag.done}/{tag.total}
      </i>
    </span>
  );
}

function MessageRow({
  msg,
  name,
  flagged,
  onReport,
  quoteHref,
}: {
  msg: Msg;
  name: string;
  flagged?: boolean;
  onReport?: () => void;
  quoteHref: string;
}) {
  if (msg.kind === 'day') return <div className={s.day}>{msg.text}</div>;
  if (msg.kind === 'newline') return <div className={s.newline}>새 메시지</div>;
  if (msg.kind === 'sys') {
    const tone = msg.tone === 'chg' ? s.sysChg : msg.tone === 'ok' ? s.sysOk : '';
    return (
      <p className={`${s.sys} ${tone}`}>
        {msg.text.includes('견적을 고쳤습니다') ? (
          <>
            {msg.text}
            {' · '}
            <Link to={quoteHref}>견적서 보기</Link>
          </>
        ) : msg.text.includes('임시 계약') ? (
          <>
            <b>최종 합의 내용으로 임시 계약이 되었습니다</b>
            {' · 서명 기한 11월 10일'}
            <br />
            <Link to={CONTRACT_HREF}>계약서 보기</Link>
          </>
        ) : msg.tone === 'ok' && msg.text.includes('계약이 체결') ? (
          <>
            <b>계약이 체결되었습니다</b>
            {' · 이제 연락처를 주고받을 수 있습니다. 계약 전에 가려진 연락처는 그대로 가려져 있습니다.'}
          </>
        ) : (
          msg.text
        )}
      </p>
    );
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

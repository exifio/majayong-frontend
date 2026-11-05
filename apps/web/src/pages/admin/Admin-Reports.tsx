/* 신고 처리 — 보드 Admin-Reports · /admin/reports · M6
 * 상태: 처리 대기 / 조치 작성 / 처리 완료 / 계정 정지 선택
 * F-24. 선택은 ?id=. */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  Chip,
  ConfirmDialog,
  MaskedText,
  SelectCards,
  StatusChip,
  TextAreaField,
} from '@/components/ui';
import { AdminDemoNotice } from '@/components/admin/AdminDemoNotice';
import {
  ACTION_PREVIEWS,
  DEMO,
  defaultActionOf,
  defaultIdOf,
  listFor,
  reportOf,
  resolveReportMock,
  type ReportMock,
} from './Admin-Reports.data';
import s from './Admin-Reports.module.css';

const ACTION_OPTIONS = [
  {
    key: 'none',
    label: (
      <span>
        <b>조치 없음</b>
        <span>신고를 닫습니다</span>
      </span>
    ),
  },
  {
    key: 'warn',
    label: (
      <span>
        <b>경고</b>
        <span>규칙 안내와 함께 경고</span>
      </span>
    ),
  },
  {
    key: 'ban',
    label: (
      <span>
        <b>계정 정지</b>
        <span>로그인 불가 · 프로필 숨김</span>
      </span>
    ),
  },
];

export default function AdminReports() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveReportMock(params.get('mock'));
  const selectedId = params.get('id') ?? defaultIdOf(mock);
  const row = reportOf(selectedId);
  const rows = listFor(mock);
  const done = mock === '처리 완료' || row.status === '처리 완료';

  const [action, setAction] = useState(defaultActionOf(mock));
  const [reason, setReason] = useState(
    mock === '계정 정지 선택' ? DEMO.whyBan : mock === '조치 작성' || done ? DEMO.whyWarn : '',
  );
  const [banOpen, setBanOpen] = useState(mock === '계정 정지 선택');

  useEffect(() => {
    setAction(defaultActionOf(mock));
    setReason(
      mock === '계정 정지 선택' ? DEMO.whyBan : mock === '조치 작성' || mock === '처리 완료' ? DEMO.whyWarn : '',
    );
    setBanOpen(mock === '계정 정지 선택');
  }, [mock, params]);

  const go = (next: ReportMock, id = selectedId) => {
    const q = new URLSearchParams();
    q.set('mock', next);
    q.set('id', id);
    navigate(`/admin/reports?${q.toString()}`, { replace: true });
  };

  const select = (id: string) => {
    if (id === 'rp-done') go('처리 완료', id);
    else go(mock === '처리 완료' ? '처리 대기' : mock === '계정 정지 선택' ? '조치 작성' : mock, id);
  };

  const onPickAction = (key: string) => {
    setAction(key);
    if (key === 'ban') {
      if (!reason.trim()) setReason(DEMO.whyBan);
      go('계정 정지 선택', selectedId);
      setBanOpen(true);
    } else if (key === 'warn' || key === 'none') {
      setBanOpen(false);
      if (mock === '계정 정지 선택' || mock === '처리 대기') go('조치 작성', selectedId);
    }
  };

  const reasonOk = reason.trim().length > 0;
  const canConfirm = !!action && reasonOk;
  const showForm = !done;

  return (
    <div className={s.page} data-screen="Admin-Reports">
      <header className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
      </header>

      {mock === '조치 작성' || mock === '계정 정지 선택' || mock === '처리 완료' ? <AdminDemoNotice /> : null}

      <div className={s.grid}>
        <section aria-label={DEMO.listLabel}>
          <ul className={s.rows}>
            {rows.map((r) => {
              const on = r.id === row.id;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className={`${s.row} ${on ? s.rowOn : ''}`}
                    aria-current={on ? 'true' : undefined}
                    onClick={() => select(r.id)}
                  >
                    <div className={s.rowChips}>
                      <Chip tone="amber">{r.reason}</Chip>
                      <StatusChip status={r.status} />
                    </div>
                    <span className={s.rowName}>{r.title}</span>
                    <span className={s.rowMeta}>{r.whoLine}</span>
                    <span className={s.rowMeta}>{r.when}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className={s.detail} aria-label={DEMO.detailLabel}>
          {done && row.doneBand ? (
            <div className={s.bandWrap}>
              <Band tone="done" title={row.doneBand.title}>
                {row.doneBand.body}
              </Band>
            </div>
          ) : null}

          <div className={s.detailChips}>
            <Chip tone="amber">{row.reason}</Chip>
            <StatusChip status={row.status} />
            {row.actionDone ? <Chip tone="teal">{row.actionDone}</Chip> : null}
          </div>
          <h2 className={s.detailTitle}>
            {row.reporter.replace(/^의뢰인\s*/, '').replace(/\(.*\)/, '')} → {row.target}
          </h2>
          <p className={s.detailMeta}>{row.meta}</p>

          <div className={s.sec}>
            <p className={s.k}>신고 사유 · 신고한 사람</p>
            <p className={s.say}>
              <b>{row.reason}</b> — {row.reporter}
            </p>
            <p className={s.say}>{row.reportBody}</p>
            <div className={s.auto}>
              <Chip tone="neutral">시스템</Chip>
              <span>{row.autoNote}</span>
            </div>
          </div>

          <div className={s.sec}>
            <p className={s.k}>신고된 채팅 메시지 — 앞뒤 문맥만</p>
            <div className={s.msgs}>
              {row.messages.map((m) => (
                <div
                  key={`${m.who}-${m.when}`}
                  className={`${s.msg} ${m.hit ? s.msgHit : ''} ${m.sys ? s.msgSys : ''}`}
                >
                  <span className={s.msgWho}>
                    <b>{m.who}</b>
                    {m.when}
                  </span>
                  <div className={s.msgText}>
                    <MaskedText text={m.text} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={s.sec}>
            <p className={s.k}>대상 — {row.target}</p>
            <div className={s.kv}>
              {row.history.map((h) => (
                <div key={h.k}>
                  <span>{h.k}</span>
                  <b>{h.v}</b>
                </div>
              ))}
            </div>
          </div>

          {showForm ? (
            <div className={s.sec}>
              <p className={s.k}>{DEMO.actionLabel}</p>
              <div className={s.actions}>
                <SelectCards
                  label={DEMO.actionLabel}
                  options={ACTION_OPTIONS}
                  value={action || null}
                  onChange={onPickAction}
                  danger={action === 'ban'}
                />
              </div>
              <p className={s.preview}>
                {action ? ACTION_PREVIEWS[action] : '조치를 고르면 무엇이 바뀌는지 여기에 보입니다.'}
              </p>
              <TextAreaField
                label={DEMO.reasonLabel}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="어떤 메시지가 어떤 규칙에 해당하는지 적어 주세요."
              />
              <div className={s.foot}>
                <p className={s.eventNote}>{DEMO.eventNote}</p>
                {action === 'ban' ? (
                  <Button
                    variant="warn"
                    type="button"
                    disabled={!canConfirm}
                    disabledReason={!canConfirm ? DEMO.reasonNeed : undefined}
                    onClick={() => {
                      setBanOpen(true);
                      go('계정 정지 선택', selectedId);
                    }}
                  >
                    {DEMO.banConfirm}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    type="button"
                    disabled={!canConfirm}
                    disabledReason={!canConfirm ? DEMO.reasonNeed : undefined}
                    onClick={() => go('처리 완료', 'rp-done')}
                  >
                    {DEMO.confirm}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className={s.foot}>
              <p className={s.eventNote}>{DEMO.eventNote}</p>
              <Button variant="ghost" size="sm" to="/admin/events">
                이벤트 기록 보기
              </Button>
            </div>
          )}
        </aside>
      </div>

      {banOpen ? (
        <ConfirmDialog
          title={DEMO.banTitle}
          confirmLabel={DEMO.banConfirm}
          danger
          onCancel={() => {
            setBanOpen(false);
            go('조치 작성', selectedId);
          }}
          onConfirm={() => {
            setBanOpen(false);
            go('처리 완료', 'rp-done');
          }}
        >
          <p>{DEMO.banBody}</p>
          <p className={s.banNote}>{DEMO.eventNote}</p>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

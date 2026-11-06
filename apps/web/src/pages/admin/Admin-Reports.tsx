/* 신고 처리 — 보드 Admin-Reports · /admin/reports · M6
 * 운영자만 접근. GET /admin/reports, POST /admin/reports/{id}/resolve */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AdminReportDto, ApiReportAction, ApiReportReason } from '@majayong/types/api';
import {
  Band,
  Button,
  Chip,
  ConfirmDialog,
  EmptyState,
  MaskedText,
  SelectCards,
  StatusChip,
  TextAreaField,
} from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import s from './Admin-Reports.module.css';

const PAGE = {
  title: '신고 처리',
  sub: '채팅에서 들어온 신고를 봅니다. 근거가 되는 메시지는 앞뒤 문맥만 보여 주고, 조치는 운영자가 사유와 함께 정합니다.',
  listLabel: '신고 목록',
  detailLabel: '신고 상세',
  confirm: '조치 확정',
  banConfirm: '계정 정지 확정',
  reasonLabel: '조치 사유',
  reasonNeed: '사유를 적어 주세요',
  eventNote: '이 처리는 이벤트 기록에 남습니다',
  actionLabel: '조치',
  banTitle: '계정을 정지할까요?',
  banBody:
    '로그인할 수 없고 공개 프로필이 숨겨집니다. 진행 중인 계약은 운영자가 따로 취소 정산합니다. 신고자 정보는 상대에게 알리지 않습니다.',
  loadError: '신고 목록을 불러오지 못했습니다. 다시 시도해 주세요.',
  saveError: '신고 처리를 저장하지 못했습니다. 다시 시도해 주세요.',
  empty: '신고가 없습니다',
  emptyBody: '처리할 신고가 들어오면 여기에 표시됩니다.',
  saving: '저장 중',
} as const;

const REASON_LABEL: Record<ApiReportReason, string> = {
  CONTACT_OR_OFFSITE: '연락처 · 외부 거래 유도',
  ABUSE: '욕설 · 비방',
  FALSE_INFO: '거짓 정보',
  OTHER: '기타',
};

const ACTION_LABEL: Record<ApiReportAction, string> = {
  NONE: '조치 없음',
  WARNING: '경고',
  CHAT_RESTRICT_7D: '채팅 제한 7일',
  SUSPEND: '계정 정지',
};

const ROLE_LABEL = {
  CLIENT: '의뢰인',
  SUPPLIER: '공급자',
  ADMIN: '운영자',
} as const;

type ResolveAction = Extract<ApiReportAction, 'NONE' | 'WARNING' | 'SUSPEND'>;
type LoadState = 'loading' | 'ready' | 'error';

const ACTION_OPTIONS = [
  {
    key: 'NONE',
    label: (
      <span>
        <b>조치 없음</b>
        <span>신고를 닫습니다</span>
      </span>
    ),
  },
  {
    key: 'WARNING',
    label: (
      <span>
        <b>경고</b>
        <span>규칙 안내와 함께 경고</span>
      </span>
    ),
  },
  {
    key: 'SUSPEND',
    label: (
      <span>
        <b>계정 정지</b>
        <span>로그인 불가 · 프로필 숨김</span>
      </span>
    ),
  },
];

const ACTION_PREVIEWS: Record<ResolveAction, string> = {
  NONE: "신고를 닫고 신고자에게 '검토 완료'를 알립니다.",
  WARNING: '대상에게 경고와 규칙 안내를 보냅니다. 경고 2회가 쌓이면 채팅 제한을 검토합니다.',
  SUSPEND: '로그인할 수 없고 공개 프로필이 숨겨집니다. 진행 중인 계약은 운영자가 따로 취소 정산합니다.',
};

function partyLabel(party: AdminReportDto['reporter']): string {
  return `${ROLE_LABEL[party.role]} ${party.displayName ?? '이름 미등록'}`;
}

export default function AdminReports() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<LoadState>('loading');
  const [rows, setRows] = useState<AdminReportDto[]>([]);
  const [action, setAction] = useState<ResolveAction | ''>('');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [banOpen, setBanOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    apiRequest('listReports', '/admin/reports', {
      accessToken: apiAccessToken,
      signal: controller.signal,
    })
      .then((response) => {
        setRows(response.data);
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken]);

  const ordered = useMemo(
    () => [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [rows],
  );
  const selected = ordered.find((row) => row.id === params.get('id')) ?? ordered[0] ?? null;
  const done = selected?.status === 'RESOLVED';

  useEffect(() => {
    setAction('');
    setReason('');
    setTried(false);
    setNotice(null);
    setError(null);
    setBanOpen(false);
  }, [selected?.id]);

  const select = (id: string) => {
    navigate(`/admin/reports?id=${encodeURIComponent(id)}`);
  };

  const canConfirm = action.length > 0 && reason.trim().length > 0;

  const resolve = async () => {
    if (!selected || !action) return;
    setTried(true);
    setNotice(null);
    setError(null);
    if (!canConfirm) return;
    setBusy(true);
    try {
      const response = await apiRequest(
        'resolveReport',
        `/admin/reports/${encodeURIComponent(selected.id)}/resolve`,
        {
          method: 'POST',
          accessToken: apiAccessToken,
          jsonBody: { action, actionNote: reason.trim() },
        },
      );
      setRows((current) =>
        current.map((row) =>
          row.id === selected.id ? { ...row, ...response.data.report } : row,
        ),
      );
      setBanOpen(false);
      setNotice('신고 처리를 저장했습니다.');
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : PAGE.saveError);
    } finally {
      setBusy(false);
    }
  };

  const confirm = () => {
    if (action === 'SUSPEND') {
      setBanOpen(true);
      return;
    }
    void resolve();
  };

  return (
    <div className={s.page} data-screen="Admin-Reports">
      <header className={s.head}>
        <h1 className={s.title}>{PAGE.title}</h1>
        <p className={s.sub}>{PAGE.sub}</p>
      </header>

      {state === 'loading' ? (
        <p role="status" className={s.rowMeta}>
          신고 목록을 불러오는 중입니다.
        </p>
      ) : null}
      {state === 'error' ? (
        <p role="alert" className={s.rowMeta}>
          {PAGE.loadError}
        </p>
      ) : null}
      {state === 'ready' && ordered.length === 0 ? (
        <EmptyState title={PAGE.empty}>{PAGE.emptyBody}</EmptyState>
      ) : null}

      {state === 'ready' && selected ? (
        <div className={s.grid}>
          <section aria-label={PAGE.listLabel}>
            <ul className={s.rows}>
              {ordered.map((row) => {
                const on = row.id === selected.id;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      className={`${s.row} ${on ? s.rowOn : ''}`}
                      aria-current={on ? 'true' : undefined}
                      onClick={() => select(row.id)}
                    >
                      <div className={s.rowChips}>
                        <Chip tone="amber">{REASON_LABEL[row.reason]}</Chip>
                        <StatusChip status={row.status} />
                      </div>
                      <span className={s.rowName}>{row.message.projectTitle}</span>
                      <span className={s.rowMeta}>
                        {partyLabel(row.reporter)} → {partyLabel(row.target)}
                      </span>
                      <span className={s.rowMeta}>{formatDateTime(row.createdAt)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className={s.detail} aria-label={PAGE.detailLabel}>
            {done ? (
              <div className={s.bandWrap}>
                <Band
                  tone="done"
                  title={`처리 완료 · ${selected.resolvedAt ? formatDateTime(selected.resolvedAt) : ''}`}
                >
                  {selected.action ? `조치: ${ACTION_LABEL[selected.action]}` : ''}
                  {selected.actionNote ? ` · ${selected.actionNote}` : ''}
                </Band>
              </div>
            ) : null}

            <div className={s.detailChips}>
              <Chip tone="amber">{REASON_LABEL[selected.reason]}</Chip>
              <StatusChip status={selected.status} />
              {selected.action ? <Chip tone="teal">{ACTION_LABEL[selected.action]}</Chip> : null}
            </div>
            <h2 className={s.detailTitle}>
              {partyLabel(selected.reporter)} → {partyLabel(selected.target)}
            </h2>
            <p className={s.detailMeta}>
              {selected.message.projectTitle} · 신고 {formatDateTime(selected.createdAt)}
            </p>

            <div className={s.sec}>
              <p className={s.k}>신고 사유 · 신고한 사람</p>
              <p className={s.say}>
                <b>{REASON_LABEL[selected.reason]}</b> — {partyLabel(selected.reporter)}
              </p>
              <p className={s.say}>{selected.detail ?? '추가 설명 없음'}</p>
            </div>

            <div className={s.sec}>
              <p className={s.k}>신고된 채팅 메시지</p>
              <div className={s.msgs}>
                <div className={`${s.msg} ${s.msgHit}`}>
                  <span className={s.msgWho}>
                    <b>{partyLabel(selected.target)}</b>
                    {formatDateTime(selected.message.createdAt)}
                  </span>
                  <div className={s.msgText}>
                    <MaskedText text={selected.message.body} />
                  </div>
                </div>
              </div>
            </div>

            <div className={s.sec}>
              <p className={s.k}>대상 — {partyLabel(selected.target)}</p>
              <div className={s.kv}>
                <div>
                  <span>신고자</span>
                  <b>{partyLabel(selected.reporter)}</b>
                </div>
                <div>
                  <span>신고 접수</span>
                  <b>{formatDateTime(selected.createdAt)}</b>
                </div>
              </div>
            </div>

            {done ? (
              <div className={s.foot}>
                <p className={s.eventNote}>{PAGE.eventNote}</p>
                <Button variant="ghost" size="sm" to="/admin/events">
                  이벤트 기록 보기
                </Button>
              </div>
            ) : (
              <div className={s.sec}>
                <p className={s.k}>{PAGE.actionLabel}</p>
                <div className={s.actions}>
                  <SelectCards
                    label={PAGE.actionLabel}
                    options={ACTION_OPTIONS}
                    value={action || null}
                    onChange={(key) => setAction(key as ResolveAction)}
                    danger={action === 'SUSPEND'}
                  />
                </div>
                <p className={s.preview}>
                  {action
                    ? ACTION_PREVIEWS[action]
                    : '조치를 고르면 무엇이 바뀌는지 여기에 보입니다.'}
                </p>
                <TextAreaField
                  label={PAGE.reasonLabel}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  error={tried && !reason.trim() ? PAGE.reasonNeed : undefined}
                  placeholder="어떤 메시지가 어떤 규칙에 해당하는지 적어 주세요."
                />
                {notice ? <p role="status">{notice}</p> : null}
                {error ? (
                  <p role="alert" className={s.rowMeta}>
                    {error}
                  </p>
                ) : null}
                <div className={s.foot}>
                  <p className={s.eventNote}>{PAGE.eventNote}</p>
                  <Button
                    variant={action === 'SUSPEND' ? 'warn' : 'primary'}
                    type="button"
                    disabled={!canConfirm || busy}
                    disabledReason={
                      busy ? PAGE.saving : !canConfirm ? PAGE.reasonNeed : undefined
                    }
                    onClick={confirm}
                  >
                    {busy ? PAGE.saving : action === 'SUSPEND' ? PAGE.banConfirm : PAGE.confirm}
                  </Button>
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : null}

      {banOpen ? (
        <ConfirmDialog
          title={PAGE.banTitle}
          confirmLabel={PAGE.banConfirm}
          danger
          onCancel={() => setBanOpen(false)}
          onConfirm={() => void resolve()}
        >
          <p>{PAGE.banBody}</p>
          <p className={s.banNote}>{PAGE.eventNote}</p>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

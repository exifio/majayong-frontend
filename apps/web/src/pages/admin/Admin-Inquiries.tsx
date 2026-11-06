/* 1:1 문의 — 보드 Admin-Inquiries · /admin/inquiries · M6
 * 운영자만 접근. GET /admin/support/inquiries, POST /admin/support/inquiries/{id}/answer */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ApiInquiryStatus, InquiryDto } from '@majayong/types/api';
import { LoadingState, Band, Button, Chip, EmptyState, Tabs, TextAreaField } from '@/components/ui';
import { useSession } from '@/app/session';
import { useSetAdminInquiryCount } from '@/components/layout/Shell';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { AttachmentLink } from '@/components/attachments/AttachmentLink';
import { formatDateTime } from '@/lib/format';
import { CATEGORY_LABEL, STATUS_LABEL } from '@/pages/public/Help-Inquiry.data';
import s from './Admin-Inquiries.module.css';

type LoadState = 'loading' | 'ready' | 'error';
type Filter = 'ALL' | ApiInquiryStatus;

const PAGE = {
  title: '1:1 문의',
  sub: '사용자가 보낸 문의를 확인하고 답변합니다. 답변은 사용자 알림과 내 문의에 표시됩니다.',
  filterLabel: '답변 상태',
  empty: '문의가 없습니다',
  emptyBody: '선택한 상태의 문의가 없습니다.',
  detailTitle: '문의 내용',
  answerLabel: '답변',
  submit: '답변 등록',
  submitting: '등록 중',
  required: '답변 내용을 입력해 주세요',
  done: '답변을 등록했습니다.',
  error: '문의를 처리하지 못했습니다. 다시 시도해 주세요.',
  answered: '등록된 답변',
} as const;

export default function AdminInquiries() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { apiAccessToken } = useSession();
  const setAdminInquiryCount = useSetAdminInquiryCount();
  const [state, setState] = useState<LoadState>('loading');
  const [rows, setRows] = useState<InquiryDto[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [answer, setAnswer] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    setAdminInquiryCount?.(null);
    apiRequest('listAdminInquiries', '/admin/support/inquiries', {
      accessToken: apiAccessToken,
      signal: controller.signal,
    })
      .then((response) => {
        setRows(response.data);
        setAdminInquiryCount?.(response.data.filter((row) => row.status === 'WAITING').length);
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setAdminInquiryCount?.(null);
        setState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken, setAdminInquiryCount]);

  const shown = useMemo(
    () => (filter === 'ALL' ? rows : rows.filter((row) => row.status === filter)),
    [rows, filter],
  );
  const selected = rows.find((row) => row.id === params.get('id')) ?? shown[0] ?? null;

  const select = (id: string) => {
    navigate(`/admin/inquiries?id=${encodeURIComponent(id)}`);
    setAnswer('');
    setTried(false);
    setNotice(null);
    setError(null);
  };

  const submit = async () => {
    setTried(true);
    setNotice(null);
    setError(null);
    if (!selected || !answer.trim()) return;
    setBusy(true);
    try {
      const response = await apiRequest('answerInquiry', `/admin/support/inquiries/${encodeURIComponent(selected.id)}/answer`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { answer: answer.trim() },
      });
      const updatedRows = rows.map((row) => (row.id === response.data.id ? response.data : row));
      setRows(updatedRows);
      setAdminInquiryCount?.(updatedRows.filter((row) => row.status === 'WAITING').length);
      setAnswer('');
      setNotice(PAGE.done);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : PAGE.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.page} data-screen="Admin-Inquiries">
      <div className={s.head}>
        <h1 className={s.title}>{PAGE.title}</h1>
        <p className={s.sub}>{PAGE.sub}</p>
      </div>

      <Tabs
        kind="underline"
        label={PAGE.filterLabel}
        value={filter}
        items={[
          { key: 'ALL', label: '전체' },
          { key: 'WAITING', label: STATUS_LABEL.WAITING },
          { key: 'ANSWERED', label: STATUS_LABEL.ANSWERED },
        ]}
        onChange={(key) => setFilter(key as Filter)}
      />

      {state === 'loading' ? <LoadingState label="문의를 불러오는 중입니다." /> : null}
      {state === 'error' ? <p role="alert" className={s.state}>{PAGE.error}</p> : null}

      {state === 'ready' && shown.length === 0 ? (
        <EmptyState title={PAGE.empty}>{PAGE.emptyBody}</EmptyState>
      ) : null}

      {state === 'ready' && shown.length > 0 ? (
        <div className={s.grid}>
          <ul className={s.rows} aria-label="문의 목록">
            {shown.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className={`${s.row} ${selected?.id === row.id ? s.rowOn : ''}`}
                  aria-current={selected?.id === row.id}
                  onClick={() => select(row.id)}
                >
                  <span className={s.rowTitle}>{row.title}</span>
                  <span className={s.rowMeta}>{CATEGORY_LABEL[row.category]}</span>
                  <Chip tone={row.status === 'ANSWERED' ? 'teal' : 'amber'}>{STATUS_LABEL[row.status]}</Chip>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <section className={s.detail} aria-label={PAGE.detailTitle}>
              <div className={s.detailHead}>
                <h2 className={s.detailTitle}>{selected.title}</h2>
                <Chip tone={selected.status === 'ANSWERED' ? 'teal' : 'amber'}>
                  {STATUS_LABEL[selected.status]}
                </Chip>
              </div>
              <p className={s.detailMeta}>
                {CATEGORY_LABEL[selected.category]} · {formatDateTime(selected.createdAt)}
              </p>
              <p className={s.bodyText}>{selected.body}</p>
              {selected.attachments.length > 0 ? (
                <div>
                  <p className={s.attachLabel}>첨부 파일</p>
                  <ul className={s.attachList}>
                    {selected.attachments.map((attachment, index) => (
                      <li key={attachment.fileId ?? `${attachment.url}-${index}`} className={s.attachItem}>
                        {attachment.fileId ? (
                          <AttachmentLink
                            fileId={attachment.fileId}
                            name={attachment.name}
                            accessToken={apiAccessToken}
                            className={s.attachLink}
                          />
                        ) : (
                          <span>{attachment.name}</span>
                        )}
                        <span className={s.detailMeta}>{Math.ceil(attachment.size / 1024)}KB</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {selected.answer ? (
                <div className={s.answered}>
                  <h3 className={s.answerTitle}>{PAGE.answered}</h3>
                  <p className={s.bodyText}>{selected.answer}</p>
                </div>
              ) : (
                <>
                  <TextAreaField
                    label={PAGE.answerLabel}
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    error={tried && !answer.trim() ? PAGE.required : undefined}
                  />
                  {notice ? <Band tone="done" title={PAGE.done}>{PAGE.done}</Band> : null}
                  {error ? <p className={s.error} role="alert">{error}</p> : null}
                  <div className={s.actions}>
                    <Button
                      variant="primary"
                      type="button"
                      disabled={busy}
                      disabledReason={busy ? '답변을 등록하는 중입니다' : undefined}
                      onClick={() => void submit()}
                    >
                      {busy ? PAGE.submitting : PAGE.submit}
                    </Button>
                  </div>
                </>
              )}
              {selected.answer && notice ? <p className={s.notice} role="status">{notice}</p> : null}
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

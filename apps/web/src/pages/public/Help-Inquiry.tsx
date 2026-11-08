/* 1:1 문의 — 작성·내 문의·상세. 실제 /support/inquiries API만 사용한다. */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ApiInquiryCategory, CreateInquiryAttachmentDto, InquiryDto, UpToThree } from '@majayong/types/api';
import { LoadingState, Band, Button, Chip, EmptyState, Tabs, TextAreaField, TextField } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { AttachmentLink } from '@/components/attachments/AttachmentLink';
import { ALLOWED_UPLOAD_EXTENSION, uploadWithPresign } from '@/lib/attachments';
import { CATEGORIES, CATEGORY_LABEL, PAGE, STATUS_LABEL } from './Help-Inquiry.data';
import s from './Help-Inquiry.module.css';

type LoadState = 'loading' | 'ready' | 'error';
type Tab = 'write' | 'mine';

const MAX_FILES = 3;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
function toAttachmentTuple(items: CreateInquiryAttachmentDto[]): UpToThree<CreateInquiryAttachmentDto> | undefined {
  const [first, second, third] = items;
  if (items.length === 0 || first === undefined) return undefined;
  if (second === undefined) return [first];
  if (third === undefined) return [first, second];
  return [first, second, third];
}

export default function HelpInquiry() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, apiAccessToken } = useSession();
  const tab: Tab = params.get('tab') === 'mine' || params.get('tab') === 'my' ? 'mine' : 'write';
  const detailId = params.get('id');

  const [category, setCategory] = useState<ApiInquiryCategory>('USAGE');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [listState, setListState] = useState<LoadState>('loading');
  const [inquiries, setInquiries] = useState<InquiryDto[]>([]);
  const [detail, setDetail] = useState<InquiryDto | null>(null);

  const isUser = session.status === 'user';

  const loadList = useCallback(() => {
    if (!isUser) return;
    const controller = new AbortController();
    setListState('loading');
    apiRequest('listMyInquiries', '/support/inquiries', { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        setInquiries(response.data);
        setListState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setListState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken, isUser]);

  useEffect(() => {
    if (tab !== 'mine') return;
    return loadList();
  }, [tab, loadList]);

  useEffect(() => {
    if (tab !== 'mine' || !detailId || !isUser) return;
    const controller = new AbortController();
    apiRequest('getInquiry', `/support/inquiries/${encodeURIComponent(detailId)}`, {
      accessToken: apiAccessToken,
      signal: controller.signal,
    })
      .then((response) => setDetail(response.data))
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setListState('error');
      });
    return () => controller.abort();
  }, [tab, detailId, isUser, apiAccessToken]);

  if (!isUser) {
    return (
      <div className={s.page} data-screen="Help-Inquiry">
        <h1 className={s.title}>{PAGE.title}</h1>
        <p className={s.sub}>{PAGE.sub}</p>
        <section className={s.card}>
          <h2 className={s.secTitle}>{PAGE.guestTitle}</h2>
          <p className={s.bodyText}>{PAGE.guestBody}</p>
          <Button variant="primary" to={PAGE.loginHref}>{PAGE.login}</Button>
        </section>
      </div>
    );
  }

  const chooseFiles = (list: FileList | null) => {
    setFileError(null);
    if (list === null) return;
    const next = [...list];
    if (files.length + next.length > MAX_FILES) {
      setFileError(PAGE.attachLimit);
      return;
    }
    for (const file of next) {
      if (file.size > MAX_FILE_BYTES) {
        setFileError(PAGE.attachSize);
        return;
      }
      if (!ALLOWED_UPLOAD_EXTENSION.test(file.name)) {
        setFileError(PAGE.attachType);
        return;
      }
    }
    setFiles([...files, ...next]);
  };

  const submit = async () => {
    setTried(true);
    setError(null);
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    try {
      const uploaded: CreateInquiryAttachmentDto[] = [];
      for (const file of files) {
        const done = await uploadWithPresign(file, { purpose: 'SUPPORT_INQUIRY' }, apiAccessToken);
        uploaded.push({ fileId: done.fileId, name: done.name, size: done.size });
      }
      const attachments = toAttachmentTuple(uploaded);
      await apiRequest('createInquiry', '/support/inquiries', {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: {
          category,
          title: title.trim(),
          body: body.trim(),
          ...(attachments === undefined ? {} : { attachments }),
        },
      });
      setSent(true);
      setTitle('');
      setBody('');
      setFiles([]);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : PAGE.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.page} data-screen="Help-Inquiry">
      <h1 className={s.title}>{PAGE.title}</h1>
      <p className={s.sub}>{PAGE.sub}</p>

      <Tabs
        kind="underline"
        label="문의 보기"
        value={tab}
        items={[{ key: 'write', label: PAGE.tabWrite }, { key: 'mine', label: PAGE.tabMine }]}
        onChange={(key) => navigate(key === 'mine' ? '/help/inquiry?tab=mine' : '/help/inquiry')}
      />

      {tab === 'write' ? (
        sent ? (
          <section className={s.card}>
            <Band tone="done" title={PAGE.sentTitle}>{PAGE.sentBody}</Band>
            <div className={s.actions}>
              <Button variant="primary" to="/help/inquiry?tab=mine">{PAGE.mine}</Button>
            </div>
          </section>
        ) : (
          <section className={s.card}>
            <p className={s.label}>{PAGE.typeLabel}</p>
            <div className={s.types} role="radiogroup" aria-label={PAGE.typeLabel}>
              {CATEGORIES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="radio"
                  aria-checked={category === item.key}
                  className={`${s.typeChip} ${category === item.key ? s.typeOn : ''}`}
                  onClick={() => setCategory(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <TextField
              label={PAGE.titleLabel}
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={tried && !title.trim() ? PAGE.required : undefined}
            />
            <TextAreaField
              label={PAGE.bodyLabel}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
            <div className={s.field}>
              <label className={s.label} htmlFor="inquiry-attachments">{PAGE.attachLabel}</label>
              <input
                id="inquiry-attachments"
                className={s.fileInput}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.webp,.pdf,.zip,.mp4,.txt"
                disabled={busy}
                onChange={(event) => {
                  chooseFiles(event.target.files);
                  event.target.value = '';
                }}
              />
              <p className={s.rowMeta}>{PAGE.attachHint}</p>
              {files.length > 0 ? (
                <ul className={s.attachList}>
                  {files.map((file, index) => (
                    <li key={`${file.name}-${index}`} className={s.attachItem}>
                      <span>{file.name}</span>
                      <button
                        type="button"
                        className={s.attachRemove}
                        onClick={() => setFiles(files.filter((_, current) => current !== index))}
                      >
                        {PAGE.attachRemove}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {fileError ? <p className={s.error} role="alert">{fileError}</p> : null}
            </div>
            {error ? <p className={s.error} role="alert">{error}</p> : null}
            <div className={s.actions}>
              <Button
                variant="primary"
                type="button"
                disabled={busy}
                disabledReason={busy ? '문의를 보내는 중입니다' : undefined}
                onClick={() => void submit()}
              >
                {busy ? PAGE.submitting : PAGE.submit}
              </Button>
            </div>
          </section>
        )
      ) : null}

      {tab === 'mine' ? (
        <section className={s.card} aria-label={PAGE.tabMine}>
          {detail ? (
            <InquiryDetail inquiry={detail} accessToken={apiAccessToken} />
          ) : listState === 'loading' ? (
            <LoadingState label="문의를 불러오는 중입니다." />
          ) : listState === 'error' ? (
            <p role="alert" className={s.state}>{PAGE.error}</p>
          ) : inquiries.length === 0 ? (
            <EmptyState title={PAGE.empty}>{PAGE.emptyBody}</EmptyState>
          ) : (
            <ul className={s.list}>
              {inquiries.map((inquiry) => (
                <li key={inquiry.id} className={s.row}>
                  <Link to={`/help/inquiry?tab=mine&id=${encodeURIComponent(inquiry.id)}`} className={s.rowTitle}>
                    {inquiry.title}
                  </Link>
                  <span className={s.rowMeta}>{CATEGORY_LABEL[inquiry.category]}</span>
                  <Chip tone={inquiry.status === 'ANSWERED' ? 'teal' : 'neutral'}>
                    {STATUS_LABEL[inquiry.status]}
                  </Chip>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}

function InquiryDetail({ inquiry, accessToken }: { inquiry: InquiryDto; accessToken: string }) {
  return (
    <article className={s.detail}>
      <div className={s.detailHead}>
        <h2 className={s.secTitle}>{inquiry.title}</h2>
        <Chip tone={inquiry.status === 'ANSWERED' ? 'teal' : 'neutral'}>
          {STATUS_LABEL[inquiry.status]}
        </Chip>
      </div>
      <p className={s.rowMeta}>{CATEGORY_LABEL[inquiry.category]}</p>
      <p className={s.bodyText}>{inquiry.body}</p>
      {inquiry.attachments.length > 0 ? (
        <div>
          <p className={s.label}>{PAGE.attachments}</p>
          <ul className={s.attachList}>
            {inquiry.attachments.map((attachment, index) => (
              <li key={attachment.fileId ?? `${attachment.url}-${index}`} className={s.attachItem}>
                {attachment.fileId ? (
                  <AttachmentLink
                    fileId={attachment.fileId}
                    name={attachment.name}
                    accessToken={accessToken}
                    className={s.attachLink}
                  />
                ) : (
                  <span>{attachment.name}</span>
                )}
                <span className={s.rowMeta}>{Math.ceil(attachment.size / 1024)}KB</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <h3 className={s.answerTitle}>{PAGE.answer}</h3>
      {inquiry.answer ? (
        <p className={s.bodyText}>{inquiry.answer}</p>
      ) : (
        <p className={s.bodyText}>{PAGE.waiting}</p>
      )}
      <Link to="/help/inquiry?tab=mine" className={s.back}>{PAGE.back}</Link>
    </article>
  );
}

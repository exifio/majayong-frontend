/* 1:1 문의 — 작성·내 문의·상세. 실제 /support/inquiries API만 사용한다. */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ApiInquiryCategory, InquiryDto } from '@majayong/types/api';
import { Band, Button, Chip, EmptyState, Tabs, TextAreaField, TextField } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { CATEGORIES, CATEGORY_LABEL, PAGE, STATUS_LABEL } from './Help-Inquiry.data';
import s from './Help-Inquiry.module.css';

type LoadState = 'loading' | 'ready' | 'error';
type Tab = 'write' | 'mine';

export default function HelpInquiry() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, apiAccessToken } = useSession();
  const tab: Tab = params.get('tab') === 'mine' || params.get('tab') === 'my' ? 'mine' : 'write';
  const detailId = params.get('id');

  const [category, setCategory] = useState<ApiInquiryCategory>('USAGE');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
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

  const submit = async () => {
    setTried(true);
    setError(null);
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    try {
      await apiRequest('createInquiry', '/support/inquiries', {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { category, title: title.trim(), body: body.trim() },
      });
      setSent(true);
      setTitle('');
      setBody('');
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
            <InquiryDetail inquiry={detail} />
          ) : listState === 'loading' ? (
            <p role="status" className={s.state}>문의를 불러오는 중입니다.</p>
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

function InquiryDetail({ inquiry }: { inquiry: InquiryDto }) {
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

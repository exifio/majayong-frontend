/* 고객센터 — 보드 Help · /help · /help/inquiry · M6
 * 상태: 자주 묻는 질문 / 검색 결과(?q=) / 1:1 문의 작성 / 문의 보냄
 * F-25 · 결정메모 #6 · #11(내 문의 목록 없음). */
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  EmptyState,
  Tabs,
  TextAreaField,
  TextField,
} from '@/components/ui';
import {
  DEMO,
  FAQS,
  resolveHelpMock,
  searchFaqs,
  type HelpMock,
} from './Help.data';
import s from './Help.module.css';

export default function Help() {
  const [params] = useSearchParams();
  const loc = useLocation();
  const navigate = useNavigate();
  const qParam = params.get('q');
  const mock: HelpMock = resolveHelpMock(params.get('mock'), loc.pathname, qParam);

  const [query, setQuery] = useState(
    mock === '검색 결과' ? qParam?.trim() || '환불' : qParam ?? '',
  );
  const [cat, setCat] = useState('전체');
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id ?? null);
  const [inqType, setInqType] = useState<string>(DEMO.types[1]);
  const [inqTitle, setInqTitle] = useState<string>(DEMO.titleValue);
  const [inqBody, setInqBody] = useState<string>(DEMO.bodyValue);

  const isSearch = mock === '검색 결과';
  const isForm = mock === '1:1 문의 작성';
  const isSent = mock === '문의 보냄';

  const searchResults = useMemo(
    () => (isSearch ? searchFaqs(query || '환불') : []),
    [isSearch, query],
  );

  const faqList = useMemo(() => {
    if (isSearch) return searchResults;
    if (cat === '전체') return FAQS;
    return FAQS.filter((f) => f.cat === cat);
  }, [isSearch, searchResults, cat]);

  const runSearch = () => {
    const q = query.trim();
    if (!q) {
      navigate('/help');
      return;
    }
    navigate(`/help?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className={s.page} data-screen="Help">
      <section className={s.hero} aria-labelledby="help-h">
        <h1 id="help-h" className={s.title}>
          {DEMO.title}
        </h1>
        <p className={s.sub}>{DEMO.sub}</p>
        <form
          className={s.search}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
        >
          <input
            type="search"
            aria-label={DEMO.searchLabel}
            placeholder={DEMO.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="ghost" type="submit">
            {DEMO.searchBtn}
          </Button>
        </form>
        <div className={s.quick}>
          <span>{DEMO.quickLabel}</span>
          {DEMO.quick.map((item) => (
            <button
              key={item}
              type="button"
              className={s.quickLink}
              onClick={() => {
                setQuery(item);
                navigate(`/help?q=${encodeURIComponent(item)}`);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className={s.layout}>
        <div className={s.main}>
          {isSent ? (
            <Band tone="done" title={DEMO.sentBandTitle}>
              {DEMO.sentBandBody}
            </Band>
          ) : null}

          {isForm ? (
            <section className={s.card} aria-labelledby="hc-ask">
              <h2 id="hc-ask" className={s.secTitle}>
                {DEMO.formTitle}
              </h2>
              <p className={s.lbl}>{DEMO.typeLabel}</p>
              <div className={s.types} role="radiogroup" aria-label={DEMO.typeLabel}>
                {DEMO.types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={inqType === t}
                    className={`${s.typeChip} ${inqType === t ? s.typeOn : ''}`}
                    onClick={() => setInqType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <TextField
                label={DEMO.titleLabel}
                value={inqTitle}
                onChange={(e) => setInqTitle(e.target.value)}
              />
              <TextAreaField
                label={DEMO.bodyLabel}
                value={inqBody}
                onChange={(e) => setInqBody(e.target.value)}
              />
              <p className={s.formNote}>{DEMO.formNote}</p>
              <div className={s.formActions}>
                <Button variant="ghost" to={DEMO.cancelHref}>
                  {DEMO.cancel}
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  onClick={() =>
                    navigate(`/help/inquiry?mock=${encodeURIComponent('문의 보냄')}`)
                  }
                >
                  {DEMO.submit}
                </Button>
              </div>
            </section>
          ) : (
            <section aria-labelledby="hc-faq">
              <div className={s.secHead}>
                <h2 id="hc-faq" className={s.secTitle}>
                  {isSearch ? DEMO.searchTitle(query || '환불') : DEMO.faqTitle}
                </h2>
                <span className={s.count}>
                  {isSearch ? `${faqList.length}건` : `${faqList.length}개`}
                </span>
              </div>

              {!isSearch ? (
                <Tabs
                  kind="underline"
                  label="질문 분류"
                  value={cat}
                  items={DEMO.cats.map((c) => ({ key: c, label: c }))}
                  onChange={setCat}
                />
              ) : null}

              {isSearch && faqList.length === 0 ? (
                <EmptyState
                  title={DEMO.emptySearchTitle}
                  action={
                    <Button variant="primary" to={DEMO.askHref}>
                      {DEMO.askCta}
                    </Button>
                  }
                >
                  {DEMO.emptySearchBody}
                </EmptyState>
              ) : (
                <ul className={s.faqs}>
                  {faqList.map((f) => {
                    const open = openId === f.id;
                    return (
                      <li key={f.id} className={`${s.faq} ${open ? s.faqOpen : ''}`}>
                        <button
                          type="button"
                          className={s.faqBtn}
                          aria-expanded={open}
                          onClick={() => setOpenId(open ? null : f.id)}
                        >
                          <span className={s.faqCat}>{f.cat}</span>
                          <span className={s.faqQ}>{f.q}</span>
                          <span className={s.faqAr} aria-hidden="true">
                            {open ? '▴' : '▾'}
                          </span>
                        </button>
                        {open ? (
                          <div className={s.faqA}>
                            <p>{f.a}</p>
                            {f.go && f.goHref ? (
                              <Link to={f.goHref} className={s.go}>
                                {f.go}
                              </Link>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}

              {isSearch && faqList.length > 0 ? (
                <p className={s.miss}>
                  {DEMO.miss}{' '}
                  <Link to={DEMO.askHref}>{DEMO.missLink}</Link>
                </p>
              ) : null}
            </section>
          )}

          <section className={s.notice} aria-labelledby="hc-nt">
            <div className={s.secHead}>
              <h2 id="hc-nt" className={s.secTitle}>
                {DEMO.noticeTitle}
              </h2>
            </div>
            <ul className={s.noticeList}>
              {DEMO.notices.map((n) => (
                <li key={n.title}>
                  <span className={s.noticeTag}>{n.tag}</span>
                  <span className={s.noticeTitle}>{n.title}</span>
                  <span className={s.noticeDate}>{n.date}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className={s.aside}>
          <section className={s.card}>
            <h3 className={s.asideTitle}>{DEMO.asideAskTitle}</h3>
            <p className={s.asideBody}>{DEMO.asideAskBody}</p>
            {/* 화면당 primary 하나 — 문의 폼·빈 검색은 본문에 파란 버튼이 있다 */}
            <Button
              variant={isForm || (isSearch && faqList.length === 0) ? 'ghost' : 'primary'}
              to={DEMO.askHref}
              full
            >
              {DEMO.askCta}
            </Button>
          </section>
          <section className={s.card}>
            <h3 className={s.asideTitle}>{DEMO.callTitle}</h3>
            <p className={s.tel}>{DEMO.phone}</p>
            <p className={s.asideBody}>{DEMO.hours}</p>
            <p className={s.asideBody}>{DEMO.email}</p>
          </section>
          <section className={s.card}>
            <h3 className={s.asideTitle}>{DEMO.guideTitle}</h3>
            <ul className={s.guides}>
              {DEMO.guides.map((g) => (
                <li key={g.t}>
                  <b>{g.t}</b>
                  {g.b}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

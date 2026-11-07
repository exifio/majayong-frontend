/* 고객센터 — 보드 Help · /help · M6
 * 상태: 자주 묻는 질문 / 검색 결과(?q=) / 공지(?tab=notice)
 * F-25 · 1:1 문의는 Help-Inquiry 화면이 맡는다. */
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, EmptyState, Tabs } from '@/components/ui';
import { DEMO, FAQS, searchFaqs } from './Help.data';
import s from './Help.module.css';

function NoticeSection() {
  return (
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
  );
}

export default function Help() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qParam = params.get('q');
  const noticeFirst = params.get('tab') === 'notice';

  const [query, setQuery] = useState(qParam ?? '');
  const [cat, setCat] = useState('전체');
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id ?? null);

  const isSearch = Boolean(qParam);
  const searchResults = useMemo(
    () => (isSearch ? searchFaqs(qParam ?? '') : []),
    [isSearch, qParam],
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
        <h1 id="help-h" className={s.title}>{DEMO.title}</h1>
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
          <Button variant="ghost" type="submit">{DEMO.searchBtn}</Button>
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
          {noticeFirst ? <NoticeSection /> : null}

          <section aria-labelledby="hc-faq">
            <div className={s.secHead}>
              <h2 id="hc-faq" className={s.secTitle}>
                {isSearch ? DEMO.searchTitle(qParam ?? '') : DEMO.faqTitle}
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
                action={<Button variant="primary" to={DEMO.askHref}>{DEMO.askCta}</Button>}
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
                        <span className={s.faqAr} aria-hidden="true">{open ? '▴' : '▾'}</span>
                      </button>
                      {open ? (
                        <div className={s.faqA}>
                          <p>{f.a}</p>
                          {f.go && f.goHref ? <Link to={f.goHref} className={s.go}>{f.go}</Link> : null}
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

          {noticeFirst ? null : <NoticeSection />}
        </div>

        <aside className={s.aside}>
          <section className={s.card}>
            <h3 className={s.asideTitle}>{DEMO.asideAskTitle}</h3>
            <p className={s.asideBody}>{DEMO.asideAskBody}</p>
            <Button
              variant={isSearch && faqList.length === 0 ? 'ghost' : 'primary'}
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
            {DEMO.email ? <p className={s.asideBody}>{DEMO.email}</p> : null}
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

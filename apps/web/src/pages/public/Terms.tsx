/* 약관 · 정책 — 보드 Terms · /terms/:doc · M1
 * doc: terms / privacy / nda / broker. PRD 7.2. 파란 버튼 없음. */
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState, Tabs } from '@/components/ui';
import { DEMO, DOCS, resolveDoc, type DocKey } from './Terms.data';
import s from './Terms.module.css';

export default function Terms() {
  const { doc: raw } = useParams<{ doc: string }>();
  const navigate = useNavigate();
  const key = resolveDoc(raw);

  if (!key) {
    return (
      <div className={s.page} data-screen="Terms">
        <h1 className={s.pageTitle}>{DEMO.pageTitle}</h1>
        <Tabs
          kind="underline"
          label="문서"
          value="terms"
          items={[...DEMO.tabs]}
          onChange={(k) => navigate(`/terms/${k}`)}
        />
        <EmptyState title={DEMO.emptyTitle}>{DEMO.emptyBody}</EmptyState>
      </div>
    );
  }

  const doc = DOCS[key];

  return (
    <div className={s.page} data-screen="Terms">
      <header className={s.head}>
        <h1 className={s.pageTitle}>{DEMO.pageTitle}</h1>
        <p className={s.pageSub}>{DEMO.pageSub}</p>
      </header>

      <Tabs
        kind="underline"
        label="문서"
        value={key}
        items={[...DEMO.tabs]}
        onChange={(k) => navigate(`/terms/${k as DocKey}`)}
      />

      <article className={s.doc} aria-label={doc.title}>
        <div className={s.docHead}>
          <h2 className={s.docTitle}>{doc.title}</h2>
          <span className={s.who}>{doc.who}</span>
        </div>
        <p className={s.draft}>{DEMO.draft}</p>
        <p className={s.effective}>{DEMO.effective}</p>

        <nav className={s.toc} aria-label="조항 목차">
          <ol>
            {doc.arts.map((a) => (
              <li key={a.h}>
                <a href={`#${encodeURIComponent(a.h)}`}>{a.h}</a>
              </li>
            ))}
            {doc.hasTable ? (
              <li>
                <a href="#수집하는-정보와-쓰임">{DEMO.tableCaption}</a>
              </li>
            ) : null}
          </ol>
        </nav>

        <p className={s.lead}>{doc.lead}</p>

        {doc.arts.map((a) => (
          <section key={a.h} className={s.art} id={a.h}>
            <h3>{a.h}</h3>
            <p>{a.p}</p>
            {a.list ? (
              <ul>
                {a.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {doc.hasTable ? (
          <section className={s.art} id="수집하는-정보와-쓰임">
            <h3>{DEMO.tableCaption}</h3>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th scope="col">대상</th>
                    <th scope="col">받는 정보</th>
                    <th scope="col">받지 않는 정보</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO.tableRows.map((row) => (
                    <tr key={row.who}>
                      <td>{row.who}</td>
                      <td>{row.yes}</td>
                      <td>{row.no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <p className={s.footer}>{DEMO.footer}</p>
      </article>
    </div>
  );
}

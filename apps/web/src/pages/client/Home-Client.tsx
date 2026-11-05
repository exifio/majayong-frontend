/* 홈 — 보드 Home-Client · /c · M2
 * 상태: 기본 / 첫 방문
 * F-18. 파란 버튼은 '지금 할 일' 카드 하나뿐. */
import { Link, useSearchParams } from 'react-router-dom';
import { Button, StatusChip } from '@/components/ui';
import { DEMO, homeDemoOf, resolveHomeMock } from './Home-Client.data';
import s from './Home-Client.module.css';

export default function HomeClient() {
  const [params] = useSearchParams();
  const mock = resolveHomeMock(params.get('mock'));
  const demo = homeDemoOf(mock);

  if (demo.first) {
    return (
      <div className={s.page} data-screen="Home-Client">
        <div className={s.hello}>
          <h1>{DEMO.hello}</h1>
          <div className={s.helloMeta}>{DEMO.helloMeta}</div>
        </div>

        <section className={s.fvHero}>
          <h2>{DEMO.firstTitle}</h2>
          <p>{DEMO.firstBody}</p>
          <Button variant="primary" size="lg" to={DEMO.firstHref}>
            {DEMO.firstCta}
          </Button>
        </section>

        <div className={s.fvSteps}>
          {DEMO.steps.map((st) => (
            <div className={s.step} key={st.no}>
              <span className={s.no}>{st.no}</span>
              <b>{st.title}</b>
              <p>{st.body}</p>
            </div>
          ))}
        </div>

        <p className={s.fvNote}>
          아직 프로젝트가 없습니다. 가게 정보는{' '}
          <Link to={DEMO.profileHref}>내 프로필</Link>에서 언제든 채울 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className={s.page} data-screen="Home-Client">
      <div className={s.hello}>
        <h1>{DEMO.hello}</h1>
        <div className={s.helloMeta}>{DEMO.helloMeta}</div>
      </div>

      <section className={s.focus} aria-labelledby="focus-h">
        <div>
          <p className={s.kick}>{DEMO.focusKick}</p>
          <h2 className={s.focusTitle} id="focus-h">
            {DEMO.focusTitle}
          </h2>
          <p className={s.focusBody}>{DEMO.focusBody}</p>
          <Button variant="primary" size="lg" to={DEMO.focusHref}>
            {DEMO.focusCta}
          </Button>
        </div>
        <div className={s.mini} aria-label={DEMO.focusSideTitle}>
          <div className={s.miniTitle}>{DEMO.focusSideTitle}</div>
          {DEMO.focusSideRows.map((r) => (
            <div className={s.mrow} key={r.k}>
              <span className={s.k}>{r.k}</span>
              <span>{r.v}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={s.stats} aria-label="요약 지표">
        {demo.stats.map((st) => (
          <div className={s.stat} key={st.label}>
            <div className={s.statK}>{st.label}</div>
            <div className={s.statV}>{st.value}</div>
            <div className={s.statS}>{st.sub}</div>
          </div>
        ))}
      </div>

      <div className={s.rowsb}>
        <h2 className={s.ct}>{DEMO.projectsTitle}</h2>
        <Link className={s.allLink} to={DEMO.projectsAllHref}>
          {DEMO.projectsAll}
        </Link>
      </div>

      <div className={s.list}>
        {demo.projects.map((p) => (
          <Link key={p.id} className={s.pj} to={p.href} aria-label={p.title}>
            <div className={s.pjTop}>
              <StatusChip status={p.status} />
            </div>
            <div className={s.pjTitle}>{p.title}</div>
            <p className={s.pjMeta}>{p.meta}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

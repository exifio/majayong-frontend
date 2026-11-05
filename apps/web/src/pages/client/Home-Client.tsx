/* 홈 — 보드 Home-Client · /c · M2
 * 상태: 기본 / 첫 방문
 * F-18. 파란 버튼은 '지금 할 일' 카드 하나뿐. */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { projectStatusLabel } from '@/lib/project-adapter';
import type { MyProjectDto } from '@majayong/types/api';
import { DEMO, homeDemoOf, resolveHomeMock } from './Home-Client.data';
import s from './Home-Client.module.css';

export default function HomeClient() {
  const { apiAccessToken } = useSession();
  const live = Boolean(apiAccessToken.trim()) || !import.meta.env.DEV;
  return live ? <LiveHome /> : <DemoHome />;
}

function LiveHome() {
  const { apiAccessToken, authUser } = useSession();
  const [projects, setProjects] = useState<MyProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const name = authUser?.name?.trim() || '고객';

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    apiRequest('listMyProjects', '/me/projects', { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => setProjects(response.data))
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setError(caught instanceof ApiRequestError ? caught.message : '프로젝트를 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [apiAccessToken]);

  if (loading) {
    return (
      <div className={s.page} data-screen="Home-Client">
        <div className={s.hello}><h1>안녕하세요, {name}님</h1></div>
        <p role="status" style={{ padding: 24 }}>프로젝트를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.page} data-screen="Home-Client">
        <div className={s.hello}><h1>안녕하세요, {name}님</h1></div>
        <p role="alert" style={{ padding: 24 }}>{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={s.page} data-screen="Home-Client">
        <div className={s.hello}>
          <h1>안녕하세요, {name}님</h1>
        </div>

        <section className={s.fvHero}>
          <h2>{DEMO.firstTitle}</h2>
          <p>{DEMO.firstBody}</p>
          <Button variant="primary" size="lg" to={DEMO.firstHref}>
            {DEMO.firstCta}
          </Button>
        </section>

        <div className={s.fvSteps}>
          {DEMO.steps.map((step) => (
            <div className={s.step} key={step.no}>
              <span className={s.no}>{step.no}</span>
              <b>{step.title}</b>
              <p>{step.body}</p>
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

  const recruiting = projects.filter((project) => project.status === 'RECRUITING').length;
  const contracted = projects.filter((project) => project.status === 'ACCEPTED' || project.status === 'CONTRACTED').length;
  const applications = projects.reduce((total, project) => total + project.applicationCount, 0);
  const views = projects.reduce((total, project) => total + project.detailViewCount, 0);

  return (
    <div className={s.page} data-screen="Home-Client">
      <div className={s.hello}>
        <h1>안녕하세요, {name}님</h1>
      </div>

      <div className={s.stats} aria-label="요약 지표">
        <div className={s.stat}>
          <div className={s.statK}>진행 중 프로젝트</div>
          <div className={s.statV}>{projects.length}</div>
          <div className={s.statS}>모집 중 {recruiting}건</div>
        </div>
        <div className={s.stat}>
          <div className={s.statK}>받은 지원</div>
          <div className={s.statV}>{applications}</div>
          <div className={s.statS}>상세 열람 {views}회</div>
        </div>
        <div className={s.stat}>
          <div className={s.statK}>진행 중 계약</div>
          <div className={s.statV}>{contracted}</div>
          <div className={s.statS}>내 계약에서 확인</div>
        </div>
      </div>

      <div className={s.rowsb}>
        <h2 className={s.ct}>{DEMO.projectsTitle}</h2>
        <Link className={s.allLink} to={DEMO.projectsAllHref}>
          {DEMO.projectsAll}
        </Link>
      </div>

      <div className={s.list}>
        {projects.map((project) => (
          <Link key={project.projectId} className={s.pj} to={`/c/projects/${encodeURIComponent(project.projectId)}`} aria-label={project.title}>
            <div className={s.pjTop}>
              <StatusChip status={projectStatusLabel(project.status)} />
            </div>
            <div className={s.pjTitle}>{project.title}</div>
            <p className={s.pjMeta}>
              지원 {project.applicationCount}건 · 버전 {project.currentVersion}
              {project.deadline ? ` · 마감 ${new Date(project.deadline).toLocaleDateString('ko-KR')}` : ''}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DemoHome() {
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

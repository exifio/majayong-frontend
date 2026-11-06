/* 내 프로젝트 — 보드 My-Client · /c/projects · M2
 * 상태: 홈과 같은 데이터 / 모든 상태 예시 / 프로젝트 없음
 * F-03 · 결정메모 #9. 명세 확정 후 AI 금액 없음. */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LoadingState, Button, Deadline, EmptyState, Money, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { projectStatusLabel } from '@/lib/project-adapter';
import type { MyProjectDto } from '@majayong/types/api';
import { DEMO, myDemoOf, resolveMyMock } from './My-Client.data';
import s from './My-Client.module.css';

export default function MyClient() {
  const { apiAccessToken } = useSession();
  const live = Boolean(apiAccessToken.trim()) || !import.meta.env.DEV;
  return live ? <LiveMy /> : <DemoMy />;
}

function LiveMy() {
  const { apiAccessToken } = useSession();
  const [projects, setProjects] = useState<MyProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className={s.page} data-screen="My-Client">
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{DEMO.title}</h1>
          <p className={s.sub}>{DEMO.sub}</p>
        </div>
        {projects.length > 0 ? (
          <Button variant="primary" to={DEMO.newHref}>
            {DEMO.newCta}
          </Button>
        ) : null}
      </div>

      {loading && <LoadingState label="프로젝트를 불러오는 중입니다." />}
      {error && <p role="alert" style={{ padding: 24 }}>{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <div className={s.emptyWrap}>
          <EmptyState
            title={DEMO.emptyTitle}
            action={
              <Button variant="primary" to={DEMO.newHref}>
                {DEMO.emptyCta}
              </Button>
            }
          >
            {DEMO.emptyBody}
          </EmptyState>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className={s.list}>
          {projects.map((project) => {
            const label = projectStatusLabel(project.status);
            const actionable = project.status === 'RECRUITING' || project.status === 'SELECTING';
            return (
              <Link key={project.projectId} className={s.card} to={`/c/projects/${encodeURIComponent(project.projectId)}`}>
                <div>
                  <div className={s.top}>
                    <StatusChip status={label} />
                    {project.deadline ? (
                      <Deadline
                        label={project.status === 'RECRUITING' || project.status === 'SELECTING' ? '모집 마감' : '기한'}
                        at={project.deadline}
                        actionable={actionable}
                      />
                    ) : null}
                  </div>
                  <p className={s.name}>{project.title}</p>
                  <div className={s.meta}>
                    지원 {project.applicationCount}건 · 상세 열람 {project.detailViewCount}회 · 버전 {project.currentVersion}
                  </div>
                </div>
                <div className={s.side}>
                  <div className={s.quotes}>
                    {DEMO.quotesLabel}
                    <b>{project.applicationCount}건</b>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DemoMy() {
  const [params] = useSearchParams();
  const demo = myDemoOf(resolveMyMock(params.get('mock')));

  return (
    <div className={s.page} data-screen="My-Client">
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{DEMO.title}</h1>
          <p className={s.sub}>{DEMO.sub}</p>
        </div>
        {!demo.empty ? (
          <Button variant="primary" to={DEMO.newHref}>
            {DEMO.newCta}
          </Button>
        ) : null}
      </div>

      {demo.empty ? (
        <div className={s.emptyWrap}>
          <EmptyState
            title={DEMO.emptyTitle}
            action={
              <Button variant="primary" to={DEMO.newHref}>
                {DEMO.emptyCta}
              </Button>
            }
          >
            {DEMO.emptyBody}
          </EmptyState>
        </div>
      ) : (
        <div className={s.list}>
          {demo.cards.map((card) => (
            <Link key={card.id} className={s.card} to={card.href}>
              <div>
                <div className={s.top}>
                  <StatusChip status={card.status} />
                  {card.deadlineAt ? (
                    <Deadline
                      label={card.deadlineLabel ?? '기한'}
                      at={card.deadlineAt}
                      actionable={card.status === '모집 중' || card.status === '임시 계약'}
                    />
                  ) : null}
                </div>
                <p className={s.name}>{card.title}</p>
                <div className={s.meta}>{card.meta}</div>
              </div>
              <div className={s.side}>
                {card.quotes != null ? (
                  <div className={s.quotes}>
                    {DEMO.quotesLabel}
                    <b>{card.quotes}건</b>
                  </div>
                ) : null}
                {card.showAi && card.aiAmount != null ? (
                  <div className={s.ai}>
                    수수료 포함 예상 총액
                    <b>
                      <Money amount={card.aiAmount} />
                    </b>
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

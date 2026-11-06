/* A 공급자 프로젝트 목록 — GET /projects가 주는 공개 필드만 표시한다. */
import { useEffect, useState } from 'react';
import type { ApiProjectStatus, PublicProjectListItemDto } from '@majayong/types/api';
import { LoadingState, Attr, Button, Chip, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { industryLabel } from '@/lib/industry-label';
import { projectStatusLabel } from '@/lib/project-adapter';

type State = 'loading' | 'success' | 'auth-error' | 'error';

const STATUS_OPTIONS: { value: '' | ApiProjectStatus; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'RECRUITING', label: '모집 중' },
  { value: 'SELECTING', label: '선택 중' },
  { value: 'EXPIRED', label: '모집 마감' },
];

export function LiveProjectList({ styles }: { styles: Record<string, string> }) {
  const s = styles;
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<State>('loading');
  const [items, setItems] = useState<PublicProjectListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'' | ApiProjectStatus>('');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skill, setSkill] = useState('');
  const [sort, setSort] = useState<'LATEST' | 'DEADLINE_SOON' | 'BUDGET_HIGH'>('LATEST');
  const [deadlineBefore, setDeadlineBefore] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    apiRequest('listPublicProjects', '/projects', {
      accessToken: apiAccessToken,
      signal: controller.signal,
      query: {
        page,
        ...(status ? { status } : {}),
        ...(skill ? { skill } : {}),
        ...(keyword ? { keyword } : {}),
        ...(deadlineBefore ? { deadlineBefore } : {}),
        ...(sort === 'LATEST' ? {} : { sort }),
      },
    }).then((response) => {
      setItems(response.data);
      const meta = response.meta ?? {};
      setTotal(typeof meta.total === 'number' ? meta.total : response.data.length);
      setState('success');
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
    });
    return () => controller.abort();
  }, [apiAccessToken, page, status, skill, keyword, deadlineBefore, sort, retry]);

  const pageSize = 10;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  if (state !== 'success') {
    return (
      <div className={s.page}>
        {state === 'loading' && <LoadingState title="프로젝트" label="프로젝트를 불러오는 중입니다." />}
        {state === 'auth-error' && <p role="alert" style={{ padding: 24 }}>API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.</p>}
        {state === 'error' && (
          <p role="alert" style={{ padding: 24 }}>
            프로젝트를 불러오지 못했습니다.
            <Button variant="text" onClick={() => setRetry((count) => count + 1)}>다시 시도</Button>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={s.page} data-screen="Find-Supplier-Live">
      <div className={s.head}>
        <h1 className={s.title}>프로젝트 찾기</h1>
        <p className={s.sub}>공개된 모집 프로젝트입니다. 상세는 NDA 동의 후 열람할 수 있습니다.</p>
      </div>

      <form
        className={s.sbar}
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setKeyword(keywordInput.trim());
          setSkill(skillInput.trim());
        }}
      >
        <div className={s.qbox}>
          <input
            className={s.inp}
            type="search"
            aria-label="프로젝트 검색"
            placeholder="프로젝트·기능 검색 (예: 예약)"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
          />
        </div>
        <div className={s.qbox}>
          <input
            className={s.inp}
            type="search"
            aria-label="기술 스택 검색"
            placeholder="기술 스택 (예: React)"
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
          />
        </div>
        <Button type="submit" variant="primary">검색</Button>
      </form>

      <div className={s.rbar}>
        <p className={s.cnt}>전체 <b>{total}</b>건</p>
        <label>
          모집 상태{' '}
          <select
            aria-label="모집 상태"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as '' | ApiProjectStatus);
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          정렬{' '}
          <select
            aria-label="정렬"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as 'LATEST' | 'DEADLINE_SOON' | 'BUDGET_HIGH');
              setPage(1);
            }}
          >
            <option value="LATEST">최신순</option>
            <option value="DEADLINE_SOON">마감임박순</option>
            <option value="BUDGET_HIGH">예산 높은순</option>
          </select>
        </label>
        <label>
          마감일{' '}
          <input
            type="date"
            aria-label="마감일 이전"
            value={deadlineBefore}
            onChange={(event) => {
              setDeadlineBefore(event.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>

      {items.length === 0 ? (
        <p role="status" style={{ padding: 24 }}>조건에 맞는 프로젝트가 없습니다.</p>
      ) : (
        <div className={s.plist}>
          {items.map((project) => (
            <article
              key={project.projectId}
              className={`${s.pc} ${project.status === 'EXPIRED' ? s.pcClosed : ''}`}
              aria-label={project.title}
            >
              <div className={s.left}>
                <div className={s.top}>
                  <Chip tone="neutral">{industryLabel(project.industryCode)}</Chip>
                  <StatusChip status={projectStatusLabel(project.status)} />
                  {project.deadline && <span className={s.dl}>{formatDate(project.deadline)} 마감</span>}
                </div>
                <h2 className={s.ti}>{project.title}</h2>
                <p className={s.it}>명세 항목 <b>{project.itemCount}개</b></p>
                <div className={s.stk}>
                  {project.requiredSkills.map((name) => (
                    <span key={name} className={s.stag}>{name}</span>
                  ))}
                </div>
              </div>
              <div className={s.right}>
                <div className={s.bud}>
                  <Attr label="희망 예산">{project.hopeBudgetBand ?? '미정'}</Attr>
                </div>
                <div className={s.rt2}>
                  <Button variant="tint" size="sm" to={`/s/projects/${encodeURIComponent(project.projectId)}`}>
                    상세 보기
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <nav className={s.pager} aria-label="쪽">
          <button type="button" className={s.pagerOff} disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>이전</button>
          <span className={s.pagerOn}>{page}</span>
          <button type="button" className={s.pagerOff} disabled={page >= lastPage} onClick={() => setPage((value) => value + 1)}>다음</button>
        </nav>
      )}
    </div>
  );
}

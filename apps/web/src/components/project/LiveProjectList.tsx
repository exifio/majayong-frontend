/* A 공급자 프로젝트 목록 · 북마크 — GET /projects · GET /me/bookmarks가 주는 공개 필드만 표시한다.
 * 필터: 검색어 · 기술 스택 · 업종(industryCode) · 예산(minBudget/maxBudget, 원) · 모집 상태 · 정렬 · 마감일
 * 북마크: PUT/DELETE /projects/{id}/bookmark. ?view=bookmarks면 내 북마크만 보여 준다. */
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ApiProjectStatus, BookmarkListItemDto, PublicProjectListItemDto } from '@majayong/types/api';
import { LoadingState, Attr, Button, Chip, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { INDUSTRY_OPTIONS, industryLabel } from '@/lib/industry-label';
import { projectStatusLabel } from '@/lib/project-adapter';

type State = 'loading' | 'success' | 'auth-error' | 'error';

const STATUS_OPTIONS: { value: '' | ApiProjectStatus; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'RECRUITING', label: '모집 중' },
  { value: 'SELECTING', label: '선택 중' },
  { value: 'EXPIRED', label: '모집 마감' },
];

/* 디자인 보드 Find-Supplier의 예산 구간. BE는 [min, max) — 하한 포함, 상한 미포함(원) */
type BudgetKey = '' | 'LT200' | 'B200_400' | 'GTE400';
const BUDGET_OPTIONS: { value: BudgetKey; label: string; query: { minBudget?: number; maxBudget?: number } }[] = [
  { value: '', label: '전체', query: {} },
  { value: 'LT200', label: '200만원 미만', query: { maxBudget: 2_000_000 } },
  { value: 'B200_400', label: '200~400만원', query: { minBudget: 2_000_000, maxBudget: 4_000_000 } },
  { value: 'GTE400', label: '400만원 이상', query: { minBudget: 4_000_000 } },
];

interface ProjectCard {
  id: string;
  title: string;
  industryCode: string;
  status: ApiProjectStatus;
  deadline: string | null;
  itemCount: number;
  skills: string[];
  budget: string | null;
}

const manwon = (krw: number) => `${Math.round(krw / 10_000).toLocaleString('ko-KR')}`;

function fromListItem(project: PublicProjectListItemDto): ProjectCard {
  return {
    id: project.projectId,
    title: project.title,
    industryCode: project.industryCode,
    status: project.status,
    deadline: project.deadline,
    itemCount: project.itemCount,
    skills: project.requiredSkills,
    budget: project.hopeBudgetBand,
  };
}

function fromBookmark(row: BookmarkListItemDto): ProjectCard {
  const p = row.project;
  return {
    id: p.id,
    title: p.title,
    industryCode: p.industryCode,
    status: p.status,
    deadline: p.deadline,
    itemCount: p.specItemCount,
    skills: p.requiredSkills,
    budget: p.hopeBudgetRange ? `${manwon(p.hopeBudgetRange.minKrw)}~${manwon(p.hopeBudgetRange.maxKrw)}만원` : null,
  };
}

export function LiveProjectList({ styles }: { styles: Record<string, string> }) {
  const s = styles;
  const { apiAccessToken } = useSession();
  const [params] = useSearchParams();
  const bookmarksView = params.get('view') === 'bookmarks';
  const [state, setState] = useState<State>('loading');
  const [items, setItems] = useState<ProjectCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'' | ApiProjectStatus>('');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skill, setSkill] = useState('');
  const [industry, setIndustry] = useState('');
  const [budget, setBudget] = useState<BudgetKey>('');
  const [sort, setSort] = useState<'LATEST' | 'DEADLINE_SOON' | 'BUDGET_HIGH'>('LATEST');
  const [deadlineBefore, setDeadlineBefore] = useState('');
  const [retry, setRetry] = useState(0);
  /* 한 번 불러온 뒤에는 필터를 그대로 두고 목록 자리에만 로딩을 보인다(고르던 필터가 사라지지 않게) */
  const [loadedOnce, setLoadedOnce] = useState(false);
  /* 북마크 상태 — null이면 아직 모름(불러오기 실패 포함) */
  const [bookmarked, setBookmarked] = useState<Set<string> | null>(null);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());

  /* 내 북마크 — 목록 화면에서는 버튼 상태, 북마크 화면에서는 목록 자체 */
  const loadBookmarks = useCallback((signal: AbortSignal) =>
    apiRequest('listBookmarks', '/me/bookmarks', { accessToken: apiAccessToken, signal }), [apiAccessToken]);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    if (bookmarksView) {
      loadBookmarks(controller.signal).then((response) => {
        const cards = response.data.map(fromBookmark);
        setItems(cards);
        setTotal(cards.length);
        setBookmarked(new Set(cards.map((card) => card.id)));
        setState('success');
        setLoadedOnce(true);
      }).catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
      });
      return () => controller.abort();
    }

    const budgetQuery = BUDGET_OPTIONS.find((option) => option.value === budget)?.query ?? {};
    apiRequest('listPublicProjects', '/projects', {
      accessToken: apiAccessToken,
      signal: controller.signal,
      query: {
        page,
        ...(status ? { status } : {}),
        ...(skill ? { skill } : {}),
        ...(keyword ? { keyword } : {}),
        ...(industry ? { industryCode: industry } : {}),
        ...budgetQuery,
        ...(deadlineBefore ? { deadlineBefore } : {}),
        ...(sort === 'LATEST' ? {} : { sort }),
      },
    }).then((response) => {
      setItems(response.data.map(fromListItem));
      const meta = response.meta ?? {};
      setTotal(typeof meta.total === 'number' ? meta.total : response.data.length);
      setState('success');
      setLoadedOnce(true);
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
    });
    return () => controller.abort();
  }, [apiAccessToken, bookmarksView, loadBookmarks, page, status, skill, keyword, industry, budget, deadlineBefore, sort, retry]);

  /* 목록 화면: 북마크 표시용으로 내 북마크 id만 따로 읽는다. 실패해도 목록은 그대로 보인다. */
  useEffect(() => {
    if (bookmarksView) return;
    const controller = new AbortController();
    loadBookmarks(controller.signal)
      .then((response) => setBookmarked(new Set(response.data.map((row) => row.project.id))))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setBookmarked(null);
      });
    return () => controller.abort();
  }, [bookmarksView, loadBookmarks, retry]);

  async function toggleBookmark(projectId: string) {
    if (pending.has(projectId)) return;
    const wasOn = bookmarked?.has(projectId) ?? false;
    setBookmarkError(null);
    setPending((current) => new Set(current).add(projectId));
    const apply = (on: boolean) => setBookmarked((current) => {
      const next = new Set(current ?? []);
      if (on) next.add(projectId); else next.delete(projectId);
      return next;
    });
    apply(!wasOn);
    try {
      const path = `/projects/${encodeURIComponent(projectId)}/bookmark`;
      if (wasOn) {
        await apiRequest('removeBookmark', path, { method: 'DELETE', accessToken: apiAccessToken });
        if (bookmarksView) {
          setItems((current) => current.filter((card) => card.id !== projectId));
          setTotal((count) => Math.max(0, count - 1));
        }
      } else {
        await apiRequest('saveBookmark', path, { method: 'PUT', accessToken: apiAccessToken });
      }
    } catch (error) {
      apply(wasOn);
      setBookmarkError(error instanceof ApiRequestError ? error.message : '북마크를 바꾸지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setPending((current) => {
        const next = new Set(current);
        next.delete(projectId);
        return next;
      });
    }
  }

  const pageSize = 10;
  const lastPage = bookmarksView ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const filtered = Boolean(keyword || skill || industry || budget || status || deadlineBefore);

  if (state !== 'success' && !(state === 'loading' && loadedOnce)) {
    return (
      <div className={s.page}>
        {state === 'loading' && <LoadingState title={bookmarksView ? '북마크' : '프로젝트'} label="프로젝트를 불러오는 중입니다." />}
        {state === 'auth-error' && <p role="alert" style={{ padding: 24 }}>API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.</p>}
        {state === 'error' && (
          <p role="alert" style={{ padding: 24 }}>
            {bookmarksView ? '북마크를 불러오지 못했습니다.' : '프로젝트를 불러오지 못했습니다.'}
            <Button variant="text" onClick={() => setRetry((count) => count + 1)}>다시 시도</Button>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={s.page} data-screen="Find-Supplier-Live">
      <div className={s.head}>
        <h1 className={s.title}>{bookmarksView ? '북마크' : '프로젝트 찾기'}</h1>
        <p className={s.sub}>
          {bookmarksView
            ? '북마크한 프로젝트입니다. 마감된 프로젝트도 목록에 남습니다.'
            : '공개된 모집 프로젝트입니다. 상세는 NDA 동의 후 열람할 수 있습니다.'}
        </p>
      </div>

      {!bookmarksView && (
        <>
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
              업종{' '}
              <select
                aria-label="업종"
                value={industry}
                onChange={(event) => {
                  setIndustry(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">전체</option>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              예산{' '}
              <select
                aria-label="예산 범위"
                value={budget}
                onChange={(event) => {
                  setBudget(event.target.value as BudgetKey);
                  setPage(1);
                }}
              >
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
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
        </>
      )}

      {bookmarksView && <p className={s.cnt}>북마크 <b>{total}</b>건</p>}
      {bookmarkError && <p role="alert" style={{ padding: '8px 0' }}>{bookmarkError}</p>}

      {state === 'loading' ? (
        <p role="status" style={{ padding: 24 }}>프로젝트를 불러오는 중입니다.</p>
      ) : items.length === 0 ? (
        <p role="status" style={{ padding: 24 }}>
          {bookmarksView
            ? '북마크한 프로젝트가 없습니다. 프로젝트 찾기에서 북마크를 눌러 모아 두세요.'
            : filtered ? '조건에 맞는 프로젝트가 없습니다.' : '아직 공개된 프로젝트가 없습니다.'}
        </p>
      ) : (
        <div className={s.plist}>
          {items.map((project) => {
            const on = bookmarked?.has(project.id) ?? false;
            return (
              <article
                key={project.id}
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
                    {project.skills.map((name) => (
                      <span key={name} className={s.stag}>{name}</span>
                    ))}
                  </div>
                </div>
                <div className={s.right}>
                  <div className={s.bud}>
                    <Attr label="희망 예산">{project.budget ?? '미정'}</Attr>
                  </div>
                  <div className={s.rt2}>
                    <button
                      type="button"
                      className={`${s.bm ?? ''} ${on ? s.bmOn ?? '' : ''}`}
                      aria-pressed={on}
                      aria-label={`${project.title} 북마크`}
                      disabled={pending.has(project.id) || (bookmarked === null && !bookmarksView)}
                      title={bookmarked === null && !bookmarksView ? '북마크 정보를 불러오지 못했습니다' : undefined}
                      onClick={() => void toggleBookmark(project.id)}
                    >
                      <svg viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 3.5h12v17l-6-4-6 4z" />
                      </svg>
                    </button>
                    <Button variant="tint" size="sm" to={`/s/projects/${encodeURIComponent(project.id)}`}>
                      상세 보기
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
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

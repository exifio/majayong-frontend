/* 프로젝트 찾기 · 북마크 — 보드 Find-Supplier · /s/projects · M3
 * 상태: 전체 / 북마크(?view=bookmarks) / 검색 결과 없음
 * 전체 공개만. F-08 · 7.1. 파란 버튼은 검색 하나. */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Attr, Button, Chip, EmptyState } from '@/components/ui';
import {
  BUDGET_FILTERS,
  CATEGORIES,
  DEMO,
  FIND_HREF,
  MY_STACK,
  PAGE_SIZE,
  PROJECTS,
  PROJECT_DETAIL_HREF,
  SORTS,
  STACK_FILTERS,
  filterProjects,
  isMyStack,
  resolveFindMock,
  sortProjects,
  type DeadlineFilter,
  type ProjectCard,
  type SortKey,
} from './Find-Supplier.data';
import { useSession } from '@/app/session';
import { LiveProjectList } from '@/components/project/LiveProjectList';
import s from './Find-Supplier.module.css';
import { AuthRequired } from '@/components/system/AuthRequired';
import { DEMO_DATA_ENABLED } from '@/lib/feature-flags';

function initialBookmarks(): Set<string> {
  return new Set(PROJECTS.filter((p) => p.bookmarked).map((p) => p.id));
}

export default function FindSupplier() {
  const { apiAccessToken } = useSession();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveFindMock(params.get('mock'), params.get('view'));
  const isBm = mock === '북마크';
  const forceEmpty = mock === '검색 결과 없음';

  const [qInput, setQInput] = useState(forceEmpty ? DEMO.emptyQ : '');
  const [q, setQ] = useState(forceEmpty ? DEMO.emptyQ : '');
  const [sort, setSort] = useState<SortKey>('latest');
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [budgets, setBudgets] = useState<Set<string>>(new Set());
  const [stacks, setStacks] = useState<Set<string>>(new Set());
  const [deadline, setDeadline] = useState<DeadlineFilter>('all');
  const [showOpen, setShowOpen] = useState(true);
  const [showClosed, setShowClosed] = useState(true);
  const [bookmarked, setBookmarked] = useState<Set<string>>(initialBookmarks);

  useEffect(() => {
    const next = resolveFindMock(params.get('mock'), params.get('view'));
    if (next === '검색 결과 없음') {
      setQInput(DEMO.emptyQ);
      setQ(DEMO.emptyQ);
    } else if (next === '전체') {
      setQInput('');
      setQ('');
    }
  }, [params]);

  const rows = useMemo(() => {
    if (forceEmpty) return [] as ProjectCard[];
    const filtered = filterProjects(PROJECTS, {
      q: isBm ? '' : q,
      categories: isBm ? new Set() : categories,
      budgets: isBm ? new Set() : budgets,
      stacks: isBm ? new Set() : stacks,
      deadline: isBm ? 'all' : deadline,
      openOnly: isBm ? true : showOpen,
      closedOnly: isBm ? true : showClosed,
      bookmarksOnly: isBm,
      bookmarkedIds: bookmarked,
    });
    return sortProjects(filtered, sort).slice(0, PAGE_SIZE);
  }, [
    forceEmpty,
    isBm,
    q,
    categories,
    budgets,
    stacks,
    deadline,
    showOpen,
    showClosed,
    bookmarked,
    sort,
  ]);

  if (apiAccessToken.trim()) return <LiveProjectList styles={s} />;

  if (!DEMO_DATA_ENABLED) return <AuthRequired />;

  const empty = forceEmpty || rows.length === 0;

  const countText = isBm
    ? (() => {
        const ids = [...bookmarked];
        const list = PROJECTS.filter((p) => ids.includes(p.id));
        const open = list.filter((p) => !p.closed).length;
        const closed = list.filter((p) => p.closed).length;
        return `북마크 ${list.length}건 · 모집 중 ${open} · 마감 ${closed}`;
      })()
    : forceEmpty
      ? DEMO.countEmpty
      : DEMO.countAll;

  const clearFilters = () => {
    setCategories(new Set());
    setBudgets(new Set());
    setStacks(new Set());
    setDeadline('all');
    setShowOpen(true);
    setShowClosed(true);
    setQInput('');
    setQ('');
    setSort('latest');
    navigate(FIND_HREF);
  };

  const applyMyStack = () => {
    setStacks(new Set(MY_STACK));
    setQInput('');
    setQ('');
    navigate(FIND_HREF);
  };

  const toggleBm = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSet = (setter: (fn: (prev: Set<string>) => Set<string>) => void, name: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const setMockAll = () => {
    const qn = new URLSearchParams(params);
    qn.delete('mock');
    qn.delete('view');
    setParams(qn, { replace: true });
  };

  return (
    <div className={s.page} data-screen="Find-Supplier">
      <div className={s.head}>
        <h1 className={s.title}>{isBm ? DEMO.bmTitle : DEMO.findTitle}</h1>
        <p className={s.sub}>{isBm ? DEMO.bmSub : DEMO.findSub}</p>
      </div>

      {!isBm ? (
        <form
          className={s.sbar}
          onSubmit={(e) => {
            e.preventDefault();
            setQ(qInput);
            if (forceEmpty) setMockAll();
          }}
        >
          <div className={s.qbox}>
            <svg className={s.qIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              className={s.inp}
              type="search"
              aria-label={DEMO.searchLabel}
              placeholder={DEMO.searchPlaceholder}
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary">{DEMO.searchBtn}</Button>
        </form>
      ) : null}

      <div className={`${s.lay} ${isBm ? s.layOne : ''}`}>
        {!isBm ? (
          <aside className={s.flt} aria-label="필터">
            <div className={s.grp}>
              <p className={s.gt}>
                카테고리
                <button type="button" className={s.gtBtn} onClick={() => setCategories(new Set())}>초기화</button>
              </p>
              {CATEGORIES.map((c) => (
                <label key={c.name} className={s.ck}>
                  <input
                    type="checkbox"
                    checked={categories.has(c.name)}
                    onChange={() => toggleSet(setCategories, c.name)}
                  />
                  {c.name}
                  <span className={s.ckCount}>{c.count}</span>
                </label>
              ))}
            </div>

            <div className={s.grp}>
              <p className={s.gt}>예산 범위</p>
              {BUDGET_FILTERS.map((b) => (
                <label key={b} className={s.ck}>
                  <input
                    type="checkbox"
                    checked={budgets.has(b)}
                    onChange={() => toggleSet(setBudgets, b)}
                  />
                  {b}
                </label>
              ))}
            </div>

            <div className={s.grp}>
              <p className={s.gt}>
                기술 스택
                <button type="button" className={s.gtBtn} onClick={() => setStacks(new Set(MY_STACK))}>
                  내 스택
                </button>
              </p>
              <div className={s.tagrow}>
                {STACK_FILTERS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`${s.ftag} ${stacks.has(name) ? s.ftagOn : ''}`}
                    aria-pressed={stacks.has(name)}
                    onClick={() => toggleSet(setStacks, name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.grp}>
              <p className={s.gt}>마감일</p>
              {(
                [
                  ['3', '3일 안'],
                  ['7', '7일 안'],
                  ['all', '전체'],
                ] as const
              ).map(([val, label]) => (
                <label key={val} className={s.ck}>
                  <input
                    type="radio"
                    name="deadline"
                    checked={deadline === val}
                    onChange={() => setDeadline(val)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className={s.grp}>
              <p className={s.gt}>모집 상태</p>
              <label className={s.ck}>
                <input type="checkbox" checked={showOpen} onChange={(e) => setShowOpen(e.target.checked)} />
                모집 중
              </label>
              <label className={s.ck}>
                <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
                마감
              </label>
            </div>

            <button type="button" className={s.reset} onClick={clearFilters}>
              {DEMO.clearFilters}
            </button>
          </aside>
        ) : null}

        <section aria-label="프로젝트 목록">
          <div className={s.rbar}>
            <p className={s.cnt}>
              {countText.includes('건') ? (
                <>
                  {countText.split(/(\d+)/).map((part, i) =>
                    /^\d+$/.test(part) ? <b key={i}>{part}</b> : <span key={i}>{part}</span>,
                  )}
                </>
              ) : (
                countText
              )}
            </p>
            <div className={s.sort} role="group" aria-label="정렬">
              {SORTS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`${s.cseg} ${sort === opt.key ? s.csegOn : ''}`}
                  aria-pressed={sort === opt.key}
                  onClick={() => setSort(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {!empty ? (
            <>
              <div className={s.plist}>
                {rows.map((p) => (
                  <ProjectRow
                    key={p.id}
                    project={p}
                    bookmarked={bookmarked.has(p.id)}
                    onToggleBm={() => toggleBm(p.id)}
                  />
                ))}
              </div>
              {!isBm ? (
                <nav className={s.pager} aria-label="쪽">
                  <span className={s.pagerOff}>이전</span>
                  <span className={s.pagerOn}>1</span>
                  <a href={FIND_HREF}>2</a>
                  <a href={FIND_HREF}>3</a>
                  <a href={FIND_HREF}>다음</a>
                </nav>
              ) : null}
            </>
          ) : (
            <EmptyState
              title={DEMO.emptyTitle(q || DEMO.emptyQ)}
              action={
                <div className={s.emptyActs}>
                  <Button variant="ghost" type="button" onClick={clearFilters}>
                    {DEMO.clearFilters}
                  </Button>
                  <Button variant="tint" type="button" onClick={applyMyStack}>
                    {DEMO.myStackView}
                  </Button>
                </div>
              }
            >
              {DEMO.emptyBody}
            </EmptyState>
          )}

          <p className={s.foot}>{isBm ? DEMO.footBm : DEMO.footFind}</p>
        </section>
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  bookmarked,
  onToggleBm,
}: {
  project: ProjectCard;
  bookmarked: boolean;
  onToggleBm: () => void;
}) {
  return (
    <article className={`${s.pc} ${project.closed ? s.pcClosed : ''}`} aria-label={project.title}>
      <div className={s.left}>
        <div className={s.top}>
          <Chip tone="neutral">{project.category}</Chip>
          {project.closed ? <Chip tone="outline">모집 마감</Chip> : null}
          <span className={`${s.dl} ${project.deadlineSoon ? s.dlSoon : ''}`}>{project.deadlineLabel}</span>
        </div>
        <h2 className={s.ti}>{project.title}</h2>
        <p className={s.it}>
          명세 항목 <b>{project.items.length}개</b> · {project.items.join(' · ')}
        </p>
        <div className={s.stk}>
          {project.stack.map((name) => (
            <span key={name} className={`${s.stag} ${isMyStack(name) ? s.stagMine : ''}`}>
              {name}
            </span>
          ))}
        </div>
      </div>
      <div className={s.right}>
        <div className={s.bud}>
          <Attr label={DEMO.budgetLabel}>{project.budget}</Attr>
        </div>
        <div className={s.rt2}>
          <button
            type="button"
            className={`${s.bm} ${bookmarked ? s.bmOn : ''}`}
            aria-pressed={bookmarked}
            aria-label="북마크"
            onClick={onToggleBm}
          >
            <svg viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 3.5h12v17l-6-4-6 4z" />
            </svg>
          </button>
          <Button
            variant={project.closed ? 'ghost' : 'tint'}
            size="sm"
            to={PROJECT_DETAIL_HREF}
          >
            {project.closed ? DEMO.closedBtn : DEMO.openBtn}
          </Button>
        </div>
      </div>
    </article>
  );
}

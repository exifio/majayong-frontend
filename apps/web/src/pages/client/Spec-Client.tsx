/* 명세 보기 — 보드 Spec-Client · /c/projects/:pid · M2
 * 상태: 기본 / 명세 고치기 확인 / 마감 연장 / 임시 계약 중 / 모집 시작됨
 * AI 금액 · 블록 금액 없음. F-03 · 11.2 · 13.2(마감 연장). */
import { useEffect, useId, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  LoadingState,
  Band,
  Button,
  Chip,
  ConfirmDialog,
  Modal,
  Money,
  StatusChip,
} from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { projectStatusLabel } from '@/lib/project-adapter';
import { formatDateInput } from '@/lib/draft-adapter';
import type { ExtendDeadlineResultDto, MyProjectDetailDto } from '@majayong/types/api';
import {
  DEMO,
  DRAFT_HREF,
  DEFAULT_PID,
  EXTENDABLE_STATUSES,
  EXTEND_ERROR_MESSAGES,
  MY_HREF,
  compareHref,
  extendedDeadlineOf,
  isWithinExtend,
  resolveSpecMock,
  specDemoOf,
} from './Spec-Client.data';
import s from './Spec-Client.module.css';

export default function SpecClient() {
  const { pid = DEFAULT_PID } = useParams();
  const { apiAccessToken } = useSession();
  const live = Boolean(apiAccessToken.trim()) || !import.meta.env.DEV;
  if (live) return <LiveSpec pid={pid} />;
  return <DemoSpec pid={pid} />;
}

function LiveSpec({ pid }: { pid: string }) {
  const { apiAccessToken } = useSession();
  const [project, setProject] = useState<MyProjectDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extOpen, setExtOpen] = useState(false);
  const [extended, setExtended] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    apiRequest('getMyProject', `/me/projects/${encodeURIComponent(pid)}`, { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        setProject(response.data);
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setError(caught instanceof ApiRequestError ? caught.message : '프로젝트를 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [pid, apiAccessToken]);

  if (loading) {
    return (
      <div className={s.page} data-screen="Spec-Client">
        <LoadingState label="프로젝트를 불러오는 중입니다." />
      </div>
    );
  }

  if (error || project === null) {
    return (
      <div className={s.page} data-screen="Spec-Client">
        <p className={s.crumb}><Link to="/c/projects">내 프로젝트</Link></p>
        <p role="alert" style={{ padding: 24 }}>{error ?? '프로젝트를 찾을 수 없습니다.'}</p>
        <Button variant="tint" to="/c/projects">내 프로젝트로</Button>
      </div>
    );
  }

  const deadline = project.deadline ? new Date(project.deadline).toLocaleDateString('ko-KR') : '정하지 않음';
  const canExtend = project.deadline !== null && (EXTENDABLE_STATUSES as readonly string[]).includes(project.status);
  return (
    <div className={s.page} data-screen="Spec-Client">
      <p className={s.crumb}>
        <Link to="/c/projects">내 프로젝트</Link> › {project.title}
      </p>
      <div className={s.head}>
        <div className={s.chips}>
          <StatusChip status={projectStatusLabel(project.status)} />
          {project.deadline && <Chip tone="amber">모집 마감 {deadline}</Chip>}
        </div>
        <h1 className={s.title}>{project.title}</h1>
        <p className={s.meta}>
          상세 열람 <b>{project.detailViewCount}</b>
          <span className={s.metaSep}>|</span>
          지원 <b>{project.applicationCount}</b>
          <span className={s.metaSep}>|</span>
          명세 버전 <b>{project.currentVersion}</b>
        </p>
      </div>

      {extended && (
        <div className={s.startedBand}>
          <Band tone="done" title="모집 마감을 연장했습니다">
            새 마감은 {extended}입니다. 받은 견적은 그대로 두고 지원을 계속 받습니다.
          </Band>
        </div>
      )}

      <div className={s.lay}>
        <div>
          <div className={s.secH}>
            <h2>모집 현황</h2>
            <p>이 프로젝트의 명세는 비밀유지에 동의한 공급자에게 공개됩니다.</p>
          </div>
          <section className={s.fc} aria-label="지원 현황">
            <p className={s.ds}>
              지원한 공급자 {project.applicationCount}명 · 상세 열람 {project.detailViewCount}회 · 명세 버전 {project.currentVersion}
            </p>
          </section>

          <div className={s.secH}>
            <h2>명세</h2>
            <p>현재 버전에 포함된 기능입니다. 계약 전 공급자에게 공개되는 내용과 같습니다.</p>
          </div>
          <section className={s.fc} aria-label="명세 항목">
            {project.items.length === 0 ? (
              <p className={s.ds}>표시할 명세 항목이 없습니다.</p>
            ) : (
              project.items.map((item) => (
                <article key={item.specItemId} aria-label={item.title}>
                  <b>{item.title}</b>
                  <p className={s.ds}>{item.description}</p>
                </article>
              ))
            )}
          </section>
        </div>

        <aside className={s.rail}>
          <section className={s.card} aria-labelledby="p-h">
            <h3 id="p-h">모집</h3>
            <div className={s.kv}>
              <div className={s.r}><span>모집 마감</span><b>{deadline}</b></div>
              <div className={s.r}><span>상세 열람</span><b>{project.detailViewCount}</b></div>
              <div className={s.r}><span>받은 견적</span><b>{project.applicationCount}</b></div>
            </div>
            <div className={s.acts}>
              <Button variant="tint" full to={`/c/projects/${encodeURIComponent(pid)}/proposals`}>
                제안 비교 보기
              </Button>
              <Button variant="ghost" full to="/c/projects">내 프로젝트로</Button>
              {canExtend ? (
                <div className={s.extendLink}>
                  <Button variant="text" onClick={() => setExtOpen(true)}>마감 연장</Button>
                </div>
              ) : null}
            </div>
          </section>
          <p className={s.railNote}>명세 내용 고치기는 아직 이 화면에서 지원하지 않습니다. 마감 연장은 모집 중 · 선정 중 · 마감된 프로젝트에서 할 수 있습니다.</p>
        </aside>
      </div>

      {extOpen && project.deadline && (
        <LiveExtendModal
          pid={pid}
          currentDeadline={project.deadline}
          onClose={() => setExtOpen(false)}
          onDone={(next) => {
            setProject((current) => current ? { ...current, deadline: next.deadline, status: next.status, selectionEndsAt: null } : current);
            setExtended(new Date(next.deadline).toLocaleDateString('ko-KR'));
            setExtOpen(false);
          }}
        />
      )}
    </div>
  );
}

function LiveExtendModal({
  pid,
  currentDeadline,
  onClose,
  onDone,
}: {
  pid: string;
  currentDeadline: string;
  onClose: () => void;
  onDone: (result: ExtendDeadlineResultDto) => void;
}) {
  const { apiAccessToken } = useSession();
  const dateId = useId();
  const current = new Date(currentDeadline);
  const minDate = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
  const maxDate = new Date(current.getFullYear(), current.getMonth(), current.getDate() + DEMO.extendMaxDays);
  const [picked, setPicked] = useState(formatDateInput(new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7)));
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const next = extendedDeadlineOf(currentDeadline, picked);

  async function submit() {
    if (!next || busy) return;
    setBusy(true);
    setSubmitError(null);
    try {
      const response = await apiRequest('extendProjectDeadline', `/projects/${encodeURIComponent(pid)}/extend-deadline`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { deadline: next.toISOString() },
      });
      onDone(response.data);
    } catch (caught) {
      setSubmitError(caught instanceof ApiRequestError
        ? EXTEND_ERROR_MESSAGES[caught.code] ?? '마감을 연장하지 못했습니다. 다시 시도해 주세요.'
        : '마감을 연장하지 못했습니다. 다시 시도해 주세요.');
      setBusy(false);
    }
  }

  return (
    <Modal
      title={DEMO.extendTitle}
      size="content"
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          {busy ? (
            <Button variant="primary" disabled disabledReason="마감을 연장하고 있습니다.">연장 중…</Button>
          ) : (
            <Button variant="primary" onClick={() => void submit()} disabled={!next} disabledReason={DEMO.extendHint}>
              마감 연장
            </Button>
          )}
        </>
      }
    >
      <p className={s.editLead}>{DEMO.extendLead}</p>
      <div className={s.dr}>
        <div>
          <p className={s.drK}>지금 마감</p>
          <div className={s.now}>{current.toLocaleDateString('ko-KR')}</div>
        </div>
        <div className={s.ar} aria-hidden="true">→</div>
        <div>
          <p className={s.drK}><label htmlFor={dateId}>새 마감</label></p>
          <input
            id={dateId}
            className={`${s.inp} ${next ? '' : s.inpErr}`}
            type="date"
            min={formatDateInput(minDate)}
            max={formatDateInput(maxDate)}
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
            aria-label="새 마감일"
            aria-invalid={!next}
            aria-describedby={next ? `${dateId}-hint` : `${dateId}-err`}
          />
        </div>
      </div>
      {next ? (
        <p id={`${dateId}-hint`} className={s.hint}>{DEMO.extendHint} 마감 시각은 지금과 같습니다.</p>
      ) : (
        <p id={`${dateId}-err`} className={s.err} role="alert">{DEMO.extendHint}</p>
      )}
      {submitError && <p className={s.err} role="alert">{submitError}</p>}
      <p className={s.hint}>지원은 계속 받고, 이미 받은 견적은 그대로 둡니다. 모집 상태는 다시 &apos;모집 중&apos;이 됩니다.</p>
    </Modal>
  );
}

function DemoSpec({ pid = DEFAULT_PID }: { pid?: string }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveSpecMock(params.get('mock'));
  const demo = specDemoOf(mock);

  const [editOpen, setEditOpen] = useState(demo.openEdit);
  const [extOpen, setExtOpen] = useState(demo.openExtend);
  const [newDeadline, setNewDeadline] = useState(DEMO.extendDefault);
  const dateId = useId();

  useEffect(() => {
    const next = specDemoOf(mock);
    setEditOpen(next.openEdit);
    setExtOpen(next.openExtend);
    setNewDeadline(DEMO.extendDefault);
  }, [mock]);

  const setMock = (next: string | null) => {
    const q = new URLSearchParams(params);
    if (!next || next === '기본') q.delete('mock');
    else q.set('mock', next);
    setParams(q, { replace: true });
  };

  const closeEdit = () => {
    setEditOpen(false);
    if (mock === '명세 고치기 확인') setMock('기본');
  };

  const closeExt = () => {
    setExtOpen(false);
    if (mock === '마감 연장') setMock('기본');
  };

  const extendOk = isWithinExtend(newDeadline);

  return (
    <div className={s.page} data-screen="Spec-Client">
      {demo.started && (
        <div className={s.startedBand}>
          <Band tone="done" title={`${DEMO.startedTitle} · ${DEMO.startedBody}`}>
            {DEMO.startedSub}
          </Band>
        </div>
      )}

      <p className={s.crumb}>
        <Link to={MY_HREF}>내 프로젝트</Link> › {DEMO.title}
      </p>
      <div className={s.head}>
        <div className={s.chips}>
          {demo.chipTone === 'blue' ? (
            <StatusChip status="모집 중" />
          ) : (
            <Chip tone="amber">{demo.chip}</Chip>
          )}
          <Chip tone="amber">{DEMO.deadlineLabel}</Chip>
        </div>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.meta}>
          {DEMO.industry}
          <span className={s.metaSep}>|</span>
          {DEMO.registered}
          <span className={s.metaSep}>|</span>
          상세 열람 <b>{demo.views}</b> · 지원 <b>{demo.apps}</b>
        </p>
      </div>

      <div className={s.pub} aria-label="공개 범위">
        {DEMO.pub.map((p) => (
          <div key={p.title}>
            <p className={s.pubK}>
              {p.title}
              <span className={s.pubWho}>{p.who}</span>
            </p>
            <p className={s.pubBody}>{p.body}</p>
          </div>
        ))}
      </div>

      <div className={s.lay}>
        <div>
          <div className={s.secH}>
            <h2>기능 {DEMO.fns.length}개</h2>
            <p>공급자에게 이 명세가 그대로 보입니다</p>
          </div>

          {DEMO.fns.map((f) => (
            <section key={f.no} className={s.fc} aria-label={f.name}>
              <div className={s.nmr}>
                <span className={s.no}>{f.no}</span>
                <span className={s.nm}>{f.name}</span>
              </div>
              <p className={s.ds}>{f.description}</p>
              <div className={s.dec}>
                <p className={s.decK}>공급자와 정할 것</p>
                <div className={s.tg}>
                  {f.conditions.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
                {f.memo ? (
                  <p className={s.memo}>
                    <span className={s.memoLabel}>내 메모</span>
                    {f.memo}
                  </p>
                ) : null}
              </div>
            </section>
          ))}

          <section className={s.fc} aria-label="지급 구간과 비율">
            <div className={s.nmr}>
              <span className={s.no} aria-hidden="true" />
              <span className={s.nmPay}>지급 구간 · 비율</span>
            </div>
            <p className={`${s.ds} ${s.dsPay}`}>{DEMO.payGuide}</p>
          </section>

          <div className={s.secH} style={{ marginTop: 22 }}>
            <h2>화면 초안</h2>
            <p>초안을 고치며 만든 화면 · 참고용</p>
          </div>
          <div className={s.wfs}>
            {DEMO.thumbs.map((t) => (
              <div key={t.name} className={s.wf}>
                <Wireframe kind={t.kind} />
                <p className={s.cap}>
                  <b>{t.name}</b> · {t.cap}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className={s.rail}>
          <section className={s.card} aria-labelledby="b-h">
            <h3 id="b-h">희망 예산</h3>
            <Money amount={DEMO.hopeBudget} size="big" />
            <p className={s.budHint}>{DEMO.hopeHint}</p>
          </section>

          <section className={s.card} aria-labelledby="p-h">
            <h3 id="p-h">모집</h3>
            <div className={s.kv}>
              <div className={s.r}>
                <span>모집 기간</span>
                <b>{DEMO.period}</b>
              </div>
              <div className={s.r}>
                <span>상세 열람</span>
                <b>{demo.views}</b>
              </div>
              <div className={s.r}>
                <span>받은 견적</span>
                <b>{demo.apps}</b>
              </div>
            </div>

            <div className={s.acts}>
              <Button variant="tint" full to={compareHref(pid)}>
                제안 비교 보기
              </Button>

              {demo.canEdit ? (
                <Button variant="ghost" full onClick={() => setEditOpen(true)}>
                  명세 고치기
                </Button>
              ) : (
                <>
                  <Button variant="ghost" full disabled disabledReason={DEMO.heldReason}>
                    명세 고치기
                  </Button>
                  <p className={s.why}>{DEMO.heldWhy}</p>
                </>
              )}

              {demo.canEdit ? (
                <div className={s.extendLink}>
                  <Button variant="text" onClick={() => setExtOpen(true)}>
                    마감 연장
                  </Button>
                </div>
              ) : null}
            </div>
          </section>

          <p className={s.railNote}>{DEMO.railNote}</p>
        </aside>
      </div>

      {editOpen && (
        <ConfirmDialog
          title={DEMO.editTitle}
          confirmLabel="명세 고치기"
          onConfirm={() => navigate(DRAFT_HREF)}
          onCancel={closeEdit}
        >
          <p className={s.editLead}>{DEMO.editLead}</p>
          <div className={s.warnb}>
            <b>지금 받은 견적 3건이 &apos;이전 명세 기준&apos;이 됩니다.</b>{' '}
            고친 명세로 새 견적이 들어오기 전까지 이 견적들로는 계약을 진행할 수 없습니다.
          </div>
          <ul className={s.lst}>
            <li>
              세 공급자에게 <b>재견적 요청</b> 알림이 갑니다.
            </li>
            <li>
              공급자와 나눈 <b>채팅은 그대로</b> 이어집니다.
            </li>
            <li>모집 마감일은 바뀌지 않습니다. 필요하면 마감을 연장하세요.</li>
            <li>임시 계약 중에는 명세를 고칠 수 없습니다.</li>
          </ul>
        </ConfirmDialog>
      )}

      {extOpen && (
        <Modal
          title={DEMO.extendTitle}
          size="content"
          onClose={closeExt}
          actions={
            <>
              <Button variant="ghost" onClick={closeExt}>
                취소
              </Button>
              {extendOk ? (
                <Button variant="primary" onClick={closeExt}>
                  마감 연장
                </Button>
              ) : (
                <Button variant="primary" disabled disabledReason={DEMO.extendHint}>
                  마감 연장
                </Button>
              )}
            </>
          }
        >
          <p className={s.editLead}>{DEMO.extendLead}</p>
          <div className={s.dr}>
            <div>
              <p className={s.drK}>지금 마감</p>
              <div className={s.now}>{DEMO.extendNow}</div>
            </div>
            <div className={s.ar} aria-hidden="true">
              →
            </div>
            <div>
              <p className={s.drK}>
                <label htmlFor={dateId}>새 마감</label>
              </p>
              <input
                id={dateId}
                className={`${s.inp} ${extendOk ? '' : s.inpErr}`}
                type="text"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                aria-label="새 마감일"
                aria-invalid={!extendOk}
                aria-describedby={extendOk ? `${dateId}-hint` : `${dateId}-err`}
              />
            </div>
          </div>
          {extendOk ? (
            <p id={`${dateId}-hint`} className={s.hint}>
              {DEMO.extendHint}
            </p>
          ) : (
            <p id={`${dateId}-err`} className={s.err} role="alert">
              {DEMO.extendHint}
            </p>
          )}
          <p className={s.hint}>{DEMO.extendKeep}</p>
        </Modal>
      )}
    </div>
  );
}

function Wireframe({ kind }: { kind: 'cal' | 'pay' | 'list' }) {
  if (kind === 'cal') {
    const cells = [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
    return (
      <div className={s.scr} aria-hidden="true">
        <i className={`${s.bar} ${s.barH}`} />
        <div className={s.gr}>
          {cells.map((on, i) => (
            <i key={i} className={`${s.bar} ${on ? s.on : ''}`} />
          ))}
        </div>
        <i className={s.bar} style={{ width: '70%' }} />
      </div>
    );
  }
  if (kind === 'pay') {
    return (
      <div className={s.scr} aria-hidden="true">
        <i className={`${s.bar} ${s.barH}`} />
        <i className={s.bar} style={{ width: '80%' }} />
        <i className={s.bar} style={{ width: '60%' }} />
        <div className={s.bx} />
        <div className={s.bt} />
      </div>
    );
  }
  return (
    <div className={s.scr} aria-hidden="true">
      <i className={`${s.bar} ${s.barH}`} />
      <i className={s.bar} />
      <i className={s.bar} style={{ width: '85%' }} />
      <i className={s.bar} />
      <i className={s.bar} style={{ width: '75%' }} />
      <i className={s.bar} />
      <i className={s.bar} style={{ width: '65%' }} />
    </div>
  );
}

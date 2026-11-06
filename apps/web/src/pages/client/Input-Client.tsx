/* 입력 — 보드 Input-Client · /c/drafts/new · M1
 * 상태: 첫 방문 / 작성 중 초안 있음 / 한도 도달 */
import { useEffect, useId, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  LoadingState,
  Button,
  ConfirmDialog,
  Money,
  Note,
  StatusChip,
  TextAreaField,
} from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { draftTitle } from '@/lib/draft-adapter';
import type { DraftDto } from '@majayong/types/api';
import {
  DRAFT_CREATING_HREF,
  DRAFT_HREF,
  inputDemoOf,
  resolveInputMock,
  type DraftRow,
} from './Input-Client.data';
import { quoteOf } from './Draft-Client.data';
import s from './Input-Client.module.css';

export default function InputClient() {
  const { apiAccessToken } = useSession();
  const live = Boolean(apiAccessToken.trim()) || !import.meta.env.DEV;
  return live ? <LiveInput /> : <DemoInput />;
}

function draftRowOf(dto: DraftDto): DraftRow {
  const added = dto.blocks.filter((block) => block.status === 'ADDED');
  const quote = quoteOf(added.map((block) => ({ amount: block.unitPrice })));
  const remaining = Math.max(0, 30 - dto.chatEditCount);
  const pending = dto.pendingFeatures.length > 0 ? ` · 반영 대기 ${dto.pendingFeatures.length}건` : '';
  return {
    id: dto.id,
    when: new Date(dto.lastActiveAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
    title: added.length > 0 ? draftTitle(added.map((block) => block.block.name)) : '새 초안',
    meta: `명세 항목 ${added.length}개 · 채팅 수정 ${remaining}회 남음${pending}`,
    amount: quote.total,
    ...(quote.tbd > 0 ? { tbd: `+ 금액 미정 ${quote.tbd}건` } : {}),
  };
}

function LiveInput() {
  const { apiAccessToken } = useSession();
  const navigate = useNavigate();
  const copy = inputDemoOf('첫 방문');
  const [pain, setPain] = useState('');
  const [budget, setBudget] = useState('');
  const [drafts, setDrafts] = useState<DraftDto[]>([]);
  const [archived, setArchived] = useState<DraftDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<'SENTENCE' | 'DEFAULT_DRAFT' | null>(null);
  const [archOpen, setArchOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DraftDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useMemo(() => async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('listDrafts', '/drafts', { accessToken: apiAccessToken, signal });
      setDrafts(response.data.filter((draft) => draft.status === 'IN_PROGRESS'));
      setArchived(response.data.filter((draft) => draft.status === 'ABANDONED'));
    } catch (caught) {
      if (caught instanceof Error && caught.name === 'AbortError') return;
      setError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }, [apiAccessToken]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const atLimit = drafts.length >= 3;
  const canStart = !atLimit && !creating;

  async function createDraft(entryType: 'SENTENCE' | 'DEFAULT_DRAFT') {
    if (creating) return;
    if (entryType === 'SENTENCE' && !pain.trim()) {
      setError('불편한 점을 먼저 적어 주세요.');
      return;
    }
    setCreating(entryType);
    setError(null);
    try {
      const created = await apiRequest('createDraft', '/drafts', {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: entryType === 'SENTENCE'
          ? { entryType, text: pain.trim() }
          : { entryType },
      });
      const parsedBudget = parseBudget(budget);
      if (parsedBudget !== null) {
        await apiRequest('updateHopeBudget', `/drafts/${encodeURIComponent(created.data.id)}/budget`, {
          method: 'PATCH',
          accessToken: apiAccessToken,
          jsonBody: { hopeBudget: parsedBudget },
        });
      }
      navigate(`/c/drafts/${encodeURIComponent(created.data.id)}`);
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setCreating(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await apiRequest('deleteDraft', `/drafts/${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
        accessToken: apiAccessToken,
      });
      setDeleteTarget(null);
      await load();
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setDeleting(false);
    }
  }

  async function restore(draft: DraftDto) {
    setError(null);
    try {
      await apiRequest('restoreDraft', `/drafts/${encodeURIComponent(draft.id)}/restore`, {
        method: 'POST',
        accessToken: apiAccessToken,
      });
      await load();
    } catch (caught) {
      setError(messageOf(caught));
    }
  }

  return (
    <div className={s.page} data-screen="Input-Client">
      <div className={s.intro}>
        <h1>요즘 어떤 점이 불편하세요?</h1>
        <p className={s.introLead}>한 문장이면 충분합니다. 어떤 기능이 필요한지는 저희가 화면으로 먼저 그려드립니다.</p>
      </div>

      <section className={s.ask} aria-label="새 초안 시작">
        <TextAreaField
          label="지금 겪고 계신 불편"
          placeholder={copy.placeholder}
          value={pain}
          onChange={(e) => setPain(e.target.value)}
          style={{ minHeight: 132, fontSize: 17, lineHeight: 1.65 }}
        />

        <div className={s.fieldGap}>
          <BudgetField value={budget} onChange={setBudget} />
        </div>

        {atLimit && (
          <div className={s.limitNote}>
            <Note title={copy.limitNoteTitle}>{copy.limitNoteBody}</Note>
          </div>
        )}

        {error && <p className={s.goNote} role="alert">{error}</p>}

        <div className={s.go}>
          {canStart ? (
            <Button variant="primary" size="lg" full onClick={() => void createDraft('SENTENCE')}>
              화면 초안 받아보기
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              full
              disabled
              disabledReason={atLimit ? copy.limitReason : '초안을 만드는 중입니다.'}
            >
              {creating === 'SENTENCE' ? '초안 만드는 중…' : '화면 초안 받아보기'}
            </Button>
          )}
          <p className={s.goNote}>8초 안에 나옵니다. 마음에 들지 않으면 '처음부터'로 다시 시작할 수 있습니다.</p>
        </div>

        <div className={s.or}>또는</div>

        <div className={s.alt}>
          <div className={s.altText}>
            <p className={s.altTitle}>적기 어려우시면 업종만 골라 시작하세요</p>
            <p className={s.altSec}>지금은 예약 식당 한 업종입니다. 이 업종에 흔히 들어가는 기능으로 초안을 바로 그립니다. 1초면 나옵니다.</p>
          </div>
          {canStart ? (
            <Button variant="tint" onClick={() => void createDraft('DEFAULT_DRAFT')}>
              예약 식당 기본 구성으로 시작하기
            </Button>
          ) : (
            <Button
              variant="tint"
              disabled
              disabledReason={atLimit ? copy.limitReason : '초안을 만드는 중입니다.'}
            >
              {creating === 'DEFAULT_DRAFT' ? '초안 만드는 중…' : '예약 식당 기본 구성으로 시작하기'}
            </Button>
          )}
        </div>
      </section>

      {loading ? (
        <LoadingState label="초안을 불러오는 중입니다." />
      ) : (
        (drafts.length > 0 || archived.length > 0) && (
          <section className={s.drafts} aria-labelledby="dh">
            <div className={s.draftHead}>
              <h2 id="dh">작성 중인 초안</h2>
              <span className={s.count}>작성 중 <b>{drafts.length}</b> / 3</span>
            </div>

            {drafts.map((draft) => {
              const row = draftRowOf(draft);
              return (
                <DraftItem
                  key={draft.id}
                  row={row}
                  status="작성 중"
                  onDelete={() => setDeleteTarget(draft)}
                  continueTo={`/c/drafts/${encodeURIComponent(draft.id)}`}
                />
              );
            })}

            {archived.length > 0 && (
              <>
                <button
                  type="button"
                  className={s.archBar}
                  aria-expanded={archOpen}
                  onClick={() => setArchOpen((value) => !value)}
                >
                  <span>보관된 초안 {archived.length}개</span>
                  <span className={s.archBarRight}>
                    {archOpen ? '접기' : '펼치기'}
                    {archOpen ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
                  </span>
                </button>
                {archOpen && (
                  <div className={s.arch}>
                    {archived.map((draft) => (
                      <DraftItem
                        key={draft.id}
                        row={draftRowOf(draft)}
                        status="보관됨"
                        onDelete={() => setDeleteTarget(draft)}
                        onRestore={() => void restore(draft)}
                      />
                    ))}
                    <p className={s.archNote}>{copy.archivedNote}</p>
                  </div>
                )}
              </>
            )}
          </section>
        )
      )}

      <section className={s.how} aria-labelledby="how">
        <h2 id="how">이렇게 작동합니다</h2>
        <div className={s.howCols}>
          {copy.howSteps.map((step, index) => (
            <div key={step.title}>
              <div className={s.howCard}>
                <span className={s.stepNum}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {deleteTarget && (
        <ConfirmDialog
          title="이 초안을 삭제할까요?"
          confirmLabel={deleting ? '삭제 중…' : '삭제하기'}
          danger
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteTarget(null)}
        >
          ‘{draftRowOf(deleteTarget).title}’을 삭제합니다. 적으신 문장과 고친 내용이 모두 사라지고 <strong>되돌릴 수 없습니다.</strong>
        </ConfirmDialog>
      )}
    </div>
  );
}

function parseBudget(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function messageOf(error: unknown): string {
  return error instanceof ApiRequestError ? error.message : '요청을 처리하지 못했습니다. 다시 시도해 주세요.';
}

function DemoInput() {
  const [params] = useSearchParams();
  const mock = resolveInputMock(params.get('mock'));
  const data = inputDemoOf(mock);

  const [pain, setPain] = useState('');
  const [budget, setBudget] = useState(data.defaultBudget);
  const [drafts, setDrafts] = useState<DraftRow[]>(data.drafts);
  const [archived, setArchived] = useState<DraftRow[]>(data.archived);
  const [archOpen, setArchOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DraftRow | null>(null);

  useEffect(() => {
    const next = inputDemoOf(mock);
    setPain('');
    setBudget(next.defaultBudget);
    setDrafts(next.drafts);
    setArchived(next.archived);
    setArchOpen(false);
    setDeleteTarget(null);
  }, [mock]);

  const atLimit = drafts.length >= 3;
  const canStart = !atLimit;

  const archiveDraft = (row: DraftRow) => {
    setDrafts((list) => list.filter((d) => d.id !== row.id));
    setArchived((list) => [
      {
        ...row,
        when: `방금 보관 · ${row.when}`,
      },
      ...list,
    ]);
    setArchOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDrafts((list) => list.filter((d) => d.id !== id));
    setArchived((list) => list.filter((d) => d.id !== id));
    setDeleteTarget(null);
  };

  return (
    <div className={s.page} data-screen="Input-Client">
      <div className={s.intro}>
        <h1>요즘 어떤 점이 불편하세요?</h1>
        <p className={s.introLead}>한 문장이면 충분합니다. 어떤 기능이 필요한지는 저희가 화면으로 먼저 그려드립니다.</p>
      </div>

      <section className={s.ask} aria-label="새 초안 시작">
        <TextAreaField
          label="지금 겪고 계신 불편"
          placeholder={data.placeholder}
          value={pain}
          onChange={(e) => setPain(e.target.value)}
          style={{ minHeight: 132, fontSize: 17, lineHeight: 1.65 }}
        />

        <div className={s.fieldGap}>
          <BudgetField value={budget} onChange={setBudget} />
        </div>

        {atLimit && (
          <div className={s.limitNote}>
            <Note title={data.limitNoteTitle}>{data.limitNoteBody}</Note>
          </div>
        )}

        <div className={s.go}>
          {canStart ? (
            <Button variant="primary" size="lg" full to={DRAFT_CREATING_HREF}>화면 초안 받아보기</Button>
          ) : (
            <Button variant="primary" size="lg" full disabled disabledReason={data.limitReason}>
              화면 초안 받아보기
            </Button>
          )}
          <p className={s.goNote}>8초 안에 나옵니다. 마음에 들지 않으면 '처음부터'로 다시 시작할 수 있습니다.</p>
        </div>

        <div className={s.or}>또는</div>

        <div className={s.alt}>
          <div className={s.altText}>
            <p className={s.altTitle}>적기 어려우시면 업종만 골라 시작하세요</p>
            <p className={s.altSec}>지금은 예약 식당 한 업종입니다. 이 업종에 흔히 들어가는 기능으로 초안을 바로 그립니다. 1초면 나옵니다.</p>
          </div>
          {canStart ? (
            <Button variant="tint" to={DRAFT_HREF}>예약 식당 기본 구성으로 시작하기</Button>
          ) : (
            <Button variant="tint" disabled disabledReason={data.limitReason}>
              예약 식당 기본 구성으로 시작하기
            </Button>
          )}
        </div>
      </section>

      {data.showDrafts && (
        <section className={s.drafts} aria-labelledby="dh">
          <div className={s.draftHead}>
            <h2 id="dh">작성 중인 초안</h2>
            <span className={s.count}>작성 중 <b>{drafts.length}</b> / 3</span>
          </div>

          {drafts.map((d) => (
            <DraftItem
              key={d.id}
              row={d}
              status="작성 중"
              onArchive={() => archiveDraft(d)}
              onDelete={() => setDeleteTarget(d)}
              continueTo={DRAFT_HREF}
            />
          ))}

          <button
            type="button"
            className={s.archBar}
            aria-expanded={archOpen}
            onClick={() => setArchOpen((v) => !v)}
          >
            <span>보관된 초안 {archived.length}개</span>
            <span className={s.archBarRight}>
              {archOpen ? '접기' : '펼치기'}
              {archOpen ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
            </span>
          </button>

          {archOpen && (
            <div className={s.arch}>
              {archived.map((d) => (
                <DraftItem
                  key={d.id}
                  row={d}
                  status="보관됨"
                  onDelete={() => setDeleteTarget(d)}
                  reopenTo={canStart ? DRAFT_HREF : undefined}
                  reopenDisabledReason={canStart ? undefined : data.limitReason}
                />
              ))}
              <p className={s.archNote}>{data.archivedNote}</p>
            </div>
          )}
        </section>
      )}

      <section className={s.how} aria-labelledby="how">
        <h2 id="how">이렇게 작동합니다</h2>
        <div className={s.howCols}>
          {data.howSteps.map((step, i) => (
            <div key={step.title}>
              <div className={s.howCard}>
                <span className={s.stepNum}>{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {deleteTarget && (
        <ConfirmDialog
          title="이 초안을 삭제할까요?"
          confirmLabel="삭제하기"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        >
          ‘{deleteTarget.title}’을 삭제합니다. 적으신 문장과 고친 내용이 모두 사라지고 <strong>되돌릴 수 없습니다.</strong> 나중에 다시 볼 수도 있다면 보관해 두세요.
        </ConfirmDialog>
      )}
    </div>
  );
}

function BudgetField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className={s.field}>
      <label className={s.fieldLabel} htmlFor={id}>
        생각해 두신 예산<span className={s.fieldOptional}> (선택)</span>
      </label>
      <div className={s.budgetRow}>
        <input
          id={id}
          className={`${s.input} ${s.budgetInput}`}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={`${id}-hint`}
        />
        <span className={s.budgetUnit}>원</span>
      </div>
      <p id={`${id}-hint`} className={s.fieldHint}>정확하지 않아도 됩니다. 초안을 고치면서 언제든 바꿀 수 있습니다.</p>
    </div>
  );
}

function DraftItem({
  row,
  status,
  onArchive,
  onDelete,
  onRestore,
  continueTo,
  reopenTo,
  reopenDisabledReason,
}: {
  row: DraftRow;
  status: '작성 중' | '보관됨';
  onArchive?: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  continueTo?: string;
  reopenTo?: string;
  reopenDisabledReason?: string;
}) {
  return (
    <div className={s.row}>
      <div className={s.rowLeft}>
        <div className={s.rowMeta}>
          <StatusChip status={status} />
          <span className={s.when}>{row.when}</span>
        </div>
        <div className={s.title}>{row.title}</div>
        <div className={s.meta}>{row.meta}</div>
      </div>
      <div className={s.rowRight}>
        <div className={s.amtLabel}>수수료 포함 예상 총액</div>
        <div className={s.amt}><Money amount={row.amount} size="row" /></div>
        {row.tbd && <div className={s.tbd}>{row.tbd}</div>}
        <div className={s.acts}>
          {onArchive && (
            <button type="button" className={s.textAct} onClick={onArchive}>보관하기</button>
          )}
          <button type="button" className={s.textAct} onClick={onDelete}>삭제</button>
          {onRestore && (
            <Button variant="tint" size="sm" onClick={onRestore}>다시 열기</Button>
          )}
          {continueTo && (
            <Button variant="tint" size="sm" to={continueTo}>이어서 고치기</Button>
          )}
          {reopenTo && (
            <Button variant="tint" size="sm" to={reopenTo}>다시 열기</Button>
          )}
          {!reopenTo && reopenDisabledReason && (
            <Button variant="tint" size="sm" disabled disabledReason={reopenDisabledReason}>다시 열기</Button>
          )}
        </div>
      </div>
    </div>
  );
}

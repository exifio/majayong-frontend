/* 블록 검토 — 보드 Admin-Blocks · /admin/blocks · M6
 * 운영자만 접근. GET /admin/blocks, POST /admin/blocks/{id}/actions */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AdminBlockAction, AdminBlockDto } from '@majayong/types/api';
import {
  LoadingState,
  Button,
  EmptyState,
  Modal,
  Money,
  StatusChip,
  TextAreaField,
  TextField,
} from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { industryLabel } from '@/lib/industry-label';
import s from './Admin-Blocks.module.css';

const PAGE = {
  title: '블록 검토',
  sub: 'AI가 새로 만든 블록을 확인합니다. 화면은 근거만 보여 주고 판단은 운영자가 합니다.',
  listLabel: '블록 목록',
  detailLabel: '블록 상세',
  merge: '기존 블록에 병합',
  priceEdit: '단가 수정',
  deactivate: '비활성화',
  enable: '다시 켜기',
  eventNote: '이 처리는 이벤트 기록에 남습니다',
  reasonLabel: '사유',
  reasonNeed: '사유를 적어 주세요',
  cancel: '취소',
  mergeTitle: (name: string) => `‘${name}’을 기존 블록에 병합`,
  mergePick: '합칠 기존 블록',
  mergeConfirm: '병합하기',
  mergeHint:
    '합쳐진 블록은 이후 매칭 · 추천에서 빠집니다. 이미 쓰인 초안 · 명세 · 계약은 그대로 둡니다.',
  priceTitle: (name: string) => `‘${name}’ 단가 수정`,
  priceNow: '지금 단가',
  priceNew: '새 단가',
  priceConfirm: '단가 확정',
  priceHint:
    '고친 값은 이 시각 뒤 새 초안부터 쓰입니다. 이미 쓰인 초안 · 명세 · 계약은 바뀌지 않습니다.',
  deactTitle: (name: string) => `‘${name}’ 비활성화`,
  deactConfirm: '비활성화',
  deactHint:
    '이후 매칭 · 추천에서 빠집니다. 이미 쓰인 초안 · 명세 · 계약은 그대로 두고, 전체 블록에서 다시 켤 수 있습니다.',
  loadError: '블록 목록을 불러오지 못했습니다. 다시 시도해 주세요.',
  saveError: '블록 처리를 저장하지 못했습니다. 다시 시도해 주세요.',
  empty: '블록이 없습니다',
  emptyBody: '검토할 블록이 등록되면 여기에 표시됩니다.',
  saving: '저장 중',
} as const;

type LoadState = 'loading' | 'ready' | 'error';
type Panel = 'merge' | 'price' | 'deactivate' | null;

function statusOf(block: AdminBlockDto): string {
  if (block.mergedIntoId) return '병합됨';
  return block.isActive ? '사용 중' : '비활성';
}

export default function AdminBlocks() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<LoadState>('loading');
  const [blocks, setBlocks] = useState<AdminBlockDto[]>([]);
  const [panel, setPanel] = useState<Panel>(null);
  const [mergeTarget, setMergeTarget] = useState('');
  const [reason, setReason] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = (signal?: AbortSignal) => {
    setState('loading');
    return apiRequest('listAdminBlocks', '/admin/blocks', { accessToken: apiAccessToken, signal })
      .then((response) => {
        setBlocks(response.data);
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setState('error');
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
    // apiAccessToken이 바뀔 때만 다시 읽는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiAccessToken]);

  const selected = blocks.find((block) => block.id === params.get('id')) ?? blocks[0] ?? null;
  const mergeCandidates = useMemo(
    () =>
      selected
        ? blocks.filter(
            (block) => block.id !== selected.id && block.isActive && block.mergedIntoId === null,
          )
        : [],
    [blocks, selected],
  );

  const select = (id: string) => {
    navigate(`/admin/blocks?id=${encodeURIComponent(id)}`);
    closePanel();
  };

  function closePanel() {
    setPanel(null);
    setReason('');
    setTried(false);
    setError(null);
    setNotice(null);
  }

  const openPanel = (next: Exclude<Panel, null>) => {
    if (!selected) return;
    setPanel(next);
    setReason('');
    setTried(false);
    setError(null);
    setNotice(null);
    setMergeTarget(mergeCandidates[0]?.id ?? '');
    setNewPrice(String(selected.unitPrice));
  };

  const priceNum = Number(newPrice.replace(/,/g, ''));
  const reasonOk = reason.trim().length > 0;
  const canSubmit =
    panel === 'merge'
      ? reasonOk && mergeTarget.length > 0
      : panel === 'price'
        ? reasonOk && Number.isSafeInteger(priceNum) && priceNum > 0
        : panel === 'deactivate'
          ? reasonOk
          : false;

  const submit = async (action: AdminBlockAction) => {
    if (!selected) return;
    setTried(true);
    setError(null);
    if (!canSubmit) return;
    setBusy(true);
    try {
      await apiRequest(
        'executeAdminBlockAction',
        `/admin/blocks/${encodeURIComponent(selected.id)}/actions`,
        {
          method: 'POST',
          accessToken: apiAccessToken,
          jsonBody: {
            action,
            reason: reason.trim(),
            ...(action === 'UPDATE_PRICE' ? { unitPrice: priceNum } : {}),
            ...(action === 'MERGE' ? { mergedIntoId: mergeTarget } : {}),
          },
        },
      );
      await load();
      closePanel();
      setNotice('블록 처리를 저장했습니다.');
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : PAGE.saveError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.page} data-screen="Admin-Blocks">
      <header className={s.head}>
        <h1 className={s.title}>{PAGE.title}</h1>
        <p className={s.sub}>{PAGE.sub}</p>
      </header>

      {state === 'loading' ? <LoadingState label="블록 목록을 불러오는 중입니다." /> : null}
      {state === 'error' ? <p role="alert" className={s.rowMeta}>{PAGE.loadError}</p> : null}
      {state === 'ready' && blocks.length === 0 ? (
        <EmptyState title={PAGE.empty}>{PAGE.emptyBody}</EmptyState>
      ) : null}
      {notice ? <p role="status" className={s.body}>{notice}</p> : null}

      {state === 'ready' && selected ? (
        <div className={s.grid}>
          <section className={s.list} aria-label={PAGE.listLabel}>
            <ul className={s.rows}>
              {blocks.map((row) => {
                const on = row.id === selected.id;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      className={`${s.row} ${on ? s.rowOn : ''}`}
                      aria-current={on ? 'true' : undefined}
                      onClick={() => select(row.id)}
                    >
                      <span className={s.rowName}>{row.title}</span>
                      <StatusChip status={statusOf(row)} />
                      <span className={s.rowMeta}>
                        출처 프로젝트 {row.sourceProjectCount}건 · {row.industryLabel ?? industryLabel(row.industryCode)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className={s.detail} aria-label={PAGE.detailLabel}>
            <div className={s.detailHead}>
              <h2 className={s.detailTitle}>{selected.title}</h2>
              <StatusChip status={statusOf(selected)} />
            </div>
            <p className={s.detailMeta}>
              {formatDateTime(selected.createdAt)} 생성 · {selected.industryLabel ?? industryLabel(selected.industryCode)} · 출처 프로젝트{' '}
              {selected.sourceProjectCount}건
            </p>

            <p className={s.k}>기능 요약</p>
            <p className={s.body}>{selected.functionSummary}</p>
            <p className={s.body}>{selected.description}</p>

            <p className={s.k}>공급자와 정할 것</p>
            <div className={s.chips}>
              {selected.conditions.length === 0 ? (
                <span className={s.chip}>정할 것 없음</span>
              ) : (
                selected.conditions.map((condition, index) => (
                  <span key={`${condition.key}-${index}`} className={s.chip}>
                    {condition.text}
                  </span>
                ))
              )}
            </div>

            <div className={s.priceBox}>
              <span className={s.k}>AI 단가</span>
              <Money amount={selected.unitPrice} size="row" />
            </div>

            <p className={s.k}>단가 근거</p>
            <p className={s.body}>{selected.priceBasis}</p>

            <p className={s.k}>태그</p>
            <div className={s.chips}>
              {selected.techTags.length === 0 ? (
                <span className={s.chip}>태그 없음</span>
              ) : (
                selected.techTags.map((tag) => (
                  <span key={tag} className={s.chip}>
                    {tag}
                  </span>
                ))
              )}
            </div>

            {panel === null ? (
              <div className={s.actions}>
                <Button variant="tint" size="sm" type="button" onClick={() => openPanel('merge')}>
                  {PAGE.merge}
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => openPanel('price')}>
                  {PAGE.priceEdit}
                </Button>
                {selected.isActive && !selected.mergedIntoId ? (
                  <Button variant="warn" size="sm" type="button" onClick={() => openPanel('deactivate')}>
                    {PAGE.deactivate}
                  </Button>
                ) : null}
                {!selected.isActive && !selected.mergedIntoId ? (
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setReason('다시 사용합니다.');
                      setPanel('deactivate');
                    }}
                  >
                    {PAGE.enable}
                  </Button>
                ) : null}
              </div>
            ) : null}
            <p className={s.eventNote}>{PAGE.eventNote}</p>
          </aside>
        </div>
      ) : null}

      {panel === 'merge' ? (
        <Modal
          title={PAGE.mergeTitle(selected?.title ?? '')}
          onClose={closePanel}
          actions={
            <>
              <Button variant="ghost" onClick={closePanel}>{PAGE.cancel}</Button>
              <Button
                variant="primary"
                disabled={!canSubmit || busy}
                disabledReason={!canSubmit ? PAGE.reasonNeed : undefined}
                onClick={() => void submit('MERGE')}
              >
                {busy ? PAGE.saving : PAGE.mergeConfirm}
              </Button>
            </>
          }
        >
          <p className={s.modalSub}>
            {selected ? `${formatDateTime(selected.createdAt)} 생성 · AI 단가 ` : ''}
            {selected ? <Money amount={selected.unitPrice} /> : null}
          </p>
          <p className={s.k}>{PAGE.mergePick}</p>
          {mergeCandidates.length === 0 ? (
            <p className={s.hint}>합칠 수 있는 기존 블록이 없습니다.</p>
          ) : (
            <div className={s.targets} role="radiogroup" aria-label={PAGE.mergePick}>
              {mergeCandidates.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  role="radio"
                  aria-checked={mergeTarget === target.id}
                  className={`${s.target} ${mergeTarget === target.id ? s.targetOn : ''}`}
                  onClick={() => setMergeTarget(target.id)}
                >
                  <b>{target.title}</b>
                  <span>
                    <Money amount={target.unitPrice} /> · {target.industryLabel ?? industryLabel(target.industryCode)}
                  </span>
                </button>
              ))}
            </div>
          )}
          <p className={s.hint}>{PAGE.mergeHint}</p>
          <TextAreaField
            label={PAGE.reasonLabel}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={tried && !reasonOk ? PAGE.reasonNeed : undefined}
          />
          <p className={s.eventNote}>{PAGE.eventNote}</p>
          {error ? <p role="alert" className={s.hint}>{error}</p> : null}
        </Modal>
      ) : null}

      {panel === 'price' ? (
        <Modal
          title={PAGE.priceTitle(selected?.title ?? '')}
          onClose={closePanel}
          actions={
            <>
              <Button variant="ghost" onClick={closePanel}>{PAGE.cancel}</Button>
              <Button
                variant="primary"
                disabled={!canSubmit || busy}
                disabledReason={!canSubmit ? PAGE.reasonNeed : undefined}
                onClick={() => void submit('UPDATE_PRICE')}
              >
                {busy ? PAGE.saving : PAGE.priceConfirm}
              </Button>
            </>
          }
        >
          <div className={s.priceEdit}>
            <div>
              <p className={s.k}>{PAGE.priceNow}</p>
              <p className={s.curPrice}>{selected ? <Money amount={selected.unitPrice} size="row" /> : null}</p>
            </div>
            <span className={s.arrow} aria-hidden="true">→</span>
            <div className={s.newPrice}>
              <TextField
                label={PAGE.priceNew}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value.replace(/[^\d]/g, ''))}
              />
              {priceNum > 0 ? <p className={s.pricePreview}><Money amount={priceNum} /></p> : null}
            </div>
          </div>
          <p className={s.hint}>{PAGE.priceHint}</p>
          <TextAreaField
            label={PAGE.reasonLabel}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={tried && !reasonOk ? PAGE.reasonNeed : undefined}
          />
          <p className={s.eventNote}>{PAGE.eventNote}</p>
          {error ? <p role="alert" className={s.hint}>{error}</p> : null}
        </Modal>
      ) : null}

      {panel === 'deactivate' ? (
        <Modal
          title={PAGE.deactTitle(selected?.title ?? '')}
          danger
          size="confirm"
          onClose={closePanel}
          actions={
            <>
              <Button variant="ghost" onClick={closePanel}>{PAGE.cancel}</Button>
              <Button
                variant={selected?.isActive ? 'warn' : 'primary'}
                disabled={!canSubmit || busy}
                disabledReason={!canSubmit ? PAGE.reasonNeed : undefined}
                onClick={() => void submit(selected?.isActive ? 'DISABLE' : 'ENABLE')}
              >
                {busy ? PAGE.saving : selected?.isActive ? PAGE.deactConfirm : PAGE.enable}
              </Button>
            </>
          }
        >
          <p className={s.hint}>{PAGE.deactHint}</p>
          <TextAreaField
            label={PAGE.reasonLabel}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={tried && !reasonOk ? PAGE.reasonNeed : undefined}
          />
          <p className={s.eventNote}>{PAGE.eventNote}</p>
          {error ? <p role="alert" className={s.hint}>{error}</p> : null}
        </Modal>
      ) : null}
    </div>
  );
}

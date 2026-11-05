/* 블록 검토 — 보드 Admin-Blocks · /admin/blocks · M6
 * 상태: 새 블록 목록 / 병합 / 단가 수정 / 비활성화
 * F-22. 선택 블록은 ?id=. */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Modal,
  Money,
  StatusChip,
  TextAreaField,
  TextField,
} from '@/components/ui';
import { AdminDemoNotice } from '@/components/admin/AdminDemoNotice';
import {
  BLOCKS,
  DEMO,
  blockOf,
  defaultIdOf,
  resolveBlockMock,
  type BlockMock,
} from './Admin-Blocks.data';
import s from './Admin-Blocks.module.css';

export default function AdminBlocks() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveBlockMock(params.get('mock'));
  const selectedId = params.get('id') ?? defaultIdOf(mock);
  const block = blockOf(selectedId);

  const [mergeOpen, setMergeOpen] = useState(mock === '병합');
  const [priceOpen, setPriceOpen] = useState(mock === '단가 수정');
  const [deactOpen, setDeactOpen] = useState(mock === '비활성화');

  const [mergeTarget, setMergeTarget] = useState(block.mergeTargets[0]?.id ?? '');
  const [mergeReason, setMergeReason] = useState<string>(DEMO.mergeReason);
  const [newPrice, setNewPrice] = useState<string>(String(DEMO.priceNewValue));
  const [priceReason, setPriceReason] = useState<string>(DEMO.priceReason);
  const [deactReason, setDeactReason] = useState<string>(DEMO.deactReason);

  useEffect(() => {
    setMergeOpen(mock === '병합');
    setPriceOpen(mock === '단가 수정');
    setDeactOpen(mock === '비활성화');
    const b = blockOf(params.get('id') ?? defaultIdOf(mock));
    setMergeTarget(b.mergeTargets[0]?.id ?? '');
    setMergeReason(DEMO.mergeReason);
    setNewPrice(String(DEMO.priceNewValue));
    setPriceReason(DEMO.priceReason);
    setDeactReason(DEMO.deactReason);
  }, [mock, params]);

  const go = (next: BlockMock, id = selectedId) => {
    const q = new URLSearchParams();
    q.set('mock', next);
    q.set('id', id);
    navigate(`/admin/blocks?${q.toString()}`, { replace: true });
  };

  const select = (id: string) => {
    go(mock === '새 블록 목록' ? '새 블록 목록' : mock, id);
  };

  const closePanels = () => {
    setMergeOpen(false);
    setPriceOpen(false);
    setDeactOpen(false);
    go('새 블록 목록', selectedId);
  };

  const mergeOk = mergeReason.trim().length > 0 && mergeTarget.length > 0;
  const priceNum = Number(newPrice.replace(/,/g, ''));
  const priceOk = priceReason.trim().length > 0 && priceNum > 0;
  const deactOk = deactReason.trim().length > 0;
  const panelOpen = mergeOpen || priceOpen || deactOpen;

  return (
    <div className={s.page} data-screen="Admin-Blocks">
      <header className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
      </header>

      {mock !== '새 블록 목록' ? <AdminDemoNotice /> : null}

      <div className={s.grid}>
        <section className={s.list} aria-label={DEMO.listLabel}>
          <ul className={s.rows}>
            {BLOCKS.map((row) => {
              const on = row.id === block.id;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    className={`${s.row} ${on ? s.rowOn : ''}`}
                    aria-current={on ? 'true' : undefined}
                    onClick={() => select(row.id)}
                  >
                    <span className={s.rowName}>{row.name}</span>
                    <StatusChip status={row.status} />
                    <span className={s.rowMeta}>출처 프로젝트 {row.projects}건</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className={s.detail} aria-label={DEMO.detailLabel}>
          <div className={s.detailHead}>
            <h2 className={s.detailTitle}>{block.name}</h2>
            <StatusChip status={block.status} />
          </div>
          <p className={s.detailMeta}>
            {block.when} 생성 · {block.industry} · {block.use}
          </p>

          <p className={s.k}>기능 요약</p>
          <p className={s.body}>{block.summary}</p>

          <p className={s.k}>공급자와 정할 것</p>
          <div className={s.chips}>
            {block.decisions.map((d) => (
              <span key={d} className={s.chip}>
                {d}
              </span>
            ))}
          </div>

          <div className={s.priceBox}>
            <span className={s.k}>AI 단가</span>
            <Money amount={block.price} size="row" />
          </div>

          <p className={s.k}>
            비슷한 기존 블록 · {block.similarName}
            {block.similarity >= 30 ? ` · 유사도 ${block.similarity}%` : ''}
          </p>
          <p className={s.body}>{block.why}</p>

          {!panelOpen ? (
            <div className={s.actions}>
              <Button variant="ghost" size="sm" type="button" onClick={() => go('새 블록 목록')}>
                그대로 두기
              </Button>
              <Button
                variant="tint"
                size="sm"
                type="button"
                onClick={() => {
                  setMergeOpen(true);
                  go('병합', block.id);
                }}
              >
                {DEMO.merge}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setPriceOpen(true);
                  go('단가 수정', block.id);
                }}
              >
                {DEMO.priceEdit}
              </Button>
              <Button
                variant="warn"
                size="sm"
                type="button"
                onClick={() => {
                  setDeactOpen(true);
                  go('비활성화', block.id);
                }}
              >
                {DEMO.deactivate}
              </Button>
              <Button variant="primary" size="sm" type="button">
                {DEMO.approve}
              </Button>
            </div>
          ) : null}
          <p className={s.eventNote}>{DEMO.eventNote}</p>
        </aside>
      </div>

      {mergeOpen ? (
        <Modal
          title={DEMO.mergeTitle(block.name)}
          onClose={closePanels}
          actions={
            <>
              <Button variant="ghost" onClick={closePanels}>
                {DEMO.cancel}
              </Button>
              <Button
                variant="primary"
                disabled={!mergeOk}
                disabledReason={!mergeOk ? DEMO.reasonNeed : undefined}
                onClick={closePanels}
              >
                {DEMO.mergeConfirm}
              </Button>
            </>
          }
        >
          <p className={s.modalSub}>
            {block.when} 생성 · AI 단가 <Money amount={block.price} />
          </p>
          <p className={s.k}>{DEMO.mergePick}</p>
          <div className={s.targets} role="radiogroup" aria-label={DEMO.mergePick}>
            {block.mergeTargets.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={mergeTarget === t.id}
                className={`${s.target} ${mergeTarget === t.id ? s.targetOn : ''}`}
                onClick={() => setMergeTarget(t.id)}
              >
                <b>{t.name}</b>
                <span>
                  유사도 {t.similarity}% · <Money amount={t.price} /> · {t.use}
                </span>
              </button>
            ))}
          </div>
          <p className={s.hint}>{DEMO.mergeHint}</p>
          <TextAreaField
            label={DEMO.reasonLabel}
            required
            value={mergeReason}
            onChange={(e) => setMergeReason(e.target.value)}
          />
          <p className={s.eventNote}>{DEMO.eventNote}</p>
        </Modal>
      ) : null}

      {priceOpen ? (
        <Modal
          title={DEMO.priceTitle(block.name)}
          onClose={closePanels}
          actions={
            <>
              <Button variant="ghost" onClick={closePanels}>
                {DEMO.cancel}
              </Button>
              <Button
                variant="primary"
                disabled={!priceOk}
                disabledReason={!priceOk ? DEMO.reasonNeed : undefined}
                onClick={closePanels}
              >
                {DEMO.priceConfirm}
              </Button>
            </>
          }
        >
          <div className={s.priceEdit}>
            <div>
              <p className={s.k}>{DEMO.priceNow}</p>
              <p className={s.curPrice}>
                <Money amount={block.price} size="row" />
              </p>
            </div>
            <span className={s.arrow} aria-hidden="true">
              →
            </span>
            <div className={s.newPrice}>
              <TextField
                label={DEMO.priceNew}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value.replace(/[^\d]/g, ''))}
              />
              {priceNum > 0 ? (
                <p className={s.pricePreview}>
                  <Money amount={priceNum} />
                </p>
              ) : null}
            </div>
          </div>
          <p className={s.hint}>{DEMO.priceHint}</p>
          <TextAreaField
            label={DEMO.reasonLabel}
            required
            value={priceReason}
            onChange={(e) => setPriceReason(e.target.value)}
          />
          <p className={s.eventNote}>{DEMO.eventNote}</p>
        </Modal>
      ) : null}

      {deactOpen ? (
        /* ConfirmDialog는 disabledReason을 받지 않아 danger Modal로 동일 구성 */
        <Modal
          title={DEMO.deactTitle(block.name)}
          danger
          size="confirm"
          onClose={closePanels}
          actions={
            <>
              <Button variant="ghost" onClick={closePanels}>
                {DEMO.cancel}
              </Button>
              <Button
                variant="warn"
                disabled={!deactOk}
                disabledReason={!deactOk ? DEMO.reasonNeed : undefined}
                onClick={closePanels}
              >
                {DEMO.deactConfirm}
              </Button>
            </>
          }
        >
          <p className={s.hint}>{DEMO.deactHint}</p>
          <TextAreaField
            label={DEMO.reasonLabel}
            required
            value={deactReason}
            onChange={(e) => setDeactReason(e.target.value)}
          />
          <p className={s.eventNote}>{DEMO.eventNote}</p>
        </Modal>
      ) : null}
    </div>
  );
}

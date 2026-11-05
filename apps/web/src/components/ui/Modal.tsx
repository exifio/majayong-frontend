/* 모달 — 디자인 시스템 9절
 * - 페이지 위에 겹친다. 머리(제목 + ×) · 본문 · 오른쪽 정렬 버튼 줄.
 * - danger 모달에는 파란(primary) 버튼을 두지 않는다 → '취소'(ghost) + warn. 개발 모드에서 검사한다.
 * - role=dialog + 제목 연결, 열 때 첫 입력 · 닫을 때 원래 버튼으로 포커스, Esc로 닫힘. */
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';
import s from './ui.module.css';

export type ModalSize = 'confirm' | 'content' | 'large';

export function Modal({ title, onClose, size = 'content', danger, actions, children }: {
  title: string; onClose: () => void; size?: ModalSize; danger?: boolean; actions?: ReactNode; children?: ReactNode;
}) {
  const titleId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const box = boxRef.current;
    const first = box?.querySelector<HTMLElement>('input, textarea, select, button:not([data-modal-close]), a[href]');
    (first ?? box)?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    if (import.meta.env.DEV && danger && box?.querySelector('[data-btn="primary"]')) {
      console.error('[디자인 시스템 6 · 9절] 위험 행동 모달에 파란 버튼이 있습니다:', title);
    }
    return () => { document.removeEventListener('keydown', onKey); opener?.focus?.(); };
  }, [onClose, danger, title]);

  return createPortal(
    <div className={s.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={boxRef} className={`${s.modal} ${s[`modal-${size}`]}`} role="dialog" aria-modal="true"
        aria-labelledby={titleId} data-danger={danger ? 'true' : undefined} tabIndex={-1}>
        <div className={s.modalHead}>
          <h2 id={titleId} className={s.modalTitle}>{title}</h2>
          <button type="button" className={s.modalClose} onClick={onClose} aria-label="닫기" data-modal-close>
            <X size={22} />
          </button>
        </div>
        {children && <div className={s.modalBody}>{children}</div>}
        {actions && <div className={s.modalActions}>{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}

/** 확인 창 — 위험이면 warn 버튼, 아니면 primary */
export function ConfirmDialog({ title, children, confirmLabel, danger, onConfirm, onCancel }: {
  title: string; children?: ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal title={title} size="confirm" danger={danger} onClose={onCancel}
      actions={<>
        <Button variant="ghost" onClick={onCancel}>취소</Button>
        <Button variant={danger ? 'warn' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </>}>
      {children}
    </Modal>
  );
}

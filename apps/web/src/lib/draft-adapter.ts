/* 초안 API DTO를 기존 화면 모델로 옮긴다. 화면에 없는 값은 만들지 않는다. */
import type { DraftBlockDto, DraftDto } from '@majayong/types/api';
import type { DraftBlock, ExcludedBlock, WireKind } from '@/pages/client/Draft-Client.data';

/** 백엔드 `PROJECT_DISCLOSURE_CONSENT_DRAFT_VERSION`과 같은 값. */
export const PROJECT_DISCLOSURE_CONSENT_VERSION = 'project-disclosure-v0.1-draft';

/** 서버 블록 코드를 기존 화면 초안의 와이어 종류로만 맞춘다(장식용). */
export function wireKindOf(block: DraftBlockDto['block']): WireKind {
  const code = block.code.toUpperCase();
  if (code === 'RR-001') return 'calendar';
  if (code === 'RR-002') return 'calendar';
  if (code === 'RR-003') return 'guests';
  if (code === 'RR-004') return 'pay';
  if (code === 'RR-005') return 'remind';
  if (code === 'RR-006') return 'guests';
  return 'remind';
}

function firstNote(block: DraftBlockDto): { key: string; note: string } {
  const note = Array.isArray(block.conditionNotes) ? block.conditionNotes[0] : undefined;
  const key = note?.key ?? block.block.conditions[0]?.key ?? '';
  return { key, note: note?.note ?? '' };
}

export function toScreenBlock(row: DraftBlockDto): DraftBlock {
  const noted = firstNote(row);
  return {
    id: row.blockId,
    name: row.block.name,
    description: row.block.functionSummary || row.block.description,
    conditions: row.block.conditions.map((condition) => condition.text),
    memo: noted.note,
    memoKey: noted.key,
    amount: row.unitPrice,
    wire: wireKindOf(row.block),
    wide: row.block.code.toUpperCase() === 'RR-001',
  };
}

export type DraftScreen = {
  included: DraftBlock[];
  excluded: ExcludedBlock[];
  hopeBudget: number | null;
  chatRemaining: number;
  title: string;
  firstSentence: string;
  /** 초안에 아직 반영하지 못한 기능. */
  pendingCount: number;
};

export function toDraftScreen(dto: DraftDto): DraftScreen {
  const included: DraftBlock[] = [];
  const excluded: ExcludedBlock[] = [];
  for (const row of dto.blocks) {
    if (row.status === 'REMOVED') {
      excluded.push({ ...toScreenBlock(row), reason: '직접 삭제' });
    } else {
      included.push(toScreenBlock(row));
    }
  }
  return {
    included,
    excluded,
    hopeBudget: dto.hopeBudget,
    chatRemaining: Math.max(0, 30 - dto.chatEditCount),
    title: draftTitle(included.map((item) => item.name)),
    firstSentence: dto.utterances.find((utterance) => utterance.kind === 'FIRST_SENTENCE')?.content ?? '',
    pendingCount: dto.pendingFeatures.length,
  };
}

/** 백엔드 publishDraft와 같은 제목 규칙. */
export function draftTitle(names: readonly string[]): string {
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} 외 ${names.length - 2}개 기능`;
}

export function draftSummary(items: readonly DraftBlock[]): string {
  return items.map((item) => item.description).join('\n\n');
}

/** '2026. 10. 27' · '2026-10-27'을 로컬 자정으로 읽는다. */
export function parseDateInput(raw: string): Date | null {
  const matched = raw.trim().match(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})$/);
  if (!matched) return null;
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function formatDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** 마감일은 그날 23:59:59까지로 보낸다. */
export function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

/* 상태 칩 — 디자인 시스템 7절 · 10.1. 칩은 상태에만, 속성은 <Attr>. 레드 칩은 없다.
 * 상태 이름 → 톤은 chipToneOf 한 곳에서만 정한다(한 화면 안의 같은 상태는 같은 칩). */
import type { ReactNode } from 'react';
import s from './ui.module.css';

export type ChipTone = 'neutral' | 'blue' | 'amber' | 'teal' | 'outline';

const TONE_BY_STATUS: Record<string, ChipTone> = {
  // 중립 — 진행 중이지만 할 일 없음 · 시스템
  '작성 중': 'neutral', '검토 중': 'neutral', '만드는 중': 'neutral', '시스템': 'neutral',
  // 파랑 — 진행 중
  '모집 중': 'blue', '문의 중': 'blue', '진행 중': 'blue', '작업 중': 'blue', '계약 중': 'blue', '새 블록': 'blue',
  // 앰버 — 지금 누군가 해야 할 일 · 기한 · 멈춤
  '임시 계약': 'amber', '임시 계약 중': 'amber', '서명 대기': 'amber', '예치 대기': 'amber', '검수 대기': 'amber',
  '선택 중': 'amber', '재견적 요청': 'amber', '마감 지남': 'amber', '납품 없음': 'amber', '보완 요청 작성 중': 'amber',
  '취소 요청 중': 'amber', '취소 요청 받음': 'amber', '작업 멈춤': 'amber', '결제 실패': 'amber', '결과 통지 없음': 'amber',
  '금액 불일치': 'amber', '처리 대기': 'amber', '판정 필요': 'amber', '사유 다툼': 'amber', '병합 후보': 'amber',
  '취소': 'amber', '환불 처리 중': 'amber', '지급 처리 중': 'amber',
  // 틸 — 끝남 · 확정됨
  '완료': 'teal', '계약 체결': 'teal', '예치 완료': 'teal', '승인': 'teal', '지급 완료': 'teal', '처리 완료': 'teal',
  '모두 정해짐': 'teal', '요약 공개 중': 'teal', '가능': 'teal',
  // 아웃라인 — 시작 전 · 끝난 비정상 · 보관. 자동 거절은 언제나 아웃라인(결정메모 #5)
  '시작 전': 'outline', '문의 전': 'outline', '모집 예정': 'outline', '보관됨': 'outline', '이전 명세 기준': 'outline',
  '대체됨': 'outline', '모집 마감': 'outline', '보류': 'outline', '결렬': 'outline', '직접 거절': 'outline',
  '자동 거절': 'outline', '철회': 'outline', '요약 숨김': 'outline', '금액 미정': 'outline',
};

export function chipToneOf(status: string): ChipTone {
  const tone = TONE_BY_STATUS[status];
  if (!tone) {
    if (import.meta.env.DEV) console.warn(`[디자인 시스템 10.1] 칩 매핑에 없는 상태: '${status}' — 10.1에 줄을 더하세요`);
    return 'neutral';
  }
  return tone;
}

export function Chip({ tone, children }: { tone: ChipTone; children: ReactNode }) {
  return <span className={`${s.chip} ${s[`chip-${tone}`]}`} data-chip={tone}>{children}</span>;
}

/** 상태 이름만 주면 톤을 고른다 */
export function StatusChip({ status }: { status: string }) {
  return <Chip tone={chipToneOf(status)}>{status}</Chip>;
}

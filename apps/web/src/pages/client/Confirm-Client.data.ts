/* 명세 확정 시연 데이터 — 보드 Confirm-Client.dc.html · PRD F-03 · 7.1 · 7.2
 * AI 금액 없음. 희망 예산은 의뢰인 본인 값(5,000,000원). 제목은 블록 이름에서 자동. */
export const CONFIRM_MOCKS = [] as const;

export const DRAFT_HREF = '/c/drafts/d-1';
export const SPEC_STARTED_HREF = `/c/projects/p-ondo?mock=${encodeURIComponent('모집 시작됨')}`;

export const CONSENT_VERSION = '동의 문구 v2.0 · 동의한 시각과 함께 보관됩니다';

export const CONSENT_LABEL =
  '이 명세가 비밀유지 의무를 진 공급자에게 위 두 단계로, 상세 공개에서는 제 프로필과 함께 공개되는 데 동의합니다.';

export type ScopeItem = {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  memo: string;
};

export type ExcludedItem = {
  id: string;
  name: string;
  reason: string;
};

export type PubCard = {
  title: string;
  who: string;
  body: string;
};

export const DEMO = {
  pageTitle: '확정하기 전에 확인해 주세요',
  pageLead: '확정하면 이 명세가 그대로 프로젝트 등록 글이 되고, 계약할 때는 검수 기준으로 계약서에 붙습니다.',
  scopeLead: '이 기능들이 프로젝트 등록 글이 됩니다. 공급자와 정할 것은 문의 채팅에서 정하고, \'이 사람과 계약하기\'를 누르면 AI가 정리한 최종 합의 내용으로 확인합니다.',
  included: [
    {
      id: 'calendar',
      name: '예약 달력',
      description: '회차별로 예약받고 정원이 차면 마감',
      conditions: ['회차 구성', '예약 가능 기간'],
      memo: '',
    },
    {
      id: 'pay',
      name: '예약금 결제',
      description: '예약할 때 예약금을 받고 환불 규정 안내',
      conditions: ['예약금 금액', '환불 기준'],
      memo: '전날 취소면 돌려주고 싶음',
    },
    {
      id: 'noshow',
      name: '노쇼 기록',
      description: '노쇼 손님을 기록해 다음 예약 때 표시',
      conditions: ['노쇼 판정 기준', '표시 방식'],
      memo: '',
    },
    {
      id: 'remind',
      name: '리마인드 알림',
      description: '예약 전날 손님에게 안내 자동 발송',
      conditions: ['발송 시점', '발송 수단'],
      memo: '',
    },
  ] satisfies ScopeItem[],
  excluded: [
    { id: 'grade', name: '단골 등급 관리', reason: '직접 삭제' },
  ] satisfies ExcludedItem[],
  /** 기능 이름 앞 2개 + 나머지 개수 */
  title: '예약 달력, 예약금 결제 외 2개 기능',
  titleHint: '기능 이름 앞 2개 + 나머지 개수로 만듭니다. 업종은 칩으로 따로 보입니다',
  summary: '예약 달력 · 예약금 결제 · 노쇼 기록 · 리마인드 알림',
  skills: '예약 캘린더 · PG 결제 연동 · 문자 발송',
  hopeBudget: 5_000_000,
  hopeBudgetHint: '목록에는 400~500만원 구간으로, 상세에서는 정확한 금액으로 보입니다',
  defaultStart: '2026. 10. 27',
  defaultEnd: '2026. 11. 3',
  dateHint: '오늘로 두면 확정하자마자 모집이 시작됩니다. 날짜를 뒤로 두면 그날까지 ‘모집 예정’으로 기다립니다.',
  dateError: '모집 시작일은 마감일보다 앞이어야 합니다.',
  pubLead: '명세는 두 단계로 열립니다. 상세를 보는 공급자는 모두 가입할 때 비밀유지에 동의했고, 누가 열었는지 기록이 남습니다.',
  pubCards: [
    {
      title: '전체 공개',
      who: '로그인한 공급자',
      body: '업종 · 제목과 요약 · 항목 이름과 수 · 희망 예산 구간 · 마감일',
    },
    {
      title: '상세 공개',
      who: '열람 기록이 남음 · 프로필 포함',
      body: '기능 설명 · 공급자와 정할 것과 메모 · 화면 초안 · 정확한 희망 예산 · 내 프로필(이름 · 상호 · 업종 · 가게 주소 · 자기소개 · 웹사이트)',
    },
  ] satisfies PubCard[],
  hideNote:
    '로그인 이메일, 처음 적으신 문장과 초안 채팅. 연락처는 받지 않으며, 계약이 체결되기 전까지 문의 채팅의 연락처는 자동으로 가려집니다.',
  afterNote:
    '계약 전에는 명세를 내려받을 수 없습니다. 모집 중에 명세를 고치면 이미 들어온 지원은 ‘이전 명세 기준’이 되어, 다시 견적을 받아야 계약할 수 있습니다.',
  needConsent: '공개 범위에 동의해 주세요.',
  needDate: '모집 기간을 고치면 확정할 수 있습니다.',
};

/** '2026. 10. 27' · '2026-10-27' 등을 날짜로 읽는다. 실패하면 null. */
export function parseDemoDate(raw: string): Date | null {
  const m = raw.trim().match(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

/** 시작일이 마감일보다 앞이어야 한다(같거나 늦으면 오류). */
export function isStartBeforeEnd(startRaw: string, endRaw: string): boolean {
  const start = parseDemoDate(startRaw);
  const end = parseDemoDate(endRaw);
  if (!start || !end) return false;
  return start.getTime() < end.getTime();
}

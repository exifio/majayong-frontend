/* 1:1 문의 — 작성·내 문의·상세. 실제 /support/inquiries API만 사용한다. */
import type { ApiInquiryCategory, ApiInquiryStatus, InquiryDto } from '@majayong/types/api';

export const CATEGORIES: ReadonlyArray<{ key: ApiInquiryCategory; label: string }> = [
  { key: 'USAGE', label: '이용 방법' },
  { key: 'PAYMENT', label: '결제 · 예치' },
  { key: 'INSPECTION', label: '검수 · 지급' },
  { key: 'CANCEL', label: '계약 취소' },
  { key: 'ACCOUNT', label: '계정' },
  { key: 'OTHER', label: '기타' },
];

export const CATEGORY_LABEL: Record<ApiInquiryCategory, string> = {
  USAGE: '이용 방법',
  PAYMENT: '결제 · 예치',
  INSPECTION: '검수 · 지급',
  CANCEL: '계약 취소',
  ACCOUNT: '계정',
  OTHER: '기타',
};

export const STATUS_LABEL: Record<ApiInquiryStatus, string> = {
  WAITING: '답변 대기',
  ANSWERED: '답변 완료',
};

export const PAGE = {
  title: '1:1 문의',
  sub: '문의 내용을 남겨 주시면 확인 후 답변드립니다. 답변은 알림과 내 문의에서 확인할 수 있습니다.',
  guestTitle: '로그인 후 문의할 수 있습니다',
  guestBody: '문의 내용과 답변에는 계약 정보가 포함될 수 있어 로그인한 사용자만 작성할 수 있습니다.',
  login: '로그인하기',
  loginHref: '/?modal=login&next=%2Fhelp%2Finquiry',
  tabWrite: '문의 작성',
  tabMine: '내 문의',
  typeLabel: '문의 유형',
  titleLabel: '제목',
  bodyLabel: '내용',
  submit: '문의 보내기',
  submitting: '보내는 중',
  sentTitle: '문의를 보냈습니다',
  sentBody: '답변이 등록되면 알림으로 알려드립니다. 내 문의에서도 확인할 수 있습니다.',
  mine: '내 문의 보기',
  empty: '아직 보낸 문의가 없습니다',
  emptyBody: '궁금한 점이 있으면 문의를 남겨 주세요.',
  detail: '문의 내용',
  answer: '답변',
  waiting: '답변을 기다리고 있습니다.',
  required: '제목과 내용을 입력해 주세요',
  error: '문의를 처리하지 못했습니다. 다시 시도해 주세요.',
  back: '목록으로',
} as const;

export function inquiryTitle(inquiry: InquiryDto): string {
  return inquiry.title;
}

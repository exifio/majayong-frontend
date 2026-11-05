/* 의뢰인 리뷰 작성 시연 — PRD F-14. */

export const REVIEW_MOCKS = ['작성 중', '제출함'] as const;
export type ReviewMock = (typeof REVIEW_MOCKS)[number];

export const DEMO = {
  titleWrite: '공급자 평가하기',
  titleDone: '보낸 리뷰',
  sub: '함께 일한 공급자는 어땠나요? 다른 의뢰인이 공급자를 고를 때 참고합니다.',
  who: '최준호',
  whoMeta: '웹 외주 프리랜서 5년 차 · ★ 4.8 · 리뷰 12건',
  initial: '최',
  project: '예약 달력, 예약금 결제 외 2개 기능',
  contractMeta: '12월 16일 최종 승인 · 합의 금액 3,100,000원',
  status: '완료',

  starLabel: '별점',
  starHint: '1점부터 5점까지 고릅니다.',
  scoreWords: ['', '별로였어요', '아쉬웠어요', '보통이에요', '좋았어요', '아주 좋았어요'] as const,
  needStar: '별점을 골라 주세요',

  tagsLabel: '항목별 평가',
  tagsHint: '여러 개 고를 수 있습니다. 고른 태그는 공급자 공개 프로필에 많이 받은 순으로 보입니다.',
  tags: [
    '일정을 지켰어요',
    '설명이 쉬웠어요',
    '조건대로 만들었어요',
    '보완 요청에 빨리 답했어요',
    '다시 맡기고 싶어요',
  ] as const,
  tagSelected: ['일정을 지켰어요', '조건대로 만들었어요', '다시 맡기고 싶어요'] as const,

  textLabel: '한 줄 리뷰',
  textHint: '결과물과 일하는 방식에서 좋았던 점이나 아쉬웠던 점을 적어 주세요.',
  textValue:
    '예약금 환불 기준처럼 제가 미처 생각 못 한 부분을 채팅에서 먼저 물어봐 주셔서 좋았습니다. 보완 요청도 하루 만에 고쳐 주셨어요. 전화 예약이 눈에 띄게 줄었어요.',
  textMax: 500,

  warnTitle: '한 번 제출하면 고칠 수 없습니다',
  warnBody:
    '리뷰는 계약 하나에 한 번만 쓸 수 있고, 제출한 뒤에는 수정하거나 지울 수 없습니다. 별점과 리뷰는 최준호님의 공개 프로필에 보입니다.',

  later: '나중에 쓰기',
  laterHref: '/c/contracts',
  submit: '리뷰 제출',

  doneBandTitle: '리뷰를 제출했습니다 · 12월 17일',
  doneBandBody: '제출한 리뷰는 수정할 수 없습니다. 별점과 리뷰는 최준호님의 공개 프로필에 보입니다.',
  doneCta: '내 계약으로',
  doneHref: '/c/contracts',
  myReviewTitle: '내가 쓴 리뷰',
} as const;

export function resolveReviewMock(raw: string | null): ReviewMock {
  if (raw && (REVIEW_MOCKS as readonly string[]).includes(raw)) return raw as ReviewMock;
  return '작성 중';
}

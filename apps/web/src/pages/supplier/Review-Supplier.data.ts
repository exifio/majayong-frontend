/* 공급자 리뷰 작성 시연 — PRD F-14. Review-Client와 같은 구조, 상대는 의뢰인. */

export const REVIEW_MOCKS = ['작성 중', '제출함'] as const;
export type ReviewMock = (typeof REVIEW_MOCKS)[number];

export const DEMO = {
  titleWrite: '의뢰인 평가하기',
  titleDone: '보낸 리뷰',
  sub: '함께 일한 의뢰인은 어땠나요? 다른 공급자가 이 의뢰인의 프로젝트에 지원할 때 참고합니다.',
  who: '온도 다이닝',
  whoMeta: '정민재 · 음식점(코스 레스토랑) · 서울 마포구',
  initial: '온',
  project: '예약 달력, 예약금 결제 외 2개 기능',
  contractMeta: '12월 16일 최종 승인 · 합의 금액 3,100,000원',
  status: '완료',

  starLabel: '별점',
  starHint: '1점부터 5점까지 고릅니다.',
  scoreWords: ['', '별로였어요', '아쉬웠어요', '보통이에요', '좋았어요', '아주 좋았어요'] as const,
  needStar: '별점을 골라 주세요',

  tagsLabel: '항목별 평가',
  tagsHint: '여러 개 고를 수 있습니다. 고른 태그는 의뢰인 공개 프로필에 많이 받은 순으로 보입니다.',
  tags: [
    '조건을 분명히 정해 줬어요',
    '검수가 빨랐어요',
    '답장이 빨랐어요',
    '요청 범위를 지켰어요',
    '다시 일하고 싶어요',
  ] as const,
  tagSelected: ['조건을 분명히 정해 줬어요', '검수가 빨랐어요', '요청 범위를 지켰어요'] as const,

  textLabel: '한 줄 리뷰',
  textHint: '작업하면서 좋았던 점이나 아쉬웠던 점을 적어 주세요.',
  textValue:
    '정할 것을 채팅에서 하나씩 분명히 정해 주셔서 작업 중에 다시 묻는 일이 거의 없었습니다. 검수도 이틀 안에 끝내 주셨어요.',
  textMax: 500,

  warnTitle: '한 번 제출하면 고칠 수 없습니다',
  warnBody:
    '리뷰는 계약 하나에 한 번만 쓸 수 있고, 제출한 뒤에는 수정하거나 지울 수 없습니다. 별점과 리뷰는 정민재님의 공개 프로필에 보입니다.',

  later: '나중에 쓰기',
  laterHref: '/s/contracts',
  submit: '리뷰 제출',

  doneBandTitle: '리뷰를 제출했습니다 · 12월 17일',
  doneBandBody: '제출한 리뷰는 수정할 수 없습니다. 별점과 리뷰는 정민재님의 공개 프로필에 보입니다.',
  doneCta: '내 계약으로',
  doneHref: '/s/contracts',
  myReviewTitle: '내가 쓴 리뷰',
} as const;

export function resolveReviewMock(raw: string | null): ReviewMock {
  if (raw && (REVIEW_MOCKS as readonly string[]).includes(raw)) return raw as ReviewMock;
  return '작성 중';
}

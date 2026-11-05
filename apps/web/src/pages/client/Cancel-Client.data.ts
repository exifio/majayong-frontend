/* 계약 취소 요청 시연 — PRD F-26 · 13.2. 금액은 데이터 값. */

export const CANCEL_MOCKS = [
  '요청 작성',
  '공급자 사정 선택',
  '동의 대기',
  '이견 — 운영자 판정 중',
  '정산 확정',
] as const;
export type CancelMock = (typeof CANCEL_MOCKS)[number];

export const DEFAULT_CID = 'c-ondo';
export const LIST_HREF = '/c/contracts';
export const SETTLE_HREF = '/c/settlements?contract=c-ondo';

export const DEMO = {
  crumbContracts: '내 계약',
  crumbContract: '예약 달력, 예약금 결제 외 2개 기능',
  titleWrite: '계약 취소 요청',
  titleWait: '취소 요청 중',
  titleDone: '취소 정산 확정',
  subWrite: '예치가 끝난 계약을 취소합니다. 사유를 고르면 정산이 어떻게 되는지 바로 보여 드립니다.',
  subProgress: '보낸 취소 요청의 진행 상황입니다. 결과는 내 계약과 정산 내역에도 표시됩니다.',
  supplier: '최준호',
  supplierMeta: '공급자 · 웹 외주 프리랜서 5년 차',
  escrow: 3_255_000,
  stage: 1_550_000,
  clientRefund: 2_441_250,
  clientComp: 736_250,
  supplierRefund: 3_255_000,
  supplierComp: 0,
  reasonClient: '의뢰인 사정',
  reasonSupplier: '공급자 사정',
  reasonClientDesc:
    '예치 후 24시간이 지났고 납품 전이면 진행 중 구간의 50% 이상을 공급자에게 보상합니다.',
  reasonSupplierDesc: '지급되지 않은 구간을 전액 환불합니다.',
  explainLabel: '사유 설명',
  explainHint: '최준호님과 운영자가 함께 봅니다. 연락처는 적어도 가려집니다.',
  explainClient:
    '가게 리모델링 일정이 12월로 잡혀 예약 사이트 오픈을 내년으로 미루게 되었습니다. 진행해 주신 부분은 규정대로 보상하겠습니다.',
  explainDispute:
    '11월 6일까지 예약 달력 진행 화면을 공유받기로 했는데 받지 못했고, 사흘 동안 답장이 없어 진행을 믿기 어렵습니다.',
  send: '취소 요청 보내기',
  sendHint: '보내면 최준호님에게 요청이 가고 계약이 취소 요청 상태가 됩니다',
  dialogTitle: '취소 요청을 보낼까요?',
  dialogBody: '보내면 되돌리기 전에 최준호님이 응답할 수 있습니다. 요청 중에는 작업과 검수가 멈춥니다.',
  dialogConfirm: '요청 보내기',
  waitTitle: '최준호님의 답을 기다립니다',
  waitBody:
    '계약은 취소 요청 상태로 멈췄습니다. 3일 안에 답이 없으면 동의한 것으로 처리됩니다. 최준호님이 동의하면 정산이 확정되고, 이의를 내면 운영자가 판정합니다.',
  respondBy: '2026-11-11T23:59:00+09:00',
  disputeTitle: '운영자가 판정하고 있습니다',
  disputeBody:
    '최준호님이 취소 사유에 이의를 냈습니다. 운영자가 계약서의 조건 줄, 납품 기록, 채팅을 근거로 사유를 판정합니다.',
  myClaimTitle: '내가 고른 사유 · 11월 8일',
  myClaimReason: '공급자 사정',
  myClaimBody:
    '11월 6일까지 공유하기로 한 예약 달력 진행 화면을 받지 못했고, 채팅 답장이 사흘 동안 없었습니다.',
  theirClaimTitle: '최준호님의 이의 · 11월 9일',
  theirClaimReason: '의뢰인 사정이라고 봄',
  theirClaimBody:
    '진행 화면은 11월 7일 채팅으로 공유했고 일정 안에 있습니다. 사유를 의뢰인 사정으로 봐 주셨으면 합니다.',
  doneTitle: '최준호님이 동의해 정산이 확정되었습니다',
  doneBody:
    '2,441,250원을 결제한 카드로 돌려드립니다. 운영자가 처리하고 있고, 끝나면 정산 내역에 완료로 표시됩니다.',
  settleCta: '정산 내역 보기',
  previewTitle: '정산 미리보기',
  previewDone: '확정된 정산',
  previewDispute: '판정에 따른 정산',
  tagClient: '의뢰인 사정 · 예치 후 24시간 지남 · 납품 전',
  tagSupplier: '공급자 사정 · 지급된 구간 없음',
} as const;

export function resolveCancelMock(raw: string | null): CancelMock {
  if (raw && (CANCEL_MOCKS as readonly string[]).includes(raw)) return raw as CancelMock;
  return '요청 작성';
}

export type SettleLine = { k: string; s: string; v: number; tot?: boolean; sup?: boolean };

export type CancelDemo = {
  mock: CancelMock;
  write: boolean;
  wait: boolean;
  dispute: boolean;
  done: boolean;
  reason: 'client' | 'supplier';
  title: string;
  sub: string;
  status: string;
  explain: string;
  previewTitle: string;
  tag: string;
  lines: SettleLine[];
};

export function cancelDemoOf(mock: CancelMock): CancelDemo {
  const write = mock === '요청 작성' || mock === '공급자 사정 선택';
  const wait = mock === '동의 대기';
  const dispute = mock === '이견 — 운영자 판정 중';
  const done = mock === '정산 확정';
  const supplier = mock === '공급자 사정 선택' || mock === '이견 — 운영자 판정 중';
  const reason = supplier ? 'supplier' : 'client';

  const clientLines: SettleLine[] = [
    { k: '예치한 금액', s: '합의 3,100,000원 + 수수료 155,000원', v: DEMO.escrow },
    { k: '− 공급자 보상', s: '진행 중 구간 1,550,000원의 50%', v: -775_000 },
    { k: '− 보상분 수수료 5%', s: '지급이 확정된 775,000원에만', v: -38_750 },
    { k: '돌려받을 금액', s: '남은 금액 + 남은 수수료', v: DEMO.clientRefund, tot: true },
    { k: '최준호님이 받는 금액', s: '보상 775,000원 − 수수료 5%', v: DEMO.clientComp, sup: true },
  ];
  const supplierLines: SettleLine[] = [
    { k: '예치한 금액', s: '합의 3,100,000원 + 수수료 155,000원', v: DEMO.escrow },
    { k: '− 공급자 보상', s: '지급된 구간이 없어 보상 없음', v: 0 },
    { k: '돌려받을 금액', s: '수수료까지 전액', v: DEMO.supplierRefund, tot: true },
    { k: '최준호님이 받는 금액', s: '', v: DEMO.supplierComp, sup: true },
  ];

  return {
    mock,
    write,
    wait,
    dispute,
    done,
    reason,
    title: done ? DEMO.titleDone : write ? DEMO.titleWrite : DEMO.titleWait,
    sub: write ? DEMO.subWrite : DEMO.subProgress,
    status: done ? '취소' : write ? '진행 중' : '취소 요청 중',
    explain: dispute ? DEMO.explainDispute : DEMO.explainClient,
    previewTitle: done
      ? DEMO.previewDone
      : dispute
        ? DEMO.previewDispute
        : DEMO.previewTitle,
    tag: reason === 'supplier' ? DEMO.tagSupplier : DEMO.tagClient,
    lines: reason === 'supplier' ? supplierLines : clientLines,
  };
}

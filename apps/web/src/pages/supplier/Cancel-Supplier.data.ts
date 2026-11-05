/* 공급자 취소 요청 받음 시연 — PRD F-26 · 13.2. 받을 보상액만. 의뢰인 환불·예치 없음. */

export const CANCEL_S_MOCKS = ['요청 받음', '이의 작성', '운영자 판정 중', '정산 확정'] as const;
export type CancelSMock = (typeof CANCEL_S_MOCKS)[number];

export const DEFAULT_CID = 'c-ondo';
export const LIST_HREF = '/s/contracts';
export const SETTLE_HREF = '/s/settlements?contract=c-ondo';
export const CONTRACT_HREF = '/s/contracts/c-ondo';
export const CHAT_HREF = '/s/chat/p-ondo';

export const DEMO = {
  crumbContracts: '내 계약',
  crumbContract: '예약 달력, 예약금 결제 외 2개 기능',
  titleOpen: '의뢰인이 계약 취소를 요청했습니다',
  titleDone: '계약이 취소되었습니다',
  subOpen:
    '예치 후 취소는 사유에 따라 정산합니다. 요청 내용과 정산 미리보기를 확인하고 동의하거나 이의를 제기하세요.',
  subDone:
    '취소 정산이 확정되었습니다. 받을 금액은 운영자가 처리한 뒤 정산 내역에 지급 완료로 표시됩니다.',
  openBandTitle: '취소 요청 중 — 답할 때까지 작업과 검수가 멈춥니다',
  openBandBody:
    '동의하면 아래 정산대로 바로 확정됩니다. 사유나 보상에 다른 의견이 있으면 이의를 제기하세요. 이의가 있으면 운영자가 근거를 보고 판정합니다.',
  respondBy: '2026-11-11T23:59:00+09:00',
  respondHint: '3일 안에 응답하지 않으면 동의한 것으로 처리됩니다',
  waitTitle: '운영자가 판정하고 있습니다 · 11월 9일 이의 보냄',
  waitBody:
    '양쪽 주장과 근거(계약서 조건 줄 · 채팅 · 작업 기록)를 보고 판정합니다. 판정이 나면 내 계약에 표시됩니다. 그동안 작업과 검수는 멈춰 있습니다.',
  doneTitle: '정산이 확정되었습니다 · 11월 9일 · 동의',
  doneBody:
    '계약은 취소되었습니다. 받을 금액 736,250원은 운영자가 지급을 처리하고 있습니다. 끝나면 정산 내역에 지급 완료로 표시됩니다.',
  settleCta: '정산 내역 보기',
  clientName: '정민재 · 온도 다이닝',
  requestWhen: '11월 8일 10:40 요청',
  reasonChip: '사유 · 의뢰인 사정',
  quote:
    '가게 리모델링 일정이 갑자기 잡혀서 내년 봄까지 예약을 받지 않게 되었습니다. 그동안 진행해 주신 작업은 규정대로 정산해 드리겠습니다. 죄송합니다.',
  workSince: '11월 5일부터 · 4일째',
  stageLabel: '중간 · 납품 전',
  stage: 1_550_000,
  compensation: 775_000,
  fee: 38_750,
  net: 736_250,
  agree: '동의하기',
  agreeHint: '동의하면 계약이 취소되고 위 금액으로 정산됩니다. 동의한 뒤에는 되돌릴 수 없습니다.',
  dispute: '이의 제기',
  objTitle: '이의 제기',
  objQ: '어떤 사유가 맞다고 보시나요?',
  rateLabel: '요청하는 보상 비율',
  rateHint: '% · 진행 중 구간 기준(50% 이상)',
  rateMinNote: '진행률 50% 이상일 때만 이의를 제기할 수 있습니다. 50% 미만이면 동의해 주세요.',
  explainLabel: '설명',
  evidenceLabel: '근거로 붙일 기록',
  explainDefault:
    '예약 달력은 회차 설정 · 정원 마감까지 거의 끝냈고(테스트 주소 공유함), 예약금 결제도 PG 테스트 연동까지 진행했습니다. 진행 중 구간의 70%를 요청합니다.',
  sendObj: '이의 보내기',
  sendHint: '이의를 보내면 운영자가 양쪽 주장과 근거를 보고 판정합니다. 판정 전까지 작업과 검수는 멈춥니다.',
  myObjTitle: '보낸 이의',
  myReason: '의뢰인 사정',
  myRate: '진행 중 구간의 70%',
  myEvidenceCount: '2건',
  contractTitle: '예약 달력, 예약금 결제 외 2개 기능',
  agreed: 3_100_000,
  rulesTitle: '취소 정산 규칙',
  rules: [
    '의뢰인 사정 — 예치 후 24시간 안 · 납품 전이면 전액 환불. 그 뒤 납품 전이면 진행 중 구간의 50% 이상 보상, 납품한 구간은 전액',
    '공급자 사정 — 지급되지 않은 구간을 의뢰인에게 전액 환불',
    '합의 — 양쪽이 정한 비율',
    '수수료는 지급이 확정된 금액에만 양쪽 5%',
  ],
} as const;

export const CAUSE_OPTIONS = [
  { key: 'client', label: '의뢰인 사정', desc: '사유는 맞지만 보상 비율이 다릅니다' },
  { key: 'supplier', label: '공급자 사정', desc: '제 사정으로 취소되는 것입니다' },
  { key: 'agree', label: '합의', desc: '양쪽이 정한 비율로 나눕니다' },
] as const;

export const EVIDENCE = [
  {
    id: 'chat-6',
    label: '채팅 · 11월 6일 "회차 설정 화면 테스트 주소 보내 드립니다"',
    hint: '연락처는 가려져 전달됩니다',
    defaultOn: true,
  },
  {
    id: 'work',
    label: '작업 기록 · 예약 달력 테스트 주소 · 11월 7일',
    hint: '계약 항목에 속한 기록만 붙일 수 있습니다',
    defaultOn: true,
  },
  {
    id: 'chat-5',
    label: '채팅 · 11월 5일 "예약금 PG 테스트 키 받았습니다"',
    hint: '',
    defaultOn: false,
  },
] as const;

export type SettleLine = { k: string; s: string; v: number; tot?: boolean };
export type FlowStep = { b: string; s: string; state: 'done' | 'now' | 'todo' };

export type CancelSDemo = {
  mock: CancelSMock;
  open: boolean;
  form: boolean;
  wait: boolean;
  done: boolean;
  title: string;
  sub: string;
  calcH: string;
  stateTxt: string;
  lines: SettleLine[];
  flow: FlowStep[];
};

export function resolveCancelSMock(raw: string | null): CancelSMock {
  if (raw && (CANCEL_S_MOCKS as readonly string[]).includes(raw)) return raw as CancelSMock;
  return '요청 받음';
}

export function cancelSDemoOf(mock: CancelSMock): CancelSDemo {
  const open = mock === '요청 받음';
  const form = mock === '이의 작성';
  const wait = mock === '운영자 판정 중';
  const done = mock === '정산 확정';

  const lines: SettleLine[] = [
    { k: '진행 중이던 구간 금액', s: '중간 구간 · 예약 달력 · 예약금 결제', v: DEMO.stage },
    {
      k: '보상 금액',
      s: '의뢰인 사유 · 납품 전 · 24시간 지남 → 진행 중 구간의 50%',
      v: DEMO.compensation,
    },
    { k: '− 수수료 5%', s: '지급이 확정된 보상 금액에만', v: -DEMO.fee },
    { k: '받을 금액', s: '', v: DEMO.net, tot: true },
  ];

  const flowBase = (states: FlowStep['state'][]): FlowStep[] => {
    const labels: [string, string][] = [
      ['11월 8일 · 취소 요청', '의뢰인 · 사유 의뢰인 사정'],
      [
        done ? '11월 9일 · 동의' : wait ? '11월 9일 · 이의 제기' : '내 답변',
        done
          ? '정산이 바로 확정되었습니다'
          : wait
            ? '운영자에게 넘어갔습니다'
            : '동의하거나 이의를 제기합니다',
      ],
      [
        wait ? '운영자 판정' : '정산 확정',
        wait ? '근거를 보고 사유와 비율을 정합니다' : '보상 · 환불 금액이 정해집니다',
      ],
      ['지급 · 환불', '운영자가 처리합니다'],
    ];
    return labels.map(([b, s], i) => ({ b, s, state: states[i] ?? 'todo' }));
  };

  let flow: FlowStep[];
  if (open || form) flow = flowBase(['done', 'now', 'todo', 'todo']);
  else if (wait) flow = flowBase(['done', 'done', 'now', 'todo']);
  else flow = flowBase(['done', 'done', 'done', 'now']);

  return {
    mock,
    open: open || form,
    form,
    wait,
    done,
    title: done ? DEMO.titleDone : DEMO.titleOpen,
    sub: done ? DEMO.subDone : DEMO.subOpen,
    calcH: done ? '확정된 정산' : wait ? '의뢰인 요청대로라면' : '동의하면 이렇게 정산됩니다',
    stateTxt: done ? '취소됨' : '취소 요청 중',
    lines,
    flow,
  };
}

/* 공통 컴포넌트 카탈로그 — /dev/ui (개발 서버에서만)
 * M0 통과 조건: 디자인 시스템 v0.2.1 최종본과 나란히 놓고 대조한다.
 * data-dev-catalog 가 있어 '파란 버튼 하나' 검사에서 빠진다. */
import { useState, type ReactNode } from 'react';
import {
  Attr, Band, Button, Chip, ConfirmCheck, ConfirmDialog, Deadline, EmptyState, Info, MaskedText, Modal, Money, Note,
  SelectCards, Skeleton, StatusChip, Tabs, TextField,
} from '@/components/ui';
import { CONTACT_MASK_TOKEN } from '@majayong/types';
import { DEMO } from '@/mocks/demo';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mj-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

const row = { display: 'flex', gap: 12, flexWrap: 'wrap' as const, alignItems: 'center' };

export default function UiCatalog() {
  const [tab, setTab] = useState('all');
  const [under, setUnder] = useState('interim');
  const [reason, setReason] = useState<string | null>('CLIENT');
  const [checked, setChecked] = useState(false);
  const [modal, setModal] = useState<null | 'content' | 'danger'>(null);
  const now = '2026-11-03T03:00:00Z';

  return (
    <div data-dev-catalog style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>공통 컴포넌트 카탈로그</h1>
      <p className="mj-sub" style={{ margin: 0 }}>디자인 시스템 v0.2.1 최종본과 대조용. 실제 화면에서는 파란 버튼이 하나만 있어야 한다.</p>

      <Section title="버튼 — 6절">
        <div style={row}>
          <Button>기본</Button>
          <Button variant="tint">문의하기 (채팅)</Button>
          <Button variant="ghost">채팅으로 돌아가기</Button>
          <Button variant="text">견적서 보기</Button>
          <Button variant="warn">취소 요청 보내기</Button>
          <span style={{ background: 'var(--navy-900)', padding: 10, borderRadius: 10 }}><Button variant="onnavy">공급자로 가입하기</Button></span>
        </div>
        <div style={row}>
          <Button size="sm">작게</Button><Button size="lg">크게</Button>
          <Button disabled disabledReason="진행 중인 계약이 끝나야 다른 공급자와 계약할 수 있습니다">이 사람과 계약하기</Button>
        </div>
      </Section>

      <Section title="상태 칩 — 7절 · 10.1">
        <div style={row}>
          <Chip tone="neutral">중립</Chip><Chip tone="blue">파랑</Chip><Chip tone="amber">앰버</Chip><Chip tone="teal">틸</Chip><Chip tone="outline">아웃라인</Chip>
        </div>
        <div style={row}>
          {['모집 중', '서명 대기', '예치 대기', '마감 지남', '예치 완료', '모두 정해짐', '보류', '자동 거절', '결렬'].map((x) => <StatusChip key={x} status={x} />)}
        </div>
      </Section>

      <Section title="띠 — 7절">
        <Band tone="done" title="견적을 보냈습니다">의뢰인이 문의 채팅을 열면 알려 드립니다.</Band>
        <Band tone="warn" title="정하지 않은 조건이 1건 있습니다">이 조건은 계약서에 '정하지 않음'으로 남고 검수 기준에서 빠집니다.</Band>
        <Band tone="wait" title="결제 확인 중">결제사 결과를 기다리고 있습니다. 다시 결제하지 마세요.</Band>
        <Band tone="viewlog" />
      </Section>

      <Section title="속성 · 기한 · 금액 — 7 · 8절">
        <div style={row}>
          <Attr label="선택 기간">5일 남음</Attr>
          <Attr label="메모">전날 취소면 돌려주고 싶음</Attr>
        </div>
        <div style={row}>
          <Deadline label="서명 기한" at={DEMO.contract.consentDeadline} actionable now={now} />
          <Deadline label="예치 기한" at={DEMO.contract.depositDeadline} now="2026-11-09T03:00:00Z" />
          <Deadline label="작업 마감" at={DEMO.contract.workDueAt} now={now} />
        </div>
        <div style={row}>
          <Money amount={DEMO.contract.agreed} /><Money amount={DEMO.contract.deposit} size="row" /><Money amount={DEMO.contract.supplierPayout} size="big" />
        </div>
      </Section>

      <Section title="안내 상자 · 확인 체크 — 7절">
        <Note title="이전 명세 기준 견적입니다">명세가 바뀌어 이 견적으로는 계약할 수 없습니다. 재견적을 요청했습니다.</Note>
        <Info>지급 비율을 정하지 않으면 50:50으로 계약서에 들어갑니다.</Info>
        <ConfirmCheck checked={checked} onChange={setChecked}>계약서와 정산 규칙을 확인했습니다</ConfirmCheck>
        <div><Button disabled={!checked} disabledReason={checked ? undefined : '위 내용을 확인하면 예치할 수 있습니다'}>예치하기</Button></div>
      </Section>

      <Section title="탭 · 선택 카드 · 폼 — 7 · 9절">
        <Tabs label="목록 거르기" value={tab} onChange={setTab} items={[{ key: 'all', label: '전체', count: 3 }, { key: 'open', label: '진행 중', count: 1 }]} />
        <Tabs kind="underline" label="구간" value={under} onChange={setUnder} items={[{ key: 'interim', label: '중간 구간' }, { key: 'final', label: '최종 구간' }]} />
        <SelectCards label="취소 사유" danger value={reason} onChange={setReason}
          options={[{ key: 'CLIENT', label: '의뢰인 사정' }, { key: 'SUPPLIER', label: '공급자 사정' }, { key: 'MUTUAL', label: '서로 합의' }]} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <TextField label="상호" required placeholder="가게 이름" />
          <TextField label="웹사이트" optional hint="있으면 공급자가 가게를 이해하기 쉽습니다" />
          <TextField label="이메일" error="이메일 형식이 아닙니다" defaultValue="majayong" />
        </div>
      </Section>

      <Section title="대화 — 연락처 가림 토큰 · 9절">
        <p style={{ margin: 0 }}><MaskedText text={`제 번호는 ${CONTACT_MASK_TOKEN} 이에요. 카톡은 ${CONTACT_MASK_TOKEN}`} /></p>
      </Section>

      <Section title="빈 상태 · 스켈레톤 — 9절">
        <EmptyState title="아직 프로젝트가 없습니다" action={<Button variant="tint">첫 프로젝트 시작하기</Button>}>불편한 점을 한 문장으로 적으면 화면 초안을 그려 드립니다.</EmptyState>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><Skeleton width="40%" height={20} /><Skeleton /><Skeleton width="70%" /></div>
      </Section>

      <Section title="모달 — 9절">
        <div style={row}>
          <Button variant="ghost" onClick={() => setModal('content')}>내용 모달 열기</Button>
          <Button variant="warn" onClick={() => setModal('danger')}>위험 확인 창 열기</Button>
        </div>
        {modal === 'content' && (
          <Modal title="메시지 신고" onClose={() => setModal(null)}
            actions={<><Button variant="ghost" onClick={() => setModal(null)}>취소</Button><Button variant="warn" onClick={() => setModal(null)}>신고하기</Button></>}>
            신고한 사실은 상대에게 알리지 않고, 대화는 막지 않습니다.
          </Modal>
        )}
        {modal === 'danger' && (
          <ConfirmDialog title="임시 계약을 취소할까요?" danger confirmLabel="임시 계약 취소" onConfirm={() => setModal(null)} onCancel={() => setModal(null)}>
            <strong>되돌릴 수 없습니다.</strong> 이 지원은 거절되고 채팅은 읽기 전용이 됩니다.
          </ConfirmDialog>
        )}
      </Section>
    </div>
  );
}

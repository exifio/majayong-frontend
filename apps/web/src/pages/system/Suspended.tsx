/* 정지 계정 안내 — 보드 없음. EmptyState 패턴(결정메모 #10)
 * PRD 11.4: 정지 계정은 로그인 후 이 안내만 본다. 고객센터는 열어 둔다. */
import { EmptyState, Button } from '@/components/ui';

export default function Suspended() {
  return (
    <div className="mj-card">
      <EmptyState title="계정 이용이 정지되었습니다" action={<Button variant="tint" to="/help">고객센터로 가기</Button>}>
        운영 정책에 따라 이 계정은 지금 쓸 수 없습니다. 진행 중이던 계약은 운영자가 정산합니다.
        문의는 고객센터의 1:1 문의(평일 10:00–18:00)로 접수해 주세요.
      </EmptyState>
    </div>
  );
}

/* 404 — 보드 없음. EmptyState 패턴(결정메모 #10) */
import { EmptyState, Button } from '@/components/ui';
import { useSession, ROLE_HOME } from '@/app/session';

export default function NotFound() {
  const { session } = useSession();
  const home = session.status === 'user' ? ROLE_HOME[session.role] : '/';
  return (
    <div className="mj-card">
      <EmptyState title="페이지를 찾을 수 없습니다" action={<Button variant="tint" to={home}>홈으로 가기</Button>}>
        주소가 바뀌었거나 없는 페이지입니다.
      </EmptyState>
    </div>
  );
}

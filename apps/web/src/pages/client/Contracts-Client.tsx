/* 내 계약 — 보드 Contracts-Client · /c/contracts · M5
 * 실제 GET /me/contracts 결과만 그린다. */
import { Button } from '@/components/ui';
import { LiveContractsList } from '@/components/contract/LiveContractsList';
import s from './Contracts-Client.module.css';

const PAGE = {
  title: '내 계약',
  sub: '계약의 진행 상태를 여기서 봅니다. 예치 · 납품 · 지급은 따로 알림을 보내지 않고 이 화면에 표시합니다.',
  settle: '정산 내역 보기',
};

export default function ContractsClient() {
  return (
    <div className={s.page} data-screen="Contracts-Client">
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{PAGE.title}</h1>
          <p className={s.sub}>{PAGE.sub}</p>
        </div>
        <Button variant="text" to="/c/settlements">
          {PAGE.settle}
        </Button>
      </div>
      <LiveContractsList role="CLIENT" />
    </div>
  );
}

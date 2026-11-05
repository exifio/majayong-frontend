/* 공급자 내 계약 — 보드 Contracts-Supplier · /s/contracts · M5
 * 실제 GET /me/contracts 결과만 그린다. */
import { Button } from '@/components/ui';
import { LiveContractsList } from '@/components/contract/LiveContractsList';
import s from './Contracts-Supplier.module.css';

const PAGE = {
  title: '내 계약',
  sub: '체결된 계약의 진행 상태를 봅니다. 받을 금액과 지급 상태는 정산 내역에서 확인합니다.',
  settle: '정산 내역 보기',
};

export default function ContractsSupplier() {
  return (
    <div className={s.page} data-screen="Contracts-Supplier">
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{PAGE.title}</h1>
          <p className={s.sub}>{PAGE.sub}</p>
        </div>
        <Button variant="text" to="/s/settlements">
          {PAGE.settle}
        </Button>
      </div>
      <LiveContractsList role="SUPPLIER" />
    </div>
  );
}

/* 공급자 정산 내역 — 보드 Settle-Supplier · /s/settlements · M5
 * 실제 GET /me/payment-statements 결과만 그린다. 조회 화면 — primary 없음. */
import { Link } from 'react-router-dom';
import { LiveSettlements } from '@/components/contract/LiveSettlements';
import s from './Settle-Supplier.module.css';

const PAGE = {
  title: '정산 내역',
  sub: '계약별로 받은 금액과 받을 예정 금액을 봅니다. 실제 이체가 아닌 시뮬레이션 기록은 서버 고지를 그대로 표시합니다.',
  contractsLabel: '내 계약으로',
  contractsHref: '/s/contracts',
};

export default function SettleSupplier() {
  return (
    <div className={s.page} data-screen="Settle-Supplier">
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{PAGE.title}</h1>
          <p className={s.sub}>{PAGE.sub}</p>
        </div>
        <Link to={PAGE.contractsHref}>{PAGE.contractsLabel}</Link>
      </div>
      <LiveSettlements role="SUPPLIER" />
    </div>
  );
}

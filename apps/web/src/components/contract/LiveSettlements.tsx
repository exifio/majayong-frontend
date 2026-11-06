/* 정산 내역 — 실제 GET /me/payment-statements 응답만 그린다. */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  ApiInstallmentStatus,
  ClientPaymentStatementDto,
  PaymentStatementDto,
  PaymentStatementsDto,
  SupplierPaymentStatementDto,
} from '@majayong/types/api';
import { LoadingState, EmptyState, Money } from '@/components/ui';
import { useSession } from '@/app/session';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import s from './LiveSettlements.module.css';

type LoadState = 'loading' | 'ready' | 'error';

const STAGE_LABEL = { INTERIM: '중간', FINAL: '최종' } as const;
const INSTALLMENT_LABEL: Record<ApiInstallmentStatus, string> = {
  PENDING: '작업 중',
  DELIVERED: '검수 대기',
  REWORK_REQUESTED: '보완 요청',
  APPROVED: '지급 승인',
  RELEASED: '지급 완료',
  REFUNDED: '환불',
};

function isClient(statement: PaymentStatementDto): statement is ClientPaymentStatementDto {
  return 'totalDeposited' in statement;
}

function Metric({ label, amount }: { label: string; amount: number }) {
  return (
    <div className={s.metric}>
      <span className={s.metricLabel}>{label}</span>
      <span className={s.metricValue}><Money amount={amount} /></span>
    </div>
  );
}

export function LiveSettlements({ role }: { role: 'CLIENT' | 'SUPPLIER' }) {
  const { apiAccessToken } = useSession();
  const [params] = useSearchParams();
  const contractId = params.get('contract');
  const [state, setState] = useState<LoadState>('loading');
  const [data, setData] = useState<PaymentStatementsDto | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    apiRequest('listPaymentStatements', '/me/payment-statements', {
      accessToken: apiAccessToken,
      signal: controller.signal,
    })
      .then((response) => {
        setData(response.data);
        setState('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken]);

  if (state === 'loading') return <LoadingState label="정산 내역을 불러오는 중입니다." />;
  if (state === 'error' || data === null) {
    return <p role="alert" className={s.state}>정산 내역을 불러오지 못했습니다. 다시 시도해 주세요.</p>;
  }

  const statements = contractId
    ? data.statements.filter((statement) => statement.contractId === contractId)
    : data.statements;

  return (
    <div>
      <p className={s.notice}>{data.transferNote}</p>
      {statements.length === 0 ? (
        <EmptyState title="아직 정산 내역이 없습니다">
          계약이 체결되고 예치·지급이 진행되면 이곳에 표시됩니다.
        </EmptyState>
      ) : (
        <div className={s.list}>
          {statements.map((statement) => {
            const client = isClient(statement);
            return (
              <section key={statement.contractId} className={s.card} aria-label={`계약 ${statement.contractId} 정산`}>
                <h2 className={s.cardTitle}>계약 {statement.contractId.slice(0, 8)}</h2>
                <div className={s.metrics}>
                  {client ? (
                    <>
                      <Metric label="예치한 금액" amount={statement.totalDeposited} />
                      <Metric label="공급자 지급" amount={statement.paidToSupplier} />
                      <Metric label="남은 예치금" amount={statement.remainingDeposit} />
                      <Metric label="낸 수수료" amount={statement.clientFeePaid} />
                    </>
                  ) : (
                    <>
                      <Metric label="합의 금액" amount={statement.totalAgreed} />
                      <Metric label="받은 금액" amount={statement.totalReceived} />
                      <Metric label="세후 받을 금액" amount={statement.expectedToReceive} />
                      <Metric label="낸 수수료" amount={statement.supplierFeePaid} />
                      <Metric label="원천징수" amount={statement.withholdingTaxTotal} />
                    </>
                  )}
                </div>
                <ul className={s.installments} aria-label="구간별 지급">
                  {statement.installments.map((item) => (
                    <li key={item.stage} className={s.installment}>
                      <span className={s.stage}>{STAGE_LABEL[item.stage]}</span>
                      <span className={s.amount}><Money amount={item.amount} /></span>
                      <span className={s.status}>{INSTALLMENT_LABEL[item.status]}</span>
                      <span className={s.date}>{item.releasedAt ? formatDate(item.releasedAt) : '—'}</span>
                    </li>
                  ))}
                </ul>
                <p className={s.roleNote}>
                  {client ? '의뢰인 기준 금액입니다.' : `${role === 'SUPPLIER' ? '공급자' : '의뢰인'} 기준 금액입니다.`}
                </p>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* 정산 내역 — 실제 API 응답만 그린다.
 * 목록: GET /me/payment-statements · 한 계약(?contract=): GET /contracts/:id/statement.
 * 사업자 공급자는 한 계약 화면에서 승인·지급된 구간에 세금계산서 발행을 표시한다(POST /installments/:id/tax-invoice-issued). */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type {
  ApiInstallmentStage,
  ApiInstallmentStatus,
  ClientPaymentStatementDto,
  PaymentInstallmentDto,
  PaymentStatementDto,
  PaymentStatementsDto,
} from '@majayong/types/api';
import { LoadingState, EmptyState, Money, Button } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import s from './LiveSettlements.module.css';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';
type Role = 'CLIENT' | 'SUPPLIER';

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

/** 세금계산서 표시에 필요한 구간 id(단계별)와 사업자 여부. 한 계약 공급자 화면에서만 채운다. */
interface TaxInvoiceContext {
  installmentIds: Partial<Record<ApiInstallmentStage, string>>;
  onIssued: (stage: ApiInstallmentStage, issuedAt: string | null) => void;
}

function StatementCard({ statement, role, single, tax }: {
  statement: PaymentStatementDto;
  role: Role;
  single: boolean;
  tax: TaxInvoiceContext | null;
}) {
  const { apiAccessToken } = useSession();
  const [busy, setBusy] = useState<ApiInstallmentStage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const client = isClient(statement);
  const settleBase = role === 'SUPPLIER' ? '/s/settlements' : '/c/settlements';

  const markIssued = async (item: PaymentInstallmentDto) => {
    const id = tax?.installmentIds[item.stage];
    if (!tax || !id || busy) return;
    setBusy(item.stage);
    setError(null);
    try {
      const response = await apiRequest('markTaxInvoiceIssued', `/installments/${encodeURIComponent(id)}/tax-invoice-issued`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: {},
      });
      tax.onIssued(item.stage, response.data.taxInvoiceIssuedAt);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : '세금계산서 발행을 표시하지 못했습니다.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className={s.card} aria-label={`계약 ${statement.contractId} 정산`}>
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
        {statement.installments.map((item) => {
          const canMark = tax !== null && item.taxInvoiceIssuedAt === null &&
            (item.status === 'APPROVED' || item.status === 'RELEASED') && tax.installmentIds[item.stage] !== undefined;
          return (
            <li key={item.stage} className={s.installment}>
              <span className={s.stage}>{STAGE_LABEL[item.stage]}</span>
              <span className={s.amount}><Money amount={item.amount} /></span>
              <span className={s.status}>{INSTALLMENT_LABEL[item.status]}</span>
              <span className={s.date}>{item.releasedAt ? formatDate(item.releasedAt) : '—'}</span>
              {tax !== null && item.taxInvoiceIssuedAt ? (
                <span className={s.tax}>세금계산서 발행 {formatDate(item.taxInvoiceIssuedAt)}</span>
              ) : null}
              {canMark ? (
                <span className={s.tax}>
                  <Button
                    variant="tint"
                    size="sm"
                    type="button"
                    disabled={busy !== null}
                    disabledReason={busy !== null ? '처리 중입니다' : undefined}
                    onClick={() => void markIssued(item)}
                  >
                    {STAGE_LABEL[item.stage]} 세금계산서 발행 표시
                  </Button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      {error ? <p role="alert" className={s.error}>{error}</p> : null}
      <p className={s.roleNote}>
        {client ? '의뢰인 기준 금액입니다.' : `${role === 'SUPPLIER' ? '공급자' : '의뢰인'} 기준 금액입니다.`}
        {!single ? <> · <Link to={`${settleBase}?contract=${encodeURIComponent(statement.contractId)}`}>이 계약만 보기</Link></> : null}
      </p>
    </section>
  );
}

export function LiveSettlements({ role }: { role: Role }) {
  const { apiAccessToken } = useSession();
  const [params] = useSearchParams();
  const contractId = params.get('contract');
  const [state, setState] = useState<LoadState>('loading');
  const [data, setData] = useState<PaymentStatementsDto | null>(null);
  const [single, setSingle] = useState<PaymentStatementDto | null>(null);
  const [installmentIds, setInstallmentIds] = useState<Partial<Record<ApiInstallmentStage, string>> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const options = { accessToken: apiAccessToken, signal: controller.signal };
    setState('loading');
    setInstallmentIds(null);
    if (contractId) {
      const path = `/contracts/${encodeURIComponent(contractId)}`;
      apiRequest('getContractStatement', `${path}/statement`, options)
        .then(async (response) => {
          setSingle(response.data);
          setState('ready');
          if (role !== 'SUPPLIER') return;
          // 세금계산서 표시는 사업자 공급자만. 확인에 실패하면 버튼을 숨긴다(서버도 다시 확인한다).
          const [profile, installments] = await Promise.all([
            apiRequest('getMySupplierProfile', '/me/supplier-profile', options),
            apiRequest('listContractInstallments', `${path}/installments`, options),
          ]);
          if (profile.data.businessType !== 'BUSINESS') return;
          setInstallmentIds(Object.fromEntries(installments.data.installments.map((row) => [row.stage, row.id])));
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === 'AbortError') return;
          setState((current) => {
            if (current === 'ready') return current;
            return error instanceof ApiRequestError && (error.status === 404 || error.status === 403) ? 'not-found' : 'error';
          });
        });
    } else {
      apiRequest('listPaymentStatements', '/me/payment-statements', options)
        .then((response) => {
          setData(response.data);
          setState('ready');
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === 'AbortError') return;
          setState('error');
        });
    }
    return () => controller.abort();
  }, [apiAccessToken, contractId, role]);

  if (state === 'loading') return <LoadingState label="정산 내역을 불러오는 중입니다." />;
  if (state === 'not-found') {
    return <p role="alert" className={s.state}>이 계약의 정산 내역을 찾을 수 없습니다.</p>;
  }
  if (state === 'error' || (contractId ? single === null : data === null)) {
    return <p role="alert" className={s.state}>정산 내역을 불러오지 못했습니다. 다시 시도해 주세요.</p>;
  }

  if (contractId && single) {
    const tax: TaxInvoiceContext | null = role === 'SUPPLIER' && installmentIds !== null
      ? {
        installmentIds,
        onIssued: (stage, issuedAt) => setSingle((current) => current && {
          ...current,
          installments: current.installments.map((row) => (row.stage === stage ? { ...row, taxInvoiceIssuedAt: issuedAt } : row)),
        } as PaymentStatementDto),
      }
      : null;
    return (
      <div>
        <p className={s.notice}>{single.transferNote}</p>
        <StatementCard statement={single} role={role} single tax={tax} />
        <p className={s.roleNote}>
          <Link to={role === 'SUPPLIER' ? '/s/settlements' : '/c/settlements'}>전체 정산 내역 보기</Link>
        </p>
      </div>
    );
  }

  const statements = data?.statements ?? [];
  return (
    <div>
      <p className={s.notice}>{data?.transferNote}</p>
      {statements.length === 0 ? (
        <EmptyState title="아직 정산 내역이 없습니다">
          계약이 체결되고 예치·지급이 진행되면 이곳에 표시됩니다.
        </EmptyState>
      ) : (
        <div className={s.list}>
          {statements.map((statement) => (
            <StatementCard key={statement.contractId} statement={statement} role={role} single={false} tax={null} />
          ))}
        </div>
      )}
    </div>
  );
}

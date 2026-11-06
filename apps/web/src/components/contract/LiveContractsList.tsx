/* 내 계약 목록 — 실제 계약 응답만 표시한다. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ContractRecordDto } from '@majayong/types/api';
import { LoadingState, Chip, EmptyState, Money, chipToneOf } from '@/components/ui';
import { useSession } from '@/app/session';
import { apiRequest } from '@/lib/api';
import { contractDisplayLabel } from '@/lib/contract-status';
import { paymentStatusLabel } from '@/lib/payment-status';
import { formatDate } from '@/lib/format';
import s from './LiveContractsList.module.css';

type LoadState = 'loading' | 'ready' | 'error';

export function LiveContractsList({ role }: { role: 'CLIENT' | 'SUPPLIER' }) {
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<LoadState>('loading');
  const [contracts, setContracts] = useState<ContractRecordDto[]>([]);
  const base = role === 'CLIENT' ? '/c' : '/s';

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    apiRequest('listMyContracts', '/me/contracts', { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        setContracts(response.data);
        setState('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken]);

  if (state === 'loading') return <LoadingState label="계약을 불러오는 중입니다." />;
  if (state === 'error') return <p role="alert" className={s.state}>계약을 불러오지 못했습니다. 다시 시도해 주세요.</p>;
  if (contracts.length === 0) {
    return (
      <EmptyState title="아직 계약이 없습니다">
        {role === 'CLIENT'
          ? '프로젝트의 지원을 수락해 계약이 체결되면 이곳에 표시됩니다.'
          : '지원이 수락되어 계약이 체결되면 이곳에 표시됩니다.'}
      </EmptyState>
    );
  }

  return (
    <ul className={s.list} aria-label="내 계약 목록">
      {contracts.map((contract) => {
        const label = contractDisplayLabel(contract.status, contract.paymentStatus);
        return (
          <li key={contract.id} className={s.card}>
            <div className={s.top}>
              <Chip tone={chipToneOf(label)}>{label}</Chip>
              <span className={s.payment}>{paymentStatusLabel(contract.paymentStatus)}</span>
            </div>
            <p className={s.title}>{contract.items[0]?.title ?? `계약 ${contract.id.slice(0, 8)}`}</p>
            <dl className={s.meta}>
              <div>
                <dt>합의 금액</dt>
                <dd><Money amount={contract.agreedAmount} /></dd>
              </div>
              <div>
                <dt>기간</dt>
                <dd>{contract.durationDays}일</dd>
              </div>
              <div>
                <dt>항목</dt>
                <dd>{contract.items.length}개</dd>
              </div>
              {contract.depositDeadline && contract.paymentStatus === 'PENDING' ? (
                <div>
                  <dt>예치 기한</dt>
                  <dd>{formatDate(contract.depositDeadline)}</dd>
                </div>
              ) : null}
            </dl>
            <div className={s.links}>
              <Link to={`${base}/contracts/${contract.id}`}>계약서 보기</Link>
              <Link to={`${base}/settlements?contract=${contract.id}`}>정산 보기</Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* 의뢰인 계약 상세(읽기 전용) — getContract + getContractDocument 구조만 준비한다.
 * 서명(POST /contracts/{id}/sign)은 계약 권한·확정 규칙 확인 후 연결한다. */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ContractDocumentDto, ContractRecordDto } from '@majayong/types/api';
import { Button, Chip, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { contractDisplayLabel } from '@/lib/contract-status';
import { formatDateTime, formatWon } from '@/lib/format';

type State = 'loading' | 'success' | 'auth-error' | 'error';

const STAGE_LABEL = { INTERIM: '중간', FINAL: '최종' } as const;

export function LiveContract({ cid, styles }: { cid?: string; styles: Record<string, string> }) {
  const s = styles;
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<State>('loading');
  const [contract, setContract] = useState<ContractRecordDto | null>(null);
  const [document, setDocument] = useState<ContractDocumentDto | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!cid) return;
    const controller = new AbortController();
    setState('loading');
    Promise.all([
      apiRequest('getContract', `/contracts/${encodeURIComponent(cid)}`, { accessToken: apiAccessToken, signal: controller.signal }),
      apiRequest('getContractDocument', `/contracts/${encodeURIComponent(cid)}/document`, { accessToken: apiAccessToken, signal: controller.signal }),
    ]).then(([contractResponse, documentResponse]) => {
      setContract(contractResponse.data);
      setDocument(documentResponse.data);
      setState('success');
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
    });
    return () => controller.abort();
  }, [cid, apiAccessToken, retry]);

  if (!cid) return <div className={s.page}><p role="alert" style={{ padding: 24 }}>계약을 찾을 수 없습니다.</p></div>;

  if (state !== 'success' || contract === null || document === null) {
    return (
      <div className={s.page}>
        {state === 'loading' && <p role="status" style={{ padding: 24 }}>계약을 불러오는 중입니다.</p>}
        {state === 'auth-error' && <p role="alert" style={{ padding: 24 }}>API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.</p>}
        {state === 'error' && (
          <p role="alert" style={{ padding: 24 }}>
            계약을 불러오지 못했습니다.
            <Button variant="text" onClick={() => setRetry((count) => count + 1)}>다시 시도</Button>
          </p>
        )}
      </div>
    );
  }

  const label = contractDisplayLabel(contract.status, contract.paymentStatus);
  const headline = contract.status === 'PENDING_CONSENT'
    ? '양측 서명 대기'
    : contract.status === 'ACTIVE'
      ? (contract.paymentStatus === 'PENDING' ? '예치 대기' : '거래 진행')
      : label;

  return (
    <div className={s.page} data-screen="Contract-Client-Live">
      <p className={s.crumb}>
        <Link to="/c/contracts">내 계약</Link> › 계약서
      </p>

      <div className={s.head}>
        <div>
          <h1 className={s.title}>계약 · 전자서명</h1>
          <p className={s.sub}>
            프로젝트 {contract.projectId.slice(0, 8)} · {formatWon(contract.agreedAmount)} · {contract.durationDays}일
          </p>
        </div>
        <StatusChip status={label} />
      </div>

      <div className={`${s.bandRow} ${contract.status === 'PENDING_CONSENT' ? s.bandWarn : s.bandDone}`}>
        <div>
          <b className={s.bandTitle}>{headline}</b>
          <p className={s.bandBody}>
            {contract.status === 'PENDING_CONSENT'
              ? '양측 서명이 끝나면 계약이 체결되고 예치 단계로 넘어갑니다.'
              : contract.paymentStatus === 'PENDING'
                ? '서명이 끝났습니다. 예치가 완료되면 거래가 진행됩니다.'
                : '예치가 완료되어 거래가 진행 중입니다.'}
          </p>
        </div>
      </div>

      <div className={s.lay}>
        <div>
          <section className={s.sec}>
            <h2>계약 명세</h2>
            {contract.items.map((item) => (
              <article key={`${item.blockId}-${item.sortOrder}`} className={s.feat} aria-label={item.title}>
                <div>
                  <b className={s.featName}>{item.title}</b>
                  <Chip tone="outline">{STAGE_LABEL[item.stage]}</Chip>
                  <p className={s.featDesc}>{item.description}</p>
                  <ul className={s.conds}>
                    {item.conditions.map((condition) => (
                      <li key={condition.key} className={condition.state === 'DECIDED' ? s.cond : s.condUnset}>
                        {condition.text}
                        <span className={s.condQ}>{condition.state === 'DECIDED' ? '정해짐' : '안 정함'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </section>
        </div>

        <aside>
          <section className={s.card}>
            <div className={s.money}>
              <div className={s.moneyRow}><span className={s.moneyK}>합의 금액</span><b>{formatWon(document.agreedAmount)}</b></div>
              <div className={s.moneyRow}><span className={s.moneyK}>의뢰인 수수료</span><b>{formatWon(document.clientFee)}</b></div>
              <div className={s.moneyRow}><span className={s.moneyK}>공급자 수수료</span><b>{formatWon(document.supplierFee)}</b></div>
              <div className={s.moneyRow}><span className={s.moneyK}>예치 금액</span><b>{formatWon(document.depositAmount)}</b></div>
              <div className={s.moneyTot}><span>공급자 지급액</span><b className={s.moneyTotValue}>{formatWon(document.supplierPayout)}</b></div>
            </div>
          </section>

          <section className={s.card}>
            <h2>서명</h2>
            <p className={s.deadlineRow}>의뢰인 {contract.clientSignedAt ? formatDateTime(contract.clientSignedAt) : '미서명'}</p>
            <p className={s.deadlineRow}>공급자 {contract.supplierSignedAt ? formatDateTime(contract.supplierSignedAt) : '미서명'}</p>
            <p className={s.deadlineRow}>서명 기한 {formatDateTime(contract.consentDeadline)}</p>
            <p className={s.deadlineRow}>
              예치 기한 {contract.depositDeadline ? formatDateTime(contract.depositDeadline) : '—'}
            </p>
            <p className={s.doneNote}>
              서명 시 문서 해시 <b>{document.contentHash.slice(0, 12)}…</b>를 그대로 전송해야 합니다.
            </p>
            <Button variant="primary" full disabled disabledReason="서명은 계약 권한·확정 규칙 확인 후 연결합니다.">
              서명
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

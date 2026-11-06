/* 계약 상세·전자서명 — CLIENT/SUPPLIER 공용.
 * 서명은 계약 문서의 contentHash를 그대로 사용하고, 성공 후 서버 계약 상태로만 갱신한다. */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { CancellationDto, ContractDocumentDto, ContractRecordDto } from '@majayong/types/api';
import { LoadingState, Button, Chip, ConfirmDialog, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { contractDisplayLabel } from '@/lib/contract-status';
import { CONTRACT_SIGN_ENABLED } from '@/lib/feature-flags';
import { formatDateTime, formatWon } from '@/lib/format';

/* 배포에서 서명을 열지 여부는 별도 설정으로 관리한다. */

type State = 'loading' | 'success' | 'auth-error' | 'error';

const STAGE_LABEL = { INTERIM: '중간', FINAL: '최종' } as const;

export function LiveContract({ cid, styles }: { cid?: string; styles: Record<string, string> }) {
  const s = styles;
  const { apiAccessToken, session, authUser } = useSession();
  const role = session.status === 'user' ? session.role : 'CLIENT';
  const [state, setState] = useState<State>('loading');
  const [contract, setContract] = useState<ContractRecordDto | null>(null);
  const [document, setDocument] = useState<ContractDocumentDto | null>(null);
  const [retry, setRetry] = useState(0);
  const [signOpen, setSignOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [signNotice, setSignNotice] = useState<string | null>(null);
  const [cancellation, setCancellation] = useState<CancellationDto | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawNotice, setWithdrawNotice] = useState<string | null>(null);

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

  useEffect(() => {
    if (!cid || contract?.status !== 'CANCEL_REQUESTED') {
      setCancellation(null);
      return;
    }
    const controller = new AbortController();
    apiRequest('getCancellation', `/contracts/${encodeURIComponent(cid)}/cancellation`, {
      accessToken: apiAccessToken,
      signal: controller.signal,
    }).then((response) => setCancellation(response.data)).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setCancellation(null);
    });
    return () => controller.abort();
  }, [cid, contract?.status, apiAccessToken]);

  async function withdrawCancellation() {
    if (!cid || withdrawing) return;
    setWithdrawOpen(false);
    setWithdrawing(true);
    setWithdrawError(null);
    setWithdrawNotice(null);
    try {
      await apiRequest('withdrawCancellation', `/contracts/${encodeURIComponent(cid)}/cancellation/withdraw`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: {},
      });
      setWithdrawNotice('취소 요청을 철회했습니다. 계약이 다시 진행됩니다.');
      setCancellation(null);
      setRetry((count) => count + 1);
    } catch (error) {
      setWithdrawError(error instanceof ApiRequestError ? error.message : '취소 요청을 철회하지 못했습니다.');
    } finally {
      setWithdrawing(false);
    }
  }

  async function sign() {
    if (!cid || signing) return;
    setSignOpen(false);
    setSigning(true);
    setSignError(null);
    setSignNotice(null);
    try {
      // Always use the server document hash fetched immediately before signing.
      const current = await apiRequest('getContractDocument', `/contracts/${encodeURIComponent(cid)}/document`, {
        accessToken: apiAccessToken,
      });
      setDocument(current.data);
      const response = await apiRequest('signContract', `/contracts/${encodeURIComponent(cid)}/sign`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { expectedContentHash: current.data.contentHash },
      });
      setContract(response.data.contract);
      setSignNotice(response.data.activated
        ? '계약이 체결되었습니다. 예치 단계로 진행합니다.'
        : '서명이 완료되었습니다. 상대방 서명을 기다립니다.');
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setState('auth-error');
      } else if (error instanceof ApiRequestError && error.status === 404) {
        setState('error');
      } else if (error instanceof ApiRequestError) {
        setSignError(error.message);
        // Hash/state conflicts: show the latest contract and document, never re-sign automatically.
        if (error.status === 409 || error.code === 'CONTRACT_HASH_MISMATCH') {
          setRetry((count) => count + 1);
        }
      } else {
        setSignError('서명하지 못했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setSigning(false);
    }
  }

  if (!cid) return <div className={s.page}><p role="alert" style={{ padding: 24 }}>계약을 찾을 수 없습니다.</p></div>;

  if (state !== 'success' || contract === null || document === null) {
    return (
      <div className={s.page}>
        {state === 'loading' && <LoadingState title="계약서" label="계약을 불러오는 중입니다." />}
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

  const isSupplier = role === 'SUPPLIER';
  const mySignedAt = isSupplier ? contract.supplierSignedAt : contract.clientSignedAt;
  const otherSignedAt = isSupplier ? contract.clientSignedAt : contract.supplierSignedAt;
  const label = contractDisplayLabel(contract.status, contract.paymentStatus);
  const headline = contract.status === 'PENDING_CONSENT'
    ? '양측 서명 대기'
    : contract.status === 'ACTIVE'
      ? (contract.paymentStatus === 'PENDING' ? '예치 대기' : '거래 진행')
      : label;
  const deadlineValid = new Date(contract.consentDeadline).getTime() > Date.now();
  const canSign = CONTRACT_SIGN_ENABLED && role !== 'ADMIN' &&
    contract.status === 'PENDING_CONSENT' && mySignedAt === null && deadlineValid;
  const canWithdraw = cancellation !== null &&
    cancellation.cancelRequestedBy === authUser?.id &&
    cancellation.cancelResolvedAt === null &&
    cancellation.cancelEscalatedAt === null;
  const listHref = isSupplier ? '/s/contracts' : '/c/contracts';
  const bandBody = contract.status === 'PENDING_CONSENT'
    ? (mySignedAt === null
      ? '서명하면 계약에 서명한 것으로 기록되고, 양측 서명이 끝나면 계약이 체결됩니다.'
      : '내 서명은 완료되었습니다. 상대방 서명을 기다리고 있습니다.')
    : contract.status === 'COMPLETED'
      ? '거래와 정산이 모두 완료되었습니다.'
      : contract.status === 'CANCELLED'
        ? '계약이 취소되었습니다.'
        : contract.paymentStatus === 'PENDING'
          ? '서명이 끝났습니다. 예치가 완료되면 거래가 진행됩니다.'
          : '예치가 완료되어 거래가 진행 중입니다.';

  return (
    <div className={s.page} data-screen="Contract-Live" data-role={role}>
      <p className={s.crumb}>
        <Link to={listHref}>내 계약</Link> › 계약서
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
          <p className={s.bandBody}>{bandBody}</p>
        </div>
      </div>

      {cancellation ? (
        <div className={s.bandRow}>
          <div>
            <b className={s.bandTitle}>취소 요청 중</b>
            <p className={s.bandBody}>
              {cancellation.cancelNote ?? '상대방이 취소를 요청했습니다.'}
              {cancellation.cancelEscalatedAt ? ' · 운영자 판정 대기 중입니다.' : ''}
            </p>
            {withdrawError ? <p role="alert">{withdrawError}</p> : null}
            {canWithdraw ? (
              <Button variant="ghost" type="button" disabled={withdrawing} onClick={() => setWithdrawOpen(true)}>
                {withdrawing ? '철회 중' : '취소 요청 철회'}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {withdrawNotice ? <p role="status">{withdrawNotice}</p> : null}

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
              {isSupplier ? (
                <>
                  <div className={s.moneyRow}><span className={s.moneyK}>공급자 수수료</span><b>{formatWon(document.supplierFee)}</b></div>
                  <div className={s.moneyTot}><span>받을 금액</span><b className={s.moneyTotValue}>{formatWon(document.supplierPayout)}</b></div>
                </>
              ) : (
                <>
                  <div className={s.moneyRow}><span className={s.moneyK}>의뢰인 수수료</span><b>{formatWon(document.clientFee)}</b></div>
                  <div className={s.moneyTot}><span>예치 금액</span><b className={s.moneyTotValue}>{formatWon(document.depositAmount)}</b></div>
                </>
              )}
              <div className={s.moneyRow}><span className={s.moneyK}>예치 금액</span><b>{formatWon(document.depositAmount)}</b></div>
              <div className={s.moneyRow}><span className={s.moneyK}>예치됨</span><b>{formatWon(contract.totalDeposited)}</b></div>
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

            {signNotice && <p role="status">{signNotice}</p>}
            {signError && <p role="alert">{signError}</p>}

            {canSign ? (
              <Button variant="primary" full onClick={() => setSignOpen(true)} disabled={signing}>
                {signing ? '서명 중' : '서명'}
              </Button>
            ) : (
              <Button
                variant="primary"
                full
                disabled
                disabledReason={
                  !CONTRACT_SIGN_ENABLED ? '배포 환경에서는 서명 기능이 비활성화되어 있습니다.'
                    : mySignedAt !== null ? '이미 서명했습니다.'
                      : contract.status !== 'PENDING_CONSENT' ? '서명할 수 있는 상태가 아닙니다.'
                        : '서명 기한이 지났습니다.'
                }
              >
                서명
              </Button>
            )}

            {!isSupplier && contract.status === 'ACTIVE' && contract.paymentStatus === 'PENDING' && (
              <p className={s.doneNote}>
                다음 단계는 예치입니다. <Link to={`/c/contracts/${encodeURIComponent(cid)}/escrow`}>예치 화면 보기</Link>
              </p>
            )}
            {isSupplier && contract.status === 'ACTIVE' && contract.paymentStatus === 'PENDING' && (
              <p className={s.doneNote}>의뢰인의 예치를 기다리고 있습니다.</p>
            )}
          </section>
        </aside>
      </div>

      {signOpen && (
        <ConfirmDialog
          title="계약서에 서명할까요?"
          confirmLabel="서명"
          onConfirm={() => void sign()}
          onCancel={() => setSignOpen(false)}
        >
          <p>
            {formatWon(contract.agreedAmount)} · {contract.durationDays}일
            <br />
            서명 기한 {formatDateTime(contract.consentDeadline)}
          </p>
          <p>계약 내용과 금액·조건을 확인했습니다. 서명하면 계약에 서명한 것으로 기록되고, 양측 서명이 끝나면 계약이 체결됩니다.</p>
        </ConfirmDialog>
      )}
      {withdrawOpen && (
        <ConfirmDialog
          title="취소 요청을 철회할까요?"
          confirmLabel="철회"
          onConfirm={() => void withdrawCancellation()}
          onCancel={() => setWithdrawOpen(false)}
        >
          <p>철회하면 계약이 다시 진행됩니다. 상대방에게도 취소 요청이 철회된 것으로 표시됩니다.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}

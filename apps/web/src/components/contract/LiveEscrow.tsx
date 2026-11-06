/* 의뢰인 예치 — 계약(B) 데이터와 C 예치 API를 표시한다.
 * 결제창은 DEPOSIT_ENABLED와 공개 클라이언트 키가 있을 때만 열고, 승인은 서버 confirm으로만 확정한다. */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ContractDocumentDto, ContractRecordDto, EscrowDepositDto } from '@majayong/types/api';
import { Band, Button, Deadline, Money, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { createDeposit, confirmDeposit, listDeposits } from '@/lib/deposit-api';
import { contractDisplayLabel } from '@/lib/contract-status';
import { DEPOSIT_ENABLED, TOSS_CLIENT_KEY } from '@/lib/feature-flags';
import { formatDateTime, formatWon } from '@/lib/format';
import { paymentStatusLabel } from '@/lib/payment-status';
import { supplierProfile, type SupplierProfileSummary } from '@/lib/supplier-profile';
import { requestCardPayment } from '@/lib/toss-payment';

type State = 'loading' | 'success' | 'auth-error' | 'error';

const DEPOSIT_LABEL: Record<EscrowDepositDto['status'], string> = {
  PENDING: '결제 대기',
  HELD: '확인 필요',
  COMPLETED: '예치 완료',
  FAILED: '결제 실패',
};

export function LiveEscrow({
  cid,
  styles,
  depositEnabled = DEPOSIT_ENABLED,
  tossClientKey = TOSS_CLIENT_KEY,
}: {
  cid?: string;
  styles: Record<string, string>;
  depositEnabled?: boolean;
  tossClientKey?: string;
}) {
  const s = styles;
  const { apiAccessToken, authUser } = useSession();
  const [state, setState] = useState<State>('loading');
  const [contract, setContract] = useState<ContractRecordDto | null>(null);
  const [document, setDocument] = useState<ContractDocumentDto | null>(null);
  const [supplier, setSupplier] = useState<SupplierProfileSummary | null>(null);
  const [deposits, setDeposits] = useState<EscrowDepositDto[]>([]);
  const [retry, setRetry] = useState(0);
  const [paying, setPaying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const confirmedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!cid) return;
    const controller = new AbortController();
    setState('loading');
    Promise.all([
      apiRequest('getContract', `/contracts/${encodeURIComponent(cid)}`, { accessToken: apiAccessToken, signal: controller.signal }),
      apiRequest('getContractDocument', `/contracts/${encodeURIComponent(cid)}/document`, { accessToken: apiAccessToken, signal: controller.signal }),
    ]).then(async ([contractResponse, documentResponse]) => {
      setContract(contractResponse.data);
      setDocument(documentResponse.data);
      setState('success');
      setSupplier(await supplierProfile(contractResponse.data.supplierId, apiAccessToken));
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
    });
    return () => controller.abort();
  }, [cid, apiAccessToken, retry]);

  useEffect(() => {
    if (!depositEnabled || !cid || !apiAccessToken.trim()) return;
    let active = true;
    listDeposits(apiAccessToken, cid)
      .then((rows) => { if (active) setDeposits(rows); })
      .catch((error: unknown) => {
        if (!active) return;
        setPaymentError(error instanceof ApiRequestError ? error.message : '결제 내역을 불러오지 못했습니다.');
      });
    return () => { active = false; };
  }, [depositEnabled, cid, apiAccessToken, retry]);

  useEffect(() => {
    if (!depositEnabled || !cid || !apiAccessToken.trim() || state !== 'success') return;
    const payment = params.get('payment');
    const paymentKey = params.get('paymentKey');
    if (payment === 'fail' || (!paymentKey && (params.get('code') || params.get('message')))) {
      setPaymentError(params.get('message') || '결제가 취소되었습니다.');
      return;
    }
    const orderId = params.get('orderId');
    const amount = Number(params.get('amount'));
    if (!paymentKey || !orderId || !Number.isSafeInteger(amount) || amount <= 0) return;
    if (confirmedKey.current === paymentKey) return;
    confirmedKey.current = paymentKey;
    let active = true;
    setConfirming(true);
    setPaymentError(null);
    confirmDeposit(apiAccessToken, cid, orderId, paymentKey, amount)
      .then((result) => {
        if (!active) return;
        setContract(result.contract);
        setPaymentNotice('예치가 완료되었습니다.');
        navigate(`/c/contracts/${encodeURIComponent(cid)}/escrow`, { replace: true });
        setRetry((count) => count + 1);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setPaymentError(error instanceof ApiRequestError ? error.message : '결제 승인을 확인하지 못했습니다.');
      })
      .finally(() => { if (active) setConfirming(false); });
    return () => { active = false; };
  }, [depositEnabled, cid, apiAccessToken, state, params, navigate]);

  if (!cid) return <div className={s.page}><p role="alert" style={{ padding: 24 }}>계약을 찾을 수 없습니다.</p></div>;

  if (state !== 'success' || contract === null || document === null) {
    return (
      <div className={s.page}>
        {state === 'loading' && <p role="status" style={{ padding: 24 }}>예치 정보를 불러오는 중입니다.</p>}
        {state === 'auth-error' && <p role="alert" style={{ padding: 24 }}>API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.</p>}
        {state === 'error' && (
          <p role="alert" style={{ padding: 24 }}>
            예치 정보를 불러오지 못했습니다.
            <Button variant="text" onClick={() => setRetry((count) => count + 1)}>다시 시도</Button>
          </p>
        )}
      </div>
    );
  }

  const active = contract.status === 'ACTIVE';
  const waiting = active && contract.paymentStatus === 'PENDING';
  const deposited = contract.paymentStatus !== 'PENDING';
  const remaining = Math.max(0, document.depositAmount - contract.totalDeposited);
  const depositAmount = document.depositAmount;
  const pendingDeposit = deposits.find((deposit) => deposit.status === 'PENDING') ?? null;
  const paymentReady = depositEnabled && tossClientKey.trim().length > 0;

  async function startPayment() {
    if (!cid || !paymentReady || !waiting || paying || confirming) return;
    setPaying(true);
    setPaymentError(null);
    setPaymentNotice(null);
    try {
      let target = pendingDeposit;
      if (!target) {
        const created = await createDeposit(apiAccessToken, cid, depositAmount);
        target = created.deposit;
        setDeposits((rows) => [created.deposit, ...rows]);
      }
      if (!target) throw new Error('DEPOSIT_NOT_CREATED');
      const base = `${window.location.origin}/c/contracts/${encodeURIComponent(cid)}/escrow`;
      await requestCardPayment({
        clientKey: tossClientKey,
        amount: target.amount,
        orderId: target.id,
        orderName: `마자용 예치 ${cid.slice(0, 8)}`,
        ...(authUser?.email ? { customerEmail: authUser.email } : {}),
        successUrl: `${base}?payment=success`,
        failUrl: `${base}?payment=fail`,
      });
    } catch (error) {
      setPaymentError(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error && error.message === 'TOSS_CLIENT_KEY_MISSING'
            ? '결제 설정이 준비되지 않았습니다.'
            : '결제창을 열지 못했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className={s.page} data-screen="Escrow-Client-Live">
      <p className={s.crumb}>
        <Link to="/c/contracts">내 계약</Link>
        {' › '}
        <Link to={`/c/contracts/${encodeURIComponent(cid)}`}>계약서</Link>
        {' › '}
        예치
      </p>

      <div className={s.head}>
        <h1 className={s.title}>{deposited ? '예치 완료' : '예치'}</h1>
        <p className={s.sub}>
          {deposited
            ? '예치된 금액은 검수·지급 절차에 따라 정산됩니다.'
            : active
              ? '예치가 완료되면 작업이 시작됩니다.'
              : '계약서 서명이 끝나야 예치할 수 있습니다.'}
        </p>
      </div>

      {contract.depositDeadline && (
        <div className={s.deadlineRow}>
          <Deadline label="예치 기한" at={contract.depositDeadline} actionable={waiting} />
        </div>
      )}

      {!active && (
        <div className={s.bandGap}>
          <Band tone="wait" title="서명 대기">
            양측 서명이 끝나면 예치 기한과 예치 금액이 확정됩니다.
          </Band>
        </div>
      )}
      {waiting && (
        <div className={s.bandGap}>
          <Band tone="wait" title="예치 대기">
            {paymentReady
              ? '예치 금액을 확인한 뒤 결제창에서 승인을 완료해 주세요.'
              : '예치 금액을 확인한 뒤 예치해 주세요. 결제 요청은 sandbox·webhook 검증 후 활성화됩니다.'}
          </Band>
        </div>
      )}
      {paymentError && (
        <div className={s.bandGap}>
          <Band tone="warn" title="결제 확인 필요">{paymentError}</Band>
        </div>
      )}
      {paymentNotice && !deposited && (
        <div className={s.bandGap}>
          <Band tone="done" title="예치 완료">{paymentNotice}</Band>
        </div>
      )}
      {deposited && (
        <div className={s.bandGap}>
          <Band tone="done" title={paymentStatusLabel(contract.paymentStatus)}>
            예치된 금액은 서버가 확인한 상태입니다. 추가 결제는 필요하지 않습니다.
          </Band>
        </div>
      )}

      <div className={s.lay}>
        <div>
          <section className={s.card} aria-labelledby="live-escrow-ct">
            <h2 className={s.ct} id="live-escrow-ct">계약 요약</h2>
            <div className={s.who}>
              <div className={s.pf}>
                <span className={s.av} aria-hidden="true">{supplier?.displayName?.slice(0, 1) ?? '공'}</span>
                <div>
                  <div className={s.nm}>{supplier?.displayName ?? `공급자 ${contract.supplierId.slice(0, 8)}`}</div>
                  <div className={s.mt}>프로젝트 {contract.projectId.slice(0, 8)}</div>
                </div>
              </div>
              <StatusChip status={contractDisplayLabel(contract.status, contract.paymentStatus)} />
            </div>
            <div className={s.kv}>
              <div>
                <div className={s.k}>합의 금액</div>
                <div className={s.v}><Money amount={contract.agreedAmount} /></div>
              </div>
              <div>
                <div className={s.k}>작업 기간</div>
                <div className={s.v}>{contract.durationDays}일</div>
              </div>
              <div>
                <div className={s.k}>예치 상태</div>
                <div className={s.v}>{paymentStatusLabel(contract.paymentStatus)}</div>
              </div>
            </div>
            <div className={s.kv}>
              <div>
                <div className={s.k}>예치 총액</div>
                <div className={s.v}>{formatWon(document.depositAmount)}</div>
              </div>
              <div>
                <div className={s.k}>예치된 금액</div>
                <div className={s.v}>{formatWon(contract.totalDeposited)}</div>
              </div>
              <div>
                <div className={s.k}>남은 금액</div>
                <div className={s.v}>{formatWon(remaining)}</div>
              </div>
            </div>
            <p className={s.secLink}>
              <Link to={`/c/contracts/${encodeURIComponent(cid)}`}>계약서 보기</Link>
              {contract.depositDeadline && ` · 예치 기한 ${formatDateTime(contract.depositDeadline)}`}
            </p>
          </section>

          <section className={s.card} aria-labelledby="live-escrow-history">
            <h2 className={s.ct} id="live-escrow-history">결제 내역</h2>
            {deposits.length === 0 ? (
              <p className={s.hint}>결제를 시작하면 이곳에 예치 요청과 상태가 표시됩니다.</p>
            ) : (
              <div className={s.kv}>
                {deposits.map((row) => (
                  <div key={row.id}>
                    <div className={s.k}>{DEPOSIT_LABEL[row.status]}</div>
                    <div className={s.v}>{formatWon(row.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside>
          <section className={s.pay} aria-labelledby="live-escrow-pay">
            <h3 id="live-escrow-pay">예치 금액</h3>
            <div className={s.payRow}><span>합의 금액</span><b><Money amount={document.agreedAmount} /></b></div>
            <div className={s.payRow}><span>의뢰인 수수료</span><b><Money amount={document.clientFee} /></b></div>
            <div className={s.payTot}><span>총 예치 금액</span><Money amount={document.depositAmount} size="row" /></div>
            <div className={s.payRow}><span>예치된 금액</span><b>{formatWon(contract.totalDeposited)}</b></div>
            <div className={s.payRow}><span>남은 금액</span><b>{formatWon(remaining)}</b></div>

            {contract.depositDeadline && (
              <p className={s.dlNote}>{formatDateTime(contract.depositDeadline)}까지 예치</p>
            )}
            <p className={s.feeNote}>수수료는 계약서에 기록된 금액입니다.</p>

            <div className={s.btns}>
              <Button
                variant="primary"
                full
                type="button"
                onClick={() => void startPayment()}
                disabled={!paymentReady || !waiting || paying || confirming}
                disabledReason={
                  !depositEnabled
                    ? 'Toss sandbox·webhook 검증 완료 후 예치를 활성화합니다.'
                    : !tossClientKey.trim()
                      ? '결제 설정이 준비되지 않았습니다.'
                      : !waiting
                        ? '지금은 예치할 수 있는 상태가 아닙니다.'
                        : paying || confirming
                          ? '결제 처리 중입니다.'
                          : undefined
                }
              >
                {paying ? '결제창 여는 중…' : confirming ? '승인 확인 중…' : '예치하기'}
              </Button>
            </div>
            {!depositEnabled && (
              <p className={s.hint} role="status">
                결제 요청은 아직 전송되지 않습니다. 화면의 금액은 실제 계약 데이터입니다.
              </p>
            )}
            {depositEnabled && !tossClientKey.trim() && (
              <p className={s.hint} role="status">
                결제 클라이언트 키가 설정되지 않아 예치를 시작할 수 없습니다.
              </p>
            )}
            {depositEnabled && tossClientKey.trim() && pendingDeposit && (
              <p className={s.hint} role="status">
                결제를 마치면 서버 승인 확인 후 예치가 완료됩니다.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

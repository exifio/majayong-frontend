/* 공급자 납품 — 실제 계약·구간·납품 API. 계약 항목 id를 그대로 사용한다. */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ContractInstallmentDto, ContractRecordDto, DeliveryDto } from '@majayong/types/api';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { useSession } from '@/app/session';
import { Button, TextField } from '@/components/ui';
import s from './LiveDelivery.module.css';

type LoadState = 'loading' | 'ready' | 'error';
type Editable = { link: string; check: string };

const STAGE_LABEL = { INTERIM: '중간', FINAL: '최종' } as const;

export function LiveDelivery({ cid }: { cid: string }) {
  const { apiAccessToken } = useSession();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>('loading');
  const [contract, setContract] = useState<ContractRecordDto | null>(null);
  const [installments, setInstallments] = useState<ContractInstallmentDto[]>([]);
  const [editable, setEditable] = useState<Record<string, Editable>>({});
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    Promise.all([
      apiRequest('getContract', `/contracts/${encodeURIComponent(cid)}`, { accessToken: apiAccessToken, signal: controller.signal }),
      apiRequest('listContractInstallments', `/contracts/${encodeURIComponent(cid)}/installments`, { accessToken: apiAccessToken, signal: controller.signal }),
    ])
      .then(([contractResponse, installmentResponse]) => {
        setContract(contractResponse.data);
        setInstallments(installmentResponse.data.installments);
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, [cid, apiAccessToken]);

  const stage = currentStage(installments);
  const items = contract && stage ? contract.items.filter((item) => item.stage === stage.stage) : [];

  const update = (id: string, field: keyof Editable, value: string) => {
    setEditable((prev) => ({ ...prev, [id]: { link: '', check: '', ...prev[id], [field]: value } }));
  };

  const submit = async () => {
    if (!stage || items.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await apiRequest('submitDelivery', `/installments/${encodeURIComponent(stage.id)}/deliveries`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: {
          items: items.map((item) => ({
            contractItemId: item.id,
            links: editable[item.id]?.link ? [editable[item.id]!.link.trim()] : [],
            files: [],
            howToCheck: editable[item.id]?.check?.trim() ?? '',
          })),
        },
      });
      setSubmitted(true);
      setInstallments((prev) => prev.map((row) => (row.id === stage.id ? { ...row, status: 'DELIVERED' } : row)));
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : '납품을 제출하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'loading') {
    return <div data-screen="Deliver-Supplier"><p role="status" className={s.state}>계약을 불러오는 중입니다.</p></div>;
  }
  if (state === 'error' || !contract) {
    return <div data-screen="Deliver-Supplier"><p role="alert" className={s.state}>계약을 불러오지 못했습니다. 다시 시도해 주세요.</p></div>;
  }

  return (
    <div className={s.page} data-screen="Deliver-Supplier">
      <p className={s.crumb}>
        <Link to="/s/contracts">내 계약</Link> {' › '}
        <Link to={`/s/contracts/${cid}`}>계약</Link>
      </p>
      <h1 className={s.title}>납품</h1>
      <p className={s.sub}>구간별 계약 항목의 결과물 링크와 확인 방법을 적어 제출합니다.</p>

      {submitted || !stage ? (
        <div className={s.done} role="status">
          <b>{submitted ? `${stage ? STAGE_LABEL[stage.stage] : ''} 납품을 제출했습니다.` : '납품할 구간이 없습니다.'}</b>
          <Button variant="ghost" type="button" onClick={() => navigate('/s/contracts')}>내 계약으로</Button>
        </div>
      ) : (
        <>
          <p className={s.stageLine}>
            {STAGE_LABEL[stage.stage]} 구간 · {stage.amount.toLocaleString('ko-KR')}원
          </p>
          <ul className={s.items}>
            {items.map((item) => (
              <li key={item.id} className={s.item}>
                <h2 className={s.itemTitle}>{item.title}</h2>
                <p className={s.itemDesc}>{item.description}</p>
                <TextField
                  label={`${item.title} 결과물 링크`}
                  value={editable[item.id]?.link ?? ''}
                  onChange={(event) => update(item.id, 'link', event.target.value)}
                />
                <TextField
                  label={`${item.title} 확인 방법`}
                  value={editable[item.id]?.check ?? ''}
                  onChange={(event) => update(item.id, 'check', event.target.value)}
                />
              </li>
            ))}
          </ul>
          {error ? <p className={s.error} role="alert">{error}</p> : null}
          <div className={s.actions}>
            <Button
              variant="primary"
              type="button"
              disabled={busy || items.length === 0}
              disabledReason={busy ? '제출 중입니다' : undefined}
              onClick={() => void submit()}
            >
              {busy ? '제출 중' : '납품 제출'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function currentStage(installments: ContractInstallmentDto[]): ContractInstallmentDto | null {
  return installments.find((row) => row.status === 'REWORK_REQUESTED')
    ?? installments.find((row) => row.status === 'PENDING')
    ?? null;
}

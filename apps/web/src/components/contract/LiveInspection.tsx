/* 의뢰인 검수 — 실제 계약·구간·납품 API. 항목 id와 deliveryId로 승인/보완한다. */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ContractInstallmentDto, ContractRecordDto, DeliveryDto } from '@majayong/types/api';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { useSession } from '@/app/session';
import { Button, TextAreaField } from '@/components/ui';
import s from './LiveInspection.module.css';

type LoadState = 'loading' | 'ready' | 'error';
const STAGE_LABEL = { INTERIM: '중간', FINAL: '최종' } as const;

export function LiveInspection({ cid }: { cid: string }) {
  const { apiAccessToken } = useSession();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>('loading');
  const [contract, setContract] = useState<ContractRecordDto | null>(null);
  const [stage, setStage] = useState<ContractInstallmentDto | null>(null);
  const [delivery, setDelivery] = useState<DeliveryDto | null>(null);
  const [approved, setApproved] = useState<string[]>([]);
  const [reworked, setReworked] = useState<string[]>([]);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    Promise.all([
      apiRequest('getContract', `/contracts/${encodeURIComponent(cid)}`, { accessToken: apiAccessToken, signal: controller.signal }),
      apiRequest('listContractInstallments', `/contracts/${encodeURIComponent(cid)}/installments`, { accessToken: apiAccessToken, signal: controller.signal }),
    ])
      .then(async ([contractResponse, installmentResponse]) => {
        const nextStage = installmentResponse.data.installments.find((row) => row.status === 'DELIVERED') ?? null;
        setContract(contractResponse.data);
        setStage(nextStage);
        if (nextStage) {
          const deliveries = await apiRequest('listDeliveries', `/installments/${encodeURIComponent(nextStage.id)}/deliveries`, {
            accessToken: apiAccessToken,
            signal: controller.signal,
          });
          setDelivery(deliveries.data[deliveries.data.length - 1] ?? null);
        }
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, [cid, apiAccessToken]);

  const items = contract && stage ? contract.items.filter((item) => item.stage === stage.stage) : [];

  const approve = async (itemId: string) => {
    if (!delivery || busy) return;
    setBusy(itemId);
    setError(null);
    try {
      await apiRequest('approveContractItem', `/contract-items/${encodeURIComponent(itemId)}/approve`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { deliveryId: delivery.id },
      });
      setApproved((prev) => [...prev, itemId]);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : '승인하지 못했습니다.');
    } finally {
      setBusy(null);
    }
  };

  const requestRework = async (itemId: string) => {
    if (!delivery || busy || !note.trim()) return;
    setBusy(itemId);
    setError(null);
    try {
      await apiRequest('requestRework', `/contract-items/${encodeURIComponent(itemId)}/rework-requests`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { deliveryId: delivery.id, reason: 'OTHER', note: note.trim() },
      });
      setReworked((prev) => [...prev, itemId]);
      setNoteFor(null);
      setNote('');
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : '보완 요청을 보내지 못했습니다.');
    } finally {
      setBusy(null);
    }
  };

  if (state === 'loading') {
    return <div data-screen="Inspect-Client"><p role="status" className={s.state}>검수 정보를 불러오는 중입니다.</p></div>;
  }
  if (state === 'error' || !contract) {
    return <div data-screen="Inspect-Client"><p role="alert" className={s.state}>검수 정보를 불러오지 못했습니다. 다시 시도해 주세요.</p></div>;
  }

  return (
    <div className={s.page} data-screen="Inspect-Client">
      <p className={s.crumb}>
        <Link to="/c/contracts">내 계약</Link> {' › '}
        <Link to={`/c/contracts/${cid}`}>계약</Link>
      </p>
      <h1 className={s.title}>검수</h1>
      <p className={s.sub}>납품된 항목을 확인하고 승인하거나 보완을 요청합니다.</p>

      {!stage || !delivery ? (
        <p className={s.state}>아직 검수할 납품이 없습니다. 공급자가 납품하면 이곳에 표시됩니다.</p>
      ) : (
        <>
          <p className={s.stageLine}>{STAGE_LABEL[stage.stage]} 구간 · {stage.amount.toLocaleString('ko-KR')}원</p>
          <ul className={s.items}>
            {items.map((item) => {
              const done = approved.includes(item.id);
              const asked = reworked.includes(item.id);
              const delivered = delivery.items.find((row) => row.contractItemId === item.id);
              return (
                <li key={item.id} className={s.item}>
                  <div className={s.itemHead}>
                    <h2 className={s.itemTitle}>{item.title}</h2>
                    <span className={s.badge}>
                      {done ? '승인 완료' : asked ? '보완 요청함' : delivered ? '검수 대기' : '납품 없음'}
                    </span>
                  </div>
                  <p className={s.itemDesc}>{item.description}</p>
                  {delivered ? (
                    <div className={s.delivery}>
                      {delivered.links.map((link) => (
                        <a key={link} href={link} target="_blank" rel="noreferrer">{link}</a>
                      ))}
                      <p>{delivered.howToCheck}</p>
                    </div>
                  ) : null}
                  {!done && !asked ? (
                    <div className={s.actions}>
                      <Button
                        variant="ghost"
                        type="button"
                        disabled={busy === item.id}
                        onClick={() => { setNoteFor(noteFor === item.id ? null : item.id); setNote(''); }}
                      >
                        보완 요청
                      </Button>
                      <Button
                        variant="primary"
                        type="button"
                        disabled={busy === item.id || !delivered}
                        disabledReason={!delivered ? '납품되지 않은 항목입니다' : busy === item.id ? '처리 중입니다' : undefined}
                        onClick={() => void approve(item.id)}
                      >
                        승인
                      </Button>
                    </div>
                  ) : null}
                  {noteFor === item.id && !done && !asked ? (
                    <div className={s.note}>
                      <TextAreaField label="보완 사유" value={note} onChange={(event) => setNote(event.target.value)} />
                      <Button
                        variant="tint"
                        type="button"
                        disabled={busy === item.id || !note.trim()}
                        disabledReason={!note.trim() ? '보완 사유를 입력해 주세요' : undefined}
                        onClick={() => void requestRework(item.id)}
                      >
                        보완 요청 보내기
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {error ? <p className={s.error} role="alert">{error}</p> : null}
          <div className={s.footer}>
            <Button variant="ghost" type="button" onClick={() => navigate('/c/contracts')}>내 계약으로</Button>
          </div>
        </>
      )}
    </div>
  );
}

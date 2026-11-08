/* 의뢰인 검수 — 실제 계약·구간·납품 API. 항목 id와 deliveryId로 승인/보완한다.
 * 보완 사유는 서버 enum 4종이며, 합의 조건과 다름은 DECIDED 조건 키를 함께 보낸다.
 * 진행 중(OPEN) 보완 요청은 도움 요청(운영자 개입)으로 올릴 수 있다. */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type {
  ApiInspectionReason,
  ContractInstallmentDto,
  ContractItemDto,
  ContractRecordDto,
  DeliveryDto,
  InspectionRequestDto,
} from '@majayong/types/api';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { useSession } from '@/app/session';
import { AttachmentLink } from '@/components/attachments/AttachmentLink';
import { LoadingState, Button, SelectCards, TextAreaField, TextField } from '@/components/ui';
import s from './LiveInspection.module.css';

type LoadState = 'loading' | 'ready' | 'error';
const STAGE_LABEL = { INTERIM: '중간', FINAL: '최종' } as const;

export const REWORK_REASON_LABEL: Record<ApiInspectionReason, string> = {
  CONDITION_MISMATCH: '합의 조건과 다름',
  NOT_WORKING: '작동하지 않음',
  MISSING_PART: '빠진 부분이 있음',
  OTHER: '기타',
};
const REWORK_REASONS = Object.keys(REWORK_REASON_LABEL) as ApiInspectionReason[];

/** 검수할 구간: 납품됨(DELIVERED)이 우선, 없으면 보완 요청 중인 구간. */
function inspectStage(installments: ContractInstallmentDto[]): ContractInstallmentDto | null {
  return installments.find((row) => row.status === 'DELIVERED')
    ?? installments.find((row) => row.status === 'REWORK_REQUESTED')
    ?? null;
}

export function LiveInspection({ cid }: { cid: string }) {
  const { apiAccessToken } = useSession();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>('loading');
  const [contract, setContract] = useState<ContractRecordDto | null>(null);
  const [stage, setStage] = useState<ContractInstallmentDto | null>(null);
  const [delivery, setDelivery] = useState<DeliveryDto | null>(null);
  const [requests, setRequests] = useState<Record<string, InspectionRequestDto[]>>({});
  const [approved, setApproved] = useState<string[]>([]);
  const [reworked, setReworked] = useState<string[]>([]);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [reason, setReason] = useState<ApiInspectionReason | null>(null);
  const [conditionKey, setConditionKey] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [helpFor, setHelpFor] = useState<string | null>(null);
  const [helpReason, setHelpReason] = useState('');
  const [helpWhat, setHelpWhat] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const options = { accessToken: apiAccessToken, signal: controller.signal };
    setState('loading');
    Promise.all([
      apiRequest('getContract', `/contracts/${encodeURIComponent(cid)}`, options),
      apiRequest('listContractInstallments', `/contracts/${encodeURIComponent(cid)}/installments`, options),
    ])
      .then(async ([contractResponse, installmentResponse]) => {
        const nextStage = inspectStage(installmentResponse.data.installments);
        setContract(contractResponse.data);
        setStage(nextStage);
        if (nextStage) {
          const deliveries = await apiRequest('listDeliveries', `/installments/${encodeURIComponent(nextStage.id)}/deliveries`, options);
          setDelivery(deliveries.data[deliveries.data.length - 1] ?? null);
          const stageItems = contractResponse.data.items.filter((item) => item.stage === nextStage.stage);
          // 보완 요청 이력은 도움 요청에만 쓰므로 실패해도 검수 화면은 연다.
          const lists = await Promise.all(stageItems.map((item) =>
            apiRequest('listReworkRequests', `/contract-items/${encodeURIComponent(item.id)}/rework-requests`, options)
              .then((response) => [item.id, Array.isArray(response.data) ? response.data : []] as const)
              .catch((caught: unknown) => {
                if (caught instanceof Error && caught.name === 'AbortError') throw caught;
                return [item.id, [] as InspectionRequestDto[]] as const;
              })));
          setRequests(Object.fromEntries(lists));
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

  const openRework = (itemId: string) => {
    setNoteFor(noteFor === itemId ? null : itemId);
    setReason(null);
    setConditionKey(null);
    setNote('');
  };

  const reworkReady = (item: ContractItemDto) =>
    reason !== null && note.trim().length > 0 &&
    (reason !== 'CONDITION_MISMATCH' ||
      (conditionKey !== null && item.conditions.some((c) => c.key === conditionKey && c.state === 'DECIDED')));

  const requestRework = async (item: ContractItemDto) => {
    if (!delivery || busy || reason === null || !reworkReady(item)) return;
    setBusy(item.id);
    setError(null);
    try {
      const response = await apiRequest('requestRework', `/contract-items/${encodeURIComponent(item.id)}/rework-requests`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: {
          deliveryId: delivery.id,
          reason,
          ...(reason === 'CONDITION_MISMATCH' && conditionKey !== null ? { conditionKey } : {}),
          note: note.trim(),
        },
      });
      setReworked((prev) => [...prev, item.id]);
      if (response.data?.id) {
        setRequests((prev) => ({ ...prev, [item.id]: [...(prev[item.id] ?? []), response.data] }));
      }
      setNoteFor(null);
      setNote('');
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : '보완 요청을 보내지 못했습니다.');
    } finally {
      setBusy(null);
    }
  };

  const escalate = async (request: InspectionRequestDto) => {
    if (busy || !helpReason.trim() || !helpWhat.trim()) return;
    setBusy(request.contractItemId);
    setError(null);
    setNotice(null);
    try {
      const response = await apiRequest('escalateInspection', `/inspection-requests/${encodeURIComponent(request.id)}/escalate`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { reason: helpReason.trim(), what: helpWhat.trim() },
      });
      setRequests((prev) => ({
        ...prev,
        [request.contractItemId]: (prev[request.contractItemId] ?? []).map((row) => (row.id === request.id ? response.data : row)),
      }));
      setHelpFor(null);
      setHelpReason('');
      setHelpWhat('');
      setNotice('도움 요청을 보냈습니다. 운영자가 확인하고 판정합니다.');
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : '도움 요청을 보내지 못했습니다.');
    } finally {
      setBusy(null);
    }
  };

  if (state === 'loading') {
    return <div data-screen="Inspect-Client"><LoadingState title="검수" label="검수 정보를 불러오는 중입니다." /></div>;
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
          <p className={s.stageLine}>
            {STAGE_LABEL[stage.stage]} 구간 · {stage.amount.toLocaleString('ko-KR')}원
            {stage.status === 'REWORK_REQUESTED' ? ' · 보완 대기' : ''}
          </p>
          {notice ? <p role="status">{notice}</p> : null}
          <ul className={s.items}>
            {items.map((item) => {
              const done = approved.includes(item.id);
              const itemRequests = requests[item.id] ?? [];
              const open = itemRequests.filter((row) => row.status === 'OPEN');
              const escalated = itemRequests.some((row) => row.status === 'ESCALATED');
              const asked = reworked.includes(item.id) || open.length > 0;
              const delivered = delivery.items.find((row) => row.contractItemId === item.id);
              const inspectable = stage.status === 'DELIVERED' && !done && !asked && !escalated;
              const decided = item.conditions.filter((condition) => condition.state === 'DECIDED');
              const latestOpen = open[open.length - 1];
              return (
                <li key={item.id} className={s.item}>
                  <div className={s.itemHead}>
                    <h2 className={s.itemTitle}>{item.title}</h2>
                    <span className={s.badge}>
                      {done ? '승인 완료' : escalated ? '운영자 확인 중' : asked ? '보완 요청함' : delivered ? '검수 대기' : '납품 없음'}
                    </span>
                  </div>
                  <p className={s.itemDesc}>{item.description}</p>
                  {delivered ? (
                    <div className={s.delivery}>
                      {delivered.links.map((link) => (
                        <a key={link} href={link} target="_blank" rel="noreferrer">{link}</a>
                      ))}
                      {delivered.files.map((file) => (
                        <AttachmentLink key={file.fileId} fileId={file.fileId} name={file.name} accessToken={apiAccessToken} />
                      ))}
                      <p>{delivered.howToCheck}</p>
                    </div>
                  ) : null}
                  {latestOpen ? (
                    <p className={s.itemDesc}>
                      보완 사유 · {REWORK_REASON_LABEL[latestOpen.reason]}
                      {latestOpen.note ? ` — ${latestOpen.note}` : ''}
                    </p>
                  ) : null}
                  {inspectable ? (
                    <div className={s.actions}>
                      <Button variant="ghost" type="button" disabled={busy === item.id} onClick={() => openRework(item.id)}>
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
                  {noteFor === item.id && inspectable ? (
                    <div className={s.note}>
                      <SelectCards
                        label={`${item.title} 보완 사유 종류`}
                        value={reason}
                        onChange={(key) => {
                          setReason(key as ApiInspectionReason);
                          setConditionKey(null);
                        }}
                        options={REWORK_REASONS.map((key) => ({ key, label: REWORK_REASON_LABEL[key] }))}
                      />
                      {reason === 'CONDITION_MISMATCH' ? (
                        decided.length > 0 ? (
                          <SelectCards
                            label="다른 조건"
                            value={conditionKey}
                            onChange={setConditionKey}
                            options={decided.map((condition) => ({ key: condition.key, label: condition.text }))}
                          />
                        ) : (
                          <p className={s.error} role="alert">이 항목에는 계약서에서 정해진 조건이 없어 이 사유를 고를 수 없습니다.</p>
                        )
                      ) : null}
                      <TextAreaField label="보완 사유" required value={note} onChange={(event) => setNote(event.target.value)} />
                      <Button
                        variant="tint"
                        type="button"
                        disabled={busy === item.id || !reworkReady(item)}
                        disabledReason={
                          reason === null ? '보완 사유 종류를 골라 주세요'
                            : reason === 'CONDITION_MISMATCH' && conditionKey === null ? '다른 조건을 골라 주세요'
                              : !note.trim() ? '보완 사유를 입력해 주세요' : undefined
                        }
                        onClick={() => void requestRework(item)}
                      >
                        보완 요청 보내기
                      </Button>
                    </div>
                  ) : null}
                  {latestOpen && !escalated ? (
                    helpFor === latestOpen.id ? (
                      <div className={s.note}>
                        <TextField label="도움 요청 사유" required value={helpReason} onChange={(event) => setHelpReason(event.target.value)} />
                        <TextAreaField
                          label="운영자가 확인할 내용"
                          required
                          value={helpWhat}
                          onChange={(event) => setHelpWhat(event.target.value)}
                        />
                        <div className={s.actions}>
                          <Button variant="ghost" type="button" onClick={() => setHelpFor(null)}>닫기</Button>
                          <Button
                            variant="tint"
                            type="button"
                            disabled={busy === item.id || !helpReason.trim() || !helpWhat.trim()}
                            disabledReason={!helpReason.trim() || !helpWhat.trim() ? '사유와 확인할 내용을 입력해 주세요' : undefined}
                            onClick={() => void escalate(latestOpen)}
                          >
                            도움 요청 보내기
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={s.actions}>
                        <Button variant="ghost" type="button" onClick={() => { setHelpFor(latestOpen.id); setHelpReason(''); setHelpWhat(''); }}>
                          도움 요청
                        </Button>
                      </div>
                    )
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

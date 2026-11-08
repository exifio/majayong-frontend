/* 공급자 납품 — 실제 계약·구간·납품 API. 계약 항목 id를 그대로 사용한다.
 * 항목별 링크(한 줄에 하나)·첨부 파일(POST /uploads/presign, purpose DELIVERY)·확인 방법을 함께 제출한다.
 * 보완 요청 구간을 다시 낼 때는 진행 중(OPEN) 보완 요청이 있는 항목만 보낸다(서버 규칙). */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ContractInstallmentDto, ContractRecordDto, DeliveryFileDto } from '@majayong/types/api';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { ALLOWED_UPLOAD_EXTENSION, uploadWithPresign } from '@/lib/attachments';
import { useSession } from '@/app/session';
import { LoadingState, Button, TextAreaField } from '@/components/ui';
import s from './LiveDelivery.module.css';

type LoadState = 'loading' | 'ready' | 'error';
type Editable = { link: string; check: string };

const STAGE_LABEL = { INTERIM: '중간', FINAL: '최종' } as const;
const MAX_FILE_BYTES = 50 * 1024 * 1024;

function linksOf(value: string | undefined): string[] {
  return (value ?? '').split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
}

export function LiveDelivery({ cid }: { cid: string }) {
  const { apiAccessToken } = useSession();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>('loading');
  const [contract, setContract] = useState<ContractRecordDto | null>(null);
  const [installments, setInstallments] = useState<ContractInstallmentDto[]>([]);
  const [reworkItemIds, setReworkItemIds] = useState<string[] | null>(null);
  const [editable, setEditable] = useState<Record<string, Editable>>({});
  const [files, setFiles] = useState<Record<string, DeliveryFileDto[]>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [fileError, setFileError] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const options = { accessToken: apiAccessToken, signal: controller.signal };
    setState('loading');
    Promise.all([
      apiRequest('getContract', `/contracts/${encodeURIComponent(cid)}`, options),
      apiRequest('listContractInstallments', `/contracts/${encodeURIComponent(cid)}/installments`, options),
    ])
      .then(async ([contractResponse, installmentResponse]) => {
        const rows = installmentResponse.data.installments;
        const next = currentStage(rows);
        if (next?.status === 'REWORK_REQUESTED') {
          const stageItems = contractResponse.data.items.filter((item) => item.stage === next.stage);
          const lists = await Promise.all(stageItems.map((item) =>
            apiRequest('listReworkRequests', `/contract-items/${encodeURIComponent(item.id)}/rework-requests`, options)
              .then((response) => ({ id: item.id, open: Array.isArray(response.data) && response.data.some((row) => row.status === 'OPEN') }))));
          setReworkItemIds(lists.filter((row) => row.open).map((row) => row.id));
        } else {
          setReworkItemIds(null);
        }
        setContract(contractResponse.data);
        setInstallments(rows);
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, [cid, apiAccessToken]);

  const stage = currentStage(installments);
  const items = contract && stage
    ? contract.items.filter((item) => item.stage === stage.stage && (reworkItemIds === null || reworkItemIds.includes(item.id)))
    : [];

  const update = (id: string, field: keyof Editable, value: string) => {
    setEditable((prev) => ({ ...prev, [id]: { link: '', check: '', ...prev[id], [field]: value } }));
  };

  const addFiles = async (itemId: string, list: FileList | null) => {
    if (!list || list.length === 0 || uploading) return;
    setFileError((prev) => ({ ...prev, [itemId]: '' }));
    const chosen = [...list];
    const invalid = chosen.find((file) => file.size > MAX_FILE_BYTES || !ALLOWED_UPLOAD_EXTENSION.test(file.name));
    if (invalid) {
      setFileError((prev) => ({
        ...prev,
        [itemId]: invalid.size > MAX_FILE_BYTES
          ? `${invalid.name}: 파일은 50MB까지 올릴 수 있습니다.`
          : `${invalid.name}: png·jpg·webp·pdf·zip·mp4·txt 파일만 올릴 수 있습니다.`,
      }));
      return;
    }
    setUploading(itemId);
    try {
      for (const file of chosen) {
        const uploaded = await uploadWithPresign(file, { purpose: 'DELIVERY', contractId: cid }, apiAccessToken);
        setFiles((prev) => ({ ...prev, [itemId]: [...(prev[itemId] ?? []), uploaded] }));
      }
    } catch (caught) {
      setFileError((prev) => ({
        ...prev,
        [itemId]: caught instanceof ApiRequestError ? caught.message : '파일을 올리지 못했습니다. 다시 시도해 주세요.',
      }));
    } finally {
      setUploading(null);
    }
  };

  const removeFile = (itemId: string, fileId: string) => {
    setFiles((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? []).filter((file) => file.fileId !== fileId) }));
  };

  const submit = async () => {
    if (!stage || items.length === 0 || busy || uploading) return;
    setBusy(true);
    setError(null);
    try {
      await apiRequest('submitDelivery', `/installments/${encodeURIComponent(stage.id)}/deliveries`, {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: {
          items: items.map((item) => ({
            contractItemId: item.id,
            links: linksOf(editable[item.id]?.link),
            files: files[item.id] ?? [],
            howToCheck: editable[item.id]?.check?.trim() ?? '',
          })),
          ...(summary.trim() ? { summary: summary.trim() } : {}),
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
    return <div data-screen="Deliver-Supplier"><LoadingState title="납품" label="계약을 불러오는 중입니다." /></div>;
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
      <p className={s.sub}>구간별 계약 항목의 결과물 링크·파일과 확인 방법을 적어 제출합니다.</p>

      {submitted || !stage ? (
        <div className={s.done} role="status">
          <b>{submitted ? `${stage ? STAGE_LABEL[stage.stage] : ''} 납품을 제출했습니다.` : '납품할 구간이 없습니다.'}</b>
          <Button variant="ghost" type="button" onClick={() => navigate('/s/contracts')}>내 계약으로</Button>
        </div>
      ) : (
        <>
          <p className={s.stageLine}>
            {STAGE_LABEL[stage.stage]} 구간 · {stage.amount.toLocaleString('ko-KR')}원
            {stage.status === 'REWORK_REQUESTED' ? ' · 보완 요청 항목 다시 제출' : ''}
          </p>
          {items.length === 0 ? (
            <p className={s.state}>다시 제출할 보완 요청 항목이 없습니다.</p>
          ) : null}
          <ul className={s.items}>
            {items.map((item) => {
              const itemFiles = files[item.id] ?? [];
              const inputId = `deliver-files-${item.id}`;
              return (
                <li key={item.id} className={s.item}>
                  <h2 className={s.itemTitle}>{item.title}</h2>
                  <p className={s.itemDesc}>{item.description}</p>
                  <div className={s.fields}>
                    <TextAreaField
                      label={`${item.title} 결과물 링크`}
                      hint="링크가 여러 개면 한 줄에 하나씩 적어 주세요."
                      rows={2}
                      value={editable[item.id]?.link ?? ''}
                      onChange={(event) => update(item.id, 'link', event.target.value)}
                    />
                    <div>
                      <label className={s.fileLabel} htmlFor={inputId}>{item.title} 첨부 파일</label>
                      <input
                        id={inputId}
                        type="file"
                        multiple
                        disabled={uploading !== null}
                        onChange={(event) => {
                          void addFiles(item.id, event.target.files);
                          event.target.value = '';
                        }}
                      />
                      <p className={s.fileHint}>png·jpg·webp·pdf·zip·mp4·txt, 파일당 50MB까지</p>
                      {uploading === item.id ? <p role="status" className={s.fileHint}>파일을 올리는 중입니다.</p> : null}
                      {fileError[item.id] ? <p role="alert" className={s.error}>{fileError[item.id]}</p> : null}
                      {itemFiles.length > 0 ? (
                        <ul className={s.files} aria-label={`${item.title} 올린 파일`}>
                          {itemFiles.map((file) => (
                            <li key={file.fileId} className={s.file}>
                              <span>{file.name}</span>
                              <span className={s.fileHint}>{Math.ceil(file.size / 1024)}KB</span>
                              <Button variant="text" type="button" onClick={() => removeFile(item.id, file.fileId)}>
                                {file.name} 빼기
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <TextAreaField
                      label={`${item.title} 확인 방법`}
                      rows={2}
                      value={editable[item.id]?.check ?? ''}
                      onChange={(event) => update(item.id, 'check', event.target.value)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {items.length > 0 ? (
            <div className={s.summary}>
              <TextAreaField label="전체 요약" optional value={summary} onChange={(event) => setSummary(event.target.value)} />
            </div>
          ) : null}
          {error ? <p className={s.error} role="alert">{error}</p> : null}
          <div className={s.actions}>
            <Button
              variant="primary"
              type="button"
              disabled={busy || items.length === 0 || uploading !== null}
              disabledReason={busy ? '제출 중입니다' : uploading !== null ? '파일을 올리는 중입니다' : items.length === 0 ? '제출할 항목이 없습니다' : undefined}
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

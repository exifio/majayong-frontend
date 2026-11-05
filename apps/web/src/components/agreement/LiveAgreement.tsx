/* 의뢰인 최종 합의 확인 — agreement-preview 실데이터만 표시한다.
 * 확정(POST agreement/confirm)은 백엔드 D-23 적용 확인 전까지 비활성화한다. */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { AgreementPreviewDto, ApplicationRevisionDto } from '@majayong/types/api';
import { Button, Chip, ConfirmDialog } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { applicationStatusLabel } from '@/lib/application-status';
import { AGREEMENT_CONFIRM_ENABLED } from '@/lib/feature-flags';
import { formatWon } from '@/lib/format';
import { supplierProfile, type SupplierProfileSummary } from '@/lib/supplier-profile';

/* D-23 적용 확인(3100, bdc4751). 스테이징은 VITE_ENABLE_AGREEMENT_CONFIRM=true로 연다. */

type State = 'loading' | 'success' | 'auth-error' | 'error';

const CONDITION_LABEL = { DECIDED: '정해짐', PROPOSED: '정하는 중', UNDECIDED: '안 정함' } as const;
const STAGE_LABEL = { INTERIM: '중간', FINAL: '최종' } as const;

export function LiveAgreement({ styles }: { styles: Record<string, string> }) {
  const s = styles;
  const { pid = '', sid = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { apiAccessToken } = useSession();

  const [state, setState] = useState<State>('loading');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [application, setApplication] = useState<ApplicationRevisionDto | null>(null);
  const [preview, setPreview] = useState<AgreementPreviewDto | null>(null);
  const [supplier, setSupplier] = useState<SupplierProfileSummary | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [retry, setRetry] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmBlocked, setConfirmBlocked] = useState(false);

  useEffect(() => {
    const queryId = params.get('applicationId');
    if (queryId) {
      setApplicationId(queryId);
      return;
    }
    if (!pid || !sid) {
      setState('error');
      return;
    }
    apiRequest('listMyApplications', '/me/applications', { accessToken: apiAccessToken })
      .then((response) => {
        const match = response.data
          .filter((row) => row.projectId === pid && row.supplierId === sid &&
            ['SUBMITTED', 'STALE', 'ACCEPTED'].includes(row.status))
          .sort((a, b) => b.revisionNo - a.revisionNo)[0];
        if (!match) {
          setState('error');
          return;
        }
        setApplicationId(match.id);
      })
      .catch((error: unknown) => {
        setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
      });
  }, [params, pid, sid, apiAccessToken, retry]);

  useEffect(() => {
    if (!applicationId) return;
    const controller = new AbortController();
    setState('loading');
    setConfirmError(null);
    Promise.all([
      apiRequest('getApplication', `/applications/${encodeURIComponent(applicationId)}`, {
        accessToken: apiAccessToken,
        signal: controller.signal,
      }),
      apiRequest('previewAgreement', `/applications/${encodeURIComponent(applicationId)}/agreement-preview`, {
        accessToken: apiAccessToken,
        signal: controller.signal,
      }),
      apiRequest('listMyProjects', '/me/projects', { accessToken: apiAccessToken, signal: controller.signal }),
    ]).then(async ([applicationResponse, previewResponse, projectsResponse]) => {
      setApplication(applicationResponse.data);
      setPreview(previewResponse.data);
      setProjectTitle(projectsResponse.data.find((project) => project.projectId === applicationResponse.data.projectId)?.title ?? '');
      setState('success');
      setSupplier(await supplierProfile(applicationResponse.data.supplierId, apiAccessToken));
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
    });
    return () => controller.abort();
  }, [applicationId, apiAccessToken, retry]);

  async function confirmAgreement() {
    if (!applicationId || confirming) return;
    setConfirmOpen(false);
    setConfirming(true);
    setConfirmError(null);
    try {
      const response = await apiRequest('confirmAgreement', `/applications/${encodeURIComponent(applicationId)}/agreement/confirm`, {
        method: 'POST',
        accessToken: apiAccessToken,
      });
      if (response.data.contract.status !== 'PENDING_CONSENT') {
        setConfirmError('계약 상태가 예상과 다릅니다. 최신 상태를 다시 확인해 주세요.');
        setRetry((count) => count + 1);
        return;
      }
      navigate(`/c/contracts/${encodeURIComponent(response.data.contract.id)}`);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setState('auth-error');
      } else if (error instanceof ApiRequestError && error.status === 409) {
        // 이미 계약이 만들어졌거나 상태가 바뀐 경우다. 같은 요청을 다시 보내지 않는다.
        setConfirmBlocked(true);
        setConfirmError(
          error.code === 'APPLICATION_NOT_SUBMITTED' || error.code === 'PROJECT_ALREADY_CONTRACTED'
            ? '이미 계약이 생성되었거나 현재 상태에서는 합의를 확정할 수 없습니다. 내 계약에서 상태를 확인해 주세요.'
            : error.message,
        );
      } else if (error instanceof ApiRequestError && error.message) {
        setConfirmError(error.message);
      } else {
        setConfirmError('합의를 확정하지 못했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setConfirming(false);
    }
  }

  if (!applicationId || state !== 'success' || application === null || preview === null) {
    return (
      <div className={s.page}>
        {state === 'loading' && <p role="status" style={{ padding: 24 }}>합의 내용을 불러오는 중입니다.</p>}
        {state === 'auth-error' && <p role="alert" style={{ padding: 24 }}>API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.</p>}
        {state === 'error' && (
          <p role="alert" style={{ padding: 24 }}>
            합의할 지원을 찾을 수 없습니다.
            <Button variant="text" onClick={() => setRetry((count) => count + 1)}>다시 시도</Button>
          </p>
        )}
      </div>
    );
  }

  const conditions = preview.draft.items.flatMap((item) => item.conditions);
  const undecided = conditions.filter((condition) => condition.state === 'UNDECIDED');
  const decided = conditions.filter((condition) => condition.state === 'DECIDED');
  const back = `/c/chat/${encodeURIComponent(pid)}/${encodeURIComponent(sid)}`;

  return (
    <div className={s.page} data-screen="Agreement-Client-Live">
      <p className={s.crumb}>
        <Link to="/c/projects">내 프로젝트</Link>
        {' › '}
        <Link to={back}>채팅</Link>
        {' › '}
        최종 합의 내용 확인
      </p>

      <div className={s.head}>
        <div>
          <h1 className={s.title}>최종 합의 내용 확인</h1>
          <p className={s.sub}>
            {projectTitle || `프로젝트 ${application.projectId.slice(0, 8)}`} · {formatWon(application.totalAmount)} · {application.durationDays}일
          </p>
        </div>
        <div className={s.who}>
          <span className={s.av} aria-hidden="true">{supplier?.displayName?.slice(0, 1) ?? '공'}</span>
          <span>
            <b>{supplier?.displayName ?? `공급자 ${application.supplierId.slice(0, 8)}`}</b>
            <br />
            {applicationStatusLabel(application.status)}
          </span>
        </div>
      </div>

      <div className={`${s.band} ${undecided.length > 0 ? s.bandOpen : s.bandDone}`} role="status">
        <div>
          <b className={s.bandTitle}>
            {undecided.length > 0 ? `아직 정하지 않은 조건이 ${undecided.length}개 있습니다` : '모든 조건이 정해졌습니다'}
          </b>
          <p className={s.bandBody}>
            {undecided.length > 0
              ? '정해지지 않은 조건이 있어도 합의를 확정할 수 있습니다. 확정하면 임시 계약이 생성되고 서명 단계로 넘어갑니다.'
              : '확정하면 임시 계약이 생성되고 서명 단계로 넘어갑니다.'}
          </p>
        </div>
        <Link className={s.bandLink} to={back}>채팅에서 정하기</Link>
      </div>

      {preview.stale && (
        <p role="status" className={s.ds}>이전 명세 기준으로 만들어진 합의입니다. 최신 명세를 다시 확인해 주세요.</p>
      )}

      <div className={s.lay}>
        <div>
          {preview.draft.items.map((item) => (
            <section key={item.specItemId ?? item.blockId} className={s.fc} aria-label={item.title}>
              <div className={s.fh}>
                <span className={s.nm}>{item.title}</span>
                <Chip tone="outline">{STAGE_LABEL[item.stage]}</Chip>
              </div>
              <ul>
                {item.conditions.map((condition) => (
                  <li key={condition.key} className={condition.state === 'UNDECIDED' ? s.pend : s.cr}>
                    {condition.text} · {CONDITION_LABEL[condition.state]}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className={s.rail}>
          <section className={s.card} aria-labelledby="live-agree-pay">
            <div className={s.payHead}>
              <h3 id="live-agree-pay">합의 금액</h3>
            </div>
            <div className={s.amtV}>{formatWon(application.totalAmount)}</div>
            <p className={s.payNote}>기간 {application.durationDays}일 · 결제 구간 비율 {preview.draft.interimRatio}%</p>
            <p className={s.payNote}>수수료와 예치 금액은 계약이 생성된 뒤 계약서에서 확인합니다.</p>
          </section>

          <section className={s.card} aria-labelledby="live-agree-after">
            <h3 id="live-agree-after">확정하면</h3>
            <ul className={s.after}>
              <li><b>임시 계약</b>이 생성되고 공급자에게 알림이 갑니다.</li>
              <li>양측이 서명하면 계약이 체결되고, 이후 예치 단계로 넘어갑니다.</li>
              <li>다른 지원은 <b>예치 완료 전까지 자동 거절되지 않습니다.</b></li>
            </ul>
          </section>
        </aside>
      </div>

      <section className={s.dock} aria-label="합의 확정">
        <div className={s.dockRow}>
          <div className={s.amts}>
            <div>
              <p className={s.amtK}>합의 금액</p>
              <div className={s.amtV}>{formatWon(application.totalAmount)}</div>
              <div className={s.amtS}>{application.durationDays}일</div>
            </div>
            <span className={s.op} aria-hidden="true">·</span>
            <div>
              <p className={s.amtK}>조건</p>
              <div className={s.amtV}>{decided.length}개 정해짐</div>
              <div className={s.amtS}>{undecided.length}개 안 정함</div>
            </div>
          </div>
          <div className={s.acts}>
            <Button variant="ghost" to={back}>채팅으로 돌아가기</Button>
            <Button
              variant="primary"
              disabled={!AGREEMENT_CONFIRM_ENABLED || confirming || confirmBlocked}
              disabledReason={
                !AGREEMENT_CONFIRM_ENABLED
                  ? '백엔드 합의 초안 생성(D-23) 적용 후 활성화됩니다.'
                  : confirmBlocked
                    ? '이미 처리된 지원입니다. 내 계약에서 상태를 확인해 주세요.'
                    : '처리 중입니다.'
              }
              onClick={() => setConfirmOpen(true)}
            >
              {confirming ? '확정 중' : '합의 확정'}
            </Button>
          </div>
        </div>
        {!AGREEMENT_CONFIRM_ENABLED && (
          <p className={s.why} role="status">합의 확정은 백엔드 D-23 적용 확인 후 열립니다. 지금은 내용 확인만 가능합니다.</p>
        )}
        {confirmError && <p className={s.why} role="alert">{confirmError}</p>}
      </section>

      {confirmOpen && (
        <ConfirmDialog
          title="합의를 확정할까요?"
          confirmLabel="합의 확정"
          onConfirm={() => void confirmAgreement()}
          onCancel={() => setConfirmOpen(false)}
        >
          <p>
            {projectTitle || application.projectId} · {supplier?.displayName ?? application.supplierId}
            <br />
            {formatWon(application.totalAmount)} · {application.durationDays}일
          </p>
          <p>조건 {conditions.length}개 중 정해짐 {decided.length}개 · 안 정함 {undecided.length}개</p>
          <ul>
            {conditions.map((condition) => (
              <li key={condition.key}>{condition.text} · {CONDITION_LABEL[condition.state]}</li>
            ))}
          </ul>
          <p>안 정한 조건이 있어도 합의를 확정할 수 있습니다. 확정하면 임시 계약이 생성되고 서명 단계로 넘어갑니다.</p>
          <p>다른 지원자는 예치 완료 전까지 자동 거절되지 않습니다.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}

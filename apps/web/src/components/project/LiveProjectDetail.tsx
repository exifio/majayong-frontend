/* A 공급자 프로젝트 상세 — NDA 통과 후 현재 명세 INCLUDED 항목과 specItemId를 그대로 보여 준다. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SupplierProjectDetail } from '@majayong/types';
import type { ApplicationRecordDto } from '@majayong/types/api';
import { Band, Button, Chip, Money, StatusChip } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatDate, formatWon } from '@/lib/format';
import { industryLabel } from '@/lib/industry-label';
import { projectDetailToScreen } from '@/lib/project-adapter';

type State = 'loading' | 'success' | 'nda' | 'auth-error' | 'error';

export function LiveProjectDetail({ pid, styles }: { pid?: string; styles: Record<string, string> }) {
  const s = styles;
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<State>('loading');
  const [detail, setDetail] = useState<SupplierProjectDetail | null>(null);
  const [retry, setRetry] = useState(0);
  const [consenting, setConsenting] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [myApplication, setMyApplication] = useState<ApplicationRecordDto | null>(null);

  useEffect(() => {
    if (!pid) return;
    const controller = new AbortController();
    setState('loading');
    apiRequest('getSupplierProjectDetail', `/projects/${encodeURIComponent(pid)}`, {
      accessToken: apiAccessToken,
      signal: controller.signal,
    }).then((response) => {
      setDetail(projectDetailToScreen(response.data));
      setState('success');
      apiRequest('listMyApplications', '/me/applications', {
        accessToken: apiAccessToken,
        signal: controller.signal,
      }).then((applications) => {
        setMyApplication(applications.data.find((application) =>
          application.projectId === pid && ['SUBMITTED', 'STALE', 'ACCEPTED'].includes(application.status)) ?? null);
      }).catch(() => { /* 지원 상태는 상세 표시를 막지 않는다 */ });
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (error instanceof ApiRequestError && error.status === 403 && error.code === 'SUPPLIER_NDA_REQUIRED') {
        setState('nda');
      } else {
        setState(error instanceof ApiRequestError && error.status === 401 ? 'auth-error' : 'error');
      }
    });
    return () => controller.abort();
  }, [pid, apiAccessToken, retry]);

  async function agreeNda() {
    setConsenting(true);
    setConsentError(null);
    try {
      await apiRequest('updateSupplierProfile', '/me/supplier-profile', {
        method: 'PATCH',
        accessToken: apiAccessToken,
        jsonBody: { ndaConsent: true },
      });
      setRetry((count) => count + 1);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setState('auth-error');
      } else {
        setConsentError('NDA 동의를 저장하지 못했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setConsenting(false);
    }
  }

  if (!pid) return <div className={s.page}><p role="alert" style={{ padding: 24 }}>프로젝트를 찾을 수 없습니다.</p></div>;

  if (state !== 'success' || detail === null) {
    return (
      <div className={s.page}>
        {state === 'loading' && <p role="status" style={{ padding: 24 }}>프로젝트를 불러오는 중입니다.</p>}
        {state === 'nda' && (
          <div style={{ padding: 24 }}>
            <p role="status">명세 상세를 보려면 비밀유지(NDA) 동의가 필요합니다.</p>
            <Button variant="primary" onClick={() => void agreeNda()} disabled={consenting}>
              {consenting ? '처리 중' : 'NDA 동의하고 상세 열람'}
            </Button>
            {consentError && <p role="alert">{consentError}</p>}
          </div>
        )}
        {state === 'auth-error' && <p role="alert" style={{ padding: 24 }}>API 토큰 인증에 실패했습니다. 토큰을 확인해 주세요.</p>}
        {state === 'error' && (
          <p role="alert" style={{ padding: 24 }}>
            프로젝트를 불러오지 못했습니다.
            <Button variant="text" onClick={() => setRetry((count) => count + 1)}>다시 시도</Button>
          </p>
        )}
      </div>
    );
  }

  const itemCount = detail.items.length;

  return (
    <div className={s.page} data-screen="Project-Supplier-Live">
      <p className={s.crumb}>
        <Link to="/s/projects">프로젝트 찾기</Link>
        {' › '}
        명세 상세
      </p>

      <div className={s.viewband}>
        <Band tone="viewlog">열람 기록이 남습니다 · 비밀유지 의무</Band>
      </div>

      <div className={s.head}>
        <div>
          <div className={s.chips}>
            <Chip tone="neutral">{industryLabel(detail.industry)}</Chip>
            <StatusChip status={detail.status} />
            {detail.deadline && <span>{formatDate(detail.deadline)} 마감</span>}
          </div>
          <h1 className={s.title}>{detail.title}</h1>
          <p className={s.sub}>명세 항목 {itemCount}개</p>
        </div>
      </div>

      <div className={s.lay}>
        <div>
          <div className={s.secH}>
            <h2>기능 {itemCount}개</h2>
          </div>

          {detail.items.map((item, index) => (
            <section key={item.specItemId} className={s.fc} aria-label={item.title} data-spec-item-id={item.specItemId}>
              <div className={s.nmrow}>
                <span className={s.no}>{index + 1}</span>
                <span className={s.nm}>{item.title}</span>
              </div>
              <p className={s.ds}>{item.description}</p>
              {item.conditions.length > 0 && (
                <div className={s.dec}>
                  <p className={s.decK}>공급자와 정할 것</p>
                  <div className={s.tg}>
                    {item.conditions.map((condition) => (
                      <span key={condition.key}>{condition.text}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}

          <div className={s.secH} style={{ marginTop: 22 }}>
            <h2>의뢰인</h2>
          </div>
          <section className={s.fc} aria-label="의뢰인 정보">
            <div className={s.nmrow}>
              <span className={s.nm}>{detail.client.businessName ?? '상호 미등록'}</span>
            </div>
            {detail.client.name && <p className={s.ds}>{detail.client.name}</p>}
            {detail.client.industryField && <p className={s.ds}>{detail.client.industryField}</p>}
            {detail.client.storeAddress && <p className={s.ds}>{detail.client.storeAddress}</p>}
            {detail.client.websiteUrl && <p className={s.ds}>{detail.client.websiteUrl}</p>}
            {detail.client.bio && <p className={s.ds}>{detail.client.bio}</p>}
          </section>
        </div>

        <aside className={s.rail}>
          <section className={s.card} aria-labelledby="live-b-h">
            <p className={s.budK} id="live-b-h">희망 예산</p>
            {detail.hopeBudget === null
              ? <p className={s.budHint}>의뢰인이 예산을 정하지 않았습니다.</p>
              : <Money amount={detail.hopeBudget} size="big" />}
            <div className={s.meta}>
              <div className={s.metaRow}>
                <span>모집 마감</span>
                <b>{detail.deadline ? formatDate(detail.deadline) : '—'}</b>
              </div>
              <div className={s.metaRow}>
                <span>명세 항목</span>
                <b>{itemCount}개</b>
              </div>
              {detail.hopeBudget !== null && (
                <div className={s.metaRow}>
                  <span>예산</span>
                  <b>{formatWon(detail.hopeBudget)}</b>
                </div>
              )}
            </div>
            {myApplication ? (
              <div className={s.myq}>
                <div className={s.myqRow}>
                  <span className={s.myqK}>지원함</span>
                </div>
                <div className={s.myqAmt}>{formatWon(myApplication.totalAmount)}</div>
                <p className={s.myqM}>{myApplication.durationDays}일 · 지원서를 제출했습니다.</p>
              </div>
            ) : (
              <div className={s.ctaGap}>
                <Button variant="primary" full to={`/s/projects/${encodeURIComponent(pid)}/quote`}>
                  견적 작성하기
                </Button>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

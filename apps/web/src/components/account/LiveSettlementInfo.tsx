/* 증빙 · 정산 정보 — 실제 세금/계좌 API만 사용한다.
 * 서버가 1원 인증을 지원하지 않으면 성공으로 꾸미지 않고 안내한다. */
import { useEffect, useState } from 'react';
import { Button, TextField } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import s from './LiveSettlementInfo.module.css';

const BANKS = ['신한은행', '국민은행', '우리은행', '카카오뱅크'] as const;

type BusinessType = 'INDIVIDUAL' | 'BUSINESS';

const TEXT = {
  title: '증빙 · 정산 정보',
  clientSub: '세금계산서를 받을 사업자 정보와 이메일입니다. 저장 후 서버가 돌려준 값만 표시합니다.',
  supplierSub: '세금계산서 발행 정보와 정산 계좌입니다. 계좌는 예금주가 가입 이름과 같아야 합니다.',
  bizType: '정산 구분',
  individual: '개인',
  business: '사업자',
  bizRegNo: '사업자등록번호',
  taxEmail: '세금계산서 이메일',
  saveTax: '증빙 정보 저장',
  saving: '저장 중',
  bank: '은행',
  accountNo: '계좌번호',
  holder: '예금주',
  savePayout: '계좌 저장',
  verifyCode: '인증 코드',
  verify: '계좌 인증',
  verified: '인증 완료',
  notVerified: '인증 전',
  unavailable: '서버에서 계좌 인증을 사용할 수 없습니다. 계좌는 저장됐지만 인증은 별도 확인이 필요합니다.',
  sandbox: '시연 환경에서는 실제 은행 인증이 아닙니다.',
  taxSaved: '증빙 정보를 저장했습니다.',
  payoutSaved: '계좌를 저장했습니다. 인증 전에는 지급이 보류됩니다.',
  error: '저장하지 못했습니다. 다시 시도해 주세요.',
  maskedEmpty: '저장된 값 없음',
} as const;

export function LiveSettlementInfo({ role }: { role: 'CLIENT' | 'SUPPLIER' }) {
  const { apiAccessToken, session } = useSession();
  const [businessType, setBusinessType] = useState<BusinessType>('INDIVIDUAL');
  const [bizRegNo, setBizRegNo] = useState('');
  const [taxEmail, setTaxEmail] = useState('');
  const [bank, setBank] = useState<string>(BANKS[0]);
  const [accountNo, setAccountNo] = useState('');
  const [holder, setHolder] = useState(session.status === 'user' ? session.name : '');
  const [code, setCode] = useState('');
  const [bizMasked, setBizMasked] = useState<string | null>(null);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [payout, setPayout] = useState<{ masked: string | null; holder: string | null; verifiedAt: string | null }>({
    masked: null, holder: null, verifiedAt: null,
  });
  const [busy, setBusy] = useState<null | 'tax' | 'payout' | 'verify'>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'SUPPLIER') return;
    const controller = new AbortController();
    apiRequest('getMySupplierProfile', '/me/supplier-profile', { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        setBusinessType(response.data.businessType ?? 'INDIVIDUAL');
        setBizMasked(response.data.bizRegNoMasked);
        setPayout({
          masked: response.data.payoutAccountMasked,
          holder: response.data.payoutHolder,
          verifiedAt: response.data.payoutVerifiedAt,
        });
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setError(TEXT.error);
      });
    return () => controller.abort();
  }, [apiAccessToken, role]);

  const saveTax = async () => {
    setBusy('tax');
    setError(null);
    setNotice(null);
    try {
      const response = role === 'CLIENT'
        ? await apiRequest('updateClientTaxInfo', '/me/client-tax-info', {
            method: 'PATCH',
            accessToken: apiAccessToken,
            jsonBody: {
              ...(bizRegNo.trim() ? { bizRegNo: bizRegNo.trim() } : {}),
              ...(taxEmail.trim() ? { taxInvoiceEmail: taxEmail.trim() } : {}),
            },
          })
        : await apiRequest('updateSupplierTaxInfo', '/me/supplier-tax-info', {
            method: 'PATCH',
            accessToken: apiAccessToken,
            jsonBody: {
              businessType,
              ...(bizRegNo.trim() ? { bizRegNo: bizRegNo.trim() } : {}),
              ...(taxEmail.trim() ? { taxInvoiceEmail: taxEmail.trim() } : {}),
            },
          });
      setBizMasked(response.data.bizRegNoMasked);
      setSavedEmail(response.data.taxInvoiceEmail);
      setBizRegNo('');
      setTaxEmail('');
      setNotice(TEXT.taxSaved);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : TEXT.error);
    } finally {
      setBusy(null);
    }
  };

  const savePayout = async () => {
    setBusy('payout');
    setError(null);
    setNotice(null);
    try {
      const response = await apiRequest('updatePayoutAccount', '/me/payout-account', {
        method: 'PATCH',
        accessToken: apiAccessToken,
        jsonBody: { bank, accountNo: accountNo.trim(), holder: holder.trim() },
      });
      setPayout({ masked: response.data.accountMasked, holder: response.data.holder, verifiedAt: null });
      setAccountNo('');
      setNotice(TEXT.payoutSaved);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : TEXT.error);
    } finally {
      setBusy(null);
    }
  };

  const verify = async () => {
    setBusy('verify');
    setError(null);
    setNotice(null);
    try {
      const response = await apiRequest('verifyPayoutAccount', '/me/payout-account/verify', {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { code: code.trim() },
      });
      setPayout((prev) => ({ ...prev, verifiedAt: response.data.verifiedAt }));
      setCode('');
      setNotice(TEXT.verified);
    } catch (caught) {
      if (caught instanceof ApiRequestError && caught.code === 'PAYOUT_VERIFICATION_UNAVAILABLE') {
        setNotice(TEXT.unavailable);
      } else {
        setError(caught instanceof ApiRequestError ? caught.message : TEXT.error);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className={s.section} aria-labelledby="settle-info">
      <h2 id="settle-info" className={s.title}>{TEXT.title}</h2>
      <p className={s.sub}>{role === 'CLIENT' ? TEXT.clientSub : TEXT.supplierSub}</p>

      {role === 'SUPPLIER' ? (
        <div className={s.selectField}>
          <label className={s.label} htmlFor="biz-type">{TEXT.bizType}</label>
          <select
            id="biz-type"
            className={s.select}
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value as BusinessType)}
          >
            <option value="INDIVIDUAL">{TEXT.individual}</option>
            <option value="BUSINESS">{TEXT.business}</option>
          </select>
        </div>
      ) : null}

      <TextField label={TEXT.bizRegNo} value={bizRegNo} onChange={(event) => setBizRegNo(event.target.value)}
        hint={bizMasked ? `저장됨: ${bizMasked}` : TEXT.maskedEmpty} />
      <TextField label={TEXT.taxEmail} type="email" value={taxEmail} onChange={(event) => setTaxEmail(event.target.value)}
        hint={savedEmail ?? TEXT.maskedEmpty} />
      <div className={s.actions}>
        <Button variant="tint" type="button" disabled={busy === 'tax'}
          disabledReason={busy === 'tax' ? TEXT.saving : undefined}
          onClick={() => void saveTax()}>
          {busy === 'tax' ? TEXT.saving : TEXT.saveTax}
        </Button>
      </div>

      {role === 'SUPPLIER' ? (
        <>
          <div className={s.divider} />
          <p className={s.sub}>
            {payout.masked
              ? `${bank} · ${payout.masked} · ${payout.holder ?? ''}`
              : TEXT.maskedEmpty}
            {' · '}
            {payout.verifiedAt ? `${TEXT.verified} ${formatDateTime(payout.verifiedAt)}` : TEXT.notVerified}
          </p>
          <p className={s.sub}>{TEXT.sandbox}</p>
          <div className={s.selectField}>
            <label className={s.label} htmlFor="payout-bank">{TEXT.bank}</label>
            <select id="payout-bank" className={s.select} value={bank} onChange={(event) => setBank(event.target.value)}>
              {BANKS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <TextField label={TEXT.accountNo} value={accountNo} onChange={(event) => setAccountNo(event.target.value)} />
          <TextField label={TEXT.holder} value={holder} onChange={(event) => setHolder(event.target.value)} />
          <div className={s.actions}>
            <Button variant="primary" type="button" disabled={busy === 'payout'}
              disabledReason={busy === 'payout' ? TEXT.saving : undefined}
              onClick={() => void savePayout()}>
              {busy === 'payout' ? TEXT.saving : TEXT.savePayout}
            </Button>
          </div>
          <TextField label={TEXT.verifyCode} value={code} onChange={(event) => setCode(event.target.value)} />
          <div className={s.actions}>
            <Button variant="ghost" type="button" disabled={busy === 'verify' || !payout.masked}
              disabledReason={busy === 'verify' ? TEXT.saving : !payout.masked ? '계좌를 먼저 저장해 주세요' : undefined}
              onClick={() => void verify()}>
              {busy === 'verify' ? TEXT.saving : TEXT.verify}
            </Button>
          </div>
        </>
      ) : null}

      {notice ? <p className={s.notice} role="status">{notice}</p> : null}
      {error ? <p className={s.error} role="alert">{error}</p> : null}
    </section>
  );
}

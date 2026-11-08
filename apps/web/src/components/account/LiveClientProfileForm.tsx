/* 의뢰인 내 프로필 · 기본 정보 — GET/PATCH /me/client-profile.
 * 백엔드가 받는 이름 · 상호 · 업종 · 가게 주소 · 웹사이트 · 한 줄 소개만 다룬다(규모는 저장 필드가 없어 두지 않는다). */
import { useEffect, useState } from 'react';
import type { MyClientProfileDto } from '@majayong/types/api';
import { Button, LoadingState, Note, TextAreaField, TextField } from '@/components/ui';
import { useSession } from '@/app/session';
import { apiRequest } from '@/lib/api';
import { isAbort, isHttpsUrl } from '@/lib/account-profile';
import own from './LiveAccountSettings.module.css';

const INDUSTRIES = ['예약 기반 음식점', '기타 (직접 입력)'] as const;

export const CLIENT_PROFILE_TEXT = {
  loading: '프로필을 불러오는 중입니다.',
  loadError: '프로필을 불러오지 못했습니다.',
  retry: '다시 시도',
  name: '이름',
  nameHint: '공급자에게는 상호와 함께 보입니다.',
  biz: '상호',
  bizNeeded: '프로젝트 등록에 필요',
  bizError: '상호를 입력해 주세요',
  industry: '업종',
  industryPlaceholder: '업종을 선택해 주세요',
  address: '가게 주소',
  addressHint: 'NDA에 동의하고 명세를 연 공급자에게만 보입니다.',
  website: '웹사이트',
  websiteHint: 'https://로 시작하는 주소만 저장됩니다.',
  websiteError: 'https://로 시작하는 주소를 입력해 주세요',
  intro: '한 줄 소개',
  note: '연락처는 받지 않습니다. 이메일은 로그인에만 쓰이며 어느 단계에서도 공개되지 않습니다.',
  cancel: '되돌리기',
  save: '저장',
  saving: '저장 중입니다',
  saved: '저장했습니다',
  saveError: '프로필을 저장하지 못했습니다. 다시 시도해 주세요.',
} as const;

type Form = { name: string; biz: string; industry: string; address: string; website: string; intro: string };

function formOf(profile: MyClientProfileDto | null): Form {
  return {
    name: profile?.name ?? '',
    biz: profile?.businessName ?? '',
    industry: profile?.industryField ?? '',
    address: profile?.storeAddress ?? '',
    website: profile?.websiteUrl ?? '',
    intro: profile?.bio ?? '',
  };
}

export function LiveClientProfileForm({ styles: s }: { styles: Record<string, string> }) {
  const { apiAccessToken } = useSession();
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [version, setVersion] = useState(0);
  const [initial, setInitial] = useState<Form>(formOf(null));
  const [form, setForm] = useState<Form>(formOf(null));
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoadState('loading');
    apiRequest('getMyClientProfile', '/me/client-profile', { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        const next = formOf(response.data);
        setInitial(next);
        setForm(next);
        setLoadState('ready');
      })
      .catch((caught: unknown) => {
        if (isAbort(caught)) return;
        setLoadState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken, version]);

  const set = (key: keyof Form) => (value: string) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const bizEmpty = form.biz.trim().length === 0;
  const websiteInvalid = form.website.trim().length > 0 && !isHttpsUrl(form.website.trim());

  const save = async () => {
    setTried(true);
    if (bizEmpty || websiteInvalid) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      // 빈 칸은 null로 보내 지운다(백엔드는 빈 문자열을 null로 저장).
      const response = await apiRequest('updateClientProfile', '/me/client-profile', {
        method: 'PATCH',
        accessToken: apiAccessToken,
        jsonBody: {
          name: form.name.trim() || null,
          businessName: form.biz.trim(),
          industryField: form.industry || null,
          storeAddress: form.address.trim() || null,
          websiteUrl: form.website.trim() || null,
          bio: form.intro.trim() || null,
        },
      });
      const next = formOf(response.data);
      setInitial(next);
      setForm(next);
      setSaved(true);
    } catch {
      setError(CLIENT_PROFILE_TEXT.saveError);
    } finally {
      setBusy(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <section className={s.section} aria-label="기본 정보">
        <LoadingState label={CLIENT_PROFILE_TEXT.loading} compact />
      </section>
    );
  }
  if (loadState === 'error') {
    return (
      <section className={s.section} aria-label="기본 정보">
        <p className={own.error} role="alert">{CLIENT_PROFILE_TEXT.loadError}</p>
        <Button variant="ghost" onClick={() => setVersion((value) => value + 1)}>{CLIENT_PROFILE_TEXT.retry}</Button>
      </section>
    );
  }

  const industries: string[] = [...INDUSTRIES];
  if (form.industry && !industries.includes(form.industry)) industries.unshift(form.industry);

  return (
    <section className={s.section} aria-label="기본 정보">
      <div className={s.fields}>
        <TextField
          label={CLIENT_PROFILE_TEXT.name}
          optional
          value={form.name}
          onChange={(e) => set('name')(e.target.value)}
          hint={CLIENT_PROFILE_TEXT.nameHint}
        />
        <TextField
          label={CLIENT_PROFILE_TEXT.biz}
          required
          value={form.biz}
          onChange={(e) => set('biz')(e.target.value)}
          error={tried && bizEmpty ? CLIENT_PROFILE_TEXT.bizError : undefined}
          hint={CLIENT_PROFILE_TEXT.bizNeeded}
        />
        <div className={s.selectField}>
          <label className={s.selectLabel} htmlFor="live-profile-industry">
            {CLIENT_PROFILE_TEXT.industry}
          </label>
          <select
            id="live-profile-industry"
            className={s.select}
            value={form.industry}
            onChange={(e) => set('industry')(e.target.value)}
          >
            <option value="">{CLIENT_PROFILE_TEXT.industryPlaceholder}</option>
            {industries.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <TextField
          label={CLIENT_PROFILE_TEXT.address}
          optional
          value={form.address}
          onChange={(e) => set('address')(e.target.value)}
          hint={CLIENT_PROFILE_TEXT.addressHint}
        />
        <TextField
          label={CLIENT_PROFILE_TEXT.website}
          optional
          type="url"
          value={form.website}
          onChange={(e) => set('website')(e.target.value)}
          error={tried && websiteInvalid ? CLIENT_PROFILE_TEXT.websiteError : undefined}
          hint={CLIENT_PROFILE_TEXT.websiteHint}
        />
        <TextAreaField
          label={CLIENT_PROFILE_TEXT.intro}
          optional
          value={form.intro}
          onChange={(e) => set('intro')(e.target.value)}
        />
      </div>

      <div className={s.noteWrap}>
        <Note title="연락처">{CLIENT_PROFILE_TEXT.note}</Note>
      </div>

      <div className={s.actions}>
        <Button
          variant="ghost"
          onClick={() => {
            setForm(initial);
            setTried(false);
            setSaved(false);
            setError(null);
          }}
        >
          {CLIENT_PROFILE_TEXT.cancel}
        </Button>
        <Button
          variant="primary"
          disabled={busy}
          disabledReason={busy ? CLIENT_PROFILE_TEXT.saving : undefined}
          onClick={() => void save()}
        >
          {CLIENT_PROFILE_TEXT.save}
        </Button>
      </div>
      {saved ? <p className={s.saved} role="status">{CLIENT_PROFILE_TEXT.saved}</p> : null}
      {error ? <p className={own.error} role="alert">{error}</p> : null}
    </section>
  );
}

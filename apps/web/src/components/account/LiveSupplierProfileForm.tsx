/* 공급자 내 프로필 · 기본 정보 — GET/PATCH /me/supplier-profile.
 * 이름 · 활동 이름 · 경력 · 기술 스택 · 포트폴리오 링크 · 자기소개 · 요약 동의만 저장한다.
 * 개인/사업자 구분은 계정 설정의 증빙 · 정산 정보에서 바꾼다. 업종 코드는 고를 화면이 없어 그대로 둔다. */
import { useEffect, useState } from 'react';
import type { ApiPortfolioItem, MySupplierProfileDto, UpdateSupplierProfileRequestDto } from '@majayong/types/api';
import { Button, Chip, ConfirmCheck, LoadingState, Note, StatusChip, TextAreaField, TextField } from '@/components/ui';
import { useSession } from '@/app/session';
import { apiRequest } from '@/lib/api';
import { isAbort, isHttpsUrl } from '@/lib/account-profile';
import own from './LiveAccountSettings.module.css';

const MAX_PORTFOLIO_ITEMS = 30;

export const SUPPLIER_PROFILE_TEXT = {
  loading: '프로필을 불러오는 중입니다.',
  loadError: '프로필을 불러오지 못했습니다.',
  retry: '다시 시도',
  name: '이름',
  nameHint: '정산 계좌 예금주와 같아야 합니다. 의뢰인에게는 활동 이름이 보입니다.',
  displayName: '활동 이름',
  displayNameHint: '지원에 필요',
  displayNameError: '활동 이름을 입력해 주세요',
  career: '경력',
  careerHint: '연 단위로 적어 주세요.',
  careerError: '0에서 80 사이의 정수로 적어 주세요',
  skills: '기술 스택',
  portfolio: '포트폴리오 링크',
  portfolioHint: '작업한 사이트, 깃허브, 노션 등. https:// 주소만 저장됩니다.',
  portfolioError: 'https://로 시작하는 주소를 입력해 주세요',
  addLink: '링크 추가',
  removeLink: '삭제',
  files: '올린 파일',
  bio: '자기소개',
  consent: '등록한 포트폴리오를 AI가 읽어 요약하는 데 동의합니다',
  consentReset: '포트폴리오 링크를 바꾸면 요약과 요약 동의가 초기화됩니다. 계속 동의하시면 체크한 채로 저장하세요.',
  summaryTitle: '포트폴리오 요약',
  summaryEmpty: '아직 만든 요약이 없습니다.',
  summaryHints: {
    PUBLISHED: '공개 프로필과 의뢰인 제안 비교 카드에 이 요약과 등록 링크가 보입니다.',
    DRAFT: 'AI가 만든 초안입니다. 확인 후 공개해야 의뢰인에게 보입니다. 요약 만들기 · 공개는 아직 이 화면에서 할 수 없습니다.',
    HIDDEN: '요약이 공개되지 않아 의뢰인에게는 포트폴리오 요약과 링크가 보이지 않습니다.',
  },
  rateNote: '시간당 단가나 블록 가격은 받지 않습니다. 금액은 프로젝트마다 견적으로 적으시면 됩니다.',
  cancel: '되돌리기',
  save: '저장',
  saving: '저장 중입니다',
  saved: '저장했습니다',
  saveError: '프로필을 저장하지 못했습니다. 다시 시도해 주세요.',
} as const;

type Form = {
  name: string;
  displayName: string;
  career: string;
  skills: string[];
  links: string[];
  bio: string;
  consent: boolean;
};

type Loaded = { form: Form; files: ApiPortfolioItem[]; linkItems: ApiPortfolioItem[]; profile: MySupplierProfileDto | null };

function load(profile: MySupplierProfileDto | null, fallbackName: string): Loaded {
  const items = profile?.portfolioItems ?? [];
  const linkItems = items.filter((item) => item.type === 'LINK');
  return {
    profile,
    files: items.filter((item) => item.type === 'FILE'),
    linkItems,
    form: {
      name: profile?.name ?? '',
      displayName: profile?.displayName ?? fallbackName,
      career: profile?.careerYears != null ? String(profile.careerYears) : '',
      skills: [...(profile?.skills ?? [])],
      links: linkItems.length ? linkItems.map((item) => item.url) : [''],
      bio: profile?.bio ?? '',
      consent: Boolean(profile?.portfolioConsentAt),
    },
  };
}

function fileName(path: string): string {
  return path.split('/').pop() || path;
}

function SummaryChip({ status }: { status: MySupplierProfileDto['portfolioSummaryStatus'] }) {
  if (status === 'PUBLISHED') return <StatusChip status="요약 공개 중" />;
  if (status === 'DRAFT') return <Chip tone="amber">확인 대기</Chip>;
  return <Chip tone="outline">숨김</Chip>;
}

export function LiveSupplierProfileForm({
  styles: s,
  skillOptions,
}: {
  styles: Record<string, string>;
  skillOptions: readonly string[];
}) {
  const { apiAccessToken, authUser } = useSession();
  const fallbackName = authUser?.name?.trim() || '';
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState<Loaded>(() => load(null, fallbackName));
  const [form, setForm] = useState<Form>(loaded.form);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoadState('loading');
    apiRequest('getMySupplierProfile', '/me/supplier-profile', { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        const next = load(response.data, fallbackName);
        setLoaded(next);
        setForm(next.form);
        setLoadState('ready');
      })
      .catch((caught: unknown) => {
        if (isAbort(caught)) return;
        setLoadState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken, version, fallbackName]);

  const update = (patch: Partial<Form>) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const displayNameEmpty = form.displayName.trim().length === 0;
  const careerText = form.career.trim();
  const careerYears = careerText === '' ? null : Number(careerText);
  const careerInvalid = careerYears !== null && (!Number.isInteger(careerYears) || careerYears < 0 || careerYears > 80);
  const links = form.links.map((url) => url.trim()).filter(Boolean);
  const invalidLinks = new Set(links.filter((url) => !isHttpsUrl(url)));
  const linksChanged = links.length !== loaded.linkItems.length
    || links.some((url, i) => url !== loaded.linkItems[i]?.url);
  const roomForLinks = MAX_PORTFOLIO_ITEMS - loaded.files.length;
  const allSkills = [...skillOptions, ...form.skills.filter((skill) => !skillOptions.includes(skill))];

  const save = async () => {
    setTried(true);
    if (displayNameEmpty || careerInvalid || invalidLinks.size > 0) return;
    const body: UpdateSupplierProfileRequestDto = {
      name: form.name.trim() || null,
      displayName: form.displayName.trim(),
      careerYears,
      skills: form.skills,
      bio: form.bio.trim() || null,
    };
    if (linksChanged) {
      // 기존 링크 제목과 올린 파일은 그대로 보존한다.
      const titles = new Map(loaded.linkItems.map((item) => [item.url, item.title]));
      body.portfolioItems = [
        ...links.map((url): ApiPortfolioItem => {
          const title = titles.get(url);
          return title ? { type: 'LINK', url, title } : { type: 'LINK', url };
        }),
        ...loaded.files,
      ];
    }
    const hadConsent = Boolean(loaded.profile?.portfolioConsentAt);
    // 링크를 바꾸면 서버가 동의를 지우므로, 체크돼 있으면 같은 요청에서 다시 보낸다.
    if (form.consent && (!hadConsent || linksChanged)) body.portfolioConsent = true;
    if (!form.consent && hadConsent) body.portfolioConsent = false;

    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const response = await apiRequest('updateSupplierProfile', '/me/supplier-profile', {
        method: 'PATCH',
        accessToken: apiAccessToken,
        jsonBody: body,
      });
      const next = load(response.data, fallbackName);
      setLoaded(next);
      setForm(next.form);
      setTried(false);
      setSaved(true);
    } catch {
      setError(SUPPLIER_PROFILE_TEXT.saveError);
    } finally {
      setBusy(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <section className={s.section} aria-label="기본 정보">
        <LoadingState label={SUPPLIER_PROFILE_TEXT.loading} compact />
      </section>
    );
  }
  if (loadState === 'error') {
    return (
      <section className={s.section} aria-label="기본 정보">
        <p className={own.error} role="alert">{SUPPLIER_PROFILE_TEXT.loadError}</p>
        <Button variant="ghost" onClick={() => setVersion((value) => value + 1)}>{SUPPLIER_PROFILE_TEXT.retry}</Button>
      </section>
    );
  }

  const status = loaded.profile?.portfolioSummaryStatus ?? null;
  const summaryKey = status === 'PUBLISHED' || status === 'DRAFT' ? status : 'HIDDEN';

  return (
    <section className={s.section} aria-label="기본 정보">
      <div className={s.fields}>
        <TextField
          label={SUPPLIER_PROFILE_TEXT.displayName}
          required
          value={form.displayName}
          onChange={(e) => update({ displayName: e.target.value })}
          error={tried && displayNameEmpty ? SUPPLIER_PROFILE_TEXT.displayNameError : undefined}
          hint={SUPPLIER_PROFILE_TEXT.displayNameHint}
        />
        <TextField
          label={SUPPLIER_PROFILE_TEXT.name}
          optional
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          hint={SUPPLIER_PROFILE_TEXT.nameHint}
        />
        <TextField
          label={SUPPLIER_PROFILE_TEXT.career}
          optional
          type="number"
          min={0}
          max={80}
          value={form.career}
          onChange={(e) => update({ career: e.target.value })}
          error={tried && careerInvalid ? SUPPLIER_PROFILE_TEXT.careerError : undefined}
          hint={SUPPLIER_PROFILE_TEXT.careerHint}
        />

        <div className={s.skillField}>
          <p className={s.skillLabel} id="live-profile-skills">{SUPPLIER_PROFILE_TEXT.skills}</p>
          <div className={s.tagRow} role="group" aria-labelledby="live-profile-skills">
            {allSkills.map((skill) => {
              const on = form.skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  className={`${s.tag} ${on ? s.tagOn : ''}`}
                  aria-pressed={on}
                  onClick={() => update({
                    skills: on ? form.skills.filter((x) => x !== skill) : [...form.skills, skill],
                  })}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        <div className={s.skillField} role="group" aria-label={`${SUPPLIER_PROFILE_TEXT.portfolio} 목록`}>
          {form.links.map((url, index) => (
            <div key={index}>
              <TextField
                label={form.links.length > 1 ? `${SUPPLIER_PROFILE_TEXT.portfolio} ${index + 1}` : SUPPLIER_PROFILE_TEXT.portfolio}
                optional
                type="url"
                value={url}
                onChange={(e) => update({ links: form.links.map((value, i) => (i === index ? e.target.value : value)) })}
                error={tried && invalidLinks.has(url.trim()) ? SUPPLIER_PROFILE_TEXT.portfolioError : undefined}
                hint={index === form.links.length - 1 ? SUPPLIER_PROFILE_TEXT.portfolioHint : undefined}
              />
              {form.links.length > 1 ? (
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => update({ links: form.links.filter((_, i) => i !== index) })}
                >
                  {`${SUPPLIER_PROFILE_TEXT.portfolio} ${index + 1} ${SUPPLIER_PROFILE_TEXT.removeLink}`}
                </Button>
              ) : null}
            </div>
          ))}
          {form.links.length < roomForLinks ? (
            <p>
              <Button variant="tint" size="sm" onClick={() => update({ links: [...form.links, ''] })}>
                {SUPPLIER_PROFILE_TEXT.addLink}
              </Button>
            </p>
          ) : null}
          {loaded.files.length ? (
            <p className={s.summaryHint}>
              {SUPPLIER_PROFILE_TEXT.files}: {loaded.files.map((file) => file.title || fileName(file.url)).join(', ')}
            </p>
          ) : null}
        </div>

        <TextAreaField
          label={SUPPLIER_PROFILE_TEXT.bio}
          optional
          value={form.bio}
          onChange={(e) => update({ bio: e.target.value })}
        />

        <div>
          <ConfirmCheck checked={form.consent} onChange={(consent) => update({ consent })}>
            {SUPPLIER_PROFILE_TEXT.consent}
          </ConfirmCheck>
          {linksChanged ? <p className={s.summaryHint}>{SUPPLIER_PROFILE_TEXT.consentReset}</p> : null}
        </div>
      </div>

      <div className={s.summaryBox}>
        <div className={s.summaryHead}>
          <b>{SUPPLIER_PROFILE_TEXT.summaryTitle}</b>
          <SummaryChip status={status} />
        </div>
        <p className={s.summaryBody}>{loaded.profile?.portfolioSummary || SUPPLIER_PROFILE_TEXT.summaryEmpty}</p>
        <p className={s.summaryHint}>{SUPPLIER_PROFILE_TEXT.summaryHints[summaryKey]}</p>
      </div>

      <div className={s.noteWrap}>
        <Note title="단가">{SUPPLIER_PROFILE_TEXT.rateNote}</Note>
      </div>

      <div className={s.actions}>
        <Button
          variant="ghost"
          onClick={() => {
            setForm(loaded.form);
            setTried(false);
            setSaved(false);
            setError(null);
          }}
        >
          {SUPPLIER_PROFILE_TEXT.cancel}
        </Button>
        <Button
          variant="primary"
          disabled={busy}
          disabledReason={busy ? SUPPLIER_PROFILE_TEXT.saving : undefined}
          onClick={() => void save()}
        >
          {SUPPLIER_PROFILE_TEXT.save}
        </Button>
      </div>
      {saved ? <p className={s.saved} role="status">{SUPPLIER_PROFILE_TEXT.saved}</p> : null}
      {error ? <p className={own.error} role="alert">{error}</p> : null}
    </section>
  );
}

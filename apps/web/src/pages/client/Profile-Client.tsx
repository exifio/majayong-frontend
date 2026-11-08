/* 의뢰인 내 프로필 — 보드 Profile-Client · /c/profile · M6
 * 상태: 기본 정보 / 받은 리뷰(?tab=reviews)
 * F-07 · F-23. */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Note, Tabs, TextAreaField, TextField } from '@/components/ui';
import { LiveReceivedReviews } from '@/components/review/LiveReceivedReviews';
import { useSession } from '@/app/session';
import { LiveClientProfileForm } from '@/components/account/LiveClientProfileForm';
import { DEMO, resolveProfileMock, starsOf } from './Profile-Client.data';
import s from './Profile-Client.module.css';

export default function ProfileClient() {
  const { apiAccessToken, authUser } = useSession();
  const live = apiAccessToken.trim().length > 0;
  const displayName = live
    ? (authUser?.name?.trim() || authUser?.email?.split('@')[0] || DEMO.name)
    : DEMO.name;
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveProfileMock(params.get('mock'), params.get('tab'));
  const isReviews = mock === '받은 리뷰';

  const [biz, setBiz] = useState<string>(DEMO.bizValue);
  const [industry, setIndustry] = useState<string>(DEMO.industryValue);
  const [scale, setScale] = useState<string>(DEMO.scaleValue);
  const [intro, setIntro] = useState<string>(DEMO.introValue);
  const [saved, setSaved] = useState(false);

  // 토큰이 있고 ?mock=이 없으면 기본 정보는 실제 프로필 API를 쓴다. 실제 화면의 탭 이동은 mock을 붙이지 않는다.
  const liveForm = live && !params.has('mock');

  const setTab = (key: string) => {
    if (liveForm) {
      navigate(key === 'reviews' ? '/c/profile?tab=reviews' : '/c/profile', { replace: true });
      return;
    }
    if (key === 'reviews') {
      navigate('/c/profile?tab=reviews&mock=' + encodeURIComponent('받은 리뷰'), { replace: true });
    } else {
      navigate('/c/profile?mock=' + encodeURIComponent('기본 정보'), { replace: true });
    }
  };

  return (
    <div className={s.page} data-screen="Profile-Client">
      <header className={s.phead}>
        <span className={s.ava} aria-hidden="true">
          {displayName.slice(0, 1)}
        </span>
        <div>
          <h1 className={s.name}>{displayName}</h1>
          <p className={s.meta}>
            {live ? '의뢰인' : (
              <>{DEMO.roleMeta} · <span className={s.star}>{DEMO.ratingLine}</span></>
            )}
          </p>
        </div>
        <button type="button" className={s.textLink}>
          {DEMO.publicLink}
        </button>
      </header>

      <Tabs
        kind="underline"
        label="프로필 메뉴"
        value={isReviews ? 'reviews' : 'basic'}
        items={[
          { key: 'basic', label: DEMO.tabs[0].label },
          { key: 'reviews', label: apiAccessToken.trim() ? DEMO.tabs[1].label : `${DEMO.tabs[1].label} 2` },
        ]}
        onChange={setTab}
      />

      {!isReviews && liveForm ? (
        <LiveClientProfileForm styles={s} />
      ) : !isReviews ? (
        <section className={s.section} aria-label="기본 정보">
          <div className={s.fields}>
            <TextField label="이름" value={DEMO.name} readOnly />
            <TextField
              label={DEMO.biz}
              required
              value={biz}
              onChange={(e) => setBiz(e.target.value)}
              hint={DEMO.bizNeeded}
            />
            <div className={s.selectField}>
              <label className={s.selectLabel} htmlFor="profile-industry">
                {DEMO.industry}
              </label>
              <select
                id="profile-industry"
                className={s.select}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {DEMO.industries.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <TextField
              label={DEMO.scale}
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              hint={DEMO.scaleHint}
            />
            <TextField label={DEMO.joined} value={DEMO.joinedValue} readOnly />
            <TextAreaField
              label={DEMO.intro}
              optional
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />
          </div>

          <div className={s.noteWrap}>
            <Note title="연락처">{DEMO.note}</Note>
          </div>

          <div className={s.actions}>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setBiz(DEMO.bizValue);
                setIndustry(DEMO.industryValue);
                setScale(DEMO.scaleValue);
                setIntro(DEMO.introValue);
                setSaved(false);
              }}
            >
              {DEMO.cancel}
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={() => setSaved(true)}
            >
              {DEMO.save}
            </Button>
          </div>
          {saved ? <p className={s.saved}>저장했습니다</p> : null}
        </section>
      ) : apiAccessToken.trim() ? (
        <LiveReceivedReviews side="CLIENT" styles={s} />
      ) : (
        <section className={s.section} aria-label="받은 리뷰">
          <div className={s.summaryCard}>
            <div className={s.avg}>
              <span className={s.star}>★</span>
              {DEMO.avg}
            </div>
            <div>
              <p className={s.summaryTitle}>{DEMO.reviewSummary}</p>
              <p className={s.summaryHint}>{DEMO.reviewHint}</p>
            </div>
          </div>

          <div className={s.tagRow}>
            {DEMO.tagCounts.map((t) => (
              <span key={t.n} className={s.tag}>
                {t.n}
                <b>{t.c}</b>
              </span>
            ))}
          </div>

          <h2 className={s.listTitle}>{DEMO.reviewListTitle}</h2>
          <ul className={s.reviews}>
            {DEMO.reviews.map((r) => (
              <li key={r.who + r.date} className={s.review}>
                <div className={s.reviewHead}>
                  <b>{r.who}</b>
                  <span>{r.date}</span>
                </div>
                <p className={s.reviewStars}>
                  {starsOf(r.score)}
                  <em>{r.score}점</em>
                </p>
                <div className={s.tagRow}>
                  {r.tags.map((t) => (
                    <span key={t} className={s.tag}>
                      {t}
                    </span>
                  ))}
                </div>
                <p className={s.reviewText}>{r.text}</p>
                <p className={s.reviewCtx}>{r.ctx}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* 공급자 내 프로필 — 보드 Profile-Supplier · /s/profile · M6
 * 상태: 기본 정보 / 받은 리뷰(?tab=reviews) / 요약 공개 중 / 확인 대기 / 숨김
 * F-07 · F-21 · F-23. */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Chip,
  Note,
  StatusChip,
  Tabs,
  TextField,
} from '@/components/ui';
import {
  DEMO,
  resolveProfileMock,
  starsOf,
  summaryOf,
  type SummaryState,
} from './Profile-Supplier.data';
import s from './Profile-Supplier.module.css';

function SummaryChip({ state }: { state: SummaryState }) {
  if (state === '요약 공개 중') return <StatusChip status="요약 공개 중" />;
  /* Chip.tsx에 '확인 대기'·'숨김' 매핑이 없어 톤만 맞춤 — 확인 필요 */
  if (state === '확인 대기') return <Chip tone="amber">확인 대기</Chip>;
  return <Chip tone="outline">숨김</Chip>;
}

export default function ProfileSupplier() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveProfileMock(params.get('mock'), params.get('tab'));
  const isReviews = mock === '받은 리뷰';
  const summary = summaryOf(mock);

  const [name, setName] = useState<string>(DEMO.name);
  const [career, setCareer] = useState<string>(DEMO.careerValue);
  const [business, setBusiness] = useState<string>(DEMO.businessValue);
  const [skills, setSkills] = useState<string[]>([...DEMO.skillSelected]);
  const [portfolio, setPortfolio] = useState<string>(DEMO.portfolioValue);
  const [saved, setSaved] = useState(false);

  const setTab = (key: string) => {
    if (key === 'reviews') {
      navigate('/s/profile?tab=reviews&mock=' + encodeURIComponent('받은 리뷰'), { replace: true });
    } else {
      navigate('/s/profile?mock=' + encodeURIComponent('기본 정보'), { replace: true });
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((x) => x !== skill) : [...prev, skill],
    );
  };

  return (
    <div className={s.page} data-screen="Profile-Supplier">
      <header className={s.phead}>
        <span className={s.ava} aria-hidden="true">
          {DEMO.initial}
        </span>
        <div>
          <h1 className={s.name}>{DEMO.name}</h1>
          <p className={s.meta}>
            {DEMO.roleMeta} · <span className={s.star}>{DEMO.ratingLine}</span>
          </p>
        </div>
      </header>

      <Tabs
        kind="underline"
        label="프로필 메뉴"
        value={isReviews ? 'reviews' : 'basic'}
        items={[
          { key: 'basic', label: DEMO.tabs[0].label },
          { key: 'reviews', label: `${DEMO.tabs[1].label} 12` },
        ]}
        onChange={setTab}
      />

      {!isReviews ? (
        <section className={s.section} aria-label="기본 정보">
          <div className={s.fields}>
            <TextField
              label={DEMO.nameLabel}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              hint={DEMO.nameHint}
            />
            <TextField
              label={DEMO.career}
              type="number"
              min={0}
              max={50}
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              hint={DEMO.careerHint}
            />
            <div className={s.selectField}>
              <label className={s.selectLabel} htmlFor="profile-biz">
                {DEMO.business}
              </label>
              <select
                id="profile-biz"
                className={s.select}
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
              >
                {DEMO.businessOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className={s.skillField}>
              <p className={s.skillLabel} id="profile-skills">
                {DEMO.skills}
              </p>
              <div className={s.tagRow} role="group" aria-labelledby="profile-skills">
                {DEMO.skillOptions.map((skill) => {
                  const on = skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      className={`${s.tag} ${on ? s.tagOn : ''}`}
                      aria-pressed={on}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <TextField
              label={DEMO.portfolio}
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              hint={DEMO.portfolioHint}
            />
          </div>

          <div className={s.summaryBox}>
            <div className={s.summaryHead}>
              <b>{DEMO.summaryTitle}</b>
              <SummaryChip state={summary} />
            </div>
            {summary === '숨김' ? (
              <p className={s.summaryBody}>{DEMO.summaryHints.숨김}</p>
            ) : (
              <p className={s.summaryBody}>{DEMO.summaryBody}</p>
            )}
            <p className={s.summaryHint}>{DEMO.summaryHints[summary]}</p>
          </div>

          <div className={s.noteWrap}>
            <Note title="단가">
              시간당 단가나 블록 가격은 받지 않습니다. 금액은 프로젝트마다 견적으로 적으시면 됩니다.
            </Note>
          </div>

          <div className={s.actions}>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setName(DEMO.name);
                setCareer(DEMO.careerValue);
                setBusiness(DEMO.businessValue);
                setSkills([...DEMO.skillSelected]);
                setPortfolio(DEMO.portfolioValue);
                setSaved(false);
              }}
            >
              {DEMO.cancel}
            </Button>
            <Button variant="primary" type="button" onClick={() => setSaved(true)}>
              {DEMO.save}
            </Button>
          </div>
          {saved ? <p className={s.saved}>저장했습니다</p> : null}
        </section>
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

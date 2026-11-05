/* 홈 — 보드 Home-Supplier · /s · M3
 * 상태: 기본 / 첫 방문
 * F-18 · F-17. 메인 CTA는 onnavy. 추천에는 예산 · AI 금액 없음. */
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Chip } from '@/components/ui';
import {
  CHECKLIST,
  DEMO,
  FIND_HREF,
  PROJECT_HREF,
  homeDemoOf,
  matchLabel,
  resolveHomeMock,
  type RecommendCard,
} from './Home-Supplier.data';
import s from './Home-Supplier.module.css';

export default function HomeSupplier() {
  const [params] = useSearchParams();
  const mock = resolveHomeMock(params.get('mock'));
  const demo = homeDemoOf(mock);

  return (
    <div className={s.page} data-screen="Home-Supplier">
      <div className={s.hello}>
        <h1>{demo.first ? DEMO.helloFirst : DEMO.hello}</h1>
        <div className={s.helloMeta}>{demo.first ? DEMO.helloFirstMeta : DEMO.helloMeta}</div>
      </div>

      {demo.first ? <FirstFocus /> : <BaseFocus />}

      <div className={s.rowsb}>
        <h2 className={s.ct}>{DEMO.recommendTitle}</h2>
        <Link className={s.allLink} to={FIND_HREF}>
          {DEMO.recommendAll}
        </Link>
      </div>

      <div className={s.list}>
        {demo.recommends.map((r) => (
          <RecommendRow key={r.id} card={r} />
        ))}
      </div>
      <p className={s.note}>{DEMO.recommendNote}</p>
    </div>
  );
}

function BaseFocus() {
  return (
    <section className={s.focus} aria-labelledby="focus-h">
      <div>
        <p className={s.kick}>{DEMO.focusKick}</p>
        <h2 className={s.focusTitle} id="focus-h">
          {DEMO.focusTitle}
        </h2>
        <p className={s.focusBody}>{DEMO.focusBody}</p>
        <Button variant="onnavy" size="lg" to={DEMO.focusHref}>
          {DEMO.focusCta}
        </Button>
      </div>
      <div className={s.mini} aria-label={DEMO.focusSideTitle}>
        <div className={s.miniTitle}>{DEMO.focusSideTitle}</div>
        {DEMO.focusSideRows.map((r) => (
          <div className={s.mrow} key={r.k}>
            <span>{r.k}</span>
            <span>{r.v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FirstFocus() {
  return (
    <section className={s.focus} aria-labelledby="focus-h">
      <div>
        <p className={s.kick}>{DEMO.firstKick}</p>
        <h2 className={s.focusTitle} id="focus-h">
          {DEMO.firstTitle}
        </h2>
        <p className={s.focusBody}>{DEMO.firstBody}</p>
        <Button variant="onnavy" size="lg" to={DEMO.firstHref}>
          {DEMO.firstCta}
        </Button>
      </div>
      <div className={s.checklist} aria-label={DEMO.checklistTitle}>
        <div className={s.ckHead}>
          <span>{DEMO.checklistTitle}</span>
          <span>
            {DEMO.checklistDone}/{DEMO.checklistTotal}
          </span>
        </div>
        <ul className={s.ckList}>
          {CHECKLIST.map((item) => (
            <li className={s.ckItem} key={item.id}>
              <div>
                <div className={s.ckLabel}>{item.label}</div>
                <div className={s.ckHint}>{item.hint}</div>
              </div>
              {item.done ? (
                <span className={s.ckDone}>완료</span>
              ) : (
                <Button variant="tint" size="sm" to={item.href}>
                  {item.cta}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RecommendRow({ card }: { card: RecommendCard }) {
  const n = card.matchedSkills.length;
  return (
    <Link className={s.pr} to={PROJECT_HREF} aria-label={card.title}>
      <div>
        <div className={s.prTop}>
          <Chip tone="blue">{matchLabel(n)}</Chip>
          <span className={s.prMeta}>
            {card.industry} · {card.deadlineLabel}
          </span>
        </div>
        <div className={s.prTitle}>{card.title}</div>
        <div className={s.prMeta}>명세 항목 {card.itemCount}개</div>
        <div className={s.tags}>
          {card.requiredSkills.map((t) => (
            <span
              key={t}
              className={`${s.tag} ${card.matchedSkills.includes(t) ? s.tagOn : ''}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

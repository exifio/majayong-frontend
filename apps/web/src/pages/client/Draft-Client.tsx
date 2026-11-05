/* 초안 · 명세 2분할 — 보드 Draft-Client · /c/drafts/:did · M1
 * 상태: 기본 / 초안 만드는 중 / 만들기 실패 / 채팅 반영 중
 * 추가 · 삭제 · 되돌리기는 이 화면 상태만 바꾼다. API는 부르지 않는다. */
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Check, Plus } from 'lucide-react';
import { Attr, Band, Button, Chip, Skeleton, Tabs } from '@/components/ui';
import { PageHeader } from '@/components/layout/Chrome';
import { formatWon } from '@/lib/format';
import {
  BASIS,
  CHAT,
  GEN,
  GEN_STEPS,
  HOPE_BUDGET,
  INPUT_HREF,
  confirmHref,
  creatingHref,
  draftHref,
  initialDraft,
  quoteOf,
  reportHref,
  resolveDraftMock,
  type DraftBlock,
  type DraftMock,
  type ExcludedBlock,
  type RecBlock,
  type WireKind,
} from './Draft-Client.data';
import s from './Draft-Client.module.css';

export default function DraftClient() {
  const { did = 'd-1' } = useParams();
  const [params] = useSearchParams();
  const rawMock = params.get('mock');
  const mock = resolveDraftMock(rawMock);
  const making = mock === '초안 만드는 중';
  const fail = mock === '만들기 실패';

  return (
    <div data-screen="Draft-Client">
      {making || fail ? (
        <Gen mode={making ? 'making' : 'fail'} did={did} />
      ) : (
        <Editor key={mock} mock={mock} did={did} rawMock={rawMock} />
      )}
    </div>
  );
}

function Gen({ mode, did }: { mode: 'making' | 'fail'; did: string }) {
  const fail = mode === 'fail';
  return (
    <div className={s.gen}>
      <PageHeader
        title={fail ? GEN.failTitle : GEN.makingTitle}
        description={fail ? GEN.failSub : GEN.makingSub}
      />
      <div className={s.quote}>
        <p className={s.quoteK}>{GEN.painLabel}</p>
        <p className={s.quoteP}>“{GEN.pain}”</p>
      </div>
      {fail ? <Fail did={did} /> : <Making />}
    </div>
  );
}

function Making() {
  return (
    <>
      <div className={s.steps}>
        {GEN_STEPS.map((step) => (
          <div
            key={step.key}
            className={[s.step, step.state === 'done' ? s.stepDone : '', step.state === 'now' ? s.stepNow : ''].filter(Boolean).join(' ')}
          >
            <b>{step.kicker}</b>
            {step.label}
          </div>
        ))}
      </div>
      <div className={s.bar} role="progressbar" aria-valuenow={2} aria-valuemin={1} aria-valuemax={3} aria-label="초안 만들기 진행">
        <span />
      </div>
      <div className={s.sk} aria-hidden="true">
        <div className={s.skCard}>
          <Skeleton width="40%" />
          <Skeleton height={120} />
          <Skeleton height={80} />
          <Skeleton width="70%" />
        </div>
        <div className={s.skCard}>
          <Skeleton width="55%" />
          <Skeleton />
          <Skeleton width="80%" />
          <Skeleton />
          <Skeleton width="60%" />
        </div>
      </div>
      <div className={s.genFoot}>
        <p>{GEN.foot}</p>
        <Button variant="text" to={INPUT_HREF}>취소</Button>
      </div>
    </>
  );
}

function Fail({ did }: { did: string }) {
  return (
    <>
      <Band tone="warn" title={GEN.failTitleBand}>{GEN.failBody}</Band>
      <div className={s.failActs}>
        <Button variant="primary" to={creatingHref(did)}>다시 만들기</Button>
        <Button variant="ghost" to={draftHref(did)}>업종 기본 구성으로 시작</Button>
        <Button variant="text" to={INPUT_HREF}>문장 고치기</Button>
      </div>
    </>
  );
}

function Editor({ mock, did, rawMock }: { mock: DraftMock; did: string; rawMock: string | null }) {
  const [seed] = useState(() => initialDraft(mock));
  const [included, setIncluded] = useState(seed.included);
  const [excluded, setExcluded] = useState<ExcludedBlock[]>(seed.excluded);
  const [recs, setRecs] = useState<RecBlock[]>(seed.recs);
  const [matched, setMatched] = useState<number | null>(null);
  const [memoId, setMemoId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState('');
  const [pane, setPane] = useState<'draft' | 'spec'>('draft');
  const [chat, setChat] = useState('');
  const reflecting = mock === '채팅 반영 중';
  const quote = quoteOf(included);

  const touch = () => setMatched(null);

  const addRec = (id: string) => {
    const rec = recs.find((item) => item.id === id);
    if (!rec) return;
    setRecs((list) => list.filter((item) => item.id !== id));
    setIncluded((list) => [...list, rec.block]);
    touch();
  };

  const removeBlock = (id: string) => {
    const item = included.find((block) => block.id === id);
    if (!item) return;
    setIncluded((list) => list.filter((block) => block.id !== id));
    setExcluded((list) => [{ ...item, updating: false, reason: '직접 삭제' }, ...list]);
    if (memoId === id) setMemoId(null);
    touch();
  };

  const undo = (id: string) => {
    const item = excluded.find((block) => block.id === id);
    if (!item) return;
    setExcluded((list) => list.filter((block) => block.id !== id));
    setIncluded((list) => [...list, toBlock(item)]);
    touch();
  };

  const openMemo = (item: DraftBlock) => {
    setMemoId(item.id);
    setMemoDraft(item.memo);
  };

  const saveMemo = () => {
    if (!memoId) return;
    const text = memoDraft.trim();
    setIncluded((list) => list.map((item) => (item.id === memoId ? { ...item, memo: text } : item)));
    setMemoId(null);
  };

  return (
    <>
      <PageHeader
        title="틀린 곳을 고쳐주세요"
        description="아래 채팅으로 바꾸고 싶은 점을 말씀하시면 화면 초안과 명세, 예상 총액이 함께 바뀝니다. 이 그림은 기능을 이해하기 위한 것이고 최종 디자인이 아닙니다."
        right={(
          <div className={s.headActions}>
            <span className={s.saved}><Check size={16} strokeWidth={2.2} aria-hidden />자동 저장됨</span>
            <Button variant="primary" to={confirmHref(did)}>명세 확정하기</Button>
          </div>
        )}
      />

      <div className={s.tabs}>
        <Tabs
          kind="underline"
          label="화면 초안 / 명세"
          value={pane}
          onChange={(key) => setPane(key === 'spec' ? 'spec' : 'draft')}
          items={[{ key: 'draft', label: '화면 초안' }, { key: 'spec', label: '명세' }]}
        />
      </div>

      <div className={`${s.split} ${pane === 'draft' ? s.showDraft : s.showSpec}`}>
        <section className={`mj-card ${s.pane} ${s.paneDraft}`} aria-labelledby="draft-h" role="region">
          <div className={s.cardHead}>
            <h2 id="draft-h">화면 초안</h2>
            <Button variant="ghost" size="sm" to={INPUT_HREF}>처음부터</Button>
          </div>
          <Canvas included={included} onRemove={removeBlock} />
          <Recommendations recs={recs} onAdd={addRec} />
        </section>

        <section className={`mj-card ${s.pane} ${s.paneSpec}`} aria-labelledby="spec-h" role="region">
          <div className={s.cardHead}>
            <h2 id="spec-h">요구사항 명세</h2>
            <span className={s.count}>명세 항목 {included.length}개</span>
          </div>
          <ul className={s.items} aria-label="명세 항목">
            {included.map((item) => (
              <li key={item.id} className={`${s.item} ${item.updating ? s.itemUpdating : ''}`}>
                <div className={s.itemName}>
                  {item.name}
                  {item.updating && <Chip tone="blue">반영 중</Chip>}
                </div>
                <p className={s.itemDesc}>{item.description}</p>
                <div className={s.cond}>
                  <div className={s.condHead}>
                    <span>공급자와 정할 것 · {item.conditions.length}건</span>
                    {memoId === item.id ? (
                      <Button variant="text" onClick={() => setMemoId(null)}>닫기</Button>
                    ) : (
                      <Button variant="text" onClick={() => openMemo(item)}>메모 남기기</Button>
                    )}
                  </div>
                  <p className={s.condItems}>
                    {item.conditions.map((cond, index) => (
                      <span key={cond}>{index > 0 && <span className={s.sep}> · </span>}{cond}</span>
                    ))}
                  </p>
                  {item.memo && <div className={s.memo}><Attr label="메모">{item.memo}</Attr></div>}
                  {memoId === item.id && (
                    <div className={s.memoEdit}>
                      <input
                        className={s.memoInput}
                        value={memoDraft}
                        onChange={(e) => setMemoDraft(e.target.value)}
                        aria-label={`${item.name} 메모`}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveMemo(); }}
                      />
                      <Button variant="text" onClick={saveMemo}>저장</Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {excluded.length > 0 && (
            <div className={s.excl}>
              <p className={s.exclLab}>이번 범위에서 제외</p>
              {excluded.map((item) => (
                <div key={item.id} className={s.exclRow}>
                  <span>
                    <span className={s.exclName}>{item.name}</span>
                    <span className={s.exclWhy}>{item.reason}</span>
                  </span>
                  <Button variant="text" onClick={() => undo(item.id)} aria-label={`${item.name} 되돌리기`}>되돌리기</Button>
                </div>
              ))}
            </div>
          )}

          <Total quote={quote} did={did} rawMock={rawMock} matched={matched} onMatch={() => setMatched(quote.total)} />
        </section>
      </div>

      <section className={s.dock} aria-label="채팅으로 고치기">
        <div className={s.chatTop}>
          <label className={s.chatLabel} htmlFor="chat">{CHAT.label}</label>
          <span className={s.chatCount}>남은 채팅 수정 <b>{CHAT.left}</b> / {CHAT.max}회</span>
        </div>
        <div className={s.chatRow}>
          <input
            className={s.chatInput}
            id="chat"
            type="text"
            placeholder={CHAT.placeholder}
            value={reflecting ? CHAT.reflecting : chat}
            onChange={(e) => setChat(e.target.value)}
            disabled={reflecting}
          />
          {reflecting ? (
            <Button variant="tint" disabled disabledReason={CHAT.reflectReason}>반영 중…</Button>
          ) : (
            <Button variant="tint">반영하기</Button>
          )}
        </div>
      </section>
    </>
  );
}

function Canvas({ included, onRemove }: { included: DraftBlock[]; onRemove: (id: string) => void }) {
  return (
    <div className={s.frame} data-canvas>
      <div className={s.frameBar} aria-hidden="true">
        <i className={s.dot} /><i className={s.dot} /><i className={s.dot} />
        <span className={s.frameUrl}>예약 사이트</span>
      </div>
      <div className={s.frameIn}>
        <div className={s.site} aria-hidden="true">
          <span className={s.wfImg} />
          <span className={s.siteNav}>
            <WfLine width="44px" /><WfLine width="44px" /><WfLine width="44px" />
          </span>
          <span className={`${s.wfBtn} ${s.wfBtnSm}`}>예약하기</span>
        </div>
        <div className={s.blockGrid}>
          {included.map((item) => (
            <article key={item.id} className={`${s.block} ${item.wide ? s.wide : ''}`} data-updating={item.updating ? 'true' : undefined}>
              <div className={s.blockTop}>
                <span className={s.blockName}>{item.name}</span>
                <button type="button" className={s.blockX} aria-label={`${item.name} 지우기`} onClick={() => onRemove(item.id)}>×</button>
              </div>
              <Wire kind={item.wire} />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Recommendations({ recs, onAdd }: { recs: RecBlock[]; onAdd: (id: string) => void }) {
  return (
    <div className={s.recs}>
      <h3 className={s.recTitle}>추천 블록</h3>
      <p className={s.recLead}>적으신 문장을 보고 함께 필요할 수 있는 블록을 골랐습니다. 누르면 바로 추가되고 예상 총액에 반영됩니다. 채팅 횟수에서 빠지지 않습니다.</p>
      <div className={s.recGrid}>
        {recs.map((rec) => (
          <button key={rec.id} type="button" className={s.rec} onClick={() => onAdd(rec.id)}>
            <span className={s.recReason}>{rec.reason}</span>
            <span className={s.recAdd}><Plus size={14} strokeWidth={2.4} aria-hidden />{rec.block.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Total({
  quote, did, rawMock, matched, onMatch,
}: {
  quote: ReturnType<typeof quoteOf>;
  did: string;
  rawMock: string | null;
  matched: number | null;
  onMatch: () => void;
}) {
  const same = matched === quote.total;
  const over = quote.total > HOPE_BUDGET;
  const under = quote.total < HOPE_BUDGET;
  return (
    <>
      <div className={s.tot} aria-label="예상 총액">
        <div className={s.totRow}><span>기능 {quote.count}건 합계</span><b>{formatWon(quote.sub)}</b></div>
        <div className={s.totRow}><span>플랫폼 수수료 5% 포함</span><b>{formatWon(quote.fee)}</b></div>
        <hr />
        <div className={s.totMain}>
          <span className={s.totLabel}>AI 예상 총액<span className={s.aiTag}>AI 예상 · 참고용</span></span>
          <span className={s.totValue}>{formatWon(quote.total)}</span>
        </div>
        {quote.tbd > 0 && <p className={s.tbd}>+ 금액 미정 {quote.tbd}건</p>}
        <div className={s.rep}>
          <span>기능별 금액과 근거</span>
          <Link className={s.report} to={reportHref(did, rawMock)}>단가 분석 리포트 보기</Link>
        </div>
      </div>
      <div className={s.bud}>
        {same ? (
          <p className={s.budMatched}>희망 예산을 AI 예상 총액 {formatWon(quote.total)}으로 바꿨습니다.</p>
        ) : over ? (
          <p className={s.budOver}>생각해 두신 예산 {formatWon(HOPE_BUDGET)}보다 {formatWon(quote.total - HOPE_BUDGET)} 많습니다. 항목을 빼면 합계가 바로 줄어듭니다.</p>
        ) : under ? (
          <p>생각해 두신 예산 {formatWon(HOPE_BUDGET)}보다 {formatWon(HOPE_BUDGET - quote.total)} 적습니다.</p>
        ) : (
          <p>생각해 두신 예산 {formatWon(HOPE_BUDGET)}과 같습니다.</p>
        )}
        {!same && (
          <Button variant="ghost" size="sm" onClick={onMatch}>예산을 이 금액으로 맞추기</Button>
        )}
      </div>
      <p className={s.basis}>{BASIS}</p>
    </>
  );
}

function toBlock(item: ExcludedBlock): DraftBlock {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    conditions: item.conditions,
    memo: item.memo,
    amount: item.amount,
    wire: item.wire,
    wide: item.wide,
  };
}

function WfLine({ width, grow }: { width?: string; grow?: boolean }) {
  return <span className={grow ? s.wfLineGrow : s.wfLine} style={width ? { width } : undefined} />;
}

function Segs({ items, on }: { items: string[]; on: string }) {
  return (
    <div className={s.segs}>
      {items.map((label) => (
        <span key={label} className={label === on ? s.segOn : s.seg}>{label}</span>
      ))}
    </div>
  );
}

function Wire({ kind }: { kind: WireKind }) {
  return (
    <div className={kind === 'calendar' ? undefined : s.wf} aria-hidden="true">
      {kind === 'calendar' && <CalendarWire />}
      {kind === 'pay' && <PayWire />}
      {kind === 'guests' && <GuestWire tags={['노쇼 2회', '노쇼 1회', '정상', '정상']} title="손님 기록" />}
      {kind === 'remind' && <RemindWire label="예약 전날 18:00 보내기" />}
      {kind === 'grades' && <GradesWire />}
      {kind === 'penalty' && <PenaltyWire />}
      {kind === 'confirm' && <RemindWire label="예약이 잡히면 바로 보내기" />}
      {kind === 'revisit' && <RemindWire label="60일째 뜸하면 보내기" />}
      {kind === 'allergy' && <AllergyWire />}
    </div>
  );
}

function CalendarWire() {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return (
    <div className={s.wfSplit}>
      <div>
        <div className={s.wfMonth}><span>‹</span><b>11월</b><span>›</span></div>
        <div className={s.wfCal}>
          {days.map((day) => <b key={day}>{day}</b>)}
          {Array.from({ length: 30 }, (_, i) => (
            <span key={i} className={`${s.wfDay} ${i + 1 === 12 ? s.wfDayOn : ''}`}>{i + 1}</span>
          ))}
        </div>
      </div>
      <div>
        <p className={s.wfK}>회차</p>
        <div className={s.gap}><Segs items={['점심', '저녁 1부', '저녁 2부']} on="저녁 1부" /></div>
        <p className={s.wfK}>인원</p>
        <div className={`${s.wfRow} ${s.gap}`}>
          <span className={s.wfBoxSm}>−</span>
          <span className={s.wfCenter}>2명</span>
          <span className={s.wfBoxSm}>+</span>
        </div>
        <p className={s.wfK}>남은 자리</p>
        <div className={s.gap}><WfLine width="40%" /></div>
        <div className={s.wfBtn}>다음</div>
      </div>
    </div>
  );
}

function PayWire() {
  return (
    <>
      <div className={`${s.wfBetween} ${s.gapSm}`}><span className={s.wfStrong}>예약금</span><WfLine width="64px" /></div>
      <div className={`${s.wfBox} ${s.gapSm}`}><span className={s.wfStrong}>카드 번호</span></div>
      <div className={`${s.wfRow} ${s.gap}`}>
        <span className={s.wfBox} style={{ flex: 1 }}><span className={s.wfStrong}>유효기간</span></span>
        <span className={s.wfBox} style={{ flex: 1 }}><span className={s.wfStrong}>CVC</span></span>
      </div>
      <div className={`${s.wfRow} ${s.gap}`}><span className={s.wfChk} /><span className={s.wfStrong}>환불 규정을 확인했습니다</span></div>
      <div className={s.wfBtn}>결제하기</div>
    </>
  );
}

function GuestWire({ tags, title }: { tags: string[]; title: string }) {
  return (
    <>
      <div className={s.wfBetween}>
        <span className={s.wfStrong}>{title}</span>
        <span className={s.wfBox} style={{ height: 24, width: 90 }}><WfLine /></span>
      </div>
      <div className={s.wfList}>
        {tags.map((tag, index) => (
          <div key={`${tag}-${index}`}><span className={s.wfAv} /><WfLine grow /><span className={s.wfTag}>{tag}</span></div>
        ))}
      </div>
    </>
  );
}

function RemindWire({ label }: { label: string }) {
  return (
    <>
      <div className={`${s.wfBetween} ${s.gap}`}><span className={s.wfStrong}>{label}</span><span className={s.wfTog} /></div>
      <div className={`${s.wfSms} ${s.gapSm}`}>
        <div className={s.gapSm}><WfLine /></div>
        <div className={s.gapSm}><WfLine width="80%" /></div>
        <WfLine width="55%" />
      </div>
      <div className={s.wfRow}><span className={s.wfStrong}>미리 보기</span><WfLine grow /></div>
    </>
  );
}

function GradesWire() {
  return (
    <>
      <div className={s.gapSm}><Segs items={['일반', '단골', 'VIP']} on="단골" /></div>
      <GuestWire tags={['방문 12회', '방문 7회']} title="손님" />
    </>
  );
}

function PenaltyWire() {
  return (
    <div className={s.stack}>
      <span className={s.wfBox}><span className={s.wfStrong}>위약금 규정</span></span>
      <div className={s.wfRow}><span className={s.wfChk} /><span className={s.wfStrong}>예약 때 고지함</span></div>
      <div className={s.wfBtn}>청구 내역</div>
    </div>
  );
}

function AllergyWire() {
  return (
    <div className={s.stack}>
      <span className={s.wfBox}><span className={s.wfStrong}>알레르기</span></span>
      <span className={s.wfBox}><span className={s.wfStrong}>좋아하는 것</span></span>
      <div className={s.wfBtn}>메모 저장</div>
    </div>
  );
}

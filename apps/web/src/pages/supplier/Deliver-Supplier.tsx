/* 공급자 납품 — 보드 Deliver-Supplier · /s/contracts/:cid/deliver · M5
 * 상태: 중간 납품 / 제출함 · 검수 대기 / 보완 요청 / 최종 납품 / 마감 지남 / 정산 계좌 없음
 * F-13 · 11.3. 파일 첨부 없음. 파란 버튼은 납품 제출 하나. */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  Chip,
  Deadline,
  Money,
  StatusChip,
  TextAreaField,
  TextField,
  chipToneOf,
} from '@/components/ui';
import {
  ACCOUNT_HREF,
  CHAT_HREF,
  DEMO,
  DEFAULT_CID,
  LIST_HREF,
  contractHref,
  deliverDemoOf,
  resolveDeliverMock,
  type CondRow,
  type FeatureItem,
} from './Deliver-Supplier.data';
import s from './Deliver-Supplier.module.css';

export default function DeliverSupplier() {
  const { cid = DEFAULT_CID } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveDeliverMock(params.get('mock'));
  const demo = deliverDemoOf(mock);

  const editableIds = demo.items.filter((i) => i.status === 'pre' || i.status === 'fix').map((i) => i.id);
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(editableIds.map((id) => [id, false])),
  );
  const [links, setLinks] = useState<Record<string, string>>(() =>
    Object.fromEntries(demo.items.map((i) => [i.id, i.link])),
  );
  const [memos, setMemos] = useState<Record<string, string>>(() =>
    Object.fromEntries(demo.items.map((i) => [i.id, i.memo])),
  );

  useEffect(() => {
    const next = deliverDemoOf(resolveDeliverMock(params.get('mock')));
    const ids = next.items.filter((i) => i.status === 'pre' || i.status === 'fix').map((i) => i.id);
    setChecked(Object.fromEntries(ids.map((id) => [id, false])));
    setLinks(Object.fromEntries(next.items.map((i) => [i.id, i.link])));
    setMemos(Object.fromEntries(next.items.map((i) => [i.id, i.memo])));
  }, [params]);

  const needCheck = editableIds.length > 0;
  const allChecked = needCheck && editableIds.every((id) => checked[id]);
  const canSubmit = !demo.submitted && !demo.noAccount && (!needCheck || allChecked);

  const onSubmit = () => {
    navigate(`?mock=${encodeURIComponent('제출함 · 검수 대기')}`);
  };

  return (
    <div className={s.page} data-screen="Deliver-Supplier">
      <p className={s.crumb}>
        <Link to={LIST_HREF}>{DEMO.crumbContracts}</Link>
        {' › '}
        <Link to={contractHref(cid)}>{DEMO.crumbContract}</Link>
        {' › '}
        {DEMO.pageTitle}
      </p>

      {demo.submitted ? (
        <p role="note" className={s.submitNote}>
          시연 상태 — 이 제출은 서버에 저장되지 않았습니다.
        </p>
      ) : null}

      <div className={s.head}>
        <div>
          <div className={s.titleRow}>
            <h1 className={s.title}>{DEMO.pageTitle}</h1>
            <Chip tone={chipToneOf(demo.status)}>{demo.statusLabel}</Chip>
          </div>
          <p className={s.sub}>{DEMO.sub}</p>
        </div>
        <div className={s.who}>
          <span className={s.av} aria-hidden="true">
            정
          </span>
          <span>
            <b>{DEMO.whoName}</b>
            <br />
            {DEMO.whoRole} ·{' '}
            <Link to={CHAT_HREF}>채팅</Link>
          </span>
        </div>
      </div>

      <section className={s.sum} aria-label="계약 요약">
        <div>
          <p className={s.sumK}>합의 금액</p>
          <div className={s.sumV}>
            <Money amount={DEMO.agreed} />
          </div>
          <div className={s.sumS}>계약 체결 11월 4일</div>
        </div>
        <div>
          <p className={s.sumK}>지급 비율</p>
          <div className={s.sumV}>{DEMO.ratio}</div>
          <div className={s.sumS}>
            구간마다 <Money amount={DEMO.stageGross} />
          </div>
        </div>
        <div>
          <p className={s.sumK}>작업 기간</p>
          <div className={s.sumV}>{DEMO.workDays}일</div>
          <div className={s.sumS}>
            <Deadline
              label="작업 마감"
              at={demo.deadlineAt}
              now={demo.deadlineNow}
              actionable={demo.deadlineActionable}
            />
          </div>
        </div>
        <div>
          <p className={s.sumK}>이번 구간</p>
          <div className={s.sumV}>{demo.stage} 납품</div>
          <div className={s.sumS}>항목 {demo.items.length}건</div>
        </div>
      </section>

      {demo.band ? (
        <div className={s.bandAct}>
          <Band tone={demo.band.tone} title={demo.band.title}>
            {demo.band.body}
          </Band>
          {demo.band.account ? (
            <Button variant="ghost" size="sm" to={ACCOUNT_HREF}>
              {DEMO.accountCta}
            </Button>
          ) : null}
          {demo.band.chat ? (
            <Button variant="ghost" size="sm" to={CHAT_HREF}>
              {DEMO.chatCta}
            </Button>
          ) : null}
        </div>
      ) : null}

      {demo.showPaid ? (
        <div className={s.paid} role="status">
          <div>
            <b>
              중간 구간 승인 · <Money amount={DEMO.net} /> 지급 완료
            </b>
            <p>
              11월 27일 · 예약 달력과 예약금 결제가 모두 승인되어 중간 구간 금액에서 수수료 5%를 뺀
              금액이 지급되었습니다.
            </p>
          </div>
          <Button variant="text" to={DEMO.settleHref}>
            {DEMO.settleLabel}
          </Button>
        </div>
      ) : null}

      <div className={s.lay}>
        <div>
          <div className={s.stageTag}>
            {demo.stage} 구간 · {demo.items.length}건
          </div>

          {demo.items.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              editable={it.status === 'pre' || it.status === 'fix'}
              checked={!!checked[it.id]}
              onCheck={(v) => setChecked((prev) => ({ ...prev, [it.id]: v }))}
              link={links[it.id] ?? ''}
              onLink={(v) => setLinks((prev) => ({ ...prev, [it.id]: v }))}
              memo={memos[it.id] ?? ''}
              onMemo={(v) => setMemos((prev) => ({ ...prev, [it.id]: v }))}
            />
          ))}

          <div className={s.sbm}>
            <p>{demo.submitNote}</p>
            <Button
              variant="primary"
              disabled={!canSubmit}
              disabledReason={
                demo.disabledReason ??
                (!allChecked && needCheck ? '계약 기능 항목을 모두 완료 확인해 주세요' : undefined)
              }
              onClick={onSubmit}
            >
              {demo.submitLabel}
            </Button>
          </div>
        </div>

        <aside className={s.rail}>
          <section className={s.card} aria-labelledby="pay-h">
            <h2 className={s.ct} id="pay-h">
              {demo.payTitle}
            </h2>
            <div className={s.payRow}>
              <span>구간 금액 · {demo.stage} 50%</span>
              <b>
                <Money amount={demo.stageGross} />
              </b>
            </div>
            <div className={s.payRow}>
              <span>공급자 수수료 5%</span>
              <b>
                −
                <Money amount={demo.fee} />
              </b>
            </div>
            <div className={s.payTot}>
              <span>받을 금액</span>
              <span>
                <Money amount={demo.net} size="row" />
              </span>
            </div>
            <p className={s.payNote}>{demo.payNote}</p>
          </section>

          <section className={s.card} aria-labelledby="prog-h">
            <h2 className={s.ct} id="prog-h">
              항목별 검수
            </h2>
            <ul className={s.prog}>
              {demo.items.map((it) => (
                <li key={it.id}>
                  <span>
                    <span className={s.progG}>{demo.stage}</span>
                    {it.name}
                  </span>
                  <ItemStatus item={it} />
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ItemStatus({ item }: { item: FeatureItem }) {
  if (item.status === 'ok') return <StatusChip status="승인" />;
  if (item.status === 'rev') return <StatusChip status="검수 대기" />;
  if (item.status === 'fix') return <Chip tone="amber">보완 요청</Chip>;
  return <StatusChip status="시작 전" />;
}

function ItemCard({
  item,
  editable,
  checked,
  onCheck,
  link,
  onLink,
  memo,
  onMemo,
}: {
  item: FeatureItem;
  editable: boolean;
  checked: boolean;
  onCheck: (v: boolean) => void;
  link: string;
  onLink: (v: string) => void;
  memo: string;
  onMemo: (v: string) => void;
}) {
  return (
    <section className={s.ic} aria-label={item.name}>
      <div className={s.ih}>
        <div>
          <div className={s.nm}>{item.name}</div>
          <div className={s.ds}>{item.desc}</div>
        </div>
        <ItemStatus item={item} />
      </div>

      {item.fix ? (
        <div className={s.fix} role="note">
          <div className={s.fixHead}>
            <b>보완 요청</b>
            {item.fix.tags.map((t) => (
              <Chip key={t} tone="amber">
                {t}
              </Chip>
            ))}
            <span className={s.fixWhen}>{item.fix.when}</span>
          </div>
          <p>{item.fix.quote}</p>
          <p>{item.fix.note}</p>
        </div>
      ) : null}

      <div className={s.crit}>
        <p className={s.critK}>검수 기준 · 계약서에 붙은 합의 조건</p>
        <ul className={s.conds}>
          {item.conds.map((c) => (
            <CondItem key={c.q} cond={c} />
          ))}
        </ul>
      </div>

      {editable ? (
        <>
          <label className={s.check}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onCheck(e.target.checked)}
            />
            <span>{item.name} 완료</span>
          </label>
          <div className={s.fields}>
            <TextField
              label="결과물 링크"
              value={link}
              onChange={(e) => onLink(e.target.value)}
              placeholder="테스트 주소 · 저장소 주소"
            />
            <TextAreaField
              label="납품 설명"
              hint="의뢰인이 검수할 때 보는 확인 방법"
              value={memo}
              onChange={(e) => onMemo(e.target.value)}
              placeholder="예) 관리 화면 › 예약 설정에서 회차를 바꿔 보세요"
            />
          </div>
        </>
      ) : null}

      {item.revNote ? <div className={s.doneRow}>{item.revNote}</div> : null}
      {item.okNote ? <div className={`${s.doneRow} ${s.doneOk}`}>✓ {item.okNote}</div> : null}
    </section>
  );
}

function CondItem({ cond }: { cond: CondRow }) {
  return (
    <li className={`${s.cond} ${cond.unset ? s.condUnset : ''}`}>
      <span className={s.condQ}>{cond.q}</span>
      <span className={s.condA}>{cond.unset ? <em>정하지 않음</em> : null}{cond.unset ? ' — ' : ''}{cond.a}</span>
    </li>
  );
}

/* 견적서 상세 — 보드 Quote-Client · /c/projects/:pid/proposals?modal=quote · M3
 * 상태: 최준호(채팅에서 수정) / 김세라 / 스튜디오 넛(불가 1건) / 이전 명세 기준 / 거절 확인
 * 모달 틀은 App. 본문만. sid · mock으로 공급자. F-09 · ㉜ */
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  ConfirmDialog,
  MaskedText,
  Money,
  Note,
  StatusChip,
} from '@/components/ui';
import { formatWon } from '@/lib/format';
import {
  DEMO,
  DEFAULT_PID,
  chatHref,
  profileHref,
  quoteDemoOf,
  resolveQuoteMock,
  withFee,
} from './Quote-Client.data';
import s from './Quote-Client.module.css';

export default function QuoteClient() {
  const { pid = DEFAULT_PID } = useParams();
  const [params, setParams] = useSearchParams();
  const mock = resolveQuoteMock(params.get('mock'));
  const demo = quoteDemoOf(mock, params.get('sid'));

  const [rejectOpen, setRejectOpen] = useState(demo.openReject);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const next = quoteDemoOf(resolveQuoteMock(params.get('mock')), params.get('sid'));
    setRejectOpen(next.openReject);
    setReason('');
  }, [params]);

  const closeReject = () => {
    setRejectOpen(false);
    setReason('');
    if (mock === '거절 확인') {
      const q = new URLSearchParams(params);
      q.set('mock', '최준호(채팅에서 수정)');
      setParams(q, { replace: true });
    }
  };

  return (
    <div className={s.page} data-screen="Quote-Client">
      {demo.stale && (
        <div className={s.noteGap}>
          <Note title={DEMO.staleTitle}>{DEMO.staleBody}</Note>
        </div>
      )}

      <div className={s.head}>
        <span className={s.av} aria-hidden="true">
          {demo.ini}
        </span>
        <div>
          <p className={s.k0}>
            견적서 · {demo.applied} · {demo.revLabel}
          </p>
          <div className={s.nameRow}>
            <h2 className={s.name}>{demo.name}</h2>
            {demo.stale ? <StatusChip status="이전 명세 기준" /> : null}
          </div>
          <p className={s.mt}>
            {demo.career}
            <span className={s.sep}>|</span>
            {demo.rating}
            <span className={s.sep}>|</span>
            {demo.reviews}
            <Link className={s.profile} to={profileHref(demo.sid)}>
              프로필 보기
            </Link>
          </p>
        </div>
      </div>

      <div className={s.sum3} aria-label="견적 요약">
        <div>
          <p className={s.sumK}>견적 금액</p>
          <Money amount={demo.amount} size="big" />
          <div className={s.sumS}>수수료 5% 포함 {formatWon(withFee(demo.amount))}</div>
          {demo.chg ? <div className={s.chg}>{demo.chg}</div> : null}
        </div>
        <div>
          <p className={s.sumK}>작업 기간</p>
          <div className={s.name} style={{ fontSize: 22 }}>
            {demo.days}일
          </div>
          <div className={s.sumS}>예치 다음 날부터</div>
        </div>
        <div>
          <p className={s.sumK}>할 수 있는 항목</p>
          <div className={s.name} style={{ fontSize: 22 }}>
            {demo.okCnt} / 4
          </div>
          <div className={s.sumS}>{demo.okNote}</div>
        </div>
      </div>

      <section className={s.blk} aria-labelledby="h-items">
        <h3 className={s.blkH} id="h-items">
          항목별 가능 여부 <span>{demo.basis}</span>
        </h3>
        <div className={s.items}>
          {demo.items.map((item) => (
            <div key={item.name} className={`${s.ir} ${item.ok ? '' : s.irDis}`}>
              <div>
                <div className={s.nm}>{item.name}</div>
                <div className={s.ds}>{item.description}</div>
              </div>
              {item.ok ? <span className={s.ok}>가능</span> : <span className={s.no}>불가</span>}
            </div>
          ))}
        </div>
        {demo.hasNo ? <p className={s.nonote}>{DEMO.unavailableNote}</p> : null}
      </section>

      <section className={s.blk} aria-labelledby="h-msg">
        <h3 className={s.blkH} id="h-msg">
          지원 메시지
          {demo.questions.length > 0 ? (
            <Link className={s.blkLink} to={chatHref(pid, demo.sid)}>
              문의하기 (채팅)으로 답하기
            </Link>
          ) : null}
        </h3>
        <div className={s.msg}>
          <MaskedText text={demo.message} />
          {demo.questions.length > 0 ? (
            <div className={s.qin}>
              <b>공급자 질문 {demo.questions.length}개</b>
              {demo.questions.map((q) => (
                <span key={q}>{q}</span>
              ))}
            </div>
          ) : null}
        </div>
        {demo.masked ? <p className={s.nonote}>{DEMO.maskNote}</p> : null}
      </section>

      <section className={s.blk} aria-labelledby="h-hist">
        <h3 className={s.blkH} id="h-hist">
          견적 수정 이력
          {demo.hasChat ? (
            <Link className={s.blkLink} to={chatHref(pid, demo.sid)}>
              채팅에서 보기
            </Link>
          ) : null}
        </h3>
        <ul className={s.hist}>
          {demo.hist.map((h) => (
            <li key={h.date + h.title} className={h.now ? s.now : undefined}>
              <div className={s.histD}>{h.date}</div>
              <div className={s.histT}>
                {h.title}
                {h.now ? ' · 지금 견적' : ''} — <span className={s.histAm}>{formatWon(h.amount)}</span> ·{' '}
                {h.days}일
              </div>
              {h.why ? <div className={s.histW}>{h.why}</div> : null}
            </li>
          ))}
        </ul>
      </section>

      <div className={s.foot}>
        <p className={s.footNote}>{demo.footNote}</p>
        <div className={s.acts}>
          <Button variant="text" onClick={() => setRejectOpen(true)}>
            거절
          </Button>
          <Button variant="primary" to={chatHref(pid, demo.sid)}>
            {DEMO.chatLabel}
          </Button>
        </div>
      </div>

      {rejectOpen && (
        <ConfirmDialog
          title={`${demo.name}님의 지원을 거절할까요?`}
          confirmLabel="거절하기"
          danger
          onConfirm={closeReject}
          onCancel={closeReject}
        >
          <ul className={s.rejectList}>
            <li>
              거절하면 <b>되돌릴 수 없습니다.</b> {demo.name}님에게 &apos;직접 거절&apos; 알림이 갑니다.
            </li>
            <li>{demo.name}님과의 채팅은 읽기 전용이 됩니다.</li>
            <li>다른 지원은 그대로 남습니다.</li>
          </ul>
          <p className={s.rejectLabel}>
            거절 사유 <span>(선택 · 공급자에게 보이지 않습니다)</span>
          </p>
          <textarea
            className={s.rejectTa}
            aria-label="거절 사유"
            placeholder={DEMO.rejectPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </ConfirmDialog>
      )}
    </div>
  );
}

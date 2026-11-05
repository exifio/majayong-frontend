/* 의뢰인 계정 설정 — 보드 Account-Client · /c/account · M6
 * 상태: 기본 / 탈퇴 확인 / 비밀번호 변경 완료 / 이메일 바꾸기 / 구글 연결 해제
 * F-28 · 결정메모 #2. */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  ConfirmDialog,
  Modal,
  TextField,
} from '@/components/ui';
import { LiveSettlementInfo } from '@/components/account/LiveSettlementInfo';
import { DEMO, resolveAccountMock, type AccountMock } from './Account-Client.data';
import s from './Account-Client.module.css';

export default function AccountClient() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveAccountMock(params.get('mock'));

  const [emailOpen, setEmailOpen] = useState(mock === '이메일 바꾸기');
  const [googleOpen, setGoogleOpen] = useState(mock === '구글 연결 해제');
  const [leaveOpen, setLeaveOpen] = useState(mock === '탈퇴 확인');
  const [newEmail, setNewEmail] = useState<string>(DEMO.emailNewValue);
  const [emailPw, setEmailPw] = useState<string>('password1234');

  useEffect(() => {
    setEmailOpen(mock === '이메일 바꾸기');
    setGoogleOpen(mock === '구글 연결 해제');
    setLeaveOpen(mock === '탈퇴 확인');
  }, [mock]);

  const go = (next: AccountMock) => {
    navigate(`/c/account?mock=${encodeURIComponent(next)}`, { replace: true });
  };

  const closeModals = () => {
    setEmailOpen(false);
    setGoogleOpen(false);
    setLeaveOpen(false);
    go('기본');
  };

  return (
    <div className={s.page} data-screen="Account-Client">
      <header className={s.head}>
        <h1 className={s.title}>{DEMO.title}</h1>
        <p className={s.sub}>{DEMO.sub}</p>
        <p className={s.who}>
          <b>{DEMO.name}</b> · {DEMO.meta}
        </p>
      </header>

      {mock === '비밀번호 변경 완료' ? (
        <Band tone="done" title={DEMO.pwDoneTitle}>
          {DEMO.pwDoneBody}
        </Band>
      ) : null}

      <ul className={s.rows}>
        <li className={s.row}>
          <div>
            <p className={s.k}>{DEMO.emailLabel}</p>
            <p className={s.v}>
              {DEMO.emailValue}
              <span className={s.prv}>{DEMO.emailPrivate}</span>
            </p>
          </div>
          <Button
            variant="tint"
            size="sm"
            type="button"
            onClick={() => {
              setEmailOpen(true);
              go('이메일 바꾸기');
            }}
          >
            {DEMO.emailChange}
          </Button>
        </li>

        <li className={s.row}>
          <div>
            <p className={s.k}>{DEMO.passwordLabel}</p>
            <p className={s.v}>{DEMO.passwordValue}</p>
          </div>
          <Button
            variant="tint"
            size="sm"
            type="button"
            onClick={() => go('비밀번호 변경 완료')}
          >
            {DEMO.passwordChange}
          </Button>
        </li>

        <li className={s.row}>
          <div>
            <p className={s.k}>{DEMO.googleLabel}</p>
            <p className={s.v}>{DEMO.googleValue}</p>
          </div>
          <Button
            variant="tint"
            size="sm"
            type="button"
            onClick={() => {
              setGoogleOpen(true);
              go('구글 연결 해제');
            }}
          >
            {DEMO.googleUnlink}
          </Button>
        </li>

        <li className={s.row}>
          <div>
            <p className={s.k}>{DEMO.notifyLabel}</p>
            <p className={s.v}>{DEMO.notifyValue}</p>
          </div>
          <Button variant="text" size="sm" type="button">
            {DEMO.notifyEdit}
          </Button>
        </li>

        <li className={`${s.row} ${s.leave}`}>
          <div>
            <p className={s.k}>{DEMO.leaveLabel}</p>
            <p className={s.v}>{DEMO.leaveValue}</p>
          </div>
          <Button
            variant="warn"
            size="sm"
            type="button"
            onClick={() => {
              setLeaveOpen(true);
              go('탈퇴 확인');
            }}
          >
            {DEMO.leaveBtn}
          </Button>
        </li>
      </ul>

      <LiveSettlementInfo role="CLIENT" />

      {emailOpen ? (
        <Modal
          title={DEMO.emailModalTitle}
          onClose={closeModals}
          actions={
            <>
              <Button variant="ghost" onClick={closeModals}>
                {DEMO.emailCancel}
              </Button>
              <Button variant="primary" onClick={closeModals}>
                {DEMO.emailSend}
              </Button>
            </>
          }
        >
          <p className={s.modalSub}>{DEMO.emailModalSub}</p>
          <p className={s.cur}>
            지금 이메일 <b>{DEMO.emailValue}</b>
          </p>
          <TextField
            label={DEMO.emailNew}
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <TextField
            label={DEMO.emailPw}
            type="password"
            value={emailPw}
            onChange={(e) => setEmailPw(e.target.value)}
          />
          <ul className={s.hints}>
            {DEMO.emailHints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Modal>
      ) : null}

      {googleOpen ? (
        <Modal
          title={DEMO.googleModalTitle}
          danger
          onClose={closeModals}
          actions={
            <>
              <Button variant="ghost" onClick={closeModals}>
                {DEMO.googleCancel}
              </Button>
              <Button variant="warn" onClick={closeModals}>
                {DEMO.googleConfirm}
              </Button>
            </>
          }
        >
          <p className={s.modalSub}>{DEMO.googleModalSub}</p>
          <div className={s.googleOk}>
            <div>
              <p className={s.okTitle}>{DEMO.googleOk}</p>
              <p className={s.okHint}>{DEMO.googleOkHint}</p>
            </div>
          </div>
          <ul className={s.hints}>
            {DEMO.googleHints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Modal>
      ) : null}

      {leaveOpen ? (
        <ConfirmDialog
          title={DEMO.leaveTitle}
          confirmLabel={DEMO.leaveConfirm}
          danger
          onCancel={closeModals}
          onConfirm={closeModals}
        >
          <p>{DEMO.leaveBody}</p>
          <p className={s.leaveContract}>{DEMO.leaveContract}</p>
          <p>
            <Button variant="tint" size="sm" to={DEMO.leaveContractsHref}>
              내 계약 보기
            </Button>
          </p>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

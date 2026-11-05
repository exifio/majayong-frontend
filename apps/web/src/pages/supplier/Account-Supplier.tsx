/* 공급자 계정 설정 — 보드 Account-Supplier · /s/account · M6
 * 상태: 기본 / 탈퇴 확인 / 비밀번호 변경 완료 / 이메일 바꾸기 / 계좌 바꾸기
 * F-28 · F-29. Account-Client와 같은 구조 + 정산 계좌. */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Band,
  Button,
  ConfirmDialog,
  Modal,
  TextField,
} from '@/components/ui';
import { DEMO, resolveAccountMock, type AccountMock } from './Account-Supplier.data';
import s from './Account-Supplier.module.css';

export default function AccountSupplier() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mock = resolveAccountMock(params.get('mock'));

  const [emailOpen, setEmailOpen] = useState(mock === '이메일 바꾸기');
  const [bankOpen, setBankOpen] = useState(mock === '계좌 바꾸기');
  const [leaveOpen, setLeaveOpen] = useState(mock === '탈퇴 확인');
  const [newEmail, setNewEmail] = useState<string>(DEMO.emailNewValue);
  const [emailPw, setEmailPw] = useState<string>('password1234');
  const [bank, setBank] = useState<string>(DEMO.bankBankValue);
  const [accountNo, setAccountNo] = useState<string>(DEMO.bankNumberValue);

  useEffect(() => {
    setEmailOpen(mock === '이메일 바꾸기');
    setBankOpen(mock === '계좌 바꾸기');
    setLeaveOpen(mock === '탈퇴 확인');
  }, [mock]);

  const go = (next: AccountMock) => {
    navigate(`/s/account?mock=${encodeURIComponent(next)}`, { replace: true });
  };

  const closeModals = () => {
    setEmailOpen(false);
    setBankOpen(false);
    setLeaveOpen(false);
    go('기본');
  };

  return (
    <div className={s.page} data-screen="Account-Supplier">
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
          <Button variant="tint" size="sm" type="button" onClick={() => go('비밀번호 변경 완료')}>
            {DEMO.passwordChange}
          </Button>
        </li>

        <li className={s.row}>
          <div>
            <p className={s.k}>{DEMO.googleLabel}</p>
            <p className={s.v}>{DEMO.googleValue}</p>
          </div>
          <Button variant="text" size="sm" type="button">
            {DEMO.googleConnect}
          </Button>
        </li>

        <li className={s.row}>
          <div>
            <p className={s.k}>{DEMO.bankLabel}</p>
            <p className={s.v}>{DEMO.bankValue}</p>
            <p className={s.prv}>{DEMO.bankHint}</p>
          </div>
          <Button
            variant="tint"
            size="sm"
            type="button"
            onClick={() => {
              setBankOpen(true);
              go('계좌 바꾸기');
            }}
          >
            {DEMO.bankChange}
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

      {bankOpen ? (
        <Modal
          title={DEMO.bankModalTitle}
          onClose={closeModals}
          actions={
            <>
              <Button variant="ghost" onClick={closeModals}>
                {DEMO.bankCancel}
              </Button>
              <Button variant="primary" onClick={closeModals}>
                {DEMO.bankSave}
              </Button>
            </>
          }
        >
          <p className={s.modalSub}>{DEMO.bankModalSub}</p>
          <div className={s.selectField}>
            <label className={s.selectLabel} htmlFor="bank-name">
              {DEMO.bankBank}
            </label>
            <select
              id="bank-name"
              className={s.select}
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            >
              {DEMO.bankBanks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <TextField
            label={DEMO.bankNumber}
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
          />
          <TextField
            label={DEMO.bankHolder}
            value={DEMO.bankHolderValue}
            readOnly
            hint={DEMO.bankHolderHint}
          />
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

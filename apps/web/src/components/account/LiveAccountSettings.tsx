/* 계정 설정 실제 API — 의뢰인 · 공급자 공용.
 * GET /me · POST /me/password/change · POST /me/email/change-request · POST /me/google/disconnect · DELETE /me
 * · GET/PATCH /me/notification-settings. */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MeDto } from '@majayong/types/api';
import { Band, Button, LoadingState, Modal, TextField } from '@/components/ui';
import { useSession } from '@/app/session';
import { apiRequest } from '@/lib/api';
import { errorCode, isAbort, joinedLabel, newPasswordError } from '@/lib/account-profile';
import { LiveSettlementInfo } from './LiveSettlementInfo';
import { LiveNotificationSettings } from './LiveNotificationSettings';
import own from './LiveAccountSettings.module.css';

type Role = 'CLIENT' | 'SUPPLIER';
type Dialog = null | 'email' | 'password' | 'google' | 'leave';
type Done = null | { title: string; body: string };

export const ACCOUNT_TEXT = {
  title: '계정 설정',
  clientSub: '로그인 · 탈퇴를 관리합니다. 역할은 바꿀 수 없습니다.',
  supplierSub: '로그인 · 정산 정보 · 탈퇴를 관리합니다. 역할은 바꿀 수 없습니다.',
  loading: '계정 정보를 불러오는 중입니다.',
  loadError: '계정 정보를 불러오지 못했습니다.',
  retry: '다시 시도',
  emailLabel: '이메일',
  emailPrivate: '공개 안 함',
  emailChange: '바꾸기',
  emailModalTitle: '계정 이메일 바꾸기',
  emailModalSub: '새 이메일로 인증 메일을 보냅니다. 메일의 링크를 열어 인증해야 바뀝니다.',
  emailNew: '새 이메일',
  emailSend: '인증 메일 보내기',
  emailHints: [
    '인증 링크는 30분 동안 쓸 수 있습니다. 인증 전까지는 지금 이메일로 로그인합니다.',
    '바뀐 이메일도 다른 사용자에게는 공개되지 않습니다.',
  ],
  emailSentTitle: '인증 메일을 보냈습니다',
  passwordLabel: '비밀번호',
  passwordValue: '이메일 로그인에 쓰는 비밀번호입니다.',
  passwordChange: '비밀번호 바꾸기',
  passwordModalTitle: '비밀번호 바꾸기',
  passwordCurrent: '현재 비밀번호',
  passwordCurrentHint: '구글로만 가입해 비밀번호가 없다면 비워 두세요. 새 비밀번호가 정해집니다.',
  passwordNew: '새 비밀번호',
  passwordConfirm: '새 비밀번호 한 번 더',
  passwordRules: '8자 이상 · 영문과 숫자를 섞음',
  passwordSave: '비밀번호 저장',
  passwordDoneTitle: '비밀번호를 바꿨습니다',
  passwordDoneBody: '다음 로그인부터 새 비밀번호를 쓰세요. 바꾸지 않으셨다면 바로 비밀번호를 다시 바꿔 주세요.',
  googleLabel: '구글 연결',
  googleValue: '구글 계정으로 로그인하고 있다면 비밀번호를 확인한 뒤 연결을 해제할 수 있습니다.',
  googleUnlink: '연결 해제',
  googleModalTitle: '구글 연결을 해제할까요?',
  googleModalSub: '해제하면 이메일과 비밀번호로만 로그인합니다.',
  googlePassword: '비밀번호',
  googleConfirm: '연결 해제',
  googleHints: [
    '구글로만 가입했다면 먼저 비밀번호를 정해야 해제할 수 있습니다.',
    '해제해도 계약 · 정산 · 리뷰 기록은 그대로입니다.',
  ],
  googleDoneTitle: '구글 연결을 해제했습니다',
  googleDoneBody: '이제 이메일과 비밀번호로 로그인합니다.',
  notifyLabel: '알림',
  notifyValue: '알림은 화면 위 알림함으로 받습니다. 알림 설정은 아직 따로 바꿀 수 없습니다.',
  leaveLabel: '탈퇴',
  leaveValue: '진행 중 계약이 있으면 탈퇴할 수 없습니다.',
  leaveBtn: '탈퇴하기',
  leaveTitle: '정말 탈퇴할까요?',
  leaveBody: '탈퇴하면 이 계정으로 다시 로그인할 수 없습니다. 끝난 계약 · 정산 · 리뷰 기록은 지워지지 않고, 남긴 리뷰의 작성자는 익명으로 표시됩니다.',
  leaveConfirm: '탈퇴하기',
  leaveBlockedTitle: '지금은 탈퇴할 수 없습니다',
  leaveBlockedBody: '진행 중인 계약이 있습니다. 서명 대기 · 진행 중 · 취소 요청 중인 계약이 하나라도 있으면 탈퇴할 수 없습니다. 계약을 마치거나 정리한 뒤 다시 시도해 주세요.',
  leaveContracts: '내 계약 보기',
  cancel: '취소',
  close: '닫기',
  sending: '처리 중입니다',
} as const;

function emailErrorMessage(error: unknown): string {
  switch (errorCode(error)) {
    case 'EMAIL_UNCHANGED': return '지금 쓰는 이메일과 같습니다.';
    case 'EMAIL_ALREADY_REGISTERED': return '이미 가입된 이메일입니다. 다른 이메일을 적어 주세요.';
    case 'INVALID_EMAIL': return '이메일 형식을 확인해 주세요.';
    case 'DELIVERY_UNAVAILABLE': return '지금은 인증 메일을 보낼 수 없습니다. 잠시 후 다시 시도하거나 고객센터로 문의해 주세요.';
    default: return '인증 메일을 보내지 못했습니다. 다시 시도해 주세요.';
  }
}

function passwordErrorMessage(error: unknown): string {
  switch (errorCode(error)) {
    case 'INVALID_CREDENTIALS': return '현재 비밀번호가 맞지 않습니다.';
    case 'CURRENT_PASSWORD_REQUIRED': return '현재 비밀번호를 입력해 주세요.';
    case 'ACCOUNT_UNAVAILABLE': return '이 계정은 비밀번호를 바꿀 수 없습니다. 고객센터로 문의해 주세요.';
    case 'ACCOUNT_CHANGED': return '그사이 계정 정보가 바뀌었습니다. 새로고침한 뒤 다시 시도해 주세요.';
    default: return '비밀번호를 바꾸지 못했습니다. 다시 시도해 주세요.';
  }
}

function googleErrorMessage(error: unknown): string {
  switch (errorCode(error)) {
    case 'GOOGLE_NOT_CONNECTED': return '이 계정에는 구글이 연결되어 있지 않습니다.';
    case 'PASSWORD_REQUIRED': return '아직 비밀번호가 없습니다. 먼저 비밀번호를 정한 뒤 해제해 주세요.';
    case 'INVALID_CREDENTIALS': return '비밀번호가 맞지 않습니다.';
    case 'ACCOUNT_CHANGED': return '그사이 계정 정보가 바뀌었습니다. 새로고침한 뒤 다시 시도해 주세요.';
    default: return '구글 연결을 해제하지 못했습니다. 다시 시도해 주세요.';
  }
}

export function LiveAccountSettings({
  role,
  styles: s,
  screen,
}: {
  role: Role;
  styles: Record<string, string>;
  screen: string;
}) {
  const { apiAccessToken, logout } = useSession();
  const navigate = useNavigate();
  const contractsHref = role === 'CLIENT' ? '/c/contracts' : '/s/contracts';

  const [me, setMe] = useState<MeDto | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [version, setVersion] = useState(0);

  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<Done>(null);

  const [newEmail, setNewEmail] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [nextPw2, setNextPw2] = useState('');
  const [pwTried, setPwTried] = useState(false);
  const [googlePw, setGooglePw] = useState('');
  const [leaveBlocked, setLeaveBlocked] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoadState('loading');
    apiRequest('getMe', '/me', { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        if (typeof response.data?.email !== 'string') {
          setLoadState('error');
          return;
        }
        setMe(response.data);
        setLoadState('ready');
      })
      .catch((error: unknown) => {
        if (isAbort(error)) return;
        setLoadState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken, version]);

  const open = (next: Exclude<Dialog, null>) => {
    setFormError(null);
    setDone(null);
    setLeaveBlocked(false);
    setDialog(next);
  };
  // Modal은 onClose가 바뀔 때마다 첫 입력으로 포커스를 옮기므로 안정된 함수를 넘긴다.
  const close = useCallback(() => {
    setDialog(null);
    setFormError(null);
    setNewEmail('');
    setCurrentPw('');
    setNextPw('');
    setNextPw2('');
    setPwTried(false);
    setGooglePw('');
  }, []);

  const sendEmail = async () => {
    const email = newEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('이메일 형식을 확인해 주세요.');
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await apiRequest('requestEmailChange', '/me/email/change-request', {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { email },
      });
      close();
      setDone({
        title: ACCOUNT_TEXT.emailSentTitle,
        body: `${email}로 보낸 메일의 링크를 30분 안에 열어야 이메일이 바뀝니다. 인증 전까지는 지금 이메일로 로그인합니다.`,
      });
    } catch (error) {
      setFormError(emailErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    setPwTried(true);
    if (newPasswordError(nextPw, nextPw2)) return;
    setBusy(true);
    setFormError(null);
    try {
      await apiRequest('changePassword', '/me/password/change', {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: currentPw ? { currentPassword: currentPw, newPassword: nextPw } : { newPassword: nextPw },
      });
      close();
      setDone({ title: ACCOUNT_TEXT.passwordDoneTitle, body: ACCOUNT_TEXT.passwordDoneBody });
    } catch (error) {
      setFormError(passwordErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const disconnectGoogle = async () => {
    if (!googlePw) {
      setFormError('비밀번호를 입력해 주세요.');
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await apiRequest('disconnectGoogle', '/me/google/disconnect', {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: { password: googlePw },
      });
      close();
      setDone({ title: ACCOUNT_TEXT.googleDoneTitle, body: ACCOUNT_TEXT.googleDoneBody });
    } catch (error) {
      setFormError(googleErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    setBusy(true);
    setFormError(null);
    try {
      await apiRequest('withdrawAccount', '/me', { method: 'DELETE', accessToken: apiAccessToken });
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      if (errorCode(error) === 'ACTIVE_CONTRACTS_EXIST') setLeaveBlocked(true);
      else setFormError('탈퇴를 처리하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  const sub = role === 'CLIENT' ? ACCOUNT_TEXT.clientSub : ACCOUNT_TEXT.supplierSub;
  const roleLabel = role === 'CLIENT' ? '의뢰인' : '공급자';
  const pwRuleError = pwTried ? newPasswordError(nextPw, nextPw2) : undefined;
  const busyReason = busy ? ACCOUNT_TEXT.sending : undefined;

  return (
    <div className={s.page} data-screen={screen}>
      <header className={s.head}>
        <h1 className={s.title}>{ACCOUNT_TEXT.title}</h1>
        <p className={s.sub}>{sub}</p>
        {me ? (
          <p className={s.who}>
            <b>{me.name?.trim() || me.email.split('@')[0]}</b> · {roleLabel} · {joinedLabel(me.createdAt)}
          </p>
        ) : null}
      </header>

      {done ? <Band tone="done" title={done.title}>{done.body}</Band> : null}

      {loadState === 'loading' ? <LoadingState label={ACCOUNT_TEXT.loading} compact /> : null}
      {loadState === 'error' ? (
        <div>
          <p className={own.error} role="alert">{ACCOUNT_TEXT.loadError}</p>
          <Button variant="ghost" size="sm" onClick={() => setVersion((value) => value + 1)}>
            {ACCOUNT_TEXT.retry}
          </Button>
        </div>
      ) : null}

      {me ? (
        <ul className={s.rows}>
          <li className={s.row}>
            <div>
              <p className={s.k}>{ACCOUNT_TEXT.emailLabel}</p>
              <p className={s.v}>
                {me.email}
                <span className={s.prv}>{ACCOUNT_TEXT.emailPrivate}</span>
              </p>
            </div>
            <Button variant="tint" size="sm" onClick={() => open('email')}>
              {ACCOUNT_TEXT.emailChange}
            </Button>
          </li>

          <li className={s.row}>
            <div>
              <p className={s.k}>{ACCOUNT_TEXT.passwordLabel}</p>
              <p className={s.v}>{ACCOUNT_TEXT.passwordValue}</p>
            </div>
            <Button variant="tint" size="sm" onClick={() => open('password')}>
              {ACCOUNT_TEXT.passwordChange}
            </Button>
          </li>

          <li className={s.row}>
            <div>
              <p className={s.k}>{ACCOUNT_TEXT.googleLabel}</p>
              <p className={s.v}>{ACCOUNT_TEXT.googleValue}</p>
            </div>
            <Button variant="tint" size="sm" onClick={() => open('google')}>
              {ACCOUNT_TEXT.googleUnlink}
            </Button>
          </li>

          <li className={`${s.row} ${s.leave}`}>
            <div>
              <p className={s.k}>{ACCOUNT_TEXT.leaveLabel}</p>
              <p className={s.v}>{ACCOUNT_TEXT.leaveValue}</p>
            </div>
            <Button variant="warn" size="sm" onClick={() => open('leave')}>
              {ACCOUNT_TEXT.leaveBtn}
            </Button>
          </li>
        </ul>
      ) : null}

      <LiveNotificationSettings />
      <LiveSettlementInfo role={role} />

      {dialog === 'email' && me ? (
        <Modal
          title={ACCOUNT_TEXT.emailModalTitle}
          onClose={close}
          actions={
            <>
              <Button variant="ghost" onClick={close}>{ACCOUNT_TEXT.cancel}</Button>
              <Button variant="primary" disabled={busy} disabledReason={busyReason} onClick={() => void sendEmail()}>
                {ACCOUNT_TEXT.emailSend}
              </Button>
            </>
          }
        >
          <p className={s.modalSub}>{ACCOUNT_TEXT.emailModalSub}</p>
          <p className={s.cur}>
            지금 이메일 <b>{me.email}</b>
          </p>
          <TextField
            label={ACCOUNT_TEXT.emailNew}
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          {formError ? <p className={own.error} role="alert">{formError}</p> : null}
          <ul className={s.hints}>
            {ACCOUNT_TEXT.emailHints.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </Modal>
      ) : null}

      {dialog === 'password' ? (
        <Modal
          title={ACCOUNT_TEXT.passwordModalTitle}
          onClose={close}
          actions={
            <>
              <Button variant="ghost" onClick={close}>{ACCOUNT_TEXT.cancel}</Button>
              <Button variant="primary" disabled={busy} disabledReason={busyReason} onClick={() => void changePassword()}>
                {ACCOUNT_TEXT.passwordSave}
              </Button>
            </>
          }
        >
          <TextField
            label={ACCOUNT_TEXT.passwordCurrent}
            type="password"
            autoComplete="current-password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            hint={ACCOUNT_TEXT.passwordCurrentHint}
          />
          <TextField
            label={ACCOUNT_TEXT.passwordNew}
            type="password"
            autoComplete="new-password"
            value={nextPw}
            onChange={(e) => setNextPw(e.target.value)}
            hint={ACCOUNT_TEXT.passwordRules}
          />
          <TextField
            label={ACCOUNT_TEXT.passwordConfirm}
            type="password"
            autoComplete="new-password"
            value={nextPw2}
            onChange={(e) => setNextPw2(e.target.value)}
            error={pwRuleError}
          />
          {formError ? <p className={own.error} role="alert">{formError}</p> : null}
        </Modal>
      ) : null}

      {dialog === 'google' ? (
        <Modal
          title={ACCOUNT_TEXT.googleModalTitle}
          danger
          onClose={close}
          actions={
            <>
              <Button variant="ghost" onClick={close}>{ACCOUNT_TEXT.cancel}</Button>
              <Button variant="warn" disabled={busy} disabledReason={busyReason} onClick={() => void disconnectGoogle()}>
                {ACCOUNT_TEXT.googleConfirm}
              </Button>
            </>
          }
        >
          <p className={s.modalSub}>{ACCOUNT_TEXT.googleModalSub}</p>
          <TextField
            label={ACCOUNT_TEXT.googlePassword}
            type="password"
            autoComplete="current-password"
            value={googlePw}
            onChange={(e) => setGooglePw(e.target.value)}
          />
          {formError ? <p className={own.error} role="alert">{formError}</p> : null}
          <ul className={s.hints}>
            {ACCOUNT_TEXT.googleHints.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </Modal>
      ) : null}

      {dialog === 'leave' ? (
        <Modal
          title={leaveBlocked ? ACCOUNT_TEXT.leaveBlockedTitle : ACCOUNT_TEXT.leaveTitle}
          size="confirm"
          danger
          onClose={close}
          actions={
            leaveBlocked ? (
              <Button variant="ghost" onClick={close}>{ACCOUNT_TEXT.close}</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={close}>{ACCOUNT_TEXT.cancel}</Button>
                <Button variant="warn" disabled={busy} disabledReason={busyReason} onClick={() => void withdraw()}>
                  {ACCOUNT_TEXT.leaveConfirm}
                </Button>
              </>
            )
          }
        >
          {leaveBlocked ? (
            <>
              <p>{ACCOUNT_TEXT.leaveBlockedBody}</p>
              <p>
                <Button variant="tint" size="sm" to={contractsHref}>{ACCOUNT_TEXT.leaveContracts}</Button>
              </p>
            </>
          ) : (
            <p>{ACCOUNT_TEXT.leaveBody}</p>
          )}
          {formError ? <p className={own.error} role="alert">{formError}</p> : null}
        </Modal>
      ) : null}
    </div>
  );
}

/* 알림 설정 — GET/PATCH /me/notification-settings. 실제 저장되는 항목만 보여 준다. */
import { useEffect, useState } from 'react';
import type { NotificationSettingsDto } from '@majayong/types/api';
import { Button, LoadingState } from '@/components/ui';
import { useSession } from '@/app/session';
import { ApiRequestError, apiRequest } from '@/lib/api';
import s from './LiveNotificationSettings.module.css';

const LABELS: Array<{ key: keyof NotificationSettingsDto; label: string; note: string }> = [
  { key: 'contract', label: '계약·예치·검수·정산', note: '서명, 예치, 납품, 검수, 지급 소식' },
  { key: 'chat', label: '채팅', note: '새 메시지와 견적 수정 소식' },
  { key: 'recruiting', label: '모집·지원', note: '지원 접수, 모집 마감, 선택 기간 소식' },
  { key: 'review', label: '리뷰', note: '리뷰 작성 요청과 새 리뷰 소식' },
  { key: 'support', label: '문의 답변', note: '1:1 문의 답변 소식' },
  { key: 'marketing', label: '마케팅', note: '선택 수신. 기본은 받지 않습니다' },
];

type State = 'loading' | 'ready' | 'error';

export function LiveNotificationSettings() {
  const { apiAccessToken } = useSession();
  const [state, setState] = useState<State>('loading');
  const [settings, setSettings] = useState<NotificationSettingsDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    apiRequest('getNotificationSettings', '/me/notification-settings', {
      accessToken: apiAccessToken,
      signal: controller.signal,
    })
      .then((response) => {
        setSettings(response.data);
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken]);

  const toggle = (key: keyof NotificationSettingsDto) => {
    setSettings((current) => (current === null ? current : { ...current, [key]: !current[key] }));
    setNotice(null);
  };

  const save = async () => {
    if (settings === null || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await apiRequest('updateNotificationSettings', '/me/notification-settings', {
        method: 'PATCH',
        accessToken: apiAccessToken,
        jsonBody: settings,
      });
      setSettings(response.data);
      setNotice('알림 설정을 저장했습니다.');
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : '알림 설정을 저장하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'loading') return <LoadingState label="알림 설정을 불러오는 중입니다." compact />;
  if (state === 'error' || settings === null) {
    return <p className={s.error} role="alert">알림 설정을 불러오지 못했습니다.</p>;
  }

  return (
    <section className={s.card} aria-label="알림 설정">
      <h2 className={s.title}>알림 설정</h2>
      <p className={s.sub}>받고 싶은 알림만 켜 두세요. 변경은 저장 후 적용됩니다.</p>
      <ul className={s.list}>
        {LABELS.map((item) => (
          <li key={item.key} className={s.row}>
            <label className={s.label}>
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={() => toggle(item.key)}
                disabled={busy}
              />
              <span>
                <b>{item.label}</b>
                <span className={s.note}>{item.note}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {notice ? <p className={s.notice} role="status">{notice}</p> : null}
      {error ? <p className={s.error} role="alert">{error}</p> : null}
      <Button variant="primary" size="sm" disabled={busy} onClick={() => void save()}>
        {busy ? '저장 중' : '알림 설정 저장'}
      </Button>
    </section>
  );
}

/* 프로필 이미지 — 비공개 버킷에 올리고 고정 공개 경로(/uploads/:id/avatar)를 저장한다. */
import { useEffect, useRef, useState } from 'react';
import { Button, LoadingState } from '@/components/ui';
import { useSession } from '@/app/session';
import { API_BASE_PATH, ApiRequestError, apiRequest } from '@/lib/api';
import s from './LiveProfileImage.module.css';

type Role = 'CLIENT' | 'SUPPLIER';
type State = 'loading' | 'ready' | 'error';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];

export function LiveProfileImage({ role }: { role: Role }) {
  const { apiAccessToken } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>('loading');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const operation = role === 'CLIENT' ? 'getMyClientProfile' : 'getMySupplierProfile';
    const path = role === 'CLIENT' ? '/me/client-profile' : '/me/supplier-profile';
    setState('loading');
    apiRequest(operation, path, { accessToken: apiAccessToken, signal: controller.signal })
      .then((response) => {
        setImageUrl(response.data?.profileImageUrl ?? null);
        setState('ready');
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, [apiAccessToken, role]);

  const upload = async (file: File) => {
    if (busy) return;
    setError(null);
    setNotice(null);
    if (!ALLOWED.includes(file.type)) {
      setError('png·jpg·jpeg·webp 이미지만 올릴 수 있습니다.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('프로필 이미지는 5MB 이하만 올릴 수 있습니다.');
      return;
    }

    setBusy(true);
    try {
      const presign = await apiRequest('presignUpload', '/uploads/presign', {
        method: 'POST',
        accessToken: apiAccessToken,
        jsonBody: {
          purpose: 'PROFILE_IMAGE',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      });
      const uploaded = await fetch(presign.data.uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type },
        body: file,
      });
      if (!uploaded.ok) throw new Error('UPLOAD_FAILED');

      const nextUrl = `${window.location.origin}${API_BASE_PATH}/uploads/${encodeURIComponent(presign.data.fileId)}/avatar`;
      if (role === 'CLIENT') {
        await apiRequest('updateClientProfile', '/me/client-profile', {
          method: 'PATCH',
          accessToken: apiAccessToken,
          jsonBody: { profileImageUrl: nextUrl },
        });
      } else {
        await apiRequest('updateSupplierProfile', '/me/supplier-profile', {
          method: 'PATCH',
          accessToken: apiAccessToken,
          jsonBody: { profileImageUrl: nextUrl },
        });
      }
      setImageUrl(nextUrl);
      setNotice('프로필 이미지를 바꿨습니다.');
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : '프로필 이미지를 올리지 못했습니다.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (state === 'loading') return <LoadingState label="프로필 이미지를 불러오는 중입니다." compact />;
  if (state === 'error') return <p className={s.error} role="alert">프로필 이미지를 불러오지 못했습니다.</p>;

  return (
    <section className={s.card} aria-label="프로필 이미지">
      <h2 className={s.title}>프로필 이미지</h2>
      <div className={s.row}>
        {imageUrl ? (
          <img className={s.avatar} src={imageUrl} alt="프로필 이미지" width={64} height={64} />
        ) : (
          <span className={s.placeholder} aria-hidden="true">IMG</span>
        )}
        <div>
          <input
            ref={inputRef}
            className={s.input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label="프로필 이미지 파일 선택"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <Button
            variant="tint"
            size="sm"
            disabled={busy}
            disabledReason={busy ? '업로드 중입니다' : undefined}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? '올리는 중' : imageUrl ? '이미지 바꾸기' : '이미지 올리기'}
          </Button>
          <p className={s.note}>png·jpg·jpeg·webp · 5MB 이하</p>
        </div>
      </div>
      {notice ? <p className={s.notice} role="status">{notice}</p> : null}
      {error ? <p className={s.error} role="alert">{error}</p> : null}
    </section>
  );
}

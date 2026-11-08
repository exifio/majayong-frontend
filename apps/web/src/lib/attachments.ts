import type { PresignUploadRequestDto } from '@majayong/types/api';
import { apiRequest } from './api';

/** 서버(`files` 모듈)가 허용하는 확장자. 확장자와 MIME이 함께 맞아야 업로드 URL을 받는다. */
export const ALLOWED_UPLOAD_EXTENSION = /\.(png|jpe?g|webp|pdf|zip|mp4|txt)$/i;
const MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  pdf: 'application/pdf',
  zip: 'application/zip',
  mp4: 'video/mp4',
  txt: 'text/plain',
};

export function mimeOf(file: File): string {
  if (file.type.trim().length > 0) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXTENSION[ext] ?? 'application/octet-stream';
}

type UploadTarget =
  | { purpose: 'SUPPORT_INQUIRY'; inquiryId?: string }
  | { purpose: 'DELIVERY'; contractId: string };

export interface UploadedFile {
  fileId: string;
  name: string;
  size: number;
  mimeType: string;
}

/** POST /uploads/presign으로 받은 URL에 파일을 PUT한다. 실패하면 예외를 던지고 fileId를 돌려주지 않는다. */
export async function uploadWithPresign(file: File, target: UploadTarget, accessToken: string): Promise<UploadedFile> {
  const mimeType = mimeOf(file);
  const jsonBody = { ...target, fileName: file.name, fileSize: file.size, mimeType } as PresignUploadRequestDto;
  const presign = await apiRequest('presignUpload', '/uploads/presign', {
    method: 'POST',
    accessToken,
    jsonBody,
  });
  const upload = await fetch(presign.data.uploadUrl, {
    method: 'PUT',
    headers: { 'content-type': mimeType },
    body: file,
  });
  if (!upload.ok) throw new Error('ATTACHMENT_UPLOAD_FAILED');
  return { fileId: presign.data.fileId, name: file.name, size: file.size, mimeType };
}

/** 문의 첨부를 서명 다운로드 URL로 열어 준다. 파일 ID는 문의 응답의 첨부에서 온다. */
export async function openAttachment(fileId: string, accessToken: string): Promise<void> {
  const response = await apiRequest('presignDownload', `/uploads/${encodeURIComponent(fileId)}/download`, {
    accessToken,
  });
  const anchor = document.createElement('a');
  anchor.href = response.data.downloadUrl;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.click();
}

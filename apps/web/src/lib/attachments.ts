import { apiRequest } from './api';

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

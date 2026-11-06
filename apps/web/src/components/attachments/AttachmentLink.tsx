import { openAttachment } from '@/lib/attachments';

/** 문의 첨부 이름. fileId가 있으면 서명 다운로드 URL을 열고, 없으면 이름만 보여 준다. */
export function AttachmentLink({
  fileId,
  name,
  accessToken,
  className,
}: {
  fileId?: string;
  name: string;
  accessToken: string;
  className?: string;
}) {
  if (fileId === undefined) return <span>{name}</span>;
  return (
    <button type="button" className={className} onClick={() => void openAttachment(fileId, accessToken)}>
      {name}
    </button>
  );
}

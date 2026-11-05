/* 운영자 화면의 ?mock 결과가 실제 저장으로 오인되지 않게 알린다. */
import { Band } from '@/components/ui';

const TEXT = {
  title: '시연 상태',
  body: '이 화면의 결과는 서버에 저장되지 않았습니다. 실제 처리는 운영자 API 연동(BE-05) 후 반영됩니다.',
} as const;

export function AdminDemoNotice() {
  return (
    <div role="note">
      <Band tone="warn" title={TEXT.title}>{TEXT.body}</Band>
    </div>
  );
}

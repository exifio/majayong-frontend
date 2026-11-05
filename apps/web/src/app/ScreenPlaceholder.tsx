/* 화면 자리 — 각 pages/<공간>/<보드>.tsx 가 처음에 그리는 내용.
 * 보드 이름 · 경로 · 채울 마일스톤 · 보드의 상태(Tweak) 목록을 보여 주고, ?mock=<상태>로 상태를 고른다.
 * 실제 화면을 만들면 이 컴포넌트를 지우고 그 자리를 채운다. */
import { useSearchParams } from 'react-router-dom';
import { SCREENS } from './routes';
import { Chip, Info, Tabs } from '@/components/ui';
import { PageHeader } from '@/components/layout/Chrome';

export function ScreenPlaceholder({ board, inModal = false }: { board: string; inModal?: boolean }) {
  const screen = SCREENS.find((x) => x.board === board);
  const [params, setParams] = useSearchParams();
  if (!screen) return <p>알 수 없는 보드: {board}</p>;
  const state = params.get('mock') ?? screen.states[0] ?? '';
  const file = `src/pages/${screen.space}/${screen.board}.tsx`;

  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} data-screen={screen.board}>
      {screen.states.length > 0 && (
        <Tabs label="보드 상태" value={state} items={screen.states.map((t) => ({ key: t, label: t }))}
          onChange={(k) => { const p = new URLSearchParams(params); p.set('mock', k); setParams(p, { replace: true }); }} />
      )}
      <Info>
        캔버스 보드 <strong>{screen.board}</strong>{screen.kind === 'modal' ? ` · ?modal=${screen.modal}` : ''} — 이 화면은 {screen.milestone}에서 채웁니다.
        파일: <code>{file}</code>
      </Info>
    </div>
  );

  if (inModal) return body;
  return (
    <>
      <PageHeader title={screen.name} chip={<Chip tone="outline">{screen.milestone}</Chip>} description={`보드 ${screen.board} · ${screen.path}`} />
      {body}
    </>
  );
}

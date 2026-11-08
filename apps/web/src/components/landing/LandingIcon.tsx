/* 랜딩 아이콘 — 디자인 캔버스 Main · Supplier-Landing의 24px 선 아이콘 경로를 그대로 옮겼다. 장식이라 aria-hidden. */
import type { ReactElement } from 'react';

const PATHS = {
  specCheck: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 14l2 2 3.5-4" /></>,
  inbox: <><path d="M4 13l2.5-8h11L20 13v6H4z" /><path d="M4 13h5l1 2h4l1-2h5" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 10h8" /></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v2" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  doc: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 12h5M10 16h5" /></>,
  eye: <><path d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12z" /><circle cx="12" cy="12" r="2.5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></>,
  list: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h4" /></>,
  won: <><circle cx="12" cy="12" r="9" /><path d="M7.5 9l2 6.5 2.5-5 2.5 5 2-6.5" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
} satisfies Record<string, ReactElement>;

export type LandingIconName = keyof typeof PATHS;

export function LandingIcon({ name }: { name: LandingIconName }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{PATHS[name]}</svg>;
}

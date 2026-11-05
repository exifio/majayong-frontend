/* apiRequest ↔ SessionProvider 사이의 갱신 연결.
 * SessionProvider가 등록한 갱신 함수는 동시 요청을 하나의 refresh로 합친다. */
export type RefreshHandler = () => Promise<string | null>;

let handler: RefreshHandler | null = null;

export function registerRefreshHandler(next: RefreshHandler | null): void {
  handler = next;
}

export function refreshAccessToken(): Promise<string | null> {
  return handler ? handler() : Promise.resolve(null);
}

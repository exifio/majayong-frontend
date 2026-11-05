import { Link } from 'react-router-dom';

/** Production fallback for screens that only have live data when authenticated. */
export function AuthRequired() {
  return (
    <div style={{ padding: 24 }}>
      <p role="status">로그인이 필요합니다.</p>
      <Link to="/?modal=login">로그인</Link>
    </div>
  );
}

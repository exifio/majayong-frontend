/* 공통 푸터 — 디자인 시스템 9절 · PRD F-25
 * 모달 · 드롭다운 · 운영자 화면을 뺀 모든 페이지 하단. 내용이 짧아도 화면 맨 아래(.mj-page).
 * 사업자 정보는 예시값(PRD 13.4) — 실서비스 전에 바꾼다. */
import { Link } from 'react-router-dom';
import { DEMO } from '@/mocks/demo';
import s from './layout.module.css';

const BIZ = {
  company: DEMO.operator.company,
  ceo: '대표 홍길동(예시)',
  regNo: '사업자등록번호 000-00-00000(예시)',
  mailOrder: '통신판매업 신고 제2026-서울-0000호(예시)',
  address: '서울특별시 예시구 예시로 00(예시)',
};

export function Footer() {
  return (
    <footer className={s.footer} data-footer>
      <div className="mj-container">
        <div className={s.footTop}>
          <div className={s.footBrand}>
            <Link to="/" className="" style={{ fontSize: 19, fontWeight: 600, color: 'var(--slate-900)', textDecoration: 'none' }}>마자용</Link>
            <p>그려 드린 화면을 고치면 외주 명세가 완성됩니다.</p>
          </div>
          <div className={s.footCols}>
            <div className={s.footCol}>
              <h3>서비스</h3>
              <ul>
                <li><Link to="/#how">작동 방식</Link></li>
                <li><Link to="/#safety">안전장치</Link></li>
                <li><Link to="/#cost">비용</Link></li>
                <li><Link to="/supplier">공급자 안내</Link></li>
              </ul>
            </div>
            <div className={s.footCol}>
              <h3>고객센터</h3>
              <ul>
                <li><Link to="/help">자주 묻는 질문</Link></li>
                <li><Link to="/help?tab=notice">공지사항</Link></li>
                <li><Link to="/help/inquiry">1:1 문의</Link></li>
              </ul>
            </div>
            <div className={s.footCol}>
              <h3>정책</h3>
              <ul>
                <li><Link to="/terms/terms">이용약관</Link></li>
                <li><Link to="/terms/privacy" className={s.strong}>개인정보 처리방침</Link></li>
                <li><Link to="/terms/nda">명세 비밀유지</Link></li>
                <li><Link to="/terms/broker">중개자 고지</Link></li>
              </ul>
            </div>
            <div className={s.footCol}>
              <h3>고객센터 연락처</h3>
              <ul>
                <li>{DEMO.operator.phone}</li>
                <li>{DEMO.operator.email}</li>
                <li>평일 10:00–18:00</li>
              </ul>
            </div>
          </div>
        </div>
        <div className={s.footBottom}>
          <p className={s.bizInfo}>
            <span>{BIZ.company}</span><span>{BIZ.ceo}</span><span>{BIZ.regNo}</span><span>{BIZ.mailOrder}</span><span>{BIZ.address}</span>
          </p>
          <p>마자용은 통신판매중개자로서 거래 당사자가 아니며, 공급자와 의뢰인 사이의 거래와 결과물에 대한 책임은 각 거래 당사자에게 있습니다.</p>
          <p className={s.copyright}>© 2026 {BIZ.company}</p>
        </div>
      </div>
    </footer>
  );
}

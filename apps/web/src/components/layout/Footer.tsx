/* 공통 푸터 — 디자인 시스템 9절 · 디자인 보완 1104 Part 1-C · PRD F-25
 * 모달 · 드롭다운 · 운영자 화면을 뺀 모든 페이지 하단. 내용이 짧아도 화면 맨 아래(.mj-page).
 * 3줄: ① 로고 + 한 줄 소개 / 고객센터 안내 ② 링크 그룹 3개 한 줄 ③ 사업자 정보 2줄 + 저작권, 중개자 고지.
 * 디자인의 전화 · 이메일 · 사업자 값은 예시값(PRD 13.4)이라 승인된 값이 올 때까지 '준비 중'으로 둔다. */
import { Link } from 'react-router-dom';
import { DEMO } from '@/mocks/demo';
import { LogoMark } from './LogoMark';
import s from './layout.module.css';

const BIZ_LINES = [
  [`상호 ${DEMO.operator.company}`, '대표자 정보 준비 중', '사업자등록번호 준비 중', '통신판매업 신고 준비 중'],
  ['사업장 주소 준비 중', '개인정보 보호책임자 준비 중', '고객센터 이메일 준비 중'],
];

const LINK_GROUPS: { title: string; links: { to: string; label: string; strong?: boolean }[] }[] = [
  { title: '서비스', links: [{ to: '/', label: '의뢰인 안내' }, { to: '/supplier', label: '공급자 안내' }] },
  {
    title: '고객센터',
    links: [{ to: '/help', label: '자주 묻는 질문' }, { to: '/help/inquiry', label: '1:1 문의' }, { to: '/help?tab=notice', label: '공지사항' }],
  },
  {
    title: '정책',
    links: [
      { to: '/terms/terms', label: '이용약관' },
      { to: '/terms/privacy', label: '개인정보 처리방침', strong: true },
      { to: '/terms/nda', label: '명세 비밀유지' },
      { to: '/terms/broker', label: '중개자 고지' },
    ],
  },
];

export function Footer() {
  return (
    <footer className={s.footer} data-footer>
      <div className="mj-container">
        <div className={s.footTop}>
          <div className={s.footBrand}>
            <Link to="/" className={s.footLogo} aria-label="마자용 처음으로">
              <LogoMark />
              <span>마자용</span>
            </Link>
            <p>소상공인을 위한 웹 외주 요구사항 정의 · 매칭 플랫폼</p>
          </div>
          <div className={s.footCs}>
            <b>고객센터</b>
            <span>평일 10:00–18:00</span>
            <span>점심 12:00–13:00 · 주말 · 공휴일 휴무</span>
            <Link to="/help/inquiry">문의 접수</Link>
          </div>
        </div>
        <nav className={s.footNav} aria-label="사이트 링크">
          {LINK_GROUPS.map((g) => (
            <div key={g.title} className={s.footGroup}>
              <h3>{g.title}</h3>
              <ul>
                {g.links.map((l) => (
                  <li key={l.to}><Link to={l.to} className={l.strong ? s.strong : undefined}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className={s.footBottom}>
          <div className={s.bizInfo}>
            {BIZ_LINES.map((line) => (
              <p key={line[0]}>{line.map((item) => <span key={item}>{item}</span>)}</p>
            ))}
          </div>
          <p className={s.copyright}>© 2026 {DEMO.operator.company}. All rights reserved.</p>
          <p className={s.brokerNote}>마자용은 통신판매중개자로서 거래 당사자가 아니며, 공급자와 의뢰인 사이의 거래와 결과물에 대한 책임은 각 거래 당사자에게 있습니다.</p>
        </div>
      </div>
    </footer>
  );
}

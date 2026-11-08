# DESIGN.md — 현재 React와 claude-front v0.2.1 디자인의 최소 통합 규칙

> **작업본 안내:** 원본 자료집의 FE 기준은 `f9427a9`입니다. 현재 작업본의 코드 차이·경로·누락 자료는 [프론트엔드 작업 시작 안내](FRONTEND_WORKSPACE.md)를 먼저 확인하세요. 원본의 과거 진단과 미실행 상태를 현재 사실로 단정하지 않습니다.


> 버전 v0.7.3 · 2026-11-05 (KST) · 디자인 `4360783`, FE `f9427a9` · **소스·보드 기준 분석이며 렌더링 픽셀 전수 검증 전**
>
> **56개 또는 57개를 통째로 새로 만들지 않습니다.** 디자인 보드 57개 중 React 이름 대응 53개를 **재사용**, 새 화면은 사용자·운영자 1:1 문의 **2개**, 알림 2개는 공통 드롭다운을 수정합니다.

## 1. 디자인과 실제 구현을 매칭하는 규칙

- **디자인 기준**: `claude-front/docs/boards/<보드>.dc.html` (보드/상태), `docs/디자인-시스템-v0.2.1-최종본.md`(공통 규격), `docs/변경사항-1104.md`, `docs/디자인-보완-1104.md`, `docs/결정메모-프론트엔드-착수-기준.md`.
- **구현 기준**: `apps/web/src/pages/<공간>/<보드>.tsx` + `.data.ts` + `.module.css`, `app/routes.ts`, `components/layout/**`, `components/ui/**`, `styles/tokens.css`.
- **서버 기준**: API v1.0.1 `POST /api/v1/...`, 보존된 역할/소유권/응답 형식. 보드에 오래된 `/api/c`, `/api/s` 경로가 써 있어도 그대로 호출하지 않습니다.
- 57개 화면 전체의 A/B/C/D 분류·원본 파일 경로·현재 React/사용 API는 **`FRONTEND_SCREEN_MATRIX.md`가 단일 인벤토리**입니다. 이 문서에는 공통 디자인 규칙과 변경 대상만 기재해 중복 수정 지시를 줄입니다.

## 2. 디자인 시스템 원칙 — 이미 구현된 것은 유지

| 속성 | 기준 | 변경 위치 |
|---|---|---|
| 브랜드 | `--navy-900: #0B2545`, `--navy-700: #12325A`, `--blue-600: #2563EB` | 현재 FE `styles/tokens.css`에 **이미 존재**, 재정의 금지 |
| 상태색 | 완료 teal, 위험/기한 amber, 폼 오류·미확인 점 red | 기존 공통 `Chip`, `Band`, `StatusChip` 재사용 |
| 글자·간격 | 기존 Pretendard 및 4px 간격 체계, 본문 최소 읽을 수 있는 대비 | 기존 스타일 확인 후 차이만 수정 |
| 컨테이너 | 데스크톱 1440 기준 중앙 1280, 1024~1439 유동 32px, 768~1023 24px, 모바일 768 미만 16px | `tokens.css`와 각 레이아웃; 기존 브레이크포인트 보존 |
| 모바일 | 390px 필수 화면 점검; 고정 하단·2분할은 협소한 화면에서 축약/탭 전환 | 보드/실제 React별 확인 |
| 버튼 | 화면의 핵심 파란 버튼 1개, 취소·경고는 의미가 다른 버튼 | 기존 `Button.tsx` 우선 사용 |
| 모달 | 기존 `Modal.tsx`와 부모 `?modal=` 경로; 뒤로 가기 시 닫기 | `App.tsx`/`routes.ts` 동작 보존 |
| 운영자 | 1024 미만에서는 데스크톱 안내, 역할별 메뉴·상태 아이콘 구분 | `Shell`·`Chrome` 유지, 메뉴만 필요 변경 |

## 3. 공통 변경을 화면마다 반복하지 않기

### 3.1 푸터 · 헤더 · 메뉴 (FE-05)

- **푸터**: 기존 `Footer.tsx`는 이전 밝은 배경/열 구성. 11/04 시안은 navy-900 바탕, 3줄 분류, 마지막 띠/운영자 연락처 위치 조정. **`Footer.tsx`+`layout.module.css`만 먼저 수정**해 영향을 받는 모든 페이지에 반영하고 개별 45개 화면을 편집하지 않습니다.
- `Main` 메뉴: `서비스 소개 #value`, `진행 과정 #how`, `안전장치 #safe`; 공급자 랜딩: `견적 방식 #how`, `진행 과정 #flow`, `정산 방식 #price` (2026-11-08 랜딩 v3 섹션에 맞춰 이름 변경). 메뉴와 섹션 ID는 `menus.ts`와 각 랜딩에서 함께 바꿉니다.
- `Terms`는 `routes.ts`에서 shell `public → viewer`. 로그인 여부에 따른 GNB는 이미 `Shell`/`Chrome`이 맡습니다. 약관 내용 자체는 법률 검토 전 초안입니다.
- Admin 메뉴: 신고 처리 아래 `1:1 문의`를 추가. 실제 권한 admin guard 필수. GNB 네비를 개별 페이지가 따로 그리지 않습니다.
- 알림은 기존 `Chrome.tsx` 드롭다운의 실API 호출·읽음 처리를 보존하고, 문의 답변 링크 `'/help/inquiry?tab=my&id=...'`만 추가합니다. Notify-Client/Supplier를 별도 라우트로 만들지 않습니다.

### 3.2 공통 네트워크 상태

- `loading` = 명확한 진행 상태/중복 클릭 차단; `empty` = 진짜 빈 서버 목록(샘플 목록 임의 삽입 금지); `error` = `error.code,message`에 따라 안내와 재시도; `success` = 실제 `data` 필드; `blocked` = 권한·NDA·기한 미충족에 따른 이유 설명.
- 서버에서 받은 ID(`draftId/projectId/specItemId/applicationId/contractId/inquiryId`)만 다음 화면으로 전달. 화면 경로의 가상 `p-ondo`/`c-ondo` 등을 실제 사용자 기본값으로 사용하지 않습니다.
- 날짜·금액·태그는 서버와 화면 규칙을 분리. 임의로 계약 상태 `COMPLETED`/예치 `COMPLETED`/지급 `DEPOSITED`를 혼용하지 않습니다.

## 4. 변경할 주요 화면/상태

| 보드 / 실제 URL | 기존 구현 | 디자인·동작 변경 | API/보호 |
|---|---|---|---|
| `Help` `/help` | FAQ·문의 작성 상태 하나의 컴포넌트 | FAQ 14개(11/04 기준), 공지/빠른 주제/0건 수정, 문의 버튼은 신규 화면으로 | FAQ 정적, 문의는 별도 `/support/inquiries` |
| **`Help-Inquiry` `/help/inquiry`** | 현재 `Help.tsx` 재사용 | **신규 UI**: 문의하기 / 내 문의 `?tab=my` / 상세 `?id=` / 보내고 최근 문의 선택 / 비로그인 안내 | `POST/GET /support/inquiries`, `GET /support/inquiries/{inquiryId}`; 세션·소유권 |
| **`Admin-Inquiries` `/admin/inquiries`** | React 대응 TSX 없음 | **신규 UI**: 답변 대기/완료, 2열 목록+상세, 단일 주 버튼 '답변 보내기', 답변 시 완료 배너 | `GET /admin/support/inquiries`, `POST /admin/support/inquiries/{inquiryId}/answer`. 별도 admin 상세 GET는 미확정 |
| `Main` `/` | 기본 영웅·정적 화면 | 3장면(9초 반복), 가치 카드, 흐름도, `#how/#safe/#start` | 실제 결제 성공처럼 표현 금지 |
| `Supplier-Landing` `/supplier` | 정적 예시·기존 anchor | 3장면+가치 카드, `#how/#flow/#price` | 실제 지급 자동화를 완료된 기능처럼 안내 금지 |
| `Terms` `/terms/:doc` | public shell | viewer shell + 고객센터 1:1 안내 | 정책 문구·가입 동의 버전 연동 검증 |
| `Notify-Client` / `Notify-Supplier` | 공통 알림 드롭다운(실API) | 문의 답변 알림 행·링크, 읽음·모두 읽음 유지 | `/me/notifications`, `targetUrl` |
| `Account-Client` `/c/account` | DEMO 기반 | 증빙 정보 변경 모달, 성공 후 상태 분기 | `PATCH /me/client-tax-info` |
| `Account-Supplier` `/s/account` | DEMO 기반 | 정산계좌 1원 인증 다음 상태; **실제 발송 API 없는 항목은 차단/보류** | `PATCH /me/payout-account`, `POST /me/payout-account/verify` |
| `Admin-Blocks/Disputes/Reports` | 보드 상태/DEMO | 성공 버튼 뒤 상태들 11/04 디자인 보완 | 기존 `/admin/**`만 사용, 무증거 성공 금지 |
| `Inspect-Client`/`Deliver-Supplier` | DEMO 화면 | 보완/도움/납품 뒤 결과 화면 | 실제 API 승인·보완 요청의 결과 확인 |
| `Signup`/`Signup-Role`/`Signup-Client`/`Signup-Supplier` | 입력·체크 UX 존재, **이메일 가입 API 호출 없음** | 공란·동의 직접 선택, 역할/프로필 실제 API 후 이동 | `POST /auth/register`, `PATCH /me/client-profile` 또는 `PATCH /me/supplier-profile` 등 실제 필드 |
| `Reset` | `?mock` 상태·초기 DEMO 값 | 빈 입력, 메일 요청/토큰 확인/오류 상태 | `POST /auth/password-reset/request`, `/confirm` |
| `Contracts-Client/Supplier`/`Settle-*` | 시연 data 위주 | 서버 실제 계약/정산 상태로 표시, 시연 전용은 표시 | `/me/contracts`, `/me/payment-statements` |
| `Escrow-Client` | `LiveEscrow` 계약 조회만 | 결제 OFF·PENDING 상태, PG 성공은 서버 검증 뒤에만 | Toss P0 계약, PAY-01~06 |

## 5. 화면 수정 A/B/C/D 적용 원칙

- **A 27개**: 별도 디자인 변경이 확인되지 않아 **유지 후보**. 디자인 픽셀 동일이라고 단정하지 않음. 인증/실데이터 검증은 별도 기능 TASK에서 한다.
- **B 23개**: 기존 React 파일을 그대로 사용하고 스타일/상태/필요한 API만 국소 변경. API 변경이 없는 CSS 수정으로 BE 작업을 생성하지 않는다.
- **C 2개**: `Help-Inquiry`, `Admin-Inquiries`만 신규 React 컴포넌트·data·CSS/인접 테스트.
- **D 5개**: 화면 기존 구현 유지, 취소 철회/선택 PG·운영자 확장 등 보류. 보류를 '정상 완성'으로 표시하지 않는다.

## 6. 디자인 비교 및 최소 검증 기준

1. 기준 고정: `claude-front/docs/boards/<Screen>.dc.html` 렌더 + 현재 React의 동등 역할/상태(가능하면 1440, 390) 나란히 비교. 비교 증거·차이·수정 파일을 해당 TASK에 기록.
2. 먼저 공통 컴포넌트(`Footer/menus/Chrome/Chip`) 차이 해결. 그 뒤 해당 B 보드만 조정, 전체 스타일 갈아엎기 금지.
3. 각 변경 후 `pnpm typecheck`, 필요 빌드, 변경된 컴포넌트의 **한국어 인접 테스트**와 수동 주요 클릭 확인. 서버 연동시 역할·오류 재현 1개.
4. **데모 시연값과 실제 값 구분**, 정책 초안·결제 OFF·오류 메시지의 사실 정확성 확인. 전체 57 화면의 ‘정적 코드 분류’와 ‘실시된 시각 비교’ 완료 여부를 다르게 기록.

참고: [11/04 디자인 변경](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/변경사항-1104.md) · [디자인 보완](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/디자인-보완-1104.md) · [최종 디자인 시스템](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/디자인-시스템-v0.2.1-최종본.md) · [FE 라우트](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/app/routes.ts).

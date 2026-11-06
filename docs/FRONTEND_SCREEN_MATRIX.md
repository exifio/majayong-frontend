# FRONTEND_SCREEN_MATRIX — 57개 디자인 보드 대응/수정 판단

> **작업본 안내:** 원본 자료집의 FE 기준은 `f9427a9`입니다. 현재 작업본의 코드 차이·경로·누락 자료는 [프론트엔드 작업 시작 안내](FRONTEND_WORKSPACE.md)를 먼저 확인하세요. 원본의 과거 진단과 미실행 상태를 현재 사실로 단정하지 않습니다.


> 작성: 2026-11-05 (KST) · **코드 정적 비교, 브라우저 시각·API 실HTTP 미검증** · FE `f9427a9`, BE `a188fb2`, 디자인 `4360783`
>
> **A=유지 후보, B=기존 React 수정, C=신규 React 화면, D=기존 화면 유지·신규 변경 보류**. A는 픽셀 동일 판정이 아니라, 11/04 개별 변경이 확인되지 않은 재사용 후보라는 뜻입니다. API 연동 여부는 별도 열로 구분합니다.

## 화면 수 기준 및 집계

- 디자인 사용 보드: **57** (`docs/boards/*.dc.html`, `_discarded` 4개 제외).
- 현재 React의 일반 화면 TSX: **54개**. 이 중 디자인 보드와 이름 일치 **53개**, 보드에는 없는 `public/GoogleCallback.tsx` 1개.
- 일치하지 않는 디자인 보드 4개: **Admin-Inquiries, Help-Inquiry(신규 화면)**와 **Notify-Client, Notify-Supplier(기존 `Chrome.tsx` 공통 드롭다운으로 이미 처리)**.
- React `SCREENS` 등록은 **55개**(이 중 드롭다운 2개; 화면 파일은 53개). 현재 `/help/inquiry`는 새 화면이 아닌 기존 `Help` 컴포넌트를 재사용하는 별도 라우트입니다.
- 아래 분류 집계는 **현재 문서에서 제안한 개발 우선순위별 잠정 분류**이며, 시각 대조 후 작은 조정이 가능합니다.

| 구분 | 화면 수 | 의미 |
| --- | ---: | --- |
| A | 27 | 현 화면 유지, 필요 시 국소 미세조정 |
| B | 23 | React 컴포넌트 유지 후 디자인·상태·연동 일부 수정 |
| C | 2 | 신규 화면 컴포넌트 필요 |
| D | 5 | 화면 유지, 미지원 확장 기능 보류 |

> API 열의 “실API”는 **코드에 호출/연결 경로가 존재한다는 뜻**이지 실HTTP 성공이나 배포 정상 확인이 아닙니다. “시연/정적”은 API 작업이 필요할 수 있음을 뜻하며, 분류 A와 무관합니다.

## 57개 화면 비교표

| # | 디자인 보드/라우트 | 현재 React 상태 | 확인된 차이·보존/수정 포인트 | API 연동/현행 계약 | 분류 | 난이도 | 우선순위 |
| ---: | --- | --- | --- | --- | :---: | :---: | :---: |
| 1 | `Account-Client`<br>`/c/account` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 증빙 정보 변경 모달 추가(보완 1-1); 현재 계정 화면 DEMO 기반 | PATCH /me/client-tax-info | **B** | 중 | P1 |
| 2 | `Account-Supplier`<br>`/s/account` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 계좌 변경·인증 뒤 상태(보완 1-2); 인증 발송 API는 현행 명세에 없음 | PATCH /me/payout-account · POST /me/payout-account/verify | **B** | 중 | P1 |
| 3 | `Admin-Blocks`<br>`/admin/blocks` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 승인·병합·단가·비활성 처리 후 결과 상태(보완 1-5) | POST /admin/blocks/{blockId}/actions | **B** | 중 | P2 |
| 4 | `Admin-Disputes`<br>`/admin/disputes` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 판정 선택지별 완료 화면 보완(보완 1-7) | POST /admin/inspection-requests/{id}/decision | **B** | 중 | P2 |
| 5 | `Admin-Events`<br>`/admin/events` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) · 기존 구현 유지/추가 변경 보류 | 기존 이벤트 기록 UI는 DEMO; 신규 디자인 요구 적음, 실연동은 후순위 | GET /admin/event-logs | **D** | 중 | P2 |
| 6 | `Admin-Inquiries`<br>`/admin/inquiries` | React 대응 페이지 없음 (보드는 존재) | 11/04 신규 운영자 1:1 문의 보드, React 대응 페이지·운영자 메뉴 없음 | GET /admin/support/inquiries · POST /admin/support/inquiries/{id}/answer | **C** | 중 | P1 |
| 7 | `Admin-Payments`<br>`/admin/payments` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) · 기존 구현 유지/추가 변경 보류 | 기존 운영자 결제 모니터 화면은 DEMO; Toss P0 이후 검증 | GET /admin/deposits/held | **D** | 중 | P2 |
| 8 | `Admin-Refunds`<br>`/admin/refunds` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) · 기존 구현 유지/추가 변경 보류 | 운영자 수동 처리 UI는 DEMO; 실정산 운영·시연 정책 확정 전 보류 | POST /admin/contracts/{id}/settlement/mark-processed | **D** | 중 | P2 |
| 9 | `Admin-Reports`<br>`/admin/reports` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 문제 없음/경고/정지 후 표시 분기(보완 1-6) | POST /admin/reports/{reportId}/resolve | **B** | 중 | P2 |
| 10 | `Agreement-Client`<br>`/c/chat/:pid/:sid/agreement` | 실API 미리보기/확정(플래그) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 11 | `Apps-Supplier`<br>`/s/applications` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 12 | `Cancel-Client`<br>`/c/contracts/:cid/cancel` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) · 기존 구현 유지/추가 변경 보류 | 11/04 취소 철회는 API v1.0.1 미구현. 기존 취소 UI 유지·신규 철회 보류 | 기존 /contracts/{id}/cancellation 는 존재 | **D** | 중 | P2 |
| 13 | `Cancel-Supplier`<br>`/s/contracts/:cid/cancel` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) · 기존 구현 유지/추가 변경 보류 | 취소 철회 관련 파생 동작은 API 미구현. 기존 취소 이의·동의 UI 보존 | /cancellation/agree · /object 존재 | **D** | 중 | P2 |
| 14 | `Chat-Client`<br>`/c/chat/:pid/:sid` | 실API 채팅(분기) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 15 | `Chat-Supplier`<br>`/s/chat/:pid` | 실API 채팅(분기) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 16 | `Compare-Client`<br>`/c/projects/:pid/proposals` | 실API 지원자 목록(분기) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 17 | `Confirm-Client`<br>`/c/drafts/:did/confirm` | 실API 명세 확정 호출 | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 18 | `Contract-Client`<br>`/c/contracts/:cid` | 실API 문서/서명(플래그) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 19 | `Contract-Supplier`<br>`/s/contracts/:cid` | 실API 문서/서명(플래그) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 20 | `Contracts-Client`<br>`/c/contracts` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 현재 페이지는 시연 data만 렌더; 계약 카드 실제 조회 연결 및 결제 상태 보호 필요 | GET /me/contracts | **B** | 상 | P1 |
| 21 | `Contracts-Supplier`<br>`/s/contracts` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 현재 페이지는 시연 data만 렌더; 계약 목록 API 연동 필요 | GET /me/contracts | **B** | 상 | P1 |
| 22 | `Deliver-Supplier`<br>`/s/contracts/:cid/deliver` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 도움 요청 뒤/재제출 상태(보완 1-9); 현재 DEMO 화면 | POST /installments/{id}/deliveries · 보완/이견 | **B** | 중 | P1 |
| 23 | `Draft-Client`<br>`/c/drafts/:did` | 실API 초안 | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 24 | `Escrow-Client`<br>`/c/contracts/:cid/escrow` | 실API 계약 상태 조회만 · 결제 OFF | 실계약 조회 코드는 있지만 Toss 결제창/승인/복구 없음. 완료 문구는 검증 필요 | POST /contracts/{id}/deposits ≠ PG 승인 | **B** | 상 | P0 |
| 25 | `Find-Supplier`<br>`/s/projects` | 실API 프로젝트 목록(분기) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 26 | `Help-Inquiry`<br>`/help/inquiry` | React 대응 페이지 없음 (보드는 존재) | 11/04 신규 사용자 1:1 문의 보드. 기존 /help/inquiry는 Help.tsx 재사용 | POST/GET /support/inquiries · GET /support/inquiries/{id} | **C** | 중 | P1 |
| 27 | `Help`<br>`/help` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 FAQ 14개·1:1 분리·공지. 현재 Help는 문의 폼 자체 포함, 빠른 검색 불일치 보고 | 고객센터 FAQ 자체 데이터 / 문의 API 별도 | **B** | 하 | P1 |
| 28 | `Home-Client`<br>`/c` | 실API 데이터 호출 | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 29 | `Home-Supplier`<br>`/s` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 30 | `Input-Client`<br>`/c/drafts/new` | 실API 초안 시작 | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 31 | `Inspect-Client`<br>`/c/contracts/:cid/inspect` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 보완/도움 요청 뒤 상태(보완 1-8); 현재 DEMO 화면 | POST /contract-items/{id}/approve · /rework-requests | **B** | 중 | P1 |
| 32 | `Login`<br>`/?modal=login (또는 /supplier?modal=login)` | 실API 로그인 | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 33 | `Main`<br>`/` | React 화면 존재(실API 호출 미확인) | 11/04 랜딩 3장면·가치 카드/flow; 현재 Main.data는 기본 1상태 | 정적 랜딩, 결제 문구 검증 필요 | **B** | 상 | P1 |
| 34 | `My-Client`<br>`/c/projects` | 실API 내 프로젝트 | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 35 | `Notify-Client`<br>`(알림 드롭다운, 별도 URL 없음)` | 공통 Chrome.tsx 실API 알림 | 11/04 문의 답변 알림 targetUrl; 기존 공통 Chrome 알림 유지 | GET /me/notifications · 읽음 API | **B** | 하 | P1 |
| 36 | `Notify-Supplier`<br>`(알림 드롭다운, 별도 URL 없음)` | 공통 Chrome.tsx 실API 알림 | 11/04 문의 답변 알림 targetUrl; 기존 공통 Chrome 알림 유지 | GET /me/notifications · 읽음 API | **B** | 하 | P1 |
| 37 | `Profile-Client`<br>`/c/profile` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 38 | `Profile-Supplier`<br>`/s/profile` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 39 | `Project-Supplier`<br>`/s/projects/:pid` | 실API 상세/NDA(분기) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 40 | `PublicClient`<br>`/s/clients/:uid` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 41 | `PublicSupplier`<br>`/c/suppliers/:sid` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 42 | `Quote-Client`<br>`/c/projects/:pid/proposals?modal=quote&sid=:sid` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 43 | `QuoteView-Supplier`<br>`/s/applications/:pid` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 44 | `QuoteWrite-Supplier`<br>`/s/projects/:pid/quote` | 실API specItemId 지원(분기) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 45 | `Report-Client`<br>`/c/drafts/:did?modal=report` | React 화면 존재(실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 46 | `Reset`<br>`/reset` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 이메일/비밀번호 DEMO 기본값 + mock 쿼리 전환; 실제 reset API 호출 없음 | POST /auth/password-reset/request · /confirm | **B** | 중 | P1 |
| 47 | `Review-Client`<br>`/c/contracts/:cid/review` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 48 | `Review-Supplier`<br>`/s/contracts/:cid/review` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 49 | `Settle-Client`<br>`/c/settlements` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 시연 금액 표시가 실제 sandbox/수동 정산 상태와 불일치 가능 | GET /me/payment-statements | **B** | 하 | P1 |
| 50 | `Settle-Supplier`<br>`/s/settlements` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 현재 시연 금액 표시만 존재; 지급 성공으로 오인하면 안 됨 | GET /me/payment-statements | **B** | 하 | P1 |
| 51 | `Signup-Client`<br>`/signup/client` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 완료/건너뛰기 = setDevSession 호출; 프로필 API 저장 없음 | PATCH /me/client-profile | **B** | 상 | P0 |
| 52 | `Signup-Role`<br>`/signup/role` | 구글 가입 일부/이메일은 데모 | 이메일 가입 분기는 demo 상태, 구글 온보딩 분기만 실제 세션 메서드 존재 | POST /auth/google/complete-onboarding | **B** | 상 | P0 |
| 53 | `Signup-Supplier`<br>`/signup/supplier` | 시연/정적 화면(페이지 자체의 실API 호출 미확인) | 완료/건너뛰기 = setDevSession 호출; NDA 기본 true/프로필 API 저장 없음 | PATCH /me/supplier-profile | **B** | 상 | P0 |
| 54 | `Signup`<br>`/signup` | Google OAuth 진입/이메일은 데모 | 입력값·동의는 소스상 공란/false이나 이메일 회원가입 POST 없음; 개발 데모 세션으로 이동 | POST /auth/register | **B** | 상 | P0 |
| 55 | `Spec-Client`<br>`/c/projects/:pid` | 실API 프로젝트 상세 | 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요) | API 연동은 별도 검증 | **A** | 하 | P2 |
| 56 | `Supplier-Landing`<br>`/supplier` | React 화면 존재(실API 호출 미확인) | 11/04 랜딩 3장면·흐름도/anchor 변경; 현재 메뉴 #quote/#criteria | #flow/#price / 결제 문구 검증 필요 | **B** | 상 | P1 |
| 57 | `Terms`<br>`/terms/:doc` | React 화면 존재(실API 호출 미확인) | 11/04 viewer 셸 변경; 현재 routes.ts는 public 셸 | 정적 약관/동의는 인증 계약과 버전 연결 | **B** | 하 | P1 |

## 화면별 파일 근거 · 확인 포인트

다음 링크는 비교 기준 **커밋에 고정된 원본**입니다. 파일이 있다는 사실과 사용자가 끝까지 수행할 수 있다는 것은 다릅니다.

### Account-Client — B / P1

- 경로: `/c/account`. [디자인: `docs/boards/Account-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Account-Client.dc.html); [React: `apps/web/src/pages/client/Account-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Account-Client.tsx).
- 비교 근거: 증빙 정보 변경 모달 추가(보완 1-1); 현재 계정 화면 DEMO 기반. API: PATCH /me/client-tax-info.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Account-Supplier — B / P1

- 경로: `/s/account`. [디자인: `docs/boards/Account-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Account-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Account-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Account-Supplier.tsx).
- 비교 근거: 계좌 변경·인증 뒤 상태(보완 1-2); 인증 발송 API는 현행 명세에 없음. API: PATCH /me/payout-account · POST /me/payout-account/verify.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Admin-Blocks — B / P2

- 경로: `/admin/blocks`. [디자인: `docs/boards/Admin-Blocks.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Admin-Blocks.dc.html); [React: `apps/web/src/pages/admin/Admin-Blocks.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/admin/Admin-Blocks.tsx).
- 비교 근거: 승인·병합·단가·비활성 처리 후 결과 상태(보완 1-5). API: POST /admin/blocks/{blockId}/actions.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Admin-Disputes — B / P2

- 경로: `/admin/disputes`. [디자인: `docs/boards/Admin-Disputes.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Admin-Disputes.dc.html); [React: `apps/web/src/pages/admin/Admin-Disputes.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/admin/Admin-Disputes.tsx).
- 비교 근거: 판정 선택지별 완료 화면 보완(보완 1-7). API: POST /admin/inspection-requests/{id}/decision.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Admin-Events — D / P2

- 경로: `/admin/events`. [디자인: `docs/boards/Admin-Events.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Admin-Events.dc.html); [React: `apps/web/src/pages/admin/Admin-Events.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/admin/Admin-Events.tsx).
- 비교 근거: 기존 이벤트 기록 UI는 DEMO; 신규 디자인 요구 적음, 실연동은 후순위. API: GET /admin/event-logs.
- 개발 지시: 기존 디자인은 유지합니다. 확장 UI를 동작하는 것처럼 만들지 않습니다. 백엔드 계약/시연 범위 확정 후 별도 작업을 엽니다.

### Admin-Inquiries — C / P1

- 경로: `/admin/inquiries`. [디자인: `docs/boards/Admin-Inquiries.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Admin-Inquiries.dc.html); **React 대응 파일 없음**.
- 비교 근거: 11/04 신규 운영자 1:1 문의 보드, React 대응 페이지·운영자 메뉴 없음. API: GET /admin/support/inquiries · POST /admin/support/inquiries/{id}/answer.
- 개발 지시: 새 TSX/data/module.css를 생성합니다. 기존 셸/공통 UI를 재사용하고 백엔드 현행 API로 연결합니다. 다른 역할과 비로그인 상태를 확인합니다.

### Admin-Payments — D / P2

- 경로: `/admin/payments`. [디자인: `docs/boards/Admin-Payments.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Admin-Payments.dc.html); [React: `apps/web/src/pages/admin/Admin-Payments.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/admin/Admin-Payments.tsx).
- 비교 근거: 기존 운영자 결제 모니터 화면은 DEMO; Toss P0 이후 검증. API: GET /admin/deposits/held.
- 개발 지시: 기존 디자인은 유지합니다. 확장 UI를 동작하는 것처럼 만들지 않습니다. 백엔드 계약/시연 범위 확정 후 별도 작업을 엽니다.

### Admin-Refunds — D / P2

- 경로: `/admin/refunds`. [디자인: `docs/boards/Admin-Refunds.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Admin-Refunds.dc.html); [React: `apps/web/src/pages/admin/Admin-Refunds.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/admin/Admin-Refunds.tsx).
- 비교 근거: 운영자 수동 처리 UI는 DEMO; 실정산 운영·시연 정책 확정 전 보류. API: POST /admin/contracts/{id}/settlement/mark-processed.
- 개발 지시: 기존 디자인은 유지합니다. 확장 UI를 동작하는 것처럼 만들지 않습니다. 백엔드 계약/시연 범위 확정 후 별도 작업을 엽니다.

### Admin-Reports — B / P2

- 경로: `/admin/reports`. [디자인: `docs/boards/Admin-Reports.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Admin-Reports.dc.html); [React: `apps/web/src/pages/admin/Admin-Reports.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/admin/Admin-Reports.tsx).
- 비교 근거: 문제 없음/경고/정지 후 표시 분기(보완 1-6). API: POST /admin/reports/{reportId}/resolve.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Agreement-Client — A / P2

- 경로: `/c/chat/:pid/:sid/agreement`. [디자인: `docs/boards/Agreement-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Agreement-Client.dc.html); [React: `apps/web/src/pages/client/Agreement-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Agreement-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Apps-Supplier — A / P2

- 경로: `/s/applications`. [디자인: `docs/boards/Apps-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Apps-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Apps-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Apps-Supplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Cancel-Client — D / P2

- 경로: `/c/contracts/:cid/cancel`. [디자인: `docs/boards/Cancel-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Cancel-Client.dc.html); [React: `apps/web/src/pages/client/Cancel-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Cancel-Client.tsx).
- 비교 근거: 11/04 취소 철회는 API v1.0.1 미구현. 기존 취소 UI 유지·신규 철회 보류. API: 기존 /contracts/{id}/cancellation 는 존재.
- 개발 지시: 기존 디자인은 유지합니다. 확장 UI를 동작하는 것처럼 만들지 않습니다. 백엔드 계약/시연 범위 확정 후 별도 작업을 엽니다.

### Cancel-Supplier — D / P2

- 경로: `/s/contracts/:cid/cancel`. [디자인: `docs/boards/Cancel-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Cancel-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Cancel-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Cancel-Supplier.tsx).
- 비교 근거: 취소 철회 관련 파생 동작은 API 미구현. 기존 취소 이의·동의 UI 보존. API: /cancellation/agree · /object 존재.
- 개발 지시: 기존 디자인은 유지합니다. 확장 UI를 동작하는 것처럼 만들지 않습니다. 백엔드 계약/시연 범위 확정 후 별도 작업을 엽니다.

### Chat-Client — A / P2

- 경로: `/c/chat/:pid/:sid`. [디자인: `docs/boards/Chat-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Chat-Client.dc.html); [React: `apps/web/src/pages/client/Chat-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Chat-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Chat-Supplier — A / P2

- 경로: `/s/chat/:pid`. [디자인: `docs/boards/Chat-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Chat-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Chat-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Chat-Supplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Compare-Client — A / P2

- 경로: `/c/projects/:pid/proposals`. [디자인: `docs/boards/Compare-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Compare-Client.dc.html); [React: `apps/web/src/pages/client/Compare-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Compare-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Confirm-Client — A / P2

- 경로: `/c/drafts/:did/confirm`. [디자인: `docs/boards/Confirm-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Confirm-Client.dc.html); [React: `apps/web/src/pages/client/Confirm-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Confirm-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Contract-Client — A / P2

- 경로: `/c/contracts/:cid`. [디자인: `docs/boards/Contract-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Contract-Client.dc.html); [React: `apps/web/src/pages/client/Contract-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Contract-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Contract-Supplier — A / P2

- 경로: `/s/contracts/:cid`. [디자인: `docs/boards/Contract-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Contract-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Contract-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Contract-Supplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Contracts-Client — B / P1

- 경로: `/c/contracts`. [디자인: `docs/boards/Contracts-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Contracts-Client.dc.html); [React: `apps/web/src/pages/client/Contracts-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Contracts-Client.tsx).
- 비교 근거: 현재 페이지는 시연 data만 렌더; 계약 카드 실제 조회 연결 및 결제 상태 보호 필요. API: GET /me/contracts.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Contracts-Supplier — B / P1

- 경로: `/s/contracts`. [디자인: `docs/boards/Contracts-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Contracts-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Contracts-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Contracts-Supplier.tsx).
- 비교 근거: 현재 페이지는 시연 data만 렌더; 계약 목록 API 연동 필요. API: GET /me/contracts.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Deliver-Supplier — B / P1

- 경로: `/s/contracts/:cid/deliver`. [디자인: `docs/boards/Deliver-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Deliver-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Deliver-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Deliver-Supplier.tsx).
- 비교 근거: 11/04 도움 요청 뒤/재제출 상태(보완 1-9); 현재 DEMO 화면. API: POST /installments/{id}/deliveries · 보완/이견.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Draft-Client — A / P2

- 경로: `/c/drafts/:did`. [디자인: `docs/boards/Draft-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Draft-Client.dc.html); [React: `apps/web/src/pages/client/Draft-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Draft-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Escrow-Client — B / P0

- 경로: `/c/contracts/:cid/escrow`. [디자인: `docs/boards/Escrow-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Escrow-Client.dc.html); [React: `apps/web/src/pages/client/Escrow-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Escrow-Client.tsx).
- 비교 근거: 실계약 조회 코드는 있지만 Toss 결제창/승인/복구 없음. 완료 문구는 검증 필요. API: POST /contracts/{id}/deposits ≠ PG 승인.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Find-Supplier — A / P2

- 경로: `/s/projects`. [디자인: `docs/boards/Find-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Find-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Find-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Find-Supplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Help-Inquiry — C / P1

- 경로: `/help/inquiry`. [디자인: `docs/boards/Help-Inquiry.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Help-Inquiry.dc.html); **React 대응 파일 없음**.
- 비교 근거: 11/04 신규 사용자 1:1 문의 보드. 기존 /help/inquiry는 Help.tsx 재사용. API: POST/GET /support/inquiries · GET /support/inquiries/{id}.
- 개발 지시: 새 TSX/data/module.css를 생성합니다. 기존 셸/공통 UI를 재사용하고 백엔드 현행 API로 연결합니다. 다른 역할과 비로그인 상태를 확인합니다.

### Help — B / P1

- 경로: `/help`. [디자인: `docs/boards/Help.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Help.dc.html); [React: `apps/web/src/pages/public/Help.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Help.tsx).
- 비교 근거: 11/04 FAQ 14개·1:1 분리·공지. 현재 Help는 문의 폼 자체 포함, 빠른 검색 불일치 보고. API: 고객센터 FAQ 자체 데이터 / 문의 API 별도.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Home-Client — A / P2

- 경로: `/c`. [디자인: `docs/boards/Home-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Home-Client.dc.html); [React: `apps/web/src/pages/client/Home-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Home-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Home-Supplier — A / P2

- 경로: `/s`. [디자인: `docs/boards/Home-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Home-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Home-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Home-Supplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Input-Client — A / P2

- 경로: `/c/drafts/new`. [디자인: `docs/boards/Input-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Input-Client.dc.html); [React: `apps/web/src/pages/client/Input-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Input-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Inspect-Client — B / P1

- 경로: `/c/contracts/:cid/inspect`. [디자인: `docs/boards/Inspect-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Inspect-Client.dc.html); [React: `apps/web/src/pages/client/Inspect-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Inspect-Client.tsx).
- 비교 근거: 11/04 보완/도움 요청 뒤 상태(보완 1-8); 현재 DEMO 화면. API: POST /contract-items/{id}/approve · /rework-requests.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Login — A / P2

- 경로: `/?modal=login (또는 /supplier?modal=login)`. [디자인: `docs/boards/Login.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Login.dc.html); [React: `apps/web/src/pages/public/Login.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Login.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Main — B / P1

- 경로: `/`. [디자인: `docs/boards/Main.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Main.dc.html); [React: `apps/web/src/pages/public/Main.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Main.tsx).
- 비교 근거: 11/04 랜딩 3장면·가치 카드/flow; 현재 Main.data는 기본 1상태. API: 정적 랜딩, 결제 문구 검증 필요.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### My-Client — A / P2

- 경로: `/c/projects`. [디자인: `docs/boards/My-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/My-Client.dc.html); [React: `apps/web/src/pages/client/My-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/My-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Notify-Client — B / P1

- 경로: `(알림 드롭다운, 별도 URL 없음)`. [디자인: `docs/boards/Notify-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Notify-Client.dc.html); [React: `apps/web/src/components/layout/Chrome.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/components/layout/Chrome.tsx).
- 비교 근거: 11/04 문의 답변 알림 targetUrl; 기존 공통 Chrome 알림 유지. API: GET /me/notifications · 읽음 API.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Notify-Supplier — B / P1

- 경로: `(알림 드롭다운, 별도 URL 없음)`. [디자인: `docs/boards/Notify-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Notify-Supplier.dc.html); [React: `apps/web/src/components/layout/Chrome.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/components/layout/Chrome.tsx).
- 비교 근거: 11/04 문의 답변 알림 targetUrl; 기존 공통 Chrome 알림 유지. API: GET /me/notifications · 읽음 API.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Profile-Client — A / P2

- 경로: `/c/profile`. [디자인: `docs/boards/Profile-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Profile-Client.dc.html); [React: `apps/web/src/pages/client/Profile-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Profile-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Profile-Supplier — A / P2

- 경로: `/s/profile`. [디자인: `docs/boards/Profile-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Profile-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Profile-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Profile-Supplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Project-Supplier — A / P2

- 경로: `/s/projects/:pid`. [디자인: `docs/boards/Project-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Project-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Project-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Project-Supplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### PublicClient — A / P2

- 경로: `/s/clients/:uid`. [디자인: `docs/boards/PublicClient.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/PublicClient.dc.html); [React: `apps/web/src/pages/supplier/PublicClient.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/PublicClient.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### PublicSupplier — A / P2

- 경로: `/c/suppliers/:sid`. [디자인: `docs/boards/PublicSupplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/PublicSupplier.dc.html); [React: `apps/web/src/pages/client/PublicSupplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/PublicSupplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Quote-Client — A / P2

- 경로: `/c/projects/:pid/proposals?modal=quote&sid=:sid`. [디자인: `docs/boards/Quote-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Quote-Client.dc.html); [React: `apps/web/src/pages/client/Quote-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Quote-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### QuoteView-Supplier — A / P2

- 경로: `/s/applications/:pid`. [디자인: `docs/boards/QuoteView-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/QuoteView-Supplier.dc.html); [React: `apps/web/src/pages/supplier/QuoteView-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/QuoteView-Supplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### QuoteWrite-Supplier — A / P2

- 경로: `/s/projects/:pid/quote`. [디자인: `docs/boards/QuoteWrite-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/QuoteWrite-Supplier.dc.html); [React: `apps/web/src/pages/supplier/QuoteWrite-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/QuoteWrite-Supplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Report-Client — A / P2

- 경로: `/c/drafts/:did?modal=report`. [디자인: `docs/boards/Report-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Report-Client.dc.html); [React: `apps/web/src/pages/client/Report-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Report-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Reset — B / P1

- 경로: `/reset`. [디자인: `docs/boards/Reset.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Reset.dc.html); [React: `apps/web/src/pages/public/Reset.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Reset.tsx).
- 비교 근거: 이메일/비밀번호 DEMO 기본값 + mock 쿼리 전환; 실제 reset API 호출 없음. API: POST /auth/password-reset/request · /confirm.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Review-Client — A / P2

- 경로: `/c/contracts/:cid/review`. [디자인: `docs/boards/Review-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Review-Client.dc.html); [React: `apps/web/src/pages/client/Review-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Review-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Review-Supplier — A / P2

- 경로: `/s/contracts/:cid/review`. [디자인: `docs/boards/Review-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Review-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Review-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Review-Supplier.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Settle-Client — B / P1

- 경로: `/c/settlements`. [디자인: `docs/boards/Settle-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Settle-Client.dc.html); [React: `apps/web/src/pages/client/Settle-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Settle-Client.tsx).
- 비교 근거: 시연 금액 표시가 실제 sandbox/수동 정산 상태와 불일치 가능. API: GET /me/payment-statements.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Settle-Supplier — B / P1

- 경로: `/s/settlements`. [디자인: `docs/boards/Settle-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Settle-Supplier.dc.html); [React: `apps/web/src/pages/supplier/Settle-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/supplier/Settle-Supplier.tsx).
- 비교 근거: 현재 시연 금액 표시만 존재; 지급 성공으로 오인하면 안 됨. API: GET /me/payment-statements.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Signup-Client — B / P0

- 경로: `/signup/client`. [디자인: `docs/boards/Signup-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Signup-Client.dc.html); [React: `apps/web/src/pages/public/Signup-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Signup-Client.tsx).
- 비교 근거: 완료/건너뛰기 = setDevSession 호출; 프로필 API 저장 없음. API: PATCH /me/client-profile.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Signup-Role — B / P0

- 경로: `/signup/role`. [디자인: `docs/boards/Signup-Role.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Signup-Role.dc.html); [React: `apps/web/src/pages/public/Signup-Role.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Signup-Role.tsx).
- 비교 근거: 이메일 가입 분기는 demo 상태, 구글 온보딩 분기만 실제 세션 메서드 존재. API: POST /auth/google/complete-onboarding.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Signup-Supplier — B / P0

- 경로: `/signup/supplier`. [디자인: `docs/boards/Signup-Supplier.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Signup-Supplier.dc.html); [React: `apps/web/src/pages/public/Signup-Supplier.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Signup-Supplier.tsx).
- 비교 근거: 완료/건너뛰기 = setDevSession 호출; NDA 기본 true/프로필 API 저장 없음. API: PATCH /me/supplier-profile.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Signup — B / P0

- 경로: `/signup`. [디자인: `docs/boards/Signup.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Signup.dc.html); [React: `apps/web/src/pages/public/Signup.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Signup.tsx).
- 비교 근거: 입력값·동의는 소스상 공란/false이나 이메일 회원가입 POST 없음; 개발 데모 세션으로 이동. API: POST /auth/register.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Spec-Client — A / P2

- 경로: `/c/projects/:pid`. [디자인: `docs/boards/Spec-Client.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Spec-Client.dc.html); [React: `apps/web/src/pages/client/Spec-Client.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/client/Spec-Client.tsx).
- 비교 근거: 11/04 개별 신규 설계 변화 확인되지 않음. 기존 React 구현 보존 후보(시각 검증 필요). API: API 연동은 별도 검증.
- 개발 지시: 기존 화면·상태·라우트를 유지합니다. 실제 디자인 보드와 1440/390을 확인했을 때 차이가 드러나는 부분만 수정하고, 기능을 새로 만들지 않습니다.

### Supplier-Landing — B / P1

- 경로: `/supplier`. [디자인: `docs/boards/Supplier-Landing.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Supplier-Landing.dc.html); [React: `apps/web/src/pages/public/Supplier-Landing.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Supplier-Landing.tsx).
- 비교 근거: 11/04 랜딩 3장면·흐름도/anchor 변경; 현재 메뉴 #quote/#criteria. API: #flow/#price / 결제 문구 검증 필요.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

### Terms — B / P1

- 경로: `/terms/:doc`. [디자인: `docs/boards/Terms.dc.html`](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/boards/Terms.dc.html); [React: `apps/web/src/pages/public/Terms.tsx`](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Terms.tsx).
- 비교 근거: 11/04 viewer 셸 변경; 현재 routes.ts는 public 셸. API: 정적 약관/동의는 인증 계약과 버전 연결.
- 개발 지시: 해당 TSX·data·module.css를 우선 수정하되 기존 API 어댑터/상태 모델을 보존합니다. 요청/응답이 바뀌면 별도 Integration 승인과 인접 테스트가 필요합니다.

## 결론 및 집계 해석

- **신규 React 페이지는 2개**(`Help-Inquiry`, `Admin-Inquiries`). 알림 2개는 `Chrome.tsx`에서 한 번 수정합니다.
- **공통 컴포넌트 재사용 효과**: 기존 `Chrome.tsx`의 알림 2보드는 1개 컴포넌트 수정으로, `Footer.tsx`·`layout.module.css`의 푸터 변경은 디자인 변경 문서에서 **45개 보드**에 적용 대상으로 명시합니다. 다만 현재 배포에서 45개를 모두 시각 검증한 것은 아닙니다.
- **React 전용 화면**: `/auth/google/callback`의 `GoogleCallback.tsx`는 디자인 57보드 밖이며 OAuth 보호 대상으로 별도 유지합니다.
- **중요한 구분**: B 화면 수는 곧 “새로 만들 화면 수”가 아닙니다. UI·상태 정비와 실제 API 연결 작업은 `TASKS`에서 분리합니다. 원래 API를 재구현하지 않습니다.
- **미검증**: 57개 전체의 화면 캡처/픽셀 비교, 실제 배포 커밋 일치, 로그인 뒤 역할별 실HTTP, Toss 결제 승인과 복구는 이 문서 작성에서 실행하지 않았습니다.

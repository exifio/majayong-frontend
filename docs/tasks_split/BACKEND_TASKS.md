# BACKEND_TASKS — 방식 B: 저장소별 실행 TASKS

> **작업본 안내:** 원본 자료집의 FE 기준은 `f9427a9`입니다. 현재 작업본의 코드 차이·경로·누락 자료는 [프론트엔드 작업 시작 안내](../FRONTEND_WORKSPACE.md)를 먼저 확인하세요. 원본의 과거 진단과 미실행 상태를 현재 사실로 단정하지 않습니다.


> 대상: **BE 작업 AI 전용**. 다른 저장소 코드를 직접 수정하지 말고 공동 계약은 [통합 TASKS](../TASKS.md)의 Integration 담당으로 넘깁니다. 버전 v0.7.3, 기준 2026-11-05 (KST). 아래 작업은 모두 **미실행/대기**입니다.
>
> 각 태스크는 다른 AI가 읽어도 같은 결과를 내도록 파일·API·수용 기준·최소 QA를 명시했습니다. 작업에 명시되지 않은 전면 리팩터링/자동 테스트 대량 생성 금지.

| id | 우선순위 | 단계 | 작업 | 의존 | 난이도 |
|---|:---:|:---:|---|---|:---:|
| BE-00 | P0 | Now | API 기준선과 스테이징 환경 검증 | INT-00 | 하 |
| BE-01 | P0 | Now | auth/register/reset/Google/role 계약 및 실제 호출 검증 | BE-00 | 중 |
| BE-02 | P1 | Now | 고객센터 문의 5개 API·DTO·권한 검증 | BE-00 | 중 |
| BE-03 | P1 | Next | 문의 답변 알림 targetUrl·운영 이벤트 검증 | BE-02 | 하 |
| BE-04 | P1 | Next | NDA/specItemId/지원·채팅·합의·서명 회귀 | BE-01, BE-00 | 중 |
| BE-05 | P1 | Next | 납품·검수·운영자 결정 API 검증 | BE-04 | 중 |
| BE-06 | P0 | Now | Toss sandbox 승인 계약 설계·구현(P0) | BE-00, INT-02 | 상 |
| BE-07 | P0 | Now | Toss 웹훅 원형 정규화·재조회·장애 복구 | BE-06 | 상 |
| BE-08 | P1 | Next | staging 시연 fixture 2세트/리셋·데모 판정 | BE-04, BE-05 | 중 |
| BE-09 | P2 | Later | 검색 keyword/sort/deadlineBefore 선택적 확장 | BE-00 | 중 |
| BE-10 | P2 | Later | 취소 요청 철회/1원 인증 발송은 계약 결정 후 | BE-00 | 중 |
| BE-11 | P1 | Next | API 문서/권한/최종 시연 스모크 | BE-02, BE-04, BE-05, BE-08 | 중 |

## BE-00 — API 기준선과 스테이징 환경 검증

- **상태/난이도:** 대기 / 실호출 미검증 / 하 · **우선순위:** P0 · **단계:** Now.
- **선행:** INT-00.
- **대상:** `openapi/openapi.yaml; src/app.ts; src/server.ts; vercel.json; api/health.js`.
- **목표/범위:** 119개 API + /health 기준과 실제 배포 host/DB 연결 확인.
- **보존:** 기존 path/method/DTO/권한.
- **API 계약:** /api/v1 및 GET /health 분리.
- **실행:** API PDF FE SHA와 실제 현재 SHA 차이를 기록하고 운영/스테이징 혼동 차단.
- **완료 조건:** 실제 BE SHA, API host, health JSON/기본 401, 환경별 연결 확인.
- **최소 QA:** curl health/401 응답 및 응답 envelope (민감정보 제외).
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-01 — auth/register/reset/Google/role 계약 및 실제 호출 검증

- **상태/난이도:** 대기 / 실호출 미검증 / 중 · **우선순위:** P0 · **단계:** Now.
- **선행:** BE-00.
- **대상:** `src/modules/identity/*; src/app.ts; Prisma 관련 파일(변경 필요할 때만)`.
- **목표/범위:** 현행 이메일 회원가입/비밀번호 재설정 API 수용/테스트 준비.
- **보존:** refresh token 회전, Google OAuth, 계정 역할 서버 검증.
- **API 계약:** POST /auth/register; /auth/password-reset/request|confirm; Google 온보딩.
- **실행:** 프론트 부재를 백엔드 부재로 오인하지 말고 현행 API 성공/실패·버전 확인.
- **완료 조건:** CLIENT/SUPPLIER 계정 생성·로그인·reset 만료/오류 샘플 테스트 통과.
- **최소 QA:** 인접 identity*.test.ts, 해당 라우트만 실HTTP.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-02 — 고객센터 문의 5개 API·DTO·권한 검증

- **상태/난이도:** 대기 / 실호출 미검증 / 중 · **우선순위:** P1 · **단계:** Now.
- **선행:** BE-00.
- **대상:** `src/modules/support/http.ts; inquiries.ts; prisma-adapter.ts`.
- **목표/범위:** 신규 FE 문의 2화면이 기존 API로 가능한지 응답 데이터·상대 정보·role 검증.
- **보존:** 기존 /support/inquiries 경로 유지; 신규 /api/c 생성 금지.
- **API 계약:** POST/GET /support/inquiries; GET /support/inquiries/{id}; GET /admin/support/inquiries; POST /admin/support/inquiries/{id}/answer.
- **실행:** 관리자 상세 GET은 현행 명세에 없음. 목록 응답 부족 시 정식 계약 변경 요청.
- **완료 조건:** 본인 문의·운영자 답변·타인 접근 차단, WAITING/ANSWERED, 파일 권한.
- **최소 QA:** support 인접 test로 201/200/401/403/validation.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-03 — 문의 답변 알림 targetUrl·운영 이벤트 검증

- **상태/난이도:** 대기 / 실호출 미검증 / 하 · **우선순위:** P1 · **단계:** Next.
- **선행:** BE-02.
- **대상:** `src/modules/support/inquiries.ts; src/modules/notification/*; src/core/events.ts`.
- **목표/범위:** INQUIRY_ANSWERED 알림 대상과 deep link가 React 새 UI에 맞는지 확인.
- **보존:** 알림 3종 API 및 기존 이벤트 불변.
- **API 계약:** GET /me/notifications; PATCH /me/notifications/{id}/read.
- **실행:** targetUrl=/help/inquiry?tab=my&id=<id>가 실제 문의 소유자에게만, 불필요한 본문 민감정보 금지.
- **완료 조건:** 답변 후 알림 1회, 읽음/중복 문제 없음.
- **최소 QA:** 관련 notification/support 인접 테스트.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-04 — NDA/specItemId/지원·채팅·합의·서명 회귀

- **상태/난이도:** 대기 / 실호출 미검증 / 중 · **우선순위:** P1 · **단계:** Next.
- **선행:** BE-01, BE-00.
- **대상:** `src/modules/project/api.ts; application/http.ts; chat/http.ts; contract/http.ts`.
- **목표/범위:** 기존 B/API 연결점과 권한·상태의 실HTTP 리허설.
- **보존:** specItemId 항목 ID, Agreement/Contract hash, 응답 봉투.
- **API 계약:** PATCH /me/supplier-profile; GET /projects/{id}; POST /projects/{id}/applications; GET/POST /messages; /agreement/*; /contracts/{id}/sign.
- **실행:** 이미 코드에 있는 경로/스키마 유지, DTO 임의 확장 금지.
- **완료 조건:** CLIENT/SUPPLIER 단계 2~7 성공/실패를 staging fixture로 검증.
- **최소 QA:** 각 인접 domain test + 역할별 실제 HTTP 1회.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-05 — 납품·검수·운영자 결정 API 검증

- **상태/난이도:** 대기 / 실호출 미검증 / 중 · **우선순위:** P1 · **단계:** Next.
- **선행:** BE-04.
- **대상:** `src/modules/delivery/*; settlement/*; review/*; admin-ops/*`.
- **목표/범위:** 검수·보완·이견·관리자 액션, 지급과 리뷰 조건 확인.
- **보존:** 기존 상태머신, 산식, 1회 리뷰.
- **API 계약:** POST /installments/{id}/deliveries; /contract-items/{id}/approve; /rework-requests; /contracts/{id}/reviews.
- **실행:** fixture로 완료된 계약을 실PG 성공이라고 설명하지 않음.
- **완료 조건:** 납품 제출/승인/보완/리뷰 조건 및 권한 검증.
- **최소 QA:** 인접 도메인 test + staging 실HTTP.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-06 — Toss sandbox 승인 계약 설계·구현(P0)

- **상태/난이도:** 대기 / 실호출 미검증 / 상 · **우선순위:** P0 · **단계:** Now.
- **선행:** BE-00, INT-02.
- **대상:** `src/modules/deposit/*; src/c-app.ts; integration/toss-verifier.ts; OpenAPI 변경 승인 대상`.
- **목표/범위:** Toss SDK 성공 리다이렉트→서버 확인→승인 API 호출→주문/금액 검증·상태 확정 최소 설계.
- **보존:** 기존 PENDING 예치·멱등키·서버 비밀키 저장 규칙.
- **API 계약:** POST /contracts/{id}/deposits는 생성 201; 신규 승인 URL은 아직 **미확정**.
- **실행:** 새 method/path/DTO를 문서→FE/BE 합의→코드/스키마 순으로 승인. 실제 승인 전에 DEPOSITED 금지.
- **완료 조건:** PAY-01/02/03/04/06 staging 검증 및 권한·멱등성.
- **최소 QA:** 해당 deposit*.test + Toss sandbox 실제 테스트 증거.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-07 — Toss 웹훅 원형 정규화·재조회·장애 복구

- **상태/난이도:** 대기 / 실호출 미검증 / 상 · **우선순위:** P0 · **단계:** Now.
- **선행:** BE-06.
- **대상:** `src/c-app.ts; src/integration/toss-verifier.ts; 관련 deposit/service`.
- **목표/범위:** 현재 내부 webhook envelope와 Toss PAYMENT_STATUS_CHANGED의 eventType/data 차이 처리, 누락·지연 복구.
- **보존:** 신뢰할 수 없는 웹훅으로 잔액 확정 금지.
- **API 계약:** POST /integrations/toss/payment-events; PG server-side GET/confirm.
- **실행:** Toss 원형 이벤트 검증 후 변환. 이벤트별 인증 요구 확인, 수동 HELD 처리와 PENDING 승인 혼동 금지.
- **완료 조건:** PAY-03/04/05과 중복 자동 거절·불일치 회피 검증.
- **최소 QA:** 인접 Toss verifier + 실제 sandbox webhook/조회 근거.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-08 — staging 시연 fixture 2세트/리셋·데모 판정

- **상태/난이도:** 대기 / 실호출 미검증 / 중 · **우선순위:** P1 · **단계:** Next.
- **선행:** BE-04, BE-05.
- **대상:** `scripts/seed-staging.mjs; 별도 staging 시연 script(필요시)`.
- **목표/범위:** A 모집/채팅 1건+지원3건, B 납품/검수 계약 (실PG 또는 데모 전용 표시), 반복 리셋.
- **보존:** 운영 DB 및 기존 사용자 데이터.
- **API 계약:** 새 공개 reset API는 임의 추가 금지.
- **실행:** staging prefix/ID만 대상, 멱등 seed/reset; PG 증거 없는 COMPLETED는 fixture로 표시.
- **완료 조건:** 2회 반복 시 seed 데이터 숫자·상태 일관, 실제 데이터 무변경.
- **최소 QA:** staging DB에서 dryrun/실행 검증, prod 차단.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-09 — 검색 keyword/sort/deadlineBefore 선택적 확장

- **상태/난이도:** 대기 / 실호출 미검증 / 중 · **우선순위:** P2 · **단계:** Later.
- **선행:** BE-00.
- **대상:** `src/modules/project/api.ts; market/project-search.ts; openapi`.
- **목표/범위:** F-08 시연에 넣는 경우에만 GET /projects 선택 쿼리 확장.
- **보존:** 현행 industryCode,skill,status,minBudget,maxBudget,page.
- **API 계약:** 현행 GET /projects는 6개 query만 계약.
- **실행:** 새 query 이름/경계/권한 팀 승인 후 하위호환 추가; FE와 DTO 계약.
- **완료 조건:** 검색/정렬 경계·필터·페이지 10 검증.
- **최소 QA:** 시장 검색 모듈 인접 테스트 + FE 통합.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-10 — 취소 요청 철회/1원 인증 발송은 계약 결정 후

- **상태/난이도:** 대기 / 실호출 미검증 / 중 · **우선순위:** P2 · **단계:** Later.
- **선행:** BE-00.
- **대상:** `src/modules/cancellation/*; src/modules/profile/* (승인 시에만)`.
- **목표/범위:** 현재 API 없는 두 확장 기능의 구현/보류 판단과 위험 기록.
- **보존:** 계약/정산 기간·권한·실제 계좌 정보 보호.
- **API 계약:** cancel withdraw, verify-send API는 현행 명세에 없음.
- **실행:** 변경을 임의 실행하지 않음. 시연 필수 여부/회귀 비용/계약 승인 없으면 보류.
- **완료 조건:** 미지원 화면이 동작하는 것처럼 안내하지 않음.
- **최소 QA:** 승인 전 검증 문서만.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## BE-11 — API 문서/권한/최종 시연 스모크

- **상태/난이도:** 대기 / 실호출 미검증 / 중 · **우선순위:** P1 · **단계:** Next.
- **선행:** BE-02, BE-04, BE-05, BE-08.
- **대상:** `openapi/openapi.yaml; docs/API_INDEX.md(있으면); 관련 .int.test.ts`.
- **목표/범위:** 반영된 계약의 method/path/DTO·requestId·권한 확인, 실HTTP 시연 증거 정리.
- **보존:** A49/B36/C34 기존 계약(승인 변경 외), 개인정보 비노출.
- **API 계약:** DEMO-01~10 핵심 경로; GET /health 별도.
- **실행:** API 미구현/미검증/fixture를 완료로 표기하지 않음.
- **완료 조건:** 10단계 각 결과·오류·requestId(토큰 제외), API 문서 차이 없거나 승인됨.
- **최소 QA:** 가벼운 관련 test:a|b|c + staging E2E 1회.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## 공통 개발 준수 사항

이 FE 저장소에서는 의존성과 인계 조건만 참고합니다. BE 코드 경로·명령은 별도 백엔드 저장소 기준이며, BE/INT 티켓을 이 저장소에서 대신 완료 처리하지 않습니다.


- [공통 규약](../AGENTS.md)의 실제 프론트/백 저장소별 실행 규칙을 모두 준수합니다.
- TypeScript strict, DTO 추론/unknown 타입 가드, `as any` 남용 금지. 라이브러리·테스트 도구는 현재 package.json 범위로 유지합니다.
- **테스트 인접형(Test Colocation)**: 대상 `Foo.ts` 옆 `Foo.test.ts` / `Foo.tsx` 옆 `Foo.test.tsx`; `test/describe/it` 제목은 한국어, 간결하게, 한 테스트는 하나의 행위.
- UI 컴포넌트는 Testing Library 의미 기반 `getByRole/getByLabelText`, 브라우저 E2E는 Playwright Locator. 함수/BE 단위 테스트에 Locator를 억지로 사용하지 않습니다.
- 기존 테스트가 `apps/web/src/test`에 있어도 이번 변경과 무관한 파일을 전부 이동하지 않습니다. 변경 코드만 신규/수정 인접 테스트로 관리하고 충돌/중복을 없앱니다.
- 서버 주소/비밀값/민감정보는 문서·테스트 결과에 쓰지 않고 실제 결제는 sandbox에서만 수행합니다.

# FRONTEND_INTEGRATION_PLAN — 기존 React 보존형 디자인 통합 실행 계획

> **작업본 안내:** 원본 자료집의 FE 기준은 `f9427a9`입니다. 현재 작업본의 코드 차이·경로·누락 자료는 [프론트엔드 작업 시작 안내](FRONTEND_WORKSPACE.md)를 먼저 확인하세요. 원본의 과거 진단과 미실행 상태를 현재 사실로 단정하지 않습니다.


> 2026-11-05 · 기준 FE `f9427a9` / BE `a188fb2` / 디자인 `4360783`. **원본 자료집은 계획만 작성했으며 기능 개발은 수행하지 않은 상태**. 이후 사용자가 요청한 티켓의 개발을 금지하는 의미가 아닙니다.

## 1. 통합 목표와 변경 통제

- 기존 `React 18 + TypeScript + Vite + React Router + pnpm`을 단일 프론트엔드 기준으로 유지합니다.
- `claude-front`는 **디자인/상태 참조**. Node 서버, 템플릿 렌더러, 정적 HTML을 앱으로 이식하지 않습니다.
- 우선 재사용: `components/layout`, `components/ui`, `styles/tokens.css`, `Live*` 어댑터, `app/auth/session`, `lib/api`, `packages/types`.
- UI 경로(`/c`, `/s`, `/admin`)와 HTTP 경로(`/api/v1`)를 혼동하지 않습니다.
- 기존 코드·DTO를 바꾸지 않고 가능한 작업부터 수행합니다. API 확장은 FE/BE 공동 계약 승인 후 별도 PR로 관리합니다.

## 2. 착수 전 준비(게이트 G0)

1. 각 저장소에서 `main` 현재 SHA/작업 트리, 배포 SHA, Vercel FE rewrite 목적지, API host 환경을 고정합니다.
2. FE `/api/v1/*` 프록시 및 **BE 호스트의** `GET /health`를 확인합니다. FE `/health`가 SPA HTML을 응답한다는 사실만으로 BE 장애로 판단하지 않습니다.
3. CLIENT, SUPPLIER, ADMIN 승인 테스트 계정/권한과 staging DB를 확보합니다. 불허된 데이터 변경이나 운영 PG 결제는 금지.
4. `FRONTEND_SCREEN_MATRIX.md`의 57행을 작업 기준으로 채택. `?mock` 시연값과 실제 사용자 값을 구분합니다.
5. 기존 테스트/빌드 baseline을 기록하고 **아직 실행하지 않았다면 미검증**으로 표시합니다.

## 3. 변경 금지·보호 영역

| 보호 대상 | 이유 | 변경 시 최소 검증 |
|---|---|---|
| `apps/web/src/app/auth.ts`, `session.tsx`, `google-oauth.ts`, `GoogleCallback.tsx` | 인증·토큰 회전 및 Google 콜백 | 로그인/로그아웃/만료/역할 1회 |
| `apps/web/src/lib/api.ts`, `packages/types/src/api.ts` | 공통 `data`/`error` 봉투와 refresh 재시도 | 관련 DTO/401/오류 테스트 |
| `components/project/LiveProjectDetail.tsx`, `LiveQuoteWrite.tsx` | NDA와 서버 발급 `specItemId` | NDA 전/후/지원 항목 정확성 |
| `components/chat/LiveChat.tsx`, `components/agreement/LiveAgreement.tsx`, `components/contract/LiveContract.tsx` | 채팅·합의·문서 해시/서명 | 해당 역할의 양방향 요청 1회 |
| `lib/feature-flags.ts`, `components/contract/LiveEscrow.tsx` | sandbox 결제 안전성 | PAY-01~06 전 플래그 OFF |
| `src/styles/tokens.css` 및 기존 UI 공통 컴포넌트 | 이미 디자인 주요 컬러·간격 반영 | 영향 화면 샘플 1440/390 |

## 4. 개발 브랜치 전략(실행 제안)

- FE `main`에서 `docs/design-integration-YYYYMMDD` 계획 PR을 만들고, 승인 후 기능별 `feat/fe-inquiries`, `fix/fe-signup-api`, `style/fe-shell`, `style/fe-landing` 등의 **작은 브랜치**를 순서대로 생성합니다.
- BE는 별도 `fix/be-auth-flow`, `feat/be-payment-confirm`, `test/be-support-inquiry` 등 API 계약·기능 단위로 진행합니다.
- **서로 다른 저장소 동시 작업은 가능**하지만 하나의 FE 공통 파일(`Chrome/Footer/routes/menus/tokens`)을 여러 AI가 병렬 수정하지 않습니다.
- 공유 계약은 문서·DTO가 승인된 뒤 FE/BE 각각 PR. 다른 AI가 임의 API method/path를 합의 없이 만들면 병합하지 않습니다.

## 5. 단계별 실행 / 의존관계

단계 0~7은 실행 순서입니다. 완료 게이트의 G0~G5 명칭은 [PLAN](PLAN.md#2-완료-게이트)을 따르며 단계 번호와 구분합니다.

| 단계 | 선행 조건 | FE 담당(세부 ID) | BE 담당(세부 ID) | 완료 게이트 |
|---|---|---|---|---|
| 0 기준선 | 없음 | FE-00 | BE-00 | G0: SHA·프록시·실제 API host·데모 범위 확인 |
| 1 핵심 가입+공통 셸 | G0 | FE-01, FE-02, FE-05 | BE-01 | G1: 이메일 가입/재설정, OAuth·로그인 보존 |
| 2 1:1 문의 | G0/BE 문의 계약 | FE-03, FE-04, FE-07 | BE-02, BE-03 | G3 일부: 문의 등록→목록→답변→알림, 권한 차단 |
| 3 공통 디자인 후속 | G0, FE-05 | FE-06, FE-08 | 필요 시 BE-00 | G3: 헤더/푸터·Terms·랜딩·계정 동작 |
| 4 기능 보전 | G0, 승인 계정 | FE-09, FE-10, FE-11, FE-13, FE-14 | BE-04, BE-05 | G2 및 G5 일부: 초안→지원→채팅→합의→서명 실HTTP, 시연값 별도 |
| 5 결제/후반부 | API 합의·sandbox | FE-12 | BE-06, BE-07, BE-08 | G4 및 G5 일부: PAY-01~06·실제 vs fixture 구분. 승인 전 ON 금지 |
| 6 선택 확장 | 핵심 시연 통과 | FE-15 | BE-09, BE-10 | 범위 결정 시만 진행 |
| 7 통합 검증 | 변경 PR 완료 | FE-16 | BE-11 | G5: 10단계 중 완료/미완료를 증거로 표시, 배포 승인 |

> 세부 작업명·파일·수용 기준은 [통합 TASKS.md](TASKS.md) 및 [FE 전용](tasks_split/FRONTEND_TASKS.md) / [BE 전용](tasks_split/BACKEND_TASKS.md)에서 확인합니다. 표의 단계는 **작업 승인 순서**이며, 자동으로 모든 기능을 완료해야 한다는 뜻은 아닙니다.

## 6. 공통 디자인을 우선 수정하는 방법

1. `tokens.css`는 이미 색상/그리드가 근접합니다. 재정의 전에 실제 값과 디자인 시스템을 대조합니다.
2. `Footer.tsx`, `layout.module.css`, `menus.ts`는 **공통 파일 한 작업/한 AI**가 담당합니다. 11/04 navy 3줄, 바뀐 anchor, 1:1 문의 링크와 `Terms` viewer 셸을 함께 점검합니다.
3. `Help-Inquiry`, `Admin-Inquiries` 신규는 기존 UI 컴포넌트·공통 Shell을 조립합니다. PHP/Node HTML 복사 대신 React의 표준 상태·권한 처리를 사용합니다.
4. 기존 B 분류 화면 23개를 하나의 거대한 PR로 처리하지 않고 화면 1~3개 묶음으로 처리합니다.
5. 57보드 나머지 A(27)와 D(5)는 API 연결·실배포 차이에서 별도 문제가 없으면 **코드 수정하지 않습니다**.

## 7. 화면 상태와 API 동작 동기화

- 로딩/빈 데이터/인증·권한 부족/서버 오류/성공/읽기 전용/요청 중을 명시해 완료 버튼을 클릭했는데 실제 저장하지 않는 상태를 막습니다.
- `?mock=`는 **개발·시각 QA용**이지 운영 데이터 소스가 아닙니다. 화면에 실데이터가 없으면 적절한 빈 상태를 표시합니다.
- 고객센터 API는 `/api/v1/support/inquiries`로 통일. 디자인에 있는 역할별 `/api/c|s` 엔드포인트는 사용하지 않습니다.
- 계약서 서명은 서버 문서의 `expectedContentHash`를 사용. 채팅의 회차/URL은 `applicationId`를 내부에서 확정하고 겉 URL은 유지합니다.
- Toss `POST .../deposits` 응답 `PENDING`은 예치 요청 생성일 뿐 결제 성공이 아닙니다. 승인·웹훅/복구는 별도 승인 게이트를 거칩니다.

## 8. 병렬 작업 가능한 경계

- 공통 셸 수정 **이후** `Help-Inquiry`, `Admin-Inquiries`, `Main/Supplier-Landing`, `Account-*`는 서로 다른 파일군에서 병렬 가능.
- FE 인접 컴포넌트 테스트와 BE 인접 도메인 테스트는 별개로 병렬 가능.
- FE `Signup`과 BE auth API 검증은 DTO/상태 합의 후 병렬 가능; runtime 통합 테스트에서 합류.
- FE Toss 버튼과 BE PG 승인 개발은 **API 승인 전까지 독립 구현 금지**, 순서는 FE/BE 계약서→BE 승인/복구→FE 연결→sandbox 통합 테스트.
- `App.tsx/routes.ts/menus.ts/Chrome.tsx/Footer.tsx`는 충돌 방지를 위해 한 작업자에게 순차 맡깁니다.

## 9. QA·완료 기준

- **순수 스타일**: `pnpm typecheck`와 `pnpm build`, 변경 화면 1440/390, 필요한 클릭 동선만 점검.
- **인터랙션**: 변경 컴포넌트 **인접형** `.test.tsx` 한국어 테스트명, Testing Library `getByRole/getByLabelText`, 성공/실패 한 건씩.
- **API**: 요청 타입 + 실제 응답 봉투/권한/실패 상태, 테스트 계정 역할별 최소 1회. 변경 범위가 넓으면 관련 통합 경로만.
- **백엔드**: `npm run typecheck`, 관련 `test:a|b|c|integration`만, 실제 DB/PG 흐름은 승인된 staging에서 별도 확인.
- **결제**: API PDF PAY-01~06 통과, 외부 PG 확인 근거 없이 `COMPLETED`/`DEPOSITED` 선언 금지.
- **시연**: API PDF DEMO 1~10의 각 단계에 `소스 확인/실호출 완료/fixture 시연/미검증` 표기. 8단계 P0 미통과면 9~10단계 PG 연동 성공으로 설명하지 않음.

## 10. 롤백과 비상 복구

1. 공통 스타일·라우트: PR 단위 revert, 기존 셸/라우트 정상 복구, 잘못된 푸터 링크만 별도 롤백.
2. API 계약 불일치: FE 대응 작업 중지, 이미 승인된 v1.0.1 method/path·DTO로 되돌림, BE OpenAPI/DTO 수정은 독립 승인.
3. 인증 장애: FE 가입 UI를 임시로 **명확한 점검 안내** 상태로 두고 잘못된 가상 가입 성공을 보여 주지 않음.
4. Toss 장애: `VITE_ENABLE_DEPOSIT=false` 유지/복귀, 주문 상태를 성공으로 수동 위장하지 않음, staging에서 PG 검증 근거 수집.
5. 시드 실패: staging DB인지 확인하고 해당 fixture prefix만 리셋, 타 사용자 데이터 삭제 금지.
6. 문제 생긴 AI 작업: 마지막 정상 SHA 및 변경 파일을 기록하고 해당 PR만 되돌림. 전면 재설계·대규모 리팩터링 금지.

## 11. 완료 후 체크리스트

- [ ] FE 57보드 중 A/B/C/D 변경 사항을 실제 화면에서 확인; C=2 신규 React 페이지 도달 가능
- [ ] 비로그인/CLIENT/SUPPLIER/ADMIN 역할별 메뉴·경로·리다이렉트 적합
- [ ] 이메일 가입/Reset/Google OAuth API 실검증 및 가상 데모 성공 제거
- [ ] NDA 후 `specItemId` 지원, 채팅 양방향, 계약 양측 서명
- [ ] 문의 1:1 등록/내 문의/운영자 답변/알림 deep link
- [ ] 정책·푸터 실운영 정보와 법률 검토/샌드박스 안내 승인
- [ ] 비지원 필터·취소 철회·1원 인증 발송 API를 구현된 것처럼 표시하지 않음
- [ ] PAY-01~06 합격 전 결제 플래그 OFF; 승인 후 필요한 최소 E2E 증거 확보
- [ ] 리뷰·정산은 실제 승인 데이터 vs fixture 시연 구분
- [ ] 매 변경 파일의 한국어 인접 테스트 / 최소 typecheck·빌드 / 필요한 화면 확인만 수행
- [ ] 서비스 배포 SHA·환경 변수 이름(값 제외)·API 호스트 기록

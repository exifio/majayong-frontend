# INTEGRATION_TASKS — 방식 B: 저장소별 실행 TASKS

> **작업본 안내:** 원본 자료집의 FE 기준은 `f9427a9`입니다. 현재 작업본의 코드 차이·경로·누락 자료는 [프론트엔드 작업 시작 안내](../FRONTEND_WORKSPACE.md)를 먼저 확인하세요. 원본의 과거 진단과 미실행 상태를 현재 사실로 단정하지 않습니다.


> 대상: **Integration 작업 AI 전용**. 다른 저장소 코드를 직접 수정하지 말고 공동 계약은 [통합 TASKS](../TASKS.md)의 Integration 담당으로 넘깁니다. 버전 v0.7.3, 기준 2026-11-05 (KST). 아래 작업은 모두 **미실행/대기**입니다.
>
> 각 태스크는 다른 AI가 읽어도 같은 결과를 내도록 파일·API·수용 기준·최소 QA를 명시했습니다. 작업에 명시되지 않은 전면 리팩터링/자동 테스트 대량 생성 금지.

| id | 우선순위 | 단계 | 작업 | 의존 | 난이도 |
|---|:---:|:---:|---|---|:---:|
| INT-00 | P0 | Now | FE/BE/디자인 SHA·계약 고정 | 없음 | 하 |
| INT-01 | P1 | Next | 로그인 후 실제 사용자 흐름 재현 | FE-01, FE-13, BE-04 | 중 |
| INT-02 | P0 | Now | 결제 승인·복구 FE/BE 계약 승인 및 PAY-01~06 | BE-00 | 상 |
| INT-03 | P1 | Next | 설계 통합 57보드/배포 go-no-go | FE-16, BE-11, INT-01, INT-02 | 중 |

## INT-00 — FE/BE/디자인 SHA·계약 고정

- **상태/난이도:** 진행 / 3개 저장소 SHA 확인; Vercel의 staging 명명 프로젝트는 Ready/Production; **DB ref·운영 DB 격리 및 승인 계정/절차 미확인**; 공식 계약 대조 미완 / 하 · **우선순위:** P0 · **단계:** Now.
- **선행:** 없음.
- **대상:** `FE routes/API proxy; BE openapi/vercel; 디자인 boards/decision docs`.
- **목표/범위:** 현재 세 SHA와 API PDF v1.0.1의 구버전 FE SHA 차이를 기록.
- **보존:** API 119개·역할·DB 스키마 불변.
- **기준선(2026-11-06):** FE `main` `84af24bcf7bfdabde5c65d8bae18d9e4b8b011bc` (로컬 HEAD와 GitHub main 일치); BE `main` `3601095b5d96b28eda0810bf3dd9682b12a0ec21`; 디자인 저장소 `main` `1f76f5b10f46b3c69987ab7b0f981b6ce5d1863d`. 문서의 디자인 기준 `claude-front` 커밋 `4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829`는 현재 브랜치 목록에는 없고, 디자인 저장소 `main`은 별도 기준으로 확인했다.
- **API 계약 근거:** API v1.0.1 PDF와 ERD는 FE 작업본에 없음. BE main의 [`openapi/openapi.yaml`](https://github.com/exifio/majayong-backend/blob/3601095b5d96b28eda0810bf3dd9682b12a0ec21/openapi/openapi.yaml)은 OpenAPI 3.1.0, `info.version: 0.7.0`, B API 문서다. 공식 v1.0.1과 동등하다고 간주하지 않는다.
- **완료 조건:** FE 배포 SHA, staging DB/project 식별·격리 근거, 승인된 테스트 계정/역할·접근 절차, 공식 API v1.0.1 대조 근거가 필요하다. 현재 확인된 상태 응답만으로 DB 격리나 계정 승인을 입증할 수 없어 미완료.
- **최소 QA/결과:** 2026-11-06 프로덕션 FE 무토큰 `GET /api/v1/me/notifications`에서 `401` 확인. 사용자 재확인: Vercel [`majayong-backend-staging`](https://vercel.com/exifio-4593s-projects/majayong-backend-staging)은 Ready/Production `main@3601095`; env settings의 `DATABASE_URL`·`SUPABASE_URL`은 Production scope Secret이고 project ref는 확인되지 않으며 Supabase integration도 없다. 조회된 `health-record-restore` (`wwkuktblvadeynufjllk`, INACTIVE/테이블 접근 불가)·`health` (`jleboocxejidigclepxt`, ACTIVE_HEALTHY/다른 서비스 schema)는 연결 근거가 아니다. 사용자 보고 `/health` 200·무인증 `/api/v1/me` 401은 DB 격리를 증명하지 않는다. FE-04 `FE-04-STAGING-20261106`은 BLOCKED: 공식 ADMIN bootstrap/승인 담당자와 작성자 계정 절차를 찾지 못함; staging 계정·문의 생성 및 API/DB 쓰기는 하지 않았다. 공식 API v1.0.1 미확인.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.
- **판정(2026-11-07 KST):** **staging demo GO.** INT-01 01~10, FE-12/17/18, FE-04/07/13, INT-02 승인·웹훅·수동 복구가 staging 실제 HTTP/브라우저로 PASS. **범위: 샌드박스 결제만.** production live 결제는 구성하지 않는다. Toss 테스트 키(`test_ck_`/`test_sk_`), staging URL, 테스트 웹훅으로 닫았고, 가상계좌 발급→입금처리→웹훅 **성공**·예치 `COMPLETED`까지 확인했다. 비밀번호 재설정과 1원 계좌 인증은 사용자 승인(D-35)에 따라 샌드박스 성공 화면으로 처리했다. FE-09는 세 관리자 화면 실제 API 저장 연결과 disputes 판정 E2E까지 확인했고, 자동 복구는 Vercel Cron(D-32)으로 연결됐다. production live Toss·실메일·실계좌 인증은 이 범위에서 제외한다. **production 분리(2026-11-07):** BE `majayong-backend-production.vercel.app`, FE `majayong-frontend-production.vercel.app`, 전용 Supabase Pro 인스턴스 `fynqcxfoylaljxmqumin`(Seoul, public schema), bucket `majayong-production`으로 분리 배포했다. staging과 DB·Storage·compute가 분리됐다.

## INT-01 — 로그인 후 실제 사용자 흐름 재현

- **상태/난이도:** PARTIAL / staging demo GO, production NO-GO / 중 · **우선순위:** P1 · **단계:** Next.
- **선행:** FE-01, FE-13, BE-04.
- **대상:** `CLIENT/SUPPLIER UI 전체 요청과 Network 로그`.
- **목표/범위:** NDA, specItemId, 지원, 채팅, 합의, 양측 서명 시나리오.
- **보존:** 승인된 테스트 계정·스테이징 데이터.
- **API 계약:** DEMO-01~07.
- **실행:** 관찰/미검증/오류를 별도 기록; 운영 데이터 변경 금지.
- **완료 조건:** 각 주요 단계 요청 ID/HTTP/화면/상태 동일, 실패·권한 1건.
- **최소 QA:** 실제 HTTP/화면 시나리오 1회, 불필요한 전체 반복 금지.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## INT-02 — 결제 승인·복구 FE/BE 계약 승인 및 PAY-01~06

- **상태/난이도:** 완료 / 승인 E2E·서명 웹훅·수동·자동 복구 PASS, production go-live는 INT-03 / 상 · **우선순위:** P0 · **단계:** Now.
- **선행:** BE-00.
- **대상:** `Toss sandbox FE/BE 계약, FE-12 예치 SDK, BE deposit confirm`.
- **목표/범위:** D-25 승인 계약(`POST /deposits` PENDING → Toss 승인 → `POST /deposits/{id}/confirm` 200 → `COMPLETED`/`DEPOSITED`)을 FE·BE가 같은 이름으로 사용한다.
- **보존:** `VITE_ENABLE_DEPOSIT=false` until all PASS. 생성 201/PENDING은 완료가 아니다.
- **API 계약:** `POST/GET /contracts/{id}/deposits`, `POST /contracts/{id}/deposits/{depositId}/confirm` body `{paymentKey,amount}`. 시크릿 키는 BE만.
- **실행:** PAY-01~06 증거/승인 후만 플래그 ON. 실PG가 없는 fixture는 실제 결제로 표시하지 않는다.
- **완료 조건:** sandbox에서 FE 결제창 → 성공 리다이렉트 → confirm 200 → 예치 완료, 실패/취소 시 PENDING 유지.
- **최소 QA:** PG 샌드박스만, no real charges.
- **확인 결과(2026-11-07 KST):** FE-12 `e5b668c` + staging API로 전체 승인 흐름 PASS. FE가 예치 `PENDING` 105,000원 생성 → Toss sandbox 가상계좌 발급 → Toss 대시보드 입금처리 → FE 성공 URL(`payment=success&paymentKey&orderId&amount`) → FE `confirm` 200 → DB 예치 `COMPLETED`·`pgKey` 저장·계약 `DEPOSITED`·`totalDeposited` 105,000·구간 2개. 성공/실패 리다이렉트 단위 테스트 3건, 전체 477/477. **웹훅:** staging에 `TOSS_WEBHOOK_SECRET`를 설정·재배포한 뒤 같은 결제로 서명 웹훅을 보내 **200 `COMPLETED`**, 위조 서명 **401**, 같은 이벤트 재전송 **200 멱등**(중복 완료 없음)을 확인했다. production FE는 `VITE_ENABLE_DEPOSIT=false`·클라이언트 키 미설정.
- **확인 결과(복구, 2026-11-07 KST):** ADMIN 수동 배치 `POST /admin/jobs/run`(D-30)을 추가하고 staging에서 누락 웹훅 복구를 검증했다. PENDING 예치를 15분 30초 전으로 조정한 뒤 실행 → `{success:true, actionsCount:1, failures:[]}`, Toss `GET /payments/orders/{orderId}`가 `DONE`을 반환해 예치 `COMPLETED`·계약 `DEPOSITED`·구간 2개. 자동 scheduler는 Vercel Cron이 `GET /internal/jobs/run`을 15분마다 호출하도록 연결했다(D-32). `CRON_SECRET` 불일치 401·secret 없음 503·정상 200을 staging에서 확인했고, Vercel Cron 등록과 수동 trigger 실행도 확인했다. production go-live는 INT-03 범위다. Toss 테스트 웹훅(`majayong-staging` → staging `/api/v1/integrations/toss/payment-events`)을 대시보드에 등록했고, 가상계좌 발급→대시보드 입금처리→실제 웹훅 전송 **200**·예치 `COMPLETED`까지 확인했다. 일반 결제 웹훅은 서명 헤더 없이 오므로 서버는 토스 결제 조회로 재검증한다. FE에는 테스트 `VITE_TOSS_CLIENT_KEY`와 `VITE_ENABLE_DEPOSIT=true`를 설정해 배포했고, 예치 버튼과 Toss 테스트 결제창 노출을 브라우저에서 확인했다. live 키·production 도메인은 이 범위에서 사용하지 않는다. 실카드 없이 가상계좌로 승인·웹훅·수동·자동 복구를 확인했다.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## INT-03 — 설계 통합 57보드/배포 go-no-go

- **상태/난이도:** PARTIAL / staging demo GO, production NO-GO / 중 · **우선순위:** P1 · **단계:** Next.
- **선행:** FE-16, BE-11, INT-01, INT-02.
- **대상:** `프론트 배포 사이트 1440/390, 실제 API, 법무·운영 체크`.
- **목표/범위:** A/B/C/D 분류별 수정 결과와 미검증 영역 기록.
- **보존:** FE 기존 React 보존, 실제 데이터 권한과 결제 보호.
- **API 계약:** G0~G5 게이트.
- **실행:** 사용자에게 미완료 기능을 실제 제공 기능으로 광고하지 않음.
- **완료 조건:** 출시/조건부 시연/보류 의사결정 문서 작성.
- **최소 QA:** 변경 범위 테스트+필요한 핵심 10단계 시연.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## 공통 개발 준수 사항

이 FE 저장소에서는 의존성과 인계 조건만 참고합니다. BE 코드 경로·명령은 별도 백엔드 저장소 기준이며, BE/INT 티켓을 이 저장소에서 대신 완료 처리하지 않습니다.


- [공통 규약](../AGENTS.md)의 실제 프론트/백 저장소별 실행 규칙을 모두 준수합니다.
- TypeScript strict, DTO 추론/unknown 타입 가드, `as any` 남용 금지. 라이브러리·테스트 도구는 현재 package.json 범위로 유지합니다.
- **테스트 인접형(Test Colocation)**: 대상 `Foo.ts` 옆 `Foo.test.ts` / `Foo.tsx` 옆 `Foo.test.tsx`; `test/describe/it` 제목은 한국어, 간결하게, 한 테스트는 하나의 행위.
- UI 컴포넌트는 Testing Library 의미 기반 `getByRole/getByLabelText`, 브라우저 E2E는 Playwright Locator. 함수/BE 단위 테스트에 Locator를 억지로 사용하지 않습니다.
- 기존 테스트가 `apps/web/src/test`에 있어도 이번 변경과 무관한 파일을 전부 이동하지 않습니다. 변경 코드만 신규/수정 인접 테스트로 관리하고 충돌/중복을 없앱니다.
- 서버 주소/비밀값/민감정보는 문서·테스트 결과에 쓰지 않고 실제 결제는 sandbox에서만 수행합니다.

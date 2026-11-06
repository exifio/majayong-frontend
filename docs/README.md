# Majayong — 디자인·API 연동 보존 개발 문서 v0.7.3

> **작업본 안내:** 원본 자료집의 FE 기준은 `f9427a9`입니다. 현재 작업본의 코드 차이·경로·누락 자료는 [프론트엔드 작업 시작 안내](FRONTEND_WORKSPACE.md)를 먼저 확인하세요. 원본의 과거 진단과 미실행 상태를 현재 사실로 단정하지 않습니다.


> 기준일 2026-11-05 (KST) · **GitHub 소스·문서 정적 비교로 작성, 실제 코드 수정·테스트·배포 없음** · 원본 API v1.0.1

## 이 프론트엔드 저장소에서 시작하기

[루트 작업 지침](../AGENTS.md) → [현재 작업본 안내](FRONTEND_WORKSPACE.md) → [FE 상세 티켓](tasks_split/FRONTEND_TASKS.md) 순서로 시작합니다. 로컬 HEAD `d402bbf`에는 이메일 가입 API 호출이 추가돼 있습니다. 아래 기존 진단은 `f9427a9` 기준입니다.

## 1. 이번 문서의 결론

- FE main `f9427a9a48d5fda88176570c6846c7fafe43bdee`의 **React/Vite/TypeScript 구조 유지**. BE main `a188fb27bed4e2a3f7daed88774648fa517034a8`의 `/api/v1` API 보존.
- 디자인은 기존 통합 저장소 `claude-front` `4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829`의 `docs/boards/*.dc.html` 57개와 11/04 수정 문서 참조.
- React에 같은 이름 화면 파일 53개가 있으므로 **대부분 유지/국소 수정**합니다. 신규 화면은 사용자 1:1 문의 `Help-Inquiry`와 운영자 문의 `Admin-Inquiries` **2개**. `Notify-*`는 기존 `Chrome.tsx` 드롭다운.
- 현재 디자인 변경 분류는 A27/B23/C2/D5 **잠정**. 실화면 렌더 비교 및 실HTTP E2E는 아직 수행하지 않았습니다.
- **배포 QA에 있던 가입 초기값 문제**는 현재 FE 코드에서 공란/미선택이지만, **실제 이메일 회원가입은 `setDevSession` 분기로 남아 있어 API 연결 작업 필요**. 재설정 페이지도 mock 중심.
- Toss sandbox 예치는 **P0 차단**: 201/PENDING을 결제 성공으로 표현 금지, PAY-01~06 검증 전 플래그 OFF.

## 2. 문서 목차: 기본 6개 + 비교 3개 + 작업 분리 3개

| 문서 | 어떤 용도인가요? |
|---|---|
| [AGENTS.md](AGENTS.md) | 모든 AI 공통 작업 표준(같은 수용 기준, 변경 범위, TS 안전성, **테스트 인접형·한국어**·간단한 Locator 컴포넌트 테스트) |
| [PRD.md](PRD.md) | 배포 QA + 57화면 통합의 요구사항/수용 기준, **기존 v0.7 PRD 원문 보존** |
| [DESIGN.md](DESIGN.md) | 공통/화면별 디자인 델타, 보존할 React 컴포넌트·상태·API 표시 |
| [PLAN.md](PLAN.md) | G0~G5 단계별 장기 전략/우선순위/병렬화 |
| **[TASKS.md](TASKS.md)** | **방식 A: FE·BE·Integration을 한 장에서 ID/담당/의존성으로 관리** |
| [README.md](README.md) | 이 문서, 실제 소스 근거/사용법/QA 안내 |
| [FRONTEND_COMPARISON_REPORT.md](FRONTEND_COMPARISON_REPORT.md) | React ↔ `claude-front` 코드 아키텍처/공통 디자인/API 비교·결론 9개 |
| [FRONTEND_SCREEN_MATRIX.md](FRONTEND_SCREEN_MATRIX.md) | **57개 모든 보드** A/B/C/D·라우트·파일·API 분류·원본 링크·작업 난이도 |
| [FRONTEND_INTEGRATION_PLAN.md](FRONTEND_INTEGRATION_PLAN.md) | 공통 수정→개별 화면→API 보존→QA의 실행 순서, 위험·롤백·병렬화 |
| **[tasks_split/FRONTEND_TASKS.md](tasks_split/FRONTEND_TASKS.md)** | **방식 B: FE AI만 읽는 단계별 상세 티켓** |
| **[tasks_split/BACKEND_TASKS.md](tasks_split/BACKEND_TASKS.md)** | **방식 B: BE AI만 읽는 단계별 상세 티켓** |
| **[tasks_split/INTEGRATION_TASKS.md](tasks_split/INTEGRATION_TASKS.md)** | 방식 B에서 FE↔BE 인계/계약/PAY 검증을 조율하는 티켓 |

**두 TASK 방식은 서로 다른 요구사항이 아닙니다.** 같은 33개 ID(FE 17/BE 12/Integration 4)를 목적에 따라 다른 뷰로 표현한 것입니다. 하나의 작업을 중복 수행하지 않습니다.

## 3. GitHub 출처 (기준 SHA 고정)

- FE `main` `f9427a9a48d5fda88176570c6846c7fafe43bdee` — [https://github.com/exifio/majayong-frontend/tree/f9427a9a48d5fda88176570c6846c7fafe43bdee](https://github.com/exifio/majayong-frontend/tree/f9427a9a48d5fda88176570c6846c7fafe43bdee)
- BE `main` `a188fb27bed4e2a3f7daed88774648fa517034a8` — [https://github.com/exifio/majayong-backend/tree/a188fb27bed4e2a3f7daed88774648fa517034a8](https://github.com/exifio/majayong-backend/tree/a188fb27bed4e2a3f7daed88774648fa517034a8)
- 디자인 `claude-front` `4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829` — [https://github.com/exifio/majayong/tree/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829](https://github.com/exifio/majayong/tree/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829)
- API 로켓단 v1.0.1 (2026-11-05) — `references/로켓단_API명세서_v1.0.1_시연안정화.pdf`; 업무 API 119개는 소스 수준 목록, **실HTTP 전수 검증 아님**.
- 기존 ERD v0.7 — `references/ERD-v0.7-최종본.md`; PDF·ERD는 변경하지 않았습니다.
- 사용자가 전달한 배포 감사 요약 — 가입 예시값·정책 초안·결제 오인 문구·FAQ·공지·인증 후 미검증(감사 원본 로그·화면은 제공되지 않음).


- UI 변경 결정: [11/04 변경](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/변경사항-1104.md), [디자인 보완](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/디자인-보완-1104.md), [디자인 시스템 최종본](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/디자인-시스템-v0.2.1-최종본.md), [결정메모](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/결정메모-프론트엔드-착수-기준.md).
- FE 패키지: [apps/web/package.json](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/package.json), [routes.ts](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/app/routes.ts), [api.ts](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/lib/api.ts).
- BE 운영계약: [src/modules/support/http.ts](https://github.com/exifio/majayong-backend/blob/a188fb27bed4e2a3f7daed88774648fa517034a8/src/modules/support/http.ts), [openapi/openapi.yaml](https://github.com/exifio/majayong-backend/blob/a188fb27bed4e2a3f7daed88774648fa517034a8/openapi/openapi.yaml), [vercel.json](https://github.com/exifio/majayong-backend/blob/a188fb27bed4e2a3f7daed88774648fa517034a8/vercel.json).

## 4. 작업 AI가 실제 개발을 시작할 때

1. [AGENTS.md](AGENTS.md)를 읽고 대상 repository/branch/현재 commit과 작업 범위를 **확인**합니다.
2. PM 통합 조율이면 [TASKS.md](TASKS.md) **방식 A**, FE/BE 독립 작업 AI이면 `tasks_split/` **방식 B**를 사용합니다.
3. 화면별 세부는 [FRONTEND_SCREEN_MATRIX.md](FRONTEND_SCREEN_MATRIX.md), 비교·기술 근거는 [FRONTEND_COMPARISON_REPORT.md](FRONTEND_COMPARISON_REPORT.md), 개발 순서·의존성은 [FRONTEND_INTEGRATION_PLAN.md](FRONTEND_INTEGRATION_PLAN.md)를 확인합니다.
4. **한 번에 하나의 ID**, 파일 변경 범위와 보호 API를 고정합니다. 개발 시작 전 기존 `Live*`, 토큰/Role, `DEMO` 사용 여부를 확인합니다.
5. **변경 영역만** 한국어 인접 테스트→타입 검사/빌드→필요 최소 브라우저/HTTP QA. 결과의 실제 증거를 TASK에 기록합니다.
6. 프로덕션 또는 실제 운영 DB에 fixture/reseed/임의 상태 변경 금지. 결제는 승인된 staging sandbox 환경에서만.

## 5. 실제 기술 스택과 명령어

**React FE** `exifio/majayong-frontend`:

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm build
```

- `pnpm test` 전체 실행은 공통 변경/릴리스나 영향 범위가 넓을 때. 평소에는 `pnpm --filter @majayong/web exec vitest run src/pages/public/Signup.data.test.ts` 등 **프로젝트 runner가 허용하는 범위 테스트**를 사용합니다.
- 파일: `apps/web/src/pages/{public,client,supplier,admin}`, `apps/web/src/components`, `packages/types`.
- Vitest + Testing Library; **새 단위/컴포넌트 테스트는 구현 옆** `.test.ts(x)`. 기존 `apps/web/src/test/` 일괄 이동 금지.

**BE** `exifio/majayong-backend`:

```bash
npm ci
npm run typecheck
npm run test:a
npm run test:b
npm run test:c
npm run build
```

- Jest + Node test 병행. 각 변경 범위에 맞는 테스트 스크립트/필터를 확인 후 최소 실행. 일부 테스트는 PostgreSQL/환경 변수·fixture가 필요할 수 있습니다.
- 계좌/PG 비밀키/토큰/DB URL은 문서·로그에 붙이지 않습니다.

**배포 연결**: 프런트는 상대 경로 `/api/v1` → `apps/web/vercel.json`의 `/api/proxy` rewrite. 백엔드 `/health`는 API prefix 밖에 있습니다. **프런트 `/health`의 HTML 반환만 보고 BE health 실패로 판정하면 안 됩니다**. 실제 호스트/프록시 목적지를 staging에 확인해야 합니다.

## 6. 종료 확인

- 이 패키지는 사용자 제공 API PDF, 기존 PRD/ERD, GitHub 3개 저장소의 소스와 디자인 변경 문서에 근거해 작성했습니다.
- **한 작업도 Done으로 표시하지 않았습니다**. 코드 변경·실제 디자인 렌더/배포/실HTTP 시나리오 실행은 이번 범위 밖입니다.
- 현재 기준 이슈: 이메일 가입/재설정 실제 API 공백, 문의 UI 2개, 결제 P0, 운영 법률/연락처 승인, 57보드의 실제 1440·390 화면 QA.

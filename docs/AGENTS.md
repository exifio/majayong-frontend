# AGENTS.md — 마자용 공통 AI 개발 실행 규약

> **작업본 안내:** 원본 자료집의 FE 기준은 `f9427a9`입니다. 현재 작업본의 코드 차이·경로·누락 자료는 [프론트엔드 작업 시작 안내](FRONTEND_WORKSPACE.md)를 먼저 확인하세요. 원본의 과거 진단과 미실행 상태를 현재 사실로 단정하지 않습니다.


> 개발 문서 **v0.7.3 · 2026-11-05 (KST)** | 읽기 전용 코드 비교 반영 | 모든 에이전트(Codex, Claude Code, Cursor 포함)에 동일하게 적용
>
> 목표는 **같은 입력과 명세를 받은 AI가 기능·화면·API·오류 처리·완료 증거에서 동일한 결과에 도달하도록 하는 것**입니다. 동일한 코드 문자열의 생성까지 보장하는 규칙은 아닙니다.
>
> **이번 패키지 제작 과정에서 소스 코드를 수정하거나 커밋/배포/테스트 실행하지 않았습니다.** 아래는 차후 실제 개발 AI의 작업 규칙입니다.

## 0. 반드시 고정할 입력과 작업 범위

- React FE `exifio/majayong-frontend` `main` **`f9427a9a48d5fda88176570c6846c7fafe43bdee`**: 실제 개발·배포 기반. React 18, TypeScript, Vite 5, React Router 6, pnpm.
- BE `exifio/majayong-backend` `main` **`a188fb27bed4e2a3f7daed88774648fa517034a8`**: Express 5, Prisma, API `/api/v1`.
- UI 참조 `exifio/majayong` **`claude-front` `4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829`**: 디자인 보드 57개, 별도 Node/HTML 템플릿 앱. **디자인 참조만. FE로 이식하거나 전체 덮어쓰기 금지**.
- 근거: `references/로켓단_API명세서_v1.0.1_시연안정화.pdf`와 `references/ERD-v0.7-최종본.md`(PDF 기준일 2026-11-05). 업무 API 119개는 소스상 존재 확인, **실HTTP 전수 검증 아님**.
- 현재 HEAD가 달라지거나 배포 SHA가 다른 경우 **작업 전에 차이와 충돌 가능성을 기록**하고, 문서의 오래된 근거를 현재 사실로 단정하지 않는다.
- 과업 선택: `TASKS.md`(방식 A, FE/BE/Integration 통합) **또는** `tasks_split/FRONTEND_TASKS.md`, `BACKEND_TASKS.md`(방식 B, 담당별)를 선택한다. **두 방식의 ID는 동일**. 중복 실행 금지.

## 1. AI와 팀의 결정 우선순위

1. **API method/URL/권한/실제 DTO**: v1.0.1 API 명세의 현재 구현과 최신 OpenAPI·FE 타입을 대조한다. 새 API나 응답 필드는 FE와 BE의 사전 계약 합의 없이는 만들지 않는다.
2. **사용자 동작/제품 정책**: `PRD.md` 델타 → 보존된 v0.7 원문. 목표가 구현됐다고 추론하지 않는다.
3. **스타일·상호작용**: `FRONTEND_SCREEN_MATRIX.md` → `DESIGN.md` → `claude-front/docs/boards/<Screen>.dc.html` → 디자인 시스템 v0.2.1·결정메모. **화면 요구가 API와 충돌하면 API에 없는 기능은 보류하고 보고**한다.
4. **순서/선행조건**: `PLAN.md`와 `FRONTEND_INTEGRATION_PLAN.md`, `TASKS.md`의 동일 ID.
5. **현행 FE 구현**: 이미 동작하는 `Live*`와 라우트/가드/DTO/토큰 로직을 우선 재사용한다. UI 시안의 별도 Node 템플릿은 앱 소스로 가져오지 않는다.

각 작업 시작 전에 다음을 짧게 작성한다: **작업 ID / 기준 SHA / 바꿀 파일 / 건드리면 안 되는 파일 / 적용 API / 기대 결과 / 실패·빈 상태 / 통과 조건 / 필요한 QA**. 문서가 모호하면 좁은 변경을 우선하고 가정을 표시한다.

## 2. 모듈·소유권·변경 통제

| 범위 | FE 소유 | BE 소유 | Integration 협의 |
|---|---|---|---|
| 디자인 | `apps/web/src/pages/**`, `components/ui/**`, `components/layout/**`, `styles/**` | 변경 없음 | 기존 계약·상태 표시 불일치만 기록 |
| 화면·API 어댑터 | `apps/web/src/lib/**`, `pages/**`, `components/*/Live*.tsx`, `packages/types/**` | DTO/라우트 `src/modules/**` | 실제 응답 타입·서버 권한, 새 operation 승인 |
| 인증/NDA/지원 | 토큰 갱신·가드·기존 `specItemId` 전달 보호 | 서버 소유권/역할/NDA·신청 검증 | 승인된 테스트 계정으로 최소 실HTTP |
| 결제 | `LiveEscrow`, 플래그·로딩/실패/완료 상태 | Toss PG 승인·웹훅·재조회·DB 전이 | 승인된 새 API 계약 + PAY-01~06 |

- FE는 React 구조를 유지한다. `src/index.ts`/`web/templates/*.html` 등 디자인 서버 코드를 복제하지 않는다.
- **디자인과 API 연동을 분리**한다. 공통 푸터·메뉴는 한 AI가 먼저 변경한다. 다른 AI는 같은 공통 파일을 동시에 고치지 않는다.
- FE/BE의 스키마·OpenAPI·공용 타입을 임의로 광범위 변경하지 않는다. 계약 변경은 담당 양측의 합의 후 별도 티켓과 증거가 필요하다.
- 공개/인증/역할 권한은 클라이언트 표시가 아니라 **서버 검증**이 최종 기준이다.
- 서비스 기획의 `'/api/c'`, `'/api/s'`, `'/api/admin'`는 오래된 제안 경로다. **현행 prefix는 `/api/v1`**. 문의 경로는 `/support/inquiries`, 운영자 `/admin/support/inquiries`다.
- 디자인의 가상 금액·상태·이메일·업체명은 실데이터로 오인하여 운영 화면에 노출하지 않는다. `DEMO`의 실제 사용자 전파 가능성도 점검한다.

## 3. 보존할 핵심 연결(변경 금지에 준하는 영역)

- `app/auth.ts`, `app/session.tsx`, `app/google-oauth.ts`, `lib/api.ts`의 로그인·Refresh 회전·401 재시도. 실제 회원가입 미연동 문제를 고치더라도 구글 분기를 무너뜨리지 않는다.
- `LiveProjectList`, `LiveProjectDetail`, `LiveQuoteWrite`의 **NDA 동의 → 상세 `specItemId` → 항목별 지원**, 지원 결과의 서버 ID 사용.
- `LiveChat`, `LiveAgreement`, `LiveContract`의 applicationId/contractId·문서 해시·중복 요청·상태 차단.
- `/api/v1`의 `{data}` 성공·`{error: {code,message,requestId}}` 실패 봉투, Bearer 인증, 실제 HTTP 상태.
- `VITE_ENABLE_DEPOSIT` **OFF**. `POST /contracts/{contractId}/deposits`의 `201`/`PENDING`은 **결제 요청 생성**, `COMPLETED/DEPOSITED`가 아니다. 승인된 sandbox PG 증거 전 성공 UI·자동 거절 금지.
- 디자인에만 있는 취소 철회와 계좌 1원 인증 **발송** 등은 현재 API로 구현됐다고 표시하지 않는다. 검색 키워드·정렬·마감필터의 HTTP 노출도 계약 확인 전 미완성.

## 4. TypeScript 작성 표준 — TOAST UI 나쁜 습관 방지

참고: [TOAST UI — 올해 버려야 할 타입스크립트 나쁜 버릇 10가지](https://ui.toast.com/posts/ko_20210217). 정책은 원칙적으로 아래 10개이며 예외는 코드 리뷰 근거와 함께 최소화한다.

1. `strict: true`와 프로젝트의 기존 타입 검사 설정을 유지한다. 컴파일 오류를 덮는 대신 원인을 수정한다.
2. 정상적인 값 `0`, `false`, `''`도 보존할 때는 `||` 대신 `??` 또는 명시적 분기를 사용한다.
3. `any`를 편의상 사용하지 않는다. 외부 입력은 `unknown`으로 받고 검사한 뒤 좁힌다.
4. 검증 없이 `as SomeType`으로 API 응답을 정상 데이터라 단정하지 않는다. 타입 가드·스키마 검사·기존 타입을 사용한다.
5. 테스트에서도 `as any`로 문제를 숨기지 않는다. 작고 타입이 정확한 fixture를 사용한다.
6. 대부분의 필드를 선택 속성(`?`)으로 만드는 타입 대신 실제 상태를 표현하는 판별 유니언·명시적 필수 필드를 사용한다.
7. 제네릭 타입 이름은 의미가 드러나게 작성한다. 작은 지역 타입의 관례적 `T`는 허용하되 중첩 때는 구체적으로 이름 붙인다.
8. 숫자/문자열을 암묵적으로 `if (value)` 검사해 `0`·빈 문자열을 놓치지 않는다. `undefined/null`과 공백 문자열을 구분한다.
9. 불필요한 `!!value` 대신 기대하는 조건을 직접 비교해 의도를 명확히 한다.
10. `== null`의 양쪽 nullish 검사를 활용할 수 있으나 팀 코드 스타일을 우선하고 의도를 설명한다. 무분별하게 `null`과 `undefined`를 섞지 않는다.

부가 기준: `!` 단언의 무분별한 사용, 빈 `catch`, `@ts-ignore` 등의 문제 은폐를 지양한다. 변경 스코프와 무관한 일괄 린트/리팩터링은 하지 않는다.

## 5. 테스트 규약 — **테스트 인접형(Test Colocation)** 우선

**단위 테스트와 컴포넌트 테스트 파일을 구현 파일과 같은 디렉터리에 둔다.** 1개 원본 파일의 핵심 동작을 이해하기 쉽게 검증한다.

```text
apps/web/src/pages/public/
  Signup.tsx
  Signup.test.tsx
  Signup.module.css
apps/web/src/components/project/
  LiveQuoteWrite.tsx
  LiveQuoteWrite.test.tsx
apps/web/src/lib/
  payment-status.ts
  payment-status.test.ts
src/modules/market/  # majayong-backend 저장소 기준
  project-search.ts
  project-search.b.test.ts
```

- **파일명은 테스트 러너와 일치**시킨다. React/Vitest: `모듈명.test.ts`·`.test.tsx`. 백엔드는 기존 실제 실행 스크립트를 따르며 **B 영역 `모듈명.b.test.ts`, C 영역 `.c.test.ts`, 통합 `.int.test.ts`**, A/Jest는 구성에 맞는 `.test.ts` 형식으로 구현 옆에 둔다. 단순히 이름만 `.test.ts`로 바꿔 실제 CI에서 누락되지 않게 한다. **테스트명과 주석은 한국어**, 함수·변수/타입 식별자는 영문 TypeScript 관례.
- 복잡한 공용 테스트 프레임워크/헬퍼보다 **하나의 시나리오, 짧은 준비, 명확한 기대값**을 선호한다. 정상 1개 + 중요한 실패/권한/중복 1개 우선. 테스트 수 늘리기 금지.
- **순수 로직 단위 테스트는 Locator를 사용하지 않는다.** React 컴포넌트는 Testing Library의 `getByRole`, `getByLabelText`, `findByRole`; 브라우저 E2E는 Playwright의 `getByRole`, `getByLabel`, `getByTestId` 등 **의미 기반 Locator** 우선. 깨지기 쉬운 위치/복잡한 CSS 선택자 금지.
- 전체 사용자 흐름의 E2E는 `tests/e2e/` 등 기존 프로젝트 기준의 전용 폴더에 두어도 된다. *인접형은 단위·컴포넌트 테스트 원칙*.
- **기존** `apps/web/src/test/*.test.tsx`, 백엔드 루트 `tests/` 및 `src/*.int.test.ts`를 이번 변경 이유만으로 일괄 이전하지 않는다. 변경·신규 테스트부터 인접형을 적용한다.

간단한 예시(컴포넌트 실제 라벨 확인 후 맞춤):

```tsx
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Signup from './Signup'; // 예시: 실제 Provider가 필요한지 확인

test('회원가입 화면에서 이메일 입력값이 비어 있다', () => {
  render(<Signup />);
  expect(screen.getByRole('textbox', { name: /이메일/ })).toHaveProperty('value', '');
});
```

주의: 위 UI 예시는 라우터/세션 provider가 필요한 실제 컴포넌트에서는 그대로 실행되지 않을 수 있다. **실제 소스의 기본 export와 provider를 확인해 간단히 작성**한다. Provider 없이 테스트하려고 제품 컴포넌트를 재설계하지 않는다.

```ts
// Signup.data.test.ts — Signup.data.ts와 같은 폴더
import { expect, test } from 'vitest';
import { passwordError } from './Signup.data';

test('비밀번호가 8자보다 짧으면 오류를 알려준다', () => {
  expect(passwordError('abc')).not.toBeNull();
});
```

검증 비용 기준: 문구·CSS 변경 → 타입/빌드와 변경 화면 수동 확인, 상태 변경 → 관련 인접 테스트, API/인증 → 해당 HTTP·역할 테스트, Toss/금액 전이 → **PAY-01~06** sandbox 증거. 단순 화면 하나마다 전체 E2E 실행 금지.

## 6. 종료 보고/Done 판정

```text
작업 ID: FE-## / BE-## / INT-##
저장소 / 브랜치 / HEAD SHA:
변경 파일(신규 파일 포함):
이번 작업에서 변경하지 않은 보호 영역:
API method/URL·DTO(해당 시):
재현 절차와 기대 결과 / 확인된 실제 결과:
실행한 한국어 인접 테스트·타입 검사·빌드·브라우저/실HTTP 테스트:
미실행 항목과 이유 / 배포 SHA / 서버 상태:
추가로 협의할 사항:
```

`Done`은 **코드 작성**이 아니라 해당 수용 기준과 관련 테스트/실데이터 확인의 증거가 있다는 뜻이다. API `201` 예치 생성·Mock fixture·소스 리뷰만으로 시연 성공이라 주장하지 않는다. 테스트 계정 비밀번호·PG 시크릿·정산 계좌 등 민감정보는 문서와 로그에 남기지 않는다.

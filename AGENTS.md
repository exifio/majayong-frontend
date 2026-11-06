# Majayong 프론트엔드 작업 지침

이 저장소는 React 18 + TypeScript + Vite 프론트엔드입니다. 사용자 요청을 먼저 따르고, 아래 지침과 [공통 개발 규약](docs/AGENTS.md)을 함께 적용합니다. 공통 규약의 문서 경로는 이 저장소의 `docs/` 기준으로 해석합니다.

## 먼저 읽을 문서

1. [현재 작업본 안내](docs/FRONTEND_WORKSPACE.md): 기준 SHA 차이, 실제 경로, 제공되지 않은 자료.
2. [프론트엔드 티켓](docs/tasks_split/FRONTEND_TASKS.md): FE-00~FE-16 중 요청받은 작업 하나.
3. 해당 작업의 [PRD](docs/PRD.md), [디자인 규칙](docs/DESIGN.md), [57화면 비교표](docs/FRONTEND_SCREEN_MATRIX.md).
4. 순서·의존성은 [PLAN](docs/PLAN.md), [통합 실행 계획](docs/FRONTEND_INTEGRATION_PLAN.md), [통합 TASKS](docs/TASKS.md).

`docs/tasks_split/BACKEND_TASKS.md`와 `INTEGRATION_TASKS.md`는 의존성과 인계 조건을 확인하는 참고 자료입니다. 이 저장소에서 BE 코드를 구현하거나 FE·BE 티켓을 중복 실행하지 않습니다.

## 시작할 때

- `git status --short`, `git branch --show-current`, `git rev-parse HEAD`로 작업본과 기존 변경을 확인합니다. 다른 작업의 파일은 보존합니다.
- 작업 ID, 기준 SHA, 변경 파일, 보호할 코드, API method/경로, 정상·실패·빈 상태, 최소 검증을 짧게 기록합니다.
- 원본 문서는 FE `f9427a9` 시점의 정적 조사입니다. 현재 사실은 소스와 필요한 실제 검증으로 확인하며, 특히 FE-01 가입 API를 이미 추가한 코드를 중복 구현하지 않습니다.
- 문서의 `개발 실행 X/금지`, `미실행/대기`는 원본 자료집 제작 당시의 범위를 설명합니다. 이후 사용자에게 요청받은 티켓 작업을 금지하는 지시가 아닙니다. 현재 사용자 요청이 문서 정리이면 기능 코드를 바꾸지 않습니다.

## 구현 경계

- `apps/web/src`와 `packages/types`의 기존 구조, UI 컴포넌트, 디자인 토큰, `Live*`를 재사용합니다. 디자인 참조 앱의 Node/HTML 서버를 이식하지 않습니다.
- `app/auth.ts`, `session.tsx`, Google OAuth, `lib/api.ts`의 토큰 갱신·401 재시도, NDA→`specItemId`→지원, 채팅·합의·서명 연결을 보호합니다.
- API prefix는 `/api/v1`입니다. 실제 method/DTO와 권한을 확인하며 미합의 API를 만들지 않습니다. BE 변경이 필요하면 해당 FE 티켓에 필요한 계약과 관련 BE/INT ID를 기록합니다.
- `VITE_ENABLE_DEPOSIT`는 PAY-01~06 sandbox 검증 전 OFF입니다. 예치 생성 `201/PENDING`을 결제 완료로 표시하지 않습니다.
- 필요한 PDF·ERD·디자인 보드 원본은 [누락 자료 안내](docs/FRONTEND_WORKSPACE.md#미제공-자료와-외부-확인)에 있습니다. 자료가 없는 비교·계약 검증을 완료했다고 기록하지 않습니다.

## 검증과 종료

- 새로 만들거나 수정하는 단위·컴포넌트 테스트는 구현 파일 옆 `.test.ts(x)`에 두고 한국어 테스트명과 의미 기반 Locator를 사용합니다. 기존 `src/test/`는 일괄 이동하지 않습니다.
- 기능 변경은 관련 Vitest, `pnpm typecheck`, `pnpm build`와 필요한 화면·HTTP 검증을 수행합니다. 문서만 수정한 경우 경로·링크·Git 추적 여부를 검사하고 런타임 테스트 생략 이유를 기록합니다.
- `TASKS.md`는 통합 색인, `tasks_split/FRONTEND_TASKS.md`는 FE 상세 기록입니다. 상태를 바꾸면 두 파일의 동일 ID를 맞춥니다. 완료는 수용 기준의 실제 증거가 있을 때만 표시합니다.
- 종료 시 변경 파일, 실행한 검사와 결과, 미검증 항목, 필요한 외부 자료·결정을 보고합니다. 배포·실HTTP·PG 성공은 각각의 증거가 필요합니다.

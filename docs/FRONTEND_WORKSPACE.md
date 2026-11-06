# 프론트엔드 작업 시작 안내

정리일: 2026-11-05 (KST). 사용자가 요청한 범위는 **프론트엔드 작업용 문서 정리**입니다. 이번 정리로 기능 개발·배포·실HTTP QA가 수행된 것은 아닙니다.

## 읽는 순서와 티켓 운영

1. [저장소 지침](../AGENTS.md)과 [공통 규약](AGENTS.md)을 읽습니다.
2. 이 문서의 현재 작업본과 누락 자료를 확인합니다.
3. [FE 상세 티켓](tasks_split/FRONTEND_TASKS.md)에서 요청받은 ID 하나를 선택합니다. [통합 TASKS](TASKS.md)는 같은 ID의 의존성과 상태를 함께 보는 색인입니다.
4. [PRD](PRD.md)의 수용 기준, [화면 비교표](FRONTEND_SCREEN_MATRIX.md)의 해당 화면, [DESIGN](DESIGN.md)의 공통 규칙을 읽습니다.
5. [PLAN](PLAN.md)과 [통합 실행 계획](FRONTEND_INTEGRATION_PLAN.md)에 따라 선행 작업과 검증 범위를 정합니다.

FE 상세 티켓의 상태·증거를 갱신하면 통합 TASKS의 동일 ID도 맞춥니다. BE/INT 상세 티켓은 인계 참고용이며 이 저장소에서 대신 완료 처리하지 않습니다.

## 현재 작업본과 원본 문서의 기준

아래는 문서 정리 시점의 정적 확인과 2026-11-06 INT-00 재확인 결과입니다. 프로덕션 FE 배포 SHA, staging DB/project 식별·격리 근거, 승인된 관리자·작성자 계정 접근 경로, 공식 API v1.0.1 대조는 별도 확인이 필요합니다.

| 항목 | 확인 내용 |
|---|---|
| 저장소 | `exifio/majayong-frontend` |
| 로컬 브랜치 / HEAD | `main` / `84af24bcf7bfdabde5c65d8bae18d9e4b8b011bc` (2026-11-06 확인, GitHub `main`과 일치) |
| 원본 문서의 FE 기준 | `f9427a9a48d5fda88176570c6846c7fafe43bdee` |
| 원본 문서의 BE 기준 / 현재 BE main | 원본 기준 `a188fb27bed4e2a3f7daed88774648fa517034a8`; 현재 GitHub `main` `3601095b5d96b28eda0810bf3dd9682b12a0ec21` |
| 원본 디자인 기준 / 현재 디자인 main | 원본 `claude-front` 커밋 `4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829`; 현재 `main` `1f76f5b10f46b3c69987ab7b0f981b6ce5d1863d` (현재 브랜치 목록에 `claude-front` 없음) |
| 배포·staging 확인 | 프로덕션 FE 배포 SHA 미확인. Vercel project [`majayong-backend-staging`](https://vercel.com/exifio-4593s-projects/majayong-backend-staging)은 사용자 재확인 기준 Ready/Production, `main@3601095`이며 `DATABASE_URL`·`SUPABASE_URL`은 Production 범위 Secret으로 project ref는 화면에서 확인되지 않음. Supabase integration 미설치. `/health` 200·무인증 `/api/v1/me` 401은 사용자 보고이며 DB 격리를 증명하지 않는다. `health-record-restore` (`wwkuktblvadeynufjllk`, INACTIVE/테이블 접근 불가)와 `health` (`jleboocxejidigclepxt`, ACTIVE_HEALTHY/다른 서비스 schema)는 이 배포와 연결되지 않았음 |
| 기존 사용자 파일 | 추적되지 않은 `api-contract-overview.html` 보존. 공식 API 계약을 대신하는 자료로 승격하지 않음 |

원본 자료집의 SHA·과거 진단은 출처를 보존하기 위해 유지했습니다. 아래 현행 코드 메모와 함께 읽어야 하며, 원본의 `미실행/대기`를 현재 버그나 완료 상태로 단정하면 안 됩니다. `PRD.md`의 v0.7 원문 부록도 보존했습니다.

### 현재 코드에서 확인한 차이

| 대상 | 현재 정적 근거 | 다음 작업에서 확인할 것 |
|---|---|---|
| FE-01 이메일 가입 | 기준 이후 `44ab993`, `d402bbf`에서 변경. `app/auth.ts`의 `registerWithPassword`가 `/auth/register`를 호출하고, `app/session.tsx`와 `Signup-Client.tsx`·`Signup-Supplier.tsx`에서 사용 | 새로 연결하기 전에 현재 구현을 검토. 실제 가입·역할·프로필 저장·새로고침, 약관 버전, 가입 중 비밀번호 보관·삭제를 수용 기준에 따라 확인 |
| FE-01 관련 기존 테스트 | `apps/web/src/test/Signup-{Role,Client,Supplier}.test.tsx`, `email-signup-flow.test.tsx`가 존재 | 이번에는 실행하지 않음. 후속 변경 테스트는 구현 옆에 추가하고 기존 테스트는 보존 |
| FE-02 재설정 | `/reset`은 빈 이메일로 시작하고 `?token=`으로 confirm 단계에 진입; request/confirm은 `/api/v1/auth/password-reset/{request,confirm}` 연결, 인접 `Reset.test.tsx` 보유 | 사용자 결정으로 실제 이메일 발송은 현재 단계에서 보류. 시연 성공 화면은 전송 가정을 표시하되 실제 미발송도 알린다. API request/confirm은 실제 호출로 유지; staging request 200은 미검증. BE-12는 발송 재개 시 안전 게이트 필요 |
| FE-03/04 문의 | `Help-Inquiry.tsx`와 `Admin-Inquiries.tsx`가 구현되어 사용자 문의 작성/조회와 운영자 목록/답변을 분리한다 | FE-03 첨부는 업로드 계약 후속. FE-04 staging 검증은 DB 격리·공식 ADMIN 생성·작성자 계정 접근·승인된 비밀 공유 경로가 준비될 때까지 BLOCKED |
| FE-14 채팅 진입 | `app/App.tsx`의 `ChatIndex`에 `p-ondo` 기반 고정 이동이 남아 있음 | BE-04 확인 후 사용자 채팅 목록/빈 상태로 전환 |
| FE-12 예치 | `.env.example`의 `VITE_ENABLE_DEPOSIT=false`, `lib/feature-flags.ts`는 명시적 `true`만 활성화 | 현재 실행·배포 환경값과 PAY-01~06 증거는 별도 확인. 정리 작업에서 플래그를 변경하지 않음 |

문서 기준 이후 차이는 `git diff f9427a9a48d5fda88176570c6846c7fafe43bdee HEAD -- apps/web/src`로 확인할 수 있습니다. 코드에 API 호출이 있다는 사실은 실제 HTTP 성공을 증명하지 않습니다.

## 실제 경로와 실행 환경

| 문서의 경로 표기 | 이 저장소에서의 경로 |
|---|---|
| `public/`, `client/`, `supplier/`, `admin/` | `apps/web/src/pages/` 아래 |
| `app/`, `components/`, `lib/`, `styles/` | `apps/web/src/` 아래 |
| `packages/types/` | 저장소 루트의 공용 타입 패키지 |
| FE / BE / INT 상세 티켓 | `docs/tasks_split/{FRONTEND,BACKEND,INTEGRATION}_TASKS.md` |
| API PDF·ERD의 `references/` | 원본 자료집의 상대 경로. 현재 저장소에 파일 없음 |
| `claude-front/docs/boards/` 및 한글 디자인 문서 | 별도 디자인 저장소 경로. 현재 FE 소스 경로가 아님 |

Node.js 22 이상, pnpm 10이 필요합니다. 개발 실행·환경 파일 안내는 [루트 README](../README.md#development)를 따릅니다. 현재 Vite는 `apps/web`에서 실행되므로 브라우저 환경 파일은 `apps/web/.env.local`을 사용합니다. 기존 파일을 덮어쓰거나 비밀값을 문서에 복사하지 않습니다.

- 개발 MSW: `VITE_USE_MOCK`가 `false`가 아니면 개발 모드에서 시작합니다.
- 로컬 실API: `VITE_USE_MOCK=false`, 별도 백엔드 `http://localhost:3000`; `apps/web/vite.config.ts`의 `/api` 프록시를 사용합니다.
- Vercel: `apps/web/vercel.json`의 `/api/v1/*` → `/api/proxy` rewrite와 서버 환경 변수 `BACKEND_API_URL`을 사용합니다. 프록시 설정만으로 백엔드 상태를 확정하지 않습니다.
- `GET /health`는 백엔드 호스트에서 확인합니다. FE `/health`의 SPA HTML을 BE 장애 증거로 사용하지 않습니다.
- Vitest 기본 탐색으로 인접형 `.test.ts(x)`를 실행할 수 있습니다. 현재 러너 설정을 유지하며 테스트 폴더 전체를 옮기지 않습니다.

## 착수 순서와 완료 게이트

FE-00은 보드에서 완료로 기록되어 있습니다. INT-00은 2026-11-06 기준 현재 FE/BE/디자인 저장소 SHA와 프로덕션 API 401을 확인했지만, 프로덕션 배포 SHA·staging 직접 URL/승인 환경·공식 API v1.0.1 대조 근거가 없어 완료 처리하지 않습니다.

- 공개 진입: FE-01은 수용 기준 완료 기록을 유지합니다. FE-02의 staging 메일 발송·request 검증은 BE-12 메일 안전 게이트 완료 후 진행합니다.
- 공통 UI: FE-05에서 Footer/메뉴/Terms를 먼저 정리한 뒤 FE-03/04/07 문의와 알림으로 이어집니다. 법률·운영정보는 승인된 자료만 사용합니다.
- 기존 연결 보호: FE-13/14/11/10은 관련 BE-04/05와 실제 데이터 경계를 확인하며 진행합니다.
- 결제: FE-12는 INT-02와 BE-06/07의 계약·sandbox 증거가 선행합니다. 자료가 없으면 OFF를 유지하고 차단 사유를 기록합니다.
- 선택 확장: FE-15는 계약 결정 전 보류합니다. FE-16은 변경한 범위의 QA 증거를 모읍니다.

완료 게이트 이름은 [PLAN의 G0~G5](PLAN.md#2-완료-게이트)를 따릅니다. 통합 실행 계획의 `단계 0~7`은 작업 순서이며 게이트 번호와 별개입니다.

## 미제공 자료와 외부 확인

아래 항목은 제공된 폴더에 없습니다. 파일을 확인하기 전에는 대체 자료를 공식 원본으로 간주하거나 관련 검증을 통과 처리하지 않습니다. 자료가 필요하지 않은 문서·코드 검토는 진행할 수 있습니다.

| 자료·정보 | 영향받는 작업 | 확인 경로·필요 내용 |
|---|---|---|
| `로켓단_API명세서_v1.0.1_시연안정화.pdf` | API/권한/결제 수용 기준 확인 | 원본 자료집의 `references/`. 공식 PDF 또는 현재 BE OpenAPI·DTO 대조 근거 필요 |
| `ERD-v0.7-최종본.md` | 데이터 관계·서버 상태 검증 | 원본 자료집의 `references/`. 스키마 변경은 BE 범위 |
| 57개 `.dc.html` 보드와 11/04 보완·디자인 시스템 문서 | FE-05/06/08/09/10/16 등의 시각 비교 | [비교 보고서의 고정 소스 링크](FRONTEND_COMPARISON_REPORT.md)와 [화면 비교표](FRONTEND_SCREEN_MATRIX.md)의 개별 링크. 이번에는 다운로드·렌더 검증하지 않음 |
| 실제 FE 배포 SHA, staging DB/project 식별·격리 근거, 승인된 ADMIN·문의 작성자 계정/역할 및 비밀 공유 경로 | FE-00, FE-04, INT-00/01, 역할·실HTTP QA | 승인된 staging 환경·계정 생성/접근 절차와 비밀 공유 위치가 필요. 비밀번호·토큰은 문서나 채팅에 기록하지 않음 |
| 현행 API 계약과 BE/INT 검증 결과 | 각 FE 티켓의 BE/INT 선행조건 | [BE 티켓](tasks_split/BACKEND_TASKS.md), [INT 티켓](tasks_split/INTEGRATION_TASKS.md)으로 필요한 DTO·권한·오류 근거 확인 |
| 승인된 약관·사업자/연락처 정보, Toss sandbox 증거 | FE-05, FE-12 | 사용자/관련 검토 결과 필요. 임의 법률 문구·성공 결제 상태를 만들지 않음 |

## 다음 작업에 사용할 요청 예시

```text
AGENTS.md와 docs/FRONTEND_WORKSPACE.md를 먼저 읽고,
docs/tasks_split/FRONTEND_TASKS.md의 FE-00을 진행해줘.
현재 브랜치/HEAD와 기존 변경을 확인하고, 코드로 확인한 사항과
배포·실HTTP로 검증한 사항을 구분해서 기록해줘.
```

이번 정리에서는 FE-00~FE-16, BE-00~BE-11, INT-00~INT-03의 기능 수용 기준을 완료 처리하지 않았습니다.

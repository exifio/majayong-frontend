# FRONTEND_TASKS — 방식 B: 저장소별 실행 TASKS

> **작업본 안내:** 원본 자료집의 FE 기준은 `f9427a9`입니다. 현재 작업본의 코드 차이·경로·누락 자료는 [프론트엔드 작업 시작 안내](../FRONTEND_WORKSPACE.md)를 먼저 확인하세요. 원본의 과거 진단과 미실행 상태를 현재 사실로 단정하지 않습니다.


> 대상: **FE 작업 AI 전용**. 다른 저장소 코드를 직접 수정하지 말고 공동 계약은 [통합 TASKS](../TASKS.md)의 Integration 담당으로 넘깁니다. 버전 v0.7.3, 기준 2026-11-05 (KST). 아래 작업은 모두 **미실행/대기**입니다.
>
> 각 태스크는 다른 AI가 읽어도 같은 결과를 내도록 파일·API·수용 기준·최소 QA를 명시했습니다. 작업에 명시되지 않은 전면 리팩터링/자동 테스트 대량 생성 금지.

| id | 우선순위 | 단계 | 작업 | 의존 | 난이도 |
|---|:---:|:---:|---|---|:---:|
| FE-00 | P0 | Now | 실제 배포 FE 기준선·UI 경로 확인 | INT-00 | 하 |
| FE-01 | P0 | Now | 이메일 회원가입 3단계 실제 API 연결 | BE-01, FE-00 | 상 |
| FE-02 | P1 | Now | 비밀번호 재설정 실제 API·초기값 정리 | BE-01, FE-00 | 중 |
| FE-03 | P1 | Now | 고객센터 FAQ 분리 및 신규 1:1 문의 화면 | BE-02, FE-05 | 중 |
| FE-04 | P1 | Next | 운영자 1:1 문의 페이지 신규 구현 | BE-02, FE-05 | 중 |
| FE-05 | P1 | Now | 푸터·메뉴·약관 셸 공통 수정 | FE-00 | 중 |
| FE-06 | P2 | Later | 랜딩 2종 디자인 차이 최소 반영 | FE-05 | 중 |
| FE-07 | P1 | Next | 알림 문의 답변 링크 추가·상태 유지 | FE-03, BE-03 | 하 |
| FE-08 | P2 | Next | 계정 설정의 증빙·정산 계좌 UI 정리 | BE-00, FE-05 | 중 |
| FE-09 | P2 | Later | 운영자 후처리 UI 상태 보완 | FE-05, BE-05 | 중 |
| FE-10 | P1 | Next | 검수·납품의 보완/완료 후 상태 보완 | BE-05, FE-11 | 중 |
| FE-11 | P1 | Next | 계약·정산 목록의 실데이터 경계 정리 | BE-04, FE-00 | 상 |
| FE-12 | P0 | Now | Toss 예치 UI 사실표시·승인 연결 게이트 | BE-06, BE-07, INT-02 | 상 |
| FE-13 | P1 | Next | 기존 NDA·지원·채팅·합의·서명 보호 회귀 | BE-04, INT-00 | 중 |
| FE-14 | P1 | Now | ChatIndex 고정 데모 링크 제거 | BE-04, FE-00 | 하 |
| FE-15 | P2 | Later | 선택 검색/취소 철회 UI 확장 보류 관리 | BE-09, BE-10 | 하 |
| FE-16 | P1 | Next | 변경 영역별 가벼운 QA와 57보드 비교 마감 | FE-13, FE-03 | 하 |
| FE-17 | P1 | Next | 리뷰 작성·받은 리뷰 실제 API 연결 | BE-05, FE-11 | 상 |
| FE-18 | P2 | Next | 계약 완료 배너·공급자 정산 라벨 정리 | FE-11 | 하 |
| FE-19 | P1 | Now | 명세 확정 선행조건 차단 및 오류 안내 | 없음 | 하 |

## 현재 FE 실행 가능 상태 (2026-11-06)

현재 즉시 시작할 수 있는 미완료 FE 구현 작업은 없다. 완료된 로컬 범위와 남은 외부 선행 조건은 다음과 같다.
- **FE-04:** 로컬 목록·답변·WAITING 배지 구현 완료. 승인 staging의 DB 격리·ADMIN/작성자 계정 절차·vault 경로가 없어 실검증 BLOCKED.
- **FE-07:** targetUrl 링크와 adapter 테스트 완료. 실제 `INQUIRY_ANSWERED` 이벤트 및 읽음 수 갱신은 staging·승인 계정 필요.
- **FE-09:** 시연 상태 고지는 완료. 실제 POST 저장은 BE-05의 승인된 API 계약과 실데이터 ID 확인 후 진행.
- **FE-13:** 로컬 회귀 23건과 로컬 API 확인 완료. staging CLIENT/SUPPLIER 흐름 1~7은 승인 계정·데이터가 없어 미검증.
- **FE-12:** `DEPOSIT_ENABLED`는 OFF이고 예치 요청은 전송하지 않는다. 기존 `escrow-live.test.tsx`는 비활성 버튼과 `/deposits` 미호출을 확인한다. BE-06/07·INT-02 승인 전 결제 연결 금지.
- **FE-02:** 실제 이메일 발송은 사용자 결정으로 보류; staging request 200은 미검증. **FE-15:** 계약 결정 전 보류.

외부 선행 조건이 제공되기 전에는 신규 API 계약·mock ID를 만들거나 staging/DB 쓰기를 하지 않는다.

## FE-00 — 실제 배포 FE 기준선·UI 경로 확인

- **상태/난이도:** 완료 / 2026-11-06 프로덕션 읽기 전용 확인 / 하 · **우선순위:** P0 · **단계:** Now.
- **선행:** INT-00.
- **대상:** `apps/web/vercel.json; src/app/App.tsx; src/app/routes.ts`.
- **목표/범위:** 기존 배포 URL/현재 main SHA/문의 경로/ChatIndex 위험을 코드와 대조.
- **보존:** 기존 SPA rewrite와 /api/v1 프록시.
- **API 계약:** GET /health는 백엔드 호스트에서 확인.
- **실행:** 배포 SHA와 Git main 일치 여부 기록. /help/inquiry가 현재 Help를 재사용하는 점과 57↔55 차이를 기록.
- **완료 조건:** 환경별 FE SHA, API 연결 목적지, 화면 접근/미검증 결과 정리.
- **최소 QA:** 프로덕션 변경 없이 새로고침/직접 URL/401 확인.
- **확인 결과(2026-11-06 KST):**
  - 프로덕션 `https://majayong.vercel.app` (alias `majayong-frontend.vercel.app`). 최신 Production 배포 `dpl_4VsWK4rURxQwDGyMYWjXvp5gqakX`, 생성 2026-11-05 23:45:55 KST.
  - 배포 SHA: Vercel inspect가 git 메타데이터를 노출하지 않음. 배포 생성이 `e89e743` 커밋 36초 후이고, 배포 번들에 그 커밋에서만 추가된 `/me/client-profile`·`updateClientProfile` 문자열이 있어 **`e89e743`로 대조**. Git 자동 배포 연동 자체는 미확인.
  - API: `/api/v1/*` → `/api/proxy` rewrite 유지. 무토큰 `GET /api/v1/me/notifications`가 백엔드 `401 INVALID_ACCESS_TOKEN` 봉투와 `x-request-id`를 반환 → 프록시 실연결. 백엔드 호스트·`GET /health`는 서버 환경값이라 미기록/미확인.
  - 화면: `/`, `/help/inquiry`, `/c/chat`, `/s/chat`, `/signup` 모두 200(SPA 셸). `/help/inquiry`는 기존 `Help` 재사용, `/c/chat`·`/s/chat`은 `p-ondo` 고정 경로로 이동(FE-14 위험 유지). 코드 화면 수는 55.
  - 미검증: 브라우저 실제 렌더·로그인 후 리다이렉트, Vercel Git 메타데이터, 프로덕션 백엔드 `/health`.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-01 — 이메일 회원가입 3단계 실제 API 연결

> **현행 코드 메모:** 현재 `main` `e89e743`에는 `/auth/register` 호출과 가입 단계 연동이 있습니다. 아래 원본 수용 기준에 따라 기존 코드의 미충족 부분부터 확인합니다. API를 중복 구현하지 않으며, 실HTTP·프로필·역할·약관·비밀번호 보관·삭제 검증 전에는 Done 처리하지 않습니다. [현재 코드 근거](../FRONTEND_WORKSPACE.md#현재-코드에서-확인한-차이).
>
> **2026-11-05 작업 기록(`e89e743`):** 등록 시점을 ② 역할 선택으로 옮기고 성공 시 ③ 프로필로 이어지게 수정. ③ 의뢰인은 `PATCH /me/client-profile`(`businessName`, `industryField`, `bio`), ③ 공급자는 `PATCH /me/supplier-profile`(`displayName`)을 호출. 가드 `signup-step`은 등록 후 로그인 사용자가 ③에 머물 수 있게 허용.
>
> **로컬 실HTTP 확인(2026-11-05, `localhost:3000`):** `POST /auth/register` 201, 중복 409 `EMAIL_ALREADY_REGISTERED`, `POST /auth/login` 200, `POST /auth/refresh` 200, 보호 GET 200. `PATCH /me/client-profile` 200(저장값 재조회 확인), `PATCH /me/supplier-profile` `displayName` 단독 200. **`ndaConsent: true`는 서버에 `SUPPLIER_NDA_VERSION`이 없어 503 `NDA_UNAVAILABLE`** → 가입 단계에서는 NDA를 전송하지 않고, 명세 열람 시점의 기존 NDA 게이트를 사용한다. Vitest 445/445, typecheck, build 통과. staging·배포 환경과 BE-01 공식 결과는 미확인.
>
> **NDA 방향 결정(2026-11-06):** ② 채택 — FE는 가입 ③에서 `ndaConsent: true`를 계속 전송하고, BE 환경에 `SUPPLIER_NDA_VERSION`을 설정한다. 로컬 `.env`에 `v0.7`을 넣고 재기동 후 `PATCH /me/supplier-profile` **200**, `ndaVersion=v0.7`·`ndaAgreedAt` 저장을 확인했다. staging 백엔드(`majayong-backend-staging`)에는 `SUPPLIER_NDA_VERSION`이 non-empty로 설정되어 있고 `/health` 200·보호 API 401을 확인했다. 값은 승인된 NDA 문서 버전과 일치해야 한다.
>
> **FE-01 후속 — 초기값·공급자 건너뛰기:** 가입 프로필의 CLIENT 상호·규모·소개와 SUPPLIER 활동 이름·경력·기술 스택·포트폴리오는 빈 상태로 시작합니다. CLIENT 업종도 placeholder로 시작하며 선택하지 않으면 `industryField`를 보내지 않습니다. 공급자 건너뛰기는 입력한 활동 이름 또는 가입 이메일의 local-part를 `displayName`으로 사용하고 `ndaConsent: true`와 함께 PATCH합니다. 화면에 local-part가 활동 이름으로 표시됨을 안내합니다. API/DTO는 변경하지 않았으며, 현재 DTO에 없는 규모·경력·기술 스택·포트폴리오 필드는 보내지 않습니다.
>
> **로컬 목업 검증:** supplier skip 단위 테스트는 이전에 `displayName` 없는 payload에 mock 200을 반환했고, 통합 흐름은 가입 완료만 다뤄 서버 422를 못 잡았습니다. `pnpm --filter @majayong/web test` 83파일/459테스트와 production build 통과. 로컬 production preview에서 실제 입력으로 mock register 201 및 supplier PATCH 200을 반환시켜 `/s`와 payload를 확인했습니다. 실백엔드 호출은 이 로컬 목업 검증에 포함하지 않았습니다.
>
> **공급자 동의 기본값 보정(2026-11-06):** 공급자 진입 시 NDA·수수료 5%·AI 동의는 모두 미체크입니다. `가입 완료`는 세 동의 모두, `나중에 입력하기`는 NDA 동의만 요구합니다. 83파일/459테스트와 production build 통과. 로컬 production preview에서 실제 가입 폼 입력으로 세 동의의 초기·버튼 상태와 NDA-only skip을 확인했고, mock register 201·PATCH 200 응답으로 `/s` 이동과 `{displayName: "supplier-consent", ndaConsent: true}` 요청을 확인했습니다. 이번 확인은 실백엔드에 호출하지 않았습니다.
>
> **프로덕션 실백엔드 최종 검증(2026-11-06, commit `761a086`):** Vercel production `https://majayong.vercel.app`에서 `POST /api/v1/auth/register` 201 (`role=SUPPLIER`, `termsVersion=v0.7`), 공급자 동의 초기 `[false,false,false]`, `가입 완료`와 `나중에 입력하기` 비활성을 확인했습니다. NDA만 체크하면 `[true,false,false]`, `가입 완료`는 비활성·건너뛰기는 활성 상태였고, 실제 `PATCH /api/v1/me/supplier-profile` 200 응답에 `ndaAgreedAt`과 `ndaVersion=staging-nda-v1`이 있으며 `/s`로 이동했습니다. 테스트 계정은 유지하고 세션은 로그아웃했습니다.
>


- **상태/난이도:** 완료 / 프로덕션 실백엔드 수용 기준 통과(2026-11-06) · 상 · **우선순위:** P0 · **단계:** Now.
- **선행:** BE-01, FE-00.
- **대상:** `public/Signup.tsx; Signup-Role.tsx; Signup-Client.tsx; Signup-Supplier.tsx; app/session.tsx`.
- **목표/범위:** DEMO 초깃값이 아닌 실제 계정 생성 및 프로필 저장; NDA 동의 단계 명확화.
- **보존:** Google OAuth, 기존 React 가입 단계/브라우저 가드.
- **API 계약:** POST /auth/register; POST /auth/login; PATCH /me/client-profile|supplier-profile.
- **실행:** sessionStorage와 setDevSession만으로 완료 처리하지 않음. role+termsVersion은 서버 계약 사용. 역할이 2단계에서 정해지므로 등록 시점은 역할 선택 이후로 맞추고 평문 비밀번호를 sessionStorage에 장기 보관하지 않음; 실승인 동의 버전 매핑.
- **완료 조건:** 신규 계정으로 로그인 후 역할 홈 이동, 리로드해도 유지; 프로필 건너뛰기 정책과 필수 동의 일치.
- **최소 QA:** 각 변경 TSX 옆 한국어 컴포넌트 테스트+가입/중복/권한 최소 통합 1회.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-02 — 비밀번호 재설정 실제 API·초기값 정리

- **상태/난이도:** 샌드박스 완료 / staging request 200·성공 화면, 실제 메일은 no-op / 중 · **우선순위:** P1 · **단계:** Now.
- **선행:** BE-01, FE-00. 실제 이메일 발송(BE-12)은 현재 단계에서 제외; API request/confirm 검증은 별도 미완료로 둔다.
- **대상:** `public/Reset.tsx; Reset.data.ts`.
- **목표/범위:** DEMO.emailValue 초기값과 ?mock 성공 전환 제거, 요청/확정 2단계.
- **보존:** 현재 Reset UI와 폼 디자인.
- **API 계약:** POST /auth/password-reset/request|confirm.
- **실행:** request API 성공 시 계정 여부와 무관한 동일 응답 뒤 시연 가정 문구를 표시하고 실제 발송이 아님을 알린다. API 오류는 성공으로 바꾸지 않으며, token 없을 때 실패 처리·예시 값 입력 금지.
- **완료 조건:** 빈 이메일로 시작, request/confirm 200 처리, 만료/오류 화면 정상.
- **최소 QA:** Reset.test.tsx 인접; 초기값/성공/만료 3개 검증.
- **확인 결과(2026-11-06 KST):** `?mock`·`DEMO.emailValue`·`pwValue` 제거. `/reset`은 빈 이메일로 시작하고, `?token=`이 있으면 확정 단계로 바로 진입한다. `POST /auth/password-reset/confirm`은 실제 토큰으로 **200** + 새 비밀번호 로그인 **200** 확인; 잘못된 토큰은 401 `RESET_TOKEN_INVALID` → 만료 화면. 백엔드 작업자 제공 정보 기준 BE-12 작업본에는 Resend adapter와 `sendPasswordReset` 주입이 이미 있으나 미커밋이며, 수신 허용목록·production 승인 게이트는 미구현이다. 계획된 게이트는 `MAIL_RECIPIENT_ALLOWLIST`와 `MAIL_PRODUCTION_APPROVED`를 사용하며 `NODE_ENV`로 환경을 판정하지 않는다; 자격증명·게이트가 없으면 mailer를 만들지 않고 503을 유지한다. 이메일 변경은 FE 경로가 없어 `sendEmailChange` 503 유지, URL을 만들지 않는다. BE-12 미완료 QA: 게이트 3케이스, 잘못된 body 400, 발송 실패에도 동일한 일반 응답, reset 후 이전 비밀번호 로그인 401. staging 실메일/request 200은 아직 미검증; production 발송은 별도 승인 필요. 인접 `Reset.test.tsx` 6/6, 전체 Vitest 461/461, typecheck/build 통과(빌드 청크 크기 경고).
- **추가 보정(2026-11-06):** `requestPasswordReset`은 계정 존재 여부와 무관하게 같은 성공 응답을 반환한다. 성공 화면을 요청 접수·조건부 안내 문구로 바꾸고, “메일을 보냈다”는 단정을 제거했다. 전체 Vitest **468/468**, typecheck·build 통과(기존 청크 크기 경고). 390px 로컬 UI smoke에서 요청 확인 화면과 overflow 0을 확인했으며 성공 응답은 브라우저 내 mock으로 주입했다. 로컬 BE는 `localhost:3000` 연결 거부, staging request 200·실제 메일 발송은 BE-12 완료 전 미검증.
- **BE-12 main 확인(2026-11-06):** GitHub BE `main` `3601095b5d96b28eda0810bf3dd9682b12a0ec21`의 [`identity/auth.ts`](https://github.com/exifio/majayong-backend/blob/3601095b5d96b28eda0810bf3dd9682b12a0ec21/src/modules/identity/auth.ts)는 reset token 발급·확정만 포함하고 request 메일 발송 어댑터는 없다. [`deploy/vercel-supabase.md`](https://github.com/exifio/majayong-backend/blob/3601095b5d96b28eda0810bf3dd9682b12a0ec21/deploy/vercel-supabase.md)는 이메일 발송을 미연결로 명시한다. 작업자 제공 미커밋 구현과 main 배포 근거를 혼동하지 않는다.
- **범위 결정(2026-11-06, 사용자):** 실제 이메일 발송은 이번 단계에서 보류. 성공 화면은 메일이 전송된 것으로 가정하는 시연임을 표시하고, 실제 미발송도 함께 알린다. BE-12는 완료 처리하지 않으며, 실제 발송 재개 시 안전 게이트와 승인된 staging 검증이 필요하다.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-03 — 고객센터 FAQ 분리 및 신규 1:1 문의 화면

- **상태/난이도:** 완료 / 수용 기준 5개 + 첨부 3개 staging 업로드·다운로드 확인 / 중 · **우선순위:** P1 · **단계:** Now.
- **선행:** BE-02, FE-05.
- **대상:** `public/Help.tsx; 신규 Help-Inquiry.tsx/.data.ts/.module.css; app/routes.ts`.
- **목표/범위:** Help의 FAQ/공지와 Help-Inquiry의 작성/내 문의/보낸 뒤 상태 분리. 빠른 검색 불일치 수정.
- **보존:** 기존 Help FAQ UI, 인증 가드, 1:1 링크.
- **API 계약:** GET/POST /support/inquiries; GET /support/inquiries/{inquiryId}.
- **실행:** /help/inquiry 비로그인 접근은 안내만, 실제 쓰기 API는 로그인 후; 실계약만 선택.
- **완료 조건:** FAQ 14개 확인, ?q= 검색, ?tab=notice, 문의 작성→내 문의 이동, 자기 문의만 조회.
- **최소 QA:** Help.test.tsx/Help-Inquiry.test.tsx 인접; 검색/guest/전송/응답 확인.
- **확인 결과(2026-11-06 KST):** `Help-Inquiry` 화면을 신설해 비로그인 안내, 문의 작성, 내 문의 목록, 상세(답변)를 분리했다. `GET/POST /support/inquiries`, `GET /support/inquiries/{id}`만 사용하고, 실호출로 **POST 201 → 목록 200(1건) → 상세 200**을 확인했다. Help는 `?q=` 검색과 `?tab=notice`(공지 우선)를 유지한다. 1:1 문의 라우트 가드는 `none`으로 바꿔 비로그인은 안내만 본다.
- **추가 확인(2026-11-06 KST):** 디자인 보드 `Help.dc.html`의 FAQ 14개를 `Help.data.ts`에 그대로 반영했다(기존 8개 → 14개, 보드 표시 순서 유지). 빠른 주제를 보드와 같은 6개로 맞추고, `'환불 · 취소'` 같은 주제어를 `·`·공백 토큰으로 나눠 검색하도록 고쳐 AUD-06의 빈 결과 불일치를 없앴다. 인접 테스트 `Help.data.test.ts`(14개·빠른 주제 전부 결과 있음), `Help.test.tsx`(14개 렌더·빠른 주제 검색), `Help-Inquiry.test.tsx`를 `pages/public/`으로 옮겨 12/12 통과, 전체 Vitest 468/468·typecheck·build 통과. **첨부 3개는 2026-11-07에 presign(`POST /uploads/presign`) → Supabase PUT → 문의 생성 `attachments[{fileId,name,size}]` → 작성자·운영자 다운로드까지 staging에서 확인했다.** 파일은 최대 3개·개당 10MB·허용 확장자로 제한하고, 실패 시 문의를 만들지 않는다.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-04 — 운영자 1:1 문의 페이지 신규 구현

- **상태/난이도:** 완료 / 2026-11-07 staging ADMIN 부트스트랩·목록·답변·배지 검증 / 중 · **우선순위:** P1 · **단계:** Next.
- **선행:** BE-02, FE-05.
- **대상:** `apps/web/src/pages/admin/Admin-Inquiries.tsx/.module.css/.test.tsx; components/layout/Shell.tsx/.test.tsx; app/menus.ts; routes.ts`.
- **목표/범위:** 보드 목록/상세/답변·완료 상태 React 구현, 운영자 메뉴 배지.
- **보존:** 운영자 공통 셸, 접근 가드, 기존 운영자 다른 화면.
- **API 계약:** GET /admin/support/inquiries; POST /admin/support/inquiries/{inquiryId}/answer.
- **실행:** 없는 admin 상세 GET 호출 금지. 목록 DTO로 가능한지 검증 후 부족할 때 BE 계약 요청.
- **완료 조건:** 운영자만 접근, WAITING→ANSWERED, 입력 빈값 차단, 타인 정보 최소 노출.
- **최소 QA:** 인접 Admin-Inquiries/Shell 테스트: 권한·목록·WAITING 집계·답변 후 배지 갱신·빈값.
- **로컬 구현/검증:** `Admin-Inquiries`는 목록 GET과 답변 POST만 사용하며 상세 GET은 호출하지 않는다. 로컬 관리자 토큰에서 목록 200 → 답변 200 → 작성자 상세 `ANSWERED`, 비관리자 403, 빈 답변 사전 차단을 확인했다. 배지는 문의 화면 밖에서 `WAITING`만 집계하고, 문의 화면에서는 기존 목록으로 답변 성공 시 갱신한다. 브라우저 fetch mock 대기 2건에서 배지 `2` 표시. 인접 테스트 6건, 전체 469/469, typecheck/build 통과(705.86 kB 청크 경고).
- **Staging 확인(2026-11-07 KST):** 격리 테스트 계정을 만들고 DB에서 role만 ADMIN으로 바꾼 뒤 재로그인해 `/admin/inquiries`를 확인했다. 관리자 목록 200·WAITING 2건·1:1 문의 배지 1, UI에서 답변 등록 후 `답변 완료`·배지 0, 두 번째 문의는 API 답변 200·작성자 상세 `ANSWERED`. 비관리자 접근 차단과 빈 답변 차단은 기존 테스트로 유지. 테스트 계정·문의는 삭제해 users 37·inquiries 0 복구.
- **환경 근거:** 사용자 보고 staging 도메인 `/health` 200·무인증 `/api/v1/me` 401은 DB 격리 증거가 아니다. 조회된 Supabase `health-record-restore` (`wwkuktblvadeynufjllk`, INACTIVE/테이블 접근 불가)와 `health` (`jleboocxejidigclepxt`, ACTIVE_HEALTHY/daily_records 등 다른 서비스 schema)는 Vercel 배포와 연결되지 않았다. `scripts/seed-staging.mjs`는 catalog만 upsert; `scripts/seed-demo-fixtures.mjs`/BE-08은 계정·문의 생성 절차가 아니다.
- **추가 접근·담당자 확인(사용자 보고):** `wgeoqlfpmwzgdhbkvytc`는 과거 기록의 ref이며 Supabase `get_project`·read-only `list_tables`가 권한 거부됐다. Free 요금제 한도로 신규 프로젝트도 생성되지 않았다.
- **담당자 식별(사용자 보고):** Vercel 팀의 유일한 Owner 계정은 `exifio-4593`이나 실명·연락은 확인되지 않았다. GitHub 저장소 owner/admin `SeungHun (exifio)`와 동일 인물인지 미검증이고, Supabase 담당자는 미확인이다. 요청/회신 대기; 초대·계정 생성·DB/API/Vercel 변경·자격증명 공유 없음.
- **재개 조건:** 운영 DB와 분리된 승인 staging 배포·DB project ref의 근거, 공식 ADMIN 생성 절차와 승인 담당자, 문의 작성자용 CLIENT/SUPPLIER 계정의 승인된 접근 경로, WAITING 테스트 문의 준비 절차, 승인된 비밀 저장소 항목 경로. 비밀 값은 문서/채팅에 기록하지 않는다.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-05 — 푸터·메뉴·약관 셸 공통 수정

- **상태/난이도:** 완료 / 2026-11-06 기능·1440/390 렌더 확인 / 중 · **우선순위:** P1 · **단계:** Now.
- **선행:** FE-00.
- **대상:** `components/layout/Footer.tsx; layout.module.css; app/menus.ts; app/routes.ts; public/Terms.tsx`.
- **목표/범위:** 11/04 navy-900 3줄 푸터, 랜딩 anchor, Terms viewer, ADMIN 문의 메뉴.
- **보존:** 기존 Chrome/Shell, tokens.css, 역할 가드.
- **API 계약:** 라우트만 변경; API 계약 수정 없음.
- **실행:** 공통 파일은 한 AI가 먼저 수정, 화면별 CSS 복붙 금지; 법률·사업자 값은 임의 생성하지 않음.
- **완료 조건:** /help/inquiry 링크, Terms 로그인별 셸, 랜딩 anchor, 푸터 샘플 정보 고지 일치.
- **최소 QA:** 공통 UI 인접 컴포넌트 테스트+1440/390 주요 4화면.
- **확인 결과(2026-11-06 KST):** 푸터를 navy-900으로 바꾸고 `--on-navy*` 토큰으로 글자·구분선을 맞췄다. `/help/inquiry` 링크와 사업자 예시 정보·중개자 고지·저작권 3줄을 `Footer.test.tsx`로 고정. Terms 셸을 `public → viewer`로 바꿔 로그인 역할별 GNB가 적용된다(`routes.test.tsx`). 랜딩 앵커를 DESIGN 3.1에 맞춰 `#how/#safe/#start`(의뢰인), `#how/#flow/#price`(공급자)로 통일하고 `menus.ts`·Footer·CTA를 함께 수정. Vitest 454/454·typecheck·build 통과. **ADMIN 1:1 문의 메뉴는 FE-04 화면이 없어 보류**했고, 57보드 원본 비교는 FE-16에서 다룬다. 2026-11-06 화면 QA: `/`, `/supplier`, `/help`, `/terms/terms`를 1440·390에서 확인해 가로 overflow 0, 푸터 navy-900(`rgb(11,37,69)`), Terms 셸이 guest=public·로그인=client로 바뀌는 것을 확인했다.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-06 — 랜딩 2종 디자인 차이 최소 반영

- **상태/난이도:** 완료 / 2026-11-06 3장 가치 카드·정적 히어로·1440/390 확인 / 중 · **우선순위:** P2 · **단계:** Later.
- **선행:** FE-05.
- **대상:** `public/Main.tsx/.data.ts/.module.css; Supplier-Landing.tsx/.data.ts/.module.css`.
- **목표/범위:** 3장면 9초/감속 설정, 가치 카드 3장, 최신 #anchor, 과장된 결제 문구 제거.
- **보존:** 랜딩 React 구조와 버튼 동작.
- **API 계약:** API 없음; 결제 기능 완료 주장 금지.
- **실행:** MVP 일정 충돌 시 애니메이션 대신 접근성 있는 정적 마지막 장면 우선.
- **완료 조건:** 1440/390과 prefers-reduced-motion 정상, CTA 실제 경로 동작.
- **최소 QA:** 해당 화면 인접 테스트 2~3개, 빌드와 수동 화면 QA.
- **확인 결과(2026-11-06 KST):** 의뢰인 가치 카드를 **3장**으로 줄이고 결제 완료를 단정하던 예치 문구를 제거했다. 공급자 '구간 정산'은 "결제 연동이 완료된 뒤 적용"으로 바꿨다. 앵커는 FE-05에서 `#how/#safe/#start`·`#how/#flow/#price`로 정리됨. 1440·390에서 두 랜딩 모두 **가로 overflow 0**, CTA `/signup` 링크 테스트 통과. **3장면 9초 애니메이션은 57보드 원본이 없어 정적 히어로(접근성 우선)로 유지**했고, `prefers-reduced-motion`에서도 애니메이션이 없어 그대로 동작한다. Vitest 459/459·typecheck·build 통과.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-07 — 알림 문의 답변 링크 추가·상태 유지

- **상태/난이도:** 완료 / 2026-11-07 실제 답변 알림·상세 이동 확인 / 하 · **우선순위:** P1 · **단계:** Next.
- **선행:** FE-03, BE-03.
- **대상:** `components/layout/Chrome.tsx; lib/notification-adapter.ts`.
- **목표/범위:** Notify-Client/Notify-Supplier 보드를 기존 공통 드롭다운에서 처리.
- **보존:** GET·읽음·일괄 읽음 실API 코드.
- **API 계약:** GET /me/notifications; PATCH /me/notifications/{id}/read.
- **실행:** INQUIRY_ANSWERED targetUrl=/help/inquiry?tab=my&id=... 그대로 이용, 민감 내용 노출 금지.
- **완료 조건:** 문의 답변 알림에서 정확한 내 문의 상세 이동, 읽음 수 갱신.
- **최소 QA:** Chrome.test.tsx 또는 adapter.test.ts 인접; 한국어 2개.
- **확인 결과(2026-11-07 KST):** staging에서 문의 답변 후 작성자 `/me/notifications`에 `INQUIRY_ANSWERED` targetUrl `/help/inquiry?tab=my&id=...`가 생성됨을 확인했다. 알림 드롭다운에서 링크 2건·안 읽음 2를 확인하고 클릭 시 내 문의 상세로 이동했다. **수정:** FE가 `tab=mine`만 인식해 `tab=my` 링크가 작성 탭으로 열리던 문제를 `tab=my`도 내 문의로 인식하도록 고쳤다(`70cbcbc`). production 재배포 후 알림 링크→`배치1 UI 답변 문의` 상세·답변 표시 확인. `Help-Inquiry.test.tsx` 5건, 전체 478/478, typecheck/build 통과.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-08 — 계정 설정의 증빙·정산 계좌 UI 정리

- **상태/난이도:** 샌드박스 완료 / 2026-11-07 staging 계좌 저장·1원 인증 200·인증 완료 표시 / 중 · **우선순위:** P2 · **단계:** Next.
- **선행:** BE-00, FE-05.
- **대상:** `client/Account-Client.tsx; supplier/Account-Supplier.tsx`.
- **목표/범위:** 증빙 정보와 계좌 검증 상태/금액·끝자리 표시를 최신 보드에 맞춤.
- **보존:** 기존 계정 화면의 변경·탈퇴 흐름.
- **API 계약:** PATCH /me/client-tax-info; PATCH /me/payout-account; POST /me/payout-account/verify.
- **실행:** API에 없는 1원 발송을 성공 구현한 것처럼 표시 금지. 서버 근거 없으면 안내/보류.
- **완료 조건:** 계정 역할 분리, 수신정보 비공개, 보류된 인증을 성공으로 표시하지 않음.
- **최소 QA:** 인접 폼 테스트+권한 확인.
- **확인 결과(2026-11-06 KST):** `LiveSettlementInfo`로 증빙·정산 정보를 실제 API에 연결했다. 의뢰인 `PATCH /me/client-tax-info` **200**(`******7890`, 이메일 반환), 공급자 `PATCH /me/payout-account` **200**(`******2048`), `POST /me/payout-account/verify`는 로컬 503 `PAYOUT_VERIFICATION_UNAVAILABLE` → 성공으로 표시하지 않고 안내만 한다. 기존 가짜 계좌 모달·데모 값은 제거. 로컬 BE에 `PROFILE_DATA_KEY`가 비어 있어 503 `PROFILE_DATA_UNAVAILABLE`이 발생하므로 dev 키를 설정했다(staging에도 필요). **세금계산서 이메일은 GET 프로필 응답에 없어 저장 직후에만 표시**되고, 1원 인증 실제 성공은 미검증이다.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-09 — 운영자 후처리 UI 상태 보완

- **상태/난이도:** 완료 / 관리자 목록 DTO 확장 후 세 화면 실제 API 저장 연결 / 중 · **우선순위:** P2 · **단계:** Later.
- **선행:** FE-05, BE-05.
- **대상:** `admin/Admin-Blocks.tsx; Admin-Reports.tsx; Admin-Disputes.tsx`.
- **목표/범위:** 병합·조치·판정의 성공/실패/완료 상태와 비활성 버튼 규칙 반영.
- **보존:** 기존 보드 UI·관리자 접근 가드.
- **API 계약:** POST /admin/blocks/{id}/actions; /admin/reports/{id}/resolve; /admin/inspection-requests/{id}/decision.
- **실행:** 실데이터 저장 여부 확인 전 ?mock 상태를 완료로 오인 금지.
- **완료 조건:** 해당 결과 상태를 각 화면에서 명확히 표시.
- **최소 QA:** 변경 3화면의 인접 테스트와 승인 결과 상태 확인.
- **확인 결과(2026-11-07 KST):** BE 관리자 DTO를 확장해 세 화면의 데모 행·`?mock` 분기를 제거하고 실제 API로 전환했다. **Admin-Reports**: `GET /admin/reports`의 신고자·대상 표시명, 프로젝트 제목, 신고 메시지 본문·시각을 표시하고 `POST /admin/reports/{id}/resolve`로 경고·정지·조치 없음 저장. staging에서 신고 생성→관리자 목록 200(문맥 포함)→경고 저장 200→`RESOLVED`·알림·이벤트 기록 확인, 브라우저에서 폼 제출 후 상태 전환 확인. **Admin-Blocks**: `GET /admin/blocks`의 설명·조건·단가 근거·태그·출처 프로젝트 수를 표시하고 `POST /admin/blocks/{id}/actions`로 병합·단가·비활성화 저장. staging 브라우저에서 단가 180,000→181,000 저장 후 원복 확인. **Admin-Disputes**: `GET /admin/inspection-requests/escalated`의 당사자·합의 조건·양쪽 주장·보완 이력·납품을 표시하고 `POST .../decision`으로 3택 판정 저장. staging에서 테스트 계약→납품→보완 요청→에스컬레이션→관리자 목록 200(문맥 포함)→APPROVE 판정 200→검수 RESOLVED·항목 승인·납품 PARTIALLY_APPROVED·계약 채팅 시스템 메시지까지 확인했다. 전체 479/479·typecheck·build 통과. 해결 중 두 결함을 발견해 BE에서 수정했다: ① `POST /admin/reports/{id}/resolve` 500(알림 delegate 미어댑터) ② 판정·에스컬레이션 시스템 메시지가 production 배선의 `inspectionOps` 부재로 사용자 채팅에 남지 않던 문제.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-10 — 검수·납품의 보완/완료 후 상태 보완

- **상태/난이도:** 완료 / 2026-11-06 D-26 항목 id로 납품·승인·보완 실연결 / 중 · **우선순위:** P1 · **단계:** Next.
- **선행:** BE-05, FE-11.
- **대상:** `client/Inspect-Client.tsx; supplier/Deliver-Supplier.tsx`.
- **목표/범위:** 11/04 보완 요청 후/도움 요청 후/완료 상태를 기존 컴포넌트에 반영.
- **보존:** 기존 계약 항목·구간 상태 매핑.
- **API 계약:** POST /installments/{id}/deliveries; /contract-items/{id}/approve; /rework-requests.
- **실행:** API가 검증되지 않으면 UI만 표기/실행 차단, 지급 완료는 PG 검증 연동 전 확정 금지.
- **완료 조건:** 요청 후 사용자에게 상태가 보여지고 중복 제출 차단.
- **최소 QA:** 각 화면 .test.tsx 인접, 관련 단위/통합 최소 1회.
- **확인 결과(2026-11-06 KST):** 의뢰인 검수에서 '보완 요청 보내기'가 완료 화면으로 사라지지 않고 `role="status"`로 **「보완 요청을 보냈습니다」**를 남기며 버튼이 비활성화된다(중복 전송 차단). 공급자 납품은 제출 후 상태에 **「시연 상태 — 서버에 저장되지 않았습니다」**를 표시하고, 기존 `submitted` 조건으로 재제출을 막는다. API는 실제 계약 픽스처로 `POST /installments/{id}/deliveries` **201 ×2**, `POST /contract-items/{id}/approve` **200**, `POST /contract-items/{id}/rework-requests` **201**까지 확인했다. D-26으로 `GET /contracts/{id}`·`/document`의 `items[].id`가 추가되어 FE가 그 ID를 그대로 사용한다. 실제 API 응답의 item id로 **납품 201 → 승인 200**을 확인했고, 보완 요청도 201을 확인했다. 테스트 2건 추가·전체 461/461·typecheck·build 통과.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-11 — 계약·정산 목록의 실데이터 경계 정리

- **상태/난이도:** 진행 / 실 API·빈 상태·테스트 완료, 계약 있는 계정 실확인 미검증 / 상 · **우선순위:** P1 · **단계:** Next.
- **선행:** BE-04, FE-00.
- **대상:** `client/Contracts-Client.tsx; supplier/Contracts-Supplier.tsx; client/Settle-Client.tsx; supplier/Settle-Supplier.tsx`.
- **목표/범위:** 현재 DEMO 기반 카드/금액을 실제 데이터 또는 명시적 빈 상태로 전환, 데이터 adapter 재사용.
- **보존:** 문서/서명·채팅·정산 내역 기존 URL.
- **API 계약:** GET /me/contracts; GET /me/payment-statements; GET /contracts/{id}/installments.
- **실행:** Mock 결제를 정상 거래처럼 표시하지 않음; 계약 paymentStatus 구분.
- **완료 조건:** 역할별 목록·빈 상태·권한·새로고침 값 일치.
- **최소 QA:** 계약 목록 인접 테스트와 API 통합 1회.
- **확인 결과(2026-11-06 KST):** 4개 화면의 DEMO 카드·금액을 제거하고 `LiveContractsList`(GET /me/contracts)와 `LiveSettlements`(GET /me/payment-statements)로 교체했다. 빈 목록은 명시적 빈 상태, 실패는 `role="alert"`, 계약 상태는 `contractDisplayLabel(status, paymentStatus)`로 예치 대기/진행 중을 구분한다. 정산의 `simulated`·`transferNote`는 서버 문구를 그대로 표시하고 가짜 영수증 버튼은 제거했다. 로컬 실HTTP `GET /me/contracts` 200 `[]`, `GET /me/payment-statements` 200(빈 statements, simulated 고지) 확인. 컴포넌트 8건 포함 Vitest 440/440·typecheck·build 통과. **계약·정산 데이터가 있는 계정의 실화면은 미검증.** → 2026-11-06 로컬 계약 픽스처(계약 3,100,000원, 구간 2개)를 만든 뒤 의뢰인 실UI에서 `/c/contracts` 금액·`/c/settlements` 예치 금액과 시뮬레이션 고지를 확인했고, 공급자 `/me/contracts`도 200·1건을 확인해 이 항목을 해소했다.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-12 — Toss 예치 UI 사실표시·승인 연결 게이트

- **상태/난이도:** 완료 / INT-02 sandbox 승인 E2E PASS(가상계좌), production 플래그 OFF / 상 · **우선순위:** P0 · **단계:** Now.
- **선행:** BE-06, BE-07, INT-02.
- **대상:** `components/contract/LiveEscrow.tsx; lib/deposit-api.ts; lib/toss-payment.ts; lib/feature-flags.ts; packages/types/src/api.ts; .env.example`.
- **목표/범위:** C 예치 API(PENDING 생성·목록·confirm)와 Toss 결제창을 플래그 뒤에서 연결한다. 결제 성공 리다이렉트의 `paymentKey`/`orderId`/`amount`로 서버 confirm을 호출한 뒤에만 완료로 표시한다.
- **보존:** `VITE_ENABLE_DEPOSIT` 기본 OFF, 기존 계약 상태 조회·권한, PENDING을 완료로 표시하지 않는 원칙.
- **API 계약:** `POST /contracts/{id}/deposits` → `{deposit,isNew}`, `GET /contracts/{id}/deposits`, `POST /contracts/{id}/deposits/{depositId}/confirm` body `{paymentKey,amount}`.
- **실행:** 프론트에는 공개 클라이언트 키(`VITE_TOSS_CLIENT_KEY`)만 둔다. 시크릿 키 금지. `DEPOSIT_ENABLED=false`면 예치 API·SDK를 호출하지 않고 기존 안내를 유지한다.
- **완료 조건:** OFF에서 버튼 비활성·`/deposits` 미호출. ON에서 PENDING 생성 후 결제창이 열리고, 성공 리다이렉트 confirm 200 전에는 완료 표시 금지. 실패 리다이렉트는 오류 표시.
- **최소 QA:** `escrow-live.test.tsx` 7건(OFF 4 + ON 생성/SDK·성공 confirm·실패 3), `pnpm typecheck`, `pnpm test` 477/477, `pnpm build`.
- **확인 결과(2026-11-07 KST):** 로컬 dev(`VITE_ENABLE_DEPOSIT=true`, 테스트 클라이언트 키) + staging API에서 버튼 활성·`POST /deposits` 201 PENDING 105,000원·Toss 결제창 열림 확인. INT-02에서 실제 Toss sandbox 가상계좌 결제→대시보드 입금처리→FE 성공 리다이렉트→confirm 200으로 예치 `COMPLETED`·계약 `DEPOSITED`·구간 2개까지 확인했다. 성공/실패 리다이렉트 단위 테스트 3건, 전체 477/477. **한계:** 실카드는 사용하지 않았고, production은 `VITE_ENABLE_DEPOSIT=false` 유지다.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-13 — 기존 NDA·지원·채팅·합의·서명 보호 회귀

- **상태/난이도:** 완료 / 2026-11-07 staging 1~7 PASS / 중 · **우선순위:** P1 · **단계:** Next.
- **선행:** BE-04, INT-00.
- **대상:** `components/project/Live*; components/chat/LiveChat.tsx; components/agreement/LiveAgreement.tsx; components/contract/LiveContract.tsx`.
- **목표/범위:** 변경 없이 베이스라인 보호, 누락된 오류 핸들링만 최소 수정.
- **보존:** specItemId/토큰 갱신/계약 문서 해시/권한.
- **API 계약:** A·B API 명세 v1.0.1 + 현행 DTO.
- **실행:** 스키마/DTO·ID 재생성 금지, 화면 구조와 API 어댑터를 전면 교체하지 않음.
- **완료 조건:** CLIENT/SUPPLIER 핵심 단계 1~7을 staging에서 성공/실패로 구분.
- **최소 QA:** 각 영향 변경 파일만 단위/통합; 전체 E2E 반복 금지.
- **확인 결과(2026-11-07 KST):** 보호 대상 코드는 수정하지 않았다. staging에서 CLIENT/SUPPLIER 1~7단계(가입·프로필/NDA·초안→게시·상세 specItemId·지원·채팅·합의→계약→서명→예치)를 실제 API와 FE 화면으로 확인했다(INT-01/INT-02 기록). `project-live`·`chat-live`·`agreement-live`·`contract-live` 23/23, 무토큰 401 차단 유지. 실패 상태는 NDA 미동의·구버전 403과 비당사자 403/404로 확인했다.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-14 — ChatIndex 고정 데모 링크 제거

- **상태/난이도:** 진행 / 코드·테스트 완료, 프로덕션 배포 전 / 하 · **우선순위:** P1 · **단계:** Now.
- **선행:** BE-04, FE-00.
- **대상:** `apps/web/src/app/App.tsx; lib/chat-adapter.ts`.
- **목표/범위:** /c/chat와 /s/chat은 고정 p-ondo 대신 현재 사용자 최근 채팅 또는 빈 상태.
- **보존:** 개별 /c/chat/:pid/:sid 및 /s/chat/:pid 라우트.
- **API 계약:** GET /me/chats.
- **실행:** 로그인한 계정의 실제 list; 목록 없으면 빈 상태. 데모 ID로 리디렉션 금지.
- **완료 조건:** 프로덕션에서 임의 타인 채팅 경로로 이동하지 않음.
- **최소 QA:** App/routes 인접 테스트, 빈 목록/방 선택 2건.
- **확인 결과(2026-11-06 KST):** `ChatIndex`가 `GET /me/chats`의 첫 항목(서버 최근순)으로 이동하고, 빈 목록이면 `EmptyState`, 실패 시 `role="alert"`를 표시한다. 고정 `p-ondo` 경로 제거. `src/app/App.test.tsx` 4건(빈 목록/최근 대화/공급자/오류)과 Vitest 전체 450/450, typecheck, build 통과. 프로덕션 `majayong.vercel.app` 배포 번들에 `/me/chats`·빈 상태 문구 반영 확인. **로그인 후 실데이터로 이동하는 장면은 미검증.**
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-15 — 선택 검색/취소 철회 UI 확장 보류 관리

- **상태/난이도:** 완료 / 검색 확장·취소 철회 staging E2E / 하 · **우선순위:** P2 · **단계:** Later.
- **선행:** BE-09, BE-10.
- **대상:** `supplier/Find-Supplier.tsx; client/Cancel-Client.tsx; supplier/Cancel-Supplier.tsx`.
- **목표/범위:** 공급자 프로젝트 검색의 keyword·정렬·마감일 필터와 취소 요청자 본인의 철회 버튼을 실제 API에 연결.
- **보존:** 기존 지원/취소 흐름.
- **API 계약:** `GET /projects`의 `keyword`·`sort`·`deadlineBefore`; `POST /contracts/{id}/cancellation/withdraw`.
- **실행:** 승인되지 않은 신규 query/path 임의 추가 금지.
- **완료 조건:** 화면·문구에 미지원 동작 없음.
- **최소 QA:** 해당 화면 확인만, UI 변경 시 인접 1~2개.
- **확인 결과(2026-11-07 KST):** staging에서 `GET /projects?keyword=예약&sort=DEADLINE_SOON&deadlineBefore=2026-12-31` **200**(1건), 계약 취소 요청 **201** → 철회 **200** → 계약 `ACTIVE` 복귀를 확인했다. 브라우저에서 공급자 목록의 검색어·정렬·마감일 입력과 계약 상세의 "취소 요청 철회" 버튼·확인 대화상자·성공 상태를 확인했다. BE `f49e702`, FE `679644c`·`cd317cc`; 관련 FE 테스트 12/12, 취소 서비스 19/19, typecheck·build PASS.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-16 — 변경 영역별 가벼운 QA와 57보드 비교 마감

- **상태/난이도:** 완료 / 2026-11-06 변경 영역 QA + 57보드 렌더·대조 마감 / 하 · **우선순위:** P1 · **단계:** Next.
- **선행:** FE-13, FE-03.
- **대상:** `변경한 TSX/CSS/테스트 및 Chrome/Footer`.
- **목표/범위:** B/C 화면 중심 1440/390, 접근성 label, 조작·오류상태 확인.
- **보존:** 단위/컴포넌트는 인접 배치, 한글 test 제목, locator 우선.
- **API 계약:** 고유 API 재호출·PG 승인 여부 검증은 INT/BE.
- **실행:** 기존 중앙 tests 전체 이동 금지. UI만이면 전체 회귀 지양.
- **완료 조건:** 수정한 화면/인터랙션에 필요한 최소 테스트 증거와 누락 리스트.
- **최소 QA:** pnpm typecheck, pnpm build, 변경한 파일의 Vitest만, 필요한 E2E만.
- **확인 결과(2026-11-06 KST):** 변경 영역 Vitest 전체 **468/468**(FE-03 보완 포함), `pnpm typecheck`, `pnpm build` 통과. 화면별 접근성 label·빈/오류 상태는 각 인접 테스트로 확인. QA 중 `/c/settlements` 390에서 3px 가로 overflow를 발견해 구간 행 그리드를 480px 이하 2열로 수정했다.
- **57보드 대조(2026-11-06 KST):** 디자인 원본 `claude-front 4360783`을 로컬 디자인 서버로 띄워 React dev와 동시에 렌더했다. 보드 57개와 `routes.ts`의 board 이름이 **57/57 1:1 대응**하고, React는 페이지 52개 + 모달·드롭다운 5개(Login·Quote·Report·Notify 2종)를 **1440/390에서 모두 렌더**, 가로 overflow **0**을 확인했다. 보드 자체는 Supplier-Landing 26px·Terms 44px·Settle-Client 20px·Inspect/Deliver 10px의 390 overflow가 있어 복제하지 않았다. 변경 14화면의 h1/h2·계산 스타일 대조로 Help h1 28→32px, 두 랜딩 h1 32→40px를 보드에 맞췄고(모바일 28px 유지, overflow 0), FAQ 14개·빠른 주제 6개·공지 순서 일치를 확인했다. 랜딩 섹션 문구는 PRD 문안 차이로 유지했다. **한계:** 픽셀 전수 diff가 아니라 heading·계산 스타일·overflow 비교이고, Inspect/Deliver 실데이터는 토큰이 없어 인접 테스트로 대체했다.

**누락 리스트(2026-11-06):** ① ~~57보드 원본·픽셀 비교~~ → 보드 렌더·57/57 라우트·변경 14화면 대조 완료(픽셀 전수 diff는 아님) ② ~~FAQ 14개 중 8개만 제공~~ → 14개 반영, ~~첨부 3개~~ → presign·업로드·다운로드 staging PASS ③ staging 실호출(가입·문의·계약·검수 1~7) ④ FE-09 관리자 실제 저장 ⑤ FE-12 결제 OFF(INT-02/BE-06/07) ⑥ 문의 답변 알림 실이벤트(BE-03) ⑦ 1원 계좌 인증 미지원 ⑧ 계약 픽스처는 로컬 DB에만 존재.
- **보고 형식:** 기준 SHA·변경 파일·통과/미검증·실제 요청·남은 위험을 5줄 이내로 보고. 범위 확대가 필요하면 작업을 멈추고 별도 제안.

## FE-17 — 리뷰 작성·받은 리뷰 실제 API 연결

- **상태/난이도:** 완료 / 2026-11-06 로컬·staging API·production 배포 확인 / 상 · **우선순위:** P1 · **단계:** Next.
- **선행:** BE-05, FE-11.
- **대상:** `components/review/LiveReview.tsx; LiveReceivedReviews.tsx; useLiveReviews.ts; pages/client/Review-Client.tsx; pages/supplier/Review-Supplier.tsx; pages/client/Profile-Client.tsx; pages/supplier/Profile-Supplier.tsx; packages/types/src/api.ts`.
- **목표/범위:** DEMO 고정 리뷰를 계약·상대·금액·API 리뷰로 전환. `/c|s/contracts/:cid/review`는 `GET /contracts/{cid}`, `GET /me/chats`, `GET /contracts/{cid}/reviews`로 초기화하고 `POST /contracts/{cid}/reviews`로 제출한다. 프로필 받은 리뷰는 완료 계약별 리뷰에서 상대가 쓴 것만 집계한다.
- **보존:** 별점·태그·한 줄 리뷰 UI, 연락처 마스킹, 계약당 1회·수정 불가 안내, `?mock=` 시연 경로.
- **API 계약:** `POST/GET /contracts/{contractId}/reviews`, `GET /profiles/suppliers/{supplierId}/reviews`, `GET /projects/{projectId}/client-reviews`, `GET /me/chats`, `GET /contracts/{id}`.
- **실행:** 계약 `COMPLETED` 전 작성 차단, 본인 계약만, 제출 성공 전 완료 표시 금지. BE `reviewerDisplayName`이 `익명`이면 채팅방 `counterpartDisplayName`으로 대체한다.
- **완료 조건:** 실제 상대·프로젝트·금액 표시, 제출 후 `보낸 리뷰`, 새로고침 유지, 받은 리뷰 0/오류/권한 상태.
- **최소 QA:** `LiveReview.test.tsx` 3건, `LiveReceivedReviews.test.tsx` 1건, `pnpm typecheck`, `pnpm test` 472/472, `pnpm build`.
- **확인 결과(2026-11-06 KST):** 커밋 `3b6919f`, `main` 머지 `89714a1`. 로컬 dev + staging API에서 CLIENT 리뷰 제출 201·`보낸 리뷰` 전환, SUPPLIER 기존 리뷰 4점 표시, CLIENT/SUPPLIER 받은 리뷰 1건씩 확인. production 배포 `fgtpf2s80`에서 live 경로(없는 계약 오류·받은 리뷰 0건) 확인. **한계:** 프로필 기본 정보 탭은 기존 DEMO 유지, 받은 리뷰는 완료 계약별 순차 조회(N+1), BE 리뷰어 이름 포트 미연결로 채팅방 이름을 사용한다.

## FE-18 — 계약 완료 배너·공급자 정산 라벨 정리

- **상태/난이도:** 완료 / 2026-11-06 / 하 · **우선순위:** P2 · **단계:** Next.
- **선행:** FE-11.
- **대상:** `components/contract/LiveContract.tsx; LiveSettlements.tsx; pages/supplier/Settle-Supplier.tsx`.
- **목표/범위:** `COMPLETED`/`CANCELLED` 계약에서 "거래가 진행 중" 문구를 완료·취소 문구로 분기하고, 공급자 `받을 예정` 라벨을 `세후 받을 금액`으로 명확히 한다.
- **보존:** 상태 칩·금액은 서버 응답 값만 사용, 기존 정산 링크.
- **API 계약:** `GET /contracts/{id}`, `GET /me/payment-statements`.
- **실행:** 서버 `status`/`paymentStatus` 기준으로만 분기하고 완료 전 진행 문구를 재사용하지 않는다.
- **완료 조건:** 완료 화면에 진행 중 문구 없음, 라벨·금액 일치, 1440/390 확인.
- **최소 QA:** `LiveSettlements.test.tsx` 라벨, `contract-live.test.tsx` 완료 배너, `pnpm typecheck`, `pnpm test` 474/474, `pnpm build`.
- **확인 결과(2026-11-06 KST):** 커밋 `c435a4b`, 머지 `f2ad121`. staging 완료 계약에서 의뢰인·공급자 모두 "거래와 정산이 모두 완료되었습니다.", 공급자 정산 "세후 받을 금액 91,700원" 확인. production `lh28yr0l2` 번들에 두 문구 반영. **한계:** 문구 변경만, 실제 이체 없음.

## FE-19 — 명세 확정 선행조건 차단 및 오류 안내

- **상태/난이도:** 완료 / 2026-11-07 staging 게시 성공·대기 기능 409 확인 / 하 · **우선순위:** P1 · **단계:** Now.
- **기준 SHA:** `dde8f6eb3e3af9a43b21e76a3dd7513ac3eef3dc`.
- **대상:** `apps/web/src/pages/client/Confirm-Client.tsx; apps/web/src/pages/client/Confirm-Client.test.tsx; apps/web/src/components/project/LiveProjectDetail.tsx; packages/types/src/api.ts; packages/types/src/supplier.ts; apps/web/src/pages/public/Signup-Client.data.ts`.
- **목표/범위:** 반영 대기 기능이 남아 있으면 게시를 막고, 상호 없이 게시된 프로젝트를 상세에서 열 수 있게 하며 주요 검증 오류를 한국어로 안내한다.
- **보존/계약:** 기존 `GET /drafts/{id}`, `POST /drafts/{id}/publish` 경로·요청 본문·동의 저장 동작을 유지한다. D-33 승인에 따라 공급자 상세 응답의 `client.businessName`은 nullable이며 DB 스키마는 바꾸지 않는다.
- **실행:** `pendingCount`가 0이 아닐 때 확정 버튼을 비활성화하고 초안에서 재시도하도록 안내한다. `DRAFT_FEATURES_PENDING` 등 게시 검증 코드는 사용자 안내로 변환하고 매핑되지 않은 오류는 기존 문구와 오류 코드를 함께 표시한다. 폐기된 `CLIENT_PROFILE_INCOMPLETE`는 잘못된 고객센터 안내를 재사용하지 않고 오류 코드로 표시한다.
- **완료 조건:** 대기 기능이 있으면 게시 POST가 전송되지 않고, 확인된 게시 검증 오류가 구체적인 한국어 사유를 표시한다.
- **최소 QA:** 인접 `Confirm-Client.test.tsx` RED→GREEN, 해당 테스트, `pnpm typecheck`, `pnpm build`.
- **확인 결과(2026-11-07 KST):** 새 테스트 3건 RED→GREEN, 전체 484/484·typecheck·build 통과. staging 실제 API로 **상호 미등록 의뢰인 게시 201** → 공급자 상세 `client.name/businessName/industryField/storeAddress/bio/websiteUrl` 모두 `null` 반환을 확인했다. 반영 대기 기능이 있는 초안은 **409 `DRAFT_FEATURES_PENDING`**으로 차단되고 게시되지 않는다. BE `5f40443`에서 D-33 게시 게이트를 제거·상세 필드 은닉을 배포했다.
- **후속 수정(2026-11-07 KST):** D-33에 따라 상호가 없어도 게시할 수 있도록 BE 필수 검사를 제거했다. 미완성 의뢰인 프로필 정보는 공급자 상세에 노출하지 않고, FE `businessName: null`은 `상호 미등록`으로 표시한다. 가입 안내의 상호 필수 문구와 폐기된 `CLIENT_PROFILE_INCOMPLETE` 고객센터 매핑도 바로잡았다.
- **추가 수정:** D-34에 따라 블록 업종 코드 불일치 게시 차단과 FE 오류 매핑을 제거한다. 프로젝트 분류는 첫 선택 블록의 업종 코드로 유지하며, 교차 업종 지원을 새로 추가하지 않는다. 업종 불일치 게시 회귀 테스트를 추가했으며 BE 전용 PostgreSQL DB 미설정으로 미실행.

## 공통 개발 준수 사항

코드 경로는 [실제 경로 안내](../FRONTEND_WORKSPACE.md#실제-경로와-실행-환경)를 따릅니다. [저장소 지침](../../AGENTS.md)을 함께 적용하고, 이 파일의 상태·증거를 바꾸면 통합 TASKS의 동일 ID도 맞춥니다.


- [공통 규약](../AGENTS.md)의 실제 프론트/백 저장소별 실행 규칙을 모두 준수합니다.
- TypeScript strict, DTO 추론/unknown 타입 가드, `as any` 남용 금지. 라이브러리·테스트 도구는 현재 package.json 범위로 유지합니다.
- **테스트 인접형(Test Colocation)**: 대상 `Foo.ts` 옆 `Foo.test.ts` / `Foo.tsx` 옆 `Foo.test.tsx`; `test/describe/it` 제목은 한국어, 간결하게, 한 테스트는 하나의 행위.
- UI 컴포넌트는 Testing Library 의미 기반 `getByRole/getByLabelText`, 브라우저 E2E는 Playwright Locator. 함수/BE 단위 테스트에 Locator를 억지로 사용하지 않습니다.
- 기존 테스트가 `apps/web/src/test`에 있어도 이번 변경과 무관한 파일을 전부 이동하지 않습니다. 변경 코드만 신규/수정 인접 테스트로 관리하고 충돌/중복을 없앱니다.
- 서버 주소/비밀값/민감정보는 문서·테스트 결과에 쓰지 않고 실제 결제는 sandbox에서만 수행합니다.

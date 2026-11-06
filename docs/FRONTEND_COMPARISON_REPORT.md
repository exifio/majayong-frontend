# FRONTEND_COMPARISON_REPORT — React 유지 기반 디자인 통합 비교 보고서

> **작업본 안내:** 원본 자료집의 FE 기준은 `f9427a9`입니다. 현재 작업본의 코드 차이·경로·누락 자료는 [프론트엔드 작업 시작 안내](FRONTEND_WORKSPACE.md)를 먼저 확인하세요. 원본의 과거 진단과 미실행 상태를 현재 사실로 단정하지 않습니다.


> 작성 기준: 2026-11-05 (KST). **GitHub 소스/파일 목록과 주요 구현 파일 정적 분석**. 실제 사이트·테스트·화면 캡처·API 실호출 수행하지 않았습니다. 판단이 다른 경우 실제 배포 SHA와 신규 재현 증거를 우선 확인합니다.

## 1. 분석 대상 및 고정 기준

- FE `main` `f9427a9a48d5fda88176570c6846c7fafe43bdee` — [https://github.com/exifio/majayong-frontend/tree/f9427a9a48d5fda88176570c6846c7fafe43bdee](https://github.com/exifio/majayong-frontend/tree/f9427a9a48d5fda88176570c6846c7fafe43bdee)
- BE `main` `a188fb27bed4e2a3f7daed88774648fa517034a8` — [https://github.com/exifio/majayong-backend/tree/a188fb27bed4e2a3f7daed88774648fa517034a8](https://github.com/exifio/majayong-backend/tree/a188fb27bed4e2a3f7daed88774648fa517034a8)
- 디자인 `claude-front` `4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829` — [https://github.com/exifio/majayong/tree/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829](https://github.com/exifio/majayong/tree/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829)
- API 로켓단 v1.0.1 (2026-11-05) — `references/로켓단_API명세서_v1.0.1_시연안정화.pdf`; 업무 API 119개는 소스 수준 목록, **실HTTP 전수 검증 아님**.
- 기존 ERD v0.7 — `references/ERD-v0.7-최종본.md`; PDF·ERD는 변경하지 않았습니다.
- 사용자가 전달한 배포 감사 요약 — 가입 예시값·정책 초안·결제 오인 문구·FAQ·공지·인증 후 미검증(감사 원본 로그·화면은 제공되지 않음).


| 항목 | 현재 React FE | 디자인 원본 `claude-front` | BE |
|---|---|---|---|
| 구조 | `apps/web`, `packages/types`; Vite SPA | `src/screens`, `web/templates`, `docs/boards`, `web/assets/app.css` | Express+Prisma `src/modules` |
| 주요 기술 | React 18.3 / TypeScript / Vite 5 / React Router 6 / pnpm 10 / Vitest·Testing Library | TypeScript / Node HTTP 서버 / 자체 `{ }`, `<sc-if>`, `<sc-for>` 템플릿 렌더러 | Node 22 / Express 5 / Prisma / npm / Jest+Node tests |
| 경로 | `app/routes.ts`의 보드 메타·`App.tsx`; 인증 가드/모달 | `src/index.ts`의 보드 이름 경로(`/ScreenID`) | `/api/v1` 공통 접두어, `/health` 별도 |
| 상태 | React local state + DEV demo + 일부 API 실연동 어댑터 | Tweak (`renderVals`, `?mock`), 정적 시연 데이터 | DB 상태와 권한 검증 |
| 공통 스타일 | `styles/tokens.css`, `components/ui`, CSS Modules, `Chrome/Footer/Shell` | `web/assets/app.css`와 보드 HTML/CSS | 해당 없음 |
| API·인증 | `lib/api.ts`, `app/auth.ts`, `app/session.tsx`, typed DTO, refresh | 실데이터 API 연동 목적 아님 | API v1.0.1의 A/B/C 업무 경로 |

**근거 파일**: [React package](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/package.json), [React routes](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/app/routes.ts), [React App](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/app/App.tsx), [토큰](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/styles/tokens.css), [템플릿 엔진](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/src/lib/template.ts), [서버 진입](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/src/index.ts), [백엔드 package](https://github.com/exifio/majayong-backend/blob/a188fb27bed4e2a3f7daed88774648fa517034a8/package.json).

## 정적 코드 조사 수준

- 3개 커밋의 실제 GitHub 파일 트리를 확인했고, **57개 활성 디자인 보드 HTML**의 본문·제목·조건부 분기를 파일 단위로 읽었습니다. React 대응 TSX 53개와 공통 파일에서 실API/시연 데이터 분기를 대조했습니다.
- 화면별 구현 분류는 실제 코드/11월 4일 변경 지침과의 **정적 비교 결론**입니다. 브라우저에서 두 제품을 나란히 렌더한 픽셀 검증, 화면 전체 클릭, API 실호출은 수행하지 않았습니다. A=유지 후보이며 픽셀 완전 일치라는 뜻이 아닙니다.

## 2. 전체 화면과 차이

- 디자인: `docs/boards`의 실제 사용 보드 **57개** + `_discarded` 4개. `src/screens`와 템플릿도 57개 기준으로 제공됩니다.
- React `pages/{public,client,supplier,admin}`의 TSX **54개** 중 디자인과 같은 이름이 **53개**; React 전용 `GoogleCallback.tsx` 1개는 유지합니다.
- 디자인에 있고 React TSX 이름 대응이 없는 **4개**: `Admin-Inquiries`, `Help-Inquiry`, `Notify-Client`, `Notify-Supplier`. 알림 2종은 독립 페이지가 아닌 `Chrome.tsx` 공통 드롭다운이며 이미 `GET /me/notifications` 호출과 읽음 처리가 존재합니다. **신규 화면은 2개**입니다.
- React `SCREENS` 메타 55개는 53개 대응 보드 + 알림 드롭다운 2개입니다. 현재 `/help/inquiry` 경로는 존재하지만 `Help` 컴포넌트를 대신 렌더합니다. **경로 존재 ≠ 신규 문의 화면 구현**.
- 57보드의 임시 분류: **A 27 / B 23 / C 2 / D 5**. 수량은 개별 정적 비교와 출시 우선순위 판단에 따른 **권고안**이지, 실제 화면 픽셀 차이를 전수 검증한 값은 아닙니다. [세부 비교표](FRONTEND_SCREEN_MATRIX.md).

## 3. 공통 디자인: 이미 반영된 부분과 변경할 부분

| 구분 | React 근거 | 디자인 근거 | 최소 변경 전략 |
|---|---|---|---|
| 색·간격 | `tokens.css`의 navy `#0B2545`, blue `#2563EB`, amber, teal, 1280px 컨테이너 이미 존재 | `디자인-시스템-v0.2.1-최종본.md` | **토큰 재작성 금지**; 누락된 변수만 확인 |
| GNB·역할 셸 | `Chrome.tsx`, `Shell.tsx`, `menus.ts`, `routes.ts` | 결정메모 #14~#18 | 메뉴·역할 가드만 필요 부분 변경 |
| 푸터 | `Footer.tsx`는 4열/밝은 바탕 계열, 메뉴 anchor는 `#safety/#cost` | 11/04 navy-900 3줄 구조, `#safe/#start` | `Footer.tsx` + `layout.module.css` **한 번** 수정. 디자인 기준 영향 45개 화면, 모두 개별 편집 금지 |
| 고객센터 | `Help.tsx`에 FAQ 및 1:1 작성·완료 함께 구현 | FAQ/공지 `Help`, 작성/내 문의 `Help-Inquiry` 분리 | `Help` 보존+범위 축소, 신규 `Help-Inquiry` |
| 약관 | `routes.ts`: Terms 셸 `public` | 결정 #14: viewer | 경로 메타 1곳 변경, 정책 문구 승인은 별도 |
| 랜딩 | `Main.data.ts` 기본 1상태; `Supplier-Landing.tsx` 현재 정적 히어로 | 3장면 애니메이션/9초·reduced motion, 가치 카드, 변경 anchor | 기존 React 섹션 재사용, animation/CSS 및 화면 데이터만 수정 |
| 알림 | `Chrome.tsx` 실제 알림·읽음 UI | 1:1 문의 답변 알림 추가 | 기존 드롭다운 1개 컴포넌트에 targetUrl/아이콘 지원 검증 |

**중요**: 디자인 원본의 `web/assets/app.css`에는 `--s900` 등 별도 약식 변수명이 있지만 React는 `--slate-900` 등의 정식 토큰을 사용합니다. CSS 전체 복사는 기존 컴포넌트/반응형과 충돌할 수 있습니다.

## 4. 실제 API 연동 상태와 보호 대상

정적 코드에 API 호출이 있는 것과 **실제 로그인 계정으로 시연 가능한 것**을 분리했습니다.

| 영역 | 현재 React 정적 근거 | 분류 / 판단 |
|---|---|---|
| 로그인·갱신·Google | `Login.tsx`, `app/auth.ts`, `app/session.tsx`, `GoogleCallback.tsx` | **연동 코드 존재**, 권한/환경 실호출 미검증; 반드시 보존 |
| 이메일 회원가입 | `Signup.tsx`는 입력·4동의를 모두 빈 상태로 시작하지만 submit 시 sessionStorage+`setDevSession('signup')`; `Signup-Client/Supplier`도 `setDevSession` 후 이동 | **이메일 가입 API 미연동**. 백엔드 `POST /auth/register` 사용해 다시 연결해야 함. `Signup-Role` Google 온보딩 경로는 별도 분기 |
| 비밀번호 재설정 | `Reset.tsx`는 `?mock=`, `DEMO.emailValue` 및 화면 이동; API 호출 없음 | **시연 UI만**. 기존 `/auth/password-reset/request|confirm` 연결 필요 |
| 초안·프로젝트 | `Input-Client`, `Draft-Client`, `Confirm-Client`, `My-Client`, `Spec-Client`, `Home-Client`에 `apiRequest` 또는 `Live*` | **일부 실API 코드 존재**. 백엔드 응답/오류/권한 재검증, 컴포넌트 재작성 금지 |
| 프로젝트 탐색·NDA·지원 | `LiveProjectList`, `LiveProjectDetail`, `LiveQuoteWrite` | NDA `PATCH /me/supplier-profile`와 상세 `specItemId` 사용을 코드에서 확인. 기존 제출 경로 보호 |
| 채팅 | `LiveChat` 재사용 (`Chat-Client/Supplier`) | 목록·메시지 API 호출 코드 존재. `/c/chat`·`/s/chat`의 고정 데모 경로 리디렉션은 교체 필요 |
| 합의·계약 | `LiveAgreement`, `LiveContract` | 미리보기·확정·문서·서명 호출 코드 존재, 기능 플래그/서버 상태 조건 보호 |
| 예치·정산 | `LiveEscrow`는 계약 조회, `VITE_ENABLE_DEPOSIT` 기본 OFF. 정산 페이지는 DEMO 의존 | **PG 실제 승인/복구 미연동(P0)**. 생성 `201`은 결제 성공 아님 |
| 1:1 문의 | `Help.tsx`는 문의 전송 모양을 시연, 별도 `Help-Inquiry` 없음. `Admin-Inquiries` 없음 | 백엔드 5개 문의 API 코드 존재. 기존 API 활용해 신규 UI 2개 연결 |
| 운영자·검수·납품·리뷰·계정 | 다수 `.data.ts`/`DEMO` 기반 페이지 | **UI·시연 구현 ≠ 실API 연동**. 시연 범위의 경로를 우선 연결 |

API 관련 코드 근거: [apiRequest](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/lib/api.ts), [feature flags](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/lib/feature-flags.ts), [Signup](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Signup.tsx), [Reset](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/pages/public/Reset.tsx), [LiveQuoteWrite](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/components/project/LiveQuoteWrite.tsx), [LiveChat](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/components/chat/LiveChat.tsx), [LiveContract](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/components/contract/LiveContract.tsx), [LiveEscrow](https://github.com/exifio/majayong-frontend/blob/f9427a9a48d5fda88176570c6846c7fafe43bdee/apps/web/src/components/contract/LiveEscrow.tsx), [고객센터 백엔드](https://github.com/exifio/majayong-backend/blob/a188fb27bed4e2a3f7daed88774648fa517034a8/src/modules/support/http.ts).

## 5. 원본 디자인과 실제 API 사이의 충돌(그대로 복사 금지)

| 충돌 | 디자인 문서에 등장하는 제안 | **현재 백엔드/명세** | 대응 |
|---|---|---|---|
| 고객센터 API 경로 | `/api/c/inquiries`, `/api/s/inquiries`, `/api/admin/inquiries` | **`/api/v1/support/inquiries`**, **`/api/v1/admin/support/inquiries`** 등 5개 | 디자인은 화면 기준으로만 활용, API는 현행 사용 |
| 관리자 문의 상세 | 별도 `GET /api/admin/inquiries/:id` 제안 | 현재 v1.0.1 119개에 **별도 admin 문의 상세 GET 없음** | 현재 목록 응답으로 가능한지 DTO 확인, 부족하면 계약 변경 협의(임의 추가 금지) |
| 취소 요청 철회 | `/api/c/contracts/:cid/cancel/withdraw` | v1.0.1 **미구현**, API p.7 보류 권고 | 신규 철회 버튼 기능 시연 금지, 별도 결정 |
| 계좌 1원 보내기 | `/api/s/account/bank/verify-send`, `/verify` | `PATCH /me/payout-account`, `POST /me/payout-account/verify`만 문서상 존재 | 발송·외부 인증 완료를 상상하지 말고 추가 계약 여부 확인 |
| 프로젝트 검색 | `keyword/sort/deadline` UI 목표 | `GET /projects` 현재 `industryCode,skill,status,minBudget,maxBudget,page`만 확정 | 시연 필요 여부 확정 전 UI 작동한다고 표현 금지 |
| 예치 | Toss 실제 결제/분할 지급으로 소개 | `POST /contracts/id/deposits`는 PENDING 생성. SDK/승인/웹훅 복구 공백 | 플래그 OFF·실제 결제 성공 표현 금지 |

**근거**: 디자인 [변경사항-1104](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/변경사항-1104.md), [디자인-보완-1104](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/디자인-보완-1104.md), [결정메모](https://github.com/exifio/majayong/blob/4360783ff52ba5f55d45bcbb9ff2b3b6d5efc829/docs/결정메모-프론트엔드-착수-기준.md); 백엔드 [support/http](https://github.com/exifio/majayong-backend/blob/a188fb27bed4e2a3f7daed88774648fa517034a8/src/modules/support/http.ts) 및 API PDF p.4~7, p.16~19.

## 6. 주요 기술 위험과 최소 수정 방안

1. **회원가입 시연을 실제 가입으로 오인**: 초기 입력값은 비어 있어도 `Signup` 후속 처리는 개발 세션 호출입니다. 서버 가입·로그인을 연결하기 전 완료 판정 금지.
2. **디자인의 잘못된 API 경로 복사**: 오래된 `/api/c|s|admin`를 `/api/v1`로 바꾸지 않고 연결하면 404. 응답 DTO도 API 문서·현행 타입만 사용.
3. **DEMO 노출**: `DEMO_DATA_ENABLED`는 DEV 전용이지만 DEMO만 읽는 화면은 프로덕션에서도 시연값을 보여 줄 수 있습니다. 실제 사용자 화면은 상태/권한 기반으로 정리.
4. **고정 경로 리디렉션**: `App.tsx`의 ChatIndex는 `/c/chat/p-ondo/s-junho`, `/s/chat/p-ondo`로 고정. 실제 사용자의 채팅 목록을 기준으로 분기해야 함.
5. **결제 오표시**: 계약 `ACTIVE`, 예치 `PENDING/COMPLETED`, 지급 `DEPOSITED`를 혼동 금지. PG 승인 이전 다른 지원 자동 거절 금지.
6. **무차별 스타일 복사**: React 토큰/CSS Modules/UI 컴포넌트 보존, board HTML에서 필요한 상태와 구조만 취득.
7. **과도한 테스트/마이그레이션**: 변경 대상 파일만 테스트. 테스트 인접형(`File.test.tsx`)은 새·변경 테스트부터 적용, 기존 전체 이동은 별도 작업이 아닌 이상 금지.

## 7. 결론: 요청한 9개 질문에 대한 답

1. **React 유지가 합리적입니까?** 예. 53개 공통 보드 컴포넌트, 전용 API 어댑터·토큰 갱신·상태 로직을 이미 보유합니다. Node 템플릿으로 교체하면 복구 비용이 큽니다.
2. **수정 화면 수는?** 현 시점 **B=23개(잠정)**. 공통 수정을 각 화면 수정으로 중복 집계하지 않으며, 1440/390 대조 후 조정합니다.
3. **신규 화면 수는?** **2개**: 사용자 `Help-Inquiry`, 운영자 `Admin-Inquiries`. 알림 2보드는 드롭다운입니다.
4. **공통으로 해결되는 부분은?** `Chrome` 알림 2보드, GNB/푸터·칩 등. 디자인 문서는 푸터 영향 **45보드**를 기록하지만 개별 화면 45개를 별도로 수정하면 안 됩니다.
5. **보호 기능은?** `app/auth/session/google-oauth`, `lib/api.ts` 토큰 재발급, `LiveProject*`·NDA·`specItemId`, `LiveChat`, `LiveAgreement`, `LiveContract`, `DEPOSIT_ENABLED` OFF, `/api/v1` 계약.
6. **비용/오류 위험이 큰 것은?** Toss sandbox 결제 종단간 승인·웹훅·복구(P0), email signup 실API 연결 및 1:1 문의 권한 처리, 상태별 납품/검수. 랜딩 애니메이션은 비교적 독립적입니다.
7. **먼저 할 일은?** SHA·staging 연결 확인 → 회원가입/비밀번호 재설정 실제 API 여부 검증·수정 → 고객센터 2개 화면/계약 → 공통 레이아웃 → 기존 Live 경로 보전 → 결제 P0는 별도 승인·검증.
8. **일정 충돌 시 보류할 일은?** 취소 철회(백엔드 API 없음), 선택 검색 확장, 고급 3장면 애니메이션(필요하면 정적 최종 장면), 관리자 2차 다듬기. 정확한 결제/정책 설명과 핵심 API 동선은 보류하지 않습니다.
9. **전면 재구현보다 이식이 유리합니까?** 그렇습니다. 역할 가드·DTO·토큰·생성/지원/채팅/서명을 새로 만드는 위험보다 React 컴포넌트 수정의 범위가 작습니다. 단, 시각 동일도와 실제 실HTTP는 아직 검증하지 않았습니다.

## 8. 본 문서가 단정하지 않는 사항

- 실제 변경 후 화면이 디자인과 픽셀 단위로 완전히 동일한지, 57보드 전부 반응형이 깨지지 않는지.
- 119개 API가 실제 배포에서 모두 성공하는지, staging 결제가 승인되는지.
- 현재 Vercel 배포 SHA가 GitHub main과 일치하는지.
- 데모 DB 계정이 확보되었는지, 개인정보/정책이 법률 검토를 통과했는지.

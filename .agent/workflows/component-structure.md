---
description: 이음(ieum) 프로젝트 프론트엔드 컴포넌트 구조 및 룰셋 안내
---

# 이음 프로젝트 컴포넌트 구조 (Frontend)

에이전트나 팀원들이 새로운 기능을 추가하거나 컴포넌트를 설계할 때 현재 적용되어 있는 프론트엔드의 구조(Next.js App Router 기반)를 파악하고, 일관성을 유지하기 위한 가이드라인입니다. 새로운 컴포넌트를 만들 때 아래 구조를 우선적으로 참고하세요.

## 📂 1. 프론트엔드 전체 디렉토리 구조 (`frontend/src`)

```text
src/
├── _shared/         # 전역 공통 컴포넌트 모음 (예: 각종 UI 요소)
│   ├── ConfirmDialog/
│   ├── DataTable/
│   ├── Modal/
│   ├── Pagination/
│   └── StarRating/
├── app/             # Next.js App Router의 라우팅 및 도메인 로직을 담당하는 핵심 폴더
│   ├── (user)/      # 일반 사용자 대상 뷰를 묶은 Route Group
│   │   ├── _components/ # 사용자 뷰 전반에 걸쳐 공통으로 사용되는 컴포넌트
│   │   ├── calendar/    
│   │   ├── community/   
│   │   ├── festivals/   
│   │   ├── myPage/      
│   │   ├── notices/     
│   │   └── pastFestivals/
│   ├── _components/ # 홈페이지, 혹은 app 최상단 레이아웃(layout/page) 전용 컴포넌트
│   │   ├── HeroBanner/
│   │   └── PopularFestivals/
│   ├── admin/       # 관리자 페이지 라우팅
│   ├── api/         # Next.js 내부 API(Serverless Function) 라우트
│   ├── auth/        # 인증(Authentication) 관련 라우팅 및 로직
│   ├── globals.css  
│   ├── layout.tsx   
│   └── page.tsx     
├── lib/             # 범용 목적의 액션 함수, 데이터 페칭(axios 등), 환경 설정 파일 모음
├── stores/          # 전역 상태 관리 로직 저장소 (Zustand 등 기반)
└── types/           # 전역적으로 사용하는 TypeScript 모델 인터페이스 및 타입 정의
```

## 🧩 2. 상황별 컴포넌트 분리 지침

프로젝트 내 UI 및 로직 컴포넌트는 **재사용 범위**에 따라 크게 세 가지 위치에 배치합니다.

### A. 전역 디자인 시스템 급 요소 (`src/_shared/`)
* **목적**: 어플리케이션 안의 어느 페이지나 도메인에서든 의존성 없이 import 하여 자유롭게 사용할 수 있는 핵심 UI 요소 (예: `Modal`, `Button`, `DataTable` 등).
* **원칙**: 이곳의 컴포넌트는 무조건 특정 전역 상태(Zustand 스토어)나 직접적인 API 호출(Axios)이 없는, **순수(Pure/Dumb) 컴포넌트로 작성**하는 것을 지향합니다. 외부에서는 오로지 `props`로 데이터와 이벤트를 넘겨주어야 합니다.

### B. 페이지 공통 도메인 컴포넌트 (`src/app/경로/_components/`)
* **목적**: 특정 도메인 로직이 섞여 있으나, 해당 상위 폴더 내 여러 페이지들에서 공통적으로 참조되는 컴포넌트.
* **예시 1**: 메인 페이지 전용 `HeroBanner`, `PopularFestivals` (`src/app/_components/`)
* **예시 2**: 유저 페이지 네비게이션, 공통 사이드바 (`src/app/(user)/_components/`)

### C. 특정 단일 페이지 종속 컴포넌트
* **목적**: 특정 하나의 라우트(페이지) 안에서 파일 크기가 너무 비대해지는 것을 방지하거나 가독성을 높이기 위해 분리하는 특정 화면 전용 컴포넌트.
* **배치**: `src/app/(user)/festivals/_components/` 처럼 라우트 폴더 내부에 바로 만들어 응집도를 최대화합니다. 상위 또는 다른 라우트에서는 이를 절대 참조하지 않도록 합니다.

## 📐 3. AI 에이전트를 위한 코딩 가이드
1. **분리된 폴더 아키텍처 존중**: 무조건 컴포넌트를 만들 때 최상위 경로에 두기보다는 기능의 사용 범위(Context)에 따라 `_shared`로 갈지, 특정 라우트의 `_components`로 갈지를 설계하고 논의한 후 코드를 작성합니다.
2. **Server / Client Component 분리 철저**: 
   * 상위에 위치하는 `page.tsx` 라우트는 상태를 갖지 않고 데이터 페칭 전용의 **Server Component**로 남겨둡니다.
   * 사용자 이벤트(onClick, onChange 등)나 Hooks(useState, useEffect)가 필요한 세부 인터랙션 덩어리만 **최소 단위의 컴포넌트**로 쪼개어 파일 최상단에 `"use client"`를 명시해 사용합니다.
3. **컴포넌트 Export 방식**: `export default function ComponentName()`의 명확한 지정과 함께 컴포넌트는 전용 폴더 패턴(`ComponentName/index.tsx`)을 준수하여 스타일과 파일을 한 곳에서 응집해 관리합니다.

## 🏷️ 4. 네이밍 규칙 (Naming Conventions)
1. **컴포넌트 및 파일명**: `PascalCase` (예: `UserProfile.tsx`, `DataTable/index.tsx`)
2. **폴더 및 라우트명**: `camelCase` (예: `pastFestivals`, `myPage`)
3. **함수 및 변수명**: `camelCase` (예: `handleLogin`, `fetchData`, `userData`)
4. **상수명**: `UPPER_SNAKE_CASE` (예: `MAX_ITEMS_PER_PAGE`, `API_BASE_URL`)
5. **커스텀 훅**: `use` 접두어로 시작하는 `camelCase` (예: `useAuth`, `useFetchFestivals`)

## 📦 5. Import 규칙 (Import Conventions)
1. **절대 경로 사용 권장**: `import` 시 지저분한 상대 경로(`../../`) 대신 `@/`를 활용한 절대 경로를 주로 사용합니다. (예: `import Modal from "@/_shared/Modal"`)
2. **Import 순서**: 코드의 가독성을 위해 다음과 같은 순서로 import 구문을 작성합니다.
   1. React 및 Next.js 내장 모듈 (예: `react`, `next/link` 등)
   2. 외부 라이브러리 (npm 패키지, `zustand`, `axios` 등)
   3. 절대 경로 내부 모듈 (`@/stores`, `@/lib`, `@/types`)
   4. 공통 컴포넌트 (`@/_shared/...`)
   5. 가까운 상대 경로 모듈 (`./_components/Item`, 컴포넌트 전용 스타일, 이미지 에셋 등)

## 📝 6. 시맨틱 HTML 가이드 (Semantic HTML)
컴포넌트를 구성할 때 무분별한 `<div>`나 `<span>` 도배를 지양하고, **웹 접근성(A11y)과 검색엔진 최적화(SEO)** 향상을 위해 마크업 구조에 **시맨틱 태그(Semantic Tags)**를 적극 반영해야 합니다.
1. `<main>`: 페이지의 주요 콘텐츠 영역 (페이지 전체에서 1번만 사용)
2. `<section>`: 독립적인 주제나 구역 (내부에 반드시 `<h2>`~`<h6>` 제목 태그 포함 권장)
3. `<article>`: 커뮤니티 게시글, 댓글, 뉴스 등 그 자체로 독립된 개별 콘텐츠 요소
4. `<nav>`: 메인 메뉴(GNB), 서브 메뉴(LNB), 페이지네이션 등 주요 네비게이션 링크 묶음
5. `<header>` / `<footer>`: 페이지 혹은 섹션의 상단 머리말 영역 / 최하단 영역
6. `<aside>`: 사이드바, 퀵 메뉴, 배너 등 본문 내용과 직접적인 관련이 적은 부가 정보
7. `<button>` vs `<Link>`: 
   - 이벤트를 발생시키거나 폼 제출 시: 반드시 `<button type="button">` 혹은 `<button type="submit">` 사용
   - 페이지 간 링크 이동 시 (디자인이 버튼 모양이더라도): Next.js의 `<Link>` 컴포넌트 또는 `<a>` 태그 사용

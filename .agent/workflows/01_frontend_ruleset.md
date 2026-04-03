# 이음(ieum) 프론트엔드 청사진 (Blueprint) - Phase 1

> 🎯 목표: 지역 축제 플랫폼(이음)의 원활한 운영을 위한 **관리자용 축제 정보 관리 대시보드** 프로토타입 구현

---

## 1. 기술 스택 선정

### 🔧 Core Framework
| 기술 | 버전 | 선정 이유 |
|------|------|----------|
| **Next.js** | 16.x | SSR/SSG 지원, App Router 아키텍처, SEO 최적화 |
| **React** | 19.x | 최신 리액트 컴포넌트 생태계 활용 |
| **TypeScript** | 5.x | 정적 타입 기반 개발로 휴먼 에러 방지 |

### 🎨 스타일링
| 기술 | 선정 이유 |
|------|----------|
| **Vanilla CSS** / **CSS Modules** | 별도의 라이브러리 오버헤드 없이 컴포넌트별 스코프 관리를 위한 순수 CSS 지향 |
| **CSS Variables** | 이음 플랫폼의 브랜드 컬러 및 다크/라이트 테마 제어 |

### 📦 주요 라이브러리
| 라이브러리 | 용도 | 필수 여부 |
|-----------|------|----------|
| `axios` | 백엔드 API와의 통신 및 인터셉터 처리 | ✅ 필수 |
| `zustand` | 전역 상태 관리 (관리자 로그인 세션, 알림 등) | ✅ 필수 |
| `iron-session` | 서버사이드 인증 쿠키 세션 처리 | ✅ 필수 |
| `lucide-react` | 일관된 벡터 썸네일/아이콘 UI 관리 | ⭕ 권장 |
| `react-hook-form` | 복잡한 축제 등록 폼 성능 최적화 | ⭕ 권장 |

---

## 2. 디렉토리 구조 (Frontend / App Router)

> 📐 **구조 원칙: 코로케이션(Co-location)**
> - 하나의 기능은 하나의 폴더 안에서 완결되도록 구성한다.
> - **컴포넌트 레벨 코로케이션 권장**: 특정 컴포넌트에서만 쓰이는 로직(커스텀 훅/Usecase)과 스타일 파일은 해당 컴포넌트 폴더 내부에 함께 둔다.
> - 특정 기능 내 여러 컴포넌트에서 범용으로 쓰이는 비즈니스 로직(Usecase)이나 유틸 등은 기능 폴더 하위 `_usecases/`, `_lib/` 에 둔다.
> - 도메인(기능)과 무관하게 프로젝트 전체에서 쓰이는 공통 컴포넌트만 `src/_component/common/`에 모은다.

```text
frontend/src/
├── _component/                 # 🔧 전역 공용 컴포넌트 (프로젝트 전체에서 재사용)
│   └── common/                 # 공통 UI 컴포넌트
│       ├── Header/             # 공통 헤더 네비게이션
│       ├── Footer/             # 공통 푸터
│       ├── Pagination/         # 공통 페이지네이션
│       ├── SearchFilter/       # 공통 검색/필터 바
│       ├── ConfirmDialog/      # 공통 확인 다이얼로그
│       ├── DataTable/          # 공통 데이터 테이블
│       ├── Modal/              # 공통 모달
│       ├── Toast/              # 공통 토스트 알림
│       └── StarRating/         # 공통 별점 컴포넌트
│
├── app/                        # Next.js App Router 폴더
│   ├── layout.tsx              # 최상단 루트 레이아웃
│   ├── page.tsx                # 홈페이지 (루트 경로)
│   ├── globals.css             # 이음 브랜드 디자인 시스템 (CSS Variables)
│   │
│   ├── _components/            # 홈페이지(루트) 전용 컴포넌트
│   │   ├── HeroBanner/
│   │   └── PopularFestivals/
│   │
│   ├── festivals/              # 🎪 축제 기능 도메인 (사용자)
│   │   ├── page.tsx            # 전국 축제 목록 (/festivals)
│   │   ├── _components/        # 축제 도메인 전용 컴포넌트 모음
│   │   │   ├── FestivalList/   # ✨ 컴포넌트 레벨 코로케이션 패턴
│   │   │   │   ├── index.ts
│   │   │   │   ├── FestivalList.tsx
│   │   │   │   ├── FestivalList.module.css
│   │   │   │   └── useFestivalList.ts  # 이 컴포넌트 전용 로직 (Usecase / Hook)
│   │   │   └── FestivalCard/
│   │   │       ├── index.ts
│   │   │       ├── FestivalCard.tsx
│   │   │       └── FestivalCard.module.css
│   │   ├── _usecases/          # 축제 도메인 전체에서 공용으로 쓰이는 비즈니스 로직 (옵션)
│   │   ├── [id]/               # 축제 상세 (/festivals/123)
│   │   │   ├── page.tsx
│   │   │   ├── _components/    # 상세 전용 (FestivalDetail, ImageGallery 등)
│   │   │   └── reviews/        # 리뷰 (/festivals/123/reviews)
│   │   │       ├── page.tsx
│   │   │       └── _components/
│   │   └── past/               # 지난 축제 (/festivals/past)
│   │       ├── page.tsx
│   │       └── _components/    # (PastFestivalList, RatingSummary 등)
│   │
│   ├── community/              # 💬 커뮤니티 기능 도메인
│   │   ├── page.tsx            # 게시판 목록 (/community)
│   │   ├── _components/        # 게시판 전용 컴포넌트 (BoardTabs, PostCard 등)
│   │   ├── write/              # 글 작성 (/community/write)
│   │   │   ├── page.tsx
│   │   │   └── _components/    # (PostForm 등)
│   │   └── [id]/               # 게시글 상세 (/community/123)
│   │       ├── page.tsx
│   │       └── _components/    # (PostDetail, CommentSection 등)
│   │
│   ├── notices/                # 📢 공지사항 기능 도메인
│   │   ├── page.tsx            # 공지 목록 (/notices)
│   │   ├── _components/        # 공지 전용 컴포넌트 (NoticeList 등)
│   │   └── [id]/               # 공지 상세 (/notices/123)
│   │       └── page.tsx
│   │
│   ├── calendar/               # 📅 축제 달력 기능 도메인
│   │   ├── page.tsx
│   │   └── _components/        # (CalendarView 등)
│   │
│   ├── mypage/                 # 👤 마이페이지 기능 도메인
│   │   ├── page.tsx
│   │   └── _components/        # (ProfileEdit, FavoriteList, MyPosts, MyReviews 등)
│   │
│   ├── admin/                  # 🎯 관리자 전용 대시보드
│   │   ├── layout.tsx          # 관리자용 공통 레이아웃 (Admin LNB, Header)
│   │   ├── _components/        # admin 전역 컴포넌트 (AdminSidebar, AdminTopbar, StatCard 등)
│   │   │
│   │   ├── festivals/          # 축제 데이터 관리 도메인
│   │   │   ├── page.tsx        # 축제 목록 조회 (/admin/festivals)
│   │   │   ├── _components/    # 관리 목록 특화 컴포넌트 (FestivalTable, Filter 등)
│   │   │   ├── new/            # 신규 축제 등록 (/admin/festivals/new)
│   │   │   │   └── page.tsx
│   │   │   ├── sync/           # 축제 데이터 동기화 (/admin/festivals/sync)
│   │   │   └── [id]/           # 상세 조회 (/admin/festivals/123)
│   │   │       ├── page.tsx
│   │   │       └── edit/       # 기존 축제 수정 (/admin/festivals/123/edit)
│   │   │
│   │   ├── notices/            # 관리자 공지사항 관리
│   │   │   ├── _components/
│   │   │   ├── write/
│   │   │   └── [id]/
│   │   │
│   │   ├── reports/            # 신고 관리
│   │   │   ├── _components/    # (ReportTable 등)
│   │   │   └── [id]/
│   │   │
│   │   ├── users/              # 사용자 관리
│   │   │   └── _components/    # (UserTable 등)
│   │   │
│   │   ├── statistics/         # 통계 대시보드
│   │   │   └── _components/    # (ActivityChart, RegionChart 등)
│   │   │
│   │   └── regions/            # 지역 카테고리 관리 도메인
│   │
│   ├── api/                    # Next.js Serverless API (내부 로직)
│   └── auth/                   # 인증(Authentication) 뷰 및 로직
│       ├── login/
│       │   └── _components/    # (LoginForm 등)
│       └── register/
│           └── _components/    # (RegisterForm 등)
│
├── lib/                        # 범용 액션 함수, Axios 클라이언트 인스턴스
├── stores/                     # Zustand (로그인 세션, 장바구니 등 전역 상태)
├── types/                      # 글로벌 TypeScript 모델 선언 (Festival 등)
└── package.json
```

### 📂 코로케이션 규칙 요약
| 위치 | 용도 | 포함되는 파일들 예시 |
|------|------|------|
| `src/_component/common/` | 프로젝트 전역 공통 UI 폴더 | `Header`, `Footer`, `Pagination`, `Modal` |
| `app/{feature}/_components/{Name}/` | 특정 기능에 종속된 **컴포넌트 + 스타일 + 전용 로직(Usecase)** 묶음 | `index.ts`, `{Name}.tsx`, `{Name}.module.css`, `use{Name}.ts` |
| `app/{feature}/_usecases/` | 기능 폴더 내 여러 컴포넌트에서 공용으로 쓰는 비즈니스 로직 (옵션) | `useFestivalFilter.ts`, `validateFestival.ts` |
| `app/{feature}/_lib/` | 해당 기능 전용 순수 비즈니스 로직 또는 API 통신 함수 | `fetchFestivals.ts`, `validateDate.ts` |
| `app/{feature}/_types/` | 해당 기능 전용 타입 정의 (인터페이스가 클 경우 분리) | `FestivalFormData.ts` |

---

## 3. 관리자 플랫폼 시각 디자인 (Design System)

### 🎨 Color Palette (이음 브랜드)
축제의 활기를 띄는 원색 및 가독성을 위한 뉴트럴 컬러 조합.
```css
:root {
  /* Primary & Accent - 이음 화면설계서 기준 (활기찬 그라데이션 및 원색) */
  --color-primary-50: #ede9fe;  /* 연한 보라 (태그 배경) */
  --color-primary-400: #a55eea; /* 로고/포인트 그라데이션 밝은 톤 */
  --color-primary-500: #6c5ce7; /* 메인 브랜드 컬러 (버튼, 액티브 탭) */
  --color-primary-600: #4834d4; /* 히어로 배너 딥 톤 */
  --color-accent-500: #FF4D6A;  /* 마커, 강조 레드핑크 */
  --color-accent-400: #ff6b6b;  /* 로고/알림점 핑크 */
  
  /* Neutral (텍스트, 백그라운드) */
  --color-gray-50: #fafafa;   /* 화면 테두리 배경 */
  --color-gray-100: #f5f5f5;
  --color-gray-200: #e5e7eb;  /* 주요 보더 라인 */
  --color-gray-500: #636e72;  /* 서브 텍스트, GNB 비활성 */
  --color-gray-800: #2d3436;  /* 헤더 로고, 푸터 배경 */
  --color-gray-900: #222222;  /* 본문 기본 텍스트 */
  
  /* Semantic (상태 표시, 기타) */
  --color-success: #00b894;   /* 진행중 상태 (badge-ongoing) */
  --color-warning: #fbbf24;   /* 별점 (star rating) */
  --color-error: #FF4D6A;     /* 에러 및 주의 */
}
```

---

## 4. Phase 1 프론트엔드 개발 범위

> **📋 체크리스트 사용 안내 (AI 필독)**
> 진행된 항목은 반드시 `- [x]`로 마킹하여 다음 에이전트 세션에서 연결 개발할 수 있도록 합니다.

### 🎯 축제 정보 관리 대시보드 (Admin)

#### 4.1 축제 목록 페이지 (`/admin/festivals`)
- [ ] 지역별 탭/드롭다운 필터 (서울, 부산, 제주 등)
- [ ] 축제 목록 (Data Table 뷰 또는 List 뷰 지원)
- [ ] 진행상태 표시 (진행예정, 진행중, 종료됨)
- [ ] 축제명/지역명 검색 바

#### 4.2 축제 등록 및 수정 폼 (`/admin/festivals/new` & `edit`)
- [ ] 축제 기본 정보 폼 (이름, 상세설명, 일시, 개최장소 도로명 주소)
- [ ] 지역 카테고리(`regionId`) 매핑 Select 박스
- [ ] 썸네일 메인 이미지 및 포스터 다중 이미지 업로드 컴포넌트
- [ ] 유효성 검사 (개최 일정이 시작일 < 종료일 인지 검증)

#### 4.3 기타 관리 메뉴 요소
- [ ] 관리자 페이지 전용 공통 GNB / LNB 네비게이션
- [ ] (모바일/태블릿을 고려한) 관리자 뷰 반응형 최적화
- [ ] API 에러 핸들링을 위한 공통 에러 모달/토스트 연동

---

## 5. 핵심 TypeScript 타입 (Mock Data Architecture)

```typescript
// src/types/festival.ts
export interface Festival {
  id: string;               // 축제 고유 식별자 (PK)
  title: string;            // 축제 이름
  description: string;      // 상세 소개 문구
  address: string;          // 개최 현장 상세 주소
  region: RegionCategory;   // 소속 지역 카테고리
  fee: number;              // 참가/입장비 (0이면 무료)
  startDate: string;        // 'YYYY-MM-DD'
  endDate: string;          // 'YYYY-MM-DD'
  images: FestivalImage[];  // 이벤트 썸네일 포스터 이미지 배열
  status: 'UPCOMING' | 'ONGOING' | 'ENDED'; // 진행 상황
}

export interface FestivalImage {
  id: string;
  url: string;              // S3 혹은 로컬 CDN URL
  isPrimary: boolean;       // 리스트에 노출될 썸네일 이미지 여부
}

export interface RegionCategory {
  id: number;
  name: string;             // 예: "서울특별시", "강원도"
}
```

---

## ✅ 승인 체크리스트
- [ ] Next.js 16 App Router 기반 아키텍처 및 `src/_component/common` 폴더 사용규칙 동의
- [ ] 축제 관련 데이터 도메인 구조 (지역/이미지 다중맵핑) 동의
- [ ] Vanilla CSS / CSS Modules 을 통한 독립적 스타일링 지향 동의
- [ ] 백엔드 API(`/api/admin/festivals`)와의 규격 일치 여부 확인

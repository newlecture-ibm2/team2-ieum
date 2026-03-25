# 🏗️ 지역 축제 통합 정보 플랫폼 — 아키텍처 청사진 (v3)

> **버전**: v3.0 — 단일 앱 + 폴더 분리  
> **작성일**: 2026-03-25  
> **아키텍처**: BFF + Hexagonal + User/Admin **폴더 분리**  
> **구성**: Next.js 1개 + Spring Boot 1개 + PostgreSQL 1개

---

## 1. 전체 시스템 아키텍처 개요

```
                         ┌───────────────────────────────────┐
                         │          Client (Browser)          │
                         └───────────────┬───────────────────┘
                                         │
                                         ▼
                         ┌───────────────────────────────────┐
                         │       Nginx (리버스 프록시)         │
                         │     SSL · 정적 파일 · 라우팅        │
                         └───────────────┬───────────────────┘
                                         │
                                         ▼
         ┌───────────────────────────────────────────────────────────┐
         │               Next.js 16 (BFF 포함) :3000                 │
         │                                                           │
         │  ┌─────────────────────────┐ ┌──────────────────────────┐│
         │  │ 🧑 사용자 영역           │ │ ⚙️ 관리자 영역 (/admin)   ││
         │  │                         │ │                          ││
         │  │ /festivals, /calendar   │ │ /admin/dashboard         ││
         │  │ /community, /mypage     │ │ /admin/festivals         ││
         │  │ /notices, /auth/*       │ │ /admin/reports           ││
         │  │                         │ │ /admin/notices           ││
         │  │ BFF: /api/*             │ │ /admin/statistics        ││
         │  │                         │ │ /admin/surveys           ││
         │  │                         │ │                          ││
         │  │                         │ │ BFF: /api/admin/*        ││
         │  └─────────────────────────┘ └──────────────────────────┘│
         │                                                           │
         │  iron-session (JWT 저장, httpOnly 쿠키)                    │
         └────────────────────────┬──────────────────────────────────┘
                                  │ HTTP REST (내부 네트워크)
                                  ▼
         ┌───────────────────────────────────────────────────────────┐
         │            Spring Boot 4.0.1 (Hexagonal) :8080            │
         │                                                           │
         │  ┌─────────────────────────┐ ┌──────────────────────────┐│
         │  │ 🧑 user/ 패키지          │ │ ⚙️ admin/ 패키지          ││
         │  │                         │ │                          ││
         │  │ festival/ (조회)        │ │ festival-mgmt/ (관리)    ││
         │  │ auth/ (회원 인증)       │ │ admin-auth/ (관리자 인증) ││
         │  │ review/ (리뷰 CRUD)     │ │ report-mgmt/ (신고 처리) ││
         │  │ favorite/ (즐겨찾기)    │ │ notice-mgmt/ (공지 CRUD) ││
         │  │ community/ (게시판)     │ │ statistics/ (통계)       ││
         │  │ notice/ (조회만)        │ │ survey/ (설문)           ││
         │  │ report/ (접수만)        │ │ user-mgmt/ (사용자 관리) ││
         │  └─────────────────────────┘ └──────────────────────────┘│
         │                                                           │
         │  global/ (SecurityConfig, JWT Filter, CORS, Exception)    │
         │  → /api/** (admin 제외) : permitAll 또는 USER role 허용    │
         │  → /api/admin/** : ADMIN role만 허용                      │
         └────────────────────────┬──────────────────────────────────┘
                                  │
                                  ▼
                         ┌───────────────────────────────────┐
                         │         PostgreSQL :5432           │
                         │       + Docker Volume (파일)       │
                         └───────────────────────────────────┘
```

### 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **단일 앱** | 프론트 1개, 백엔드 1개, DB 1개 → 배포·운영 단순 |
| **폴더 분리** | 같은 앱 안에서 `user/`와 `admin/` 패키지를 명확히 분리 |
| **URL 기반 권한** | `/api/**` → permitAll 또는 USER, `/api/admin/**` → ADMIN (SecurityConfig) |
| **BFF 패턴** | 브라우저 → Next.js API Routes → Spring Boot (JWT 은닉) |
| **헥사고날** | 각 Context는 domain → application(port) → adapter 구조 |

---

## 2. 프로젝트 디렉토리 구조

```
team2-ieum/
├── frontend/                    # Next.js (BFF 포함)
├── backend/                     # Spring Boot (Hexagonal)
├── database/                    # DDL, 마이그레이션
├── nginx/                       # Nginx 설정
├── docker-compose.yml
└── docs/
    └── blueprints/
```

---

## 3. Next.js 프론트엔드 + BFF (:3000)

### 3-1. 페이지 라우트 구조 (Co-location 패턴)

> 각 라우트 폴더 안에 `_components/`를 두고, 컴포넌트·CSS Module·커스텀 훅이 같은 폴더에 공존합니다.

```
frontend/src/
├── app/
│   ├── globals.css                         # 글로벌 스타일 (리셋, CSS 변수, 폰트)
│   ├── layout.tsx                          # 루트 레이아웃
│   ├── layout.module.css
│   ├── page.tsx                            # 🏠 메인 (랜딩)
│   ├── page.module.css
│   ├── _components/                        # 메인 페이지 전용 컴포넌트
│   │   ├── HeroBanner/
│   │   │   ├── HeroBanner.tsx
│   │   │   └── HeroBanner.module.css
│   │   └── PopularFestivals/
│   │       ├── PopularFestivals.tsx
│   │       └── PopularFestivals.module.css
│   │
│   ├── (user)/                             # ─── 🧑 사용자 그룹 레이아웃 ───
│   │   ├── layout.tsx                      # 사용자 레이아웃 (GNB + Footer)
│   │   ├── layout.module.css
│   │   ├── _components/                    # 사용자 레이아웃 공통 컴포넌트
│   │   │   ├── UserHeader/
│   │   │   │   ├── UserHeader.tsx
│   │   │   │   └── UserHeader.module.css
│   │   │   └── UserFooter/
│   │   │       ├── UserFooter.tsx
│   │   │       └── UserFooter.module.css
│   │   │
│   │   ├── festivals/                      # 🗺️ 전국 축제
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   ├── _components/
│   │   │   │   ├── FestivalMap/
│   │   │   │   │   ├── FestivalMap.tsx
│   │   │   │   │   ├── FestivalMap.module.css
│   │   │   │   │   └── useFestivalMap.ts   # 카카오맵 로직 훅
│   │   │   │   ├── ClusterMarker/
│   │   │   │   │   ├── ClusterMarker.tsx
│   │   │   │   │   └── ClusterMarker.module.css
│   │   │   │   ├── FestivalCard/
│   │   │   │   │   ├── FestivalCard.tsx
│   │   │   │   │   └── FestivalCard.module.css
│   │   │   │   └── SearchFilter/
│   │   │   │       ├── SearchFilter.tsx
│   │   │   │       ├── SearchFilter.module.css
│   │   │   │       └── useSearchFilter.ts
│   │   │   │
│   │   │   └── [id]/                       # 축제 상세
│   │   │       ├── page.tsx
│   │   │       ├── page.module.css
│   │   │       └── _components/
│   │   │           ├── FestivalDetail/
│   │   │           │   ├── FestivalDetail.tsx
│   │   │           │   └── FestivalDetail.module.css
│   │   │           ├── LocationMap/
│   │   │           │   ├── LocationMap.tsx
│   │   │           │   └── LocationMap.module.css
│   │   │           ├── ReviewSection/
│   │   │           │   ├── ReviewSection.tsx
│   │   │           │   ├── ReviewSection.module.css
│   │   │           │   └── useReviews.ts
│   │   │           └── ImageGallery/
│   │   │               ├── ImageGallery.tsx
│   │   │               └── ImageGallery.module.css
│   │   │
│   │   ├── past-festivals/                # 📜 지난 축제
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   ├── _components/
│   │   │   │   ├── PastFestivalList/
│   │   │   │   │   ├── PastFestivalList.tsx
│   │   │   │   │   └── PastFestivalList.module.css
│   │   │   │   └── RatingSummary/
│   │   │   │       ├── RatingSummary.tsx
│   │   │   │       └── RatingSummary.module.css
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── page.module.css
│   │   │       └── _components/
│   │   │           └── ReviewList/
│   │   │               ├── ReviewList.tsx
│   │   │               ├── ReviewList.module.css
│   │   │               └── useReviewList.ts
│   │   │
│   │   ├── calendar/                       # 📅 달력 뷰
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   └── _components/
│   │   │       └── CalendarView/
│   │   │           ├── CalendarView.tsx
│   │   │           ├── CalendarView.module.css
│   │   │           └── useCalendar.ts
│   │   │
│   │   ├── community/                      # 💬 커뮤니티
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   ├── _components/
│   │   │   │   ├── BoardTabs/
│   │   │   │   │   ├── BoardTabs.tsx
│   │   │   │   │   └── BoardTabs.module.css
│   │   │   │   └── PostCard/
│   │   │   │       ├── PostCard.tsx
│   │   │   │       └── PostCard.module.css
│   │   │   ├── write/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── page.module.css
│   │   │   │   └── _components/
│   │   │   │       └── PostForm/
│   │   │   │           ├── PostForm.tsx
│   │   │   │           └── PostForm.module.css
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── page.module.css
│   │   │       └── _components/
│   │   │           ├── PostDetail/
│   │   │           │   ├── PostDetail.tsx
│   │   │           │   └── PostDetail.module.css
│   │   │           └── CommentSection/
│   │   │               ├── CommentSection.tsx
│   │   │               ├── CommentSection.module.css
│   │   │               └── useComments.ts
│   │   │
│   │   ├── notices/                        # 📢 공지사항 (조회)
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   ├── _components/
│   │   │   │   └── NoticeList/
│   │   │   │       ├── NoticeList.tsx
│   │   │   │       └── NoticeList.module.css
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── page.module.css
│   │   │
│   │   └── mypage/                         # 👤 마이페이지
│   │       ├── page.tsx
│   │       ├── page.module.css
│   │       └── _components/
│   │           ├── FavoriteList/
│   │           │   ├── FavoriteList.tsx
│   │           │   ├── FavoriteList.module.css
│   │           │   └── useFavorites.ts
│   │           ├── MyPosts/
│   │           │   ├── MyPosts.tsx
│   │           │   └── MyPosts.module.css
│   │           ├── MyReviews/
│   │           │   ├── MyReviews.tsx
│   │           │   └── MyReviews.module.css
│   │           └── ProfileEdit/
│   │               ├── ProfileEdit.tsx
│   │               └── ProfileEdit.module.css
│   │
│   ├── auth/                               # 🔐 인증
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   └── _components/
│   │   │       └── LoginForm/
│   │   │           ├── LoginForm.tsx
│   │   │           └── LoginForm.module.css
│   │   └── register/
│   │       ├── page.tsx
│   │       ├── page.module.css
│   │       └── _components/
│   │           └── RegisterForm/
│   │               ├── RegisterForm.tsx
│   │               └── RegisterForm.module.css
│   │
│   ├── admin/                              # ─── ⚙️ 관리자 그룹 ───
│   │   ├── layout.tsx
│   │   ├── layout.module.css
│   │   ├── _components/                    # 관리자 레이아웃 공통 컴포넌트
│   │   │   ├── AdminSidebar/
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   └── AdminSidebar.module.css
│   │   │   └── AdminTopbar/
│   │   │       ├── AdminTopbar.tsx
│   │   │       └── AdminTopbar.module.css
│   │   │
│   │   ├── page.tsx                        # 📊 대시보드 (메인)
│   │   ├── page.module.css
│   │   ├── _components/
│   │   │   ├── StatCard/
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── StatCard.module.css
│   │   │   └── ChartWidget/
│   │   │       ├── ChartWidget.tsx
│   │   │       └── ChartWidget.module.css
│   │   │
│   │   ├── festivals/                      # 🎪 축제 데이터 관리
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   ├── _components/
│   │   │   │   └── FestivalTable/
│   │   │   │       ├── FestivalTable.tsx
│   │   │   │       └── FestivalTable.module.css
│   │   │   └── sync/
│   │   │       ├── page.tsx
│   │   │       └── page.module.css
│   │   │
│   │   ├── reports/                        # 🚨 신고 관리
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   ├── _components/
│   │   │   │   └── ReportTable/
│   │   │   │       ├── ReportTable.tsx
│   │   │   │       └── ReportTable.module.css
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── page.module.css
│   │   │
│   │   ├── notices/                        # 📢 공지 관리 (CRUD)
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   ├── write/
│   │   │   │   ├── page.tsx
│   │   │   │   └── page.module.css
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── page.module.css
│   │   │
│   │   ├── statistics/                     # 📊 통계 대시보드
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   └── _components/
│   │   │       ├── RegionChart/
│   │   │       │   ├── RegionChart.tsx
│   │   │       │   └── RegionChart.module.css
│   │   │       └── ActivityChart/
│   │   │           ├── ActivityChart.tsx
│   │   │           └── ActivityChart.module.css
│   │   │
│   │   ├── surveys/                        # 📋 설문 조사
│   │   │   ├── page.tsx
│   │   │   ├── page.module.css
│   │   │   ├── create/
│   │   │   │   ├── page.tsx
│   │   │   │   └── page.module.css
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── page.module.css
│   │   │
│   │   └── users/                          # 👥 사용자 관리
│   │       ├── page.tsx
│   │       ├── page.module.css
│   │       └── _components/
│   │           └── UserTable/
│   │               ├── UserTable.tsx
│   │               └── UserTable.module.css
│   │
│   └── api/                                # ★ BFF API Routes
│       │
│       ├── auth/                           # ─── 🧑 사용자 BFF ───
│       │   ├── login/route.ts              # → backend /api/auth/login
│       │   ├── logout/route.ts
│       │   ├── register/route.ts
│       │   └── me/route.ts
│       ├── festivals/
│       │   ├── route.ts                    # → backend /api/festivals
│       │   └── [id]/route.ts
│       ├── reviews/route.ts                # → backend /api/reviews
│       ├── favorites/route.ts              # → backend /api/favorites
│       ├── community/
│       │   ├── posts/route.ts
│       │   └── comments/route.ts
│       ├── notices/route.ts                # GET only → backend /api/notices
│       ├── reports/route.ts                # POST only → backend /api/reports
│       │
│       └── admin/                          # ─── ⚙️ 관리자 BFF ───
│           ├── auth/
│           │   ├── login/route.ts          # → backend /api/admin/auth/login
│           │   └── me/route.ts
│           ├── festivals/
│           │   ├── route.ts
│           │   └── sync/route.ts
│           ├── reports/route.ts
│           ├── notices/route.ts
│           ├── statistics/route.ts
│           ├── surveys/route.ts
│           └── users/route.ts
│
├── _shared/                                # 🔗 여러 라우트에서 재사용하는 공통 컴포넌트
│   ├── Pagination/
│   │   ├── Pagination.tsx
│   │   └── Pagination.module.css
│   ├── StarRating/
│   │   ├── StarRating.tsx
│   │   └── StarRating.module.css
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   └── Modal.module.css
│   ├── ConfirmDialog/
│   │   ├── ConfirmDialog.tsx
│   │   └── ConfirmDialog.module.css
│   └── DataTable/                          # 관리자 테이블 공통
│       ├── DataTable.tsx
│       └── DataTable.module.css
│
├── lib/
│   ├── session.ts                          # iron-session 설정
│   ├── api.ts                              # /api/* Axios 인스턴스 (백엔드 호출용)
│   └── adminApi.ts                         # /api/admin/* Axios 인스턴스
│
├── stores/                                 # Zustand (전역 상태만)
│   └── useAuthStore.ts                     # role(USER/ADMIN) 통합 관리
│
└── middleware.ts                            # ★ 라우트 보호
    # /admin/* 접근 시 → ADMIN role 체크 → 아니면 리다이렉트
    # /mypage, /community/write 등 → USER role 체크
```

### 3-2. middleware.ts 역할 (의사 코드)

```
// middleware.ts — 라우트 보호
//
// /admin/* 경로 접근 시:
//   → iron-session에서 role 확인
//   → ADMIN이 아니면 /auth/login 으로 리다이렉트
//
// /mypage, /community/write 등 회원 전용 경로 접근 시:
//   → iron-session에서 role 확인
//   → USER/ADMIN이 아니면 /auth/login 으로 리다이렉트
//
// 비회원 허용 경로 (/, /festivals, /calendar, /notices 등):
//   → 통과
```

---

## 4. Spring Boot 백엔드 — Hexagonal (:8080)

### 4-1. 전체 패키지 구조

```
com.ieum.festival/
│
├── user/                                  # ─── 🧑 사용자 영역 ───
│   │
│   ├── festival/                          # 🎪 축제 (조회 전용)
│   │   ├── domain/
│   │   │   └── Festival.java              # Aggregate Root (POJO)
│   │   │       - id, title, description
│   │   │       - startDate, endDate, address
│   │   │       - latitude, longitude
│   │   │       - category, imageUrl
│   │   │       - status (UPCOMING/ONGOING/ENDED)
│   │   │       - viewCount, createdAt
│   │   │       + isOngoing(), isEnded()
│   │   │       + incrementViewCount()
│   │   │
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/
│   │   │   │   │   ├── GetFestivalListUseCase.java
│   │   │   │   │   ├── GetFestivalDetailUseCase.java
│   │   │   │   │   ├── SearchFestivalByMapUseCase.java
│   │   │   │   │   └── GetFestivalByCalendarUseCase.java
│   │   │   │   └── out/
│   │   │   │       └── LoadFestivalPort.java          # 읽기만
│   │   │   ├── service/
│   │   │   │   └── FestivalQueryService.java          # 조회 전용
│   │   │   └── dto/
│   │   │       ├── FestivalSearchQuery.java
│   │   │       ├── MapBoundsQuery.java
│   │   │       └── CalendarQuery.java
│   │   │
│   │   └── adapter/
│   │       ├── in/web/
│   │       │   ├── FestivalController.java            # GET /api/festivals/**
│   │       │   ├── request/
│   │       │   └── response/
│   │       └── out/persistence/
│   │           ├── FestivalPersistenceAdapter.java
│   │           └── FestivalJdbcRepository.java
│   │
│   ├── auth/                              # 🔐 사용자 인증
│   │   ├── domain/
│   │   │   └── User.java
│   │   │       - id, email, password, nickname
│   │   │       - profileImage, role (USER)
│   │   │       - createdAt
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/
│   │   │   │   │   ├── RegisterUseCase.java
│   │   │   │   │   ├── LoginUseCase.java
│   │   │   │   │   ├── GetUserProfileUseCase.java
│   │   │   │   │   └── UpdateUserProfileUseCase.java
│   │   │   │   └── out/
│   │   │   │       ├── LoadUserPort.java
│   │   │   │       ├── SaveUserPort.java
│   │   │   │       └── PasswordEncoderPort.java
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   └── UserProfileService.java
│   │   │   └── dto/
│   │   └── adapter/
│   │       ├── in/web/
│   │       │   ├── AuthController.java                # /api/auth/**
│   │       │   └── UserController.java                # /api/profile/**
│   │       └── out/persistence/
│   │
│   ├── review/                            # ⭐ 리뷰/별점 (CRUD)
│   │   ├── domain/
│   │   │   └── Review.java
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/ (GetReviewList, Create, Update, Delete, GetAverageRating)
│   │   │   │   └── out/ (LoadReview, SaveReview, DeleteReview)
│   │   │   ├── service/
│   │   │   │   ├── ReviewQueryService.java
│   │   │   │   └── ReviewCommandService.java
│   │   │   └── dto/
│   │   └── adapter/
│   │       ├── in/web/ (ReviewController)             # /api/reviews/**
│   │       └── out/persistence/
│   │
│   ├── favorite/                          # ❤️ 즐겨찾기 (CRUD)
│   │   ├── domain/
│   │   │   └── Favorite.java
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/ (AddFavorite, RemoveFavorite, GetFavoriteList)
│   │   │   │   └── out/ (LoadFavorite, SaveFavorite, DeleteFavorite)
│   │   │   ├── service/
│   │   │   │   └── FavoriteService.java
│   │   │   └── dto/
│   │   └── adapter/
│   │       ├── in/web/ (FavoriteController)           # /api/favorites/**
│   │       └── out/persistence/
│   │
│   ├── community/                         # 💬 커뮤니티 (CRUD)
│   │   ├── domain/
│   │   │   ├── Post.java                  # Aggregate Root
│   │   │   └── Comment.java
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/ (GetPostList, GetPostDetail, CreatePost,
│   │   │   │   │        UpdatePost, DeletePost, CreateComment, DeleteComment)
│   │   │   │   └── out/ (LoadPost, SavePost, DeletePost,
│   │   │   │            LoadComment, SaveComment, DeleteComment)
│   │   │   ├── service/
│   │   │   │   ├── PostQueryService.java
│   │   │   │   ├── PostCommandService.java
│   │   │   │   └── CommentService.java
│   │   │   └── dto/
│   │   └── adapter/
│   │       ├── in/web/ (PostController, CommentController) # /api/community/**
│   │       └── out/persistence/
│   │
│   ├── notice/                            # 📢 공지사항 (★ 조회만)
│   │   ├── domain/
│   │   │   └── Notice.java
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/ (GetNoticeList, GetNoticeDetail)       # 조회만
│   │   │   │   └── out/ (LoadNoticePort)                      # 읽기만
│   │   │   └── service/ (NoticeQueryService)
│   │   └── adapter/
│   │       ├── in/web/ (NoticeController — GET only)          # GET /api/notices/**
│   │       └── out/persistence/
│   │
│   └── report/                            # 🚨 신고 (★ 접수만)
│       ├── domain/
│       │   └── Report.java
│       ├── application/
│       │   ├── port/
│       │   │   ├── in/ (CreateReportUseCase)                  # 접수만
│       │   │   └── out/ (SaveReportPort)                      # 쓰기만
│       │   └── service/ (ReportService)
│       └── adapter/
│           ├── in/web/ (ReportController — POST only)         # POST /api/reports
│           └── out/persistence/
│
│
├── admin/                                 # ─── ⚙️ 관리자 영역 ───
│   │
│   ├── festival-mgmt/                     # 🎪 축제 관리 (조회 + 공공API 갱신)
│   │   ├── domain/
│   │   │   └── Festival.java              # user/festival과 동일 도메인 (같은 DB 테이블)
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/
│   │   │   │   │   ├── GetFestivalAdminListUseCase.java
│   │   │   │   │   ├── SyncPublicDataUseCase.java
│   │   │   │   │   └── UpdateFestivalStatusUseCase.java
│   │   │   │   └── out/
│   │   │   │       ├── LoadFestivalPort.java
│   │   │   │       ├── SaveFestivalPort.java
│   │   │   │       └── PublicDataApiPort.java
│   │   │   ├── service/
│   │   │   │   ├── FestivalAdminQueryService.java
│   │   │   │   └── FestivalAdminCommandService.java
│   │   │   └── dto/
│   │   └── adapter/
│   │       ├── in/web/ (FestivalAdminController)      # /api/admin/festivals/**
│   │       └── out/
│   │           ├── persistence/
│   │           └── external/
│   │               └── PublicDataApiAdapter.java       # data.go.kr 호출
│   │
│   ├── admin-auth/                        # 🔐 관리자 인증
│   │   ├── domain/
│   │   │   └── Admin.java
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/ (AdminLoginUseCase, GetAdminProfileUseCase)
│   │   │   │   └── out/ (LoadAdminPort)
│   │   │   └── service/ (AdminAuthService)
│   │   └── adapter/
│   │       ├── in/web/ (AdminAuthController)           # /api/admin/auth/**
│   │       └── out/persistence/
│   │
│   ├── report-mgmt/                       # 🚨 신고 관리 (목록 + 처리)
│   │   ├── domain/
│   │   │   └── Report.java
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/ (GetReportList, GetReportDetail, ResolveReport)
│   │   │   │   └── out/ (LoadReportPort, SaveReportPort)
│   │   │   └── service/ (ReportAdminService)
│   │   └── adapter/
│   │       ├── in/web/ (ReportAdminController)         # /api/admin/reports/**
│   │       └── out/persistence/
│   │
│   ├── notice-mgmt/                       # 📢 공지 관리 (CRUD 전체)
│   │   ├── domain/
│   │   │   └── Notice.java
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/ (GetNoticeList, CreateNotice, UpdateNotice, DeleteNotice)
│   │   │   │   └── out/ (LoadNotice, SaveNotice, DeleteNotice)
│   │   │   ├── service/
│   │   │   │   ├── NoticeAdminQueryService.java
│   │   │   │   └── NoticeAdminCommandService.java
│   │   │   └── dto/
│   │   └── adapter/
│   │       ├── in/web/ (NoticeAdminController)         # /api/admin/notices/**
│   │       └── out/persistence/
│   │
│   ├── statistics/                        # 📊 통계
│   │   ├── domain/
│   │   │   ├── RegionFestivalStats.java
│   │   │   └── UserActivityStats.java
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/ (GetRegionStats, GetUserActivityStats)
│   │   │   │   └── out/ (LoadStatisticsPort)
│   │   │   └── service/ (StatisticsQueryService)
│   │   └── adapter/
│   │       ├── in/web/ (StatisticsController)          # /api/admin/statistics/**
│   │       └── out/persistence/
│   │
│   ├── survey/                            # 📋 설문 조사
│   │   ├── domain/
│   │   │   ├── Survey.java
│   │   │   ├── SurveyQuestion.java
│   │   │   └── SurveyResponse.java
│   │   ├── application/
│   │   │   ├── port/
│   │   │   │   ├── in/ (CreateSurvey, GetSurveyList, SubmitResponse, GetResult)
│   │   │   │   └── out/ (LoadSurvey, SaveSurvey, LoadSurveyResponse)
│   │   │   └── service/ (SurveyCommandService, SurveyQueryService)
│   │   └── adapter/
│   │       ├── in/web/ (SurveyAdminController)         # /api/admin/surveys/**
│   │       └── out/persistence/
│   │
│   └── user-mgmt/                         # 👥 사용자 관리
│       ├── domain/
│       │   └── ManagedUser.java
│       ├── application/
│       │   ├── port/
│       │   │   ├── in/ (GetUserList, SuspendUser)
│       │   │   └── out/ (LoadUserPort, SaveUserPort)
│       │   └── service/ (UserManagementService)
│       └── adapter/
│           ├── in/web/ (UserManagementController)      # /api/admin/users/**
│           └── out/persistence/
│
│
├── global/                                # ─── 🌐 공통/인프라 ───
│   │
│   ├── config/
│   │   ├── WebConfig.java                 # CORS 설정
│   │   └── SwaggerConfig.java             # OpenAPI 3.0 (user/admin 그룹 분리)
│   │
│   ├── security/
│   │   ├── SecurityConfig.java            # ★ URL 패턴별 권한 설정
│   │   │   # /api/auth/** → permitAll (로그인/회원가입)
│   │   │   # /api/festivals/** → permitAll (비회원 조회 허용)
│   │   │   # /api/notices/** → permitAll (비회원 조회 허용)
│   │   │   # /api/reviews/** POST → authenticated (USER)
│   │   │   # /api/favorites/** → authenticated (USER)
│   │   │   # /api/community/** POST → authenticated (USER)
│   │   │   # /api/admin/** → hasRole(ADMIN)
│   │   │
│   │   ├── JwtTokenProvider.java          # JWT 생성/검증 (role 포함)
│   │   └── JwtAuthenticationFilter.java   # 요청마다 JWT 검증
│   │
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── BusinessException.java
│   │   └── ErrorCode.java
│   │
│   └── response/
│       └── ApiResponse.java               # 공통 응답 포맷 { success, data, error }
│
└── FestivalApplication.java               # Spring Boot Main (:8080)
```

---

## 5. 의존성 방향 규칙

```
                          의존성 방향 →

┌─────────────────┐     ┌────────────────────────────┐     ┌─────────────────────┐
│  adapter/in/web │     │       application/           │     │  adapter/out/       │
│                 │────>│                              │<────│  persistence/       │
│  Controller     │     │  Service (UseCase 구현)       │     │                     │
│  (Input Port    │     │  → Input Port (implements)   │     │  PersistenceAdapter │
│   를 호출)       │     │  → Output Port (depends on)  │     │  (Output Port 구현)  │
└─────────────────┘     └────────────────────────────┘     └─────────────────────┘
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │      domain/         │
                         │  순수 자바 (POJO)      │
                         │  프레임워크 의존 X     │
                         └─────────────────────┘
```

| 계층 | 의존 대상 | 금지 |
|------|----------|------|
| `domain` | **없음** | Spring, JDBC, 외부 라이브러리 |
| `application` | `domain`만 | adapter (예외: `@Service`, `@Transactional`) |
| `adapter/in` | Input Port만 | domain 직접 참조, adapter/out |
| `adapter/out` | Output Port만 | domain 직접 참조, adapter/in |

---

## 6. 인증/인가 흐름

### 6-1. 사용자 로그인

```
Browser → Next.js /api/auth/login (BFF)
       → Spring Boot /api/auth/login (email + password)
       → JWT 발급 (role=USER)
       → BFF iron-session에 JWT 저장 (httpOnly 쿠키)
       → 브라우저에 세션 쿠키 반환 (JWT 노출 X)
```

### 6-2. 관리자 로그인

```
Browser → Next.js /api/admin/auth/login (BFF)
       → Spring Boot /api/admin/auth/login (email + password)
       → JWT 발급 (role=ADMIN)
       → BFF iron-session에 JWT 저장 (httpOnly 쿠키)
       → 브라우저에 세션 쿠키 반환 (JWT 노출 X)
```

### 6-3. SecurityConfig URL 패턴 권한표

| URL 패턴 | HTTP 메서드 | 권한 |
|----------|-----------|------|
| `/api/auth/**` | ALL | `permitAll` |
| `/api/festivals/**` | GET | `permitAll` (비회원 조회) |
| `/api/notices/**` | GET | `permitAll` (비회원 조회) |
| `/api/calendar/**` | GET | `permitAll` |
| `/api/community/**` | GET | `permitAll` (비회원 열람) |
| `/api/community/**` | POST, PUT, DELETE | `USER` (회원만) |
| `/api/reviews/**` | GET | `permitAll` |
| `/api/reviews/**` | POST, PUT, DELETE | `USER` |
| `/api/favorites/**` | ALL | `USER` |
| `/api/reports` | POST | `USER` |
| `/api/profile/**` | ALL | `USER` |
| `/api/admin/**` | ALL | `ADMIN` |

---

## 7. 사용자/관리자 기능 분배표

| 기능 | user/ 패키지 | admin/ 패키지 |
|------|-------------|-------------|
| 축제 목록/상세/검색/지도/달력 | ✅ 조회 | ✅ 조회 + 상태 변경 |
| 공공데이터 API 갱신 | ❌ | ✅ |
| 회원가입/로그인 (User) | ✅ | ❌ |
| 관리자 로그인 (Admin) | ❌ | ✅ |
| 리뷰/별점 CRUD | ✅ | ❌ |
| 즐겨찾기 CRUD | ✅ | ❌ |
| 커뮤니티 (글/댓글) CRUD | ✅ | ❌ |
| 공지사항 | ✅ (GET만) | ✅ (CRUD) |
| 신고 | ✅ (POST만) | ✅ (목록/처리) |
| 통계 대시보드 | ❌ | ✅ |
| 설문 조사 | ❌ | ✅ |
| 사용자 관리 | ❌ | ✅ |

---

## 8. 공유 도메인 객체 처리 전략

`user/festival/`과 `admin/festival-mgmt/`가 같은 DB 테이블을 사용하지만 **별도 도메인 객체**로 관리합니다.

```
# 방법: 공통 도메인을 shared 패키지로 분리

com.ieum.festival/
├── shared/                          # 🔗 공유 도메인 (양쪽에서 import)
│   └── domain/
│       ├── Festival.java            # 공통 도메인
│       ├── Notice.java
│       └── Report.java
│
├── user/
│   ├── festival/                    # shared.domain.Festival 사용
│   └── notice/                      # shared.domain.Notice 사용
│
└── admin/
    ├── festival-mgmt/               # shared.domain.Festival 사용
    └── notice-mgmt/                 # shared.domain.Notice 사용
```

| 도메인 | 위치 | 이유 |
|--------|------|------|
| `Festival`, `Notice`, `Report` | `shared/domain/` | 양쪽에서 동일 테이블 접근 |
| `User` | `user/auth/domain/` | 사용자 영역에서만 사용 |
| `Admin` | `admin/admin-auth/domain/` | 관리자 영역에서만 사용 |
| `Review`, `Favorite`, `Post`, `Comment` | `user/*/domain/` | 사용자 영역에서만 사용 |
| `Survey`, `ManagedUser`, `Stats` | `admin/*/domain/` | 관리자 영역에서만 사용 |

---

## 9. Docker Compose 구성

```yaml
services:
  frontend:                          # Next.js (BFF 포함)
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - BACKEND_URL=http://backend:8080

  backend:                           # Spring Boot (Hexagonal)
    build: ./backend
    ports: ["8080:8080"]
    depends_on: [postgres]

  postgres:
    image: postgres:17
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  nginx:
    build: ./nginx
    ports: ["80:80", "443:443"]
    depends_on: [frontend]
```

---

## 10. 작업 순서 (Phase별)

### Phase 1: 초기 세팅 (1주차 / 3.25 ~ 3.31)

| # | 작업 | 산출물 |
|---|------|--------|
| 1-1 | GitHub 리포 + 브랜치 전략 (main/develop/feature) | 리포지토리 |
| 1-2 | Next.js 초기화 (App Router, TypeScript, CSS Modules) | frontend/ |
| 1-3 | Spring Boot 초기화 + 헥사고날 패키지 구조 (user/ admin/ global/ shared/) | backend/ |
| 1-4 | PostgreSQL DDL 작성 (ERD 기반) | database/init.sql |
| 1-5 | Docker Compose 초안 | docker-compose.yml |
| 1-6 | SecurityConfig (URL 패턴별 권한) + JWT 기반 인증 | global/security/ |
| 1-7 | iron-session 설정 + middleware.ts (라우트 보호) | frontend/lib/ |

### Phase 2: 핵심 개발 (2주차 / 4.1 ~ 4.7)

| # | 작업 | 영역 |
|---|------|------|
| 2-1 | user/auth (회원가입/로그인/JWT) + BFF 연동 | user/ |
| 2-2 | admin/admin-auth (관리자 로그인) + BFF 연동 | admin/ |
| 2-3 | user/festival (조회/검색/지도/달력) | user/ |
| 2-4 | admin/festival-mgmt (공공데이터 갱신) | admin/ |
| 2-5 | 사용자 레이아웃 + 메인 + 지도 + 로그인 UI | frontend/(user) |
| 2-6 | 관리자 레이아웃 + 대시보드 + 축제관리 UI | frontend/admin/ |

### Phase 3: 기능 완성 (3주차 / 4.8 ~ 4.14)

| # | 작업 | 영역 |
|---|------|------|
| 3-1 | user/ : review, favorite, community, notice(조회), report(접수) | user/ |
| 3-2 | admin/ : report-mgmt, notice-mgmt, statistics, survey, user-mgmt | admin/ |
| 3-3 | 사용자 전체 페이지 (달력, 지난축제, 커뮤니티, 마이페이지) | frontend/(user) |
| 3-4 | 관리자 전체 페이지 (신고, 공지, 통계, 설문, 사용자관리) | frontend/admin/ |

### Phase 4: 배포 & 마무리 (4주차 / 4.15 ~ 4.24)

| # | 작업 | 산출물 |
|---|------|--------|
| 4-1 | Docker Compose 완성 + Nginx 설정 | 배포 환경 |
| 4-2 | GitHub Actions CI/CD | 파이프라인 |
| 4-3 | Swagger 문서 (user/admin 그룹 분리) | API 문서 |
| 4-4 | 통합 테스트 + 버그 수정 + 발표 준비 | 최종 산출물 |

---

> [!TIP]
> **구현 순서**: Auth(양쪽) → Festival(양쪽) → 사용자 확장 → 관리자 확장  
> 각 Context 내부는 `domain/` → `port/` → `service/` → `adapter/out/` → `adapter/in/` 순서(안→밖)

> [!IMPORTANT]
> `user/`와 `admin/`이 같은 DB 테이블을 공유하므로, **shared/domain/**에 공통 도메인을 둬서 중복을 방지하세요.

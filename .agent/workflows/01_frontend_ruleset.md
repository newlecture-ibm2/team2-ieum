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

```text
frontend/src/                   
├── _shared/                    # 전역 공용 UI 컴포넌트 (순수 UI 컴포넌트)
│   ├── ConfirmDialog/
│   ├── DataTable/
│   ├── Modal/
│   ├── Pagination/
│   └── StarRating/
│
├── app/                        # Next.js App Router 폴더
│   ├── layout.tsx              # 최상단 루트 레이아웃 (공통 Header/Footer)
│   ├── page.tsx                # 홈페이지 (루트 경로)
│   ├── globals.css             # 이음 브랜드 디자인 시스템 (CSS Variables)
│   │
│   ├── _components/            # 홈페이지 등 app 최상단 전용 컴포넌트
│   │   ├── HeroBanner/
│   │   └── PopularFestivals/
│   │
│   ├── (user)/                 # 일반 사용자 대상 뷰 라우트 (Route Group)
│   │   ├── _components/        # 유저 뷰 전용 공통 컴포넌트 (사이드바, 네비 등)
│   │   ├── calendar/           # 축제 달력
│   │   ├── community/          # 자유게시판/커뮤니티
│   │   ├── festivals/          # 전국 축제 메인 및 조회
│   │   ├── myPage/             # 마이페이지
│   │   ├── notices/            # 사용자별 공지사항 조회
│   │   └── pastFestivals/      # 지난 축제 정보
│   │
│   ├── admin/                  # 🎯 관리자 전용 대시보드 프로토타입
│   │   ├── layout.tsx          # 관리자용 공통 레이아웃 (Admin LNB, Header 유지)
│   │   ├── _components/        # admin 전역 컴포넌트 (AdminSidebar 등)
│   │   │
│   │   ├── festivals/          # 축제 데이터 관리 도메인
│   │   │   ├── page.tsx        # 1. 축제 목록 조회 (/admin/festivals)
│   │   │   ├── _components/    # 목록용 특화 컴포넌트 (FestivalCard, Filter 등)
│   │   │   │
│   │   │   ├── new/            # 2. 신규 축제 등록 (/admin/festivals/new)
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── [id]/           # 3. 상세 조회 (/admin/festivals/123)
│   │   │       ├── page.tsx    
│   │   │       └── edit/       # 4. 기존 축제 수정 (/admin/festivals/123/edit)
│   │   │
│   │   └── regions/            # 지역 카테고리 관리 도메인 
│   │
│   ├── api/                    # Next.js Serverless API (내부 로직)
│   └── auth/                   # 인증(Authentication) 뷰 및 로직
│
├── lib/                        # 범용 액션 함수, Axios 클라이언트 인스턴스
├── stores/                     # Zustand (로그인 세션, 장바구니 등 전역 상태)
├── types/                      # 글로벌 TypeScript 모델 선언 (Festival 등)
└── package.json
```

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
- [ ] Next.js 16 App Router 기반 아키텍처 및 `src/_shared` 폴더 사용규칙 동의
- [ ] 축제 관련 데이터 도메인 구조 (지역/이미지 다중맵핑) 동의
- [ ] Vanilla CSS / CSS Modules 을 통한 독립적 스타일링 지향 동의
- [ ] 백엔드 API(`/api/admin/festivals`)와의 규격 일치 여부 확인

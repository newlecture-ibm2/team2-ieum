# 🎪 이음 (ieum) — 지역 축제 통합 정보 플랫폼

> 전국 축제 정보를 지도 기반으로 탐색하고, 커뮤니티에서 소통하는 통합 플랫폼

---

## 🚀 빠른 시작 가이드 (Quick Start)

> 프로젝트를 클론받고 실행하기까지 필요한 **모든 과정**을 순서대로 정리했습니다.

### 📦 사전 준비 (필수 소프트웨어)

아래 도구들이 설치되어 있어야 합니다. 미설치 시 [개발 환경 설정](#%EF%B8%8F-개발-환경-설정) 섹션을 참고하세요.

| 도구 | 최소 버전 | 확인 명령어 |
|------|----------|------------|
| **Git** | 2.x | `git --version` |
| **Node.js** | 22 LTS | `node -v` |
| **npm** | 10.x | `npm -v` |
| **Java (JDK)** | 21+ | `java -version` |
| **Docker Desktop** | 최신 | `docker -v` |

---

### 방법 1️⃣ Docker로 전체 한 번에 실행 (권장)

> Docker Desktop이 실행 중이어야 합니다.

```bash
# 1. 프로젝트 클론
git clone https://github.com/newlecture-ibm2/team2-ieum.git
cd team2-ieum

# 2. 전체 서비스 실행 (PostgreSQL + Backend + Frontend + Nginx)
docker compose up -d

# 3. 실행 확인
docker compose ps        # 모든 서비스가 running 상태인지 확인
docker compose logs -f   # 실시간 로그 확인 (Ctrl+C로 종료)
```

| 서비스 | URL |
|--------|-----|
| 🌐 프론트엔드 | http://localhost:3000 |
| ⚙️ 백엔드 API | http://localhost:8080 |
| 📖 Swagger 문서 | http://localhost:8080/swagger-ui.html |
| 🗄️ PostgreSQL | `localhost:5432` (DB: `ieum`) |

```bash
# 종료
docker compose down

# 데이터까지 완전 초기화
docker compose down -v
```

---

### 방법 2️⃣ 로컬에서 개별 실행 (개발 시 권장)

#### Step 1. 프로젝트 클론

```bash
git clone https://github.com/newlecture-ibm2/team2-ieum.git
cd team2-ieum
```

#### Step 2. PostgreSQL 실행

```bash
# Docker로 DB만 실행
docker run -d \
  --name ieum-db \
  -p 5432:5432 \
  -e POSTGRES_DB=ieum \
  -e POSTGRES_USER=ieum \
  -e POSTGRES_PASSWORD=ieum1234 \
  postgres:17
```

> 또는 로컬에 설치된 PostgreSQL을 사용해도 됩니다. DB명: `ieum`, 유저: `ieum`, 비밀번호: `ieum1234`

#### Step 3. 백엔드 실행 (Spring Boot)

```bash
cd backend
./gradlew bootRun
# → http://localhost:8080 에서 API 실행
# → http://localhost:8080/swagger-ui.html 에서 API 문서 확인
```

> ⚠️ 최초 실행 시 Gradle 의존성 다운로드에 시간이 걸릴 수 있습니다.

#### Step 4. 프론트엔드 실행 (Next.js)

```bash
# 새 터미널을 열고
cd frontend
npm install       # 최초 1회: 패키지 설치
npm run dev
# → http://localhost:3000 에서 프론트엔드 실행
```

---

### 🔑 환경 변수 참고

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/ieum` | DB 접속 URL |
| `SPRING_DATASOURCE_USERNAME` | `ieum` | DB 유저명 |
| `SPRING_DATASOURCE_PASSWORD` | `ieum1234` | DB 비밀번호 |
| `JWT_SECRET` | (내장 기본값) | JWT 서명 키 |
| `BACKEND_URL` | `http://backend:8080` | BFF → Backend URL |
| `SESSION_SECRET` | (Docker 내장) | iron-session 암호화 키 |

---

<br>

## 📌 Git 커밋 메시지 컨벤션

커밋 메시지를 통일된 형식으로 작성하면 변경 이력을 한눈에 파악할 수 있습니다.

### 커밋 메시지 형식

```
<타입>: <제목>

(선택) 본문 - 변경 이유나 상세 설명
```

**예시:**
```
feat: 로그인 페이지 UI 구현
fix: 메뉴 이미지 경로 오류 수정
```

<br>

### 🏷️ 타입 종류

| 타입 | 언제 사용하나요? | 예시 |
|------|-----------------|------|
| **feat** | 새로운 기능을 추가할 때 | `feat: 회원가입 API 구현` |
| **fix** | 버그를 수정할 때 | `fix: 로그인 시 토큰 만료 오류 수정` |
| **style** | 코드 동작에 영향 없는 스타일 변경 (CSS, 포맷팅, 세미콜론 등) | `style: 버튼 hover 색상 변경` |
| **refactor** | 기능 변경 없이 코드를 개선/정리할 때 | `refactor: MenuCard 컴포넌트 구조 분리` |
| **docs** | 문서(README 등)를 수정할 때 | `docs: API 명세서 업데이트` |
| **chore** | 빌드 설정, 패키지 등 기타 작업 | `chore: eslint 설정 추가` |
| **test** | 테스트 코드를 추가/수정할 때 | `test: 로그인 유효성 검사 테스트 추가` |
| **rename** | 파일/폴더명을 변경할 때 | `rename: components 폴더 구조 변경` |
| **remove** | 파일을 삭제할 때 | `remove: 사용하지 않는 유틸 함수 제거` |

<br>

### ✅ 좋은 커밋 메시지 vs ❌ 나쁜 커밋 메시지

| ✅ 좋은 예 | ❌ 나쁜 예 |
|-----------|-----------|
| `feat: 카테고리별 메뉴 필터링 기능 추가` | `수정함` |
| `fix: 장바구니 수량 음수 입력 방지` | `버그 fix` |
| `style: 메인페이지 반응형 레이아웃 적용` | `css 수정` |
| `refactor: API 호출 로직 커스텀 훅으로 분리` | `코드 정리` |
| `docs: 커밋 컨벤션 가이드 추가` | `readme` |

<br>

### 💡 작성 팁

1. **제목은 간결하게** — 50자 이내로 핵심만 작성
2. **명령문으로 작성** — "~추가", "~수정", "~삭제" 형태
3. **타입은 소문자** — `Feat` ❌ → `feat` ✅
4. **하나의 커밋 = 하나의 작업** — 여러 작업을 한 커밋에 넣지 않기
5. **왜 변경했는지** 설명이 필요하면 본문에 작성


## 📋 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 이음 (ieum) — 지역 축제 통합 정보 플랫폼 |
| **팀명** | Team 2 |
| **기간** | 2026.03.25 ~ 2026.04.21 |
| **발표** | 4/20 리허설, **4/21 1차 프로젝트 발표** |

### 주요 기능

- 🗺️ **카카오맵 기반 전국 축제 탐색** — 시/도별 클러스터링, GPS 현재 위치
- 📅 **달력 뷰** — 월별 축제 일정 확인
- 📜 **지난 축제** — 후기/별점 열람
- ⭐ **리뷰/별점** — 축제 후기 작성 (회원)
- ❤️ **즐겨찾기** — 관심 축제 저장 (회원)
- 💬 **커뮤니티** — Q&A / 축제 꿀팁 / 먹거리 게시판
- ⚙️ **관리자** — 축제 데이터 관리, 통계 대시보드, 신고 처리, 설문 조사

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js (App Router), TypeScript, CSS Modules, Zustand |
| **BFF** | Next.js API Routes, iron-session |
| **Backend** | Spring Boot 4.0.1, Java 21, Hexagonal Architecture |
| **Database** | PostgreSQL 17 |
| **지도** | Kakao Maps API (react-kakao-maps-sdk) |
| **인증** | JWT (Spring Security) + iron-session (BFF) |
| **배포** | Docker Compose, Nginx |
| **문서** | Swagger (OpenAPI 3.0) |

---

## 📁 프로젝트 구조

```
team2-ieum/
├── frontend/                    # Next.js (BFF 포함)
│   └── src/
│       ├── app/                 # App Router (Co-location 패턴)
│       │   ├── (user)/          # 사용자 페이지
│       │   ├── admin/           # 관리자 페이지
│       │   ├── auth/            # 인증 페이지
│       │   └── api/             # BFF API Routes
│       ├── _shared/             # 공통 컴포넌트
│       ├── lib/                 # session, api 클라이언트
│       ├── stores/              # Zustand (전역 상태)
│       └── middleware.ts        # 라우트 보호
│
├── backend/                     # Spring Boot (Hexagonal)
│   └── src/main/java/com/ieum/festival/
│       ├── shared/domain/       # 공유 도메인 (Festival, Notice, Report)
│       ├── user/                # 사용자 영역 (7개 Context)
│       ├── admin/               # 관리자 영역 (7개 Context)
│       └── global/              # 공통 인프라 (Security, Exception)
│
├── database/                    # DDL, 마이그레이션
│   └── init.sql                 # PostgreSQL 초기 스키마
│
├── nginx/                       # Nginx 리버스 프록시 설정
├── docker-compose.yml           # 전체 서비스 오케스트레이션
└── docs/
    ├── blueprints/              # 아키텍처 청사진, 기획서
    └── wireframes/              # 와이어프레임
```

---

## ⚙️ 개발 환경 설정

### 필수 설치 목록

| # | 도구 | 버전 | 용도 | 설치 방법 |
|---|------|------|------|----------|
| 1 | **Homebrew** | 최신 | Mac 패키지 관리자 | 아래 참고 |
| 2 | **Node.js** | 22 LTS | 프론트엔드 (Next.js) | `brew install node` |
| 3 | **Java (JDK)** | 21+ | 백엔드 (Spring Boot) | `brew install openjdk@21` |
| 4 | **Docker Desktop** | 최신 | DB, 배포 | `brew install --cask docker` |

### 선택 설치 (Docker 없이 로컬 개발 시)

| # | 도구 | 설치 방법 |
|---|------|----------|
| 1 | **PostgreSQL** | `brew install postgresql@17` |

---

### 1단계: Homebrew 설치 (Mac 패키지 관리자)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

> 설치 후 터미널에 나오는 안내에 따라 PATH 설정을 해주세요.

### 2단계: Node.js 설치

```bash
# 방법 A: Homebrew로 직접 설치
brew install node

# 방법 B: nvm으로 설치 (버전 관리 가능, 권장)
brew install nvm
mkdir ~/.nvm
# .zshrc에 아래 추가:
# export NVM_DIR="$HOME/.nvm"
# [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
source ~/.zshrc
nvm install 22
```

설치 확인:
```bash
node -v   # v22.x.x
npm -v    # 10.x.x
```

### 3단계: Java 설치 (이미 설치된 경우 생략)

```bash
brew install openjdk@21

# .zshrc에 PATH 추가
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

설치 확인:
```bash
java -version   # openjdk 21.x.x
```

### 4단계: Docker Desktop 설치

```bash
brew install --cask docker
```

> 설치 후 Docker Desktop 앱을 실행해주세요. (첫 실행 시 권한 허용 필요)

설치 확인:
```bash
docker -v           # Docker version 27.x.x
docker compose version  # Docker Compose version v2.x.x
```

---

## 🚀 프로젝트 실행

### 프론트엔드 (Next.js)

```bash
cd frontend
npm install          # 패키지 설치
npm run dev          # 개발 서버 실행 → http://localhost:3000
```

### 백엔드 (Spring Boot)

```bash
cd backend
./gradlew bootRun    # 개발 서버 실행 → http://localhost:8080
```

### Docker Compose (전체 서비스)

```bash
docker compose up -d    # 모든 서비스 백그라운드 실행
docker compose logs -f  # 로그 확인
docker compose down     # 종료
```

---

## 🔐 API URL 규칙

| URL 패턴 | 권한 | 설명 |
|----------|------|------|
| `GET /api/festivals/**` | 누구나 | 축제 조회 (비회원 허용) |
| `GET /api/notices/**` | 누구나 | 공지사항 조회 |
| `GET /api/community/**` | 누구나 | 게시글 열람 |
| `POST /api/reviews/**` | USER | 리뷰 작성 (회원만) |
| `/api/favorites/**` | USER | 즐겨찾기 (회원만) |
| `POST /api/reports` | USER | 신고 접수 (회원만) |
| `/api/auth/**` | 누구나 | 로그인/회원가입 |
| `/api/admin/**` | ADMIN | 관리자 전용 |

---

## 📅 일정

| 단계 | 기간 | 주요 작업 |
|------|------|----------|
| 1단계: 기획 & 설계 | 3/25 ~ 3/31 | 기획서, 와이어프레임, ERD, API 설계 |
| 2단계: 핵심 개발 | 4/1 ~ 4/7 | DB, 인증 API, 축제 조회, 지도 UI |
| 3단계: 기능 완성 | 4/8 ~ 4/14 | 커뮤니티, 마이페이지, 관리자 페이지 |
| 4단계: 배포 & 마무리 | 4/15 ~ 4/19 | Docker, CI/CD, 테스트, 버그 수정 |
| 📌 발표 리허설 | **4/20 (월)** | 시연 점검, PPT 최종 |
| 🎤 1차 프로젝트 발표 | **4/21 (화)** | 최종 발표 |

---

## 👥 팀원

| 팀원 | 역할 | 담당 |
|------|------|------|
| (팀원 A) | 팀장 / 프론트 | 메인, 지도 연동, 레이아웃 |
| (팀원 B) | 프론트 | 달력, 축제 상세, 마이페이지 |
| (팀원 C) | 프론트 / 퍼블리싱 | 커뮤니티, 공지, 관리자 UI |
| (팀원 D) | 백엔드 | 축제 API, 검색, 공공데이터 연동 |
| (팀원 E) | 백엔드 / 인프라 | 인증, 리뷰/게시판 API, Docker |

---

## 📚 참고 문서

- [아키텍처 청사진](./docs/blueprints/ARCHITECTURE_BLUEPRINT.md)
- [프로젝트 기획서](./docs/blueprints/프로젝트_기획서_템플릿.md)
- [와이어프레임](./docs/wireframes/와이어프레임_가이드.md)
- [공공데이터포털 축제 API](https://www.data.go.kr)
- [카카오맵 API](https://apis.map.kakao.com/)
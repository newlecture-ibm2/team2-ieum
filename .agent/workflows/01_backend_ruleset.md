# 이음(ieum) 백엔드 청사진 (Blueprint) - Phase 1

> 🎯 목표: 관리자(Admin) 전용 지역 축제 정보 관리 REST API 구현
> 🏢 도메인: 지역 축제 (Festival), 지역 분류 (Region/Category), 축제 이미지 (Image)

---

## 1. 기술 스택
### 🔧 Core Framework
| 기술 | 버전 | 선정 이유 |
|------|------|----------|
| **Spring Boot** | 최신 3.x | 안정적이고 빠른 REST API 서버 구축 |
| **Java** | 21 | LTS 버전 및 최신 문법(Virtual Threads 등) 지원 |
| **Gradle** | 8.x/9.x | 의존성 관리 및 빌드 최적화 |

### 📦 주요 의존성
| 라이브러리 | 용도 | 필수 여부 |
|-----------|------|----------|
| `spring-boot-starter-data-jpa` | JPA/Hibernate 기반 ORM | ✅ 필수 |
| `spring-boot-starter-validation` | 요청(Request) 데이터 입력 검증 | ✅ 필수 |
| `postgresql` | PostgreSQL 데이터베이스 드라이버 | ✅ 필수 |
| `lombok` | 보일러플레이트 코드 제거 | ⭕ 권장 |

---

## 2. 디렉토리 구조 (Backend)

```text
backend/
├── src/main/java/com/team2/ieum/
│   ├── IeumApplication.java              # 애플리케이션 시작점
│   │
│   ├── config/                           # 전역 설정
│   │   ├── CorsConfig.java               # 프론트엔드 연동을 위한 CORS 설정
│   │   └── SwaggerConfig.java            # API 명세서 자동화를 위한 Swagger 설정
│   │
│   ├── controller/admin/                 # 🎯 관리자 전용 API 라우터
│   │   ├── AdminFestivalController.java  # 축제 CRUD API (/api/admin/festivals)
│   │   └── AdminRegionController.java    # 지역/카테고리 API (/api/admin/regions)
│   │
│   ├── dto/                              # 데이터 전송 객체 (요청용/응답용)
│   │   ├── request/
│   │   │   ├── FestivalCreateReq.java    # 축제 등록 요청
│   │   │   └── FestivalUpdateReq.java    # 축제 수정 요청
│   │   └── response/
│   │       ├── FestivalDetailRes.java    # 축제 상세 정보 응답
│   │       ├── FestivalListRes.java      # 축제 목록 응답
│   │       └── ApiResponse.java          # 공통 응답 래퍼
│   │
│   ├── entity/                           # JPA 엔티티 (DB 테이블 매핑)
│   │   ├── Festival.java                 # festivals 테이블 (축제 기본 정보)
│   │   ├── FestivalImage.java            # festival_images 테이블 (다중 이미지)
│   │   └── Region.java                   # regions 테이블 (도/시 단위 지역 코드)
│   │
│   ├── repository/                       # DB 접근 레이어 (Spring Data JPA)
│   │   ├── FestivalRepository.java       
│   │   └── RegionRepository.java         
│   │
│   ├── service/                          # 비즈니스 로직
│   │   ├── FestivalService.java          # 축제 등록/수정/삭제/조회 비즈니스
│   │   └── FileUploadService.java        # 상세 이미지, 썸네일 S3/로컬 업로드 처리
│   │
│   └── exception/                        # 공통 에러 처리
│       ├── GlobalExceptionHandler.java   
│       └── ResourceNotFoundException.java
└── build.gradle
```

---

## 3. API 엔드포인트 명세

### 3.1 관리자 축제 관리 API (`/api/admin/festivals`)
| Method | Endpoint | 설명 | 요청 | 응답 |
|--------|----------|------|------|------|
| `GET` | `/api/admin/festivals` | 전체 축제 목록 조회 | Query: `regionId`, `search`, `status` | `FestivalListRes[]` |
| `GET` | `/api/admin/festivals/{id}` | 특정 축제 상세 조회 | Path: `id` | `FestivalDetailRes` |
| `POST` | `/api/admin/festivals` | 신규 축제 등록 | Body: `FestivalCreateReq` | `FestivalDetailRes` |
| `PUT` | `/api/admin/festivals/{id}` | 축제 정보 수정 | Path: `id`, Body: `FestivalUpdateReq` | `FestivalDetailRes` |
| `DELETE` | `/api/admin/festivals/{id}` | 축제 정보 삭제 | Path: `id` | `void` |
| `PATCH` | `/api/admin/festivals/{id}/status` | 진행/종료 상태 토글 | Path: `id`, Body: `status` | `void` |

### 3.2 지역/카테고리 API (`/api/admin/regions`)
| Method | Endpoint | 설명 | 요청 | 응답 |
|--------|----------|------|------|------|
| `GET` | `/api/admin/regions` | 지역(시/도) 목록 조회 | - | `RegionRes[]` |
| `POST` | `/api/admin/regions` | 신규 지역 등록 | Body: `RegionCreateReq` | `RegionRes` |

---

## 4. 핵심 DTO 및 ERD 구조

### 📥 Request DTO (등록 예시)
```java
public class FestivalCreateReq {
    private String title;          // 축제명 (예: "보령 머드 축제")
    private String description;    // 상세 설명
    private String address;        // 개최 상세 주소
    private Long regionId;         // 지역 ID (충청남도 등)
    private LocalDate startDate;   // 시작 기간
    private LocalDate endDate;     // 종료 기간
    private Integer fee;           // 참가비 (무료면 0)
    private List<String> imageUrls; // S3 등에 미리 업로드된 이미지 URL 목록
}
```

### 📊 엔티티 (ERD) 연관 관계
1. **Festival (1) <-> (N) FestivalImage** : 하나의 축제에는 썸네일을 포함한 다수의 이미지가 등록됨.
2. **Region (1) <-> (N) Festival** : 하나의 지역(ex: 서울, 부산)에 다수의 축제가 속함.

---

## 5. 실행 및 테스트
* 프로젝트 루트에서 `./gradlew bootRun`을 통해 서버 접속 (기본 8080 포트).
* Swagger UI (`/swagger-ui.html`)를 연결해 프론트엔드 작업자가 즉각적으로 API를 테스트할 수 있게 지원합니다.

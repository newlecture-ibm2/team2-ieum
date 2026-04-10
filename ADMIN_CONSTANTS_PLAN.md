# Admin 내부 공통 상수 정리 실행 계획서

> 작성일: 2026-04-09
> 실행 예정일: 2026-04-12 (월)
> 범위: com.ieum.admin 패키지 내부 Java 코드 영역
> 상태: 실행 대기

---

## 1. 개요

### 1-1. 이번 작업의 목적

admin 내부를 최대한 정돈하여 user/auth와 비교 가능한 상태로 만든다. 보수적 리팩터링이 아니라, admin 영역을 완성형으로 정리하는 공격적 1차 정리다.

admin 영역에 산재한 하드코딩 상수(상태값, 역할, 정책값, 타겟타입)를 admin/common/constant 패키지로 집중하고, festival 모듈은 기존 FestivalStatus enum 기반으로 문자열 사용을 통일한다.

### 1-2. 월요일 실행 플로우

| 순서 | 작업 | 담당 |
|:---:|------|------|
| 1 | admin 상수 정리 완료 | 이번 작업 |
| 2 | user/auth 작업 완료 후 merge | user/auth 담당자 |
| 3 | admin과 user/auth 구조 비교 | 양측 |
| 4 | 전역 상수 승격 여부 판단 | 양측 협의 |
| 5 | 통합 테스트 | 전체 |

이번 작업의 결과물은 admin 단독 완성이 아니라, user/auth와 비교 가능한 기준선(baseline) 확보다.

### 1-3. 범위

| 구분 | 포함 여부 |
|------|:---------:|
| admin 내부 Java 코드의 상수 | ✅ |
| festival 문자열을 enum 기반으로 통일 | ✅ |
| JPQL 문자열 리터럴 | ❌ |
| 네이티브 SQL 내부 문자열 | ❌ |
| JPA @PrePersist 기본값 | ❌ |
| user/auth, community, review | ❌ |
| global/security | ❌ |
| frontend | ❌ |

### 1-4. 왜 지금 admin/common으로 빼는 것이 맞는가

admin 영역은 member, report, inquiry, festival, notice, statistics 6개 모듈로 구성되어 있다. 이 중 "PENDING"이 report, inquiry, statistics 3개 모듈에서, "POST"/"COMMENT"/"REVIEW"가 report와 member 2개 모듈에서 각각 독립적으로 하드코딩되어 있다.

이 상황에서 전역 패키지(global/shared)를 만들어 user/auth까지 한 번에 통합하는 것은 범위가 크고, 마감 직전에 안전하지 않다. admin 내부 여러 모듈에서 공통으로 사용하는 값은 admin이 소유하는 것이 자연스럽다. user/auth와 값이 일부 겹치더라도 지금은 컨텍스트 분리가 우선이다.

admin 내부를 먼저 정리해두면 향후 전역 통합이 필요할 때 이동 범위가 명확해지며, user/auth 담당자의 작업 결과와 구조를 비교하여 승격 여부를 판단할 수 있다.

---

## 2. 작업 영역 구분

이번 작업은 3개 영역으로 구분한다.

### A. admin/common 상수 분리 영역

admin 내부 여러 모듈에서 공통 사용하는 문자열/숫자 상수를 admin/common/constant 패키지에 상수 클래스로 정리한다.

대상: MemberStatus, MemberRole, ReportStatus, InquiryStatus, TargetType, AdminPolicy

이유: 이 값들은 admin 전용 enum이 존재하지 않으며, 2개 이상 모듈에서 교차 사용되거나 admin 업무 정책에 해당한다. final class 기반 문자열 상수로 정리하는 것이 현실적이다.

### B. festival enum 통일 영역

festival 모듈에서 하드코딩된 문자열("ONGOING", "UPCOMING", "ENDED")을 기존 FestivalStatus enum의 .name()으로 통일한다. 새로운 문자열 상수 클래스(FestivalStatusConstant)는 생성하지 않는다.

대상: FestivalAdminService, CustomFestivalAdminService, CustomFestivalItem, DashboardService의 festival 관련 코드

이유: FestivalStatus enum(UPCOMING, ONGOING, ENDED, HIDDEN)이 admin/festival/domain/model에 이미 존재한다. 별도 문자열 상수 클래스를 추가하면 같은 의미의 값이 enum + 상수 2곳에 존재하게 되어 혼란을 만든다. enum.name()을 활용하면 type-safe하면서도 단일 소스를 유지할 수 있다.

### C. 이번에 건드리지 않는 영역

| 항목 | 위치 | 이유 |
|------|------|------|
| JPQL 문자열 리터럴 | DashboardPersistenceAdapter L33, L40, L73 | JPQL 내부의 'ONGOING', 'ANSWERED' 등은 파라미터 바인딩으로 전환해야 한다. 엔티티 매핑 검증이 필요하므로 별도 작업으로 분리한다. |
| 네이티브 SQL 내부 문자열 | MemberPersistenceAdapter L130~134 | SQL 문자열 내부의 'POST', 'COMMENT', 'REVIEW'는 Java 상수로 교체 시 문자열 결합 방식을 사용해야 한다. 가독성과 안전성의 트레이드오프가 존재하므로 보류한다. |
| JPA @PrePersist 기본값 | InquiryEntity L55, AdminFestivalEntity L147 | JPA 라이프사이클 콜백에서 사용하는 기본값이다. 잘못 바꾸면 DB 기본값 저장 오류가 발생한다. 충분한 테스트 환경 확보 후 진행한다. |
| DummyDataInitializer | InquiryDummyDataInitializer, ReportDummyDataInitializer | 테스트/개발용 코드이다. 상수 교체로 인한 실질적 품질 향상이 없다. |
| cron 표현식 | CustomFestivalStatusScheduler, MemberSuspensionScheduler | 각 스케줄러에서 독립 사용하며, 변경 빈도가 극히 낮다. application.yml 외부화는 별도 주제이다. |
| ReportReason (SPAM 등) | DashboardPersistenceAdapter L159~162 | switch문에서 한글 변환용으로만 사용한다. 단일 지점이므로 로컬 유지가 충분하다. |
| CustomFestivalAdminController "DELETED" | L126 | API 응답 메시지용 문자열이며, FestivalStatus enum에 DELETED가 존재하지 않는다. enum에 값을 추가하는 것은 도메인 설계 변경이므로 이번 범위에서 제외한다. |

---

## 3. 영역 A — admin/common 상수 분리 대상 (6개)

### 3-1. ReportStatus

| 상수 | 값 |
|------|---|
| PENDING | "PENDING" |
| RESOLVED | "RESOLVED" |
| REJECTED | "REJECTED" |

| 사용 모듈 | 파일 | 교체 수 |
|---------|------|:-----:|
| report | ReportAdminService | 5곳 |
| statistics | DashboardService | 2곳 |

공통화 이유: report + statistics 2개 모듈에서 교차 사용. 문자열 불일치 시 신고 건수 집계가 틀어진다.

### 3-2. InquiryStatus

| 상수 | 값 |
|------|---|
| PENDING | "PENDING" |
| ANSWERED | "ANSWERED" |

| 사용 모듈 | 파일 | 교체 수 |
|---------|------|:-----:|
| inquiry | InquiryAdminService | 2곳 |
| inquiry | InquiryPersistenceAdapter | 2곳 |
| statistics | DashboardService | 1곳 |

공통화 이유: inquiry + statistics 2개 모듈에서 교차 사용.

### 3-3. TargetType

| 상수 | 값 |
|------|---|
| POST | "POST" |
| COMMENT | "COMMENT" |
| REVIEW | "REVIEW" |

| 사용 모듈 | 파일 | 교체 수 | 비고 |
|---------|------|:-----:|------|
| report | ReportPersistenceAdapter | 6곳 | 이번에 교체 |
| member | MemberPersistenceAdapter | 3곳 | 네이티브 SQL 내부 — 보류 |

공통화 이유: 신고 대상 구분이라는 admin 업무 규칙의 핵심 값. 이번에는 ReportPersistenceAdapter의 Java 분기 로직만 교체하고, 네이티브 SQL 내부는 보류한다.

### 3-4. AdminPolicy

| 상수 | 값 | 의미 |
|------|---|------|
| SUSPENSION_DAYS | 7 | 회원 정지 기본 기간 (일) |

| 사용 모듈 | 파일 | 교체 수 |
|---------|------|:-----:|
| member | MemberAdminService L63 | 1곳 |

공통화 이유: 관리자 업무 정책값. 정책 변경 시 한 곳만 수정하면 된다.

### 3-5. MemberStatus (기존 파일 이동)

| 상수 | 값 |
|------|---|
| ACTIVE | "ACTIVE" |
| SUSPENDED | "SUSPENDED" |
| DELETED | "DELETED" |

현재 위치: admin/member/domain/model/MemberStatus.java
이동 위치: admin/common/constant/MemberStatus.java

이동 이유: statistics 등 다른 admin 모듈에서도 회원 상태값을 참조할 수 있어야 한다. member 내부에 갇혀 있으면 교차 참조 시 패키지 의존 방향이 꼬인다.

MemberStatus가 admin/common/constant에 위치하는 것은 현재 admin 컨텍스트 기준에서 정당한 설계 선택이다. user/auth에도 동일한 의미의 상태값이 존재하지만, 지금은 각 컨텍스트가 자기 영역의 상수를 소유하는 것이 맞다. 추후 user/auth 담당자와 협의하여 통합이 필요하면 shared/global로 승격한다.

### 3-6. MemberRole

| 상수 | 값 |
|------|---|
| USER | "USER" |
| ADMIN | "ADMIN" |

| 사용 모듈 | 파일 | 교체 수 |
|---------|------|:-----:|
| member | MemberAdminController | 3곳 |

MemberStatus와 동일한 원칙을 따른다. admin에서의 역할 판별에 사용하므로 admin/common에 두는 것이 적절하다. global/security의 hasRole과 통합하는 것은 이번 범위가 아니며, 후속 조율 대상이다.

---

## 4. 영역 B — festival enum 통일 대상

FestivalStatus enum은 admin/festival/domain/model에 이미 존재하며, UPCOMING, ONGOING, ENDED, HIDDEN 4개 값을 가진다.

현재 festival 모듈의 Service 레이어에서 문자열("ONGOING" 등)을 직접 사용하는 곳을 FestivalStatus.ONGOING.name() 형태로 통일한다.

### 교체 대상

FestivalAdminService — 3곳

| 라인 | Before | After |
|:----:|--------|-------|
| L51 | "ONGOING" | FestivalStatus.ONGOING.name() |
| L52 | "UPCOMING" | FestivalStatus.UPCOMING.name() |
| L53 | "ENDED" | FestivalStatus.ENDED.name() |

CustomFestivalAdminService — 6곳

| 라인 | Before | After |
|:----:|--------|-------|
| L79 | "ONGOING" | FestivalStatus.ONGOING.name() |
| L80 | "UPCOMING" | FestivalStatus.UPCOMING.name() |
| L81 | "ENDED" | FestivalStatus.ENDED.name() |
| L86 | "ONGOING" | FestivalStatus.ONGOING.name() |
| L87 | "UPCOMING" | FestivalStatus.UPCOMING.name() |
| L88 | "ENDED" | FestivalStatus.ENDED.name() |

CustomFestivalItem — 1곳

| 라인 | Before | After |
|:----:|--------|-------|
| L55 | "UPCOMING" (fallback) | FestivalStatus.UPCOMING.name() |

DashboardService — 1곳

| 라인 | Before | After |
|:----:|--------|-------|
| L49 | "ENDED" | FestivalStatus.ENDED.name() |

### 교체하지 않는 것

| 항목 | 이유 |
|------|------|
| AdminFestivalEntity @PrePersist L147의 "UPCOMING" | JPA 콜백. 라이프사이클 영향 범위가 넓으므로 보류. |
| AdminFestivalEntity fromDomain() L233의 "UPCOMING" | Entity 변환 로직. enum null fallback 처리이므로 보류. |
| CustomFestivalAdminController L126의 "DELETED" | FestivalStatus enum에 DELETED가 없다. enum에 값을 추가하는 것은 도메인 설계 변경이므로 이번 범위에서 제외. |
| DashboardPersistenceAdapter JPQL 내부 | JPQL 리터럴은 영역 C. |

---

## 5. 실행 계획

### Step 1: 상수 클래스 생성 + MemberStatus 이동

수행 내용:
- admin/common/constant 패키지 생성
- ReportStatus, InquiryStatus, TargetType, AdminPolicy, MemberRole 5개 파일 신규 생성
- MemberStatus를 admin/member/domain/model에서 admin/common/constant로 이동
- MemberStatus를 참조하는 4개 파일의 import 경로 변경: MemberAdminService, MemberPersistenceAdapter, MemberSuspensionScheduler, MemberAdminRepository

수정하지 않는 것: 상수를 사용하는 로직 코드. 이 단계에서는 클래스 생성과 import 경로 변경만 수행한다.

순서 이유: 상수 클래스가 먼저 존재해야 Step 2~4에서 참조할 수 있다.

빌드 확인: ./gradlew compileJava

### Step 2: Service / Adapter 치환 (영역 A)

수행 내용: Service와 Adapter의 하드코딩 문자열을 상수 참조로 교체한다. 모든 변경은 import 추가 + 문자열→상수 치환이며, 로직 변경은 없다.

ReportAdminService — 5곳

| 라인 | Before | After |
|:----:|--------|-------|
| L40 | "PENDING" | ReportStatus.PENDING |
| L41 | "RESOLVED" | ReportStatus.RESOLVED |
| L42 | "REJECTED" | ReportStatus.REJECTED |
| L49 | "REJECTED" / "RESOLVED" | ReportStatus.REJECTED / ReportStatus.RESOLVED |
| L63 | "RESOLVED".equals(...) | ReportStatus.RESOLVED.equals(...) |

InquiryAdminService — 2곳

| 라인 | Before | After |
|:----:|--------|-------|
| L37 | "PENDING" | InquiryStatus.PENDING |
| L38 | "ANSWERED" | InquiryStatus.ANSWERED |

InquiryPersistenceAdapter — 2곳

| 라인 | Before | After |
|:----:|--------|-------|
| L65 | "ANSWERED".equals(...) | InquiryStatus.ANSWERED.equals(...) |
| L70 | entity.setStatus("ANSWERED") | entity.setStatus(InquiryStatus.ANSWERED) |

DashboardService — 3곳 (festival 제외)

| 라인 | Before | After |
|:----:|--------|-------|
| L32 | "PENDING" | ReportStatus.PENDING |
| L33 | "PENDING" | InquiryStatus.PENDING |
| L47 | "RESOLVED" | ReportStatus.RESOLVED |

ReportPersistenceAdapter — 6곳

| 라인 | Before | After |
|:----:|--------|-------|
| L85 | "POST".equalsIgnoreCase(...) | TargetType.POST.equalsIgnoreCase(...) |
| L92 | "COMMENT".equalsIgnoreCase(...) | TargetType.COMMENT.equalsIgnoreCase(...) |
| L99 | "REVIEW".equalsIgnoreCase(...) | TargetType.REVIEW.equalsIgnoreCase(...) |
| L115 | "POST".equalsIgnoreCase(...) | TargetType.POST.equalsIgnoreCase(...) |
| L119 | "COMMENT".equalsIgnoreCase(...) | TargetType.COMMENT.equalsIgnoreCase(...) |
| L123 | "REVIEW".equalsIgnoreCase(...) | TargetType.REVIEW.equalsIgnoreCase(...) |

MemberAdminService — 1곳

| 라인 | Before | After |
|:----:|--------|-------|
| L63 | suspendMember(userId, 7) | suspendMember(userId, AdminPolicy.SUSPENSION_DAYS) |

수정하지 않는 것: DashboardService L49("ENDED") — Step 3에서 FestivalStatus enum으로 처리. MemberPersistenceAdapter 네이티브 SQL. InquiryEntity @PrePersist. DummyDataInitializer.

순서 이유: Service/Adapter는 비즈니스 로직의 핵심이므로 Controller보다 먼저 정리한다. 문제 발생 시 컴파일 에러로 즉시 발견된다.

빌드 확인: ./gradlew compileJava

### Step 3: Festival enum 기반 치환 (영역 B)

수행 내용: festival Service 레이어와 DashboardService의 festival 관련 하드코딩 문자열을 FestivalStatus enum의 .name()으로 교체한다.

FestivalAdminService — 3곳

| 라인 | Before | After |
|:----:|--------|-------|
| L51 | "ONGOING" | FestivalStatus.ONGOING.name() |
| L52 | "UPCOMING" | FestivalStatus.UPCOMING.name() |
| L53 | "ENDED" | FestivalStatus.ENDED.name() |

CustomFestivalAdminService — 6곳

| 라인 | Before | After |
|:----:|--------|-------|
| L79 | "ONGOING" | FestivalStatus.ONGOING.name() |
| L80 | "UPCOMING" | FestivalStatus.UPCOMING.name() |
| L81 | "ENDED" | FestivalStatus.ENDED.name() |
| L86 | "ONGOING" | FestivalStatus.ONGOING.name() |
| L87 | "UPCOMING" | FestivalStatus.UPCOMING.name() |
| L88 | "ENDED" | FestivalStatus.ENDED.name() |

CustomFestivalItem — 1곳

| 라인 | Before | After |
|:----:|--------|-------|
| L55 | "UPCOMING" | FestivalStatus.UPCOMING.name() |

DashboardService — 1곳

| 라인 | Before | After |
|:----:|--------|-------|
| L49 | "ENDED" | FestivalStatus.ENDED.name() |

수정하지 않는 것: AdminFestivalEntity @PrePersist. AdminFestivalEntity fromDomain(). CustomFestivalAdminController "DELETED". JPQL 리터럴.

순서 이유: Step 2(common 상수)와 Step 3(festival enum)은 서로 독립적인 영역이다. Step 2가 안정된 후 진행하여 문제 발생 시 원인을 분리할 수 있다.

빌드 확인: ./gradlew compileJava

### Step 4: Controller 치환

수행 내용: MemberAdminController의 request validation 하드코딩을 상수 참조로 교체한다.

MemberAdminController — 4곳

| 라인 | Before | After |
|:----:|--------|-------|
| L66 | !newStatus.equals("ACTIVE") && !newStatus.equals("SUSPENDED") | !newStatus.equals(MemberStatus.ACTIVE) && !newStatus.equals(MemberStatus.SUSPENDED) |
| L76 | "SUSPENDED".equals(newStatus) | MemberStatus.SUSPENDED.equals(newStatus) |
| L107 | !newRole.equals("USER") && !newRole.equals("ADMIN") | !newRole.equals(MemberRole.USER) && !newRole.equals(MemberRole.ADMIN) |
| L117 | "ADMIN".equals(newRole) | MemberRole.ADMIN.equals(newRole) |

수정하지 않는 것: CustomFestivalAdminController "DELETED". 에러 메시지, 로그 문자열.

순서 이유: Controller는 외부 API와 직결되므로 가장 마지막에 진행한다. 오류 시 API 장애로 이어질 수 있으므로 반드시 API 호출 테스트를 수행한다.

빌드 확인: ./gradlew compileJava
API 테스트: 회원 상태 변경 / 역할 변경 API 호출 → 정상 응답 확인

### Step 5: 빌드 및 검증

| 검증 항목 | 방법 |
|---------|------|
| 컴파일 | ./gradlew compileJava — BUILD SUCCESSFUL |
| 서버 기동 | ./gradlew bootRun — 정상 기동 |
| API 테스트 | 회원/신고/문의 목록 조회 → countByStatus 정상 |
| 축제 조회 | 공공 축제/축제 관리 목록 → statusCounts 정상 |
| Dashboard | 대시보드 → KPI/운영요약 수치 정상 |
| Admin 페이지 | 브라우저에서 필터 동작 확인 |

---

## 6. 영향 범위

### 변경 대상 파일

| 모듈 | 파일 | Step | 변경 내용 |
|------|------|:----:|---------|
| common (신규) | ReportStatus, InquiryStatus, TargetType, AdminPolicy, MemberRole | 1 | 5개 파일 신규 생성 |
| common (이동) | MemberStatus | 1 | member/domain에서 이동 |
| member | MemberAdminService | 1, 2 | import 변경 + 정책값 상수화 |
| member | MemberPersistenceAdapter | 1 | import 경로 변경 |
| member | MemberSuspensionScheduler | 1 | import 경로 변경 |
| member | MemberAdminRepository | 1 | import 경로 변경 |
| member | MemberAdminController | 4 | 4곳 상수 참조 교체 |
| report | ReportAdminService | 2 | 5곳 상수 교체 |
| report | ReportPersistenceAdapter | 2 | 6곳 상수 교체 |
| inquiry | InquiryAdminService | 2 | 2곳 상수 교체 |
| inquiry | InquiryPersistenceAdapter | 2 | 2곳 상수 교체 |
| festival | FestivalAdminService | 3 | 3곳 enum 통일 |
| festival | CustomFestivalAdminService | 3 | 6곳 enum 통일 |
| festival | CustomFestivalItem | 3 | 1곳 enum 통일 |
| statistics | DashboardService | 2, 3 | 3곳 상수 + 1곳 enum |

### 미변경 모듈

| 영역 | 이유 |
|------|------|
| user/auth | 이번 범위 외. admin 컨텍스트와 분리 유지. 후속 조율 대상. |
| community, review | 이번 범위 외. |
| notice | 백엔드 하드코딩 0건. 변경 불필요. |
| global/security | 이번 범위 외. SecurityConfig hasRole 등은 후속 조율 대상. |
| frontend | 이번 작업은 백엔드만. 프론트엔드 상수 정리는 후속. |

---

## 7. 리스크 및 대응

| 리스크 | 가능성 | 영향도 | 대응 |
|--------|:-----:|:-----:|------|
| 상수 값 오타 | 낮음 | 높음 | 상수 생성 시 기존 하드코딩 값과 1:1 문자열 일치를 반드시 확인 |
| import 경로 변경 누락 | 중간 | 중간 | compileJava로 컴파일 에러 즉시 발견 |
| FestivalStatus enum.name() 불일치 | 낮음 | 높음 | enum 값(UPCOMING, ONGOING, ENDED)과 DB 저장 문자열이 동일한지 확인. AdminFestivalEntity에서 valueOf()로 변환하므로 반드시 일치해야 함 |
| Controller validation 오류 | 낮음 | 높음 | Step 4를 별도 단계로 분리 + API 호출 테스트 수행 |
| 팀원 작업과의 충돌 | 중간 | 중간 | 작업 전 dev 최신 pull. festival Service 변경은 enum import 추가 수준이므로 충돌 가능성 낮음 |
| 범위 초과 (리팩터링 확산) | 중간 | 높음 | 영역 C를 명확히 정의. JPQL, 네이티브 SQL, @PrePersist, DummyData는 이번에 건드리지 않음 |

---

## 8. 작업 후 기대 효과

| 효과 | 설명 |
|------|------|
| admin 내부 일관성 | member, report, inquiry, festival, statistics가 동일한 상수/enum을 참조 |
| 오타 위험 제거 | 문자열 비교 → 상수/enum 참조. 컴파일 시점 발견 |
| IDE 활용 | Find Usages로 admin 내 모든 사용처 파악 가능 |
| 정책 변경 용이 | 정지 기간 등 정책값을 상수 1곳에서 관리 |
| user/auth 비교 기준 확보 | admin이 정돈되어 있으므로 user/auth 결과물과 구조를 비교 가능 |
| 전역 승격 기반 | admin/common이 정리되어 있으면 shared 이동 시 범위가 명확 |

---

## 9. 향후 계획 — 단계적 확장 전략

이번 작업은 3단계 전략의 1단계다. 지금 목표에 맞는 설계를 먼저 완성하고, 필요에 따라 다음 단계로 확장한다.

### 1단계: admin 내부 공통화 (이번 작업)

admin/common/constant에 admin 업무 상수를 집중하고, festival은 기존 enum 기반으로 통일한다. admin 외부 코드를 변경하지 않으며, admin 컨텍스트 내에서 자체적으로 완결되는 구조를 만든다.

### 2단계: user/auth와 조율 (merge 이후)

user/auth 담당자의 작업과 비교하여, MemberStatus/MemberRole의 최종 위치를 결정한다. 동일한 의미의 상태값이 양쪽에 각각 존재하는 현황을 공유하고, 통합 여부를 합의한다.

### 3단계: shared/global 승격 (필요 시)

합의 결과 통합이 필요하면 admin/common/constant의 상수를 global/constant로 이동한다. 불필요하면 각 컨텍스트가 자체 상수를 유지한다(Bounded Context 분리 원칙).

---

## 10. 작업 완료 후 디렉터리 구조

```
com.ieum.admin/
├── common/
│   └── constant/
│       ├── MemberStatus.java     // ACTIVE, SUSPENDED, DELETED
│       ├── MemberRole.java       // USER, ADMIN
│       ├── ReportStatus.java     // PENDING, RESOLVED, REJECTED
│       ├── InquiryStatus.java    // PENDING, ANSWERED
│       ├── TargetType.java       // POST, COMMENT, REVIEW
│       └── AdminPolicy.java      // SUSPENSION_DAYS = 7
├── member/      ← common 상수 참조 (영역 A)
├── report/      ← common 상수 참조 (영역 A)
├── inquiry/     ← common 상수 참조 (영역 A)
├── festival/    ← 기존 enum 기반 통일 (영역 B)
├── notice/      ← 미변경 (하드코딩 0건)
└── statistics/  ← common 상수 + enum 참조 (영역 A + B)
```

이번 작업의 결과물은 admin 단독 완성이 아니라, user/auth와 비교 가능한 기준선 확보다. admin 내부가 정리되어 있어야 이후 구조 비교와 전역 승격 판단이 가능하며, admin/common은 그 기준선을 만들기 위한 정당한 설계 위치다.

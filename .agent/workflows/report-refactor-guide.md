---
description: 백엔드 사용자 신고 도메인 조회 API 헥사고날 아키텍처 리팩토링 가이드 (우혁 담당)
---

# 사용자 신고 조회 API 리팩토링 가이드

## 📌 배경: 04/08 충돌 병합 및 긴급 수정 내역 (수경)
최근 `dev` 브랜치에 사용자 신고 도메인의 클린 아키텍처(헥사고날) 구조가 전면 도입됨에 따라, 기존에 우혁님이 개발하셨던 조회 API(`API_USR_0080` 및 `API_USR_0081`) 코드를 병합하는 과정에서 심각한 컴파일 에러가 발생했습니다. 이를 방지하기 위해 다음과 같이 코드를 수정해 두었습니다.

**[긴급 수정 이력]**
1. **`ReportResponse.java`**: 구버전(`fromEntity`) 대신 신규 도메인 모델(`fromDomain`)을 사용하도록 양쪽 브랜치의 필드를 완벽히 섞어 병합했습니다. (심볼 에러 해결)
2. **`ReportController.java`**: 엔드포인트 껍데기에 타 API 본문이 덮어씌워지는 라우트 꼬임 오류를 발견하고 올바르게 2개의 독립된 API로 분리 복구했습니다. `ReportService` DI 추가 등 조치 완료.
3. **`ReportService.java`**: 기존 조회 코드가 사라진 `ReportRepository`와 `ReportEntity`를 부르고 있어 **서버 크래시**가 나기 때문에, 서버 빌드 패스를 위해 기존 로직을 제거하고 빈 리스트/예외를 뱉도록 **임시 조치(Mocking) 및 TODO 작성**해 두었습니다. 
4. **`InquiryAdminService.java`**: `InquiryPort` 인터페이스에 `findAll(status, searchType, keyword, Pageable)` 4개 파라미터만 선언되어 있는데, Service에서 6개 파라미터(`todayStart`, `todayEnd` 추가)로 호출하고 있었고, 존재하지 않는 `countCreatedToday()` 메서드도 호출 중이어서 **컴파일 에러** 발생 → `findAll` 호출을 4개 파라미터로 수정하고, `newTodayCount`는 임시로 `0L` 반환하도록 처리했습니다.
5. **`ReportController.java` 라우트 불일치 수정**: 프론트엔드(`dev` 브랜치, 커뮤니티 상세 페이지)에서 `/api/reports/my-targets?targetType=COMMENT`로 호출하는데, 백엔드 엔드포인트가 `/target-ids`로 되어있어 **404 에러** 발생 위험 → `@GetMapping("/my-targets")`로 수정 완료.

---

## ⚠️ 현재 임시 처리(TODO)된 API 목록

아래 API들은 현재 **컴파일은 통과하지만 정상 동작하지 않는 상태**입니다. 리팩토링 전까지 프론트에서 호출 시 빈 데이터 또는 에러가 반환됩니다.

| API | 현재 동작 | 위치 |
|-----|-----------|------|
| `GET /api/reports/me` (내 신고 내역 목록) | 빈 리스트(`[]`) 반환 | `ReportService.getMyReports()` |
| `GET /api/reports/me/{reportId}` (신고 상세) | 무조건 예외 발생 (401) | `ReportService.getReportDetail()` |
| `GET /api/admin/inquiries` (문의 목록) | `newTodayCount`가 항상 0 | `InquiryAdminService.getInquiries()` |

---

## 🛠 진행해야 할 리팩토링 안내
위 3번 사항에서 임시 코드로 막아둔 핵심 조회 로직을 최신 포트(Port) 규칙에 맞게 재연결해 주셔야 합니다.

**대상 파일:** `backend/src/main/java/com/ieum/user/report/application/service/ReportService.java` 내 `TODO` 영역

---

## 1. 포트 (Port) 확장 
데이터베이스 계층과 직접 소통하는 대신, 애플리케이션 외부 계층(Port)을 통해 데이터를 가져와야 합니다. 

**작업 위치:** `ReportPort.java` (인터페이스)
**수정 내용:** 아래 두 개의 추상 메서드를 추가하세요. 반환 타입은 JPA Entity(`ReportEntity`)가 아닌 순수 도메인 객체(`Report`)여야 합니다.

```java
// 내 신고 목록 최신순 조회 기능 명세
List<Report> findReportsByReporterIdOrderByCreatedAtDesc(Long reporterId);

// 신고 ID와 신고자 ID를 통한 단건 상세 검증 조회
Optional<Report> findByIdAndReporterId(Long reportId, Long reporterId);
```

## 2. 어댑터 (Adapter) 구현
선언한 Port 인터페이스를 실제 데이터베이스와 연결해주는 영속성 어댑터 계층을 구현합니다.

**작업 위치:** `ReportPersistenceAdapter.java` 
**수정 내용:** 위에서 선언한 Port 인터페이스의 구현체를 작성합니다. 이곳에서 `reportRepository` 빈을 사용하여 Entity를 가져온 후, 도메인 변환기(Mapper)를 통해 `Report` 도메인 객체로 바꿔서 반환합니다.

```java
@Override
public List<Report> findReportsByReporterIdOrderByCreatedAtDesc(Long reporterId) {
    return reportRepository.findByReporterIdOrderByCreatedAtDesc(reporterId).stream()
            .map(mapper::mapToDomainEntity) // Entity -> Domain 변환
            .toList();
}

@Override
public Optional<Report> findByIdAndReporterId(Long reportId, Long reporterId) {
    return reportRepository.findByIdAndReporterId(reportId, reporterId)
            .map(mapper::mapToDomainEntity);
}
```

## 3. 서비스 (Service) 비즈니스 로직 수정
이제 `TODO`로 임시 조치해 두었던 조작 코드를 정상적인 비즈니스 로직으로 덮어씁니다. `ReportRepository`를 직접 부르던 코드를 `ReportPort`를 부르도록 바꿉니다.

**작업 위치:** `ReportService.java`
**수정 내용:**

```java
/**
 * 설계서 API_USR_0080: 내 신고 내역 목록 조회
 */
@Transactional(readOnly = true)
public List<ReportResponse> getMyReports(Long reporterId) {
    // Port에서 순수 도메인을 불러와 Response DTO 규격으로 변환하여 반환
    return reportPort.findReportsByReporterIdOrderByCreatedAtDesc(reporterId).stream()
            .map(ReportResponse::fromDomain)
            .toList();
}

/**
 * 설계서 API_USR_0081: 신고 상세 및 답변 조회
 */
@Transactional(readOnly = true)
public ReportResponse getReportDetail(Long reportId, Long reporterId) {
    Report report = reportPort.findByIdAndReporterId(reportId, reporterId)
            .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_001, "본인의 신고 내역만 조회할 수 있습니다."));
    
    return ReportResponse.fromDomain(report);
}
```

## 4. (선택) UseCase 분리 및 컨트롤러 정리
현재 `ReportController.java`에서 `ReportService` 클래스를 직접 주입(`private final ReportService reportService`)받아 사용하고 있습니다. 헥사고날 원칙에 맞게 조회용 UseCase 인터페이스를 분리하면 훨씬 깔끔합니다.

1. `LoadReportUseCase.java` 인터페이스에 `getMyReports`와 `getReportDetail` 메서드의 시그니처(헤더)를 명시합니다.
2. `ReportController.java`에서 주입받은 `ReportService` 의존성을 제거하고, 이미 선언되어 있는 `LoadReportUseCase`를 사용해 저 두 API를 호출하도록 컨트롤러 코드를 리팩토링합니다.

## 5. (선택) InquiryPort 확장 — newTodayCount 복구
`InquiryPort` 인터페이스에 `countCreatedToday(LocalDateTime start, LocalDateTime end)` 메서드를 선언하고, 어댑터에서 구현하면 관리자 문의 목록의 "오늘 신규 문의 수"가 정상 동작합니다.

```java
// InquiryPort.java에 추가
long countCreatedToday(LocalDateTime start, LocalDateTime end);
```

---

## ✅ 04/08 검증 결과 (수경)

| 구분 | 결과 |
|------|------|
| 백엔드 `gradlew compileJava` | ✅ BUILD SUCCESSFUL (에러 0건) |
| 프론트엔드 `next build` | ✅ Exit code 0 (26페이지 정상 생성) |
| Git 충돌 마커(`<<<<<<<`) 잔존 | ✅ 0건 |
| 구버전 `community` 패키지 import 잔존 | ✅ 0건 |
| 프론트↔백엔드 API 경로 일치 | ✅ 확인 완료 |
| `Report` 도메인 모델 필드 호환성 | ✅ `adminNote`, `reporterId` 등 모두 존재 확인 |


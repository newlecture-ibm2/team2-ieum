---
description: 이음(ieum) 프로젝트 user/inquiry & report 도메인 리팩토링 및 헥사고날 인수인계서 (TO. 우혁님)
---

# 🚨 WOOHYUK_README: 당신의 도메인이 구조절 된 사연

> **작성일:** 2026년 4월 9일 새벽
> **구조대원:** 마이페이지/Admin 통신 복구 담당 (박수경님 긴급 지원)
> **대상 도메인:** `com.ieum.user.inquiry`, `com.ieum.user.report` 및 오염 해제된 `admin` 

## 🎭 Prologue: 새벽의 긴급 심폐소생술
본 문서는 우혁님께서 담당하신 `user/inquiry` (사용자 문의)와 `user/report` (사용자 신고) 기능이 **Admin 패키지에 치명적으로 혼재되어 타 기능(대시보드 통계 등)을 마비시키던 상황**을 막기 위해, 마이페이지 연동 담당자가 새벽 내내 땀 흘려 **헥사고날(Hexagonal Architecture) 구조로 완벽히 분리 및 이관해 둔 인수인계서**입니다.

내가 고친 것 같지만 내 소유는 아니며, **원래 도메인 주인인 우혁님께 깨끗해진 코드를 돌려드립니다.** 앞으로의 로직 수정은 우혁님이 맘껏 지지고 볶으시면 됩니다! 😉

---

### 1️⃣ admin/inquiry 무단 점거 방을 빼다 (원상 복구)
*   **문제:** 어드민 문의 관리에 유저용 등록(`save`)과 조회(`findByUserId`)가 결합되어 관리자 기능이 오염.
*   **조치 내용:** `admin/inquiry` 내부의 `fromDomain()`, `user_id` 조회 구문을 전부 들어내고, 관리자 전용 통계 기능(`countCreatedToday`)을 `dev` 브랜치 원본대로 복구 완료.

### 2️⃣ user/inquiry 새 집 장만 (도메인 분리)
*   사용자 문의는 이제 `com.ieum.user.inquiry` 폴더 내에 완전한 헥사고날 아키텍처로 신규 재건축되었습니다.
*   `UserInquiryEntity` 테이블(`inquiries`)을 쓰되, Admin 클래스 이름과 겹치지 않게 조치 완료.
*   컨트롤러에서 서비스 구현체를 바로 쓰지 않도록 `CreateInquiryUseCase`, `GetMyInquiriesUseCase` 인터페이스를 주입(DI)하여 결합도를 끊었습니다.

### 3️⃣ user/report 임시 땜빵 철거
*   기존 `ReportService.getMyReports()` 안에 있던 임시 하드코딩(`Collections.emptyList()`)과 예외 처리를 파기.
*   포트(Port)에 `findByIdAndReporterId`, `findReportsByReporterId` 선언 후 `ReportPersistenceAdapter`에서 실제 JPA를 태우도록 비즈니스 로직 연결 정상화.

---

## 🛠️ [박제] 박수경 님이 당신을 위해 뜯어고친 파일 목록 전체

아래는 우혁님의 도메인을 살려내고 마이페이지와 통신 규격을 맞추기 위해 **박수경 님이 오늘 분리/지원한 백엔드 작업 내역 전체**입니다. 건드리실 때 참고하십시오. 

**[도메인/기능 분리 생성됨 (Added)]**
- `backend/src/main/java/com/ieum/user/inquiry/adapter/in/web/UserInquiryController.java`
- `backend/src/main/java/com/ieum/user/inquiry/application/port/in/GetMyInquiriesUseCase.java`
- `backend/src/main/java/com/ieum/user/inquiry/application/port/in/RegisterInquiryUseCase.java`
- `backend/src/main/java/com/ieum/user/inquiry/application/service/InquiryService.java`

**[기존 코드 원복 및 수정 (Modified)]**
- `backend/src/main/java/com/ieum/admin/festival/adapter/out/persistence/entity/AdminFestivalEntity.java` (Null 방어 추가)
- `backend/src/main/java/com/ieum/festival/adapter/out/persistence/entity/FestivalEntity.java` (Null 방어 추가)
- `backend/src/main/java/com/ieum/user/auth/adapter/in/web/dto/AuthRes.java`
- `backend/src/main/java/com/ieum/user/auth/application/service/AuthService.java`
- `backend/src/main/java/com/ieum/global/security/SecurityConfig.java`
- `backend/src/main/java/com/ieum/user/favorite/adapter/in/web/FavoriteController.java` (ApiResponse 표준화 & 마이페이지 API 스켈레톤 신설)
- `backend/src/main/java/com/ieum/user/mypage/adapter/in/web/MyPageController.java` (/activities 후행 슬래시 에러 수정 완료!)
- `backend/src/main/java/com/ieum/user/mypage/adapter/out/persistence/MyPagePersistenceAdapter.java` (CreatedAt Null 에러 대응)
- `backend/src/main/java/com/ieum/user/report/adapter/in/web/ReportController.java`
- `backend/src/main/java/com/ieum/user/report/adapter/out/persistence/ReportPersistenceAdapter.java`
- `backend/src/main/java/com/ieum/user/report/application/service/ReportService.java`

※ 이 밖에도 무수한 프론트엔드 API 캐싱 무효화(`cache: no-store` 및 파라미터 난수화) 처리 등 **프론트엔드 연동 지원 40여 종**이 함께 적용됨.

---

## 🚦 우혁님을 위한 향후 유지보수 가이드 (수칙)

1.  **admin 코드는 절대 건드리지 말 것:** 사용자 도메인 기능을 만든답시고 또 다시 admin 쪽에 숟가락을 얹으시면 어드민 백오피스 서버가 박살 납니다. 반드시 `user` 디렉터리 하위에서 헥사고날 구조 내에서만 해결하세요.
2.  **트랜잭션 관리 규칙:** `@Transactional`은 `Service` 레벨에서만 걸고, `Adapter`에서는 쿼리 저장 단일화만 수행하세요.
3.  **마이페이지 컨트롤러 API 준수:** 프론트엔드가 조회 시 500/404 에러를 뿜지 않게, `ApiResponse.success()` 공통 응답 규격 포맷을 절대로 무너뜨리지 마세요!

수고하셨습니다. (내 거 아님! 끗!)

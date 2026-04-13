# 🔍 백엔드 하드코딩 상수 분석 및 상수화 전략

## 1. Constant vs Enum 비교 분석

### Constant (final class + static final String)

| 장점 | 단점 |
|------|------|
| 기존 DB 스키마(String 컬럼) 변경 없이 바로 적용 | 타입 안전성 없음 (아무 String이나 들어감) |
| 단순 문자열 비교(`equals`)에 적합 | `"ACTVE"` 같은 오타를 컴파일 타임에 못 잡음 |
| 현재 프로젝트에 이미 `MemberStatus`, `AdminPolicy` 패턴 존재 | switch문에서 패턴 매칭 불가 |
| JPA Entity 필드 타입 변경 불필요 | 관련 값 그룹핑이 느슨함 |
| 학습 비용 거의 없음 | 유효성 검증 로직을 직접 짜야 함 |

### Enum

| 장점 | 단점 |
|------|------|
| **타입 안전성** — 컴파일 타임에 오타 100% 차단 | JPA Entity 필드를 `@Enumerated`로 변경해야 함 |
| **switch 패턴 매칭** 가능 (Java 21 최적) | 기존 DB 데이터와 호환성 확인 필요 |
| 값 목록 자동 열거 (`values()`) | 다른 팀원이 작성한 모듈에 영향 줄 수 있음 |
| 한글 설명, 표시명 등 메타데이터 내장 가능 | 변환 로직이 추가로 필요할 수 있음 |
| IDE 자동완성으로 개발 생산성 향상 | 리팩토링 범위가 넓어지면 리스크 증가 |

### 🏆 결론: **하이브리드 전략 추천 (Enum 우선 + Constant 보조)**

> [!IMPORTANT]
> **"의미적으로 닫힌 집합(정해진 값만 허용)"은 → Enum**
> **"단순 라벨/정책 수치/문자열 매핑"은 → Constant**

현재 프로젝트는 DB 컬럼이 `String(VARCHAR)` 타입이므로, **Enum을 만들되 DB에는 `.name()`으로 String 변환하여 저장**하는 방식이 가장 안전합니다. 또한 이미 `MemberStatus`(Constant)와 `FestivalStatus`(Enum), `Role`(Enum)이 혼재하고 있으므로, 통일된 기준을 세워야 합니다.

---

## 2. 상수화 대상 전수 조사 결과 (7개 카테고리)

### 📋 카테고리 A: 콘텐츠 상태 (ContentStatus)
> **추천: ✅ Enum** — 닫힌 집합, 도메인 전역에서 공유

| 하드코딩 값 | 사용 위치 | 현재 상태 |
|-------------|-----------|-----------|
| `"ACTIVE"` | Post, Comment, PostEntity, CommentEntity, CustomOAuth2UserService | 🔴 산재 |
| `"REMOVED"` | Post, Comment, Review, PostEntity, CommentEntity | 🔴 산재 |

**현재 문제점:**
- [Post.java:65](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/community/domain/model/Post.java#L65) → `"ACTIVE".equals(this.status)`
- [Comment.java:44](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/community/domain/model/Comment.java#L44) → `"ACTIVE".equals(this.status)`
- [PostEntity.java:60](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/community/adapter/out/persistence/entity/PostEntity.java#L60) → `private String status = "ACTIVE";`
- [CommentEntity.java:51](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/community/adapter/out/persistence/entity/CommentEntity.java#L51) → `private String status = "ACTIVE";`

**상수화 방안:**
```java
// global/common/enums/ContentStatus.java
public enum ContentStatus {
    ACTIVE("활성"),
    REMOVED("삭제됨");

    private final String description;
}
```

---

### 📋 카테고리 B: 회원 상태 (UserStatus)
> **추천: ✅ Enum** — 이미 Constant(`MemberStatus`)가 있지만 Enum으로 승격 추천

| 하드코딩 값 | 사용 위치 | 현재 상태 |
|-------------|-----------|-----------|
| `"ACTIVE"` | CustomOAuth2UserService | 🔴 하드코딩 |
| `"WITHDRAWAL"` | User.java, AuthService.java | 🔴 하드코딩 |
| `"SUSPENDED"` | MemberStatus (Constant) | 🟡 부분 상수화 |
| `"DELETED"` | MemberStatus (Constant) | 🟡 부분 상수화 |

**현재 문제점:**
- [CustomOAuth2UserService.java:81](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/global/security/oauth2/CustomOAuth2UserService.java#L81) → `.status("ACTIVE")` (MemberStatus.ACTIVE를 안 씀)
- [AuthService.java:42](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/user/auth/application/service/AuthService.java#L42) → `"WITHDRAWAL".equals(user.getStatus())`
- [User.java:44](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/user/auth/domain/User.java#L44) → `.status("WITHDRAWAL")`
- 기존 [MemberStatus.java](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/member/domain/model/MemberStatus.java)는 admin 패키지 안에 있어서 user 모듈이 참조하기 어려움

**상수화 방안:**
```java
// global/common/enums/UserStatus.java
public enum UserStatus {
    ACTIVE("정상"),
    SUSPENDED("정지"),
    WITHDRAWAL("탈퇴 유예"),
    DELETED("삭제");

    private final String description;
}
```
> [!NOTE]
> 기존 `admin/member/domain/model/MemberStatus.java`(Constant)는 이 Enum으로 대체하고, `global` 패키지로 옮겨 admin과 user 양쪽에서 공유합니다.

---

### 📋 카테고리 C: 신고 상태 (ReportStatus)
> **추천: ✅ Enum** — 닫힌 집합, 상태 전이 로직이 복잡

| 하드코딩 값 | 사용 위치 | 현재 상태 |
|-------------|-----------|-----------|
| `"PENDING"` | Report.java, ReportService, ReportAdminService | 🔴 산재 (7곳) |
| `"RESOLVED"` | ReportAdminService, ReportService, DashboardService | 🔴 산재 (6곳) |
| `"REJECTED"` | ReportAdminService, ReportService | 🔴 산재 (4곳) |

**현재 문제점:**
- [ReportAdminService.java:54](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/report/application/service/ReportAdminService.java#L54) → `!"PENDING".equals(currentReport.getStatus())`
- [ReportAdminService.java:58](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/report/application/service/ReportAdminService.java#L58) → `"DISMISS".equalsIgnoreCase(action) ? "REJECTED" : "RESOLVED"`
- [ReportService.java:54](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/user/report/application/service/ReportService.java#L54) → `"PENDING".equals(existing.getStatus()) || "RESOLVED".equals(existing.getStatus())`

**상수화 방안:**
```java
// global/common/enums/ReportStatus.java
public enum ReportStatus {
    PENDING("대기 중"),
    RESOLVED("처리 완료"),
    REJECTED("반려");

    private final String description;
}
```

---

### 📋 카테고리 D: 신고 사유 (ReportReason)
> **추천: ✅ Enum** — 닫힌 집합, 유효성 검증(Set.of)을 Enum.values()로 깔끔하게 대체 가능

| 하드코딩 값 | 사용 위치 | 현재 상태 |
|-------------|-----------|-----------|
| `"SPAM"` | ReportService, DashboardPersistenceAdapter | 🔴 산재 |
| `"ABUSE"` | ReportService, DashboardPersistenceAdapter | 🔴 산재 |
| `"INAPPROPRIATE"` | ReportService, DashboardPersistenceAdapter | 🔴 산재 |
| `"FALSE_INFO"` | ReportService, DashboardPersistenceAdapter | 🔴 산재 |
| `"OTHER"` | ReportService | 🔴 산재 |

**현재 문제점:**
- [ReportService.java:33](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/user/report/application/service/ReportService.java#L33) → `Set.of("SPAM", "ABUSE", "INAPPROPRIATE", "FALSE_INFO", "OTHER")`
- [DashboardPersistenceAdapter.java:159-162](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/statistics/adapter/out/persistence/DashboardPersistenceAdapter.java#L159) → switch문에서 한글 라벨 매핑을 하드코딩

**상수화 방안:**
```java
// global/common/enums/ReportReason.java
public enum ReportReason {
    SPAM("스팸 신고"),
    ABUSE("욕설/비방 신고"),
    INAPPROPRIATE("부적절한 콘텐츠 신고"),
    FALSE_INFO("허위 정보 신고"),
    OTHER("기타");

    private final String displayName;  // 한글 라벨도 내장!
}
```

---

### 📋 카테고리 E: 신고 대상 유형 (ReportTargetType)
> **추천: ✅ Enum** — 이미 Report.java에 Constant로 부분 정리(`TARGET_POST` 등)가 있지만 Enum으로 승격 추천

| 하드코딩 값 | 사용 위치 | 현재 상태 |
|-------------|-----------|-----------|
| `"POST"` | Report.java (Constant), DummyDataInitializer | 🟡 부분 상수화 |
| `"COMMENT"` | Report.java (Constant), CommentService, DummyDataInitializer | 🟡 부분 상수화 |
| `"REVIEW"` | Report.java (Constant), DummyDataInitializer | 🟡 부분 상수화 |

**상수화 방안:**
```java
// global/common/enums/TargetType.java
public enum TargetType {
    POST("게시글"),
    COMMENT("댓글"),
    REVIEW("리뷰");

    private final String displayName;
}
```

---

### 📋 카테고리 F: 신고 처리 액션 (ReportAction)
> **추천: ✅ Enum** — 닫힌 집합, 비즈니스 로직 분기에 사용

| 하드코딩 값 | 사용 위치 | 현재 상태 |
|-------------|-----------|-----------|
| `"DISMISS"` | ReportAdminService | 🔴 하드코딩 |
| `"DELETE"` | ReportAdminService | 🔴 하드코딩 |
| `"SUSPEND"` | ReportAdminService | 🔴 하드코딩 |

**현재 문제점:**
- [ReportAdminService.java:58](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/report/application/service/ReportAdminService.java#L58) → `"DISMISS".equalsIgnoreCase(action) ? "REJECTED" : "RESOLVED"`
- [ReportAdminService.java:63](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/report/application/service/ReportAdminService.java#L63) → `"DELETE".equalsIgnoreCase(action)`

**상수화 방안:**
```java
// global/common/enums/ReportAction.java
public enum ReportAction {
    DISMISS("반려"),
    DELETE("콘텐츠 삭제"),
    SUSPEND("회원 정지"),
    WARNING("경고");

    private final String displayName;
}
```

---

### 📋 카테고리 G: 알림 유형 (NotificationType)
> **추천: ✅ Enum** — 여러 모듈에서 공통으로 사용

| 하드코딩 값 | 사용 위치 | 현재 상태 |
|-------------|-----------|-----------|
| `"COMMENT"` | CommentService | 🔴 하드코딩 |
| `"COMMUNITY"` | CommentService | 🔴 하드코딩 |
| `"NOTICE"` | SystemNotificationService, ReportAdminService, NoticeAdminService | 🔴 산재 |

**현재 문제점:**
- [CommentService.java:103-104](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/community/application/service/CommentService.java#L103) → `"COMMENT"`, `"COMMUNITY"` 하드코딩
- [ReportAdminService.java:92](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/report/application/service/ReportAdminService.java#L92) → `"NOTICE"` (주석으로 의미 설명)
- [NoticeAdminService.java:58](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/notice/application/service/NoticeAdminService.java#L58) → `"NOTICE"` (첨부파일 targetType)

**상수화 방안:**
```java
// global/common/enums/NotificationType.java
public enum NotificationType {
    COMMENT("댓글 알림"),
    NOTICE("공지사항 알림"),
    REPORT("신고 결과 알림");

    private final String displayName;
}
```

---

## 3. 기존 자산 정리 및 마이그레이션 계획

### ✅ 이미 잘 되어있는 것 (유지)
| 파일 | 방식 | 판단 |
|------|------|------|
| [Role.java](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/user/auth/domain/Role.java) | Enum | ✅ 완벽 (유지) |
| [FestivalStatus.java](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/festival/domain/model/FestivalStatus.java) | Enum | ✅ 완벽 (유지, 단 `global`로 이동 추천) |
| [AdminPolicy.java](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/common/constant/AdminPolicy.java) | Constant | ✅ 완벽 (정책 수치는 Constant가 맞음) |

### 🔄 마이그레이션 대상
| 기존 파일 | 현재 방식 | 변경 방향 |
|-----------|-----------|-----------|
| [MemberStatus.java](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/admin/member/domain/model/MemberStatus.java) | Constant (admin 패키지) | → `UserStatus` Enum으로 승격, `global` 패키지로 이동 |
| [Report.java 내 TARGET_*](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/user/report/domain/model/Report.java#L17) | Constant (도메인 내부) | → `TargetType` Enum으로 분리 |
| [ReportService VALID_REASONS](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/backend/src/main/java/com/ieum/user/report/application/service/ReportService.java#L33) | Set\<String\> 하드코딩 | → `ReportReason` Enum으로 대체 |

---

## 4. 최종 추천 파일 구조

```
com.ieum.global.common.enums/
├── ContentStatus.java       ← ACTIVE, REMOVED  (게시글/댓글/리뷰 공통)
├── UserStatus.java          ← ACTIVE, SUSPENDED, WITHDRAWAL, DELETED (회원 상태)
├── ReportStatus.java        ← PENDING, RESOLVED, REJECTED (신고 상태)
├── ReportReason.java        ← SPAM, ABUSE, INAPPROPRIATE, FALSE_INFO, OTHER
├── ReportAction.java        ← DISMISS, DELETE, SUSPEND, WARNING (관리자 처리 액션)
├── TargetType.java          ← POST, COMMENT, REVIEW (신고/첨부 대상 유형)
└── NotificationType.java    ← COMMENT, NOTICE, REPORT (알림 유형)
```

> [!TIP]
> `global.common.enums` 패키지에 배치하면 admin, user, community 어느 모듈에서든 자유롭게 import 가능합니다. 기존 `admin/` 안에 갇혀있던 `MemberStatus`가 user 모듈에서 쓰지 못하던 문제도 자연스럽게 해결됩니다.

---

## 5. 작업 우선순위 제안

| 순위 | 카테고리 | 이유 |
|------|----------|------|
| 🥇 1순위 | **ReportStatus** (C) | 가장 많은 파일(7곳)에 하드코딩, 오타 위험 최대 |
| 🥈 2순위 | **ContentStatus** (A) | Post/Comment/Review 3개 도메인에 걸쳐 산재 |
| 🥉 3순위 | **ReportReason** (D) | Set.of 하드코딩 + switch 한글 매핑이 Enum으로 가장 깔끔해짐 |
| 4순위 | **UserStatus** (B) | MemberStatus Constant를 Enum으로 승격 + 위치 이동 |
| 5순위 | **TargetType** (E) | 이미 Report.java 내부에 부분 상수화됨, Enum으로 승격만 |
| 6순위 | **ReportAction** (F) | 사용처가 ReportAdminService 1곳에 집중 |
| 7순위 | **NotificationType** (G) | 사용처 3곳, 영향 범위 작음 |

> [!WARNING]
> 구현 시 주의: 기존 DB에 `VARCHAR`로 저장된 데이터와의 호환성을 위해, JPA Entity에서는 `@Enumerated(EnumType.STRING)`을 반드시 사용하세요. 기본값인 `EnumType.ORDINAL`을 쓰면 숫자(0, 1, 2...)로 저장되어 기존 데이터와 충돌합니다.

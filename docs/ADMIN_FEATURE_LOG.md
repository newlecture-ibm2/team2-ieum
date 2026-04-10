# 🚀 관리자 회원 관리 모듈 (Admin Member Management) - 개발 현황 및 정리

**작성일**: 2026-04-09
**현재 브랜치**: `dev-sookyung-member`

이 문서는 다른 브랜치로 이동하거나 나중에 작업을 재개할 때, 현재까지 진행된 내역과 앞으로 해야 할 작업(TODO)을 한눈에 파악하기 위해 작성되었습니다.

---

## ✅ 1. 현재까지 구현된 기능 (Completed)

헥사고날 아키텍처(Hexagonal Architecture)를 기반으로 백엔드를 구현하였으며, 프론트엔드 모달 UI까지 연동 및 문서화가 완료되었습니다.

### 🗄️ Database & Domain
* `users` 테이블에 **`suspended_until` (TIMESTAMP)** 컬럼 추가 완료.
    * `schema.sql` 업데이트
    * `MemberEntity`, `Member` 도메인 모델, `MemberItem` DTO에 필드 추가 및 매핑
    * Hibernate ddl-auto `update` 에 의해 로컬/서버 DB에 적용 완료 체크.

### ⚙️ Backend API (5개 엔드포인트)
* **목록 조회** (`GET /api/admin/members`): 상태(status), 역할(role), 검색어(searchType) 필터 및 페이징.
* **상세 조회** (`GET /api/admin/members/{userId}`): 회원 정보 및 누적 신고 횟수 상세 반환.
* **상태 변경** (`PATCH /api/admin/members/{userId}/status`):
    * `SUSPENDED` 요청 시 현재 시간 기준 **+7일**로 `suspended_until` 자동 적용 (7일 정지).
    * `ACTIVE` 전환 시 `suspended_until` null 로 초기화(정지 해제).
* **강제 탈퇴** (`DELETE /api/admin/members/{userId}`):
    * 물리 삭제가 아닌 **소프트 삭제** (status='DELETED', deleted_at 기록).
* **역할 변경** (`PATCH /api/admin/members/{userId}/role`):
    * 일반회원(USER) ↔ 관리자(ADMIN) 양방향 권한 변경.

### 💻 Frontend (React / Next.js)
* **회원 상세 모달 (`MemberDetailModal`) 전면 개편**:
    * **신고 횟수 UI**: 신고 4건 이상 시 빨간색 하이라이트 및 `정지 가능` 뱃지 노출.
    * **정지 해제 D-Day**: 정지된 회원인 경우 `suspendedUntil`을 파싱하여 남은 일수(`D-X`) 실시간 렌더링.
    * **탈퇴 대기 D-Day**: 소프트 삭제 후 완전 삭제까지의 D-Day (30일 기준 가이드라인) 표시.
    * **인라인 확인 모달**: 정지, 탈퇴, 역할 변경 버튼 클릭 시 즉시 API를 쏘지 않고, 모달 내에서 경고 메시지와 재확인 버튼 (색상별 테마 구분) 표시 로직 구현.

### 📄 Documentation
* `docs/api_list/admin.md`: 5개 API 명세 최신화.
* `docs/blueprints/기능_설계서.md`: UseCase, 비즈니스 규칙 및 업데이트 히스토리 최신화.
* `docs/erd/ERD_이음.html`: `users` 테이블 `status`, `suspended_until` 주석 구체화 (`ACTIVE(정상) / SUSPENDED(정지) / DELETED(탈퇴)`).
* `docs/screen-design/20_화면설계서_관리자_회원관리.html`: 디자인 팀/기획 팀이 확인할 수 있는 관리자 화면 Mockup HTML 추가.

---

## 🚧 2. 앞으로 추가 구현하면 좋을 것 / 해야 할 일 (TODO)

### 🧪 테스트 (Testing)
* **API 통합 테스트**: `MemberAdminIntegrationTest` 등 백엔드 E2E 테스트 코드 보강 및 엣지 케이스 확인.
* **비정상 접근 차단 테스트**: 일반 유저(USER) 토큰으로 Admin 멤버 API 접근 시 403 Forbidden 떨어지는지 확인.
* **권한 체크 (인가 강화)**:
    * 슈퍼 관리자(최상위 어드민)만 다른 관리자를 해임하거나 밴할 수 있도록 로직 고도화.
    * **"자기 자신"**을 정지하거나 밴(탈퇴)하는 행위 차단 예외 처리.

### 🎨 UI/UX 개선 (Polish)
* 리스트 페이지(`MemberListPage`)의 KPI 통계 카드와 실제 필터링 데이터 개수가 정확히 연동되도록 프론트엔드 상태(State) 관리 최적화.
* 반응형 테스트: 화면 크기를 스크롤했을 때 모달창 하단 버튼이 짤리거나 깨지는 현상 방지.

### ✨ 추가 기능 (Future Work)
* **정지 해제 자동화 (Spring Batch / Scheduler)**:
    * 매일 밤 12시에 도는 스케줄러를 추가하여 `suspended_until`이 지난 사람들의 `status`를 `ACTIVE`로 자동 백업하는 배치 로직 구현 필요.
* **알림 발송 (FCM, Email 연동)**:
    * 관리자가 일반 유저를 정지하거나, 권한을 주었을 때 당사자에게 알림톡(FCM)이나 이메일이 가도록 이벤트 리스너(Event Listener) 추후 연결.
* **이력 테이블 고도화**:
    * 상태가 언제/왜/어떤 관리자에 의해 변경되었는지 로깅하는 `member_status_history` 같은 별도 이력 테이블 설계 고려.

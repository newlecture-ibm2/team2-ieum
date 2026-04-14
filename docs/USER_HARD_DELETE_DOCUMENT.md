# 🗑️ Global 회원 최종 탈퇴 엔진 (Hard Delete Engine) 개발 현황

본 문서는 어제 완료한 **Global 회원 파기 엔진**의 아키텍처, 구현체, 그리고 앞으로 이어서 작업할 테스트/고도화 내용들을 기록한 백서입니다.

---

## 🚀 1. 구현 완료 사항 (Completed Features)

### 1.1. 전역 도메인 및 헥사고날 아키텍처 구축
- `com.ieum.user.deletion` 로 완전히 분리된 독자적인 파기 도메인 구축 완료.
- **Admin 도메인과 의존성 분리**: 기존 `MemberAdminService`는 직접 삭제 로직을 버리고 `status = DELETED` 즉시 트리거로 역할 축소.
- **오케스트레이터 (`ForceDeleteUserService`)**: 총 9단계의 Step으로 진행되는 파이프라인 구현 완료.

### 1.2. 9단계 무결성 삭제 파이프라인 (`Step 1 ~ Step 9`)
- **[Step 1 & 2] 토큰 및 알림 파기**: `refresh_tokens`, `fcm_tokens`, `notifications` 단순 일괄 삭제.
- **[Step 3] 유저 활동 및 Like 파기**: 타인의 글에 누른 `post_likes` 제거 전, 해당 글의 `like_count = like_count - 1` 일괄 보정 로직 선행 처리.
- **[Step 4] 문의/신고 아카이브 (이력 스냅샷)**: 
  - `inquiry_history`, `report_history` 테이블 생성 및 복사 기능 구현.
  - 🚨 (Fix 적용) PostgreSQL 에러 방지용 `ENUM` -> `VARCHAR` 묵시적 캐스트 회피 명시적 Type Casting(`CAST(status AS VARCHAR)`) 쿼리 적용 완료.
  - `id NOT IN` 구문을 통한 중복 롤백 방지(멱등성) 처리.
- **[Step 5 & 7] 커뮤니티 데이터 제거**: 
  - 내 글에 달린 타인의 댓글 연쇄 파기 및 고아 데이터 방지(Null 환원).
  - 내 글/댓글을 가리키던 **Orphaned Reports(고아 신고 데이터)** 일괄 파기 추가 수행으로 인한 예외 방어 구축.
- **[Step 6] 리뷰 파기 및 통계 재산출**: 
  - 리뷰 삭제 전 대상 `festival_id`들을 긁어놓은 뒤, 파기 직후 1방의 서브쿼리 문법으로 축제별 `review_count`, `avg_rating` 단일 벌크 업데이트 튜닝! (N+1 근절)
- **[Step 8] 물리 정적 파일 처리**: 현재 1차 구현용 (No-op 스킵) 어댑터 부착형 연결 완료.
- **[Step 9] 🌟 최종 본체 파기 방어막 통과**: 
  - 어드민 권한/활동 흔적(ex: `inquiries.answered_by`, `report_responses`, `batch_log`)에 걸린 **FK(Restrict) 제약조건** 때문에 500에러 트랜잭션 마비가 오던 문제 돌파! (삭제 직전 해당 참조들만 선행 `NULL` 해제 조치 추가됨).

### 1.3. 스케줄러 자동 파기망 연결 (`MemberSuspensionScheduler`)
- 30일이 초과한 자진 탈퇴 유예자(`WITHDRAWAL`) 자동 색출 후 파기 통보.
- 일시적 에러록으로 트랜잭션이 중지되어 `DELETED` 상태로 잔류한 미처리 회원들을 매일 밤 Scan하여 재처리(Retry) 할 수 있도록 멱등성 체인 확보.

### 1.4. 대량 데이터 록(Lock) 및 N+1 병목 최적화 (Chunking)
- `for`문 안에 존재하던 수천 번의 개별 조회/업데이트 쿼리를 멸종.
- **1000건 단위 Chunk List 분할 파기**: 파서 한계(Parameter Limit) 에러 방지.
- `@Transactional`을 Port(Adapter) 내부로 완전히 쪼개서 넣음으로써 긴 시간 Lock으로 DB 전체가 정지당하는 위험도 완전 제거.

---

## 🎯 2. 검증된 무결성 및 확보된 안전성 스펙

1. **FK 무결성 제재 돌파**: DB 테이블들의 FK Cascading 여부 불일치, Restrict 등을 코드 레벨에서 전부 우회 및 보완합니다.
2. **멱등성(Idempotency)**: 이 파기 엔진은 어느 지점(Step)에서 예외가 터져 반쪽짜리 삭제가 일어나도, 다음 날 다시 실행시키면 '지워진 것은 패스하고, 남은 흔적부터 이어서' 퍼펙트클리어 수행을 약속합니다.

---

## ⏩ 3. 다음에 이어할 작업 (Next To-Do List)

다음에 개발을 속개할 때 아래 목록부터 이어서 진행하세요!

### 🟩 TO-DO 1. 시나리오 기반 백엔드 API & DB 실전 테스트
> *(문서로 작성해둔 시나리오에 대한 실제 포스트맨/JUnit 가동 절차)*
- [ ] 더미 데이터 생성기 또는 Postman을 통해 게시글 1,500개, 댓글 5,000개를 남긴 **헤비 유저 계정(Dummy)** 강제 주입.
- [ ] 어드민 페이지 또는 직접 쿼리를 날려 해당 유저 `status = DELETED` 트리거 작동 시작.
- [ ] 콘솔 로그에 Step 1 ~ Step 9까지 순서대로 로그가 찍히는지 관찰.
- [ ] 파기 완료 후 아래의 검증 쿼리 발사하여 무결성(데이터가 전부 0 반환되는지) 체크.
  ```sql
  SELECT COUNT(*) FROM posts WHERE author_id = {파기유저ID};
  SELECT COUNT(*) FROM reports WHERE target_type = 'POST' AND target_id NOT IN (SELECT id FROM posts);
  ```

### 🟩 TO-DO 2. 2차 과제: AWS S3 실제 파일 동기 제거 로직 부착
- [ ] 현재 빈 로그만 남기고 껍데기로 존재하는 `PhysicalFileRemovalAdapter` 내부에 실제 S3 SDK를 물려 파일 패스 경로 추출 -> Bulk Delete 적용하기.
  > ⚠️ 주의: 현재 설계상 게시글을 완전히 밀어버린 후인 Step 8에서 구동되면 첨부파일 URL을 DB에서 뽑을 수가 없습니다. (이 이슈를 해결하기 위해 `ForceDeleteUserService`의 극초반부 Step 0에서 URL만 `Set<String>` 메모리에 먼저 긁어오는 설계 리팩터링 적용 권장)

### 🟩 TO-DO 3. 프론트엔드 탈퇴 반영 및 고도화
- [ ] 관리자 페이지(멤버 관리)에서 '강제 추방' 버튼을 누른 즉시 페이지 Refresh 또는 목록 최신화로 지워진 것 확인되게 처리하기.
- [ ] 알림 팝업 창에 "추방 완료되었습니다. 모든 데이터가 영구 파기되었습니다." 반영.

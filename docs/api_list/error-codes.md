# 📡 IEUM API 에러 코드 전체 레퍼런스

> **총 54개 에러 코드** — 사용자 메시지 & 개발자 상세 설명  
> 워크플로우 룰셋: `.agent/workflows/api-response-ruleset.md`

---

## 1. 인증/권한 (AUTH) — 9개

| 코드 | HTTP | 👤 사용자 message | 👨‍💻 개발자 detail | 발생 상황 |
|---|---|---|---|---|
| `AUTH_001` | 401 | 로그인이 필요한 서비스입니다. | `Access token is missing or invalid. Header: Authorization` | 토큰 없이 인증 필요 API |
| `AUTH_002` | 401 | 이메일 또는 비밀번호가 올바르지 않습니다. | `Authentication failed: invalid credentials for email={email}` | 로그인 실패 |
| `AUTH_003` | 403 | 접근 권한이 없습니다. | `Forbidden: required role=ADMIN, actual role=USER` | 권한 부족 |
| `AUTH_004` | 401 | 로그인이 만료되었습니다. 다시 로그인해주세요. | `JWT token expired at {expiredAt}. Token subject: {userId}` | 토큰 만료 |
| `AUTH_005` | 400 | 비밀번호는 8~20자, 영문+숫자+특수문자 조합이어야 합니다. | `Password validation failed: min=8, max=20, requires letter+digit+special` | 비밀번호 규칙 |
| `AUTH_006` | 400 | 비밀번호가 일치하지 않습니다. | `Password confirmation mismatch` | 비밀번호 확인 불일치 |
| `AUTH_007` | 401 | 현재 비밀번호가 올바르지 않습니다. | `Current password mismatch for userId={userId}` | PW 변경/탈퇴 시 |
| `AUTH_008` | 400 | 필수 약관에 동의해주세요. | `Terms agreement required: termsAgreed must be true` | 약관 미동의 |
| `AUTH_009` | 403 | 정지된 계정입니다. 고객센터에 문의해주세요. | `Account suspended: userId={userId}, reason={reason}` | 정지 계정 |

## 2. 사용자 (USER) — 7개

| 코드 | HTTP | 👤 사용자 message | 👨‍💻 개발자 detail | 발생 상황 |
|---|---|---|---|---|
| `USER_001` | 409 | 이미 사용 중인 이메일입니다. | `Duplicate email: {email} already registered` | 이메일 중복 |
| `USER_002` | 409 | 이미 사용 중인 닉네임입니다. | `Duplicate nickname: {nickname} already taken` | 닉네임 중복 |
| `USER_003` | 404 | 사용자를 찾을 수 없습니다. | `User not found: userId={userId}` | 미존재 사용자 |
| `USER_004` | 400 | 올바른 이메일 형식이 아닙니다. | `Email format validation failed: value={email}` | 이메일 형식 |
| `USER_005` | 400 | 닉네임은 2~20자여야 합니다. | `Nickname length: min=2, max=20, actual={length}` | 닉네임 길이 |
| `USER_006` | 400 | 올바른 전화번호 형식이 아닙니다. (010-XXXX-XXXX) | `Phone format failed: expected 010-XXXX-XXXX, actual={phone}` | 전화번호 형식 |
| `USER_007` | 400 | 프로필 이미지는 JPG, PNG 형식만 가능합니다. | `Profile image type not allowed: {contentType}` | 이미지 형식 |

## 3. 축제 (FEST) — 5개

| 코드 | HTTP | 👤 사용자 message | 👨‍💻 개발자 detail | 발생 상황 |
|---|---|---|---|---|
| `FEST_001` | 404 | 축제 정보를 찾을 수 없습니다. | `Festival not found: festivalId={festivalId}` | 미존재 축제 |
| `FEST_002` | 500 | 축제 데이터를 불러오는 중 오류가 발생했습니다. | `External API failed: data.go.kr status={statusCode}` | 공공 API 실패 |
| `FEST_003` | 409 | 데이터 동기화가 진행 중입니다. 잠시 후 다시 시도해주세요. | `Sync already in progress: started at {startedAt}` | 중복 동기화 |
| `FEST_004` | 400 | 종료일은 시작일 이후여야 합니다. | `Date range invalid: startDate={start} after endDate={end}` | 날짜 역전 |
| `FEST_005` | 400 | 축제명은 필수 입력 항목입니다. | `Required field missing: title` | 필수 필드 누락 |

## 4. 리뷰 (REVIEW) — 6개

| 코드 | HTTP | 👤 사용자 message | 👨‍💻 개발자 detail | 발생 상황 |
|---|---|---|---|---|
| `REVIEW_001` | 404 | 리뷰를 찾을 수 없습니다. | `Review not found: reviewId={reviewId}` | 미존재 리뷰 |
| `REVIEW_002` | 403 | 종료된 축제만 리뷰를 작성할 수 있습니다. | `Review not allowed: festival status={status}, required=ENDED` | 진행/예정 축제 |
| `REVIEW_003` | 409 | 이미 이 축제에 리뷰를 작성하셨습니다. | `Duplicate review: userId={userId}, festivalId={festivalId}` | 리뷰 중복 |
| `REVIEW_004` | 403 | 본인이 작성한 리뷰만 수정/삭제할 수 있습니다. | `Forbidden: ownerId={ownerId}, requesterId={userId}` | 타인 리뷰 |
| `REVIEW_005` | 400 | 별점은 1~5 사이의 값이어야 합니다. | `Rating out of range: value={rating}, allowed=1~5` | 별점 범위 |
| `REVIEW_006` | 400 | 리뷰 내용은 10자 이상 작성해주세요. | `Content length: min=10, actual={length}` | 글자 수 미달 |

## 5. 즐겨찾기 (FAV) — 2개

| 코드 | HTTP | 👤 사용자 message | 👨‍💻 개발자 detail | 발생 상황 |
|---|---|---|---|---|
| `FAV_001` | 409 | 이미 즐겨찾기에 추가된 축제입니다. | `Duplicate scrap: userId={userId}, festivalId={festivalId}` | 중복 즐겨찾기 |
| `FAV_002` | 404 | 즐겨찾기를 찾을 수 없습니다. | `Scrap not found: userId={userId}, festivalId={festivalId}` | 미존재 즐겨찾기 |

## 6. 게시글/댓글 (POST, COMMENT) — 7개

| 코드 | HTTP | 👤 사용자 message | 👨‍💻 개발자 detail | 발생 상황 |
|---|---|---|---|---|
| `POST_001` | 404 | 게시글을 찾을 수 없습니다. | `Post not found: postId={postId}` | 미존재 게시글 |
| `POST_002` | 403 | 본인이 작성한 게시글만 수정/삭제할 수 있습니다. | `Forbidden: post ownerId={ownerId}, requesterId={userId}` | 타인 게시글 |
| `POST_003` | 400 | 제목은 2~200자, 내용은 10~5000자여야 합니다. | `Validation: title(2-200)={titleLen}, content(10-5000)={contentLen}` | 글자 수 |
| `POST_004` | 400 | 카테고리를 선택해주세요. | `Required field missing: category` | 카테고리 미선택 |
| `COMMENT_001` | 404 | 댓글을 찾을 수 없습니다. | `Comment not found: commentId={commentId}` | 미존재 댓글 |
| `COMMENT_002` | 403 | 본인이 작성한 댓글만 수정/삭제할 수 있습니다. | `Forbidden: comment ownerId={ownerId}, requesterId={userId}` | 타인 댓글 |
| `COMMENT_003` | 400 | 댓글 내용을 입력해주세요. (1~500자) | `Comment content: min=1, max=500, actual={length}` | 빈 댓글 |

## 7. 공지/문의 (NOTICE, INQ) — 6개

| 코드 | HTTP | 👤 사용자 message | 👨‍💻 개발자 detail | 발생 상황 |
|---|---|---|---|---|
| `NOTICE_001` | 404 | 공지사항을 찾을 수 없습니다. | `Notice not found: noticeId={noticeId}` | 미존재 공지 |
| `NOTICE_002` | 400 | 공지 제목과 내용을 입력해주세요. | `Required fields missing: title, content` | 필수 필드 |
| `INQ_001` | 404 | 문의를 찾을 수 없습니다. | `Inquiry not found: inquiryId={inquiryId}` | 미존재 문의 |
| `INQ_002` | 403 | 본인의 문의만 조회할 수 있습니다. | `Forbidden: inquiry ownerId={ownerId}, requesterId={userId}` | 타인 문의 |
| `INQ_003` | 400 | 문의 제목과 내용을 입력해주세요. | `Required fields missing: title, content` | 필수 필드 |
| `INQ_004` | 409 | 이미 답변이 등록된 문의입니다. | `Duplicate answer: inquiryId={inquiryId} already answered` | 답변 중복 |

## 8. 신고 (REPORT) — 4개

| 코드 | HTTP | 👤 사용자 message | 👨‍💻 개발자 detail | 발생 상황 |
|---|---|---|---|---|
| `REPORT_001` | 409 | 이미 신고한 대상입니다. | `Duplicate: userId={userId}, targetType={type}, targetId={id}` | 중복 신고 |
| `REPORT_002` | 404 | 신고 정보를 찾을 수 없습니다. | `Report not found: reportId={reportId}` | 미존재 신고 |
| `REPORT_003` | 400 | 신고 사유를 입력해주세요. | `Required field missing: reason` | 사유 미입력 |
| `REPORT_004` | 400 | 신고 대상을 찾을 수 없습니다. | `Report target not found: targetType={type}, targetId={id}` | 대상 미존재 |

## 9. 파일 (FILE) — 4개

| 코드 | HTTP | 👤 사용자 message | 👨‍💻 개발자 detail | 발생 상황 |
|---|---|---|---|---|
| `FILE_001` | 400 | 지원하지 않는 파일 형식입니다. (JPG, PNG, PDF만 가능) | `File type not allowed: {contentType}` | 파일 형식 |
| `FILE_002` | 400 | 파일 크기가 5MB를 초과합니다. | `File size exceeded: {size}bytes, max=5242880` | 크기 초과 |
| `FILE_003` | 404 | 파일을 찾을 수 없습니다. | `File not found: fileId={fileId}` | 미존재 파일 |
| `FILE_004` | 400 | 최대 5개까지 파일을 업로드할 수 있습니다. | `File count exceeded: count={count}, max=5` | 개수 초과 |

## 10. 공통 (COMMON) — 4개

| 코드 | HTTP | 👤 사용자 message | 👨‍💻 개발자 detail | 발생 상황 |
|---|---|---|---|---|
| `COMMON_001` | 400 | 입력 정보를 확인해주세요. | `Validation failed for fields: [{fieldNames}]` | 유효성 에러 |
| `COMMON_002` | 500 | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요. | `Internal server error: {exceptionClass}: {message}` | 서버 에러 |
| `COMMON_003` | 500 | 서비스 점검 중입니다. 잠시 후 다시 시도해주세요. | `Database connection failed: {details}` | DB 연결 실패 |
| `COMMON_004` | 400 | 잘못된 요청입니다. | `Malformed request: {parseError}` | JSON 파싱 등 |

---

## API별 성공 메시지 전체 목록

### 인증 (AUTH)
| API ID | 성공 message |
|---|---|
| API_AUTH_0010 | `"로그인되었습니다."` |
| API_AUTH_0020 | `"회원가입이 완료되었습니다."` |
| API_AUTH_0030 | `"회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다."` |
| API_AUTH_0040 | `"비밀번호 재설정 링크가 이메일로 전송되었습니다."` |

### 사용자 (USR)
| API ID | 성공 message |
|---|---|
| API_USR_0020 | `"프로필이 수정되었습니다."` |
| API_USR_0050 | `"알림 설정이 완료되었습니다."` |
| API_USR_0060 | `"알림 설정이 변경되었습니다."` |
| API_USR_0070 | `"알림을 읽음 처리하였습니다."` |

### 축제/리뷰 (FES, REV)
| API ID | 성공 message |
|---|---|
| API_FES_0040 | 찜: `"즐겨찾기에 추가되었습니다."` / 해제: `"즐겨찾기에서 제거되었습니다."` |
| API_REV_0011 | `"리뷰가 등록되었습니다."` |
| API_REV_0012 | `"리뷰가 수정되었습니다."` |
| API_REV_0013 | 프론트: `"리뷰가 삭제되었습니다."` |

### 게시판 (BRD)
| API ID | 성공 message |
|---|---|
| API_BRD_0012 | `"게시글이 등록되었습니다."` |
| API_BRD_0013 | `"게시글이 수정되었습니다."` |
| API_BRD_0014 | 프론트: `"게시글이 삭제되었습니다."` |
| API_BRD_0020 | `"파일이 업로드되었습니다."` |
| API_BRD_0030 | `"좋아요를 눌렀습니다."` / `"좋아요를 취소했습니다."` |
| API_BRD_0051 | `"댓글이 등록되었습니다."` |
| API_BRD_0052 | `"댓글이 수정되었습니다."` |
| API_BRD_0053 | 프론트: `"댓글이 삭제되었습니다."` |

### 문의/신고 (INQ, RPT)
| API ID | 성공 message |
|---|---|
| API_INQ_0020 | `"문의가 등록되었습니다. 빠른 시일 내에 답변 드리겠습니다."` |
| API_RPT_0010 | `"신고가 접수되었습니다. 검토 후 조치하겠습니다."` |

### 관리자 (ADM)
| API ID | 성공 message |
|---|---|
| API_ADM_0031 | `"공공 데이터 동기화가 완료되었습니다."` |
| API_ADM_0032 | `"축제가 노출 상태로 변경되었습니다."` / `"축제가 숨김 처리되었습니다."` |
| API_ADM_0041 | `"축제가 등록되었습니다."` |
| API_ADM_0042 | `"축제 정보가 수정되었습니다."` |
| API_ADM_0043 | 프론트: `"축제가 삭제되었습니다."` |
| API_ADM_0052 | `"신고가 처리되었습니다."` / `"신고가 반려 처리되었습니다."` |
| API_ADM_0061 | `"공지사항이 등록되었습니다."` |
| API_ADM_0062 | `"공지사항이 수정되었습니다."` |
| API_ADM_0063 | 프론트: `"공지사항이 삭제되었습니다."` |
| API_ADM_0072 | `"답변이 등록되었습니다."` |

> 모든 **GET 조회 API**는 message 생략, `data`만 반환합니다.

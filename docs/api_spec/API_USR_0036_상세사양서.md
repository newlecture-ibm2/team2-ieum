# 📋 프로그램 사양서: API_USR_0036

**마이페이지 >> 내 1:1 문의 내역 및 답변 조회**

---

## 1. 기본 정보
| 항목 | 내용 | 항목 | 내용 |
| :--- | :--- | :--- | :--- |
| **API ID** | **API_USR_0036** | **API명** | **내 1:1 문의 내역 조회** |
| **업무명** | **사용자/관리자 (마이페이지)** | **작성자** | **AI 에이전트 (Antigravity)** |
| **작성일** | **2026-04-08** | **버전** | **v1.0** |

---

## 2. 기능 요건
1. 로그인한 사용자가 본인이 등록한 1:1 문의 내역을 최신순으로 조회한다. 📜
2. 각 문의의 처리 상태(`PENDING`, `ANSWERED`)를 확인하고, 답변이 완료된 경우 답변 내용을 볼 수 있다. 💬
3. **관리자 계정**으로 로그인한 경우에도 본인의 문의 등록 및 내역 조회 기능을 동일하게 이용할 수 있도록 지원한다. 🛡️🏛️

---

## 3. API 유형 정보
| 정보이용기관 | 정보이용시스템 | API 구분 | API 방식 | 송수신유형 | 처리유형 | 주기 | 데이터포맷 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| IEUM | IEUM | 대내 | RESTful | 요청/응답 | 실시간 | 수시 | JSON |
| **정보보유기관** | **정보보유시스템** | **최대처리회수** | **트래픽** | **API컴포넌트명** | **API컴포넌트클래스** | **-** | **-** |
| IEUM | CLP | 50건 / 1분 | 2KB / 20KB | UserInquiryController | InquiryService | - | - |

- **접근경로**: `GET /api/users/me/inquiries`

---

## 4. API 데이터 항목 (Data Items)

### [Output] 응답 데이터
| 레벨 | 필드명(한글) | 필드명(영문) | 부모필드명 | 데이터타입 | 길이 | 반복건수 | 입출력구분 | 설명 | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 성공여부 | success | - | Boolean | 5 | 1 | out | API 호출 성공 여부 | - |
| 1 | 결과데이터 | data | - | Object | - | 1 | out | 실제 문의 목록 데이터 | - |
| 2 | 문의목록 | inquiries | data | Array | - | n | out | 사용자의 문의 리스트 | - |
| 3 | 문의ID | id | inquiries | Long | 20 | 1 | out | 문의글 고유 번호 | - |
| 3 | 제목 | title | inquiries | String | 100 | 1 | out | 문의 제목 | - |
| 3 | 내용 | content | inquiries | String | 1000 | 1 | out | 상세 내용 | - |
| 3 | 상태 | status | inquiries | String | 10 | 1 | out | 처리 상태 (PENDING/ANSWERED) | - |
| 3 | 답변내용 | answer | inquiries | String | 1000 | 1 | out | 관리자 답변 내용 | null 가능 |
| 3 | 등록일시 | createdAt | inquiries | String | 20 | 1 | out | 문의 등록 시각 | - |
| 3 | 답변일시 | answeredAt | inquiries | String | 20 | 1 | out | 관리자 답변 시각 | null 가능 |

---

## 5. 처리 Logic

1. `SecurityContextHolder`를 통해 현재 세션에 로그인한 사용자의 식별자(userId)를 추출한다. 🏛️
2. 만약 관리자(ADMIN) 권한이라면, 관리자 식별 체계에 맞는 ID를 확보하여 회원 식별자와 동일하게 처리한다. (숫자형 ID 변환 로직 포함) 🛡️
3. `inquiries` 테이블에서 `user_id` 혹은 `author_id`가 현재 사용자와 일치하는 데이터를 조회한다. (최신순 정렬) 🔍
4. 조회된 문의 엔티티를 DTO로 변환할 때, `answer` 필드와 `answeredAt` 필드를 포함하여 미답변 상태에서도 형식에 맞게 반환한다. ✨⚙️
5. 조회 성공 시 문의 목록 배열을 포함한 `ApiResponse.success`를 반환한다. 🚀

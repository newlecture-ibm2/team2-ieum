# 🔍 프론트엔드 하드코딩 상수 분석 및 상수화 전략

## 현재 상태: 기존 constants 폴더

현재 `src/constants/filterOptions.ts` 하나만 존재하며, **지역코드, 카테고리, 기간 필터, 축제 상태 탭** 등 UI 셀렉트 옵션이 잘 정리되어 있습니다. 이 구조를 확장하여 나머지 하드코딩된 값들도 상수화합니다.

---

## 전수 조사 결과 (8개 카테고리)

### 📋 카테고리 A: 신고 사유 라벨 (REPORT_REASON_LABELS)
> **심각도: 🔴 높음** — 동일 매핑이 **5곳**에 중복 정의, 한글 라벨도 제각각

| 파일 | 하드코딩 내용 |
|------|-------------|
| [ReportDetailModal/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/reports/_components/ReportDetailModal/index.tsx#L20) | `SPAM: '스팸'`, `ABUSE: '욕설/비방'` ... |
| [ReportListPage/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/reports/_components/ReportListPage/index.tsx#L27) | `SPAM: '스팸'`, `ABUSE: '욕설/비방'` ... (동일 복사) |
| [ReviewSection/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/festivals/[id]/_components/ReviewSection/index.tsx#L223) | `{ value: 'SPAM', label: '스팸/광고' }` ... |
| [ReviewBoard/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/festivals/[id]/reviews/_components/ReviewBoard/index.tsx#L154) | `{ value: 'SPAM', label: '스팸/광고' }` ... (위와 복사) |
| [ReportModal/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/community/_components/ReportModal/index.tsx#L52) | `{ value: 'SPAM', label: '스팸/광고' }` ... (또 복사) |
| [ReportList.tsx (마이페이지)](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/mypage/_components/ReportList.tsx#L25) | `'SPAM': '스팸/홍보'` ... (**라벨이 다름!** 💥) |

**문제점**: 같은 SPAM인데 `'스팸'`, `'스팸/광고'`, `'스팸/홍보'`로 각기 다른 한글 표시 → 사용자 혼란

**상수화 방안:**
```ts
// constants/reportOptions.ts
export const REPORT_REASON_LABELS: Record<string, string> = {
  SPAM: '스팸/광고',
  ABUSE: '욕설/비방',
  INAPPROPRIATE: '부적절한 콘텐츠',
  FALSE_INFO: '허위 정보',
  OTHER: '기타',
};

/** 신고 모달 라디오 버튼 옵션 */
export const REPORT_REASON_OPTIONS = Object.entries(REPORT_REASON_LABELS)
  .map(([value, label]) => ({ value, label }));
```

---

### 📋 카테고리 B: 신고/문의 상태 라벨 (STATUS_LABELS)
> **심각도: 🔴 높음** — **4곳**에 동일 STATUS_LABEL 객체가 복사붙여넣기

| 파일 | 하드코딩 내용 |
|------|-------------|
| [DashboardRecentList/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/(dashboard)/_components/DashboardRecentList/index.tsx#L13) | `PENDING: { label: '대기중' }` 등 |
| [ReportListPage/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/reports/_components/ReportListPage/index.tsx#L13) | 위와 동일 복사 |
| [InquiryListPage/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/inquiries/_components/InquiryListPage/index.tsx#L13) | `PENDING: { label: '대기중' }` 등 |
| [ReportList.tsx (마이페이지)](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/mypage/_components/ReportList.tsx#L109) | switch문으로 동일 매핑 |

**상수화 방안:**
```ts
// constants/statusLabels.ts
export const REPORT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING:  { label: '대기 중',   className: 'badgePending' },
  RESOLVED: { label: '처리 완료', className: 'badgeOngoing' },
  REJECTED: { label: '반려',      className: 'badgeDismissed' },
};

export const INQUIRY_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING:  { label: '대기 중',   className: 'badgePending' },
  ANSWERED: { label: '답변 완료', className: 'badgeOngoing' },
};
```

---

### 📋 카테고리 C: 회원 상태 (USER_STATUS)
> **심각도: 🟡 중간** — 주로 admin 회원 관리 모듈에 집중

| 파일 | 하드코딩 내용 |
|------|-------------|
| [MemberDetailModal/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/members/_components/MemberDetailModal/index.tsx#L43) | `member.status === 'SUSPENDED'`, `'ACTIVE'`, `'DELETED'` |
| [MemberListPage/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/members/_components/MemberListPage/index.tsx#L187) | `statusFilter === 'ACTIVE'`, `'SUSPENDED'`, `'DELETED'` |
| [ReviewSection/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/festivals/[id]/_components/ReviewSection/index.tsx#L43) | `data.user?.status === 'SUSPENDED'` |
| [community/[id]/page.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/community/[id]/page.tsx#L95) | `data.user.status === 'SUSPENDED'` |
| [community/write/page.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/community/write/page.tsx#L100) | `data.user?.status === 'SUSPENDED'` |

**상수화 방안:**
```ts
// constants/userStatus.ts
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  WITHDRAWAL: 'WITHDRAWAL',
  DELETED: 'DELETED',
} as const;

export type UserStatusType = typeof USER_STATUS[keyof typeof USER_STATUS];
```

---

### 📋 카테고리 D: 신고 대상 유형 (TARGET_TYPE)
> **심각도: 🟡 중간** — API 호출, 조건부 렌더링에 사용

| 파일 | 하드코딩 내용 |
|------|-------------|
| 커뮤니티 글쓰기, 목록, 상세 | `targetType=POST`, `targetType=COMMENT` |
| 축제 리뷰 관련 | `targetType: 'REVIEW'` |
| [ReportModal/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/community/_components/ReportModal/index.tsx#L11) | `targetType?: 'POST' \| 'COMMENT'` |
| [ReportDetailModal/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/reports/_components/ReportDetailModal/index.tsx#L141) | `report.targetType === 'POST'` |
| 첨부파일 API 호출 | `targetType=NOTICE`, `targetType=POST` |

**상수화 방안:**
```ts
// constants/targetType.ts
export const TARGET_TYPE = {
  POST: 'POST',
  COMMENT: 'COMMENT',
  REVIEW: 'REVIEW',
  NOTICE: 'NOTICE',
} as const;

export type TargetTypeValue = typeof TARGET_TYPE[keyof typeof TARGET_TYPE];
```

---

### 📋 카테고리 E: 신고 처리 액션 (REPORT_ACTION)
> **심각도: 🟢 낮음** — admin 신고 상세 모달 1곳에 집중

| 파일 | 하드코딩 내용 |
|------|-------------|
| [ReportDetailModal/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/reports/_components/ReportDetailModal/index.tsx#L48) | `'DISMISS' \| 'DELETE'` |
| [ReportList.tsx (마이페이지)](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/mypage/_components/ReportList.tsx#L68) | `report.action === 'DELETE'` |

**상수화 방안:**
```ts
// constants/reportOptions.ts (위 A에 추가)
export const REPORT_ACTION = {
  DISMISS: 'DISMISS',
  DELETE: 'DELETE',
  SUSPEND: 'SUSPEND',
  WARNING: 'WARNING',
} as const;
```

---

### 📋 카테고리 F: 역할 (ROLE)
> **심각도: 🟢 낮음** — admin 회원 관리 모듈에 집중

| 파일 | 하드코딩 내용 |
|------|-------------|
| [MemberDetailModal/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/members/_components/MemberDetailModal/index.tsx#L62) | `member.role === 'ADMIN'`, `handleRoleChange('USER')` |
| [MemberListPage/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/members/_components/MemberListPage/index.tsx#L387) | `member.role === 'ADMIN'` |

**상수화 방안:**
```ts
// constants/userStatus.ts (위 C에 추가)
export const USER_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
```

---

### 📋 카테고리 G: 축제 상태 (FESTIVAL_STATUS)
> **심각도: 🟢 낮음** — admin 축제 관리에 집중, 일부는 이미 filterOptions.ts에 존재

| 파일 | 하드코딩 내용 |
|------|-------------|
| [CustomFestivalListPage/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/managedFestivals/_components/CustomFestivalListPage/index.tsx#L48) | `'ONGOING'`, `'UPCOMING'`, `'ENDED'` |

**상수화 방안:**
```ts
// constants/filterOptions.ts (기존 파일에 추가)
export const FESTIVAL_STATUS = {
  ONGOING: 'ONGOING',
  UPCOMING: 'UPCOMING',
  ENDED: 'ENDED',
} as const;
```

---

### 📋 카테고리 H: 문의 상태 (INQUIRY_STATUS)
> **심각도: 🟢 낮음** — admin 문의 관리와 마이페이지에 분산

| 파일 | 하드코딩 내용 |
|------|-------------|
| [InquiryListPage/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/inquiries/_components/InquiryListPage/index.tsx#L134) | `'PENDING'`, `'ANSWERED'` |
| [DashboardRecentList/index.tsx](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/admin/(dashboard)/_components/DashboardRecentList/index.tsx#L65) | `item.status === 'ANSWERED'` |
| [InquiryList.tsx (마이페이지)](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/app/mypage/_components/InquiryList.tsx#L73) | `inquiry.status === 'ANSWERED'` |
| [types/mypage.ts](file:///Users/chaena-eun/Desktop/IBM%201차%20프로젝트/ieum/team2-ieum/frontend/src/types/mypage.ts#L53) | `status: 'PENDING' \| 'ANSWERED'` |

**상수화 방안:**
```ts
// constants/inquiryStatus.ts
export const INQUIRY_STATUS = {
  PENDING: 'PENDING',
  ANSWERED: 'ANSWERED',
} as const;
```

---

## 최종 추천 파일 구조

```
frontend/src/constants/
├── filterOptions.ts          ← ✅ 기존 (지역, 카테고리, 기간, 축제상태 탭)
├── reportOptions.ts          ← 🆕 신고 사유 라벨 + 신고 옵션 + 신고 액션
├── statusLabels.ts           ← 🆕 신고/문의 상태 라벨 + CSS 클래스 매핑
├── userStatus.ts             ← 🆕 회원 상태 + 역할 상수
├── targetType.ts             ← 🆕 신고/첨부파일 대상 유형
└── inquiryStatus.ts          ← 🆕 문의 상태 상수
```

> [!TIP]
> 백엔드에서 만든 Enum과 **값(name)이 정확히 일치**하도록 구성하여, 프론트-백 간 불일치를 원천 방지합니다.

---

## 작업 우선순위

| 순위 | 카테고리 | 이유 |
|------|----------|------|
| 🥇 1순위 | **신고 사유 라벨 (A)** | 5곳 중복 + 한글 라벨 불일치 버그 존재 |
| 🥈 2순위 | **상태 라벨 (B)** | 4곳 동일 객체 복사, DRY 원칙 위반 |
| 🥉 3순위 | **회원 상태 (C)** | 5곳 산재, 타입 안전성 확보 필요 |
| 4순위 | **대상 유형 (D)** | API 호출 URL에 하드코딩, 오타 위험 |
| 5순위 | **문의 상태 (H)** | 3곳 산재 |
| 6순위 | **신고 액션 (E)** | 2곳, 영향 작음 |
| 7순위 | **역할 (F)** | 2곳, 영향 작음 |
| 8순위 | **축제 상태 (G)** | 1곳, 기존 filterOptions에 유사 구조 있음 |

> [!IMPORTANT]
> **가장 심각한 발견**: 신고 사유 `SPAM`의 한글 라벨이 파일마다 다릅니다.
> - `'스팸'` (admin 관리 화면)
> - `'스팸/광고'` (사용자 신고 모달)
> - `'스팸/홍보'` (마이페이지 신고 내역)
> 
> → 상수화하면 **이 불일치 버그도 자동으로 해결**됩니다.

---
description: 
---

# 🛠️ Admin Workflow

## 🎯 목적
Admin 기능은 user 영역과 완전히 분리된 구조를 따른다.  
새 admin 기능은 기존 `festival` 패키지를 기준 템플릿으로 복제하여 구현한다.

---

## 🚫 금지사항 (가장 중요)

- user용 Header / Footer / Nav 절대 사용 금지
- admin 페이지에서 user layout import 금지
- Service에서 Entity 직접 사용 금지
- Result DTO에서 Entity import 금지
- God Component 생성 금지
- 불필요한 공통화 금지
- 새로운 스타일 체계 생성 금지 (admin-common 재사용)

---

## 🧱 공통 원칙

### Frontend
- admin 전용 layout만 사용
- 공통 UI는 `admin-common.module.css` 기반
- `page.tsx` → 하위 component 위임 구조 유지
- CSS Modules 유지
- 반복되는 패턴만 공통화

### Backend
- Controller → UseCase → Service → Port → Adapter 흐름 유지
- Controller는 UseCase 인터페이스만 의존
- Service는 Port 인터페이스만 의존
- Domain은 순수 객체 유지
- Entity는 adapter/out에만 존재

---

## 🔁 구현 절차

### 1. 분석
- 기존 `festival` 구조 확인
- 공통 UI / 스타일 재사용 가능 여부 확인

### 2. 설계
- 생성/수정 파일 목록 정의
- 공통 vs 개별 영역 구분
- 폴더 구조 설계

### 3. 구현
- 기존 패턴 복제 우선
- 새로운 구조 invent 금지

### 4. 검증
- 아키텍처 위반 여부 확인
- user UI 혼입 여부 확인
- 기능 흐름 정상 여부 확인
- 후속 admin 기능 복제 가능 여부 확인

---

## ✅ 체크리스트

### Backend
- [ ] Controller → UseCase 구조 유지
- [ ] Service → Port 의존 유지
- [ ] Service에서 Entity 사용 없음
- [ ] Result DTO는 Domain 기반

### Frontend
- [ ] admin layout만 사용
- [ ] user Header/Footer 없음
- [ ] page → component 구조 유지
- [ ] God component 없음

### 공통화
- [ ] admin-common 재사용
- [ ] 중복 스타일 없음
- [ ] 과한 공통화 없음

---

## 📦 새 admin 기능 생성 규칙

- backend → festival 패턴 복제
- frontend → FestivalListPage 구조 복제
- 공통 스타일 → admin-common.module.css 사용
- report / notice / inquiries 동일 기준 적용

---

## 🧭 최종 목표

- admin 기능 전체를 동일한 패턴으로 유지
- 신규 기능(report 등)이 복사 + 수정만으로 구현 가능하도록 구조 통일
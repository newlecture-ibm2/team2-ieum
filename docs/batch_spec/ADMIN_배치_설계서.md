# Festival Batch & Sync Architecture

## 1. Overview

본 문서는 관리자(Admin) 시스템 내 축제 데이터의 정합성 유지를 위한  
Batch 처리 및 Sync 전략을 정의한다.

현재 시스템은 공공데이터(Tour API)와 내부 데이터를 혼합하여 사용하고 있으며,  
데이터 성격에 따라 자동 갱신(Batch)과 수동 동기화(Sync)를 병행한다.

---

## 2. Design Principles

- 외부 API 의존 최소화
- 데이터 Source of Truth 명확화
- 실시간 처리보다 정합성 우선
- 기능별 데이터 갱신 책임 분리

---

## 3. Sync 대상 분류

| 항목 | 유형 | 실행 방식 | 설명 |
|------|------|----------|------|
| Status | Runtime Data | Batch + Manual | 날짜 기반 상태 자동 갱신 |
| Category | Master Data | Batch + Manual | 공공 API 기반 분류 동기화 |
| Region | Master Data | Batch(현재) / Seed(전환 예정) | 지역 코드 및 명칭 관리 |

---

## 4. Batch & Sync Strategy

### 4.1 Festival Status Sync

#### 목적
축제의 진행 상태(진행중 / 예정 / 종료)를 날짜 기준으로 자동 업데이트

#### 방식
- Scheduler 기반 배치 실행 (예: 매일 00시 또는 12시)
- 시작일/종료일 기준 상태 계산

#### 특징
- 시스템 핵심 배치 (필수 유지)
- 사용자 개입 없이 자동 갱신

---

### 4.2 Category Master Sync

#### 목적
공공 API의 카테고리 체계를 내부 master_category와 동기화

#### 방식
- 공공 API(categoryCode) 기반 데이터 수집
- 계층 구조(Level 1~3) 트리 구성
- Insert / Update / Soft Delete 수행

#### 특징
- Batch 또는 수동 실행 가능
- 내부 필터 및 UI 기준 데이터

#### 비고
- 현재 구조 유지
- 향후 API 변경 시 영향 가능

---

### 4.3 Region Master Sync

#### 목적
지역 코드 및 명칭을 공공 데이터 기준으로 유지

#### 현재 방식
- Tour API(areaCode) 기반 동기화
- Insert / Update 수행

#### 문제점
- API 폐기 예정
- 명칭 불일치 발생 (전라북도 → 전북특별자치도)

#### 개선 방향
- 외부 Sync 제거
- 내부 Seed 데이터로 전환

#### 목표 구조

region
- tour_code (기존 유지)
- display_name (최신 행정명)
- is_active

#### 특징
- 검색은 기존 코드 유지
- UI 표시는 최신 명칭 사용

---

## 5. Execution Model

### 5.1 Batch Scheduler

- Status Sync: 자동 실행
- Category Sync: 선택적 자동화 가능
- Region Sync: 제거 예정

### 5.2 Manual Sync (Admin)

관리자 화면에서 다음 작업 수행 가능

- 전체 데이터 갱신
- 카테고리 동기화
- 상태 갱신

---

## 6. Data Flow

[Tour API]
   ↓
[Sync Service]
   ↓
[Master Tables]
   ↓
[Festival Data]
   ↓
[Admin UI]

---

## 7. Risk & Considerations

### External Dependency
- Tour API 구조 변경 가능성
- 지역/카테고리 API 폐기 리스크

### Data Consistency
- 카테고리 누락 가능성
- 지역 명칭 불일치

### Performance
- Sync 시 전체 비교 연산 발생
- 대량 데이터 처리 비용 증가 가능

---

## 8. Future Direction

- Region: Seed 기반 완전 전환
- Category: 내부 Master 중심 구조 강화
- Sync 로직 최적화 (부분 업데이트)
- Batch 로그 및 모니터링 강화

---

## 9. Summary

- Status: 핵심 Batch 유지
- Category: 동기화 기반 Master 데이터
- Region: 내부 관리 전환 대상

현재 구조는 안정적으로 동작하며,  
외부 API 변화 대응을 위한 점진적 개선을 전제로 한다.
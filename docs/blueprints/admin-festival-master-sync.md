# 🧭 Admin Festival Master Data Synchronization Blueprint

> "Master data defines the integrity of the system."

---

## 🧩 Overview

Admin Festival 시스템은 카테고리 및 지역과 같은 **Master Data**를 기반으로 동작한다.  
이 데이터는 공공 API(Tour API)의 코드 체계를 기준으로 유지되며,  
시스템 전반의 데이터 일관성을 결정하는 핵심 요소다.

본 설계는 Master Data를 외부 API와 동기화하여  
**항상 최신 상태를 유지하는 구조를 정의한다.**

---

## 🎯 Objectives

- 공공 API 기준 Master Data 동기화
- 시스템 전반의 데이터 일관성 유지
- 변화에 자동으로 대응하는 구조 구축
- Admin 기능 확장 시 재사용 가능한 기준 확립

---

## 🧱 Scope

### Included
- `master_category`
- `master_region`
- Master Sync UseCase / Service / Adapter
- Festival Sync와의 연계

### Excluded
- User 영역 UI
- 기타 Admin 기능 (report, notice 등)

---

## 🧠 Architecture Principles

### Source of Truth
- Master Data는 공공 API를 기준으로 관리된다

### Layered Architecture

```
Controller → UseCase → Service → Port → Adapter → External API / DB
```

### Core Rules
- 외부 API 데이터는 항상 기준(reference)이다
- 로컬 DB는 캐시 및 조회 최적화를 위한 저장소 역할을 한다
- 동기화는 idempotent하게 수행되어야 한다

---

## 🔄 Synchronization Strategy

### Step 1. Fetch
- 공공 API에서 category / region 코드 조회

### Step 2. Compare
- API 데이터와 DB 데이터 간 차이(diff) 계산

### Step 3. Apply Changes

| 상태 | 처리 |
|------|------|
| 신규 코드 | INSERT |
| 기존 코드 + 변경 | UPDATE |
| API에서 제거된 코드 | Soft Delete (`is_active = false`) |
| 동일 | 유지 |

---

## 🧩 Soft Delete Policy

물리 삭제 대신 Soft Delete를 사용한다.

### 이유
- 기존 축제 데이터와의 참조 무결성 유지
- 데이터 이력 보존
- 향후 재활성화 가능

---

## ⚙️ Execution Flow

### Standard Flow

```
Master Sync → Festival Sync
```

- Master Data를 먼저 동기화한 뒤 Festival 데이터를 동기화한다  
- 항상 최신 코드 기준으로 Festival 데이터가 적재되도록 보장한다

### Optional Execution
- Master Sync 단독 실행 가능
- Batch 또는 API 트리거 방식 모두 지원

---

## 🔧 Implementation Notes

- Master Sync는 독립적인 UseCase로 구현
- Festival Sync와 orchestration 레벨에서 연결
- Adapter는 외부 API 호출 책임만 담당
- Service는 diff 및 반영 로직만 수행

---

## 🧪 Expected Outcome

- 카테고리 및 지역 데이터의 자동 최신화
- 공공 API와 완전한 코드 일관성 확보
- Admin 시스템 전반의 데이터 안정성 향상
- 이후 기능 확장 시 동일한 데이터 전략 재사용 가능

---

## 🔮 Future Expansion

- 동일한 방식으로 다른 Master Data에도 확장 가능
- Admin/report 등 기능에서 공통 기준으로 활용

---

## 🏁 Conclusion

Master Data는 정적인 값이 아니라  
**외부 시스템과 동기화되는 동적인 기준 데이터다.**

본 구조를 통해 Admin Festival 시스템은  
데이터 변화에 자동으로 적응하는 안정적인 기반을 갖추게 된다.
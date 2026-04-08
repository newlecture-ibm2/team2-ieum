/**
 * 관리자 공공 축제 관련 TypeScript 타입 정의
 * API_ADM_0030, API_ADM_0031, API_ADM_0032 응답 구조
 */

// ────────────────────────────────────────
// 공통 API 응답 래퍼
// ────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    status: number;
    message: string;
    detail: string;
    timestamp: string;
    errors: unknown[];
  } | null;
}

// ────────────────────────────────────────
// API_ADM_0030 — 공공 축제 목록 조회
// GET /api/admin/festivals
// ────────────────────────────────────────

/** 상태별 축제 수 요약 */
export interface FestivalStatusCounts {
  total: number;
  ongoing: number;
  upcoming: number;
  ended: number;
}

/** 축제 목록 항목 */
export interface FestivalListItem {
  id: number;
  title: string;
  region: string;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
  category?: string;
  categoryLabel?: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  isVisible: boolean;
}

/** 축제 목록 조회 응답 (data 본문) */
export interface AdminFestivalListData {
  statusCounts: FestivalStatusCounts;
  lastSyncTime?: string;
  content: FestivalListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ────────────────────────────────────────
// API_ADM_0031 — 데이터 수동 동기화
// POST /api/admin/festivals/sync
// ────────────────────────────────────────
export interface FestivalSyncData {
  status: string;   // COMPLETED
  syncCount: number;
}

// ────────────────────────────────────────
// API_ADM_0032 — 축제 노출/숨김 수정
// PATCH /api/admin/festivals/{id}/visibility
// ────────────────────────────────────────
export interface FestivalVisibilityData {
  status: string;   // UPDATED
  current: boolean;
}

// ────────────────────────────────────────
// 축제 관리 관련 타입
// ────────────────────────────────────────

export interface CustomFestivalItem {
  festivalId: number;
  title: string;
  areaCode: string;
  areaLabel: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  isVisible: boolean;
  category: string;
  categoryLabel?: string;
  status: 'UPCOMING' | 'ONGOING' | 'ENDED';
  createdAt: string;
  content: string; // 상세 내용
  imgUrl: string | null; // 이미지 URL
  extraImages: string | null; // 콤마로 연결된 갤러리 이미지 URL 
  playTime?: string;
  eventPlace?: string;
  address?: string;
  useFee?: string;
  tel?: string;
  homepage?: string;
  sigunguCode?: string;
}

export interface CustomFestivalListResult {
  totalElements: number;
  festivals: CustomFestivalItem[];
  statusCounts: FestivalStatusCounts;
}

export interface RegionOptionDto {
  label: string;
  value: string;
  type: string;
  active?: boolean;
}

export interface CategoryOptionDto {
  label: string;
  value: string;
  type: string;
}

// ────────────────────────────────────────
// 축제 관리 폼 상태 타입
// ────────────────────────────────────────
export interface CustomFestivalFormData {
  title: string;
  areaCode: string;
  startDate: string;
  endDate: string;
  category: string;
  content: string;
  isVisible: boolean;
  eventPlace: string;
  address: string;
  detailAddress: string;
  useFee: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  tel: string;
  homepage: string;
  sigunguCode: string;
}

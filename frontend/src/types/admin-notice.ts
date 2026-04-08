/**
 * 관리자 공지사항 관리 타입 정의
 */

/** 공지사항 아이템 */
export interface AdminNoticeItem {
  id: number;
  title: string;
  content: string;
  summary?: string;
  viewCount: number;
  isPinned: boolean;
  isPopup: boolean;
  isPushed: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

/** 공지사항 목록 응답 (Spring Data Page) */
export interface AdminNoticeListResponse {
  content: AdminNoticeItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * 관리자 문의 관리 타입 정의
 */

/** 문의 목록 아이템 */
export interface InquiryItem {
  id: number;
  title: string;
  content: string;
  status: string;            // PENDING | ANSWERED
  answer: string | null;
  answeredAt: string | null;
  authorNickname: string;
  createdAt: string;
}

/** 문의 목록 응답 */
export interface InquiryListResponse {
  content: InquiryItem[];
  totalPages: number;
  totalElements: number;
  pendingCount: number;
  answeredCount: number;
}

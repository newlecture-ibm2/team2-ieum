/**
 * 관리자 신고 관리 타입 정의
 */

/** 신고 목록 아이템 */
export interface ReportItem {
  id: number;
  targetType: string;       // REVIEW | POST | COMMENT
  targetId: number;
  reason: string;            // SPAM | ABUSE | INAPPROPRIATE | FALSE_INFO | OTHER
  description: string | null;
  status: string;            // PENDING | RESOLVED | REJECTED
  action: string | null;     // DELETE_CONTENT | WARN_USER | NONE
  adminNote: string | null;
  reporterNickname: string;
  createdAt: string;
  processedAt: string | null;
}

/** 신고 목록 응답 */
export interface ReportListResponse {
  content: ReportItem[];
  totalPages: number;
  totalElements: number;
  pendingCount: number;
  resolvedCount: number;
  rejectedCount: number;
}

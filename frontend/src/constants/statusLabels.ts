/**
 * 상태 라벨 매핑 (관리자 UI 뱃지용)
 * - 신고 상태, 문의 상태 등에서 공통 사용
 * - className은 admin common CSS 모듈의 클래스명과 매핑
 */

// ─── 신고 상태 ───

export const REPORT_STATUS = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const;

export type ReportStatusType = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];

export const REPORT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  [REPORT_STATUS.PENDING]:  { label: '대기중',   className: 'badgePending' },
  [REPORT_STATUS.RESOLVED]: { label: '처리완료', className: 'badgeOngoing' },
  [REPORT_STATUS.REJECTED]: { label: '반려',     className: 'badgeDismissed' },
};

// ─── 문의 상태 ───

export const INQUIRY_STATUS = {
  PENDING: 'PENDING',
  ANSWERED: 'ANSWERED',
} as const;

export type InquiryStatusType = typeof INQUIRY_STATUS[keyof typeof INQUIRY_STATUS];

export const INQUIRY_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  [INQUIRY_STATUS.PENDING]:  { label: '대기중',   className: 'badgePending' },
  [INQUIRY_STATUS.ANSWERED]: { label: '답변완료', className: 'badgeOngoing' },
};

/**
 * 신고 관련 상수
 * - 신고 사유 라벨 (프론트 전역 공통)
 * - 신고 사유 옵션 (모달 라디오 버튼용)
 * - 신고 처리 액션
 */

// ─── 신고 사유 값 ───

export const REPORT_REASON = {
  SPAM: 'SPAM',
  ABUSE: 'ABUSE',
  INAPPROPRIATE: 'INAPPROPRIATE',
  FALSE_INFO: 'FALSE_INFO',
  OTHER: 'OTHER',
} as const;

export type ReportReasonType = typeof REPORT_REASON[keyof typeof REPORT_REASON];

// ─── 신고 사유 한글 라벨 (표시용) ───

export const REPORT_REASON_LABELS: Record<string, string> = {
  [REPORT_REASON.SPAM]: '스팸/광고',
  [REPORT_REASON.ABUSE]: '욕설/비방',
  [REPORT_REASON.INAPPROPRIATE]: '부적절한 콘텐츠',
  [REPORT_REASON.FALSE_INFO]: '허위 정보',
  [REPORT_REASON.OTHER]: '기타',
};

/** 신고 모달 라디오 버튼 옵션 */
export const REPORT_REASON_OPTIONS = Object.entries(REPORT_REASON_LABELS)
  .map(([value, label]) => ({ value, label }));

// ─── 신고 처리 액션 ───

export const REPORT_ACTION = {
  DISMISS: 'DISMISS',
  DELETE: 'DELETE',
  SUSPEND: 'SUSPEND',
  WARNING: 'WARNING',
} as const;

export type ReportActionType = typeof REPORT_ACTION[keyof typeof REPORT_ACTION];

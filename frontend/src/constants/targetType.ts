/**
 * 신고/첨부파일 대상 유형 상수
 * - 백엔드 TargetType Enum과 값이 1:1 일치
 */

export const TARGET_TYPE = {
  POST: 'POST',
  COMMENT: 'COMMENT',
  REVIEW: 'REVIEW',
  NOTICE: 'NOTICE',
  FESTIVAL: 'FESTIVAL',
  COMMUNITY: 'COMMUNITY',
  PROFILE: 'PROFILE',
} as const;

export type TargetTypeValue = typeof TARGET_TYPE[keyof typeof TARGET_TYPE];

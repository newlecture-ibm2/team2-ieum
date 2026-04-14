/**
 * 회원 상태 및 역할 상수
 * - 백엔드 UserStatus, Role Enum과 값이 1:1 일치
 */

// ─── 회원 상태 ───

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  WITHDRAWAL: 'WITHDRAWAL',
  DELETED: 'DELETED',
} as const;

export type UserStatusType = typeof USER_STATUS[keyof typeof USER_STATUS];

// ─── 회원 역할 ───

export const USER_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRoleType = typeof USER_ROLE[keyof typeof USER_ROLE];

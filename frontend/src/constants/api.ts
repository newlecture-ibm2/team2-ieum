/**
 * API 관련 공통 상수
 */
export const API_STATUS = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    PASSWORD_RECOVERY: {
      REQUEST: '/api/auth/password-recovery/request',
      VERIFY: '/api/auth/password-recovery/verify',
      RESET: '/api/auth/password-recovery/reset',
    },
    ME: '/api/auth/me',
    UPDATE_SESSION: '/api/auth/update-session',
    CHECK_NICKNAME: '/api/auth/check-nickname',
  },
  MYPAGE: {
    PROFILE: '/api/mypage/profile',
    UPDATE: '/api/mypage',
    UPDATE_IMAGE: '/api/mypage/profile/image',
  },
} as const;

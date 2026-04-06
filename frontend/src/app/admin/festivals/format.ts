/**
 * 관리자 공통 포맷/유틸 함수
 * 모든 admin 하위 페이지에서 사용 가능
 */

/** 날짜 범위 포맷 (2024-01-01 ~ 2024-01-31 → 2024.01.01 ~ 01.31) */
export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return '';
  const s = startDate.replace(/-/g, '.');
  const e = endDate.replace(/-/g, '.');
  return `${s} ~ ${e}`;
}

/** 이미지 URL 정규화 (상대경로 → 절대경로) */
export function resolveImageSrc(src: string): string {
  if (src.startsWith('http') || src.startsWith('blob:')) return src;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  return `${base}${src.startsWith('/') ? '' : '/'}${src}`;
}

/** 오늘 날짜 문자열 (yyyy-MM-dd) */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

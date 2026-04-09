/**
 * 공통 유틸리티 함수
 */

/**
 * 날짜 문자열을 'YYYY-MM-DD HH:mm' 형식으로 변환합니다.
 * @param dateStr ISO 형식 등의 날짜 문자열
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    
    // 유효하지 않은 날짜 체크
    if (isNaN(date.getTime())) return dateStr;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    return dateStr;
  }
}

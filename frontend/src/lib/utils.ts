/**
 * 공통 유틸리티 함수
 */

/**
 * 날짜 문자열을 안전하게 포맷팅합니다.
 * 시간 정보가 있으면 'YYYY-MM-DD HH:mm', 없으면 'YYYY-MM-DD'로 반환합니다.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    // 점(.)으로 구분된 날짜(2024.04.09) 등을 표준 형식으로 변환 시도
    const normalizedStr = dateStr.replace(/\./g, '-');
    const date = new Date(normalizedStr);
    
    if (isNaN(date.getTime())) return dateStr;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // 원본 문자열에 시간 정보(콜론 ':')가 포함되어 있는지 확인
    const hasTime = dateStr.includes(':');
    
    if (hasTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    return `${year}-${month}-${day}`;
  } catch (e) {
    return dateStr;
  }
}

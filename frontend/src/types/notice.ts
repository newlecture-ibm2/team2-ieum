/**
 * 공지사항 타입 (백엔드 Notice 도메인 모델 매핑)
 */
export interface Notice {
  id: number;
  title: string;
  content: string;
  summary?: string;
  viewCount: number;
  isPinned: boolean;
  isPopup: boolean;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 공지사항 상세 API 응답 (이전글/다음글 포함)
 */
export interface NoticeDetailResponse {
  notice: Notice;
  prevNotice?: { id: number; title: string } | null;
  nextNotice?: { id: number; title: string } | null;
}

/**
 * Spring Data Page 응답 구조
 */
export interface NoticePage {
  content: Notice[];
  totalElements: number;
  totalPages: number;
  number: number;         // 0-based page index
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

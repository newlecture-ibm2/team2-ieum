/**
 * 마이페이지 공통 타입 정의
 * 백엔드 MyPageRes.ActivityDto 규격 준수
 */

// --- 활동 유형 타입 ---
export type ActivityType = 'posts' | 'reviews' | 'comments' | 'inquiries' | 'reports';

// --- 백엔드 MyPageRes.ActivityDto 통합 객체 ---
export interface MyActivity {
  id: number;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
  type: string;

  // 리뷰/축제 관련
  festivalName?: string;
  rating?: number;
  location?: string;
  festivalId?: number;

  // 댓글 관련
  postId?: number;
  postTitle?: string;

  // 문의/신고 관련 (ActivityDto 필드명 기준)
  status?: string;
  answer?: string;
  answeredAt?: string;
  targetId?: number;
}

// --- 각 목록에서 사용하기 편하도록 Alias 제공 ---

/** 내 게시글 */
export type MyPost = Pick<MyActivity, 'id' | 'title' | 'content' | 'summary' | 'createdAt'>;

/** 내 리뷰 */
export type MyReview = Pick<MyActivity, 'id' | 'content' | 'createdAt' | 'festivalName' | 'festivalId' | 'rating' | 'location'>;

/** 내 댓글 */
export type MyComment = Pick<MyActivity, 'id' | 'content' | 'createdAt' | 'postId' | 'postTitle'>;

/** 내 문의 */
export interface MyInquiry extends Pick<MyActivity, 'id' | 'title' | 'content' | 'createdAt' | 'status' | 'answer' | 'answeredAt'> {
  // status의 상세 유니온 타입이 필요한 경우 오버라이드
  status: 'PENDING' | 'ANSWERED';
}

/** 내 신고 */
export interface MyReport extends Pick<MyActivity, 'id' | 'title' | 'content' | 'createdAt' | 'status' | 'targetId'> {
  // 백엔드 ActivityDto 규격에 맞춰 title(타입-사유), content(내용)를 사용하므로
  // 개별 필드는 인터페이스에서 제외하거나 선택적(Optional)으로 관리합니다.
  targetType?: string;
  reason?: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  action?: string;
  adminNote?: string;
}

// --- 찜 (별도 API 규격) ---
export interface MyFavorite {
  id: number;
  festivalId: number;
  name: string;
  location: string;
  date: string;
  thumbnail: string;
}

// --- API 응답 규격 ---
export interface ActivityListResponse {
  activities: MyActivity[];
  totalPages: number;
  totalElements: number;
}

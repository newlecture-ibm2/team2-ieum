/**
 * 관리자 회원 관리 타입 정의
 */

/** 회원 목록 아이템 */
export interface MemberItem {
  userId: number;
  loginId: string;           // 이메일(로그인 ID)
  name: string;              // 실명
  nickname: string;          // 닉네임
  phone: string | null;
  profileImage: string | null;
  role: string;              // USER | ADMIN
  status: string;            // ACTIVE | SUSPENDED | DELETED
  suspendedUntil: string | null; // 정지 해제 예정일 (7일 정지)
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  reportedCount: number;     // 신고 당한 횟수
}

/** 회원 목록 응답 */
export interface MemberListResponse {
  content: MemberItem[];
  totalPages: number;
  totalElements: number;
  activeCount: number;
  suspendedCount: number;
  deletedCount: number;
}

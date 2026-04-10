package com.ieum.admin.member.domain.model;

/**
 * 회원 상태 상수 정의 (admin 컨텍스트)
 *
 * <p>users 테이블의 status 컬럼에 저장되는 값.
 * admin과 user/auth 모듈이 동일 테이블을 공유하므로 값의 의미를 정확히 구분해야 한다.</p>
 *
 * <h3>상태 정의</h3>
 * <ul>
 *   <li>ACTIVE — 정상 회원</li>
 *   <li>SUSPENDED — 정지 회원 (쓰기 제한, 로그인은 가능)</li>
 *   <li>WITHDRAWAL — 탈퇴 유예 (user/auth에서 설정, 30일 이내 재로그인 시 복구)</li>
 *   <li>DELETED — 관리자에 의한 삭제 처리</li>
 * </ul>
 *
 * <h3>주의: WITHDRAWAL vs DELETED</h3>
 * <ul>
 *   <li>WITHDRAWAL: user/auth 모듈에서 자발적 탈퇴 시 설정. 30일 유예 후 물리 삭제 대상.</li>
 *   <li>DELETED: admin에서 강제 탈퇴 시 설정. WITHDRAWAL과 의미가 다르다.</li>
 *   <li>현재 user/auth AuthService.login()은 WITHDRAWAL만 체크하므로,
 *       DELETED 상태 회원의 로그인 차단 여부는 user/auth 담당자와 협의가 필요하다.</li>
 * </ul>
 */
public final class MemberStatus {

    private MemberStatus() {
        // 인스턴스 생성 방지
    }

    /** 정상 회원 (서비스 이용 가능) */
    public static final String ACTIVE = "ACTIVE";

    /**
     * 정지 회원 (쓰기 제한 상태)
     * - 로그인은 가능하지만 게시글/댓글/리뷰 작성이 제한된다
     * - 조회, 알림, 신고, 문의 작성은 허용된다
     * - 실제 쓰기 차단은 각 user 도메인 서비스에서 처리한다 (admin 범위 아님)
     */
    public static final String SUSPENDED = "SUSPENDED";

    /**
     * 탈퇴 유예 상태 (user/auth 모듈에서 설정)
     * - 사용자가 자발적으로 탈퇴 요청 시 user/auth에서 설정하는 값
     * - 30일 이내 재로그인 시 ACTIVE로 자동 복구
     * - admin에서는 이 값을 직접 설정하지 않는다 (조회/표시 용도)
     */
    public static final String WITHDRAWAL = "WITHDRAWAL";

    /**
     * 관리자 삭제 처리 상태
     * - admin에서 강제 탈퇴 시 설정하는 값
     * - WITHDRAWAL(자발적 탈퇴)과 의미가 다르다
     */
    public static final String DELETED = "DELETED";
}

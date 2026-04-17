package com.ieum.global.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 회원 계정 상태
 * - admin/user 양쪽 모듈에서 공통으로 참조
 * - DB users 테이블의 status 컬럼 값과 1:1 매핑
 *
 * <h3>상태 정의</h3>
 * <ul>
 *   <li>ACTIVE — 정상 회원 (서비스 이용 가능)</li>
 *   <li>SUSPENDED — 정지 회원 (쓰기 제한, 로그인은 가능)</li>
 *   <li>WITHDRAWAL — 탈퇴 유예 (사용자 자발적 탈퇴, 30일 이내 재로그인 시 복구)</li>
 *   <li>DELETED — 관리자 강제 삭제 처리</li>
 * </ul>
 */
@Getter
@RequiredArgsConstructor
public enum UserStatus {

    ACTIVE("정상"),
    SUSPENDED("정지"),
    WITHDRAWAL("탈퇴 유예"),
    DELETED("삭제");

    private final String description;
}

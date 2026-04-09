package com.ieum.admin.member.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 회원 도메인 모델 (순수 객체 — JPA Entity 아님)
 * - users 테이블 기반 + 신고 당한 횟수(reportedCount) 포함
 */
@Getter
@Builder
public class Member {
    private Long userId;
    private String loginId;          // 이메일(로그인 ID)
    private String name;             // 실명
    private String nickname;         // 닉네임
    private String phone;            // 전화번호
    private String profileImage;     // 프로필 이미지 URL
    private String role;             // USER / ADMIN
    private String status;           // ACTIVE / SUSPENDED / DELETED
    private LocalDateTime suspendedUntil; // 정지 해제 예정일 (7일 정지)
    private LocalDateTime createdAt; // 가입일
    private LocalDateTime updatedAt; // 수정일
    private LocalDateTime deletedAt; // 탈퇴일

    /** 신고 당한 횟수 (reports 테이블에서 집계) */
    private long reportedCount;
}

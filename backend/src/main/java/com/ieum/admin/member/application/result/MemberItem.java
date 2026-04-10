package com.ieum.admin.member.application.result;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 회원 목록 아이템 Result DTO (Domain 기반)
 *
 * <p>{@code provider}는 loginId prefix에서 추론한 파생 필드이다.
 * 값: LOCAL / KAKAO / NAVER (DB 컬럼 아님)</p>
 */
@Getter
@Builder
public class MemberItem {
    private Long userId;
    private String loginId;
    /** 가입 방식: LOCAL / KAKAO / NAVER (loginId prefix에서 추론) */
    private String provider;
    private String name;
    private String nickname;
    private String phone;
    private String profileImage;
    private String role;
    private String status;
    private LocalDateTime suspendedUntil;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private long reportedCount;
}

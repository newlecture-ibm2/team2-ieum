package com.ieum.admin.member.application.result;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 회원 목록 아이템 Result DTO (Domain 기반)
 */
@Getter
@Builder
public class MemberItem {
    private Long userId;
    private String loginId;
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

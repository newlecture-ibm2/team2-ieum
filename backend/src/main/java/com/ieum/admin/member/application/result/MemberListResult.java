package com.ieum.admin.member.application.result;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 회원 목록 응답 Result DTO
 */
@Getter
@Builder
public class MemberListResult {
    private List<MemberItem> content;
    private int totalPages;
    private long totalElements;
    private long activeCount;
    private long suspendedCount;
    private long withdrawalCount;
}

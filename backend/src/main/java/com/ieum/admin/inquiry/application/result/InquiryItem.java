package com.ieum.admin.inquiry.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 문의 목록 아이템 DTO
 */
@Getter
@Builder
@AllArgsConstructor
public class InquiryItem {
    private Long id;
    private String title;
    private String content;
    private String status;
    private String answer;
    private String answeredAt;
    private String authorNickname;
    private String createdAt;
}

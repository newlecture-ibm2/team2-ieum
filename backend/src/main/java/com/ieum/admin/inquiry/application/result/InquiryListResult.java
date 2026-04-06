package com.ieum.admin.inquiry.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 문의 목록 응답 DTO
 */
@Getter
@Builder
@AllArgsConstructor
public class InquiryListResult {
    private List<InquiryItem> content;
    private int totalPages;
    private long totalElements;
    private long pendingCount;
    private long answeredCount;
}

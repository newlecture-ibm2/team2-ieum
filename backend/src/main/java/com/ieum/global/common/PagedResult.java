package com.ieum.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * 프레임워크 독립적인 페이징 결과 VO
 * - Application / Port 계층에서 Spring Data Page 대신 사용
 * - Adapter 계층에서 Page → PagedResult 변환 담당
 */
@Getter
@AllArgsConstructor
public class PagedResult<T> {

    private final List<T> content;
    private final long totalElements;
    private final int totalPages;
}

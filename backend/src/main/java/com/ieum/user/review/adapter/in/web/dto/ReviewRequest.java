package com.ieum.user.review.adapter.in.web.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 리뷰 작성/수정 요청 DTO
 * - Map<String, Object> 대신 타입 안전한 요청 객체
 */
@Getter
@Setter
@NoArgsConstructor
public class ReviewRequest {

    private Long festivalId;
    private Integer rating;
    private String content;
}

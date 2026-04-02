package com.ieum.admin.notice.domain;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 관리자용 공지사항 도메인 모델 (순수 자바 객체)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotice {

    private Long id;
    private String title;
    private String content;
    private String summary;

    @Builder.Default
    private Integer viewCount = 0;

    @Builder.Default
    private Boolean isPinned = false;

    @Builder.Default
    private Boolean isPopup = false;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

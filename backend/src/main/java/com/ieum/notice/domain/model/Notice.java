package com.ieum.notice.domain.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 공지사항 도메인 모델 (순수 자바 객체)
 * - JPA 의존성 없음
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notice {

    private Long id;
    private String title;
    private String content;
    private String summary;

    @Builder.Default
    private NoticeCategory category = NoticeCategory.GENERAL;

    @Builder.Default
    private Integer viewCount = 0;

    @Builder.Default
    private Boolean isPinned = false;

    @Builder.Default
    private Boolean isPopup = false;

    @Builder.Default
    private Boolean isPushed = false;

    @Builder.Default
    private Boolean isActive = true;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

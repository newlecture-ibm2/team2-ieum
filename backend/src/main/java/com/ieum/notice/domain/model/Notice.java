package com.ieum.notice.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 공지사항 도메인 모델 및 JPA 엔티티
 * - 사용자/관리자 양쪽에서 공유하는 핵심 도메인
 */
@Entity(name = "Notice")
@Table(name = "notices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long id;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    /**
     * 팝업용 요약 (메인 화면 진입 시 표시)
     */
    @Column(name = "summary", length = 300)
    private String summary;

    @Builder.Default
    @Column(name = "view_count")
    private Integer viewCount = 0;

    /**
     * 상단 고정 여부
     */
    @Builder.Default
    @Column(name = "is_pinned")
    private Boolean isPinned = false;

    /**
     * 팝업 표시 여부
     */
    @Builder.Default
    @Column(name = "is_popup")
    private Boolean isPopup = false;

    /**
     * 게시 시작일 (예약 게시용)
     */
    @Column(name = "start_date")
    private LocalDateTime startDate;

    /**
     * 게시 종료일
     */
    @Column(name = "end_date")
    private LocalDateTime endDate;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

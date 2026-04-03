package com.ieum.admin.notice.adapter.out.persistence.entity;

import com.ieum.admin.notice.domain.AdminNotice;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 관리자용 공지사항 JPA 엔티티
 * - 같은 notices 테이블을 바라보되, 엔티티 이름으로 분리
 */
@Entity(name = "AdminNotice")
@Table(name = "notices")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AdminNoticeJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long id;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "summary", length = 300)
    private String summary;

    @Builder.Default
    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Builder.Default
    @Column(name = "is_pinned")
    private Boolean isPinned = false;

    @Builder.Default
    @Column(name = "is_popup")
    private Boolean isPopup = false;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * JPA 엔티티 → 도메인 객체 변환
     */
    public AdminNotice toDomain() {
        return AdminNotice.builder()
                .id(this.id)
                .title(this.title)
                .content(this.content)
                .summary(this.summary)
                .viewCount(this.viewCount)
                .isPinned(this.isPinned)
                .isPopup(this.isPopup)
                .startDate(this.startDate)
                .endDate(this.endDate)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

    /**
     * 도메인 객체 → JPA 엔티티 변환
     */
    public static AdminNoticeJpaEntity fromDomain(AdminNotice notice) {
        return AdminNoticeJpaEntity.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .summary(notice.getSummary())
                .viewCount(notice.getViewCount())
                .isPinned(notice.getIsPinned())
                .isPopup(notice.getIsPopup())
                .startDate(notice.getStartDate())
                .endDate(notice.getEndDate())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .build();
    }
}

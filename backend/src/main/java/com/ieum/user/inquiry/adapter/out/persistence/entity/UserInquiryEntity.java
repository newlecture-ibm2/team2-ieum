package com.ieum.user.inquiry.adapter.out.persistence.entity;

import com.ieum.user.inquiry.domain.model.UserInquiry;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * [Entity] 사용자 문의 영속성 엔티티 (inquiries 레코드 매핑)
 * 주의: admin 도메인의 필드 조작 방지를 위해 응답은 updatable = false 적용
 */
@Entity
@Table(name = "inquiries")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserInquiryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private Long userId;

    @Column(nullable = false, length = 200, updatable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT", updatable = false)
    private String content;

    @Column(nullable = false, length = 10, updatable = false)
    private String status;

    @Column(columnDefinition = "TEXT", updatable = false)
    private String answer;

    @Column(name = "answered_at", updatable = false)
    private LocalDateTime answeredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
    }

    /**
     * [Mapper] Entity -> Domain
     */
    public UserInquiry toDomain() {
        return UserInquiry.builder()
                .id(this.id)
                .userId(this.userId)
                .title(this.title)
                .content(this.content)
                .status(this.status)
                .answer(this.answer)
                .answeredAt(this.answeredAt)
                .createdAt(this.createdAt)
                .build();
    }
}

package com.ieum.admin.inquiry.adapter.out.persistence.entity;

import com.ieum.admin.inquiry.domain.model.Inquiry;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * inquiries 테이블 JPA Entity
 */
@Entity
@Table(name = "inquiries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 10)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @Column(name = "answered_by")
    private Long answeredBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private String authorNickname;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }

    public Inquiry toDomain() {
        return Inquiry.builder()
                .id(id)
                .userId(userId)
                .title(title)
                .content(content)
                .status(status)
                .answer(answer)
                .answeredAt(answeredAt != null ? answeredAt.toString() : null)
                .createdAt(createdAt != null ? createdAt.toString() : null)
                .authorNickname(authorNickname)
                .build();
    }

    public static InquiryEntity fromDomain(Inquiry domain) {
        return InquiryEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .title(domain.getTitle())
                .content(domain.getContent())
                .status(domain.getStatus())
                .answer(domain.getAnswer())
                .createdAt(domain.getCreatedAt() != null ? LocalDateTime.parse(domain.getCreatedAt()) : null)
                .build();
    }
}

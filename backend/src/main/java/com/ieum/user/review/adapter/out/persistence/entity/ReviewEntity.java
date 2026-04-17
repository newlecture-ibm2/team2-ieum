package com.ieum.user.review.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "festival_id", nullable = false)
    private Long festivalId;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000, nullable = false)
    private String content;

    @Column(nullable = false, length = 10)
    @Builder.Default
<<<<<<< HEAD
    private String status = "ACTIVE"; // ACTIVE / REMOVED
=======
    private String status = "ACTIVE";
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

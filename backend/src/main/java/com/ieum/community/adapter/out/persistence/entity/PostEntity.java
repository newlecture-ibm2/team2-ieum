package com.ieum.community.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PostEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String category; // QNA, TIP, REVIEW

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "area_code", length = 10)
    private String areaCode;

    @Column(name = "festival_id", length = 50)
    private String festivalId;

    @Column(name = "festival_name", length = 100)
    private String festivalName;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(name = "author_name", nullable = false, length = 50)
    private String authorName;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private int viewCount = 0;

    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private int likeCount = 0;

    @org.hibernate.annotations.Formula("(SELECT count(*) FROM comments c WHERE c.post_id = id AND c.status = 'ACTIVE')")
    private int commentCount;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE / REMOVED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void update(String category, String title, String content, String areaCode, String festivalId, String festivalName) {
        this.category = category;
        this.title = title;
        this.content = content;
        this.areaCode = areaCode;
        this.festivalId = festivalId;
        this.festivalName = festivalName;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }

    public void increaseLikeCount() {
        this.likeCount++;
    }

    public void decreaseLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    public void softDelete() {
        this.status = "REMOVED";
    }

    public boolean isActive() {
        return "ACTIVE".equals(this.status);
    }
}

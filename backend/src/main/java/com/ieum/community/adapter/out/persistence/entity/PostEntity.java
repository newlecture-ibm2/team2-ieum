package com.ieum.community.adapter.out.persistence.entity;

import com.ieum.community.domain.model.Post;
import com.ieum.global.common.enums.ContentStatus;
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

    @Column(nullable = false, length = 200)
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

    @org.hibernate.annotations.Formula("(SELECT count(*) FROM comments c WHERE c.post_id = id AND c.status = 'ACTIVE' AND c.user_id NOT IN (SELECT u.user_id FROM users u WHERE u.status = 'DELETED'))")
    private int commentCount;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String status = ContentStatus.ACTIVE.name(); // ACTIVE / REMOVED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ─── Domain ↔ Entity 변환 ───

    /**
     * JPA Entity → 도메인 모델 변환
     */
    public Post toDomain() {
        return Post.builder()
                .id(this.id)
                .category(this.category)
                .title(this.title)
                .content(this.content)
                .areaCode(this.areaCode)
                .festivalId(this.festivalId)
                .festivalName(this.festivalName)
                .authorId(this.authorId)
                .authorName(this.authorName)
                .viewCount(this.viewCount)
                .likeCount(this.likeCount)
                .commentCount(this.commentCount)
                .status(this.status)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

    /**
     * 도메인 모델 → JPA Entity 변환
     */
    public static PostEntity fromDomain(Post post) {
        return PostEntity.builder()
                .id(post.getId())
                .category(post.getCategory())
                .title(post.getTitle())
                .content(post.getContent())
                .areaCode(post.getAreaCode())
                .festivalId(post.getFestivalId())
                .festivalName(post.getFestivalName())
                .authorId(post.getAuthorId())
                .authorName(post.getAuthorName())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .status(post.getStatus())
                .build();
    }

    // ─── JPA 세션 내 직접 변경용 (PersistenceAdapter에서 사용) ───

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
        this.status = ContentStatus.REMOVED.name();
    }

    public boolean isActive() {
        return ContentStatus.ACTIVE.name().equals(this.status);
    }
}

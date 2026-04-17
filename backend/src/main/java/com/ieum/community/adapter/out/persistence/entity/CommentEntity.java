package com.ieum.community.adapter.out.persistence.entity;

import com.ieum.community.domain.model.Comment;
import com.ieum.global.common.enums.ContentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "comments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", nullable = false, length = 50)
    private String userName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private CommentEntity parent;

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    @org.hibernate.annotations.SQLRestriction("user_id NOT IN (SELECT u.user_id FROM users u WHERE u.status = 'DELETED')")
    @Builder.Default
    private List<CommentEntity> children = new ArrayList<>();

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

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
     * JPA Entity → 도메인 모델 변환 (children 포함 재귀)
     */
    public Comment toDomain() {
        return Comment.builder()
                .id(this.id)
                .postId(this.postId)
                .userId(this.userId)
                .userName(this.userName)
                .parentId(this.parent != null ? this.parent.getId() : null)
                .content(this.content)
                .status(this.status)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .children(this.children != null
                        ? this.children.stream().map(CommentEntity::toDomain).collect(Collectors.toList())
                        : new ArrayList<>())
                .build();
    }

    /**
     * 도메인 모델 → JPA Entity 변환 (저장용, children 제외)
     */
    public static CommentEntity fromDomain(Comment comment) {
        return CommentEntity.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .userId(comment.getUserId())
                .userName(comment.getUserName())
                .content(comment.getContent())
                .status(comment.getStatus() != null ? comment.getStatus() : ContentStatus.ACTIVE.name())
                .build();
    }

    // ─── JPA 세션 내 직접 변경용 ───

    public void updateContent(String content) {
        this.content = content;
    }

    public void softDelete() {
        this.status = ContentStatus.REMOVED.name();
        this.content = "삭제된 댓글입니다.";
    }

    public boolean isActive() {
        return ContentStatus.ACTIVE.name().equals(this.status);
    }
}

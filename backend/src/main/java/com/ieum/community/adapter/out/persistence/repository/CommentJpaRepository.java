package com.ieum.community.adapter.out.persistence.repository;

import com.ieum.community.adapter.out.persistence.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentJpaRepository extends JpaRepository<CommentEntity, Long> {

    @Query("SELECT c FROM CommentEntity c WHERE c.postId = :postId AND c.parent IS NULL AND c.userId NOT IN (SELECT u.userId FROM com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity u WHERE u.status = 'DELETED') ORDER BY c.createdAt ASC")
    List<CommentEntity> findRootCommentsByPostId(@Param("postId") Long postId);

    /**
     * 특정 게시글의 전체 댓글 수 (ACTIVE 상태만)
     */
    @Query("SELECT COUNT(c) FROM CommentEntity c WHERE c.postId = :postId AND c.status = 'ACTIVE' AND c.userId NOT IN (SELECT u.userId FROM com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity u WHERE u.status = 'DELETED')")
    long countActiveByPostId(@Param("postId") Long postId);

    /**
     * 특정 부모 댓글에 달린 대댓글 목록
     */
    List<CommentEntity> findByParentIdOrderByCreatedAtAsc(Long parentId);
}

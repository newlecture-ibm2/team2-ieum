package com.ieum.user.mypage.adapter.out.persistence.repository;

import com.ieum.community.adapter.out.persistence.entity.CommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 마이페이지 전용 댓글 조회 저장소 (타 도메인 소스 수정 방지용)
 */
@Repository
public interface MyPageCommentRepository extends JpaRepository<CommentEntity, Long> {
    Page<CommentEntity> findByUserIdAndStatus(Long userId, String status, Pageable pageable);
}

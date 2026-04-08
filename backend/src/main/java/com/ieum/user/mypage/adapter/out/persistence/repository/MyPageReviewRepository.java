package com.ieum.user.mypage.adapter.out.persistence.repository;

import com.ieum.user.review.adapter.out.persistence.entity.ReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 마이페이지 전용 리뷰 조회 저장소 (타 도메인 소스 수정 방지용)
 */
@Repository
public interface MyPageReviewRepository extends JpaRepository<ReviewEntity, Long> {
    Page<ReviewEntity> findByUserId(Long userId, Pageable pageable);
}

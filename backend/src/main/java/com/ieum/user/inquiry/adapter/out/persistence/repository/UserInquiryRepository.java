package com.ieum.user.inquiry.adapter.out.persistence.repository;

import com.ieum.user.inquiry.adapter.out.persistence.entity.UserInquiryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * [Repository] 사용자 개인 문의 전용 JPA 리포지토리
 */
public interface UserInquiryRepository extends JpaRepository<UserInquiryEntity, Long> {
    
    // 본인의 문의 내역을 최신순으로 조회
    List<UserInquiryEntity> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    // 페이징 처리된 문의 내역 조회
    Page<UserInquiryEntity> findAllByUserId(Long userId, Pageable pageable);
}

package com.ieum.admin.inquiry.application.port.out;

import com.ieum.admin.inquiry.domain.model.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 문의 Persistence Port (Port OUT)
 */
public interface InquiryPort {

    Page<Inquiry> findAll(String status, String searchType, String keyword, java.time.LocalDateTime start, java.time.LocalDateTime end, Pageable pageable);

    Optional<Inquiry> findById(Long id);

    /** 닉네임 포함 단건 조회 (상세 API용) */
    Optional<Inquiry> findByIdWithNickname(Long id);

    void answer(Long id, String answer);

    long countByStatus(String status);

    long countCreatedToday(java.time.LocalDateTime start, java.time.LocalDateTime end);
}

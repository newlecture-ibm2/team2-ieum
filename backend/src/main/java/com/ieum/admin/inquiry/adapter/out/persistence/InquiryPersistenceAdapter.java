package com.ieum.admin.inquiry.adapter.out.persistence;

import com.ieum.admin.inquiry.adapter.out.persistence.entity.InquiryEntity;
import com.ieum.admin.inquiry.adapter.out.persistence.repository.InquiryAdminRepository;
import com.ieum.admin.inquiry.application.port.out.InquiryPort;
import com.ieum.admin.inquiry.domain.model.Inquiry;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 문의 Persistence Adapter (OutPort 구현체)
 */
@Component
@RequiredArgsConstructor
public class InquiryPersistenceAdapter implements InquiryPort {

    private final InquiryAdminRepository repository;

    @Override
    public Page<Inquiry> findAll(String status, String searchType, String keyword, Pageable pageable) {
        Page<Object[]> page = repository.findInquiriesByConditions(status, searchType, keyword, pageable);

        var inquiries = page.getContent().stream().map(row -> {
            InquiryEntity entity = (InquiryEntity) row[0];
            String nickname = (String) row[1];
            entity.setAuthorNickname(nickname != null ? nickname : "알 수 없음");
            return entity.toDomain();
        }).toList();

        return new PageImpl<>(inquiries, pageable, page.getTotalElements());
    }

    @Override
    public Optional<Inquiry> findById(Long id) {
        return repository.findById(id).map(entity -> {
            entity.setAuthorNickname("");
            return entity.toDomain();
        });
    }

    /**
     * 단건 조회 (닉네임 포함) — 상세 API용
     */
    @Override
    public Optional<Inquiry> findByIdWithNickname(Long id) {
        return repository.findInquiryWithNickname(id).map(row -> {
            InquiryEntity entity = (InquiryEntity) row[0];
            String nickname = (String) row[1];
            entity.setAuthorNickname(nickname != null ? nickname : "알 수 없음");
            return entity.toDomain();
        });
    }

    @Override
    public void answer(Long id, String answer) {
        InquiryEntity entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("INQUIRY_NOT_FOUND"));

        if ("ANSWERED".equals(entity.getStatus())) {
            throw new IllegalStateException("ALREADY_ANSWERED");
        }

        entity.setAnswer(answer);
        entity.setStatus("ANSWERED");
        entity.setAnsweredAt(LocalDateTime.now());
        repository.save(entity);
    }

    @Override
    public long countByStatus(String status) {
        return repository.countByStatus(status);
    }

    @Override
    public java.util.List<Inquiry> findByUserId(Long userId) {
        return repository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(InquiryEntity::toDomain)
                .toList();
    }

    @Override
    public Long save(Inquiry inquiry) {
        InquiryEntity entity = InquiryEntity.fromDomain(inquiry);
        InquiryEntity saved = repository.save(entity);
        return saved.getId();
    }
}

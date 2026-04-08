package com.ieum.user.inquiry.adapter.out.persistence;

import com.ieum.user.inquiry.adapter.out.persistence.entity.UserInquiryEntity;
import com.ieum.user.inquiry.adapter.out.persistence.repository.UserInquiryRepository;
import com.ieum.user.inquiry.application.port.out.UserInquiryPort;
import com.ieum.user.inquiry.domain.model.UserInquiry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

/**
 * [Adapter OUT] Port 인터페이스 구현 (Bean 겹침 방지 명시적 Naming)
 * 순수 Domain -> Persistence Entity 매핑 책임 보유
 */
@Component("userInquiryPersistenceAdapter")
@RequiredArgsConstructor
public class UserInquiryPersistenceAdapter implements UserInquiryPort {

    private final UserInquiryRepository repository;

    @Override
    public Long save(UserInquiry domain) {
        UserInquiryEntity entity = UserInquiryEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .title(domain.getTitle())
                .content(domain.getContent())
                .status(domain.getStatus() != null ? domain.getStatus() : "PENDING")
                .createdAt(domain.getCreatedAt())
                .build();
        return repository.save(entity).getId();
    }

    @Override
    public List<UserInquiry> findByUserId(Long userId) {
        List<UserInquiryEntity> entities = repository.findAllByUserIdOrderByCreatedAtDesc(userId);
        return entities.stream().map(UserInquiryEntity::toDomain).toList();
    }
}

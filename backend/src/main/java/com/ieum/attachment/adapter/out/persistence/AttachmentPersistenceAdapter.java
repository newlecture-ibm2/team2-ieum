package com.ieum.attachment.adapter.out.persistence;

import com.ieum.attachment.adapter.out.persistence.entity.AttachmentJpaEntity;
import com.ieum.attachment.application.port.out.AttachmentPort;
import com.ieum.attachment.domain.model.Attachment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * 첨부파일 영속성 어댑터 (Port OUT 구현체)
 * - Service는 AttachmentPort만 바라보고, 이 어댑터가 실제 JPA를 호출
 */
@Component
@RequiredArgsConstructor
public class AttachmentPersistenceAdapter implements AttachmentPort {

    private final AttachmentJpaRepository attachmentJpaRepository;

    @Override
    public Attachment save(Attachment attachment) {
        AttachmentJpaEntity entity = AttachmentJpaEntity.fromDomain(attachment);
        return attachmentJpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<Attachment> findById(Long fileId) {
        return attachmentJpaRepository.findById(fileId)
                .map(AttachmentJpaEntity::toDomain);
    }

    @Override
    public List<Attachment> findByTarget(String targetType, Long targetId) {
        return attachmentJpaRepository.findByTargetTypeAndTargetId(targetType, targetId)
                .stream()
                .map(AttachmentJpaEntity::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Long fileId) {
        attachmentJpaRepository.deleteById(fileId);
    }

    @Override
    public void deleteByTarget(String targetType, Long targetId) {
        attachmentJpaRepository.deleteByTargetTypeAndTargetId(targetType, targetId);
    }
}

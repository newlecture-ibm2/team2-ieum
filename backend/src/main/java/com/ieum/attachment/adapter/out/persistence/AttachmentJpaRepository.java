package com.ieum.attachment.adapter.out.persistence;

import com.ieum.attachment.adapter.out.persistence.entity.AttachmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 첨부파일 JPA 리포지토리
 */
@Repository
public interface AttachmentJpaRepository extends JpaRepository<AttachmentJpaEntity, Long> {

    List<AttachmentJpaEntity> findByTargetTypeAndTargetId(String targetType, Long targetId);

    void deleteByTargetTypeAndTargetId(String targetType, Long targetId);
}

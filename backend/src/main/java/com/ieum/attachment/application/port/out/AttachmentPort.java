package com.ieum.attachment.application.port.out;

import com.ieum.attachment.domain.model.Attachment;

import java.util.List;
import java.util.Optional;

/**
 * 첨부파일 영속성 포트 (Port OUT)
 * - Service가 이 인터페이스를 호출, PersistenceAdapter가 구현
 */
public interface AttachmentPort {

    Attachment save(Attachment attachment);

    Optional<Attachment> findById(Long fileId);

    List<Attachment> findByTarget(String targetType, Long targetId);

    void deleteById(Long fileId);

    void deleteByTarget(String targetType, Long targetId);
}

package com.ieum.attachment.adapter.out.persistence.entity;

import com.ieum.attachment.domain.model.Attachment;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 첨부파일 JPA 엔티티
 */
@Entity
@Table(name = "attachments", indexes = {
    @Index(name = "idx_attachment_target", columnList = "target_type, target_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AttachmentJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Long id;

    @Column(name = "target_type", length = 10, nullable = false)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "file_name", length = 200, nullable = false)
    private String fileName;

    @Column(name = "file_path", length = 500, nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * JPA 엔티티 → 도메인 객체 변환
     */
    public Attachment toDomain() {
        return Attachment.builder()
                .id(this.id)
                .targetType(this.targetType)
                .targetId(this.targetId)
                .fileName(this.fileName)
                .filePath(this.filePath)
                .fileSize(this.fileSize)
                .contentType(this.contentType)
                .createdAt(this.createdAt)
                .build();
    }

    /**
     * 도메인 객체 → JPA 엔티티 변환
     */
    public static AttachmentJpaEntity fromDomain(Attachment attachment) {
        return AttachmentJpaEntity.builder()
                .id(attachment.getId())
                .targetType(attachment.getTargetType())
                .targetId(attachment.getTargetId())
                .fileName(attachment.getFileName())
                .filePath(attachment.getFilePath())
                .fileSize(attachment.getFileSize())
                .contentType(attachment.getContentType())
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}

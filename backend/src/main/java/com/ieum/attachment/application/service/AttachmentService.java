package com.ieum.attachment.application.service;

import com.ieum.attachment.application.port.in.DeleteAttachmentUseCase;
import com.ieum.attachment.application.port.in.LoadAttachmentUseCase;
import com.ieum.attachment.application.port.in.UploadAttachmentUseCase;
import com.ieum.attachment.application.port.out.AttachmentPort;
import com.ieum.attachment.application.port.out.FileStoragePort;
import com.ieum.attachment.domain.model.Attachment;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 첨부파일 서비스 (UseCase 구현체)
 * - 3개의 Port IN을 모두 구현하여 비즈니스 로직을 집중
 * - 컨트롤러는 이 클래스의 로직을 직접 모르고, UseCase 인터페이스만 바라봄
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentService implements UploadAttachmentUseCase, LoadAttachmentUseCase, DeleteAttachmentUseCase {

    private final AttachmentPort attachmentPort;
    private final FileStoragePort fileStoragePort;

    // ──── Upload ────

    @Override
    public Attachment upload(String targetType, Long targetId, MultipartFile file) {
        String storedPath = fileStoragePort.store(targetType, targetId, file);

        Attachment attachment = Attachment.builder()
                .targetType(targetType)
                .targetId(targetId)
                .fileName(file.getOriginalFilename())
                .filePath(storedPath)
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .build();

        return attachmentPort.save(attachment);
    }

    @Override
    public List<Attachment> uploadAll(String targetType, Long targetId, List<MultipartFile> files) {
        return files.stream()
                .map(file -> upload(targetType, targetId, file))
                .toList();
    }

    // ──── Load / Download ────

    @Override
    @Transactional(readOnly = true)
    public List<Attachment> getAttachments(String targetType, Long targetId) {
        return attachmentPort.findByTarget(targetType, targetId);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource download(Long fileId) {
        Attachment attachment = attachmentPort.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다. id=" + fileId));
        return fileStoragePort.loadAsResource(attachment.getFilePath());
    }

    // ──── Delete ────

    @Override
    public void delete(Long fileId) {
        Attachment attachment = attachmentPort.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다. id=" + fileId));
        fileStoragePort.delete(attachment.getFilePath());
        attachmentPort.deleteById(fileId);
    }

    @Override
    public void deleteAllByTarget(String targetType, Long targetId) {
        List<Attachment> attachments = attachmentPort.findByTarget(targetType, targetId);
        attachments.forEach(a -> fileStoragePort.delete(a.getFilePath()));
        attachmentPort.deleteByTarget(targetType, targetId);
    }
}

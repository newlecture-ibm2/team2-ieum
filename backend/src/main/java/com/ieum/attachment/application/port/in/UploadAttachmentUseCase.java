package com.ieum.attachment.application.port.in;

import com.ieum.attachment.domain.model.Attachment;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 첨부파일 업로드 유스케이스 (Port IN)
 * - 컨트롤러에서 호출하는 인터페이스
 */
public interface UploadAttachmentUseCase {

    /**
     * 단일 파일 업로드
     */
    Attachment upload(String targetType, Long targetId, MultipartFile file);

    /**
     * 다중 파일 업로드
     */
    List<Attachment> uploadAll(String targetType, Long targetId, List<MultipartFile> files);
}

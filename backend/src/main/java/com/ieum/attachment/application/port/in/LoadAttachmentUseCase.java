package com.ieum.attachment.application.port.in;

import com.ieum.attachment.domain.model.Attachment;
import org.springframework.core.io.Resource;

import java.util.List;

/**
 * 첨부파일 조회/다운로드 유스케이스 (Port IN)
 */
public interface LoadAttachmentUseCase {

    /**
     * 특정 대상(공지/게시글/문의)에 연결된 첨부파일 목록 조회
     */
    List<Attachment> getAttachments(String targetType, Long targetId);

    /**
     * 파일 다운로드 (Resource 반환)
     */
    Resource download(Long fileId);
}

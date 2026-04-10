package com.ieum.attachment.application.port.in;

/**
 * 첨부파일 삭제 유스케이스 (Port IN)
 */
public interface DeleteAttachmentUseCase {

    /**
     * 단일 파일 삭제 (DB + 실제 파일)
     */
    void delete(Long fileId);

    /**
     * 특정 대상(공지/게시글)에 연결된 파일 전체 삭제
     */
    void deleteAllByTarget(String targetType, Long targetId);
}

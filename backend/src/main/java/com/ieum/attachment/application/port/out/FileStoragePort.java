package com.ieum.attachment.application.port.out;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * 파일 저장소 포트 (Port OUT)
 * - 로컬 디스크 / S3 등 실제 파일 저장·삭제를 추상화
 */
public interface FileStoragePort {

    /**
     * 파일을 저장소에 저장하고, 저장 경로를 반환
     */
    String store(String targetType, Long targetId, MultipartFile file);

    /**
     * 저장 경로로부터 Resource 로드 (다운로드용)
     */
    Resource loadAsResource(String filePath);

    /**
     * 저장소에서 파일 삭제
     */
    void delete(String filePath);
}

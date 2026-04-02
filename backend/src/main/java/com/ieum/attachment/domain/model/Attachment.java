package com.ieum.attachment.domain.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 공통 첨부파일 도메인 모델 (순수 자바 객체)
 * - JPA 의존성 없음
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {

    private Long id;
    private String targetType;
    private Long targetId;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String contentType;
    private LocalDateTime createdAt;
}

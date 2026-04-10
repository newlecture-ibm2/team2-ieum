package com.ieum.attachment.adapter.in.web;

import com.ieum.attachment.application.port.in.DeleteAttachmentUseCase;
import com.ieum.attachment.application.port.in.LoadAttachmentUseCase;
import com.ieum.attachment.application.port.in.UploadAttachmentUseCase;
import com.ieum.attachment.domain.model.Attachment;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 공용 첨부파일 컨트롤러 (Input Adapter)
 * - 모든 도메인(공지, 커뮤니티, 마이페이지, 어드민 등)에서 공통 사용
 * - 프론트에서 독립적으로 파일 업로드/조회/삭제 가능
 */
@Tag(name = "첨부파일", description = "공용 파일 업로드/조회/삭제/다운로드 API")
@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final UploadAttachmentUseCase uploadAttachmentUseCase;
    private final LoadAttachmentUseCase loadAttachmentUseCase;
    private final DeleteAttachmentUseCase deleteAttachmentUseCase;

    /**
     * 단일 파일 업로드
     * POST /api/attachments?targetType=NOTICE&targetId=1
     */
    @Operation(summary = "단일 파일 업로드", description = "파일 1개를 업로드하고 저장된 첨부파일 정보를 반환합니다.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Attachment>> upload(
            @Parameter(description = "대상 유형 (NOTICE, COMMUNITY, PROFILE, FESTIVAL 등)", example = "NOTICE")
            @RequestParam String targetType,
            @Parameter(description = "대상 ID", example = "1")
            @RequestParam Long targetId,
            @Parameter(description = "업로드할 파일")
            @RequestPart MultipartFile file) {

        Attachment saved = uploadAttachmentUseCase.upload(targetType, targetId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
    }

    /**
     * 다중 파일 업로드
     * POST /api/attachments/batch?targetType=NOTICE&targetId=1
     */
    @Operation(summary = "다중 파일 업로드", description = "여러 파일을 한 번에 업로드합니다.")
    @PostMapping(value = "/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<Attachment>>> uploadAll(
            @Parameter(description = "대상 유형", example = "COMMUNITY")
            @RequestParam String targetType,
            @Parameter(description = "대상 ID", example = "1")
            @RequestParam Long targetId,
            @Parameter(description = "업로드할 파일 목록")
            @RequestPart List<MultipartFile> files) {

        List<Attachment> saved = uploadAttachmentUseCase.uploadAll(targetType, targetId, files);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
    }

    /**
     * 특정 대상의 첨부파일 목록 조회
     * GET /api/attachments?targetType=NOTICE&targetId=1
     */
    @Operation(summary = "첨부파일 목록 조회", description = "특정 대상(공지/게시글 등)에 연결된 첨부파일 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Attachment>>> getAttachments(
            @Parameter(description = "대상 유형", example = "NOTICE")
            @RequestParam String targetType,
            @Parameter(description = "대상 ID", example = "1")
            @RequestParam Long targetId) {

        List<Attachment> attachments = loadAttachmentUseCase.getAttachments(targetType, targetId);
        return ResponseEntity.ok(ApiResponse.success(attachments));
    }

    /**
     * 파일 다운로드
     * GET /api/attachments/{fileId}/download
     */
    @Operation(summary = "파일 다운로드", description = "첨부파일을 다운로드합니다.")
    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> download(
            @Parameter(description = "첨부파일 ID", example = "1")
            @PathVariable Long fileId) {

        Resource resource = loadAttachmentUseCase.download(fileId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    /**
     * 단일 파일 삭제
     * DELETE /api/attachments/{fileId}
     */
    @Operation(summary = "단일 파일 삭제", description = "첨부파일 1개를 삭제합니다. (DB + 실제 파일)")
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "첨부파일 ID", example = "1")
            @PathVariable Long fileId) {

        deleteAttachmentUseCase.delete(fileId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 특정 대상의 첨부파일 전체 삭제
     * DELETE /api/attachments?targetType=NOTICE&targetId=1
     */
    @Operation(summary = "대상 첨부파일 전체 삭제", description = "특정 대상에 연결된 모든 첨부파일을 삭제합니다.")
    @DeleteMapping("/by-target")
    public ResponseEntity<Void> deleteByTarget(
            @Parameter(description = "대상 유형", example = "NOTICE")
            @RequestParam String targetType,
            @Parameter(description = "대상 ID", example = "1")
            @RequestParam Long targetId) {

        deleteAttachmentUseCase.deleteAllByTarget(targetType, targetId);
        return ResponseEntity.noContent().build();
    }
}

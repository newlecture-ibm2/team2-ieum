package com.ieum.admin.report.adapter.in.web;

import com.ieum.admin.report.application.port.in.GetReportListUseCase;
import com.ieum.admin.report.application.port.in.ProcessReportUseCase;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 관리자용 신고 관리 컨트롤러 (Input Adapter)
 * - 로직 없이 UseCase만 호출
 */
@Tag(name = "[관리자] 신고 관리", description = "신고 목록 조회 / 신고 처리 (승인·반려)")
@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class ReportAdminController {

    private final GetReportListUseCase getReportListUseCase;
    private final ProcessReportUseCase processReportUseCase;
    private final com.ieum.admin.report.application.port.in.GetReportTargetUseCase getReportTargetUseCase;

    @Operation(summary = "신고 목록 조회", description = "관리자용 신고 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<?> getReports(
            @Parameter(description = "상태 (PENDING / RESOLVED / REJECTED)")
            @RequestParam(required = false) String status,
            @Parameter(description = "대상 타입 (REVIEW / POST / COMMENT)")
            @RequestParam(required = false) String targetType,
            @Parameter(description = "검색 기준 (ALL / REPORTER / DESCRIPTION / REASON)")
            @RequestParam(required = false, defaultValue = "ALL") String searchType,
            @Parameter(description = "검색어 (상세/신고자/사유)")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "페이지 번호", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        var result = getReportListUseCase.getReports(page, size, status, targetType, searchType, keyword);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "신고 처리 (답변 기반)", description = "신고를 승인(DELETE) 또는 반려(DISMISS) 처리하며, 관리자 답변을 함께 저장합니다.")
    @PatchMapping("/{reportId}/process")
    public ResponseEntity<?> processReport(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> body
    ) {
        String actionType = body.getOrDefault("actionType", "NONE");
        String message = body.getOrDefault("message", "");

        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of("VALIDATION_ERROR", 400, "처리 답변은 필수입니다.", "message 필드가 비어있습니다.")));
        }

        processReportUseCase.processReport(reportId, actionType, message);
        return ResponseEntity.ok(ApiResponse.success("신고가 처리되었습니다."));
    }

    /** 기존 API 유지 (하위 호환) — /{reportId}/status 경로 */
    @Operation(summary = "신고 처리 (레거시)", description = "기존 방식 (action + adminNote)")
    @PatchMapping("/{reportId}/status")
    public ResponseEntity<?> processReportLegacy(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> body
    ) {
        String action = body.getOrDefault("action", "NONE");
        String adminNote = body.getOrDefault("adminNote", "");
        processReportUseCase.processReport(reportId, action, adminNote.isBlank() ? "관리자 처리" : adminNote);
        return ResponseEntity.ok(ApiResponse.success("신고가 처리되었습니다."));
    }

    @Operation(summary = "신고 원문 조회", description = "신고 대상의 원문 콘텐츠를 조회합니다.")
    @GetMapping("/{reportId}/target")
    public ResponseEntity<?> getReportTarget(@PathVariable Long reportId) {
        var originalContent = getReportTargetUseCase.getOriginalContent(reportId);
        if (originalContent == null || originalContent.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error(ApiResponse.ErrorResponse.of("NOT_FOUND", 404, "원문을 찾을 수 없습니다.", "해당 식별자로 원문 조회를 실패했습니다.")));
        }
        return ResponseEntity.ok(ApiResponse.success(originalContent));
    }
}

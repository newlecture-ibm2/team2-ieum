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

    @Operation(summary = "신고 목록 조회", description = "관리자용 신고 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<?> getReports(
            @Parameter(description = "상태 (PENDING / RESOLVED / REJECTED)")
            @RequestParam(required = false) String status,
            @Parameter(description = "대상 타입 (REVIEW / POST / COMMENT)")
            @RequestParam(required = false) String targetType,
            @Parameter(description = "페이지 번호", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        var result = getReportListUseCase.getReports(page, size, status, targetType);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "신고 처리", description = "신고를 승인(DELETE) 또는 반려(DISMISS) 처리합니다.")
    @PatchMapping("/{reportId}")
    public ResponseEntity<?> processReport(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> body
    ) {
        String action = body.getOrDefault("action", "NONE");
        String adminNote = body.getOrDefault("adminNote", "");
        processReportUseCase.processReport(reportId, action, adminNote);
        return ResponseEntity.ok(ApiResponse.success("신고가 처리되었습니다."));
    }
}

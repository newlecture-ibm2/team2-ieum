package com.ieum.festival.admin.report.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "[관리자] 신고 관리", description = "신고 목록 조회 / 처리")
@RestController
@RequestMapping("/api/admin/reports")
public class ReportAdminController {

    @Operation(summary = "신고 목록 조회", description = "접수된 신고 목록을 상태별로 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요")
    })
    @GetMapping
    public ResponseEntity<?> getReports(
            @Parameter(description = "신고 상태 (PENDING, RESOLVED, DISMISSED)", example = "PENDING")
            @RequestParam(required = false) String status,
            @Parameter(description = "페이지 번호", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "신고 목록"));
    }

    @Operation(summary = "신고 처리", description = "신고를 처리(승인/기각)합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "처리 성공"),
            @ApiResponse(responseCode = "404", description = "신고를 찾을 수 없음")
    })
    @PutMapping("/{reportId}")
    public ResponseEntity<?> processReport(
            @Parameter(description = "신고 ID", required = true, example = "1")
            @PathVariable Long reportId,
            @RequestBody Map<String, String> request
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "신고 처리 성공"));
    }
}

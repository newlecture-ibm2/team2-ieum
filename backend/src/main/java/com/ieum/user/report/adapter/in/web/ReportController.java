package com.ieum.user.report.adapter.in.web;

import com.ieum.community.adapter.in.web.dto.ReportRequest;
import com.ieum.community.adapter.in.web.dto.ReportResponse;
import com.ieum.community.application.service.ReportService;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자 신고 API
 * POST /api/reports — 게시글, 댓글, 리뷰 등 콘텐츠 신고 접수
 */
@Tag(name = "신고", description = "부적절한 콘텐츠 신고 접수")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    /**
     * Authentication 객체에서 userId 추출
     * - 로그인 구현 완료 전까지는 임시로 1L 반환
     */
    private Long getUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        try {
            return Long.valueOf(auth.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Operation(summary = "신고 접수", description = "부적절한 게시글/리뷰/댓글을 신고합니다. (회원 전용)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "신고 접수 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "중복 신고")
    })
    @PostMapping
    public ApiResponse<ReportResponse> createReport(
            @RequestBody ReportRequest request,
            Authentication authentication) {
        ReportResponse response = reportService.createReport(request, getUserId(authentication));
        return ApiResponse.success(response);
    }

    @Operation(summary = "신고 여부 확인", description = "현재 사용자가 해당 대상을 이미 신고했는지 확인합니다.")
    @GetMapping("/check")
    public ApiResponse<Boolean> checkAlreadyReported(
            @RequestParam String targetType,
            @RequestParam Long targetId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        if (userId == null) {
            return ApiResponse.success(false);
        }
        boolean reported = reportService.isAlreadyReported(userId, targetType, targetId);
        return ApiResponse.success(reported);
    }

    @Operation(summary = "내 신고 내역 목록 조회", description = "내가 접수한 모든 신고 내역을 최신순으로 조회합니다. (API_USR_0080)")
    @GetMapping("/me")
    public ApiResponse<java.util.List<ReportResponse>> getMyReports(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ApiResponse.success(reportService.getMyReports(userId));
    }

    @Operation(summary = "신고 상세 및 답변 조회", description = "특정 신고 건의 상세 내용과 관리자 답변을 조회합니다. (API_USR_0081)")
    @GetMapping("/me/{reportId}")
    public ApiResponse<ReportResponse> getReportDetail(
            @PathVariable Long reportId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        return ApiResponse.success(reportService.getReportDetail(reportId, userId));
    }
}

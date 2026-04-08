package com.ieum.user.report.adapter.in.web;

import com.ieum.user.report.adapter.in.web.dto.ReportRequest;
import com.ieum.user.report.adapter.in.web.dto.ReportResponse;
import com.ieum.user.report.application.port.in.CreateReportUseCase;
import com.ieum.user.report.application.port.in.LoadReportUseCase;
import com.ieum.user.report.domain.model.Report;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * 통합 사용자 신고 API (POST, COMMENT, REVIEW 공통)
 * POST   /api/reports           — 신고 접수
 * GET    /api/reports/check     — 신고 여부 확인
 * GET    /api/reports/my-targets — 내가 신고한 대상 ID 목록
 */
@Tag(name = "신고", description = "부적절한 콘텐츠 신고 접수")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportController {

    private final CreateReportUseCase createReportUseCase;
    private final LoadReportUseCase loadReportUseCase;

    /**
     * Authentication 객체에서 userId 추출
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
        Report report = createReportUseCase.createReport(
                request.getTargetType(), request.getTargetId(),
                request.getReason(), request.getDescription(),
                getUserId(authentication));
        return ApiResponse.success(ReportResponse.fromDomain(report));
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
        boolean reported = loadReportUseCase.isAlreadyReported(userId, targetType, targetId);
        return ApiResponse.success(reported);
    }

    @Operation(summary = "내가 신고한 타겟 ID 목록 조회", description = "비회원은 빈 배열 반환. 반환된 ID들은 신고가 반려되지 않은(대기 또는 삭제된) 상태입니다.")
    @GetMapping("/my-targets")
    public ApiResponse<List<Long>> getMyReportedTargetIds(
            @RequestParam String targetType,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        if (userId == null) {
            return ApiResponse.success(Collections.emptyList());
        }
        List<Long> targetIds = loadReportUseCase.getMyReportedTargetIds(userId, targetType);
        return ApiResponse.success(targetIds);
    }
}

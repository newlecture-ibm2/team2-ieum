package com.ieum.admin.statistics.adapter.in.web;

import com.ieum.admin.statistics.application.port.in.GetDashboardUseCase;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 대시보드 / 통계 컨트롤러 (Input Adapter)
 * - 로직 없이 UseCase만 호출
 */
@Tag(name = "[관리자] 통계·대시보드", description = "대시보드 KPI / 추이 / 최근 내역 조회")
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class StatisticsController {

    private final GetDashboardUseCase getDashboardUseCase;

    @Operation(summary = "대시보드 통합 데이터 조회",
            description = "KPI(신고/문의 건수) + 7일 추이 + 최근 처리 내역을 통합 반환합니다.")
    @GetMapping
    public ResponseEntity<?> getDashboard() {
        var result = getDashboardUseCase.getDashboard();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "대시보드 차트 추이 조회",
            description = "지정된 기간(startDate ~ endDate)의 신고/문의 추이를 반환합니다.")
    @GetMapping("/trend")
    public ResponseEntity<?> getDashboardTrend(
            @RequestParam(required = false) java.time.LocalDate startDate,
            @RequestParam(required = false) java.time.LocalDate endDate
    ) {
        if (endDate == null) endDate = java.time.LocalDate.now();
        if (startDate == null) startDate = endDate.minusDays(6); // 기본값 7일
        
        var result = getDashboardUseCase.getDashboardTrend(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

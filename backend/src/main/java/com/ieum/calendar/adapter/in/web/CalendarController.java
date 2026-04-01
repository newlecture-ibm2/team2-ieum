package com.ieum.calendar.adapter.in.web;

import com.ieum.calendar.application.port.in.GetDailyFestivalListUseCase;
import com.ieum.calendar.application.port.in.GetMonthlyFestivalCountUseCase;
import com.ieum.calendar.application.result.DayCountResult;
import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 달력 컨트롤러 (Input Adapter)
 * - 로직 없이 UseCase만 호출, 원시값만 전달
 */
@Tag(name = "달력", description = "달력 기반 축제 조회")
@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final GetMonthlyFestivalCountUseCase getMonthlyFestivalCountUseCase;
    private final GetDailyFestivalListUseCase getDailyFestivalListUseCase;

    /**
     * 월별 축제 카운트 조회 (API_CAL_0010)
     */
    @Operation(summary = "월별 축제 카운트 조회", description = "특정 연/월의 일자별 축제 개수를 반환합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DayCountResult>>> getMonthlyCounts(
            @Parameter(description = "연도", example = "2026") @RequestParam int year,
            @Parameter(description = "월", example = "4") @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(
                getMonthlyFestivalCountUseCase.getMonthlyCounts(year, month)));
    }

    /**
     * 일자별 축제 목록 조회 (API_CAL_0020)
     */
    @Operation(summary = "일자별 축제 목록 조회", description = "특정 날짜에 진행 중인 축제 목록을 반환합니다.")
    @GetMapping("/festivals")
    public ResponseEntity<ApiResponse<Map<String, List<FestivalEntity>>>> getDailyFestivals(
            @Parameter(description = "조회 날짜 (yyyy-MM-dd)", example = "2026-04-01")
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("festivals", getDailyFestivalListUseCase.getDailyFestivals(date))));
    }
}

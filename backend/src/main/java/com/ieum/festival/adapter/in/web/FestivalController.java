package com.ieum.festival.adapter.in.web;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository;
import com.ieum.festival.application.service.TourApiSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "축제", description = "축제 조회 / 검색 / 공공데이터 동기화")
@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class FestivalController {

    private final FestivalJpaRepository repository;
    private final TourApiSyncService syncService;

    @Operation(
        summary = "축제 목록 조회 (날짜 기반 동적 필터링)",
        description = "status 파라미터에 따라 전체/진행중/진행전 축제를 날짜 기반으로 필터링하여 조회합니다.\n" +
                      "- 전체(all/미지정): 진행중 → 진행전(가까운 순) → 종료(최근 순)\n" +
                      "- 진행중(ongoing): 오늘 날짜 기준 startDate ≤ 오늘 ≤ endDate\n" +
                      "- 진행전(upcoming): startDate > 오늘, 시작일 가까운 순"
    )
    @GetMapping
    public ResponseEntity<?> getFestivals(
            @Parameter(description = "필터 상태 (all, ongoing, upcoming)", example = "ongoing")
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);

        // 날짜 기반 동적 필터링: DB 쿼리 레벨에서 CURRENT_DATE 비교
        Page<FestivalEntity> festivalPage;

        if ("ongoing".equalsIgnoreCase(status)) {
            // 진행중: startDate <= 오늘 <= endDate
            festivalPage = repository.findOngoingFestivals(pageable);
        } else if ("upcoming".equalsIgnoreCase(status)) {
            // 진행전: startDate > 오늘, 시작일 가까운 순
            festivalPage = repository.findUpcomingFestivals(pageable);
        } else {
            // 전체: 진행중 우선 → 진행전(가까운 순) → 종료(최근 순)
            festivalPage = repository.findAllWithDynamicOrder(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);

        Map<String, Object> data = new HashMap<>();
        data.put("list", festivalPage.getContent());
        data.put("total", festivalPage.getTotalElements());
        data.put("totalPages", festivalPage.getTotalPages());
        data.put("currentPage", page);

        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "공공데이터 동기화 (수동 배치)", description = "한국관광공사 TourAPI를 호출하여 DB를 업데이트합니다.")
    @PostMapping("/sync")
    public ResponseEntity<?> syncTourApi(
            @Parameter(description = "시작일 (YYYYMMDD)", example = "20260401")
            @RequestParam(defaultValue = "20260401") String eventStartDate
    ) {
        try {
            syncService.syncFestivals(eventStartDate);
            return ResponseEntity.ok(Map.of("success", true, "message", "동기화 스케줄이 완료되었습니다. (로그를 확인하세요)"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @Operation(summary = "축제 상세 조회", description = "축제 ID로 상세 정보를 조회합니다.")
    @GetMapping("/{festivalId}")
    public ResponseEntity<?> getFestivalDetail(@PathVariable Long festivalId) {
        return repository.findById(festivalId)
                .map(entity -> ResponseEntity.ok(Map.of("success", true, "data", entity)))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("success", false, "error", "Not Found")));
    }
}

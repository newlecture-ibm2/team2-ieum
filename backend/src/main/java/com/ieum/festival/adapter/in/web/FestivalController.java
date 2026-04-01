package com.ieum.festival.adapter.in.web;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository;
import com.ieum.festival.application.service.TourApiSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "축제", description = "축제 조회 / 검색 / 공공데이터 동기화")
@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class FestivalController {

    private final FestivalJpaRepository repository;
    private final TourApiSyncService syncService;

    @Operation(summary = "축제 목록 조회 (DB)", description = "DB에 저장된 축제 목록을 조회합니다. 1차 정렬(진행중 우선), 2차 정렬(최신순)")
    @GetMapping
    public ResponseEntity<?> getFestivals(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        // Pageable 시작은 0번 인덱스이므로 프론트에서 넘어오는 page가 1부터 시작하면 -1 처리
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page > 0 ? page - 1 : 0, size);
        
        // 프론트엔드에서 넘어오는 status 매핑 (전체는 null)
        String queryStatus = null;
        if (status != null && !status.isEmpty() && !status.equals("전체") && !status.equals("all")) {
            queryStatus = status.toLowerCase().contains("ongoing") ? "ONGOING" : "UPCOMING";
        }

        // DB 쿼리 실행 (진행중 우선, 최신순 정렬)
        org.springframework.data.domain.Page<FestivalEntity> festivalPage = repository.findFestivalsWithCustomOrder(queryStatus, pageable);
        
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

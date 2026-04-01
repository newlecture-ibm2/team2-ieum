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

    @Operation(summary = "축제 목록 조회 (DB)", description = "DB에 저장된 축제 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<?> getFestivals(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // 실제 운영 시 Pageable/QueryDSL로 구현
        List<FestivalEntity> list = repository.findAll();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        
        Map<String, Object> data = new HashMap<>();
        data.put("list", list);
        data.put("total", list.size());
        
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

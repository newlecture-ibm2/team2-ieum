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

    @Operation(summary = "축제 목록 조회 (날짜 기반 동적 필터링)", description = "status 파라미터에 따라 전체/진행예정/진행전 축제를 날짜 기반으로 필터링하여 조회합니다.\n"
            +
            "- 전체(all/미지정): 진행예정 → 진행전(가까운 순) → 종료(최근 순)\n" +
            "- 진행예정(ongoing): 오늘 날짜 기준 startDate ≤ 오늘 ≤ endDate\n" +
            "- 진행전(upcoming): startDate > 오늘, 시작일 가까운 순")
    @GetMapping
    public ResponseEntity<?> getFestivals(
            @Parameter(description = "필터 상태 (all, ongoing, upcoming)", example = "ongoing") @RequestParam(required = false) String status,
            @Parameter(description = "검색 키워드 (축제명, 지역명)", example = "벚꽃") @RequestParam(required = false) String keyword,
            @Parameter(description = "지역 코드 (1=서울, 31=경기 등)", example = "1") @RequestParam(required = false) String areaCode,
            @Parameter(description = "월별 필터 (1~12)", example = "5") @RequestParam(required = false) Integer month,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);

        // 빈 문자열은 null로 통일 (JPQL에서 :keyword IS NULL 조건 활용)
        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

        // 날짜 기반 동적 필터링 + 키워드 검색
        Page<FestivalEntity> festivalPage;

        if ("ongoing".equalsIgnoreCase(status)) {
            festivalPage = repository.findOngoingFestivals(searchKeyword, areaCode, month, pageable);
        } else if ("upcoming".equalsIgnoreCase(status)) {
            festivalPage = repository.findUpcomingFestivals(searchKeyword, areaCode, month, pageable);
        } else {
            festivalPage = repository.findAllWithDynamicOrder(searchKeyword, areaCode, month, pageable);
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

    @Operation(summary = "공공데이터 동기화 (수동 배치)", description = "한국관광공사 TourAPI를 호출하여 DB를 업데이트합니다. 기본값: 오늘 기준 2년 전")
    @PostMapping("/sync")
    public ResponseEntity<?> syncTourApi(
            @Parameter(description = "시작일 (YYYYMMDD, 미입력 시 2년 전)", example = "20240401") @RequestParam(required = false) String eventStartDate) {
        // 파라미터 미입력 시 오늘 기준 2년 전 날짜를 자동 계산
        if (eventStartDate == null || eventStartDate.isBlank()) {
            eventStartDate = java.time.LocalDate.now().minusYears(2)
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        }
        try {
            syncService.syncFestivals(eventStartDate);
            return ResponseEntity.ok(Map.of("success", true, "message", "동기화 스케줄이 완료되었습니다. (로그를 확인하세요)"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @Operation(summary = "축제 상세 조회", description = "축제 ID로 상세 정보를 조회합니다. (최초 1회 공공 API 연동 후 DB 자동 캐싱)")
    @GetMapping("/{festivalId}")
    public ResponseEntity<?> getFestivalDetail(@PathVariable Long festivalId) {
        return repository.findById(festivalId)
                .map(entity -> {
                    // 👉 핵심: Lazy Caching (지연 캐싱) 기법
                    // 공공 API에서 가져온 데이터인데 아직 DB에 상세 정보(overview)가 없다면, API 호출 후 DB에 저장!
                    if (entity.getSource() != null && entity.getSource().equals("API")
                            && entity.getOverview() == null) {
                        Map<String, Object> extraDetails = syncService.fetchFestivalDetail(entity.getSourceId());

                        entity.setOverview((String) extraDetails.get("overview"));
                        entity.setTel((String) extraDetails.get("tel"));
                        entity.setUseFee((String) extraDetails.get("fee"));

                        @SuppressWarnings("unchecked")
                        java.util.List<String> images = (java.util.List<String>) extraDetails.get("images");
                        if (images != null && !images.isEmpty()) {
                            entity.setExtraImages(String.join(",", images));
                        }

                        // DB 업데이트 (이후 요청부터는 이 조건을 패스하여 DB 값 반환)
                        repository.save(entity);
                    }

                    Map<String, Object> result = new HashMap<>();
                    result.put("id", entity.getId());
                    result.put("sourceId", entity.getSourceId());
                    result.put("title", entity.getTitle());
                    result.put("address", entity.getAddress());
                    result.put("imageUrl", entity.getImageUrl());
                    result.put("thumbnailUrl", entity.getThumbnailUrl());
                    result.put("startDate", entity.getStartDate());
                    result.put("endDate", entity.getEndDate());
                    result.put("status", entity.getStatus());

                    // DB에서 바로 제공 (또는 방금 막 캐싱된 데이터)
                    result.put("overview", entity.getOverview());
                    result.put("tel", entity.getTel());
                    result.put("fee", entity.getUseFee());

                    java.util.List<String> imgList = new java.util.ArrayList<>();
                    if (entity.getExtraImages() != null && !entity.getExtraImages().isEmpty()) {
                        imgList = java.util.Arrays.asList(entity.getExtraImages().split(","));
                    }
                    result.put("images", imgList);

                    return ResponseEntity.ok(Map.of("success", true, "data", result));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("success", false, "error", "Not Found")));
    }
}

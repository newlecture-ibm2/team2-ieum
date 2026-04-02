package com.ieum.admin.festival.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "[관리자] 축제 관리", description = "축제 목록 관리 / 공공데이터 API 동기화 / 상태 변경")
@RestController
@RequestMapping("/api/admin/festivals")
public class FestivalAdminController {

    private final com.ieum.admin.festival.application.service.FestivalAdminService festivalAdminService;
    private final com.ieum.admin.festival.application.service.FestivalSyncService festivalSyncService;
    private final com.ieum.festival.application.service.RegionOptionService regionOptionService;
    private final com.ieum.festival.application.service.CategoryOptionService categoryOptionService;

    public FestivalAdminController(
            com.ieum.admin.festival.application.service.FestivalAdminService festivalAdminService,
            com.ieum.admin.festival.application.service.FestivalSyncService festivalSyncService,
            com.ieum.festival.application.service.RegionOptionService regionOptionService,
            com.ieum.festival.application.service.CategoryOptionService categoryOptionService) {
        this.festivalAdminService = festivalAdminService;
        this.festivalSyncService = festivalSyncService;
        this.regionOptionService = regionOptionService;
        this.categoryOptionService = categoryOptionService;
    }

    @Operation(summary = "지역 옵션 분류 조회", description = "표준(공공API) 및 자체 기획 예외 옵션을 병합한 지역 목록 반환")
    @GetMapping("/regions/options")
    public ResponseEntity<com.ieum.global.response.ApiResponse<java.util.List<com.ieum.festival.application.dto.RegionOptionDto>>> getRegionOptions() {
        return ResponseEntity.ok(com.ieum.global.response.ApiResponse.success(regionOptionService.getMergedRegionOptions()));
    }

    @Operation(summary = "카테고리 옵션 분류 조회", description = "표준(공공API) 및 자체 기획 예외 카테고리 옵션을 병합한 목록 반환")
    @GetMapping("/categories/options")
    public ResponseEntity<com.ieum.global.response.ApiResponse<java.util.List<com.ieum.festival.application.dto.CategoryOptionDto>>> getCategoryOptions() {
        return ResponseEntity.ok(com.ieum.global.response.ApiResponse.success(categoryOptionService.getMergedCategoryOptions()));
    }

    @Operation(summary = "관리자용 축제 목록 조회", description = "관리자용 축제 목록을 조회합니다. source, sourceId 등 관리 필드를 포함합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요")
    })
    @GetMapping
    public ResponseEntity<?> getAdminFestivals(
            @Parameter(description = "데이터 출처 (API / MANUAL)")
            @RequestParam(required = false) String source,
            @Parameter(description = "축제 상태 (UPCOMING / ONGOING / ENDED)")
            @RequestParam(required = false) String status,
            @Parameter(description = "검색 키워드 (축제명 또는 지역)")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "페이지 번호", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        var result = festivalAdminService.getFestivals(page, size, keyword, status);
        return ResponseEntity.ok(com.ieum.global.response.ApiResponse.success(result));
    }

    @Operation(summary = "축제 데이터 동기화", description = "공공데이터포털 API에서 최신 축제 데이터를 가져와 DB에 동기화합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "동기화 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요"),
            @ApiResponse(responseCode = "409", description = "이미 동기화가 진행 중"),
            @ApiResponse(responseCode = "500", description = "외부 API 호출 실패")
    })
    @PostMapping("/sync")
    public ResponseEntity<?> syncFestivals() {
        var result = festivalSyncService.syncFestivalsFromTourApi();
        return ResponseEntity.ok(com.ieum.global.response.ApiResponse.success(result));
    }

    @Operation(summary = "축제 상태 수동 변경", description = "특정 축제의 노출/숨김 상태를 수동으로 변경합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "상태 변경 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요"),
            @ApiResponse(responseCode = "404", description = "축제를 찾을 수 없음")
    })
    @PatchMapping("/{festivalId}/visibility")
    public ResponseEntity<?> updateFestivalVisibility(
            @Parameter(description = "축제 ID", required = true, example = "1")
            @PathVariable Long festivalId,
            @RequestBody com.ieum.admin.festival.adapter.in.web.request.FestivalVisibilityRequest request
    ) {
        var result = festivalAdminService.updateVisibility(festivalId, request.isVisible());
        return ResponseEntity.ok(com.ieum.global.response.ApiResponse.success(result));
    }
}

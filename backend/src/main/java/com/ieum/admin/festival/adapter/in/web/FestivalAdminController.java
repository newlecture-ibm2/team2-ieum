package com.ieum.admin.festival.adapter.in.web;

import com.ieum.admin.festival.application.port.in.GetAdminFestivalListUseCase;
import com.ieum.admin.festival.application.port.in.*;
import com.ieum.admin.festival.application.port.in.UpdateFestivalVisibilityUseCase;
import com.ieum.admin.festival.application.service.CategoryOptionService;
import com.ieum.admin.festival.application.service.RegionOptionService;
import com.ieum.admin.festival.application.service.SigunguOptionService;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자용 공공 축제 관리 컨트롤러 (Input Adapter)
 * - 로직 없이 UseCase만 호출
 * - UseCase 인터페이스에 의존 (구현체를 직접 참조하지 않음)
 */
@Tag(name = "[관리자] 축제 관리", description = "축제 목록 관리 / 공공데이터 API 동기화 / 상태 변경")
@RestController
@RequestMapping("/api/admin/festivals")
@RequiredArgsConstructor
public class FestivalAdminController {

    private final GetAdminFestivalListUseCase getAdminFestivalListUseCase;
    private final SyncCategoryMasterUseCase syncCategoryMasterUseCase;
    private final SyncRegionMasterUseCase syncRegionMasterUseCase;
    private final SyncPublicFestivalUseCase syncPublicFestivalUseCase;
    private final SyncFestivalStatusUseCase syncFestivalStatusUseCase;
    private final OrchestrateFestivalSyncUseCase orchestrateFestivalSyncUseCase;
    private final UpdateFestivalVisibilityUseCase updateFestivalVisibilityUseCase;
    private final RegionOptionService regionOptionService;
    private final CategoryOptionService categoryOptionService;
    private final SigunguOptionService sigunguOptionService;

    @Operation(summary = "DB 픽스", description = "비활성화된 카테고리를 활성화합니다")
    @GetMapping("/fix-categories")
    public String fixCategories() {
        return "Fix is not implemented in controller, using direct JDBC";
    }

    @Operation(summary = "지역 옵션 분류 조회", description = "표준(공공API) 및 축제 등록 예외 옵션을 병합한 지역 목록 반환")
    @GetMapping("/regions/options")
    public ResponseEntity<ApiResponse<List<com.ieum.admin.festival.application.dto.RegionOptionDto>>> getRegionOptions() {
        return ResponseEntity.ok(ApiResponse.success(regionOptionService.getMergedRegionOptions()));
    }

    @Operation(summary = "시군구 옵션 조회", description = "지역 코드(areaCode)에 속하는 시군구 목록을 반환합니다.")
    @GetMapping("/regions/{areaCode}/sigungus")
    public ResponseEntity<ApiResponse<List<com.ieum.admin.festival.application.dto.RegionOptionDto>>> getSigunguOptions(@PathVariable String areaCode) {
        return ResponseEntity.ok(ApiResponse.success(sigunguOptionService.getSigungusByAreaCode(areaCode)));
    }

    @Operation(summary = "카테고리 옵션 분류 조회", description = "표준(공공API) 및 축제 등록 예외 카테고리 옵션을 병합한 목록 반환")
    @GetMapping("/categories/options")
    public ResponseEntity<ApiResponse<List<com.ieum.admin.festival.application.dto.CategoryOptionDto>>> getCategoryOptions() {
        return ResponseEntity.ok(ApiResponse.success(categoryOptionService.getMergedCategoryOptions()));
    }

    @Operation(summary = "관리자용 축제 목록 조회", description = "관리자용 축제 목록을 조회합니다. source, sourceId 등 관리 필드를 포함합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 필요")
    })
    @GetMapping
    public ResponseEntity<?> getAdminFestivals(
            @Parameter(description = "데이터 출처 (API / MANUAL)")
            @RequestParam(required = false) String source,
            @Parameter(description = "축제 상태 (UPCOMING / ONGOING / ENDED)")
            @RequestParam(required = false) String status,
            @Parameter(description = "검색 키워드 (축제명 또는 지역)")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "카테고리 코드")
            @RequestParam(required = false) String categoryCode,
            @Parameter(description = "지역 코드")
            @RequestParam(required = false) String areaCode,
            @Parameter(description = "페이지 번호", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        var result = getAdminFestivalListUseCase.getFestivals(page, size, keyword, status, categoryCode, areaCode);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "카테고리 마스터 동기화", description = "공공 API에서 카테고리를 동기화합니다.")
    @PostMapping("/sync/categories")
    public ResponseEntity<?> syncCategories() {
        return ResponseEntity.ok(ApiResponse.success(syncCategoryMasterUseCase.syncCategories()));
    }

    @Operation(summary = "지역 마스터 동기화", description = "공공 API에서 지역 및 시군구를 동기화합니다.")
    @PostMapping("/sync/regions")
    public ResponseEntity<?> syncRegions() {
        return ResponseEntity.ok(ApiResponse.success(syncRegionMasterUseCase.syncRegions()));
    }

    @Operation(summary = "공공 축제 데이터 동기화", description = "공공데이터포털에서 축제 정보만 부분 동기화합니다.")
    @PostMapping("/sync/public")
    public ResponseEntity<?> syncPublicFestivals() {
        return ResponseEntity.ok(ApiResponse.success(syncPublicFestivalUseCase.syncPublicFestivals()));
    }

    @Operation(summary = "축제 상태 동기화", description = "종료일 등을 기준으로 상태를 재계산합니다.")
    @PostMapping("/sync/status")
    public ResponseEntity<?> syncFestivalStatus() {
        return ResponseEntity.ok(ApiResponse.success(syncFestivalStatusUseCase.syncAllStatus()));
    }

    @Operation(summary = "공공데이터 전체 동기화", description = "카테고리 -> 지역 -> 공공축제 -> 상태 순차 동기화를 모두 진행합니다.")
    @PostMapping("/sync/all")
    public ResponseEntity<?> syncAll() {
        return ResponseEntity.ok(ApiResponse.success(orchestrateFestivalSyncUseCase.syncAllPublic()));
    }

    @Operation(summary = "축제 상태 수동 변경", description = "특정 축제의 노출/숨김 상태를 수동으로 변경합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "상태 변경 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 필요"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "축제를 찾을 수 없음")
    })
    @PatchMapping("/{festivalId}/visibility")
    public ResponseEntity<?> updateFestivalVisibility(
            @Parameter(description = "축제 ID", required = true, example = "1")
            @PathVariable Long festivalId,
            @RequestBody com.ieum.admin.festival.adapter.in.web.request.FestivalVisibilityRequest request
    ) {
        var result = updateFestivalVisibilityUseCase.updateVisibility(festivalId, request.isVisible());
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

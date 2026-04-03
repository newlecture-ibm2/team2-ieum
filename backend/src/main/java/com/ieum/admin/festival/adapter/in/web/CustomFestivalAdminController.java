package com.ieum.admin.festival.adapter.in.web;

import com.ieum.admin.festival.adapter.in.web.request.CustomFestivalRequest;
import com.ieum.admin.festival.application.result.CustomFestivalListResult;
import com.ieum.admin.festival.application.service.CustomFestivalAdminService;
import com.ieum.admin.festival.application.service.CustomFestivalStatusScheduler;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "[관리자] 축제 등록 관리", description = "관리자 전용 축제 등록 CRUD")
@RestController
@RequestMapping("/api/admin/festivals/custom")
@RequiredArgsConstructor
public class CustomFestivalAdminController {

    private final CustomFestivalAdminService customFestivalAdminService;
    private final CustomFestivalStatusScheduler customFestivalStatusScheduler;

    @Operation(summary = "축제 등록 목록 조회 (API_ADM_0040)")
    @GetMapping
    public ResponseEntity<ApiResponse<CustomFestivalListResult>> getCustomFestivals(
            @Parameter(description = "조회할 페이지 (기본값 1)")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지당 항목 수 (기본값 10)")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "축제명 검색 키워드")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "진행 상태 (UPCOMING/ONGOING/ENDED)")
            @RequestParam(required = false) String status,
            @Parameter(description = "카테고리 코드")
            @RequestParam(required = false) String categoryCode,
            @Parameter(description = "지역 코드")
            @RequestParam(required = false) String areaCode,
            @Parameter(description = "숨김 제외 여부")
            @RequestParam(required = false, defaultValue = "false") boolean excludeHidden
    ) {
        CustomFestivalListResult result = customFestivalAdminService.getCustomFestivals(page, size, keyword, status, categoryCode, areaCode, excludeHidden);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "축제 등록 신규 등록 (API_ADM_0041)")
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> createCustomFestival(
            @ModelAttribute CustomFestivalRequest request
    ) {
        Long festivalId = customFestivalAdminService.createCustomFestival(request);
        return ResponseEntity.status(201).body(ApiResponse.success(
                Map.of("status", "CREATED", "festivalId", festivalId)
        ));
    }

    @Operation(summary = "축제 등록 수정 (API_ADM_0042)")
    @PutMapping(value = "/{festivalId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCustomFestival(
            @PathVariable Long festivalId,
            @ModelAttribute CustomFestivalRequest request
    ) {
        customFestivalAdminService.updateCustomFestival(festivalId, request);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("status", "UPDATED", "festivalId", festivalId)
        ));
    }

    @Operation(summary = "축제 등록 삭제 (API_ADM_0043)")
    @DeleteMapping("/{festivalId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteCustomFestival(
            @PathVariable Long festivalId
    ) {
        customFestivalAdminService.deleteCustomFestival(festivalId);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("status", "DELETED")
        ));
    }

    @Operation(summary = "지역 마스터 및 축제 상태 동기화 (API_ADM_0044)")
    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncCustomFestivalData() {
        // 지역 마스터 주석 처리 (현재 파일 제외됨)
        customFestivalStatusScheduler.updateCustomFestivalStatuses();
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("status", "SYNC_COMPLETED")
        ));
    }
}

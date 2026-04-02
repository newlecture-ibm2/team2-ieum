package com.ieum.admin.festival.adapter.in.web;

import com.ieum.admin.festival.adapter.in.web.request.CustomFestivalRequest;
import com.ieum.admin.festival.application.result.CustomFestivalListResult;
import com.ieum.admin.festival.application.service.CustomFestivalAdminService;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "[관리자] 자체 기획 축제 관리", description = "관리자 전용 자체 기획 축제 CRUD")
@RestController
@RequestMapping("/api/admin/festivals/custom")
@RequiredArgsConstructor
public class CustomFestivalAdminController {

    private final CustomFestivalAdminService customFestivalAdminService;

    @Operation(summary = "자체 기획 축제 목록 조회 (API_ADM_0040)")
    @GetMapping
    public ResponseEntity<ApiResponse<CustomFestivalListResult>> getCustomFestivals(
            @Parameter(description = "조회할 페이지 (기본값 1)")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지당 항목 수 (기본값 10)")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "축제명 검색 키워드")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "진행 상태 (UPCOMING/ONGOING/ENDED)")
            @RequestParam(required = false) String status
    ) {
        CustomFestivalListResult result = customFestivalAdminService.getCustomFestivals(page, size, keyword, status);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "자체 기획 신규 등록 (API_ADM_0041)")
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> createCustomFestival(
            @ModelAttribute CustomFestivalRequest request
    ) {
        Long festivalId = customFestivalAdminService.createCustomFestival(request);
        return ResponseEntity.status(201).body(ApiResponse.success(
                Map.of("status", "CREATED", "festivalId", festivalId)
        ));
    }

    @Operation(summary = "자체 기획 수정 (API_ADM_0042)")
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

    @Operation(summary = "자체 기획 삭제 (API_ADM_0043)")
    @DeleteMapping("/{festivalId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteCustomFestival(
            @PathVariable Long festivalId
    ) {
        customFestivalAdminService.deleteCustomFestival(festivalId);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("status", "DELETED")
        ));
    }
}

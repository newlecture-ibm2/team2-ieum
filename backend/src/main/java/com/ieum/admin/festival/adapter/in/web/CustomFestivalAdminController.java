package com.ieum.admin.festival.adapter.in.web;

import com.ieum.admin.festival.adapter.in.web.request.CustomFestivalRequest;
import com.ieum.admin.festival.application.port.in.CreateCustomFestivalUseCase;
import com.ieum.admin.festival.application.port.in.DeleteCustomFestivalUseCase;
import com.ieum.admin.festival.application.port.in.GetCustomFestivalListUseCase;
import com.ieum.admin.festival.application.port.in.UpdateCustomFestivalUseCase;
import com.ieum.admin.festival.application.port.in.OrchestrateFestivalSyncUseCase;
import com.ieum.admin.festival.application.result.CustomFestivalListResult;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 관리자용 축제 관리 컨트롤러 (Input Adapter)
 * - 로직 없이 UseCase만 호출
 * - UseCase 인터페이스에 의존 (구현체를 직접 참조하지 않음)
 */
@Tag(name = "[관리자] 축제 관리", description = "관리자 전용 축제 관리")
@RestController
@RequestMapping("/api/admin/managedFestivals")
@RequiredArgsConstructor
public class CustomFestivalAdminController {

    private final GetCustomFestivalListUseCase getCustomFestivalListUseCase;
    private final CreateCustomFestivalUseCase createCustomFestivalUseCase;
    private final UpdateCustomFestivalUseCase updateCustomFestivalUseCase;
    private final DeleteCustomFestivalUseCase deleteCustomFestivalUseCase;
    private final OrchestrateFestivalSyncUseCase orchestrateFestivalSyncUseCase;

    @Operation(summary = "축제 관리 목록 조회 (API_ADM_0040)")
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
        CustomFestivalListResult result = getCustomFestivalListUseCase.getCustomFestivals(page, size, keyword, status, categoryCode, areaCode, excludeHidden);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "축제 관리 신규 등록 (API_ADM_0041)")
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> createCustomFestival(
            @ModelAttribute CustomFestivalRequest request
    ) {
        Long festivalId = createCustomFestivalUseCase.createCustomFestival(request);
        return ResponseEntity.status(201).body(ApiResponse.success(
                Map.of("status", "CREATED", "festivalId", festivalId)
        ));
    }

    @Operation(summary = "축제 관리 수정 (API_ADM_0042)")
    @PutMapping(value = "/{festivalId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCustomFestival(
            @PathVariable Long festivalId,
            @ModelAttribute CustomFestivalRequest request
    ) {
        updateCustomFestivalUseCase.updateCustomFestival(festivalId, request);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("status", "UPDATED", "festivalId", festivalId)
        ));
    }

    @Operation(summary = "축제 관리 삭제 (API_ADM_0043)")
    @DeleteMapping("/{festivalId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteCustomFestival(
            @PathVariable Long festivalId
    ) {
        deleteCustomFestivalUseCase.deleteCustomFestival(festivalId);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("status", "DELETED")
        ));
    }

    @Operation(summary = "지역 마스터 및 축제 상태 동기화", description = "카테고리 -> 지역 -> 상태 순차 동기화를 모두 진행합니다.")
    @PostMapping("/sync/all")
    public ResponseEntity<?> syncAllCustom() {
        return ResponseEntity.ok(ApiResponse.success(orchestrateFestivalSyncUseCase.syncAllCustom()));
    }
}

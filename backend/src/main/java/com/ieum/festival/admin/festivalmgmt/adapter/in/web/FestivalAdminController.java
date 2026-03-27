package com.ieum.festival.admin.festivalmgmt.adapter.in.web;

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
            @Parameter(description = "지역 코드")
            @RequestParam(required = false) String areaCode,
            @Parameter(description = "페이지 번호", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "관리자용 축제 목록"));
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
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "축제 데이터 동기화 성공"));
    }

    @Operation(summary = "축제 상태 수동 변경", description = "특정 축제의 상태를 수동으로 변경합니다. (UPCOMING / ONGOING / ENDED)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "상태 변경 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요"),
            @ApiResponse(responseCode = "404", description = "축제를 찾을 수 없음")
    })
    @PatchMapping("/{festivalId}/status")
    public ResponseEntity<?> updateFestivalStatus(
            @Parameter(description = "축제 ID", required = true, example = "1")
            @PathVariable Long festivalId,
            @RequestBody Map<String, String> request
    ) {
        // TODO: 구현 (request에 status 포함)
        return ResponseEntity.ok(Map.of("message", "축제 상태 변경 성공"));
    }
}

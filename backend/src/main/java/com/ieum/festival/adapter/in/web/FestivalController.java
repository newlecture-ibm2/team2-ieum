package com.ieum.festival.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "축제", description = "축제 조회 / 검색 / 지도 / 달력")
@RestController
@RequestMapping("/api/festivals")
public class FestivalController {

    @Operation(summary = "축제 목록 조회", description = "지역, 상태, 카테고리, 키워드로 필터링하여 축제 목록을 조회합니다. 비회원 이용 가능.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터")
    })
    @GetMapping
    public ResponseEntity<?> getFestivals(
            @Parameter(description = "지역 필터 (시/도)", example = "서울특별시")
            @RequestParam(required = false) String region,
            @Parameter(description = "축제 상태", example = "ONGOING")
            @RequestParam(required = false) String status,
            @Parameter(description = "카테고리", example = "음악")
            @RequestParam(required = false) String category,
            @Parameter(description = "검색 키워드")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "페이지 번호", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "축제 목록"));
    }

    @Operation(summary = "축제 상세 조회", description = "축제 ID로 상세 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "축제를 찾을 수 없음")
    })
    @GetMapping("/{festivalId}")
    public ResponseEntity<?> getFestivalDetail(
            @Parameter(description = "축제 ID", required = true, example = "1")
            @PathVariable Long festivalId
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "축제 상세"));
    }

    @Operation(summary = "축제 검색", description = "키워드, 시작일, 종료일로 축제를 검색합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "검색 성공")
    })
    @GetMapping("/search")
    public ResponseEntity<?> searchFestivals(
            @Parameter(description = "검색 키워드")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "시작일", example = "2026-04-01")
            @RequestParam(required = false) String startDate,
            @Parameter(description = "종료일", example = "2026-04-30")
            @RequestParam(required = false) String endDate
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "축제 검색 결과"));
    }

    @Operation(summary = "지도용 축제 조회", description = "지도에 표시할 축제 목록을 조회합니다. (위경도 포함)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/map")
    public ResponseEntity<?> getFestivalsForMap(
            @Parameter(description = "지역 필터")
            @RequestParam(required = false) String region,
            @Parameter(description = "축제 상태 필터")
            @RequestParam(required = false) String status
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "지도용 축제 목록"));
    }

    @Operation(summary = "달력용 축제 조회", description = "연/월 기준으로 달력에 표시할 축제를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/calendar")
    public ResponseEntity<?> getFestivalsForCalendar(
            @Parameter(description = "연도", example = "2026")
            @RequestParam int year,
            @Parameter(description = "월", example = "4")
            @RequestParam int month
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "달력용 축제 목록"));
    }
}

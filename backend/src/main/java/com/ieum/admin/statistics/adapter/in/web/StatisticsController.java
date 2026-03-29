package com.ieum.admin.statistics.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "[관리자] 통계", description = "축제 통계 / 사용자 통계 대시보드")
@RestController
@RequestMapping("/api/admin/stats")
public class StatisticsController {

    @Operation(summary = "축제 통계 조회", description = "지역별 축제 분포, 상태별 현황 등 축제 관련 통계를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요")
    })
    @GetMapping("/festivals")
    public ResponseEntity<?> getFestivalStats() {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "축제 통계"));
    }

    @Operation(summary = "사용자 통계 조회", description = "사용자 유입/활동(리뷰/게시글) 추이를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요")
    })
    @GetMapping("/users")
    public ResponseEntity<?> getUserStats() {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "사용자 통계"));
    }
}

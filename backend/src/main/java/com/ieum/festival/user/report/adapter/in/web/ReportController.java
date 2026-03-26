package com.ieum.festival.user.report.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "신고", description = "부적절한 콘텐츠 신고 접수")
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Operation(summary = "신고 접수", description = "부적절한 게시글/리뷰/댓글을 신고합니다. (회원 전용)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "신고 접수 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody Map<String, Object> request) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "신고 접수 성공"));
    }
}

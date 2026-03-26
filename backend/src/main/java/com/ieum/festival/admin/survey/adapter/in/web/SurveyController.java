package com.ieum.festival.admin.survey.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "[관리자] 설문 조사", description = "설문 생성 / 응답 제출 / 결과 조회")
@RestController
public class SurveyController {

    @Operation(summary = "설문 생성", description = "관리자가 새 설문을 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "생성 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요")
    })
    @PostMapping("/api/admin/surveys")
    public ResponseEntity<?> createSurvey(@RequestBody Map<String, Object> request) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "설문 생성 성공"));
    }

    @Operation(summary = "설문 응답 제출", description = "사용자가 설문에 응답합니다. (회원 전용)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "응답 제출 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "404", description = "설문을 찾을 수 없음")
    })
    @PostMapping("/api/surveys/{surveyId}/responses")
    public ResponseEntity<?> submitResponse(
            @Parameter(description = "설문 ID", required = true, example = "1")
            @PathVariable Long surveyId,
            @RequestBody Map<String, Object> request
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "설문 응답 제출 성공"));
    }

    @Operation(summary = "설문 결과 조회", description = "관리자가 설문 결과를 집계/조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요"),
            @ApiResponse(responseCode = "404", description = "설문을 찾을 수 없음")
    })
    @GetMapping("/api/admin/surveys/{surveyId}/results")
    public ResponseEntity<?> getSurveyResults(
            @Parameter(description = "설문 ID", required = true, example = "1")
            @PathVariable Long surveyId
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "설문 결과"));
    }
}

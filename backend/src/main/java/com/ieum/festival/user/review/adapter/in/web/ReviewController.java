package com.ieum.festival.user.review.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "리뷰", description = "축제 리뷰 작성 / 수정 / 삭제 / 조회")
@RestController
public class ReviewController {

    @Operation(summary = "리뷰 작성", description = "특정 축제에 리뷰를 작성합니다. (회원 전용)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "리뷰 작성 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "404", description = "축제를 찾을 수 없음")
    })
    @PostMapping("/api/festivals/{festivalId}/reviews")
    public ResponseEntity<?> createReview(
            @Parameter(description = "축제 ID", required = true, example = "1")
            @PathVariable Long festivalId,
            @RequestBody Map<String, Object> request
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "리뷰 작성 성공"));
    }

    @Operation(summary = "축제 리뷰 목록 조회", description = "특정 축제의 리뷰 목록을 조회합니다. 비회원 이용 가능.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/api/festivals/{festivalId}/reviews")
    public ResponseEntity<?> getReviews(
            @Parameter(description = "축제 ID", required = true, example = "1")
            @PathVariable Long festivalId,
            @Parameter(description = "페이지 번호", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "리뷰 목록"));
    }

    @Operation(summary = "리뷰 수정", description = "본인이 작성한 리뷰를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "권한 없음 (본인 리뷰만 수정 가능)"),
            @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
    })
    @PutMapping("/api/reviews/{reviewId}")
    public ResponseEntity<?> updateReview(
            @Parameter(description = "리뷰 ID", required = true, example = "1")
            @PathVariable Long reviewId,
            @RequestBody Map<String, Object> request
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "리뷰 수정 성공"));
    }

    @Operation(summary = "리뷰 삭제", description = "본인이 작성한 리뷰를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
    })
    @DeleteMapping("/api/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @Parameter(description = "리뷰 ID", required = true, example = "1")
            @PathVariable Long reviewId
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "리뷰 삭제 성공"));
    }
}

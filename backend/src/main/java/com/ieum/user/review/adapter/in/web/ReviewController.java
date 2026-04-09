package com.ieum.user.review.adapter.in.web;

import com.ieum.global.response.ApiResponse;
import com.ieum.user.review.adapter.in.web.dto.ReviewRequest;
import com.ieum.user.review.application.port.in.CreateReviewUseCase;
import com.ieum.user.review.application.port.in.DeleteReviewUseCase;
import com.ieum.user.review.application.port.in.GetReviewsUseCase;
import com.ieum.user.review.application.port.in.UpdateReviewUseCase;
import com.ieum.user.review.application.result.ReviewListResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
@Tag(name = "Review", description = "리뷰 API")
public class ReviewController {

    private final GetReviewsUseCase getReviewsUseCase;
    private final CreateReviewUseCase createReviewUseCase;
    private final UpdateReviewUseCase updateReviewUseCase;
    private final DeleteReviewUseCase deleteReviewUseCase;

    @Operation(summary = "리뷰 목록 조회", description = "특정 축제의 리뷰 목록을 페이징하여 조회합니다.")
    @GetMapping
    public ApiResponse<ReviewListResult> getReviews(
            @Parameter(description = "축제 ID", required = true) @RequestParam("festivalId") Long festivalId,
            @Parameter(description = "페이지 번호 (1-based)", example = "1") @RequestParam(value = "page", defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10") @RequestParam(value = "size", defaultValue = "10") int size,
            @Parameter(description = "정렬 기준 (latest, rating)", example = "latest") @RequestParam(value = "sort", defaultValue = "latest") String sort) {
        
        ReviewListResult result = getReviewsUseCase.getReviews(festivalId, page, size, sort);
        return ApiResponse.success(result);
    }

    @Operation(summary = "리뷰 작성", description = "특정 축제에 대한 리뷰를 작성합니다.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> createReview(@RequestBody ReviewRequest request, Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("로그인이 필요합니다."); // TODO: BusinessException으로 변경 필요
        }
        createReviewUseCase.createReview(request.getFestivalId(), principal.getName(), request.getRating(), request.getContent());
        return ApiResponse.success(null);
    }

    @Operation(summary = "리뷰 수정", description = "작성한 리뷰를 수정합니다.")
    @PutMapping("/{reviewId}")
    public ApiResponse<Void> updateReview(
            @PathVariable("reviewId") Long reviewId,
            @RequestBody ReviewRequest request,
            Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        updateReviewUseCase.updateReview(reviewId, principal.getName(), request.getRating(), request.getContent());
        return ApiResponse.success(null);
    }

    @Operation(summary = "리뷰 삭제", description = "작성한 리뷰를 삭제합니다.")
    @DeleteMapping("/{reviewId}")
    public ApiResponse<Void> deleteReview(
            @PathVariable("reviewId") Long reviewId,
            Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        deleteReviewUseCase.deleteReview(reviewId, principal.getName());
        return ApiResponse.success(null);
    }
}

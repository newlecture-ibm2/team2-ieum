package com.ieum.admin.inquiry.adapter.in.web;

import com.ieum.admin.inquiry.application.port.in.AnswerInquiryUseCase;
import com.ieum.admin.inquiry.application.port.in.GetInquiryListUseCase;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자용 문의 관리 컨트롤러 (Input Adapter)
 * - 로직 없이 UseCase만 호출
 */
@Tag(name = "[관리자] 문의 관리", description = "문의 목록 조회 / 상세 조회 / 답변 등록")
@RestController
@RequestMapping("/api/admin/inquiries")
@RequiredArgsConstructor
public class InquiryAdminController {

    private final GetInquiryListUseCase getInquiryListUseCase;
    private final AnswerInquiryUseCase answerInquiryUseCase;

    @Operation(summary = "문의 목록 조회", description = "관리자용 문의 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<?> getInquiries(
            @Parameter(description = "상태 (PENDING / ANSWERED)")
            @RequestParam(required = false, defaultValue = "") String status,
            @Parameter(description = "검색 기준 (ALL / TITLE / AUTHOR / CONTENT)")
            @RequestParam(required = false, defaultValue = "ALL") String searchType,
            @Parameter(description = "검색어")
            @RequestParam(required = false, defaultValue = "") String keyword,
            @Parameter(description = "페이지 번호", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        var result = getInquiryListUseCase.getInquiries(page, size, status, searchType, keyword);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "문의 상세 조회", description = "문의 단건을 상세 조회합니다.")
    @GetMapping("/{inquiryId}")
    public ResponseEntity<?> getInquiry(@PathVariable Long inquiryId) {
        try {
            var result = getInquiryListUseCase.getInquiry(inquiryId);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                            "INQUIRY_NOT_FOUND", 404,
                            "해당 문의를 찾을 수 없습니다.",
                            "inquiryId=" + inquiryId)));
        }
    }

    @Operation(summary = "문의 답변 등록", description = "문의에 대한 관리자 답변을 등록합니다.")
    @PostMapping("/{inquiryId}/answer")
    public ResponseEntity<?> answerInquiry(
            @PathVariable Long inquiryId,
            @Valid @RequestBody AnswerRequest request
    ) {
        try {
            answerInquiryUseCase.answerInquiry(inquiryId, request.getAnswer().trim());
            return ResponseEntity.ok(ApiResponse.success("답변이 등록되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                            "INQUIRY_NOT_FOUND", 404,
                            "해당 문의를 찾을 수 없습니다.",
                            "inquiryId=" + inquiryId)));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(ApiResponse.ErrorResponse.of(
                            "ALREADY_ANSWERED", 409,
                            "이미 답변이 등록된 문의입니다.",
                            "현재 상태: ANSWERED")));
        }
    }

    /* ── 답변 요청 DTO ── */
    @Getter
    @NoArgsConstructor
    static class AnswerRequest {
        @NotBlank(message = "답변 내용은 필수입니다.")
        @Size(min = 5, max = 2000, message = "답변은 5자 이상 2000자 이하로 작성해주세요.")
        private String answer;
    }
}

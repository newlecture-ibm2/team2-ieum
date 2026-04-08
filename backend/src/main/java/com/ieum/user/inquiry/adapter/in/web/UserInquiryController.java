package com.ieum.user.inquiry.adapter.in.web;

import com.ieum.admin.inquiry.domain.model.Inquiry;
import com.ieum.global.response.ApiResponse;
import com.ieum.user.inquiry.application.port.in.GetMyInquiriesUseCase;
import com.ieum.user.inquiry.application.port.in.RegisterInquiryUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * [Adapter] 사용자 1:1 문의 전용 웹 컨트롤러
 */
@Tag(name = "문의", description = "1:1 문의 등록 및 조회")
@RestController
@RequestMapping("/api/users/me/inquiries")
@RequiredArgsConstructor
public class UserInquiryController {

    private final RegisterInquiryUseCase registerInquiryUseCase;
    private final GetMyInquiriesUseCase getMyInquiriesUseCase;

    @Operation(summary = "내 1:1 문의 내역 조회", description = "로그인한 유저가 본인의 문의 내역을 조회합니다. (API_USR_0036)")
    @GetMapping
    public ApiResponse<Map<String, Object>> getMyInquiries() {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId;
        try {
            userId = Long.valueOf(userIdStr);
        } catch (NumberFormatException e) {
            // 관리자 계정 등이 문자열 식별자를 가질 경우 임시 ID(예: 0) 혹은 예외 처리
            userId = 0L; 
        }

        List<Inquiry> inquiries = getMyInquiriesUseCase.getMyInquiries(userId);

        return ApiResponse.success(Map.of(
                "inquiries", inquiries
        ));
    }

    @Operation(summary = "1:1 문의 등록", description = "사용자가 신규 문의를 등록합니다. (API_USR_0035)")
    @PostMapping
    public ApiResponse<Map<String, Object>> registerInquiry(@RequestBody Map<String, String> request) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId;
        
        try {
            userId = Long.valueOf(userIdStr);
        } catch (NumberFormatException e) {
            // 관리자 계정 식별자가 문자열일 경우 처리 (테스트 및 기능 지원을 위해 0L 할당 혹은 관리자용 매핑 필요)
            userId = 0L; 
        }
        
        RegisterInquiryUseCase.Command command = RegisterInquiryUseCase.Command.builder()
                .userId(userId)
                .title(request.get("title"))
                .content(request.get("content"))
                .type(request.get("type"))
                .build();

        Long inquiryId = registerInquiryUseCase.registerInquiry(command);
        
        return ApiResponse.success(Map.of(
                "success", true,
                "inquiryId", inquiryId
        ));
    }
}

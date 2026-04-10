package com.ieum.user.inquiry.adapter.in.web;

import com.ieum.user.inquiry.domain.model.UserInquiry;
import com.ieum.global.response.ApiResponse;
import com.ieum.global.security.CurrentUserId;
import com.ieum.user.inquiry.application.port.in.GetMyInquiriesUseCase;
import com.ieum.user.inquiry.application.port.in.RegisterInquiryUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
    public ApiResponse<Map<String, Object>> getMyInquiries(@CurrentUserId Long userId) {
        List<UserInquiry> inquiries = getMyInquiriesUseCase.getMyInquiries(userId);

        return ApiResponse.success(Map.of(
                "inquiries", inquiries
        ));
    }

    @Operation(summary = "1:1 문의 등록", description = "사용자가 신규 문의를 등록합니다. (API_USR_0035)")
    @PostMapping
    public ApiResponse<Map<String, Object>> registerInquiry(
            @CurrentUserId Long userId,
            @RequestBody Map<String, String> request) {
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

package com.ieum.user.mypage.adapter.in.web;

import com.ieum.global.response.ApiResponse;
import com.ieum.global.security.CurrentUserId;
import com.ieum.user.mypage.adapter.in.web.dto.MyPageReq;
import com.ieum.user.mypage.application.port.in.MyPageUseCase;
import com.ieum.user.mypage.application.result.ActivityPageResult;
import com.ieum.user.mypage.application.result.MyProfileResult;
import com.ieum.user.mypage.application.result.ProfileUpdateResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * [v18-3] 마이페이지 전용 웹 컨트롤러 (Festival 표준 사양)
 * - 모든 응답 ApiResponse<T> 통일
 * - Application Result 객체 활용으로 계층 간 결합도 최소화
 */
@Tag(name = "마이페이지", description = "내 활동 내역 조회 / 프로필 수정")
@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageUseCase myPageUseCase;

    @Operation(
            summary = "내 활동 내역 조회",
            description = "내가 작성한 게시글, 댓글, 리뷰, 문의, 신고 내역을 필터링하여 페이징 조회합니다.\n\n" +
                          "**[필터 유형 (type)]**\n" +
                          "- `posts`: 내가 쓴 게시글 목록\n" +
                          "- `reviews`: 내가 쓴 리뷰 목록\n" +
                          "- `comments`: 내가 쓴 댓글 목록\n" +
                          "- `inquiries`: 내 1:1 문의 내역\n" +
                          "- `reports`: 내 신고 내역"
    )
    @GetMapping("/activities")
    public ApiResponse<ActivityPageResult> getMyActivities(
            @CurrentUserId Long userId,
            @Parameter(description = "활동 유형 (posts/reviews/comments/inquiries/reports)", example = "posts")
            @RequestParam String type,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "6")
            @RequestParam(defaultValue = "6") int size
    ) {
        ActivityPageResult data = myPageUseCase.getMyActivities(userId, type, page, size);
        return ApiResponse.success(data);
    }

    @Operation(summary = "프로필 정보 수정 (JSON)", description = "닉네임 등의 정보를 JSON 형식으로 갱신합니다.")
    @PutMapping
    public ApiResponse<ProfileUpdateResult> updateProfile(
            @CurrentUserId Long userId,
            @RequestBody MyPageReq.UpdateProfile request
    ) {
        ProfileUpdateResult data = myPageUseCase.updateProfile(userId, request);
        return ApiResponse.success(data);
    }

    @Operation(summary = "프로필 이미지 단독 수정 (Base64)", description = "이미지를 Base64 문자열로 전송하여 즉시 갱신합니다. (API_USR_0011)")
    @PatchMapping(value = "/profile/image")
    public ApiResponse<ProfileUpdateResult> updateProfileImage(
            @CurrentUserId Long userId,
            @RequestBody MyPageReq.ProfileImageUpdate request
    ) {
        ProfileUpdateResult data = myPageUseCase.updateProfileImage(userId, request.getBase64Image());
        return ApiResponse.success(data);
    }

    @Operation(summary = "프로필 상세 정보 조회", description = "내 마이페이지 전용 프로필 데이터(닉네임, 사진 URL)를 조회합니다. (API_USR_0012)")
    @GetMapping("/profile")
    public ApiResponse<MyProfileResult> getMyProfile(@CurrentUserId Long userId) {
        MyProfileResult data = myPageUseCase.getMyProfile(userId);
        return ApiResponse.success(data);
    }

    @Operation(summary = "프로필 이미지 서빙", description = "서버 디스크의 실제 이미지 파일을 HTTP로 서빙합니다.")
    @GetMapping("/profile/view/{filename}")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String filename) {
        Resource resource = myPageUseCase.getProfileImage(filename);
        String contentType = "image/png";
        
        String lowerName = filename.toLowerCase();
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (lowerName.endsWith(".gif")) contentType = "image/gif";
        else if (lowerName.endsWith(".webp")) contentType = "image/webp";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}

package com.ieum.user.mypage.adapter.in.web;

import com.ieum.global.response.ApiResponse;
import com.ieum.user.mypage.adapter.in.web.dto.MyPageReq;
import com.ieum.user.mypage.adapter.in.web.dto.MyPageRes;
import com.ieum.user.mypage.application.port.in.MyPageUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 어댑터: 마이페이지 전용 웹 컨트롤러 (전달받은 요청을 유스케이스로 중계)
 */
@Tag(name = "마이페이지", description = "내 활동 내역 조회 / 프로필 수정")
@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageUseCase myPageUseCase;

    @Operation(summary = "내 활동 내역 조회", description = "내가 쓴 게시글, 댓글, 리뷰 등을 필터링하여 조회합니다.")
    @GetMapping("/activities/")
    public ResponseEntity<ApiResponse<MyPageRes.ActivityList>> getMyActivities(
            @Parameter(description = "활동 유형 (posts/reviews/comments)", example = "posts")
            @RequestParam String type,
            @Parameter(description = "페이지 번호", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        MyPageRes.ActivityList activities = myPageUseCase.getMyActivities(Long.valueOf(userIdStr), type, page, size);
        return ResponseEntity.ok(ApiResponse.success(activities));
    }

    @Operation(summary = "프로필 정보 수정", description = "닉네임 중복 체크 및 프로필 이미지를 업로드하여 정보를 갱신합니다.")
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MyPageRes.ProfileUpdate>> updateProfile(
            @RequestPart(value = "data", required = false) MyPageReq.UpdateProfile request,
            @RequestPart(value = "profileImg", required = false) MultipartFile profileImg
    ) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        MyPageRes.ProfileUpdate response = myPageUseCase.updateProfile(Long.valueOf(userIdStr), request, profileImg);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

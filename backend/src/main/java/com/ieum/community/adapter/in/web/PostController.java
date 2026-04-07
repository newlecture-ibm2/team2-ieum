package com.ieum.community.adapter.in.web;

import com.ieum.community.adapter.in.web.dto.CommentRequest;
import com.ieum.community.adapter.in.web.dto.CommentResponse;
import com.ieum.community.adapter.in.web.dto.PostRequest;
import com.ieum.community.adapter.in.web.dto.PostResponse;
import com.ieum.community.application.service.CommentService;
import com.ieum.community.application.service.PostService;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "커뮤니티", description = "게시글 CRUD / 댓글")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/community/posts")
public class PostController {

    private final PostService postService;
    private final CommentService commentService;

    /**
     * Authentication 객체에서 userId 추출
     * - 로그인 구현 완료 전까지는 임시로 1L 반환
     */
    private Long getUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        try {
            return Long.valueOf(auth.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String getUserName(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        
        Object details = auth.getDetails();
        if (details instanceof String) {
            return (String) details;
        }
        
        return "알 수 없음";
    }

    private boolean isAdmin(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // ──────── 게시글 CRUD ────────

    @Operation(summary = "게시글 작성", description = "커뮤니티 게시글을 작성합니다. (회원 전용)")
    @PostMapping
    public ApiResponse<PostResponse> createPost(
            @RequestBody PostRequest request,
            Authentication authentication) {
        PostResponse response = postService.createPost(request, getUserId(authentication), getUserName(authentication));
        return ApiResponse.success(response);
    }

    @Operation(summary = "게시글 목록 조회", description = "게시판 타입별 게시글 목록을 조회합니다. 비회원 이용 가능.")
    @GetMapping
    public ApiResponse<Page<PostResponse>> getPosts(
            @Parameter(description = "카테고리 (QNA, TIP, FOOD, REVIEW, COMPANION)")
            @RequestParam(required = false) String category,
            @Parameter(description = "지역 코드")
            @RequestParam(required = false) String areaCode,
            @Parameter(description = "검색 키워드")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "정렬 방식 (latest, popular)")
            @RequestParam(defaultValue = "latest") String sort,
            @Parameter(description = "페이지 번호")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기")
            @RequestParam(defaultValue = "10") int size) {

        Sort sortObj = sort.equals("popular")
                ? Sort.by(Sort.Direction.DESC, "viewCount")
                : Sort.by(Sort.Direction.DESC, "createdAt");
        Page<PostResponse> result = postService.getPosts(category, areaCode, keyword, PageRequest.of(page, size, sortObj));
        return ApiResponse.success(result);
    }

    @Operation(summary = "게시글 상세 조회", description = "게시글 ID로 상세 내용을 조회합니다.")
    @GetMapping("/{postId}")
    public ApiResponse<PostResponse> getPostDetail(
            @Parameter(description = "게시글 ID", required = true) @PathVariable Long postId) {
        PostResponse response = postService.getPostDetail(postId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "게시글 수정", description = "본인이 작성한 게시글을 수정합니다.")
    @PutMapping("/{postId}")
    public ApiResponse<PostResponse> updatePost(
            @Parameter(description = "게시글 ID", required = true) @PathVariable Long postId,
            @RequestBody PostRequest request,
            Authentication authentication) {
        PostResponse response = postService.updatePost(postId, request, getUserId(authentication), isAdmin(authentication));
        return ApiResponse.success(response);
    }

    @Operation(summary = "게시글 삭제", description = "본인이 작성한 게시글을 삭제합니다.")
    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(
            @Parameter(description = "게시글 ID", required = true) @PathVariable Long postId,
            Authentication authentication) {
        postService.deletePost(postId, getUserId(authentication), isAdmin(authentication));
        return ApiResponse.success();
    }

    // ──────── 댓글 ────────

    @Operation(summary = "댓글 목록 조회", description = "게시글의 댓글 목록을 트리 구조로 조회합니다.")
    @GetMapping("/{postId}/comments")
    public ApiResponse<List<CommentResponse>> getComments(
            @Parameter(description = "게시글 ID", required = true) @PathVariable Long postId) {
        List<CommentResponse> result = commentService.getCommentsByPostId(postId);
        return ApiResponse.success(result);
    }

    @Operation(summary = "댓글 작성", description = "게시글에 댓글을 작성합니다. (회원 전용)")
    @PostMapping("/{postId}/comments")
    public ApiResponse<CommentResponse> createComment(
            @Parameter(description = "게시글 ID", required = true) @PathVariable Long postId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        CommentResponse response = commentService.createComment(
                postId, request, getUserId(authentication), getUserName(authentication));
        return ApiResponse.success(response);
    }
}

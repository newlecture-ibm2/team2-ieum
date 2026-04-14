package com.ieum.community.adapter.in.web;

import com.ieum.community.adapter.in.web.dto.CommentRequest;
import com.ieum.community.adapter.in.web.dto.CommentResponse;
import com.ieum.community.application.port.in.DeleteCommentUseCase;
import com.ieum.community.application.port.in.UpdateCommentUseCase;
import com.ieum.community.domain.model.Comment;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "댓글", description = "댓글 수정 / 삭제")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/community/comments")
public class CommentController {

    private final UpdateCommentUseCase updateCommentUseCase;
    private final DeleteCommentUseCase deleteCommentUseCase;

    private Long getUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        try {
            return Long.valueOf(auth.getName());
        } catch (NumberFormatException e) {
            return -1L;
        }
    }

    private boolean isAdmin(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @Operation(summary = "댓글 수정", description = "본인이 작성한 댓글을 수정합니다.")
    @PutMapping("/{commentId}")
    public ApiResponse<CommentResponse> updateComment(
            @Parameter(description = "댓글 ID", required = true, example = "1") @PathVariable Long commentId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        Comment comment = updateCommentUseCase.updateComment(
                commentId, request.getContent(), getUserId(authentication), isAdmin(authentication));
        return ApiResponse.success(CommentResponse.fromDomain(comment));
    }

    @Operation(summary = "댓글 삭제", description = "본인이 작성한 댓글을 삭제합니다. (소프트 삭제)")
    @DeleteMapping("/{commentId}")
    public ApiResponse<Void> deleteComment(
            @Parameter(description = "댓글 ID", required = true, example = "1") @PathVariable Long commentId,
            Authentication authentication) {
        deleteCommentUseCase.deleteComment(commentId, getUserId(authentication), isAdmin(authentication));
        return ApiResponse.success();
    }
}

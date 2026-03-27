package com.ieum.festival.user.community.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "커뮤니티", description = "게시글 CRUD / 댓글")
@RestController
@RequestMapping("/api/community/posts")
public class PostController {

    @Operation(summary = "게시글 작성", description = "커뮤니티 게시글을 작성합니다. (회원 전용)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "작성 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Map<String, Object> request) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "게시글 작성 성공"));
    }

    @Operation(summary = "게시글 목록 조회", description = "게시판 타입별 게시글 목록을 조회합니다. 비회원 이용 가능.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping
    public ResponseEntity<?> getPosts(
            @Parameter(description = "게시판 타입 (QNA, TIP, FOOD)", example = "QNA")
            @RequestParam(required = false) String boardType,
            @Parameter(description = "페이지 번호", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "검색 키워드")
            @RequestParam(required = false) String keyword
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "게시글 목록"));
    }

    @Operation(summary = "게시글 상세 조회", description = "게시글 ID로 상세 내용을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
    })
    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostDetail(
            @Parameter(description = "게시글 ID", required = true, example = "1")
            @PathVariable Long postId
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "게시글 상세"));
    }

    @Operation(summary = "게시글 수정", description = "본인이 작성한 게시글을 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @Parameter(description = "게시글 ID", required = true, example = "1")
            @PathVariable Long postId,
            @RequestBody Map<String, Object> request
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "게시글 수정 성공"));
    }

    @Operation(summary = "게시글 삭제", description = "본인이 작성한 게시글을 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
            @Parameter(description = "게시글 ID", required = true, example = "1")
            @PathVariable Long postId
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "게시글 삭제 성공"));
    }

    @Operation(summary = "댓글 작성", description = "게시글에 댓글을 작성합니다. (회원 전용)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "댓글 작성 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
    })
    @PostMapping("/{postId}/comments")
    public ResponseEntity<?> createComment(
            @Parameter(description = "게시글 ID", required = true, example = "1")
            @PathVariable Long postId,
            @RequestBody Map<String, String> request
    ) {
        // TODO: 구현
        return ResponseEntity.ok(Map.of("message", "댓글 작성 성공"));
    }
}

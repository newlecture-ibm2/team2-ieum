package com.ieum.user.favorite.adapter.in.web;

import com.ieum.global.response.ApiResponse;
import com.ieum.user.favorite.application.port.in.CheckFavoriteUseCase;
import com.ieum.user.favorite.application.port.in.GetFavoritesUseCase;
import com.ieum.user.favorite.application.port.in.ToggleFavoriteUseCase;
import com.ieum.user.favorite.application.result.FavoriteListResult;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "찜", description = "즐겨찾기(찜) 관련 API")
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final ToggleFavoriteUseCase toggleFavoriteUseCase;
    private final GetFavoritesUseCase getFavoritesUseCase;
    private final CheckFavoriteUseCase checkFavoriteUseCase;

    @Operation(summary = "찜 목록 조회", description = "내가 찜한 축제 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<FavoriteListResult>> getFavorites(
            @AuthenticationPrincipal String loginId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        FavoriteListResult result = getFavoritesUseCase.getFavorites(loginId, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // 축제 메인페이지용
    @Operation(summary = "찜 추가/삭제 토글", description = "축제를 찜 목록에 추가하거나 이미 있다면 삭제합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> toggleFavorite(
            @AuthenticationPrincipal String loginId,
            @RequestBody Map<String, Long> request) {
        Long festivalId = request.get("festivalId");
        toggleFavoriteUseCase.execute(loginId, festivalId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    // 축제 마이페이지용
    @Operation(summary = "찜 삭제", description = "찜 목록에서 축제를 삭제합니다.")
    @DeleteMapping("/{festivalId}")
    public ResponseEntity<ApiResponse<Void>> deleteFavorite(
            @AuthenticationPrincipal String loginId,
            @Parameter(description = "축제 ID", required = true) @PathVariable Long festivalId) {
        if (checkFavoriteUseCase.checkFavorite(loginId, festivalId)) {
            toggleFavoriteUseCase.execute(loginId, festivalId);
        }
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "찜 여부 확인", description = "해당 축제를 이미 찜했는지 단건 조회합니다.")
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkFavorite(
            @AuthenticationPrincipal(expression = "null") String loginId,
            @RequestParam Long festivalId) {
        boolean isFavorite = checkFavoriteUseCase.checkFavorite(loginId, festivalId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isFavorite", isFavorite)));
    }
}

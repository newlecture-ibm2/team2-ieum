package com.ieum.user.favorite.adapter.in.web;

import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "찜", description = "즐겨찾기(찜) 관련 API")
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    @Operation(summary = "찜 목록 조회", description = "내가 찜한 축제 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getFavorites() {
        // TODO: Favorite 관련 서비스 연동 예정
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "찜 추가", description = "축제를 찜 목록에 추가합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<Object>> addFavorite(@RequestBody Object request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(null));
    }

    @Operation(summary = "찜 삭제", description = "찜 목록에서 축제를 삭제합니다.")
    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<ApiResponse<Void>> deleteFavorite(
            @Parameter(description = "즐겨찾기 ID", required = true, example = "1")
            @PathVariable Long favoriteId
    ) {
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "찜 여부 확인", description = "해당 축제를 이미 찜했는지 확인합니다.")
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Object>> checkFavorite(@RequestParam Long festivalId) {
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

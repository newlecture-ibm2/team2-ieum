package com.ieum.user.favorite.application.result;

import com.ieum.user.favorite.domain.model.Favorite;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 즐겨찾기 목록 조회 결과
 */
@Getter
@AllArgsConstructor
public class FavoriteListResult {

    private final List<FavoriteItem> content;
    private final int totalPages;
    private final long totalElements;

    @Getter
    @AllArgsConstructor
    public static class FavoriteItem {
        private final Long id;
        private final Long festivalId;
        private final String title;
        private final String address;
        private final String imageUrl;
        private final String startDate;
        private final String endDate;
        private final String status;
        private final LocalDateTime createdAt;

        public static FavoriteItem from(Favorite favorite) {
            return new FavoriteItem(
                    favorite.getId(),
                    favorite.getFestivalId(),
                    favorite.getFestivalTitle(),
                    favorite.getFestivalAddress(),
                    favorite.getFestivalImageUrl(),
                    favorite.getFestivalStartDate(),
                    favorite.getFestivalEndDate(),
                    favorite.getFestivalStatus(),
                    favorite.getCreatedAt()
            );
        }
    }
}

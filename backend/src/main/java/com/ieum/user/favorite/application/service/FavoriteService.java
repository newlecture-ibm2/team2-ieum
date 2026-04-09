package com.ieum.user.favorite.application.service;

import com.ieum.user.favorite.application.port.in.CheckFavoriteUseCase;
import com.ieum.user.favorite.application.port.in.GetFavoritesUseCase;
import com.ieum.user.favorite.application.port.in.ToggleFavoriteUseCase;
import com.ieum.user.favorite.application.port.out.FavoritePersistencePort;
import com.ieum.user.favorite.application.port.out.LoadFavoriteUserPort;
import com.ieum.user.favorite.application.port.out.UpdateFavoriteFestivalStatsPort;
import com.ieum.user.favorite.application.result.FavoriteListResult;
import com.ieum.user.favorite.domain.model.Favorite;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService implements ToggleFavoriteUseCase, GetFavoritesUseCase, CheckFavoriteUseCase {

    private final FavoritePersistencePort favoritePersistencePort;
    private final LoadFavoriteUserPort loadFavoriteUserPort;
    private final UpdateFavoriteFestivalStatsPort updateFavoriteFestivalStatsPort;

    @Override
    @Transactional
    public void execute(String loginId, Long festivalId) {
        Long userId = loadFavoriteUserPort.resolveUserId(loginId);

        if (favoritePersistencePort.existsByUserIdAndFestivalId(userId, festivalId)) {
            // 이미 찜한 상태라면 삭제 (토글 오프)
            favoritePersistencePort.deleteByUserIdAndFestivalId(userId, festivalId);
            updateFavoriteFestivalStatsPort.decrementFavoriteCount(festivalId);
        } else {
            // 찜하지 않은 상태라면 추가 (토글 온)
            Favorite favorite = Favorite.create(userId, festivalId);
            favoritePersistencePort.save(favorite);
            updateFavoriteFestivalStatsPort.incrementFavoriteCount(festivalId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public FavoriteListResult getFavorites(String loginId, int page, int size) {
        Long userId = loadFavoriteUserPort.resolveUserId(loginId);
        
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);
        Page<Favorite> favoritePage = favoritePersistencePort.findFavoritesByUserId(userId, pageable);

        List<FavoriteListResult.FavoriteItem> items = favoritePage.getContent().stream()
                .map(FavoriteListResult.FavoriteItem::from)
                .collect(Collectors.toList());

        return new FavoriteListResult(items, favoritePage.getTotalPages(), favoritePage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkFavorite(String loginId, Long festivalId) {
        if (loginId == null) {
            return false;
        }
        Long userId = loadFavoriteUserPort.resolveUserId(loginId);
        return favoritePersistencePort.existsByUserIdAndFestivalId(userId, festivalId);
    }
}

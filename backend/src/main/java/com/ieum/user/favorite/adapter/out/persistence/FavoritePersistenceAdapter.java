package com.ieum.user.favorite.adapter.out.persistence;

import com.ieum.user.favorite.adapter.out.persistence.entity.FavoriteEntity;
import com.ieum.user.favorite.adapter.out.persistence.repository.FavoriteJpaRepository;
import com.ieum.user.favorite.application.port.out.FavoritePersistencePort;
import com.ieum.user.favorite.domain.model.Favorite;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FavoritePersistenceAdapter implements FavoritePersistencePort {

    private final FavoriteJpaRepository repository;

    @Override
    public Favorite save(Favorite favorite) {
        FavoriteEntity entity = FavoriteEntity.builder()
                .userId(favorite.getUserId())
                .festivalId(favorite.getFestivalId())
                .build();
        
        FavoriteEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Favorite> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Favorite> findByUserIdAndFestivalId(Long userId, Long festivalId) {
        return repository.findByUserIdAndFestivalId(userId, festivalId).map(this::toDomain);
    }

    @Override
    public void deleteByUserIdAndFestivalId(Long userId, Long festivalId) {
        repository.deleteByUserIdAndFestivalId(userId, festivalId);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public boolean existsByUserIdAndFestivalId(Long userId, Long festivalId) {
        return repository.existsByUserIdAndFestivalId(userId, festivalId);
    }

    @Override
    public Page<Favorite> findFavoritesByUserId(Long userId, Pageable pageable) {
        return repository.findFavoritesWithFestivalInfo(userId, pageable)
                .map(row -> Favorite.reconstituteWithFestival(
                        toLong(row.get("id")),
                        toLong(row.get("userId")),
                        toLong(row.get("festivalId")),
                        (java.time.LocalDateTime) row.get("createdAt"),
                        (String) row.get("festivalTitle"),
                        (String) row.get("festivalAddress"),
                        (String) row.get("festivalImageUrl"),
                        (String) row.get("festivalStartDate"),
                        (String) row.get("festivalEndDate"),
                        (String) row.get("festivalStatus")
                ));
    }

    @Override
    public long countByUserId(Long userId) {
        return repository.countByUserId(userId);
    }

    // ── Entity → Domain 매핑 ──

    private Favorite toDomain(FavoriteEntity entity) {
        return Favorite.reconstitute(
                entity.getId(),
                entity.getUserId(),
                entity.getFestivalId(),
                entity.getCreatedAt()
        );
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        return Long.valueOf(value.toString());
    }
}

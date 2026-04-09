package com.ieum.user.favorite.adapter.out.persistence.repository;

import com.ieum.user.favorite.adapter.out.persistence.entity.FavoriteEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Map;
import java.util.Optional;

public interface FavoriteJpaRepository extends JpaRepository<FavoriteEntity, Long> {

    Optional<FavoriteEntity> findByUserIdAndFestivalId(Long userId, Long festivalId);

    void deleteByUserIdAndFestivalId(Long userId, Long festivalId);

    boolean existsByUserIdAndFestivalId(Long userId, Long festivalId);

    long countByUserId(Long userId);

    @Query("SELECT new map(" +
           "fav.id as id, " +
           "fav.festivalId as festivalId, " +
           "fav.userId as userId, " +
           "fav.createdAt as createdAt, " +
           "f.title as festivalTitle, " +
           "f.address as festivalAddress, " +
           "COALESCE(f.thumbnailUrl, f.imageUrl) as festivalImageUrl, " +
           "CAST(f.startDate as string) as festivalStartDate, " +
           "CAST(f.endDate as string) as festivalEndDate, " +
           "f.status as festivalStatus" +
           ") " +
           "FROM FavoriteEntity fav " +
           "JOIN FestivalEntity f ON fav.festivalId = f.id " +
           "WHERE fav.userId = :userId " +
           "ORDER BY fav.createdAt DESC")
    Page<Map<String, Object>> findFavoritesWithFestivalInfo(@Param("userId") Long userId, Pageable pageable);
}

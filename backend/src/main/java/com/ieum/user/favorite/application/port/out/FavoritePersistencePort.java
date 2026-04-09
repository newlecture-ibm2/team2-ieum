package com.ieum.user.favorite.application.port.out;

import com.ieum.user.favorite.domain.model.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface FavoritePersistencePort {

    Favorite save(Favorite favorite);
    
    Optional<Favorite> findById(Long id);
    
    Optional<Favorite> findByUserIdAndFestivalId(Long userId, Long festivalId);

    void deleteByUserIdAndFestivalId(Long userId, Long festivalId);
    
    void deleteById(Long id);

    boolean existsByUserIdAndFestivalId(Long userId, Long festivalId);

    Page<Favorite> findFavoritesByUserId(Long userId, Pageable pageable);
    
    long countByUserId(Long userId);
}

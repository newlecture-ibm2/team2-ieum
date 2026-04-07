package com.ieum.festival.adapter.out.persistence;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository;
import com.ieum.festival.application.port.out.FestivalPersistencePort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 축제 영속성 어댑터 (Output Adapter)
 * - JPA Repository를 감싸서 Port OUT 구현
 */
@Component
@RequiredArgsConstructor
public class FestivalPersistenceAdapter implements FestivalPersistencePort {

    private final FestivalJpaRepository repository;

    @Override
    public Page<FestivalEntity> findAllWithDynamicOrder(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findAllWithDynamicOrder(keyword, areaCode, month, pageable);
    }

    @Override
    public Page<FestivalEntity> findOngoingFestivals(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findOngoingFestivals(keyword, areaCode, month, pageable);
    }

    @Override
    public Page<FestivalEntity> findUpcomingFestivals(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findUpcomingFestivals(keyword, areaCode, month, pageable);
    }

    @Override
    public Page<FestivalEntity> findEndedFestivals(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findEndedFestivals(keyword, areaCode, month, pageable);
    }

    @Override
    public Page<FestivalEntity> findByPopularity(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findByPopularity(keyword, areaCode, month, pageable);
    }

    @Override
    public Page<FestivalEntity> findByViews(String keyword, String areaCode, Integer month, Pageable pageable) {
        return repository.findByViews(keyword, areaCode, month, pageable);
    }

    @Override
    public Page<FestivalEntity> findByDistance(String keyword, String areaCode, Integer month, Double lat, Double lng, Pageable pageable) {
        return repository.findByDistance(keyword, areaCode, month, lat, lng, pageable);
    }

    @Override
    public Optional<FestivalEntity> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public FestivalEntity save(FestivalEntity entity) {
        return repository.save(entity);
    }
}

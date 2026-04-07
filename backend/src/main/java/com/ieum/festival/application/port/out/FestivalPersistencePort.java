package com.ieum.festival.application.port.out;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 축제 영속성 포트 (Port OUT)
 * - 서비스 레이어가 Repository가 아닌 이 포트에 의존
 */
public interface FestivalPersistencePort {

    Page<FestivalEntity> findAllWithDynamicOrder(String keyword, String areaCode, Integer month, Pageable pageable);

    Page<FestivalEntity> findOngoingFestivals(String keyword, String areaCode, Integer month, Pageable pageable);

    Page<FestivalEntity> findUpcomingFestivals(String keyword, String areaCode, Integer month, Pageable pageable);

    Page<FestivalEntity> findEndedFestivals(String keyword, String areaCode, Integer month, Pageable pageable);

    Optional<FestivalEntity> findById(Long id);

    FestivalEntity save(FestivalEntity entity);
}

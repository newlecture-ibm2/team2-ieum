package com.ieum.festival.application.port.out;

import com.ieum.festival.domain.model.Festival;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 축제 영속성 포트 (Port OUT)
 */
public interface FestivalPersistencePort {

    Page<Festival> findAllWithDynamicOrder(String keyword, String areaCode, Integer month, Pageable pageable);
    Page<Festival> findOngoingFestivals(String keyword, String areaCode, Integer month, Pageable pageable);
    Page<Festival> findUpcomingFestivals(String keyword, String areaCode, Integer month, Pageable pageable);
    Page<Festival> findEndedFestivals(String keyword, String areaCode, Integer month, Pageable pageable);
    Optional<Festival> findById(Long id);
    Festival save(Festival festival);
}

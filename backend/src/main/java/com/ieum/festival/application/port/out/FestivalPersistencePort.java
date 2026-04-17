package com.ieum.festival.application.port.out;

import com.ieum.festival.domain.model.Festival;
import com.ieum.global.common.PagedResult;

import java.util.List;
import java.util.Optional;

/**
 * 축제 영속성 포트 (Port OUT)
 * - 프레임워크 독립적: Spring Data 타입(Page, Pageable) 미사용
 * - Adapter 계층에서 구현
 */
public interface FestivalPersistencePort {

    // ── 목록 조회 (페이징) ──

    PagedResult<Festival> findAllWithDynamicOrder(String keyword, List<String> areaCodes, List<Integer> months, int page, int size);
    PagedResult<Festival> findOngoingFestivals(String keyword, List<String> areaCodes, List<Integer> months, int page, int size);
    PagedResult<Festival> findUpcomingFestivals(String keyword, List<String> areaCodes, List<Integer> months, int page, int size);
    PagedResult<Festival> findEndedFestivals(String keyword, List<String> areaCodes, List<Integer> months, int page, int size);

    // ── 단건 조회 ──

    Optional<Festival> findById(Long id);
    Optional<Festival> findBySourceId(String sourceId);

<<<<<<< HEAD
    Page<FestivalEntity> findByPopularity(String keyword, String areaCode, Integer month, Pageable pageable);

    Page<FestivalEntity> findByViews(String keyword, String areaCode, Integer month, Pageable pageable);

    Page<FestivalEntity> findByDistance(String keyword, String areaCode, Integer month, Double lat, Double lng, Pageable pageable);

    Optional<FestivalEntity> findById(Long id);
=======
    // ── 전체 조회 (배치용) ──
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97

    List<Festival> findAll();

    // ── 저장 ──

    Festival save(Festival festival);
    void saveAll(List<Festival> festivals);
}

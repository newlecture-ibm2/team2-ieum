package com.ieum.admin.festival.application.port.out;

import com.ieum.admin.festival.domain.model.Festival;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 관리자용 축제 영속성 출력 포트
 * - Service(application)가 이 인터페이스에 의존
 * - PersistenceAdapter(adapter/out)가 이 인터페이스를 구현
 */
public interface AdminFestivalPort {

    // ── 공공 축제 (isCustom = false) ──

    Page<Festival> searchPublicFestivals(String keyword, String status, List<String> targetCategories, String areaCode, Pageable pageable);

    int countPublicFestivals();

    int countPublicFestivalsByStatus(String status);

    Optional<LocalDateTime> findMaxApiModifiedAt();

    // ── 축제 관리 (isCustom = true) ──

    Page<Festival> searchCustomFestivals(String keyword, String status, List<String> targetCategories, String areaCode, Pageable pageable);

    Page<Festival> searchVisibleCustomFestivals(String keyword, String status, List<String> targetCategories, String areaCode, Pageable pageable);

    int countCustomFestivals();

    int countCustomFestivalsByStatus(String status);

    int countVisibleCustomFestivals();

    int countVisibleCustomFestivalsByStatus(String status);

    // ── 공통 CRUD ──

    Optional<Festival> findById(Long id);

    Optional<Festival> findBySourceId(String sourceId);

    Festival save(Festival festival);

    List<Festival> saveAll(List<Festival> festivals);

    void deleteById(Long id);

    List<Festival> findAllPublicFestivals();

    List<Festival> findAll();
}

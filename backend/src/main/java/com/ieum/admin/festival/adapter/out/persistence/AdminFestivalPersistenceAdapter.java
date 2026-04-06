package com.ieum.admin.festival.adapter.out.persistence;

import com.ieum.admin.festival.adapter.out.persistence.entity.AdminFestivalEntity;
import com.ieum.admin.festival.application.port.out.AdminFestivalPort;
import com.ieum.admin.festival.domain.model.Festival;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 관리자용 축제 영속성 어댑터
 * - AdminFestivalPort 구현체
 * - Entity ↔ Domain 변환을 이 레이어에서만 수행
 * - JPA Repository를 내부적으로 사용
 */
@Component
@RequiredArgsConstructor
public class AdminFestivalPersistenceAdapter implements AdminFestivalPort {

    private final AdminFestivalRepository adminFestivalRepository;

    // ── 공공 축제 (isCustom = false) ──

    @Override
    public Page<Festival> searchPublicFestivals(String keyword, String status, List<String> targetCategories, String areaCode, Pageable pageable) {
        return adminFestivalRepository.searchAdminFestivals(keyword, status, targetCategories, areaCode, pageable)
                .map(AdminFestivalEntity::toDomain);
    }

    @Override
    public int countPublicFestivals() {
        return adminFestivalRepository.countPublicFestivals();
    }

    @Override
    public int countPublicFestivalsByStatus(String status) {
        return adminFestivalRepository.countPublicFestivalsByStatus(status);
    }

    @Override
    public Optional<LocalDateTime> findMaxApiModifiedAt() {
        return adminFestivalRepository.findMaxApiModifiedAt();
    }

    // ── 축제 등록 (isCustom = true) ──

    @Override
    public Page<Festival> searchCustomFestivals(String keyword, String status, List<String> targetCategories, String areaCode, Pageable pageable) {
        return adminFestivalRepository.searchCustomFestivals(keyword, status, targetCategories, areaCode, pageable)
                .map(AdminFestivalEntity::toDomain);
    }

    @Override
    public Page<Festival> searchVisibleCustomFestivals(String keyword, String status, List<String> targetCategories, String areaCode, Pageable pageable) {
        return adminFestivalRepository.searchVisibleCustomFestivals(keyword, status, targetCategories, areaCode, pageable)
                .map(AdminFestivalEntity::toDomain);
    }

    @Override
    public int countCustomFestivals() {
        return adminFestivalRepository.countCustomFestivals();
    }

    @Override
    public int countCustomFestivalsByStatus(String status) {
        return adminFestivalRepository.countCustomFestivalsByStatus(status);
    }

    @Override
    public int countVisibleCustomFestivals() {
        return adminFestivalRepository.countVisibleCustomFestivals();
    }

    @Override
    public int countVisibleCustomFestivalsByStatus(String status) {
        return adminFestivalRepository.countVisibleCustomFestivalsByStatus(status);
    }

    // ── 공통 CRUD ──

    @Override
    public Optional<Festival> findById(Long id) {
        return adminFestivalRepository.findById(id)
                .map(AdminFestivalEntity::toDomain);
    }

    @Override
    public Optional<Festival> findBySourceId(String sourceId) {
        return adminFestivalRepository.findBySourceId(sourceId)
                .map(AdminFestivalEntity::toDomain);
    }

    @Override
    public Festival save(Festival festival) {
        AdminFestivalEntity entity = AdminFestivalEntity.fromDomain(festival);
        return adminFestivalRepository.save(entity).toDomain();
    }

    @Override
    public List<Festival> saveAll(List<Festival> festivals) {
        List<AdminFestivalEntity> entities = festivals.stream()
                .map(AdminFestivalEntity::fromDomain)
                .collect(Collectors.toList());
        return adminFestivalRepository.saveAll(entities).stream()
                .map(AdminFestivalEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        adminFestivalRepository.deleteById(id);
    }

    @Override
    public List<Festival> findAll() {
        return adminFestivalRepository.findAll().stream()
                .map(AdminFestivalEntity::toDomain)
                .collect(Collectors.toList());
    }
    @Override
    public List<Festival> findAllPublicFestivals() {
        return adminFestivalRepository.findByIsCustomFalse().stream()
                .map(AdminFestivalEntity::toDomain)
                .collect(Collectors.toList());
    }
}

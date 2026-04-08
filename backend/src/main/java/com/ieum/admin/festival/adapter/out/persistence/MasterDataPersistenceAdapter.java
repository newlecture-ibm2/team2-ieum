package com.ieum.admin.festival.adapter.out.persistence;

import com.ieum.admin.festival.adapter.out.persistence.entity.CategoryMasterEntity;
import com.ieum.admin.festival.adapter.out.persistence.entity.RegionMasterEntity;
import com.ieum.admin.festival.adapter.out.persistence.entity.SigunguMasterEntity;
import com.ieum.admin.festival.adapter.out.persistence.repository.CategoryMasterRepository;
import com.ieum.admin.festival.adapter.out.persistence.repository.RegionMasterRepository;
import com.ieum.admin.festival.adapter.out.persistence.repository.SigunguMasterRepository;
import com.ieum.admin.festival.application.port.out.MasterDataPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.ieum.admin.festival.domain.model.RegionMaster;
import com.ieum.admin.festival.domain.model.SigunguMaster;

import java.util.List;
import java.util.stream.Collectors;

/**
 * MasterDataPort 구현체 (Output Adapter)
 * - JPA Repository를 감싸서 Port 인터페이스를 구현
 */
@Component
@RequiredArgsConstructor
public class MasterDataPersistenceAdapter implements MasterDataPort {

    private final RegionMasterRepository regionMasterRepository;
    private final CategoryMasterRepository categoryMasterRepository;
    private final SigunguMasterRepository sigunguMasterRepository;

    // ── Region ──
    @Override
    public List<RegionMaster> findAllRegions() {
        return regionMasterRepository.findAll().stream()
                .map(RegionMasterEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public java.util.Optional<RegionMaster> findRegionByCode(String regionCode) {
        return regionMasterRepository.findByRegionCode(regionCode)
                .map(RegionMasterEntity::toDomain);
    }

    @Override
    public RegionMaster saveRegion(RegionMaster domain) {
        RegionMasterEntity saved = regionMasterRepository.save(RegionMasterEntity.fromDomain(domain));
        return saved.toDomain();
    }

    @Override
    public List<RegionMaster> saveAllRegions(List<RegionMaster> domains) {
        List<RegionMasterEntity> entities = domains.stream()
                .map(RegionMasterEntity::fromDomain)
                .collect(Collectors.toList());
        return regionMasterRepository.saveAll(entities).stream()
                .map(RegionMasterEntity::toDomain)
                .collect(Collectors.toList());
    }

    // ── Sigungu ──
    @Override
    public List<SigunguMaster> findAllSigungus() {
        return sigunguMasterRepository.findAll().stream()
                .map(SigunguMasterEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<SigunguMaster> findSigungusByRegionCode(String regionCode) {
        return sigunguMasterRepository.findByRegionCode(regionCode).stream()
                .map(SigunguMasterEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public SigunguMaster saveSigungu(SigunguMaster domain) {
        SigunguMasterEntity saved = sigunguMasterRepository.save(SigunguMasterEntity.fromDomain(domain));
        return saved.toDomain();
    }

    @Override
    public List<SigunguMaster> saveAllSigungus(List<SigunguMaster> domains) {
        List<SigunguMasterEntity> entities = domains.stream()
                .map(SigunguMasterEntity::fromDomain)
                .collect(Collectors.toList());
        return sigunguMasterRepository.saveAll(entities).stream()
                .map(SigunguMasterEntity::toDomain)
                .collect(Collectors.toList());
    }
}

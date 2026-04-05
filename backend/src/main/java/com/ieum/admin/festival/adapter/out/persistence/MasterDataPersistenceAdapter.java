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

import java.util.List;

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
    public List<RegionMasterEntity> findAllRegions() {
        return regionMasterRepository.findAll();
    }

    @Override
    public RegionMasterEntity saveRegion(RegionMasterEntity entity) {
        return regionMasterRepository.save(entity);
    }

    @Override
    public List<RegionMasterEntity> saveAllRegions(List<RegionMasterEntity> entities) {
        return regionMasterRepository.saveAll(entities);
    }

    // ── Sigungu ──
    @Override
    public List<SigunguMasterEntity> findAllSigungus() {
        return sigunguMasterRepository.findAll();
    }

    @Override
    public List<SigunguMasterEntity> findSigungusByRegionCode(String regionCode) {
        return sigunguMasterRepository.findByRegionCode(regionCode);
    }

    @Override
    public SigunguMasterEntity saveSigungu(SigunguMasterEntity entity) {
        return sigunguMasterRepository.save(entity);
    }

    @Override
    public List<SigunguMasterEntity> saveAllSigungus(List<SigunguMasterEntity> entities) {
        return sigunguMasterRepository.saveAll(entities);
    }
}

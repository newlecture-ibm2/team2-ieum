package com.ieum.admin.festival.application.port.out;

import com.ieum.admin.festival.adapter.out.persistence.entity.CategoryMasterEntity;
import com.ieum.admin.festival.adapter.out.persistence.entity.RegionMasterEntity;
import com.ieum.admin.festival.adapter.out.persistence.entity.SigunguMasterEntity;

import java.util.List;

/**
 * 마스터 데이터 영속성 출력 포트
 * - Service(application)가 이 인터페이스에 의존
 * - MasterDataPersistenceAdapter(adapter/out)가 구현
 */
public interface MasterDataPort {

    // ── Region ──
    List<RegionMasterEntity> findAllRegions();
    RegionMasterEntity saveRegion(RegionMasterEntity entity);
    List<RegionMasterEntity> saveAllRegions(List<RegionMasterEntity> entities);

    // ── Sigungu ──
    List<SigunguMasterEntity> findAllSigungus();
    List<SigunguMasterEntity> findSigungusByRegionCode(String regionCode);
    SigunguMasterEntity saveSigungu(SigunguMasterEntity entity);
    List<SigunguMasterEntity> saveAllSigungus(List<SigunguMasterEntity> entities);
}

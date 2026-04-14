package com.ieum.admin.festival.application.port.out;

import com.ieum.admin.festival.domain.model.RegionMaster;
import com.ieum.admin.festival.domain.model.SigunguMaster;

import java.util.List;

/**
 * 마스터 데이터 영속성 출력 포트
 * - Service(application)가 이 인터페이스에 의존
 * - MasterDataPersistenceAdapter(adapter/out)가 구현
 */
public interface MasterDataPort {

    // ── Region ──
    List<RegionMaster> findAllRegions();
    java.util.Optional<RegionMaster> findRegionByCode(String regionCode);
    RegionMaster saveRegion(RegionMaster domain);
    List<RegionMaster> saveAllRegions(List<RegionMaster> domains);

    // ── Sigungu ──
    List<SigunguMaster> findAllSigungus();
    List<SigunguMaster> findSigungusByRegionCode(String regionCode);
    SigunguMaster saveSigungu(SigunguMaster domain);
    List<SigunguMaster> saveAllSigungus(List<SigunguMaster> domains);
}

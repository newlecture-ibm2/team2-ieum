package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.domain.model.RegionMaster;
import com.ieum.admin.festival.application.port.out.MasterDataPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 지역 마스터 Seed Initializer
 * - Tour API의 구형 지역코드(areaCode)를 PK로 유지하되,
 *   최신 행정구역 명칭(displayName)과 약칭(shortName)을 내부 데이터로 관리
 * - 외부 API 의존 없이 애플리케이션 기동 시 자동으로 17개 시도를 초기화/갱신
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class RegionSeedInitializer implements CommandLineRunner {

    private final MasterDataPort masterDataPort;

    /**
     * 대한민국 17개 시도 (Tour API areaCode 기준)
     * [tourCode, tourApiName, displayName(최신 공식 명칭), shortName(약칭)]
     */
    private static final String[][] REGION_SEED = {
        {"1",  "서울",     "서울특별시",           "서울"},
        {"2",  "인천",     "인천광역시",           "인천"},
        {"3",  "대전",     "대전광역시",           "대전"},
        {"4",  "대구",     "대구광역시",           "대구"},
        {"5",  "광주",     "광주광역시",           "광주"},
        {"6",  "부산",     "부산광역시",           "부산"},
        {"7",  "울산",     "울산광역시",           "울산"},
        {"8",  "세종",     "세종특별자치시",        "세종"},
        {"31", "경기도",   "경기도",              "경기"},
        {"32", "강원도",   "강원특별자치도",        "강원"},
        {"33", "충청북도", "충청북도",             "충북"},
        {"34", "충청남도", "충청남도",             "충남"},
        {"35", "경상북도", "경상북도",             "경북"},
        {"36", "경상남도", "경상남도",             "경남"},
        {"37", "전라북도", "전북특별자치도",        "전북"},
        {"38", "전라남도", "전라남도",             "전남"},
        {"39", "제주도",   "제주특별자치도",        "제주"},
    };

    @Override
    @Transactional
    public void run(String... args) {
        log.info("========== 지역 마스터 Seed 시작 ==========");
        int created = 0;
        int updated = 0;

        for (String[] row : REGION_SEED) {
            String code        = row[0];
            String tourName    = row[1];
            String displayName = row[2];
            String shortName   = row[3];

            RegionMaster entity = masterDataPort.findRegionByCode(code).orElse(null);

            if (entity == null) {
                // 신규 INSERT
                entity = RegionMaster.builder()
                        .regionCode(code)
                        .name(tourName)
                        .displayName(displayName)
                        .shortName(shortName)
                        .active(true)
                        .build();
                masterDataPort.saveRegion(entity);
                created++;
                log.debug("지역 INSERT: {} → {} ({})", code, displayName, shortName);
            } else {
                // 기존 데이터가 있으면 displayName / shortName / active만 갱신
                boolean changed = false;
                RegionMaster.RegionMasterBuilder builder = entity.toBuilder();
                
                if (!displayName.equals(entity.getDisplayName())) {
                    builder.displayName(displayName);
                    changed = true;
                }
                if (!shortName.equals(entity.getShortName())) {
                    builder.shortName(shortName);
                    changed = true;
                }
                if (!entity.isActive()) {
                    builder.active(true);
                    changed = true;
                }
                if (changed) {
                    masterDataPort.saveRegion(builder.build());
                    updated++;
                    log.debug("지역 UPDATE: {} → {} ({})", code, displayName, shortName);
                }
            }
        }

        log.info("========== 지역 마스터 Seed 완료: {}건 생성, {}건 갱신 ==========", created, updated);
    }
}

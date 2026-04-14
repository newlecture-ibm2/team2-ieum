package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.application.port.out.AdminFestivalPort;
import com.ieum.admin.festival.domain.model.Festival;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 기존 미지정(area_code=NULL, category=NULL) 축제 데이터 일괄 보정
 * - 서버 기동 시 1회 실행 (RegionSeedInitializer 이후)
 * - 주소(addr1/location)에서 지역코드를 역추론
 * - 카테고리가 비어있으면 축제 기본값(A02/A0207)으로 보정
 */
@Slf4j
@Component
@Order(2) // RegionSeedInitializer(@Order(1)) 이후 실행
@RequiredArgsConstructor
public class FestivalDataBackfillRunner implements CommandLineRunner {

    private final AdminFestivalPort festivalPort;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("========== 축제 데이터 Backfill 시작 ==========");

        // 공공 축제 전체 조회 (is_custom=false)
        List<Festival> allPublic = festivalPort.findAllPublicFestivals();
        List<Festival> toSave = new ArrayList<>();

        int fixedArea = 0;
        int fixedCat = 0;

        for (Festival f : allPublic) {
            boolean changed = false;

            // ── 지역 보정: areaCode가 NULL이면 주소에서 역추론 ──
            if (f.getAreaCode() == null || f.getAreaCode().isEmpty()) {
                // address(전체 주소), location(시도명), 순서로 시도
                String inferred = RegionCodeResolver.resolveFromAddress(f.getAddress());
                if (inferred == null) {
                    inferred = RegionCodeResolver.resolveFromAddress(f.getLocation());
                }
                if (inferred != null) {
                    f.setAreaCode(inferred);
                    changed = true;
                    fixedArea++;
                }
            }

            // ── 카테고리 보정: 대/중분류가 NULL이면 축제 기본값 적용 ──
            if (f.getCategory() == null || f.getCategory().isEmpty()) {
                f.setCategory("A02");
                changed = true;
                fixedCat++;
            }
            if (f.getCategoryMid() == null || f.getCategoryMid().isEmpty()) {
                f.setCategoryMid("A0207");
                changed = true;
            }

            if (changed) {
                toSave.add(f);
            }
        }

        if (!toSave.isEmpty()) {
            festivalPort.saveAll(toSave);
        }

        log.info("========== 축제 데이터 Backfill 완료: 지역 {}건, 카테고리 {}건 보정 ==========", fixedArea, fixedCat);
    }
}

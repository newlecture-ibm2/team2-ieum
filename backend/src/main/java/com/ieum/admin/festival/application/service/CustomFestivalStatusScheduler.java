package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.application.port.out.AdminFestivalPort;
import com.ieum.admin.festival.domain.model.Festival;
import com.ieum.admin.festival.domain.model.FestivalStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 축제 관리 상태 자동 업데이트 스케줄러
 * - Port를 통해 persistence에 접근하며, Entity를 직접 사용하지 않음
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomFestivalStatusScheduler {

    private final AdminFestivalPort festivalPort;

    @Scheduled(cron = "0 0 0 * * *") // 매일 00시(자정)에 실행
    @Transactional
    public void updateCustomFestivalStatuses() {
        log.info("축제 관리 상태 자동 업데이트 스케줄러 시작...");

        List<Festival> allFestivals = festivalPort.findAll();
        List<Festival> toSave = new ArrayList<>();
        int updateCount = 0;

        for (Festival f : allFestivals) {
            if (f.isCustom()) {
                FestivalStatus oldStatus = f.getStatus();
                FestivalStatus newStatus = Festival.calculateStatus(f.getStartDate(), f.getEndDate());

                if (newStatus != oldStatus) {
                    f.setStatus(newStatus);
                    toSave.add(f);
                    updateCount++;
                }
            }
        }

        if (!toSave.isEmpty()) {
            festivalPort.saveAll(toSave);
        }

        log.info("축제 관리 상태 업데이트 완료. 총 {}건 변경됨.", updateCount);
    }
}

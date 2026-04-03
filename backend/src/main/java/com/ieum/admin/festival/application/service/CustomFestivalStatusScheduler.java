package com.ieum.admin.festival.application.service;

import com.ieum.admin.festival.adapter.out.persistence.entity.AdminFestivalEntity;
import com.ieum.admin.festival.adapter.out.persistence.AdminFestivalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomFestivalStatusScheduler {

    private final AdminFestivalRepository festivalJpaRepository;

    @Scheduled(cron = "0 0 0 * * *") // 매일 00시(자정)에 실행
    @Transactional
    public void updateCustomFestivalStatuses() {
        log.info("축제 등록 상태 자동 업데이트 스케줄러 시작...");
        
        List<AdminFestivalEntity> allFestivals = festivalJpaRepository.findAll();
        LocalDate today = LocalDate.now();
        int updateCount = 0;

        for (AdminFestivalEntity f : allFestivals) {
            // 축제 등록만 필터링
            if (Boolean.TRUE.equals(f.getIsCustom())) {
                String oldStatus = f.getStatus();
                String newStatus = "UPCOMING";
                
                if (f.getStartDate() != null && f.getEndDate() != null) {
                    if (today.isBefore(f.getStartDate())) {
                        newStatus = "UPCOMING";
                    } else if (today.isAfter(f.getEndDate())) {
                        newStatus = "ENDED";
                    } else {
                        newStatus = "ONGOING";
                    }
                }
                
                if (!newStatus.equals(oldStatus)) {
                    f.setStatus(newStatus);
                    updateCount++;
                }
            }
        }
        log.info("축제 등록 상태 업데이트 완료. 총 {}건 변경됨.", updateCount);
    }
}

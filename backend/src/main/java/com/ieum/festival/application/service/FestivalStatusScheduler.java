package com.ieum.festival.application.service;

import com.ieum.festival.adapter.out.persistence.entity.FestivalEntity;
import com.ieum.festival.adapter.out.persistence.repository.FestivalJpaRepository;
import com.ieum.festival.application.port.in.RefreshFestivalStatusUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 축제 status 컬럼 자동/수동 갱신 서비스
 * - RefreshFestivalStatusUseCase 구현
 * - 매일 자정(00:00) 자동 실행
 * - 수동 API 호출로도 실행 가능
 * 
 * NOTE: 이 서비스는 전체 축제를 일괄 갱신하는 배치 작업이므로
 *       성능상의 이유로 JpaRepository를 직접 사용합니다.
 *       (Port를 통한 개별 매핑 오버헤드 회피)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FestivalStatusScheduler implements RefreshFestivalStatusUseCase {

    private final FestivalJpaRepository repository;

    /**
     * 모든 축제의 status를 오늘 날짜 기준으로 일괄 갱신
     * @return 갱신된 축제 수
     */
    @Override
    @Transactional
    public int refreshAllStatuses() {
        LocalDate today = LocalDate.now();
        List<FestivalEntity> festivals = repository.findAll();

        int updatedCount = 0;
        for (FestivalEntity festival : festivals) {
            if (festival.getStartDate() == null || festival.getEndDate() == null) continue;

            String newStatus;
            if (today.isBefore(festival.getStartDate())) {
                newStatus = "UPCOMING";
            } else if (today.isAfter(festival.getEndDate())) {
                newStatus = "ENDED";
            } else {
                newStatus = "ONGOING";
            }

            if (!newStatus.equals(festival.getStatus())) {
                festival.setStatus(newStatus);
                updatedCount++;
            }
        }

        log.info("[FestivalStatusScheduler] DB status 일괄 갱신 완료: {}건 변경 (전체 {}건)", updatedCount, festivals.size());
        return updatedCount;
    }

    /**
     * 매일 자정(00:00)에 자동 실행
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void scheduledRefresh() {
        log.info("[FestivalStatusScheduler] 자정 자동 갱신 시작");
        refreshAllStatuses();
    }
}

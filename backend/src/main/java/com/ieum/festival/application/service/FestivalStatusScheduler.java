package com.ieum.festival.application.service;

import com.ieum.festival.application.port.in.RefreshFestivalStatusUseCase;
import com.ieum.festival.application.port.out.FestivalPersistencePort;
import com.ieum.festival.domain.model.Festival;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 축제 status 컬럼 자동/수동 갱신 서비스
 * - RefreshFestivalStatusUseCase 구현
 * - 매일 자정(00:00) 자동 실행
 * - 수동 API 호출로도 실행 가능
 *
 * ✅ Port + Domain Model 기반으로 리팩토링
 *    - Entity/JpaRepository 직접 참조 제거
 *    - 상태 계산 로직은 Festival.refreshStatus()에 위임 (중복 제거)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FestivalStatusScheduler implements RefreshFestivalStatusUseCase {

    private final FestivalPersistencePort festivalPersistencePort;

    /**
     * 모든 축제의 status를 오늘 날짜 기준으로 일괄 갱신
     * @return 갱신된 축제 수
     */
    @Override
    @Transactional
    public int refreshAllStatuses() {
        List<Festival> festivals = festivalPersistencePort.findAll();

        // 도메인 모델의 비즈니스 메서드로 상태 갱신
        List<Festival> changed = festivals.stream()
                .filter(Festival::refreshStatus)
                .collect(Collectors.toList());

        if (!changed.isEmpty()) {
            festivalPersistencePort.saveAll(changed);
        }

        log.info("[FestivalStatusScheduler] DB status 일괄 갱신 완료: {}건 변경 (전체 {}건)",
                changed.size(), festivals.size());
        return changed.size();
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

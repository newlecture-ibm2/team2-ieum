package com.ieum.admin.statistics.application.port.in;

import com.ieum.admin.statistics.application.result.DashboardResult;
import com.ieum.admin.statistics.application.result.DashboardTrendItem;
import java.time.LocalDate;
import java.util.List;

/**
 * 대시보드 통계 조회 UseCase
 */
public interface GetDashboardUseCase {
    DashboardResult getDashboard();
    
    // 차트 비동기 조회
    List<DashboardTrendItem> getDashboardTrend(LocalDate startDate, LocalDate endDate);
}

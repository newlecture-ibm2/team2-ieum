package com.ieum.admin.statistics.application.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 일별 추이 데이터 아이템
 */
@Getter
@AllArgsConstructor
public class DashboardTrendItem {
    private final String date;      // "04/01" 형식
    private final long reports;
    private final long inquiries;
}

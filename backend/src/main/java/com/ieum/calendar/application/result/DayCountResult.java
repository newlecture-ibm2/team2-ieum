package com.ieum.calendar.application.result;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 월별 축제 카운트 응답 DTO
 * - { "day": 1, "cnt": 2 } 형태
 */
@Data
@AllArgsConstructor
public class DayCountResult {
    private int day;
    private long cnt;
}

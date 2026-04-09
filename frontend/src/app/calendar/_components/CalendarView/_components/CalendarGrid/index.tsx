"use client";

import React, { useMemo, Fragment } from "react";
import CalendarExpandRow from "../CalendarExpandRow";
import type { CalendarFestival } from "@/types/calendar";
import styles from "./CalendarGrid.module.css";

/** 해당 월의 달력 정보 계산 */
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  return { firstDay, daysInMonth };
}

interface Props {
  year: number;
  month: number;
  dayCounts: Map<number, number>;
  selectedDay: number | null;
  selectedFestivals: CalendarFestival[];
  isFestivalsLoading: boolean;
  isLoading: boolean;
  onSelectDay: (day: number) => void;
  onCloseExpand: () => void;
}

export default function CalendarGrid({
  year, month, dayCounts, selectedDay, selectedFestivals,
  isFestivalsLoading, isLoading, onSelectDay, onCloseExpand,
}: Props) {
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
  const todayDate = today.getDate();

  const { firstDay, daysInMonth } = useMemo(
    () => getCalendarDays(year, month),
    [year, month]
  );

  const selectedWeekRow = useMemo(() => {
    if (selectedDay === null) return -1;
    return Math.floor((firstDay + selectedDay - 1) / 7);
  }, [selectedDay, firstDay]);

  const weeks = useMemo(() => {
    const result: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      result.push(currentWeek);
    }

    return result;
  }, [firstDay, daysInMonth]);

  return (
    <div className={`${styles.calendarGrid} ${isLoading ? styles.loadingOverlay : ""}`}>
      {/* 요일 헤더 */}
      <div className={styles.weekdays}>
        <span>일</span><span>월</span><span>화</span>
        <span>수</span><span>목</span><span>금</span><span>토</span>
      </div>

      {/* 날짜 셀 */}
      <div className={styles.daysGrid}>
        {weeks.map((week, weekIndex) => (
          <Fragment key={`week-${weekIndex}`}>
            {week.map((day, dayIndex) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${weekIndex}-${dayIndex}`}
                    className={`${styles.dayCell} ${styles.dayCellEmpty}`}
                  />
                );
              }

              const count = dayCounts.get(day) ?? 0;
              const isToday = isCurrentMonth && day === todayDate;
              const isSelected = selectedDay === day;
              const colIndex = (firstDay + day - 1) % 7;
              const isSun = colIndex === 0;
              const isSat = colIndex === 6;

              return (
                <div
                  key={`day-${day}`}
                  className={[
                    styles.dayCell,
                    isToday ? styles.today : "",
                    isSelected ? styles.selected : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => onSelectDay(day)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${month}월 ${day}일${count > 0 ? `, 축제 ${count}개` : ""}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelectDay(day);
                  }}
                >
                  <span
                    className={[
                      styles.dayNum,
                      isSun ? styles.sunday : "",
                      isSat ? styles.saturday : "",
                    ].filter(Boolean).join(" ")}
                  >
                    {day}
                  </span>
                  {count > 0 && (
                    <div className={styles.dayCount}>{count}개</div>
                  )}
                </div>
              );
            })}

            {/* 선택된 날짜의 행 바로 아래에 확장 영역 삽입 */}
            {selectedDay !== null && weekIndex === selectedWeekRow && (
              <CalendarExpandRow
                month={month}
                selectedDay={selectedDay}
                festivals={selectedFestivals}
                isLoading={isFestivalsLoading}
                onClose={onCloseExpand}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

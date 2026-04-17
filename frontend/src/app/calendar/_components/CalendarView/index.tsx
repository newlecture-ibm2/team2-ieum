"use client";

import useCalendarView from "./useCalendarView";
import CalendarNav from "./_components/CalendarNav";
import CalendarGrid from "./_components/CalendarGrid";
import styles from "./CalendarView.module.css";

export default function CalendarView() {
  const {
    year,
    month,
    dayCounts,
    selectedDay,
    selectedFestivals,
    isLoading,
    isFestivalsLoading,
    goToPrevMonth,
    goToNextMonth,
    setYear: changeYear,
    setMonth: changeMonth,
    selectDay,
    closeExpand,
  } = useCalendarView();

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i);

  return (
    <div className={styles.calendarContainer}>
      {/* 페이지 타이틀 */}
      <div className={styles.titleBar}>
        <span className={styles.titleIcon}>📅</span>
        <h1 className={styles.titleText}>축제 달력</h1>
      </div>

      {/* 연월 네비게이션 */}
      <CalendarNav
        year={year}
        month={month}
        yearOptions={yearOptions}
        onChangeYear={changeYear}
        onChangeMonth={changeMonth}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
      />

      {/* 캘린더 그리드 */}
      <CalendarGrid
        year={year}
        month={month}
        dayCounts={dayCounts}
        selectedDay={selectedDay}
        selectedFestivals={selectedFestivals}
        isFestivalsLoading={isFestivalsLoading}
        isLoading={isLoading}
        onSelectDay={selectDay}
        onCloseExpand={closeExpand}
      />
    </div>
  );
}

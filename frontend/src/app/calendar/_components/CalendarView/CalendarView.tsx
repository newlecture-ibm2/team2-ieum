"use client";

import React, { useMemo, Fragment } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useCalendarView from "./useCalendarView";
import type { CalendarFestival } from "./useCalendarView";
import styles from "./CalendarView.module.css";

/** 해당 월의 달력 정보 계산 */
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=일 ~ 6=토
  const daysInMonth = new Date(year, month, 0).getDate();
  return { firstDay, daysInMonth };
}

/** 날짜 포맷 (3.25 ~ 4.3 형태) */
function formatDateRange(startDate: string, endDate: string) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  return `${s.getMonth() + 1}.${s.getDate()} ~ ${e.getMonth() + 1}.${e.getDate()}`;
}

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
    selectDay,
    closeExpand,
  } = useCalendarView();

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
  const todayDate = today.getDate();

  const { firstDay, daysInMonth } = useMemo(
    () => getCalendarDays(year, month),
    [year, month]
  );

  /** 선택된 날짜가 몇 번째 행(주)에 있는지 계산 */
  const selectedWeekRow = useMemo(() => {
    if (selectedDay === null) return -1;
    return Math.floor((firstDay + selectedDay - 1) / 7);
  }, [selectedDay, firstDay]);

  /** 주 단위로 날짜 배열 그룹화 */
  const weeks = useMemo(() => {
    const result: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    // 첫 주 빈 칸
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

    // 마지막 주 빈 칸
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      result.push(currentWeek);
    }

    return result;
  }, [firstDay, daysInMonth]);

  /** 축제 카드 렌더링 */
  const renderFestivalCard = (festival: CalendarFestival, index: number) => (
    <article className={styles.festCard} key={festival.id}>
      <div className={styles.festCardImg}>
        {festival.thumbnailUrl || festival.imageUrl ? (
          <img
            src={festival.thumbnailUrl || festival.imageUrl || ""}
            alt={festival.title}
          />
        ) : null}
        <span className={styles.cardNum}>{index + 1}</span>
      </div>
      <div className={styles.festCardBody}>
        <div className={styles.cardTitle}>{festival.title}</div>
        <div className={styles.cardLoc}>
          📍 {festival.eventPlace || festival.address || "정보 없음"}
        </div>
        <div className={styles.cardDate}>
          {formatDateRange(festival.startDate, festival.endDate)}
        </div>
        <Link href={`/festivals/${festival.id}`} className={styles.btnDetail}>
          상세보기
        </Link>
      </div>
    </article>
  );

  return (
    <div className={styles.calendarContainer}>
      {/* 페이지 타이틀 */}
      <div className={styles.titleBar}>
        <span className={styles.titleIcon}>📅</span>
        <h1 className={styles.titleText}>축제 달력</h1>
      </div>

      {/* 연월 네비게이션 */}
      <div className={styles.monthNav}>
        <span className={styles.yearMonth}>
          {year}년 {month}월
        </span>
        <div className={styles.navArrows}>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={goToPrevMonth}
            aria-label="이전 월"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={goToNextMonth}
            aria-label="다음 월"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className={`${styles.calendarGrid} ${isLoading ? styles.loadingOverlay : ""}`}>
        {/* 요일 헤더 */}
        <div className={styles.weekdays}>
          <span>일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span>토</span>
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
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => selectDay(day)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${month}월 ${day}일${count > 0 ? `, 축제 ${count}개` : ""}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") selectDay(day);
                    }}
                  >
                    <span
                      className={[
                        styles.dayNum,
                        isSun ? styles.sunday : "",
                        isSat ? styles.saturday : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {day}
                    </span>
                    {count > 0 && (
                      <div className={styles.dayCount}>{count}개</div>
                    )}
                  </div>
                );
              })}

              {/* 선택된 날짜의 행(주) 바로 아래에 확장 영역 삽입 */}
              {selectedDay !== null && weekIndex === selectedWeekRow && (
                <div className={styles.expandRow} key={`expand-${weekIndex}`}>
                  <div className={styles.expandHeader}>
                    <span className={styles.expandTitle}>
                      📌 {month}월 {selectedDay}일 축제 리스트
                      {!isFestivalsLoading && ` (${selectedFestivals.length}개)`}
                    </span>
                    <button
                      type="button"
                      className={styles.expandClose}
                      onClick={closeExpand}
                      aria-label="축제 리스트 닫기"
                    >
                      ✕
                    </button>
                  </div>

                  {isFestivalsLoading ? (
                    <div className={styles.loadingText}>불러오는 중...</div>
                  ) : selectedFestivals.length === 0 ? (
                    <div className={styles.emptyMessage}>
                      해당 날짜에 진행 중인 축제가 없습니다.
                    </div>
                  ) : (
                    <>
                      <div className={styles.expandCards}>
                        {selectedFestivals.map((f, i) => renderFestivalCard(f, i))}
                      </div>
                      {selectedFestivals.length > 3 && (
                        <div className={styles.scrollHint}>← 가로 스크롤 →</div>
                      )}
                    </>
                  )}
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

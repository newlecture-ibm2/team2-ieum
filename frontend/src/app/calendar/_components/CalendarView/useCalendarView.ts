"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { DayCount, CalendarFestival } from "@/types/calendar";

interface UseCalendarViewReturn {
  /** 현재 보고 있는 연도 */
  year: number;
  /** 현재 보고 있는 월 */
  month: number;
  /** 일자별 축제 카운트 맵 (day → cnt) */
  dayCounts: Map<number, number>;
  /** 선택된 날짜 (1~31, null이면 미선택) */
  selectedDay: number | null;
  /** 선택된 날짜의 축제 목록 */
  selectedFestivals: CalendarFestival[];
  /** 월별 카운트 로딩 중 */
  isLoading: boolean;
  /** 축제 목록 로딩 중 */
  isFestivalsLoading: boolean;
  /** 이전 월로 이동 */
  goToPrevMonth: () => void;
  /** 다음 월로 이동 */
  goToNextMonth: () => void;
  /** 연도 직접 설정 */
  setYear: (y: number) => void;
  /** 월 직접 설정 */
  setMonth: (m: number) => void;
  /** 날짜 선택 */
  selectDay: (day: number) => void;
  /** 축제 리스트 닫기 */
  closeExpand: () => void;
}

export default function useCalendarView(): UseCalendarViewReturn {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [dayCounts, setDayCounts] = useState<Map<number, number>>(new Map());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedFestivals, setSelectedFestivals] = useState<CalendarFestival[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFestivalsLoading, setIsFestivalsLoading] = useState(false);

  /** 월별 축제 카운트 조회 — GET /api/calendar?year={y}&month={m} */
  const fetchMonthlyCounts = useCallback(async (y: number, m: number) => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/calendar", { params: { year: y, month: m } });
      if (res.data?.success) {
        const map = new Map<number, number>();
        (res.data.data as DayCount[]).forEach((item) => {
          map.set(item.day, item.cnt);
        });
        setDayCounts(map);
      }
    } catch (error) {
      console.error("월별 카운트 조회 실패:", error);
      setDayCounts(new Map());
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** 일자별 축제 목록 조회 — GET /api/calendar/festivals?date={yyyy-MM-dd} */
  const fetchDailyFestivals = useCallback(async (y: number, m: number, d: number) => {
    setIsFestivalsLoading(true);
    try {
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const res = await api.get("/api/calendar/festivals", { params: { date: dateStr } });
      if (res.data?.success) {
        setSelectedFestivals(res.data.data.festivals ?? []);
      }
    } catch (error) {
      console.error("일자별 축제 조회 실패:", error);
      setSelectedFestivals([]);
    } finally {
      setIsFestivalsLoading(false);
    }
  }, []);

  // 월 변경 시 카운트 재조회
  useEffect(() => {
    fetchMonthlyCounts(year, month);
  }, [year, month, fetchMonthlyCounts]);

  // 페이지 진입 시 오늘 날짜 축제 기본 표시
  useEffect(() => {
    const todayDay = today.getDate();
    if (year === today.getFullYear() && month === today.getMonth() + 1) {
      setSelectedDay(todayDay);
      fetchDailyFestivals(year, month, todayDay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToPrevMonth = useCallback(() => {
    setSelectedDay(null);
    setSelectedFestivals([]);
    if (month === 1) {
      setYear((prev) => prev - 1);
      setMonth(12);
    } else {
      setMonth((prev) => prev - 1);
    }
  }, [month]);

  const maxYear = today.getFullYear() + 1;

  const goToNextMonth = useCallback(() => {
    // 미래 1년(maxYear) 12월을 넘지 않도록 제한
    if (year === maxYear && month === 12) return;
    setSelectedDay(null);
    setSelectedFestivals([]);
    if (month === 12) {
      setYear((prev) => prev + 1);
      setMonth(1);
    } else {
      setMonth((prev) => prev + 1);
    }
  }, [year, month, maxYear]);

  const selectDay = useCallback(
    (day: number) => {
      setSelectedDay(day);
      fetchDailyFestivals(year, month, day);
    },
    [year, month, fetchDailyFestivals]
  );

  const closeExpand = useCallback(() => {
    setSelectedDay(null);
    setSelectedFestivals([]);
  }, []);

  const changeYear = useCallback((y: number) => {
    setSelectedDay(null);
    setSelectedFestivals([]);
    setYear(y);
  }, []);

  const changeMonth = useCallback((m: number) => {
    setSelectedDay(null);
    setSelectedFestivals([]);
    setMonth(m);
  }, []);

  return {
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
  };
}

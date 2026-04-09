"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarFestival } from "@/types/calendar";
import CalendarFestivalCard from "../CalendarFestivalCard";
import styles from "./CalendarExpandRow.module.css";

interface Props {
  month: number;
  selectedDay: number;
  festivals: CalendarFestival[];
  isLoading: boolean;
  onClose: () => void;
}

export default function CalendarExpandRow({
  month, selectedDay, festivals, isLoading, onClose,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 200; // 한 번에 200px씩 이동
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.expandRow}>
      <div className={styles.expandHeader}>
        <span className={styles.expandTitle}>
          📌 {month}월 {selectedDay}일 축제 리스트
          {!isLoading && ` (${festivals.length}개)`}
        </span>
        <button
          type="button"
          className={styles.expandClose}
          onClick={onClose}
          aria-label="축제 리스트 닫기"
        >
          ✕
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingText}>불러오는 중...</div>
      ) : festivals.length === 0 ? (
        <div className={styles.emptyMessage}>
          해당 날짜에 진행 중인 축제가 없습니다.
        </div>
      ) : (
        <>
          <div className={styles.cardsWrapper}>
            {/* 왼쪽 스크롤 버튼 */}
            {festivals.length > 3 && (
              <button
                type="button"
                className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
                onClick={() => scroll("left")}
                aria-label="왼쪽으로 스크롤"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <div className={styles.expandCards} ref={scrollRef}>
              {festivals.map((f, i) => (
                <CalendarFestivalCard key={f.id} festival={f} index={i} />
              ))}
            </div>

            {/* 오른쪽 스크롤 버튼 */}
            {festivals.length > 3 && (
              <button
                type="button"
                className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
                onClick={() => scroll("right")}
                aria-label="오른쪽으로 스크롤"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          {festivals.length > 3 && (
            <div className={styles.scrollHint}>← 가로 스크롤 →</div>
          )}
        </>
      )}
    </div>
  );
}

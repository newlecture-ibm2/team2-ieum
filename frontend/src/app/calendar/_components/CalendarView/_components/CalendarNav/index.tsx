import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./CalendarNav.module.css";

interface Props {
  year: number;
  month: number;
  yearOptions: number[];
  onChangeYear: (y: number) => void;
  onChangeMonth: (m: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarNav({
  year, month, yearOptions,
  onChangeYear, onChangeMonth, onPrevMonth, onNextMonth,
}: Props) {
  return (
    <div className={styles.monthNav}>
      {/* 좌측: 년/월 드롭다운 */}
      <div className={styles.dropdowns}>
        <select
          className={styles.yearSelect}
          value={year}
          onChange={(e) => onChangeYear(Number(e.target.value))}
          aria-label="연도 선택"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <select
          className={styles.monthSelect}
          value={month}
          onChange={(e) => onChangeMonth(Number(e.target.value))}
          aria-label="월 선택"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}월</option>
          ))}
        </select>
      </div>

      {/* 중앙: 이전/현재월/다음 네비게이션 */}
      <div className={styles.centerNav}>
        <button type="button" className={styles.arrowBtn} onClick={onPrevMonth} aria-label="이전 월">
          <ChevronLeft size={18} />
        </button>
        <span className={styles.yearMonth}>{year}년 {month}월</span>
        <button type="button" className={styles.arrowBtn} onClick={onNextMonth} aria-label="다음 월">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 우측 여백 (좌우 대칭용) */}
      <div className={styles.navSpacer} />
    </div>
  );
}

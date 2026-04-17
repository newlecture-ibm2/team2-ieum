import { ChevronLeft, ChevronRight } from "lucide-react";
import Dropdown from '@/_component/common/Dropdown';
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
        <Dropdown
          options={yearOptions.map(y => ({ value: String(y), label: `${y}년` }))}
          value={String(year)}
          onChange={(v) => onChangeYear(Number(v))}
          ariaLabel="연도 선택"
          minWidth={100}
        />
        <Dropdown
          options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}월` }))}
          value={String(month)}
          onChange={(v) => onChangeMonth(Number(v))}
          ariaLabel="월 선택"
          minWidth={76}
        />
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

import Link from "next/link";
import type { CalendarFestival } from "@/types/calendar";
import styles from "./CalendarFestivalCard.module.css";

/** 날짜 포맷 (3.25 ~ 4.3 형태) */
function formatDateRange(startDate: string, endDate: string) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  return `${s.getMonth() + 1}.${s.getDate()} ~ ${e.getMonth() + 1}.${e.getDate()}`;
}

interface Props {
  festival: CalendarFestival;
  index: number;
}

export default function CalendarFestivalCard({ festival, index }: Props) {
  return (
    <article className={styles.festCard}>
      <div className={styles.festCardImg}>
        <img
          src={festival.thumbnailUrl || festival.imageUrl || "/images/hero_fallback.png"}
          alt={festival.title}
        />
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
}

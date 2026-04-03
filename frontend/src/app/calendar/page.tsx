import type { Metadata } from "next";
import CalendarView from "./_components/CalendarView";

export const metadata: Metadata = {
  title: "축제 달력 — 이음",
  description:
    "월별 캘린더로 전국 축제 일정을 한눈에 확인하세요. 날짜를 클릭하면 해당일 축제 목록을 볼 수 있습니다.",
};

export default function CalendarPage() {
  return <CalendarView />;
}

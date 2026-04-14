export interface DayCount {
  day: number;
  cnt: number;
}

export interface CalendarFestival {
  id: number;
  title: string;
  address: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ONGOING" | "ENDED";
  areaCode: string | null;
  eventPlace: string | null;
}

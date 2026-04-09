export interface Festival {
  id: string;               // 축제 고유 식별자 (PK)
  festivalId?: number;      // 백엔드 API 명세 기준 (숫자 ID)
  title: string;            // 축제 이름
  description?: string;     // 상세 소개 문구
  address: string;          // 개최 현장 상세 주소
  region?: RegionCategory;  // 소속 지역 카테고리
  fee?: number;             // 참가/입장비 (0이면 무료)
  startDate: string;        // 'YYYY-MM-DD'
  endDate: string;          // 'YYYY-MM-DD'
  images?: FestivalImage[]; // 이벤트 썸네일 포스터 이미지 배열
  
  // API 명세 (API_FES_0010) 기준 필드들
  status: 'UPCOMING' | 'ONGOING' | 'ENDED'; // 진행 상황
  imageUrl?: string;
  thumbnailUrl?: string;
  avgStar?: number;
  avgRating?: number;
  reviewCount?: number;
  favoriteCount: number;
  isFavorited: boolean;
  ldongCode?: string;
}

export interface FestivalImage {
  id: string;
  url: string;              // S3 혹은 로컬 CDN URL
  isPrimary: boolean;       // 리스트에 노출될 썸네일 이미지 여부
}

export interface RegionCategory {
  id: number;
  name: string;             // 예: "서울특별시", "강원도"
}

/**
 * 프로젝트 공통 필터/셀렉트 상수
 * - 지역, 커뮤니티 카테고리, 기간 등
 * - SearchFilter, 글쓰기 폼, 축제 지도 등에서 공통 사용
 */

// ─── 지역 ───

export const REGION_CODES = [
  { code: '1', name: '서울' },
  { code: '2', name: '인천' },
  { code: '3', name: '대전' },
  { code: '4', name: '대구' },
  { code: '5', name: '광주' },
  { code: '6', name: '부산' },
  { code: '7', name: '울산' },
  { code: '8', name: '세종' },
  { code: '31', name: '경기' },
  { code: '32', name: '강원' },
  { code: '33', name: '충북' },
  { code: '34', name: '충남' },
  { code: '35', name: '경북' },
  { code: '36', name: '경남' },
  { code: '37', name: '전북' },
  { code: '38', name: '전남' },
  { code: '39', name: '제주' },
];

/** 지역 이름만 추출한 목록 (예: 축제 지도 필터용) */
export const REGION_NAMES = REGION_CODES.map(r => r.name);

/** 지역 셀렉트 드롭다운용 (정식 명칭 포함) */
export const REGION_OPTIONS = [
  { value: '', label: '지역 선택 (선택사항)' },
  ...REGION_CODES.map(r => {
    const suffix =
      ['1'].includes(r.code) ? '특별시' :
      ['2','3','4','5','6','7'].includes(r.code) ? '광역시' :
      r.code === '8' ? '특별자치시' :
      r.code === '39' ? '특별자치도' : '도';
    return { value: r.code, label: r.name + suffix };
  }),
];

// ─── 커뮤니티 카테고리 (말머리) ───

export const CATEGORY_CODES = [
  { code: 'qna', name: 'Q&A' },
  { code: 'tip', name: '축제 꿀팁' },
  { code: 'review', name: '먹거리 리뷰' },
];

/** 말머리 셀렉트 드롭다운용 */
export const CATEGORY_OPTIONS = [
  { value: '', label: '말머리 선택' },
  ...CATEGORY_CODES.map(c => ({ value: c.code, label: c.name })),
];

// ─── 기간 필터 ───

export const PERIOD_CODES = [
  { code: 'week', name: '이번 주' },
  { code: 'month', name: '이번 달' },
  { code: 'custom', name: '직접 입력' },
];

// ─── 축제 상태 필터 ───

/** HeroBanner 탭용 (전체 포함) */
export const FESTIVAL_STATUS_TABS = [
  { label: '전체', value: 'all' },
  { label: '진행중', value: 'ongoing' },
  { label: '진행예정', value: 'upcoming' },
];

/** FestivalMap 필터 셀렉트용 */
export const FESTIVAL_STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '진행 중' },
  { value: 'upcoming', label: '진행 예정' },
];

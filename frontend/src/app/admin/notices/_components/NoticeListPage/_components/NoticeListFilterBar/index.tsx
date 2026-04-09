import common from '@/app/admin/_styles/admin-common.module.css';

interface Props {
  filterType: string;
  onFilterTypeChange: (type: any) => void;
  localSearchType: string;
  onLocalSearchTypeChange: (type: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearchSubmit: () => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function NoticeListFilterBar({
  filterType, onFilterTypeChange,
  localSearchType, onLocalSearchTypeChange,
  searchTerm, onSearchTermChange,
  onSearchSubmit, onSearchKeyDown
}: Props) {
  return (
    <div className={common.filterBar}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <select
          className={common.filterSelect}
          style={{ minWidth: 130 }}
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
        >
          <option value="all">전체 상태</option>
          <option value="ACTIVE">활성</option>
          <option value="RESERVED">예약</option>
          <option value="ENDED">종료</option>
          <option value="INACTIVE">비활성</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          className={common.filterSelect}
          style={{ minWidth: 130 }}
          value={localSearchType}
          onChange={(e) => onLocalSearchTypeChange(e.target.value)}
        >
          <option value="ALL">전체 검색</option>
          <option value="TITLE">제목</option>
          <option value="CONTENT">내용</option>
        </select>
        <input
          type="text"
          className={common.searchInput}
          style={{ width: 280 }}
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyDown={onSearchKeyDown}
        />
        <button type="button" className={common.searchBtn} onClick={onSearchSubmit}>
          검색
        </button>
      </div>
    </div>
  );
}

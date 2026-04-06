'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import styles from './SearchFilter.module.css';

export const REGION_CODES = [
  { code: '1', name: '서울' }, { code: '2', name: '인천' }, { code: '3', name: '대전' },
  { code: '4', name: '대구' }, { code: '5', name: '광주' }, { code: '6', name: '부산' },
  { code: '7', name: '울산' }, { code: '8', name: '세종' }, { code: '31', name: '경기' },
  { code: '32', name: '강원' }, { code: '33', name: '충북' }, { code: '34', name: '충남' },
  { code: '35', name: '경북' }, { code: '36', name: '경남' }, { code: '37', name: '전북' },
  { code: '38', name: '전남' }, { code: '39', name: '제주' },
];

export const CATEGORY_CODES = [
  { code: 'qna', name: 'Q&A' },
  { code: 'tip', name: '축제 꿀팁' },
  { code: 'review', name: '먹거리 리뷰' },
];

export const PERIOD_CODES = [
  { code: 'week', name: '이번 주' },
  { code: 'month', name: '이번 달' },
  { code: 'custom', name: '직접 입력' },
];

interface SearchFilterProps {
  variant?: 'search-only' | 'with-filter';
  filterType?: 'festival' | 'community' | 'notice';
}

export default function SearchFilter({ variant = 'with-filter', filterType = 'festival' }: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentKeyword = searchParams.get('keyword') || '';
  const currentAreaCode = searchParams.get('areaCode') || '';
  const currentMonth = searchParams.get('month') || '';
  
  const currentCategory = searchParams.get('category') || '';
  const currentPeriod = searchParams.get('period') || ''; 
  const currentStart = searchParams.get('startDate') || '';
  const currentEnd = searchParams.get('endDate') || '';
  const currentSearchType = searchParams.get('searchType') || 'all';

  const currentSort = searchParams.get('sort') || 'latest';

  const [keyword, setKeyword] = useState(currentKeyword);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [areaCode, setAreaCode] = useState(currentAreaCode);
  const [month, setMonth] = useState(currentMonth);
  const [category, setCategory] = useState(currentCategory);
  const [period, setPeriod] = useState(currentPeriod);
  const [startDate, setStartDate] = useState(currentStart);
  const [endDate, setEndDate] = useState(currentEnd);
  const [searchType, setSearchType] = useState(currentSearchType);
  
  const [sort, setSort] = useState(currentSort);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterOpen]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (keyword.trim()) params.set('keyword', keyword.trim());
    else params.delete('keyword');
    
    if (filterType === 'notice') {
      if (searchType !== 'all') params.set('searchType', searchType);
      else params.delete('searchType');
    }
    
    if (sort !== 'latest') params.set('sort', sort);
    else params.delete('sort');

    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearKeywordAndSearch = () => {
    setKeyword('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('keyword');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApplyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (keyword.trim()) params.set('keyword', keyword.trim()); 
    else params.delete('keyword');

    if (sort !== 'latest') params.set('sort', sort);
    else params.delete('sort');

    if (filterType === 'festival') {
      if (areaCode) params.set('areaCode', areaCode); else params.delete('areaCode');
      if (month) params.set('month', month); else params.delete('month');
    } else if (filterType === 'community') {
      if (category) params.set('category', category); else params.delete('category');
      if (areaCode) params.set('areaCode', areaCode); else params.delete('areaCode');
      if (period) params.set('period', period); else params.delete('period');
      if (period === 'custom') {
         if (startDate) params.set('startDate', startDate); else params.delete('startDate');
         if (endDate) params.set('endDate', endDate); else params.delete('endDate');
      } else {
         params.delete('startDate');
         params.delete('endDate');
      }
    }
    
    params.delete('page');
    setFilterOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    const params = new URLSearchParams(searchParams.toString());
    if (newSort !== 'latest') params.set('sort', newSort);
    else params.delete('sort');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilter = () => {
    setAreaCode('');
    setMonth('');
    setCategory('');
    setPeriod('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className={`${styles.wrapper} ${filterType === 'notice' ? styles.wrapperNotice : ''}`}>
      <div className={styles.searchBar}>
        <div className={styles.searchLeft}>
          {filterType === 'notice' && (
            <select
              className={styles.searchTypeSelect}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
            </select>
          )}
          <div className={styles.inputWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder={filterType === 'festival' ? "축제명, 지역명으로 검색해보세요" : filterType === 'notice' ? "검색어를 입력하세요" : "게시글 제목이나 내용을 검색해보세요"} 
              className={styles.input}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {keyword && (
              <button className={styles.clearBtn} onClick={clearKeywordAndSearch} aria-label="검색어 지우기">
                <X size={12} />
              </button>
            )}
          </div>
          
          <button className={styles.searchBtn} onClick={handleSearch}>검색</button>

          {variant === 'with-filter' && (
            <div className={styles.filterRelative} ref={filterRef}>
              <button 
                type="button"
                className={styles.filterBtn} 
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <SlidersHorizontal size={14} /> 상세 필터
              </button>

              {filterOpen && (
                <div className={styles.filterPanel}>
                  {/* Community Filters */}
                  {filterType === 'community' && (
                    <>
                      <div className={styles.filterGroup}>
                        <h4>말머리</h4>
                        <div className={styles.filterTags}>
                          <span 
                            className={category === '' ? styles.active : ''} 
                            onClick={() => setCategory('')}
                          >전체</span>
                          {CATEGORY_CODES.map((cat) => (
                            <span 
                              key={cat.code} 
                              className={category === cat.code ? styles.active : ''}
                              onClick={() => setCategory(cat.code)}
                            >{cat.name}</span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.filterGroup}>
                        <h4>지역</h4>
                        <div className={styles.filterTags}>
                          <span 
                            className={areaCode === '' ? styles.active : ''} 
                            onClick={() => setAreaCode('')}
                          >전국</span>
                          {REGION_CODES.map((region) => (
                            <span 
                              key={region.code} 
                              className={areaCode === region.code ? styles.active : ''}
                              onClick={() => setAreaCode(region.code)}
                            >{region.name}</span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.filterGroup}>
                        <h4>작성 기간</h4>
                        <div className={styles.filterTags}>
                          <span 
                            className={period === '' ? styles.active : ''} 
                            onClick={() => setPeriod('')}
                          >전체 기간</span>
                          {PERIOD_CODES.map((p) => (
                            <span 
                              key={p.code} 
                              className={period === p.code ? styles.active : ''}
                              onClick={() => setPeriod(p.code)}
                            >{p.name}</span>
                          ))}
                        </div>
                        {period === 'custom' && (
                          <div className={styles.customDateInputs}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span>~</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Festival Filters */}
                  {filterType === 'festival' && (
                    <>
                      <div className={styles.filterGroup}>
                        <h4>지역</h4>
                        <div className={styles.filterTags}>
                          <span 
                            className={areaCode === '' ? styles.active : ''} 
                            onClick={() => setAreaCode('')}
                          >전국</span>
                          {REGION_CODES.map((region) => (
                            <span 
                              key={region.code} 
                              className={areaCode === region.code ? styles.active : ''}
                              onClick={() => setAreaCode(region.code)}
                            >{region.name}</span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.filterGroup}>
                        <h4>기간(월)</h4>
                        <div className={styles.filterTags}>
                          <span 
                            className={month === '' ? styles.active : ''} 
                            onClick={() => setMonth('')}
                          >모든 월</span>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <span 
                              key={m} 
                              className={month === m.toString() ? styles.active : ''}
                              onClick={() => setMonth(m.toString())}
                            >{m}월</span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className={styles.filterActions}>
                    <button type="button" className={styles.btnReset} onClick={handleResetFilter}>초기화</button>
                    <button type="button" className={styles.btnApply} onClick={handleApplyFilter}>필터 적용</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.searchRight}>
          <select 
            className={styles.sortSelect} 
            value={sort} 
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="latest">최신순</option>
            {filterType !== 'notice' && <option value="popular">인기순</option>}
            <option value="views">조회순</option>
            {filterType !== 'notice' && <option value="reviews">리뷰순</option>}
            {filterType === 'festival' && (
              <option value="distance">거리순</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}

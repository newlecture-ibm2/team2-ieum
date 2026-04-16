'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, MapPin, XCircle, ChevronDown } from 'lucide-react';
import Dropdown from '@/_component/common/Dropdown';
import styles from './SearchFilter.module.css';
import Modal from '@/_component/common/Modal/Modal';
import modalStyles from '@/_component/common/Modal/Modal.module.css';
import { REGION_CODES, CATEGORY_CODES, PERIOD_CODES, NOTICE_CATEGORY_CODES, NOTICE_CATEGORY_MAP } from '@/constants/filterOptions';

/** 콤마 구분 문자열 → 배열 */
function csvToArr(val: string): string[] {
  return val ? val.split(',').filter(Boolean) : [];
}
/** 배열 → 콤마 구분 문자열 */
function arrToCsv(arr: string[]): string {
  return arr.join(',');
}
/** 토글: 배열에 값이 있으면 제거, 없으면 추가 */
function toggleInArr(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

/** URL searchParams에서 현재 적용된 필터 태그 배열 생성 (다중 선택 지원) */
function buildActiveFilterTags(
  searchParams: URLSearchParams,
  filterType: string
): { key: string; label: string; paramKey: string; removeValue?: string }[] {
  const tags: { key: string; label: string; paramKey: string; removeValue?: string }[] = [];

  // 지역 (다중)
  const acRaw = searchParams.get('areaCode') || '';
  csvToArr(acRaw).forEach(code => {
    const region = REGION_CODES.find(r => r.code === code);
    if (region) tags.push({ key: `areaCode-${code}`, label: `지역: ${region.name}`, paramKey: 'areaCode', removeValue: code });
  });

  if (filterType === 'festival') {
    // 월 (다중)
    const mRaw = searchParams.get('month') || '';
    csvToArr(mRaw).forEach(m => {
      tags.push({ key: `month-${m}`, label: `기간: ${m}월`, paramKey: 'month', removeValue: m });
    });
  }

  if (filterType === 'community') {
    // 카테고리 (다중)
    const catRaw = searchParams.get('category') || '';
    csvToArr(catRaw).forEach(code => {
      const found = CATEGORY_CODES.find(c => c.code === code);
      if (found) tags.push({ key: `category-${code}`, label: `말머리: ${found.name}`, paramKey: 'category', removeValue: code });
    });
    // 기간 (단일)
    const p = searchParams.get('period');
    if (p) {
      const pFound = PERIOD_CODES.find(x => x.code === p);
      if (pFound) {
        let periodLabel = `기간: ${pFound.name}`;
        if (p === 'custom') {
          const sd = searchParams.get('startDate');
          const ed = searchParams.get('endDate');
          if (sd || ed) periodLabel = `기간: ${sd || '?'} ~ ${ed || '?'}`;
        }
        tags.push({ key: 'period', label: periodLabel, paramKey: 'period' });
      }
    }
  }

  if (filterType === 'notice') {
    const cat = searchParams.get('category');
    if (cat && NOTICE_CATEGORY_MAP[cat]) {
      tags.push({ key: 'category', label: `카테고리: ${NOTICE_CATEGORY_MAP[cat]}`, paramKey: 'category' });
    }
  }

  return tags;
}

interface SearchFilterProps {
  variant?: 'search-only' | 'with-filter';
  filterType?: 'festival' | 'community' | 'notice';
}

export default function SearchFilter(props: SearchFilterProps) {
  return (
    <Suspense fallback={<div style={{ height: 48 }} />}>
      <SearchFilterInner {...props} />
    </Suspense>
  );
}

function SearchFilterInner({ variant = 'with-filter', filterType = 'festival' }: SearchFilterProps) {
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
  
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // 다중 선택 필터는 콤마 구분 문자열로 관리
  const [areaCode, setAreaCode] = useState(currentAreaCode);
  const [month, setMonth] = useState(currentMonth);
  const [category, setCategory] = useState(currentCategory);
  const [period, setPeriod] = useState(currentPeriod);
  const [startDate, setStartDate] = useState(currentStart);
  const [endDate, setEndDate] = useState(currentEnd);
  const [searchType, setSearchType] = useState(currentSearchType);
  
  const [sort, setSort] = useState(currentSort);

  /** 다중 선택 토글 헬퍼 */
  const toggleAreaCode = (code: string) => setAreaCode(prev => arrToCsv(toggleInArr(csvToArr(prev), code)));
  const toggleMonth = (m: string) => setMonth(prev => arrToCsv(toggleInArr(csvToArr(prev), m)));
  const toggleCategory = (code: string) => setCategory(prev => arrToCsv(toggleInArr(csvToArr(prev), code)));

  // URL 파라미터가 변경될 때 로컬 상태를 동기화 (예: HeroBanner 탭 전환 시)
  useEffect(() => {
    setSort(searchParams.get('sort') || 'latest');
    setKeyword(searchParams.get('keyword') || '');
    setAreaCode(searchParams.get('areaCode') || '');
    setMonth(searchParams.get('month') || '');
    setCategory(searchParams.get('category') || '');
    setPeriod(searchParams.get('period') || '');
    setStartDate(searchParams.get('startDate') || '');
    setEndDate(searchParams.get('endDate') || '');
    setSearchType(searchParams.get('searchType') || 'all');
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    if (filterOpen || sortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterOpen, sortOpen]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (keyword.trim()) params.set('keyword', keyword.trim());
    else params.delete('keyword');
    
    if (filterType === 'notice' || filterType === 'community') {
      if (searchType !== 'all') params.set('searchType', searchType);
      else params.delete('searchType');
    }
    
    if (sort !== 'latest') params.set('sort', sort);
    else params.delete('sort');

    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchTypeChange = (newType: string) => {
    setSearchType(newType);
    const params = new URLSearchParams(searchParams.toString());
    
    if (keyword.trim()) params.set('keyword', keyword.trim());
    else params.delete('keyword');
    
    if (newType !== 'all') params.set('searchType', newType);
    else params.delete('searchType');
    
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
    } else if (filterType === 'notice') {
      if (category) params.set('category', category); else params.delete('category');
    }
    
    params.delete('page');
    setFilterOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  };

  // 위치 정보 안내 모달 상태
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleSortChange = (newSort: string) => {
    if (newSort === 'distance') {
      // 거리순: 위치 권한 요청
      if (!navigator.geolocation) {
        setLocationError('이 브라우저에서는 위치 정보 기능을 지원하지 않습니다.');
        setShowLocationModal(true);
        return;
      }

      setShowLocationModal(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 위치 허용 성공 → 좌표를 URL에 추가
          const { latitude, longitude } = position.coords;
          setSort('distance');
          setShowLocationModal(false);

          const params = new URLSearchParams(searchParams.toString());
          params.set('sort', 'distance');
          params.set('lat', latitude.toFixed(6));
          params.set('lng', longitude.toFixed(6));
          params.delete('page');
          router.push(`${pathname}?${params.toString()}`);
        },
        (error) => {
          // 위치 허용 거부
          let msg = '위치 정보를 가져올 수 없습니다.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = '위치 정보 사용이 거부되었습니다.\n브라우저 설정에서 위치 권한을 허용해주세요.';
          } else if (error.code === error.TIMEOUT) {
            msg = '위치 정보 요청 시간이 초과되었습니다.\n다시 시도해주세요.';
          }
          setLocationError(msg);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5분간 캐싱
        }
      );
      return;
    }

    // 거리순 외 다른 정렬
    setSort(newSort);
    const params = new URLSearchParams(searchParams.toString());
    if (newSort !== 'latest') params.set('sort', newSort);
    else params.delete('sort');
    // 거리순에서 다른 정렬로 변경 시 좌표 파라미터 제거
    params.delete('lat');
    params.delete('lng');
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

  // 적용된 필터 태그 목록 (URL 기반)
  const activeFilterTags = buildActiveFilterTags(searchParams, filterType);

  /** 개별 필터 태그 제거 (다중 선택 값에서 하나만 제거) */
  const handleRemoveFilterTag = (paramKey: string, removeValue?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (removeValue && ['areaCode', 'month', 'category'].includes(paramKey)) {
      const current = csvToArr(params.get(paramKey) || '');
      const updated = current.filter(v => v !== removeValue);
      if (updated.length > 0) params.set(paramKey, arrToCsv(updated));
      else params.delete(paramKey);
    } else {
      params.delete(paramKey);
      if (paramKey === 'period') {
        params.delete('startDate');
        params.delete('endDate');
      }
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  /** 모든 필터 한 번에 제거 */
  const handleClearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['areaCode', 'month', 'category', 'period', 'startDate', 'endDate'].forEach(k => params.delete(k));
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={`${styles.wrapper} ${filterType === 'notice' ? styles.wrapperNotice : ''}`}>
      <div className={styles.searchBar}>
        <div className={styles.searchLeft}>
          {(filterType === 'notice' || filterType === 'community') && (
            <Dropdown
              options={[
                { value: 'all', label: '전체' },
                { value: 'title', label: '제목' },
                { value: 'content', label: '내용' },
              ]}
              value={searchType}
              onChange={handleSearchTypeChange}
              ariaLabel="검색 유형"
            />
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

          {(variant === 'with-filter' || filterType === 'notice') && (
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
                        <h4>말머리 <span className={styles.multiHint}>(다중 선택 가능)</span></h4>
                        <div className={styles.filterTags}>
                          <span 
                            className={category === '' ? styles.active : ''} 
                            onClick={() => setCategory('')}
                          >전체</span>
                          {CATEGORY_CODES.map((cat) => (
                            <span 
                              key={cat.code} 
                              className={csvToArr(category).includes(cat.code) ? styles.active : ''}
                              onClick={() => toggleCategory(cat.code)}
                            >{cat.name}</span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.filterGroup}>
                        <h4>지역 <span className={styles.multiHint}>(다중 선택 가능)</span></h4>
                        <div className={styles.filterTags}>
                          <span 
                            className={areaCode === '' ? styles.active : ''} 
                            onClick={() => setAreaCode('')}
                          >전국</span>
                          {REGION_CODES.map((region) => (
                            <span 
                              key={region.code} 
                              className={csvToArr(areaCode).includes(region.code) ? styles.active : ''}
                              onClick={() => toggleAreaCode(region.code)}
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
                        <h4>지역 <span className={styles.multiHint}>(다중 선택 가능)</span></h4>
                        <div className={styles.filterTags}>
                          <span 
                            className={areaCode === '' ? styles.active : ''} 
                            onClick={() => setAreaCode('')}
                          >전국</span>
                          {REGION_CODES.map((region) => (
                            <span 
                              key={region.code} 
                              className={csvToArr(areaCode).includes(region.code) ? styles.active : ''}
                              onClick={() => toggleAreaCode(region.code)}
                            >{region.name}</span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.filterGroup}>
                        <h4>기간(월) <span className={styles.multiHint}>(다중 선택 가능)</span></h4>
                        <div className={styles.filterTags}>
                          <span 
                            className={month === '' ? styles.active : ''} 
                            onClick={() => setMonth('')}
                          >모든 월</span>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <span 
                              key={m} 
                              className={csvToArr(month).includes(m.toString()) ? styles.active : ''}
                              onClick={() => toggleMonth(m.toString())}
                            >{m}월</span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Notice Filters */}
                  {filterType === 'notice' && (
                    <div className={styles.filterGroup}>
                      <h4>카테고리</h4>
                      <div className={styles.filterTags}>
                        <span 
                          className={category === '' ? styles.active : ''} 
                          onClick={() => setCategory('')}
                        >전체</span>
                        {NOTICE_CATEGORY_CODES.map((cat) => (
                          <span 
                            key={cat.code} 
                            className={category === cat.code ? styles.active : ''}
                            onClick={() => setCategory(cat.code)}
                          >{cat.name}</span>
                        ))}
                      </div>
                    </div>
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
        
        <div className={styles.searchRight} ref={sortRef} style={{ position: 'relative' }}>
          <button 
            type="button"
            className={styles.sortSelect} 
            onClick={() => setSortOpen(!sortOpen)}
          >
            {sort === 'latest' ? '최신순' : 
             sort === 'popular' ? '인기순' : 
             sort === 'views' ? '조회순' : 
             sort === 'comments' ? '댓글순' : 
             sort === 'reviews' ? '리뷰순' : 
             sort === 'distance' ? '거리순' : '정렬'}
            <ChevronDown size={14} className={styles.chevronIcon} />
          </button>
          
          {sortOpen && (
            <ul className={styles.sortDropdownPanel}>
              <li className={sort === 'latest' ? styles.activeSort : ''} onClick={() => { handleSortChange('latest'); setSortOpen(false); }}>최신순</li>
              {filterType !== 'notice' && (
                <li className={sort === 'popular' ? styles.activeSort : ''} onClick={() => { handleSortChange('popular'); setSortOpen(false); }}>인기순</li>
              )}
              <li className={sort === 'views' ? styles.activeSort : ''} onClick={() => { handleSortChange('views'); setSortOpen(false); }}>조회순</li>
              {filterType === 'community' ? (
                <li className={sort === 'comments' ? styles.activeSort : ''} onClick={() => { handleSortChange('comments'); setSortOpen(false); }}>댓글순</li>
              ) : filterType !== 'notice' ? (
                <li className={sort === 'reviews' ? styles.activeSort : ''} onClick={() => { handleSortChange('reviews'); setSortOpen(false); }}>리뷰순</li>
              ) : null}
              {filterType === 'festival' && (
                <li className={sort === 'distance' ? styles.activeSort : ''} onClick={() => { handleSortChange('distance'); setSortOpen(false); }}>거리순</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* 위치 정보 안내 모달 — 공통 Modal 컴포넌트 사용 */}
      {showLocationModal && (
        <Modal
          title={locationError ? '위치 정보를 사용할 수 없습니다' : '위치 정보 사용 안내'}
          size="small"
          onClose={() => { setShowLocationModal(false); setLocationError(null); setSort('latest'); }}
          closeOnOverlay={!!locationError}
        >
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            {!locationError ? (
              <>
                <MapPin size={48} color="var(--color-primary-500)" style={{ marginBottom: 12 }} />
                <p className={modalStyles.confirmMessage} style={{ textAlign: 'center' }}>
                  거리순 정렬을 위해 현재 위치 정보가 필요합니다.
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
                  브라우저에서 위치 허용을 요청하면 &apos;허용&apos;을 눌러주세요.
                </p>
                <div className={styles.locationSpinner} />
              </>
            ) : (
              <>
                <XCircle size={48} color="var(--color-error, #ef4444)" style={{ marginBottom: 12 }} />
                <p className={modalStyles.confirmMessage} style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>
                  {locationError}
                </p>
              </>
            )}
          </div>
          <div className={modalStyles.footer}>
            <button
              type="button"
              className={modalStyles.btnCancel}
              onClick={() => { setShowLocationModal(false); setLocationError(null); setSort('latest'); }}
            >
              {locationError ? '닫기' : '취소'}
            </button>
          </div>
        </Modal>
      )}

      {/* ───── 적용된 필터 태그 칩 ───── */}
      {activeFilterTags.length > 0 && (
        <div className={styles.activeTagsRow}>
          {activeFilterTags.map((tag) => (
            <span key={tag.key} className={styles.activeTag}>
              {tag.label}
              <button
                type="button"
                className={styles.activeTagRemove}
                onClick={() => handleRemoveFilterTag(tag.paramKey, tag.removeValue)}
                aria-label={`${tag.label} 필터 해제`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            type="button"
            className={styles.clearAllTagsBtn}
            onClick={handleClearAllFilters}
          >
            전체 해제
          </button>
        </div>
      )}
    </div>
  );
}

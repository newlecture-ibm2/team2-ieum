'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import styles from './SearchFilter.module.css';

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

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentKeyword = searchParams.get('keyword') || '';
  const currentAreaCode = searchParams.get('areaCode') || '';
  const currentMonth = searchParams.get('month') || '';

  const [keyword, setKeyword] = useState(currentKeyword);
  const [areaCode, setAreaCode] = useState(currentAreaCode);
  const [month, setMonth] = useState(currentMonth);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (keyword.trim()) params.set('keyword', keyword.trim());
    else params.delete('keyword');
    
    if (areaCode) params.set('areaCode', areaCode);
    else params.delete('areaCode');
    
    if (month) params.set('month', month);
    else params.delete('month');

    // 검색 시 1페이지로 리셋
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearKeyword = () => {
    setKeyword('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('keyword');
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setKeyword('');
    setAreaCode('');
    setMonth('');
    const params = new URLSearchParams();
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.filterBar}>
        <div className={styles.left}>
          <div className={styles.inputWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="축제명, 지역명으로 검색해보세요" 
              className={styles.input}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {keyword && (
              <button className={styles.clearBtn} onClick={clearKeyword} aria-label="검색어 지우기">
                <X size={14} />
              </button>
            )}
          </div>
          
          <select 
            className={styles.sortSelect} 
            value={areaCode} 
            onChange={(e) => setAreaCode(e.target.value)}
          >
            <option value="">전국</option>
            {REGION_CODES.map((region) => (
              <option key={region.code} value={region.code}>{region.name}</option>
            ))}
          </select>

          <select 
            className={styles.sortSelect} 
            value={month} 
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">모든 월</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>

          <button className={styles.submitBtn} onClick={handleSearch}>검색</button>
        </div>
      </div>

      {(currentKeyword || currentAreaCode || currentMonth) && (
        <div className={styles.activeTags}>
          {currentKeyword && (
            <span className={styles.activeTag}>
              &quot;{currentKeyword}&quot;
              <button onClick={clearKeyword} className={styles.closeIconBtn}>
                <X size={12} className={styles.closeIcon} />
              </button>
            </span>
          )}
          {currentAreaCode && (
            <span className={styles.activeTag}>
              {REGION_CODES.find(r => r.code === currentAreaCode)?.name} 지역
            </span>
          )}
          {currentMonth && (
            <span className={styles.activeTag}>
              {currentMonth}월 진행
            </span>
          )}
          <button 
            className={styles.clearAllBtn} 
            onClick={clearAllFilters}
            style={{ fontSize: '12px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginLeft: 'auto' }}
          >
            초기화
          </button>
        </div>
      )}
    </div>
  );
}
